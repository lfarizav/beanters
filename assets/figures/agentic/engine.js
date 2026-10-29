// Shared runtime for the course scenes built after the Cellular one (agentic, kubernetes, certprep).
// It follows the approved model (cellular/mast-live.js, cellular/scene.js, cellular/embed.js) once, so each
// scene only supplies its art, its words and a small `live(svg, st)` that moves its own parts.
//
// mountFigure(host, def, opts) -> controller { set, select, demo, hold, ink, chapter, part, svg, destroy }
// stageScene(def) -> the scene object stage.js expects ({ title, chapters, enroll, preview, mount })
// mountCard(root, def) -> in-page figure: live at 640px and wider, poster.svg below
//
// def = { svg, P, chapters: [{ id, es, en }], parts: { name: { es: { name, by[] }, en } }, copy: { es, en },
//         live(svg, st, tools) -> { enter(i, calm), frame(dt, calm) -> busy, part(name) }, dwell(i) -> ms }
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const RAD = Math.PI / 180;

export function css(href) {
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
  return new Promise((done) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; l.onload = l.onerror = done; document.head.append(l); });
}
export function langNow() {
  const h = (document.documentElement.lang || "").slice(0, 2);
  if (h === "en" || h === "es") return h;
  try { const l = localStorage.getItem("bk-lang"); if (l === "en" || l === "es") return l; } catch (e) { /* ignore */ }
  return "es";
}
export function darkNow() {
  const t = document.documentElement.getAttribute("data-theme");
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}

// The kit's isometric camera (iso-kit.mjs `iso`), so live code can place points without the kit.
export function projector(P) {
  const a = P.azimuth * RAD, e = P.elevation * RAD, k = P.scale * Math.sqrt(1.6);
  const sA = Math.sin(a), cA = Math.cos(a), sE = Math.sin(e), cE = Math.cos(e);
  return ([x, y, z]) => [P.origin[0] + (x * sA - y * cA) * k, P.origin[1] + ((x * cA + y * sA) * sE - z * cE) * k];
}
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const f1 = (v) => (Math.round(v * 10) / 10).toString();
// write an attribute only when it changes (no layout churn per frame)
export function writer() {
  const memo = new WeakMap();
  return (el, name, value) => {
    let m = memo.get(el);
    if (!m) { m = {}; memo.set(el, m); }
    if (m[name] === value) return;
    m[name] = value;
    if (value === null) el.removeAttribute(name);
    else if (name === "opacity") { el.style.opacity = value; el.style.display = +value < 0.003 ? "none" : ""; }
    else el.setAttribute(name, value);
  };
}

export function mountFigure(host, def, opts = {}) {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const lang = opts.lang || "es";
  const C = def.copy[lang];
  const n = def.chapters.length;
  host.innerHTML = def.svg;
  const svg = host.querySelector("svg");
  const stage = opts.stage || host;
  stage.setAttribute("tabindex", "0");
  stage.setAttribute("role", "slider");
  stage.setAttribute("aria-label", C.slider);
  stage.setAttribute("aria-valuemin", "0");
  stage.setAttribute("aria-valuemax", String(n - 1));
  stage.style.touchAction = "pan-y";

  const listeners = { chapter: opts.onChapter, part: opts.onPart, demo: opts.onDemo };
  const st = { ch: clamp(opts.chapter ?? 0, 0, n - 1), t: 0, clock: 0, part: null, held: !!opts.still };
  const calm = () => still.matches || st.held;
  const live = def.live(svg, st, { project: projector(def.P), write: writer() });
  let frame = 0, last = 0, visible = false, tour = 0;

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    st.clock += dt;
    st.t += dt;
    const busy = live.frame(dt, calm());
    frame = visible && busy && !calm() ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (!frame && visible && !calm()) { last = 0; frame = requestAnimationFrame(tick); } };
  const paint = () => { live.frame(0, calm()); run(); };

  function announce() {
    const ch = def.chapters[st.ch];
    stage.setAttribute("aria-valuenow", String(st.ch));
    stage.setAttribute("aria-valuetext", `${ch.id}: ${ch[lang].name}. ${ch[lang].idea}`);
    listeners.chapter?.(st.ch);
  }
  const partText = (name) => (name ? { name: def.parts[name][lang].name, text: def.parts[name][lang].by[st.ch] } : null);
  function set(i, { fromTour = false } = {}) {
    const next = clamp(Math.round(i), 0, n - 1);
    if (!fromTour) stopDemo();
    st.ch = next;
    st.t = 0;
    live.enter(next, calm());
    announce();
    if (st.part) listeners.part?.(st.part, partText(st.part));
    paint();
  }
  function select(name) {
    st.part = name && name !== st.part ? name : null;
    svg.querySelectorAll("[data-hit]").forEach((el) => el.toggleAttribute("data-on", el.dataset.hit === st.part));
    live.part?.(st.part);
    listeners.part?.(st.part, partText(st.part));
    paint();
  }
  function stopDemo() { if (tour) { clearTimeout(tour); tour = 0; listeners.demo?.(false); } }
  function demo(on) {
    stopDemo();
    if (!on) return;
    listeners.demo?.(true);
    const step = () => { set((st.ch + 1) % n, { fromTour: true }); tour = setTimeout(step, def.dwell(st.ch)); };
    step();
  }
  function hold(on) { st.held = !!on; live.enter(st.ch, calm()); paint(); }

  const onKey = (e) => {
    touched();
    let to = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") to = st.ch + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = st.ch - 1;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = n - 1;
    if (e.key === "Escape" && st.part) { select(null); e.stopPropagation(); return; }
    if (to === null) return;
    e.preventDefault();
    set(to);
  };
  const onUp = (e) => {
    touched();
    const hit = e.target.closest && e.target.closest("[data-hit]");
    if (hit) { stopDemo(); select(hit.dataset.hit); }
  };
  stage.addEventListener("keydown", onKey);
  stage.addEventListener("click", onUp);
  const io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" });
  io.observe(stage);

  // Idle tour. Inside a chapter the mechanism loops by itself (live.frame). With opts.idle (the in-page card),
  // the figure also steps to the next chapter when nobody has touched it for a while; it waits while hovered,
  // focused, offscreen, hidden, still, or covered by a fullscreen stage.
  let lastInput = performance.now(), lastStep = performance.now(), hovered = false;
  function touched() { lastInput = performance.now(); }
  const onEnter = () => { hovered = true; touched(); };
  const onLeave = () => { hovered = false; touched(); };
  stage.addEventListener("pointerenter", onEnter);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("focusin", touched);
  const idleTimer = opts.idle ? setInterval(() => {
    const now = performance.now();
    if (tour || hovered || !visible || document.hidden || calm()) return;
    if (!stage.closest(".stg") && document.querySelector(".stg")) return;
    if (stage.contains(document.activeElement) && document.activeElement !== document.body) return;
    if (now - lastInput < 6000 || now - lastStep < def.dwell(st.ch)) return;
    lastStep = now;
    set((st.ch + 1) % n, { fromTour: true });
  }, 500) : 0;
  const onVis = () => { if (!document.hidden) { last = 0; if (frame) { cancelAnimationFrame(frame); frame = 0; } run(); } };
  document.addEventListener("visibilitychange", onVis);
  const onMotion = () => { live.enter(st.ch, calm()); paint(); };
  still.addEventListener("change", onMotion);

  // Ink write-on (as cellular/mast-live.js): strokes draw in from the back, then the shading fills in.
  function ink() {
    if (still.matches) return Promise.resolve();
    const lines = [...svg.querySelectorAll(".iso-line:not([data-dotted]):not([data-ink-skip])")];
    const STAGGER = 0.9, DRAW = 1.5;
    lines.forEach((el, k) => { el.setAttribute("pathLength", "1"); el.style.transitionDelay = `${((k / lines.length) * STAGGER).toFixed(3)}s`; });
    svg.setAttribute("data-ink", "");
    return new Promise((done) => {
      let timers = [];
      const finish = () => {
        timers.forEach(clearTimeout); timers = [];
        document.removeEventListener("visibilitychange", onHide);
        lines.forEach((el) => { el.removeAttribute("pathLength"); el.style.transitionDelay = ""; el.style.strokeDashoffset = ""; });
        svg.removeAttribute("data-ink"); svg.removeAttribute("data-inking"); svg.removeAttribute("data-filling");
        done();
      };
      const onHide = () => { if (document.hidden) finish(); };
      document.addEventListener("visibilitychange", onHide);
      if (document.hidden) { finish(); return; }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        svg.setAttribute("data-inking", "");
        lines.forEach((el) => { el.style.strokeDashoffset = "0"; });
        const drawn = (STAGGER + DRAW) * 1000 + 120;
        timers.push(setTimeout(() => { svg.setAttribute("data-filling", ""); svg.removeAttribute("data-ink"); }, drawn));
        timers.push(setTimeout(finish, drawn + 1000));
      }));
    });
  }

  live.enter(st.ch, calm());
  live.frame(0, calm());
  announce();
  return {
    set, select, demo, hold, ink,
    get chapter() { return st.ch; },
    get part() { return st.part; },
    get svg() { return svg; },
    on(name, fn) { listeners[name] = fn; },
    destroy() {
      stopDemo(); clearInterval(idleTimer); cancelAnimationFrame(frame); io.disconnect();
      document.removeEventListener("visibilitychange", onVis); still.removeEventListener("change", onMotion);
      stage.removeEventListener("keydown", onKey); stage.removeEventListener("click", onUp);
      stage.removeEventListener("pointerenter", onEnter); stage.removeEventListener("pointerleave", onLeave); stage.removeEventListener("focusin", touched);
      host.innerHTML = "";
    },
  };
}

// The stage scene contract (see stage/stage.js): left page words per chapter, right page the live figure.
export function stageScene(spec) {
  const KIT_CSS = new URL("../cellular/mast.css", import.meta.url).href;
  return {
    title: spec.title,
    chapters: spec.chapters.map((c) => ({ id: c.id })),
    enroll: spec.enroll,
    preview: spec.preview,
    async mount({ left, right, lang, mobile }) {
      const [def] = await Promise.all([spec.load(), css(KIT_CSS), css(spec.css)]);
      const C = def.copy[lang];
      const sheet = left.closest(".stg-sheet");
      sheet.classList.add("iso");
      // These programs have no free preview page yet: hide the preview link rather than point it nowhere.
      if (!spec.preview) sheet.querySelector(".stg-link")?.setAttribute("hidden", "");
      right.innerHTML = `<div class="stg-fig" style="width:100%;max-width:${mobile ? 460 : spec.maxWidth || 680}px;outline-offset:4px"></div><p class="stg-sr">${C.sr}</p>`;
      const host = right.querySelector(".stg-fig");
      const listeners = {};
      let part = null;
      const names = Object.keys(def.parts);
      const partButtons = () => `<div class="stg-parts" role="group" aria-label="${C.parts}">${names.map((p) => `<button type="button" data-part="${p}" aria-pressed="${p === part}">${def.parts[p][lang].name}</button>`).join("")}</div>`;
      const ctl = mountFigure(host, def, {
        lang, chapter: 0,
        onChapter: (i) => { render(i); listeners.chapter?.(i); },
        onPart: (name, info) => { part = name; renderPart(info); },
        onDemo: (on) => listeners.demo?.(on),
      });
      const svg = host.querySelector("svg");
      svg.style.maxHeight = mobile ? "50vh" : "calc(100vh - 210px)";
      svg.style.margin = "0 auto";
      function render(i) {
        const G = def.chapters[i];
        const paint = () => {
          left.innerHTML = `
            <p class="stg-kicker">${C.chapter(i + 1, def.chapters.length)} · ${C.course}</p>
            <h2 class="stg-h">${G[lang].name}<small>${G[lang].sub}</small></h2>
            <p class="stg-idea">${G[lang].idea}</p>
            <ul class="stg-checks">${G[lang].lines.map((l) => `<li>${l}</li>`).join("")}</ul>
            ${partButtons()}
            <div class="stg-part" aria-live="polite"${part ? "" : " hidden"}>${part ? `<b>${def.parts[part][lang].name}</b>${def.parts[part][lang].by[i]}` : C.tap}</div>`;
        };
        if (!left.firstElementChild || matchMedia("(prefers-reduced-motion: reduce)").matches) { paint(); return; }
        left.setAttribute("data-swap", "");
        setTimeout(() => { paint(); requestAnimationFrame(() => left.removeAttribute("data-swap")); }, 180);
      }
      function renderPart(info) {
        const box = left.querySelector(".stg-part");
        left.querySelectorAll(".stg-parts button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.part === part)));
        if (!box) return;
        if (info && info.text) { box.hidden = false; box.innerHTML = `<b>${info.name}</b>${info.text}`; }
        else { box.hidden = true; box.textContent = C.tap; }
      }
      left.addEventListener("click", (e) => { const b = e.target.closest(".stg-parts button"); if (b) ctl.select(b.dataset.part); });
      render(0);
      return {
        get chapter() { return ctl.chapter; },
        go: (i) => ctl.set(i),
        demo: (on) => ctl.demo(on),
        hold: (on) => ctl.hold(on),
        reveal: () => ctl.ink(),
        select: (p) => ctl.select(p),
        on: (name, fn) => { listeners[name] = fn; },
        destroy: () => ctl.destroy(),
      };
    },
  };
}

// In-page card (as cellular/embed.js, reusing its embed.css): live at 640px and wider, poster below.
export function mountCard(root, spec, { idle = true } = {}) {
  const wide = matchMedia("(min-width: 640px)");
  const CELL = new URL("../cellular/", import.meta.url).href;
  css(CELL + "mast.css"); css(CELL + "embed.css"); css(spec.css);
  root.classList.add("cf", "iso");
  root.setAttribute("data-stage-ignore", "");
  let ctl = null, lang = null, ch = spec.chapter || 0, def = null;
  async function build() {
    lang = langNow();
    def = def || (await spec.load());
    const C = def.copy[lang];
    root.innerHTML = `
      <div class="cf-card">
        <div class="cf-corners" aria-hidden="true"><span data-corner="fig">${C.fig}</span><span data-corner="title">${C.title}</span><span data-corner="hint">${C.hint}</span><span data-corner="readout"></span></div>
        <div class="cf-stage" style="aspect-ratio:${spec.aspect}"></div>
        <img class="cf-poster" alt="" width="${spec.size[0]}" height="${spec.size[1]}" decoding="async">
      </div>
      <div class="cf-dial" role="group" aria-label="${C.chapters}">${def.chapters.map((g, i) => `<button type="button" data-i="${i}">${g.id}</button>`).join("")}</div>
      <p class="cf-idea" aria-live="polite"></p>`;
    const poster = root.querySelector(".cf-poster");
    poster.alt = C.poster;
    poster.src = spec.poster + (darkNow() ? "#dark" : "");
    root.querySelectorAll(".cf-dial button").forEach((b) => b.addEventListener("click", () => ctl?.set(+b.dataset.i)));
    show(ch);
  }
  function show(i) {
    ch = i;
    const G = def.chapters[i];
    root.querySelector("[data-corner=readout]").textContent = `${G.id} · ${G.id === G[lang].name ? G[lang].sub : G[lang].name}`;
    root.querySelector(".cf-idea").textContent = G[lang].idea;
    root.querySelectorAll(".cf-dial button").forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
  }
  async function setup() {
    if (ctl) { ctl.destroy(); ctl = null; }
    await build();
    const live = wide.matches;
    root.querySelector(".cf-card").toggleAttribute("data-live", live);
    if (!live) return;
    ctl = mountFigure(root.querySelector(".cf-stage"), def, { lang, chapter: ch, idle, onChapter: show });
  }
  wide.addEventListener("change", setup);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.attributeName === "lang" && langNow() !== lang) { setup(); return; }
      if (m.attributeName === "data-theme") { const p = root.querySelector(".cf-poster"); if (p) p.src = spec.poster + (darkNow() ? "#dark" : ""); }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "data-theme"] });
  setup();
  return { get controller() { return ctl; } };
}
export function autoMount(selector, spec) {
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); mountCard(e.target, spec, { idle: e.target.dataset.still === undefined }); }
  }, { rootMargin: "400px 0px" });
  targets.forEach((t) => io.observe(t));
}
