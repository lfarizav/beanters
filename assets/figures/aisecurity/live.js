// Live behaviour of the AI-security figure: packets on the belt, the scanner, the hostile packet's
// trip to quarantine, part selection, chapters, idle tour and the ink write-on.
// mountScene(host, options) -> controller. No framework; writes attributes on refs only.
import { SVG, AXES, ROD } from "./art.js";
import { SPEED, GAP, LENGTH, GATE_X, PLATE_REST, PART_OF, PARTS as PART_LIST, cleanAt, hostileAt, pusherAt, HOSTILE_DONE, smooth } from "./model.js";
import { CHAPTERS, PARTS, UI } from "./content.js";

const N = 5; // clean packets on the loop
const LOOP = N * GAP;
const tr = (o) => { const [a, b, c] = AXES; return `translate(${(a[0] * o.x + b[0] * o.y + c[0] * o.z).toFixed(2)} ${(a[1] * o.x + b[1] * o.y + c[1] * o.z).toFixed(2)})`; };
const STILL_S = [10, 32, 54, 78, 100];

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

  const packets = [...svg.querySelectorAll("[data-packet]")].map((el, i) => ({ el, i, skip: false, prev: -1, op: -1, tf: "" }));
  const hostile = { el: svg.querySelector("[data-hostile]"), t: -1, state: "idle", fade: 0, layer: "belt", tf: "", op: -1, flagged: false };
  const layerBelt = svg.querySelector('[data-layer="belt"]');
  const layerBin = svg.querySelector('[data-layer="bin"]');
  const scan = svg.querySelector("[data-scan]");
  const pusher = svg.querySelector("[data-pusher]");
  const rod = svg.querySelector("[data-rod]");
  const glow = svg.querySelector(".lamp-glow");
  const listeners = { chapter: opts.onChapter, part: opts.onPart, demo: opts.onDemo, readout: opts.onReadout };

  const st = { chapter: opts.chapter ?? 0, part: null, clock: 0, phase: 0, held: !!opts.still, want: false, inspected: 0, caught: 0, scanOp: -1, plate: NaN, caughtAt: -9, glowOp: -1, order: "" };
  let frame = 0, last = 0, visible = false, tour = 0;
  const calm = () => still.matches || st.held;

  function moveHostileTo(where) {
    if (hostile.layer === where) return;
    hostile.layer = where;
    (where === "bin" ? layerBin : layerBelt).append(hostile.el);
  }
  function setOp(o, op) { if (Math.abs(op - o.op) > 0.004) { o.op = op; o.el.style.opacity = op.toFixed(3); } }
  function setTf(o, t) { if (t !== o.tf) { o.tf = t; o.el.setAttribute("transform", t); } }
  function setPlate(front) {
    if (Math.abs(front - st.plate) < 0.01) return;
    st.plate = front;
    const dy = front - PLATE_REST;
    if (Math.abs(dy) < 0.01) pusher.removeAttribute("transform"); else pusher.setAttribute("transform", tr({ x: 0, y: dy, z: 0 }));
    const b = AXES[1];
    const from = ROD.from, to = front - ROD.plateT;
    rod.setAttribute("d", `M${(ROD.origin[0] + b[0] * from).toFixed(1)} ${(ROD.origin[1] + b[1] * from).toFixed(1)}L${(ROD.origin[0] + b[0] * to).toFixed(1)} ${(ROD.origin[1] + b[1] * to).toFixed(1)}`);
  }
  function startRun(t) {
    hostile.state = "run"; hostile.t = t; hostile.flagged = false;
    hostile.el.removeAttribute("data-flag");
    svg.removeAttribute("data-caught");
    moveHostileTo("belt");
  }
  function readout() { listeners.readout?.(T.readout(st.inspected, st.caught)); }

  // the still pose: packets spaced on the belt, one under the scanner, the hostile one in the bin
  function pose() {
    packets.forEach((p, n) => { setTf(p, tr(cleanAt(STILL_S[n]))); setOp(p, 1); });
    moveHostileTo("bin");
    setTf(hostile, tr(hostileAt(HOSTILE_DONE + 1)));
    setOp(hostile, 1);
    hostile.el.setAttribute("data-flag", "");
    hostile.state = "bin";
    svg.setAttribute("data-caught", "");
    scan.style.opacity = "0.75"; st.scanOp = 0.75;
    setPlate(PLATE_REST);
    glow.style.opacity = ""; st.glowOp = -1;
    if (st.caught === 0) st.caught = 1;
    if (st.inspected === 0) st.inspected = 12;
    readout();
  }

  function step(dt) {
    st.clock += dt;
    st.phase = (st.phase + dt * SPEED) % LOOP;
    let scanOp = 0;
    const xs = [];
    for (const p of packets) {
      const s = (st.phase + p.i * GAP) % LOOP;
      if (s < p.prev) { // wrapped: a new lap starts at the router
        p.skip = false;
        if (st.want && (hostile.state === "idle" || hostile.state === "bin")) { p.skip = true; st.want = false; if (hostile.state === "bin") { hostile.state = "fading"; hostile.fade = 0; } else startRun(0); }
      }
      const crossed = p.prev >= 0 && p.prev < GATE_X - cleanAt(0).x && s >= GATE_X - cleanAt(0).x && !p.skip;
      if (crossed) { st.inspected++; readout(); }
      p.prev = s;
      const o = cleanAt(s);
      const op = p.skip || s > LENGTH ? 0 : o.op;
      setOp(p, op);
      if (op > 0) { setTf(p, tr(o)); xs.push([o.x, p.el]); scanOp = Math.max(scanOp, 0.7 * (1 - smooth(2.5, 7, Math.abs(o.x - GATE_X)))); }
    }
    // hostile packet
    if (hostile.state === "fading") {
      hostile.fade += dt;
      setOp(hostile, 1 - smooth(0, 0.45, hostile.fade));
      if (hostile.fade >= 0.45) startRun(0);
    }
    let plate = PLATE_REST;
    if (hostile.state === "run") {
      hostile.t += dt;
      const h = hostileAt(hostile.t);
      setTf(hostile, tr(h));
      setOp(hostile, h.op);
      if (h.phase === "belt") { xs.push([h.x, hostile.el]); scanOp = Math.max(scanOp, 1 - smooth(2.5, 7, Math.abs(h.x - GATE_X))); }
      if (!hostile.flagged && h.x >= GATE_X - 1) { hostile.flagged = true; hostile.el.setAttribute("data-flag", ""); st.inspected++; readout(); }
      if (h.phase === "chute" || h.phase === "drop" || h.phase === "bin") moveHostileTo("bin");
      plate = pusherAt(hostile.t);
      if (hostile.t >= HOSTILE_DONE) { hostile.state = "bin"; st.caught++; st.caughtAt = st.clock; svg.setAttribute("data-caught", ""); readout(); }
    }
    setPlate(plate);
    if (Math.abs(scanOp - st.scanOp) > 0.01) { st.scanOp = scanOp; scan.style.opacity = scanOp.toFixed(2); }
    // the risk light swells a little when a threat lands in quarantine, then settles: it stays green
    const age = st.clock - st.caughtAt;
    const g = 0.22 + (age < 0 ? 0 : smooth(0, 0.12, age) * Math.exp(-Math.max(0, age - 0.12) / 0.7) * 0.4);
    if (Math.abs(g - st.glowOp) > 0.005) { st.glowOp = g; glow.style.opacity = g.toFixed(3); }
    // painter's order on the belt: far (small x) first
    xs.sort((a, b) => a[0] - b[0]);
    const key = xs.map((e) => e[1].dataset.packet ?? "h").join();
    if (key !== st.order) { st.order = key; for (const [, el] of xs) layerBelt.append(el); }
  }

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (calm()) { frame = 0; pose(); return; }
    step(dt);
    frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (calm()) { pose(); return; } if (!frame && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); } };

  function announce() {
    const i = st.chapter;
    const C = CHAPTERS[i][lang];
    stage.setAttribute("aria-valuenow", String(i + 1));
    stage.setAttribute("aria-valuetext", `${CHAPTERS[i].id}, ${C.name}: ${C.idea}`);
  }
  const partText = (name) => (name ? { name: PARTS[name][lang].name, text: PARTS[name][lang].text } : null);
  function light(name) {
    st.part = name;
    svg.querySelectorAll("[data-hit]").forEach((el) => el.toggleAttribute("data-on", el.dataset.hit === name));
    listeners.part?.(name, partText(name));
  }
  function set(i, { fromTour = false } = {}) {
    const next = Math.max(0, Math.min(CHAPTERS.length - 1, Math.round(i)));
    if (!fromTour) stopDemo();
    st.chapter = next;
    light(PART_OF[next]);
    announce();
    listeners.chapter?.(next);
    if (PART_OF[next] === "bin") st.want = true; // the threat-modeling chapter sends a hostile packet
    run();
  }
  // picking a part goes to the chapter it belongs to; picking the lit part again clears the light
  function select(name) {
    if (!name || !PART_LIST.includes(name)) { light(null); return; }
    if (name === st.part) { light(null); return; }
    set(PART_OF.indexOf(name));
  }

  function stopDemo() { if (tour) { clearInterval(tour); tour = 0; listeners.demo?.(false); } }
  function demo(on) {
    stopDemo();
    if (!on) return;
    listeners.demo?.(true);
    const next = () => set((st.chapter + 1) % CHAPTERS.length, { fromTour: true });
    next();
    tour = setInterval(next, 4200);
  }
  function hold(on) { st.held = !!on; if (on) { cancelAnimationFrame(frame); frame = 0; pose(); } else run(); }

  // input: keys and clicks on parts
  let lastInput = performance.now(), hovered = false;
  const touched = () => { lastInput = performance.now(); };
  const onKey = (e) => {
    touched();
    let to = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") to = st.chapter + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = st.chapter - 1;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = CHAPTERS.length - 1;
    if (e.key === "Escape" && st.part) { light(null); e.stopPropagation(); return; }
    if (to === null) return;
    e.preventDefault();
    set(to);
  };
  const onClick = (e) => { touched(); const hit = e.target.closest && e.target.closest("[data-hit]"); if (hit) { stopDemo(); select(hit.dataset.hit); } };
  const onEnter = () => { hovered = true; touched(); };
  const onLeave = () => { hovered = false; touched(); };
  stage.addEventListener("keydown", onKey);
  stage.addEventListener("click", onClick);
  stage.addEventListener("pointerenter", onEnter);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("focusin", touched);
  const io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" });
  io.observe(stage);
  // Idle tour (opt-in): after a quiet spell, step to the next module. Waits while hovered, focused,
  // offscreen, hidden, still, or while a fullscreen stage covers this figure.
  const idleTimer = opts.idle ? setInterval(() => {
    if (tour || hovered || !visible || document.hidden || calm()) return;
    if (!stage.closest(".stg") && document.querySelector(".stg")) return;
    if (stage.contains(document.activeElement) && document.activeElement !== document.body) return;
    if (performance.now() - lastInput < 6000) return;
    set((st.chapter + 1) % CHAPTERS.length, { fromTour: true });
    lastInput = performance.now() - 6000 + (PART_OF[st.chapter] === "bin" ? 9000 : 4200); // linger while the threat is caught
  }, 500) : 0;
  const onVis = () => { if (!document.hidden) { last = 0; if (frame) { cancelAnimationFrame(frame); frame = 0; } run(); } };
  document.addEventListener("visibilitychange", onVis);
  const onMotion = () => { if (still.matches) { cancelAnimationFrame(frame); frame = 0; pose(); } else run(); };
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

  setPlate(PLATE_REST);
  light(PART_OF[st.chapter]);
  announce();
  readout();
  if (calm()) pose();
  return {
    set, select, demo, hold, ink,
    get chapter() { return st.chapter; },
    get part() { return st.part; },
    get svg() { return svg; },
    on(name, fn) { listeners[name] = fn; },
    destroy() { stopDemo(); clearInterval(idleTimer); document.removeEventListener("visibilitychange", onVis); cancelAnimationFrame(frame); io.disconnect(); still.removeEventListener("change", onMotion); stage.removeEventListener("keydown", onKey); stage.removeEventListener("click", onClick); stage.removeEventListener("pointerenter", onEnter); stage.removeEventListener("pointerleave", onLeave); stage.removeEventListener("focusin", touched); host.innerHTML = ""; },
  };
}
