// Live behaviour of the risk-management figure: the control lever, tokens sliding toward the green zone,
// gauge needles, part and chapter lighting, idle tour and the ink write-on.
// mountScene(host, options) -> controller. No framework; writes attributes on refs only.
import { SVG, AXES, ORIGIN } from "./art.js";
import { TOKENS, GAUGE_XS, GAUGE_Y, GAUGE_R, GAUGE_TOP, LEVER, CHAPTER_LIGHTS, PARTS as PART_LIST, tokenAt, gaugeAt, needleAngle, leverY, zoneOf } from "./model.js";
import { CHAPTERS, PARTS, TOKEN_NAMES, UI } from "./content.js";

const [AX, AY, AZ] = AXES;
const scr = (x, y, z) => [ORIGIN[0] + AX[0] * x + AY[0] * y + AZ[0] * z, ORIGIN[1] + AX[1] * x + AY[1] * y + AZ[1] * z];
const tr = (x, y) => `translate(${(AX[0] * x + AY[0] * y).toFixed(2)} ${(AX[1] * x + AY[1] * y).toFixed(2)})`;
const depth = (x, y) => x * 0.6428 + y * 0.766; // cos/sin of the figure's azimuth (50 degrees)
const f1 = (v) => v.toFixed(1);

export function mountScene(host, opts = {}) {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const lang = opts.lang || "es";
  const T = UI[lang];
  host.innerHTML = SVG;
  const svg = host.querySelector("svg");
  const stage = opts.stage || host;
  stage.setAttribute("tabindex", "0");
  stage.setAttribute("role", "slider");
  stage.setAttribute("aria-label", T.slider);
  stage.setAttribute("aria-valuemin", "1");
  stage.setAttribute("aria-valuemax", String(CHAPTERS.length));
  stage.style.touchAction = "pan-y";

  const tokens = [...svg.querySelectorAll("[data-token]")].sort((a, b) => a.dataset.token - b.dataset.token).map((el) => ({ el, tf: "" }));
  const layer = svg.querySelector('[data-layer="tokens"]');
  const needles = [...svg.querySelectorAll("[data-needle]")].sort((a, b) => a.dataset.needle - b.dataset.needle);
  const handle = svg.querySelector("[data-handle]");
  const listeners = { chapter: opts.onChapter, part: opts.onPart, demo: opts.onDemo, readout: opts.onReadout };

  const st = { chapter: opts.chapter ?? 0, part: null, t: 0, target: 0, held: !!opts.still, order: "", read: "", lev: NaN, sweep: 0 };
  let frame = 0, last = 0, visible = false, tour = 0, sweepTimer = 0;
  const calm = () => still.matches || st.held;

  function draw() {
    const t = st.t;
    const pos = tokens.map((o, n) => { const p = tokenAt(n, t); const tf = tr(p.x, p.y); if (tf !== o.tf) { o.tf = tf; o.el.setAttribute("transform", tf); } return p; });
    const order = pos.map((p, n) => [depth(p.x, p.y), n]).sort((a, b) => a[0] - b[0]).map((e) => e[1]);
    const key = order.join();
    if (key !== st.order) { st.order = key; for (const n of order) layer.append(tokens[n].el); }
    needles.forEach((el, g) => {
      const a = needleAngle(gaugeAt(g, t));
      const dx = Math.sin(a), dy = -Math.cos(a), x = GAUGE_XS[g];
      const A = scr(x - dx * 1.8, GAUGE_Y - dy * 1.8, GAUGE_TOP + 0.1), B = scr(x + dx * (GAUGE_R - 2.4), GAUGE_Y + dy * (GAUGE_R - 2.4), GAUGE_TOP + 0.1);
      el.setAttribute("d", `M${f1(A[0])} ${f1(A[1])}L${f1(B[0])} ${f1(B[1])}`);
    });
    const dy = leverY(t) - LEVER.y0;
    if (Math.abs(dy - st.lev) > 0.01) { st.lev = dy; if (dy < 0.01) handle.removeAttribute("transform"); else handle.setAttribute("transform", tr(0, dy)); }
    // readout from where the tokens are now
    let hi = 0, green = 0;
    for (const p of pos) { const z = zoneOf(Math.round(p.l), Math.round(p.i)); if (z === 3) hi++; if (z === 0) green++; }
    const text = T.readout(Math.round((Math.abs(st.target - t) < 0.01 ? st.target : t) * 100), hi, green);
    if (text !== st.read) { st.read = text; listeners.readout?.(text); }
  }

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    st.t = calm() ? st.target : st.t + (st.target - st.t) * (1 - Math.exp(-dt / 0.55));
    if (Math.abs(st.target - st.t) < 0.0015) st.t = st.target;
    draw();
    frame = visible && !document.hidden && st.t !== st.target ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (calm()) { st.t = st.target; draw(); return; } if (!frame && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); } };
  function lever(to) { clearTimeout(sweepTimer); st.target = Math.max(0, Math.min(1, to)); run(); }
  // on each module: controls off, then on, so the tokens visibly travel toward green
  function sweep() {
    clearTimeout(sweepTimer);
    if (calm()) { st.target = 1; run(); return; }
    st.target = 0; run();
    sweepTimer = setTimeout(() => { st.target = 1; run(); }, st.t > 0.05 ? 1300 : 500);
  }

  function announce() {
    const i = st.chapter;
    const C = CHAPTERS[i][lang];
    stage.setAttribute("aria-valuenow", String(i + 1));
    stage.setAttribute("aria-valuetext", `${CHAPTERS[i].id}, ${C.name}: ${C.idea}`);
  }
  function partText(name, lit) {
    if (!name) return null;
    const base = PARTS[name][lang];
    const list = (lit || []).map((n) => TOKEN_NAMES[lang][TOKENS[n].key]);
    return { name: base.name, text: base.text, tokens: list };
  }
  function clearLights() { svg.querySelectorAll("[data-on]").forEach((el) => el.removeAttribute("data-on")); }
  function lightChapter(i) {
    const L = CHAPTER_LIGHTS[i];
    clearLights();
    st.part = L.part;
    L.tokens.forEach((n) => tokens[n].el.setAttribute("data-on", ""));
    L.gauges.forEach((g) => { svg.querySelector(`[data-gauge="${g}"]`).setAttribute("data-on", ""); svg.querySelector(`[data-plate="${g}"]`).setAttribute("data-on", ""); });
    if (L.part === "lever" || L.part === "drawer" || L.part === "board") svg.querySelector(`[data-hit="${L.part}"]`).setAttribute("data-on", "");
    listeners.part?.(L.part, partText(L.part, L.tokens));
  }
  function lightPart(name) {
    clearLights();
    st.part = name;
    if (name) {
      if (name === "tokens") tokens.forEach((o) => o.el.setAttribute("data-on", ""));
      else if (name === "gauges") svg.querySelectorAll("[data-gauge],[data-plate]").forEach((el) => el.setAttribute("data-on", ""));
      else svg.querySelector(`[data-hit="${name}"]`).setAttribute("data-on", "");
    }
    listeners.part?.(name, partText(name, name === "tokens" ? TOKENS.map((_, n) => n) : []));
  }
  function set(i, { fromTour = false } = {}) {
    const next = Math.max(0, Math.min(CHAPTERS.length - 1, Math.round(i)));
    if (!fromTour) stopDemo();
    st.chapter = next;
    lightChapter(next);
    announce();
    listeners.chapter?.(next);
    sweep();
  }
  function select(name) {
    if (!name || !PART_LIST.includes(name) || name === st.part) { lightPart(null); return; }
    lightPart(name);
    if (name === "lever") lever(st.target > 0.5 ? 0 : 1);
  }

  function stopDemo() { if (tour) { clearInterval(tour); tour = 0; listeners.demo?.(false); } }
  function demo(on) {
    stopDemo();
    if (!on) return;
    listeners.demo?.(true);
    const next = () => set((st.chapter + 1) % CHAPTERS.length, { fromTour: true });
    next();
    tour = setInterval(next, 4600);
  }
  function hold(on) { st.held = !!on; if (on) { cancelAnimationFrame(frame); frame = 0; clearTimeout(sweepTimer); st.target = 1; st.t = 1; draw(); } else run(); }

  // input: keys, clicks on parts, dragging the lever
  let lastInput = performance.now(), hovered = false, drag = null;
  const touched = () => { lastInput = performance.now(); };
  const onKey = (e) => {
    touched();
    let to = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") to = st.chapter + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = st.chapter - 1;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = CHAPTERS.length - 1;
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); stopDemo(); lever(st.target > 0.5 ? 0 : 1); return; }
    if (e.key === "Escape" && st.part) { lightPart(null); e.stopPropagation(); return; }
    if (to === null) return;
    e.preventDefault();
    set(to);
  };
  // the lever follows the pointer along the slot's screen direction
  const slotPx = () => { const m = svg.getScreenCTM(); const s = m ? m.a : 1; return [AY[0] * s * (LEVER.y1 - LEVER.y0), AY[1] * s * (LEVER.y1 - LEVER.y0)]; };
  const onDown = (e) => {
    touched();
    if (e.button !== 0) return;
    const hit = e.target.closest && e.target.closest("[data-hit]");
    drag = { x: e.clientX, y: e.clientY, from: st.target, moved: false, id: e.pointerId, hit: hit ? hit.dataset.hit : null };
  };
  const onMove = (e) => {
    if (!drag || drag.hit !== "lever") return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; try { stage.setPointerCapture(drag.id); } catch (err) { /* ignore */ } stopDemo(); clearTimeout(sweepTimer); }
    if (drag.moved) {
      const [sx, sy] = slotPx();
      st.target = Math.max(0, Math.min(1, drag.from + (dx * sx + dy * sy) / (sx * sx + sy * sy)));
      run();
    }
  };
  const onUp = () => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.moved) return;
    if (d.hit) { stopDemo(); select(d.hit); }
  };
  const onEnter = () => { hovered = true; touched(); };
  const onLeave = () => { hovered = false; touched(); };
  stage.addEventListener("keydown", onKey);
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", () => { drag = null; });
  stage.addEventListener("pointerenter", onEnter);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("focusin", touched);
  const io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" });
  io.observe(stage);
  // Idle tour (opt-in): after a quiet spell, step to the next module. Waits while hovered, focused,
  // offscreen, hidden, still, or while a fullscreen stage covers this figure.
  const idleTimer = opts.idle ? setInterval(() => {
    if (tour || hovered || !visible || document.hidden || calm() || drag) return;
    if (!stage.closest(".stg") && document.querySelector(".stg")) return;
    if (stage.contains(document.activeElement) && document.activeElement !== document.body) return;
    if (performance.now() - lastInput < 6000) return;
    set((st.chapter + 1) % CHAPTERS.length, { fromTour: true });
    lastInput = performance.now() - 6000 + 5200;
  }, 500) : 0;
  const onVis = () => { if (!document.hidden) { last = 0; if (frame) { cancelAnimationFrame(frame); frame = 0; } run(); } };
  document.addEventListener("visibilitychange", onVis);
  const onMotion = () => { if (still.matches) { cancelAnimationFrame(frame); frame = 0; st.target = 1; st.t = 1; draw(); } else run(); };
  still.addEventListener("change", onMotion);

  // ink write-on: lines draw in, then the shading fills in
  function ink() {
    if (still.matches) return Promise.resolve();
    const lines = [...svg.querySelectorAll(".iso-line:not([data-dotted])")].filter((el) => !el.closest("[data-layer]"));
    const STAGGER = 0.9, DRAW = 1.5;
    lines.forEach((el, n) => { el.setAttribute("pathLength", "1"); el.style.transitionDelay = `${((n / lines.length) * STAGGER).toFixed(3)}s`; });
    svg.setAttribute("data-ink", "");
    return new Promise((done) => {
      let timers = [];
      const finish = () => {
        timers.forEach(clearTimeout); timers = [];
        document.removeEventListener("visibilitychange", onHide);
        lines.forEach((el) => { el.removeAttribute("pathLength"); el.style.transitionDelay = ""; el.style.strokeDashoffset = ""; });
        svg.removeAttribute("data-ink"); svg.removeAttribute("data-inking"); svg.removeAttribute("data-filling");
        sweep();
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

  if (calm()) { st.target = 1; st.t = 1; }
  draw();
  lightChapter(st.chapter);
  announce();
  if (opts.sweep !== false && !calm()) sweep();
  return {
    set, select, demo, hold, ink, lever,
    get chapter() { return st.chapter; },
    get part() { return st.part; },
    get svg() { return svg; },
    on(name, fn) { listeners[name] = fn; },
    destroy() { stopDemo(); clearTimeout(sweepTimer); clearInterval(idleTimer); document.removeEventListener("visibilitychange", onVis); cancelAnimationFrame(frame); io.disconnect(); still.removeEventListener("change", onMotion); stage.removeEventListener("keydown", onKey); stage.removeEventListener("pointerdown", onDown); stage.removeEventListener("pointermove", onMove); stage.removeEventListener("pointerup", onUp); stage.removeEventListener("pointerenter", onEnter); stage.removeEventListener("pointerleave", onLeave); stage.removeEventListener("focusin", touched); host.innerHTML = ""; },
  };
}
