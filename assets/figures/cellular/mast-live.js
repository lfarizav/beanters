// Live behaviour of the cell-site figure: generation morph, dial, beam sweep, part selection, ink write-on.
// mountMast(host, options) -> controller. No framework; writes attributes on refs only.
import { SVG, P } from "./mast-art.js";
import { translateAlong } from "./iso-kit.mjs";
import { pointerPath, beamPaths } from "./mast-model.js";
import { GENS, PARTS, UI } from "./content.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const fade = (d) => 1 - smooth(0, 0.5, Math.abs(d)); // 1 at the detent, 0 half a step away

export function mountMast(host, opts = {}) {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const lang = opts.lang || "es";
  const T = UI[lang];
  host.innerHTML = SVG;
  const svg = host.querySelector("svg");
  const stage = opts.stage || host;
  stage.setAttribute("tabindex", "0");
  stage.setAttribute("role", "slider");
  stage.setAttribute("aria-label", T.slider);
  stage.setAttribute("aria-valuemin", "0");
  stage.setAttribute("aria-valuemax", "4");
  stage.style.touchAction = "pan-y";

  const groups = [...svg.querySelectorAll("[data-gen]")].map((el) => ({ el, i: +el.dataset.gen, ghost: el.hasAttribute("data-ghost"), op: -1, dz: NaN }));
  const feeds = [...svg.querySelectorAll("[data-feed]")].map((el) => ({ el, i: +el.dataset.feed, op: -1 }));
  const pointer = svg.querySelector("[data-pointer]");
  const beam = svg.querySelector("[data-beam]");
  const lobe = beam.querySelector(".beam-lobe");
  const arc = beam.querySelector(".beam-arc");
  const dot = beam.querySelector(".beam-dot");
  const listeners = { gen: opts.onGen, part: opts.onPart, demo: opts.onDemo };

  const st = { g: opts.gen ?? 3, target: opts.gen ?? 3, sweepAt: -1, clock: 0, theta: NaN, beamOp: -1, part: null, held: !!opts.still };
  let frame = 0, last = 0, visible = false, tour = 0;

  const calm = () => still.matches || st.held;
  const visOf = (gr, g) => {
    if (gr.ghost) return fade(g - 4);
    if (gr.i === 3) return g >= 3 ? 1 : fade(g - 3);
    return fade(g - gr.i);
  };
  const feedVis = (f, g) => (f.i < 2 ? fade(g - f.i) : f.i === 2 ? (g >= 2 ? 1 : fade(g - 2)) : 0);
  const thetaAt = (t) => (t < 0 ? 0 : 0.55 * Math.exp(-t / 1.25) * Math.cos(2.4 * t));

  function draw() {
    const g = st.g;
    for (const gr of groups) {
      const op = visOf(gr, g);
      const lift = gr.i === 3 && g >= 3 ? 0 : Math.abs(g - (gr.ghost ? 4 : gr.i)) * 34;
      if (Math.abs(op - gr.op) > 0.002) { gr.op = op; gr.el.style.opacity = op.toFixed(3); gr.el.style.display = op < 0.003 ? "none" : ""; }
      if (op > 0 && Math.abs(lift - gr.dz) > 0.01) { gr.dz = lift; if (lift < 0.01) gr.el.removeAttribute("transform"); else gr.el.setAttribute("transform", translateAlong(P, [0, 0, lift])); }
    }
    for (const f of feeds) { const op = feedVis(f, g); if (Math.abs(op - f.op) > 0.002) { f.op = op; f.el.style.opacity = op.toFixed(3); f.el.style.display = op < 0.003 ? "none" : ""; } }
    pointer.setAttribute("d", pointerPath(g, P));
    const bop = smooth(2.5, 3, g);
    if (Math.abs(bop - st.beamOp) > 0.002) { st.beamOp = bop; beam.style.opacity = bop.toFixed(3); beam.style.display = bop < 0.003 ? "none" : ""; }
    if (g > 3.5) beam.setAttribute("data-dotted", ""); else beam.removeAttribute("data-dotted");
    if (bop > 0) {
      const th = calm() || st.sweepAt < 0 ? 0 : thetaAt(st.clock - st.sweepAt);
      if (!(Math.abs(th - st.theta) < 0.0004)) {
        st.theta = th;
        const b = beamPaths(P, th);
        lobe.setAttribute("d", b.lobe);
        arc.setAttribute("d", b.arc);
        dot.setAttribute("cx", b.tip[0].toFixed(1));
        dot.setAttribute("cy", b.tip[1].toFixed(1));
        dot.style.opacity = Math.abs(th) < 0.03 ? "" : "0";
      }
    }
  }

  function announce() {
    const i = Math.round(st.target);
    const G = GENS[i];
    stage.setAttribute("aria-valuenow", String(i));
    stage.setAttribute("aria-valuetext", `${G.id}, ${G.tech}: ${G[lang].idea}`);
    listeners.gen?.(i);
  }

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    st.clock += dt;
    const before = st.g;
    st.g = calm() ? st.target : st.g + (st.target - st.g) * (1 - Math.exp(-dt / 0.32));
    if (Math.abs(st.target - st.g) < 0.002) st.g = st.target;
    if (before < 2.95 && st.g >= 2.95 && st.target >= 3) st.sweepAt = st.clock;
    draw();
    const sweeping = !calm() && st.g >= 2.5 && st.sweepAt >= 0 && st.clock - st.sweepAt < 6;
    const settled = st.g === st.target && !sweeping;
    frame = visible && !settled ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };

  function set(i, { fromTour = false } = {}) {
    const next = clamp(Math.round(i), 0, 4);
    if (!fromTour) stopDemo();
    st.target = next;
    if (calm()) { st.g = next; draw(); }
    if (st.part === "beam" && next < 3) select(null);
    announce();
    if (st.part) listeners.part?.(st.part, partText(st.part));
    run();
  }
  const partText = (name) => (name ? { name: PARTS[name][lang].name, text: PARTS[name][lang].by[Math.round(st.target)] } : null);
  function select(name) {
    if (name === "beam" && Math.round(st.target) < 3) name = null;
    st.part = name === st.part ? null : name;
    svg.querySelectorAll("[data-hit]").forEach((el) => el.toggleAttribute("data-on", el.dataset.hit === st.part));
    listeners.part?.(st.part, partText(st.part));
    if (st.part === "beam" && !calm()) { st.sweepAt = st.clock; run(); }
  }

  function stopDemo() { if (tour) { clearInterval(tour); tour = 0; listeners.demo?.(false); } }
  function demo(on) {
    stopDemo();
    if (!on) return;
    listeners.demo?.(true);
    const step = () => set((Math.round(st.target) + 1) % 5, { fromTour: true });
    step();
    tour = setInterval(step, 3600);
  }
  function hold(on) { st.held = !!on; if (on) { st.g = st.target; draw(); } run(); }

  // input: keys, drag, clicks on parts
  const onKey = (e) => {
    lastInput = performance.now();
    let to = null;
    const i = Math.round(st.target);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") to = i + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = i - 1;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = 4;
    if (e.key === "Escape" && st.part) { select(null); e.stopPropagation(); return; }
    if (to === null) return;
    e.preventDefault();
    set(to);
  };
  let drag = null;
  const onDown = (e) => { lastInput = performance.now(); if (e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, from: st.target, moved: false, id: e.pointerId }; };
  const onMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) { drag.moved = true; try { stage.setPointerCapture(drag.id); } catch (err) { /* ignore */ } stopDemo(); }
    if (drag.moved) {
      const w = svg.getBoundingClientRect().width || 1;
      st.target = clamp(drag.from + (dx / w) * 6, 0, 4);
      if (calm()) { st.g = st.target; draw(); }
      run();
    }
  };
  const onUp = (e) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.moved) { set(st.target); return; }
    const hit = e.target.closest && e.target.closest("[data-hit]");
    if (hit) { stopDemo(); select(hit.dataset.hit); }
  };
  stage.addEventListener("keydown", onKey);
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", () => { drag = null; });
  const io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" });
  io.observe(stage);
  // Idle tour (opt-in): when nobody has touched the figure for a while, step to the next generation,
  // so the figure never looks frozen. It waits while hovered, focused, offscreen, hidden or still.
  let lastInput = performance.now(), hovered = false;
  const touched = () => { lastInput = performance.now(); };
  const onEnter = () => { hovered = true; touched(); };
  const onLeave = () => { hovered = false; touched(); };
  stage.addEventListener("pointerenter", onEnter);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("focusin", touched);
  const idleTimer = opts.idle ? setInterval(() => {
    if (tour || hovered || !visible || document.hidden || calm() || drag) return;
    if (!stage.closest(".stg") && document.querySelector(".stg")) return; // a fullscreen stage covers the page
    if (stage.contains(document.activeElement) && document.activeElement !== document.body) return;
    if (performance.now() - lastInput < 6000) return;
    if (st.g !== st.target) return;
    set((Math.round(st.target) + 1) % 5, { fromTour: true });
    lastInput = performance.now() - 6000 + (Math.round(st.target) === 3 ? 6500 : 3800); // linger on 5G while the beam sweeps
  }, 500) : 0;
  // A hidden tab pauses requestAnimationFrame; restart cleanly when it comes back.
  const onVis = () => { if (!document.hidden) { last = 0; if (frame) { cancelAnimationFrame(frame); frame = 0; } run(); } };
  document.addEventListener("visibilitychange", onVis);
  const onMotion = () => { if (still.matches) { st.g = st.target; draw(); } run(); };
  still.addEventListener("change", onMotion);

  // ink write-on: lines draw in from the plinth up, then the shading fills in
  function ink() {
    if (still.matches) return Promise.resolve();
    const lines = [...svg.querySelectorAll(".iso-line:not([data-dotted])")];
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
        done();
      };
      const onHide = () => { if (document.hidden) finish(); }; // never leave a half-drawn figure behind a hidden tab
      document.addEventListener("visibilitychange", onHide);
      if (document.hidden) { finish(); return; }
      // start only once a frame has painted the hidden-ink state, then time everything from that moment
      requestAnimationFrame(() => requestAnimationFrame(() => {
        svg.setAttribute("data-inking", "");
        lines.forEach((el) => { el.style.strokeDashoffset = "0"; });
        const drawn = (STAGGER + DRAW) * 1000 + 120; // the last stroke is complete before the fills arrive
        timers.push(setTimeout(() => { svg.setAttribute("data-filling", ""); svg.removeAttribute("data-ink"); }, drawn));
        timers.push(setTimeout(finish, drawn + 1000));
      }));
    });
  }

  draw();
  announce();
  return {
    set, select, demo, hold, ink,
    get gen() { return Math.round(st.target); },
    get part() { return st.part; },
    get svg() { return svg; },
    on(name, fn) { listeners[name] = fn; },
    destroy() { stopDemo(); clearInterval(idleTimer); document.removeEventListener("visibilitychange", onVis); stage.removeEventListener("pointerenter", onEnter); stage.removeEventListener("pointerleave", onLeave); stage.removeEventListener("focusin", touched); cancelAnimationFrame(frame); io.disconnect(); still.removeEventListener("change", onMotion); stage.removeEventListener("keydown", onKey); stage.removeEventListener("pointerdown", onDown); stage.removeEventListener("pointermove", onMove); stage.removeEventListener("pointerup", onUp); host.innerHTML = ""; },
  };
}
