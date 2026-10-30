// Live behaviour of the 5G core and RAN model: chapter scripts, signalling packets, the user-plane stream,
// the moving phone and its handovers, selection, the still pose and the ink write-on.
// mountCore(host, options) -> controller. No framework; writes attributes on refs only.
import { ART, OVER, ROUTES, GEO } from "./art.js?v=20261030a";
import { CHAPTERS, NF, IF, UI } from "./content.js?v=20261030a";

const NS = "http://www.w3.org/2000/svg";
const SPEED = 230; // viewBox units per second for a signalling packet
const PARK = 70; // world x where the phone waits outside the handover chapter
const HO = [[160, 182], [246, 268]]; // world x span of the car during each handover
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// polyline helpers (screen space)
function measure(pts) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, acc, len: acc[acc.length - 1] };
}
function pointAt(m, t) {
  const d = clamp(t, 0, 1) * m.len;
  let i = 1;
  while (i < m.pts.length - 1 && m.acc[i] < d) i++;
  const a = m.pts[i - 1], b = m.pts[i], s = (m.acc[i] - m.acc[i - 1]) || 1, f = clamp((d - m.acc[i - 1]) / s, 0, 1);
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}
const rev = (pts) => [...pts].reverse();
const dOf = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
function arc(a, b, lift, n = 14) {
  const c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - lift];
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); }
  return out;
}

export function mountCore(host, opts = {}) {
  const lang = opts.lang || "es";
  const T = UI[lang];
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  host.classList.add("c5-fig", "iso", "c5");
  host.innerHTML = ART + OVER;
  const svg = host.querySelector(".iso-svg");
  const over = host.querySelector(".c5-over");
  svg.setAttribute("aria-label", T.label);
  const $ = (sel) => over.querySelector(sel);
  const carEl = $(".c5-car"), uuCar = $('[data-uu="0"]'), n1El = $(".c5-n1"), tunnel = $(".c5-tunnel");
  const packets = $(".c5-packets"), streamG = $(".c5-stream"), litG = $(".c5-lit");
  const tagUu = $('[data-float="uu"]'), tagN1 = $('[data-float="n1"]');
  const hits = [...host.querySelectorAll("[data-hit]")];
  const listeners = { chapter: opts.onChapter, step: opts.onStep, select: opts.onSelect, demo: opts.onDemo };

  // static radio links of the two parked phones
  [[1, 0], [2, 2]].forEach(([n, g]) => { $(`[data-uu="${n}"]`).setAttribute("d", dOf(arc(GEO.ANT[g], GEO.PHONE[n], 22))); });

  const st = {
    ch: clamp(opts.chapter ?? 0, 0, CHAPTERS.length - 1), script: [], at: 0, t: 0, loops: 0,
    carX: PARK, serving: 0, tunnelAt: 0, upOn: false, held: !!opts.still, pick: null, demo: false, step: -1, ctx: null, clock: 0, dt: 0,
  };
  let frame = 0, last = 0, visible = false, lastInput = performance.now();

  /* ---------- geometry ---------- */
  const phoneAt = (x) => [GEO.PHONE[0][0] + GEO.CARV[0] * x, GEO.PHONE[0][1] + GEO.CARV[1] * x];
  const ueOf = () => phoneAt(st.carX);
  const gIdx = (name) => (name === "s" ? st.ctx?.s ?? 0 : name === "t" ? st.ctx?.t ?? 1 : +name.slice(1));
  const stub = (nf) => ROUTES[`stub:${nf}`];
  function hopPath([kind, a, b]) {
    if (kind === "uu") {
      const toUe = b === "ue";
      const g = gIdx(toUe ? a : b);
      const air = arc(GEO.ANT[g], ueOf(), 30);
      const down = ROUTES[`mast:${g}`];
      return toUe ? [...down, ...air] : [...rev(air), ...rev(down)];
    }
    if (kind === "n2") return a === "amf" ? rev(ROUTES[`n2:${gIdx(b)}`]) : ROUTES[`n2:${gIdx(a)}`];
    if (kind === "n3") return a === "upf" ? ROUTES[`n3:${gIdx(b)}`] : rev(ROUTES[`n3:${gIdx(a)}`]);
    if (kind === "xn") { const i = gIdx(a), j = gIdx(b); const r = ROUTES[`xn:${Math.min(i, j)}-${Math.max(i, j)}`]; return i < j ? r : rev(r); }
    if (kind === "n4") return a === "smf" ? ROUTES.n4 : rev(ROUTES.n4);
    if (kind === "n6") return a === "upf" ? ROUTES.n6 : rev(ROUTES.n6);
    if (kind === "sbi") return [...stub(a), ...rev(stub(b))];
    return [];
  }
  const stepPath = (step) => measure(step.hops.flatMap((h) => hopPath(h)));
  function streamPath() {
    const g = st.tunnelAt;
    return measure([...rev(ROUTES.n6), ...ROUTES[`n3:${g}`], ...ROUTES[`mast:${g}`], ...arc(GEO.ANT[g], ueOf(), 30)]);
  }

  /* ---------- highlight ---------- */
  function litSet(step) {
    const on = new Set();
    if (!step) return on;
    (step.lit || []).forEach((x) => on.add(x));
    for (const [kind, a, b] of step.hops || []) {
      on.add(kind);
      for (const n of [a, b]) on.add(/^(g\d|s|t)$/.test(n) ? `g:${gIdx(n)}` : n === "ue" ? "ue:0" : n);
    }
    if (step.n1) on.add("n1");
    return on;
  }
  function paint(on) {
    for (const el of hits) {
      const key = el.dataset.hit;
      let v = on.has(key);
      if (key === "gnb" && !on.has("gnb")) v = on.has(`g:${el.dataset.g}`);
      if (key === "ue") v = on.has("ue") || on.has(`ue:${el.dataset.ue ?? 0}`);
      el.toggleAttribute("data-on", v);
    }
    // animated copies of the lit conduits' flow lines live in the overlay, so the static art never repaints per frame
    const lit = [];
    for (const el of hits) if (el.hasAttribute("data-on") && !el.closest(".c5-over")) el.querySelectorAll(".c5-flow").forEach((f) => lit.push(f.outerHTML));
    litG.innerHTML = lit.join("");
    uuCar.toggleAttribute("data-on", on.has("uu"));
    const all = on.has("uu") && !(st.script[st.at]?.step?.hops);
    over.querySelectorAll('[data-uu="1"],[data-uu="2"]').forEach((p) => p.toggleAttribute("data-on", all));
    n1El.toggleAttribute("data-on", on.has("n1"));
    tagN1.toggleAttribute("data-show", on.has("n1") || st.pick === "n1");
  }

  /* ---------- packets ---------- */
  function dot(plane, r = 3.4) {
    const g = document.createElementNS(NS, "g");
    g.innerHTML = `<circle class="c5-halo" data-plane="${plane}" r="${r + 2.4}"/><circle data-plane="${plane}" r="${r}"/>`;
    packets.append(g);
    return g;
  }
  let pk = null; // { el, m, t0, dur, back }
  function clearPackets() { packets.textContent = ""; pk = null; }
  const STREAM_N = 7;
  const streamDots = Array.from({ length: STREAM_N }, () => { const c = document.createElementNS(NS, "circle"); c.setAttribute("r", "1.9"); streamG.append(c); return c; });

  /* ---------- chapter scripts ---------- */
  function buildScript(ch) {
    const C = CHAPTERS[ch];
    const out = [];
    if (C.id === "handover") {
      out.push({ type: "reset" }, { type: "drive", to: HO[0][0], dur: 2.6 });
      for (const [h, [s, t]] of [[0, [0, 1]], [1, [1, 2]]]) {
        C.steps.forEach((step, i) => out.push({ type: "step", step, i, ctx: { s, t }, creep: HO[h] }));
        out.push({ type: "drive", to: h === 0 ? HO[1][0] : 318, dur: h === 0 ? 2.8 : 2.2 });
      }
      out.push({ type: "wait", dur: 0.8 });
    } else if (C.id === "functions") {
      C.tour.forEach((key) => out.push({ type: "pick", key, dur: 3.6 }));
    } else {
      C.steps.forEach((step, i) => out.push(step.hops ? { type: "step", step, i } : { type: "show", step, i, dur: 3.4 }));
      out.push({ type: "wait", dur: 1.4 });
    }
    return out;
  }
  function enter(n) {
    const a = st.script[n];
    st.at = n; st.t = 0; st.ctx = a.ctx || null;
    clearPackets();
    if (a.type === "reset") { st.carX = PARK; st.serving = 0; st.tunnelAt = 0; }
    if (a.type === "drive") a.from = st.carX;
    if (a.type === "step" || a.type === "show") {
      st.step = a.i;
      if (a.step.up) st.upOn = true;
      paint(litSet(a.step));
      if (a.type === "step") {
        const m = stepPath(a.step);
        pk = { m, dur: Math.max(0.9, m.len / SPEED), el: dot(a.step.hops[0][0] === "n3" || a.step.hops[0][0] === "n6" ? "up" : "cp"), back: a.step.rt ? dot("cp", 2.6) : null };
        pk.back?.setAttribute("opacity", "0");
      }
      listeners.step?.(a.i, a.ctx || null);
      announce();
    } else if (a.type === "pick") {
      paint(new Set());
      select(a.key, { fromTour: true });
    } else if (a.type !== "drive") {
      paint(new Set());
    }
    if (a.type === "drive") paint(new Set(st.upOn ? ["n3", "n6", "upf", "dn"] : []));
  }
  function durOf(a) {
    if (a.type === "step") return (pk ? pk.dur * (a.step.rt ? 2 : 1) + (a.step.rt ? 0.25 : 0) : 1) + 0.75;
    if (a.type === "reset") return 0.01;
    return a.dur;
  }
  function finish(a) {
    if (a.type === "step" && a.step.switch === "radio") st.serving = a.ctx.t;
    if (a.type === "step" && a.step.switch === "tunnel") st.tunnelAt = a.ctx.t;
  }
  function next() {
    finish(st.script[st.at]);
    let n = st.at + 1;
    if (n >= st.script.length) {
      n = 0; st.loops++;
      if (CHAPTERS[st.ch].id === "pdu") st.upOn = false;
      const idle = performance.now() - lastInput > 24000;
      if (st.demo || (opts.idle && idle && st.loops >= 2)) { setChapter((st.ch + 1) % CHAPTERS.length, { fromTour: true }); return; }
    }
    enter(n);
  }

  /* ---------- drawing ---------- */
  function draw() {
    const a = st.script[st.at];
    // car
    if (a?.type === "drive" && !calm()) st.carX = a.from + (a.to - a.from) * ease(clamp(st.t / a.dur, 0, 1));
    else if (a?.type === "step" && a.creep && !calm()) st.carX = clamp(st.carX + ((a.creep[1] - a.creep[0]) / 22) * (st.dt || 0), a.creep[0], a.creep[1]);
    const dx = st.carX;
    carEl.setAttribute("transform", `translate(${(GEO.CARV[0] * dx).toFixed(2)} ${(GEO.CARV[1] * dx).toFixed(2)})`);
    const ue = ueOf();
    const uu = arc(GEO.ANT[st.serving], ue, 30);
    uuCar.setAttribute("d", dOf(uu));
    const mid = uu[7];
    tagUu.setAttribute("transform", `translate(${mid[0].toFixed(1)} ${(mid[1] - 2).toFixed(1)})`);
    tagUu.setAttribute("data-show", "");
    const n1 = arc(ue, GEO.AMFTOP, 70, 18);
    n1El.setAttribute("d", dOf(n1));
    const top = n1[9];
    tagN1.setAttribute("transform", `translate(${top[0].toFixed(1)} ${top[1].toFixed(1)})`);
    // tunnel and user-plane stream
    const showTunnel = st.upOn;
    tunnel.toggleAttribute("data-on", showTunnel);
    if (showTunnel) tunnel.setAttribute("d", dOf(ROUTES[`n3:${st.tunnelAt}`]));
    if (st.upOn && !calm()) {
      const m = streamPath();
      const phase = (st.clock * 0.16) % 1;
      streamDots.forEach((c, i) => { const p = pointAt(m, (phase + i / STREAM_N) % 1); c.setAttribute("cx", p[0].toFixed(1)); c.setAttribute("cy", p[1].toFixed(1)); c.style.display = ""; });
    } else if (st.upOn) {
      const m = streamPath();
      streamDots.forEach((c, i) => { const p = pointAt(m, (i + 0.5) / STREAM_N); c.setAttribute("cx", p[0].toFixed(1)); c.setAttribute("cy", p[1].toFixed(1)); c.style.display = ""; });
    } else streamDots.forEach((c) => { c.style.display = "none"; });
    // signalling packet
    if (pk && a?.type === "step") {
      const m = stepPath(a.step); // the phone may move, so the radio leg is rebuilt
      const one = pk.dur;
      let f, b = null;
      if (calm()) f = 1;
      else if (st.t <= one) f = ease(st.t / one);
      else { f = 1; if (pk.back) b = ease(clamp((st.t - one - 0.25) / one, 0, 1)); }
      const p = pointAt(m, f);
      pk.el.setAttribute("transform", `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
      pk.el.setAttribute("opacity", b !== null && b > 0 ? "0.35" : "1");
      if (pk.back) {
        if (b !== null && b > 0) { const q = pointAt(m, 1 - b); pk.back.setAttribute("transform", `translate(${q[0].toFixed(1)} ${q[1].toFixed(1)})`); pk.back.setAttribute("opacity", "1"); }
        else pk.back.setAttribute("opacity", "0");
      }
    }
  }

  const calm = () => still.matches || st.held;
  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    st.dt = dt;
    st.clock += dt;
    if (!calm()) {
      st.t += dt;
      const a = st.script[st.at];
      if (a && st.t >= durOf(a)) next();
    }
    draw();
    frame = visible && !calm() ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (!frame && visible && !calm()) { last = 0; frame = requestAnimationFrame(tick); } };
  const redraw = () => { st.dt = 0; draw(); };

  /* ---------- public actions ---------- */
  function announce() {
    const C = CHAPTERS[st.ch];
    const a = st.script[st.at];
    const text = a?.step ? a.step[lang] : C[lang].idea;
    host.setAttribute("aria-description", `${C[lang].title}. ${text}`);
  }
  function setChapter(i, { fromTour = false } = {}) {
    if (!fromTour) stopDemo();
    st.ch = clamp(i, 0, CHAPTERS.length - 1);
    st.script = buildScript(st.ch); st.loops = 0; st.step = -1; st.ctx = null;
    st.upOn = CHAPTERS[st.ch].id === "handover" || CHAPTERS[st.ch].id === "overview";
    st.carX = PARK; st.serving = 0; st.tunnelAt = 0;
    if (CHAPTERS[st.ch].id !== "functions" && st.pick) select(null);
    listeners.chapter?.(st.ch);
    enter(0);
    if (calm()) showStill(firstStep());
    redraw();
    run();
  }
  const firstStep = () => Math.max(0, st.script.findIndex((a) => a.type === "step" || a.type === "show" || a.type === "pick"));
  function showStill(n) {
    // still pose: the action is shown as arrived, the phone where that step happens
    const a = st.script[n];
    if (!a) return;
    if (CHAPTERS[st.ch].id === "pdu") st.upOn = !!(a.step && a.step.up);
    enter(n);
    if (a.ctx) { st.carX = (a.creep[0] + a.creep[1]) / 2; st.serving = a.i >= 4 ? a.ctx.t : a.ctx.s; st.tunnelAt = a.i >= 8 ? a.ctx.t : a.ctx.s; }
    redraw();
  }
  function stepBy(d) {
    lastInput = performance.now();
    const list = st.script.map((a, n) => [a, n]).filter(([a]) => a.type === "step" || a.type === "show" || a.type === "pick");
    if (!list.length) return;
    let k = list.findIndex(([, n]) => n === st.at);
    k = k < 0 ? 0 : (k + d + list.length) % list.length;
    goStep(list[k][1]);
  }
  function goStep(n) {
    stopDemo();
    if (calm()) { showStill(n); return; }
    const a = st.script[n];
    if (a.ctx) { st.carX = a.creep[0]; st.serving = a.i > 4 ? a.ctx.t : a.ctx.s; st.tunnelAt = a.i > 8 ? a.ctx.t : a.ctx.s; }
    if (CHAPTERS[st.ch].id === "pdu") st.upOn = !!(a.step && a.step.up);
    enter(n); redraw(); run();
  }
  function stepIndex(i, h = 0) {
    // jump to step i of the chapter (for the handover, of handover h)
    const n = st.script.findIndex((a) => (a.type === "step" || a.type === "show") && a.i === i && (!a.ctx || a.ctx.s === h));
    if (n >= 0) goStep(n);
  }
  function select(key, { fromTour = false } = {}) {
    if (!fromTour) { lastInput = performance.now(); if (CHAPTERS[st.ch].id === "functions") stopTourFor(); }
    st.pick = key && key === st.pick && !fromTour ? null : key;
    for (const el of hits) el.toggleAttribute("data-pick", !!st.pick && el.dataset.hit === st.pick);
    uuCar.toggleAttribute("data-pick", st.pick === "uu");
    over.querySelectorAll('[data-uu="1"],[data-uu="2"]').forEach((p) => p.toggleAttribute("data-pick", st.pick === "uu"));
    n1El.toggleAttribute("data-pick", st.pick === "n1");
    tagN1.toggleAttribute("data-show", st.pick === "n1" || n1El.hasAttribute("data-on"));
    const info = st.pick ? (NF[st.pick] || IF[st.pick]) : null;
    listeners.select?.(st.pick, info);
  }
  function stopTourFor() {
    // a reader picked something in the functions chapter: hold the tour on it for a while
    st.t = -8;
  }
  function stopDemo() { if (st.demo) { st.demo = false; listeners.demo?.(false); } }
  function demo(on) { st.demo = !!on; listeners.demo?.(st.demo); if (on) { lastInput = 0; setChapter(st.ch, { fromTour: true }); } }
  function hold(on) {
    st.held = !!on;
    host.toggleAttribute("data-still", st.held);
    if (st.held) { cancelAnimationFrame(frame); frame = 0; showStill(Math.max(firstStep(), st.at)); } else run();
  }

  /* ---------- input ---------- */
  host.setAttribute("tabindex", "0");
  host.setAttribute("role", "group");
  host.setAttribute("aria-label", T.sr);
  const onKey = (e) => {
    lastInput = performance.now();
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); stepBy(1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); stepBy(-1); }
    else if (e.key === "Escape" && st.pick) { e.stopPropagation(); select(null); }
  };
  const onClick = (e) => {
    lastInput = performance.now();
    const hit = e.target.closest && e.target.closest("[data-hit]");
    if (hit) select(hit.dataset.hit);
  };
  const touched = () => { lastInput = performance.now(); };
  host.addEventListener("keydown", onKey);
  host.addEventListener("click", onClick);
  host.addEventListener("pointermove", touched);
  const io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "80px 0px" });
  io.observe(host);
  const onVis = () => { if (!document.hidden) { last = 0; if (frame) { cancelAnimationFrame(frame); frame = 0; } run(); } };
  document.addEventListener("visibilitychange", onVis);
  const onMotion = () => { if (still.matches) hold(true); else if (!st.held) run(); };
  still.addEventListener("change", onMotion);
  const small = matchMedia("(max-width: 639px)");
  const onSmall = () => host.toggleAttribute("data-small", small.matches);
  small.addEventListener("change", onSmall);
  onSmall();

  // ink write-on: lines draw in, then the shading fills in and the overlay fades up
  function ink() {
    if (still.matches) return Promise.resolve();
    const lines = [...svg.querySelectorAll(".iso-line")];
    const STAGGER = 0.9, DRAW = 1.4;
    lines.forEach((el, n) => { el.setAttribute("pathLength", "1"); el.style.transitionDelay = `${((n / lines.length) * STAGGER).toFixed(3)}s`; });
    svg.setAttribute("data-ink", ""); host.setAttribute("data-ink", "");
    return new Promise((done) => {
      let timers = [];
      const finish = () => {
        timers.forEach(clearTimeout); timers = [];
        document.removeEventListener("visibilitychange", onHide);
        lines.forEach((el) => { el.removeAttribute("pathLength"); el.style.transitionDelay = ""; el.style.strokeDashoffset = ""; });
        svg.removeAttribute("data-ink"); svg.removeAttribute("data-inking"); svg.removeAttribute("data-filling"); host.removeAttribute("data-ink");
        done();
      };
      const onHide = () => { if (document.hidden) finish(); };
      document.addEventListener("visibilitychange", onHide);
      if (document.hidden) { finish(); return; }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        svg.setAttribute("data-inking", "");
        lines.forEach((el) => { el.style.strokeDashoffset = "0"; });
        const drawn = (STAGGER + DRAW) * 1000 + 120;
        timers.push(setTimeout(() => { svg.setAttribute("data-filling", ""); svg.removeAttribute("data-ink"); host.removeAttribute("data-ink"); }, drawn));
        timers.push(setTimeout(finish, drawn + 1000));
      }));
    });
  }

  setChapter(st.ch, { fromTour: true });
  if (st.held) hold(true);
  return {
    setChapter, stepBy, stepIndex, select, demo, hold, ink,
    get chapter() { return st.ch; },
    get step() { return st.step; },
    get ctx() { return st.ctx; },
    get pick() { return st.pick; },
    on(name, fn) { listeners[name] = fn; },
    destroy() { cancelAnimationFrame(frame); io.disconnect(); document.removeEventListener("visibilitychange", onVis); still.removeEventListener("change", onMotion); small.removeEventListener("change", onSmall); host.removeEventListener("keydown", onKey); host.removeEventListener("click", onClick); host.removeEventListener("pointermove", touched); host.innerHTML = ""; },
  };
}
