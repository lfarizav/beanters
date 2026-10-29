// Live behaviour of the agentic workbench: the plan, act, observe loop, run by the gantry arm.
// Everything here only writes attributes on refs; the art comes from art.js (build.mjs).
import { P, DATA, SVG } from "./art.js";
import { CHAPTERS, PARTS, COPY } from "./content.js";
import { smooth, lerp, f1 } from "./engine.js";

// one turn of the loop, in seconds
const K = { plan: 1.2, d1: 2.0, grip: 2.3, u1: 3.0, go: 4.2, d2: 4.9, act: 5.6, u2: 6.2, back: 7.4, d3: 8.0, rel: 8.3, u3: 8.9 };
const CYCLE = 9.6;
const ACT_LAMP = 1.2, OBS_LAMP = 5.6;
const tr = (v, s = 1) => `translate(${f1(v[0] * s)} ${f1(v[1] * s)})`;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (v, s) => [v[0] * s, v[1] * s];

function live(svg, st, { write }) {
  const $ = (q) => svg.querySelector(q);
  const $$ = (q) => [...svg.querySelectorAll(q)];
  const car = $("[data-car]"), lift = $("[data-lift]"), cable = $("[data-cable]");
  const fingers = $$("[data-finger]");
  const tools = $$("[data-tool]"), cradles = $$("[data-cradle]");
  const lamps = $$("[data-lamp]"), eye = $("[data-eye]");
  const ring = $("[data-pulse-ring]"), flow = $("[data-wire-flow]"), spark = $("[data-spark]");
  const rows = $$("[data-row]"), agents = $$("[data-agent]");
  const agentLamps = agents.map((a) => a.querySelector("[data-agent-lamp]"));
  const { slots, pad, gUp, gDown, x1, z1, wire, cableA, cableB } = DATA;
  rows.forEach((r) => { const p = r.querySelector("path"); p.setAttribute("pathLength", "1"); p.style.strokeDasharray = "1 1"; });

  // wire as a polyline with cumulative lengths, for the spark
  const seg = [0];
  for (let i = 1; i < wire.length; i++) seg.push(seg[i - 1] + Math.hypot(wire[i][0] - wire[i - 1][0], wire[i][1] - wire[i - 1][1]));
  const along = (u) => {
    const L = u * seg[seg.length - 1];
    let i = 1;
    while (i < seg.length - 1 && seg[i] < L) i++;
    const t = (L - seg[i - 1]) / (seg[i] - seg[i - 1] || 1);
    return [lerp(wire[i - 1][0], wire[i][0], t), lerp(wire[i - 1][1], wire[i][1], t)];
  };

  const s = { x: slots[0], g: gUp, grip: 0, from: { x: slots[0], g: gUp }, home: tools.map(() => [0, 0]), fly: tools.map(() => null), written: 0, agents: 0, cycle: -1 };
  const step = (t, a, b, v0, v1) => lerp(v0, v1, smooth(a, b, t));

  function pose(t, ch) {
    const sx = slots[ch], px = pad[0];
    const first = s.cycle === 0;
    const x0 = first ? s.from.x : sx, g0 = first ? s.from.g : gUp;
    let x = step(t, 0, K.plan, x0, sx);
    if (t > K.u1) x = step(t, K.u1, K.go, sx, px);
    if (t > K.act) x = step(t, K.u2, K.back, px, sx);
    let g = step(t, 0, K.plan, g0, gUp);
    if (t > K.plan) g = step(t, K.plan, K.d1, gUp, gDown);
    if (t > K.grip) g = step(t, K.grip, K.u1, gDown, gUp);
    if (t > K.go) g = step(t, K.go, K.d2, gUp, gDown);
    if (t > K.act) g = step(t, K.act, K.u2, gDown, gUp);
    if (t > K.back) g = step(t, K.back, K.d3, gUp, gDown);
    if (t > K.rel) g = step(t, K.rel, K.u3, gDown, gUp);
    const grip = t < K.d1 ? 0 : t < K.rel ? smooth(K.d1, K.grip, t) : 1 - smooth(K.rel, K.rel + 0.3, t);
    const held = t >= K.grip && t < K.rel;
    return { x, g, grip, held };
  }
  function still(ch) { return { x: pad[0], g: gDown, grip: 1, held: true }; }

  function apply(p, ch, t, calm) {
    write(car, "transform", tr(mul(x1, p.x)));
    write(lift, "transform", tr(add(mul(x1, p.x), mul(z1, p.g))));
    fingers.forEach((f) => { const side = +f.dataset.finger; write(f, "transform", tr(mul(x1, -side * 0.9 * p.grip))); });
    const off = add(mul(x1, p.x), mul(z1, p.g));
    // cable from the anchor on the beam to the sleeve, arching up
    const B = add(cableB, mul(x1, p.x));
    const mx = (cableA[0] + B[0]) / 2, my = Math.min(cableA[1], B[1]) - 8 - Math.abs(B[0] - cableA[0]) * 0.06;
    write(cable, "d", `M${f1(cableA[0])} ${f1(cableA[1])}Q${f1(mx)} ${f1(my)} ${f1(B[0])} ${f1(B[1])}`);
    tools.forEach((el, i) => {
      let v = [0, 0];
      if (i === ch && p.held) v = add(mul(x1, p.x - slots[i]), mul(z1, p.g - gDown));
      else if (s.fly[i]) {
        const f = s.fly[i], u = calm ? 1 : smooth(0, 0.7, st.t - f.at);
        v = [lerp(f.v[0], 0, u), lerp(f.v[1], 0, u) - Math.sin(Math.PI * u) * 10];
        if (u >= 1) s.fly[i] = null;
      }
      s.home[i] = v;
      write(el, "transform", v[0] || v[1] ? tr(v) : null);
      write(el, "data-cur", i === ch ? "" : null);
      write(cradles[i], "data-cur", i === ch ? "" : null);
    });
    void off;
    const phase = calm ? 1 : t < ACT_LAMP ? 0 : t < OBS_LAMP ? 1 : 2;
    lamps.forEach((l, i) => write(l, "data-lit", i === phase ? "" : null));
    const act = calm ? 1 : smooth(K.d2, K.d2 + 0.25, t) * (1 - smooth(K.act - 0.2, K.act + 0.2, t));
    write(ring, "opacity", act.toFixed(3));
    write(eye, "data-lit", !calm && t > K.act && t < K.back ? "" : null);
    const fl = calm ? 0 : smooth(K.act, K.act + 0.2, t) * (1 - smooth(6.5, 6.8, t));
    write(flow, "opacity", fl.toFixed(3));
    const u = smooth(K.act + 0.1, 6.5, t);
    const sp = along(u);
    write(spark, "cx", f1(sp[0])); write(spark, "cy", f1(sp[1]));
    write(spark, "opacity", calm ? "0" : (smooth(K.act, K.act + 0.15, t) * (1 - smooth(6.45, 6.7, t))).toFixed(3));
  }

  function rowsAt(n, writing) {
    rows.forEach((r, i) => {
      const on = i < n || (writing !== null && i === n);
      write(r, "opacity", on ? "1" : "0");
      const path = r.querySelector("path");
      const off = i < n ? 0 : i === n && writing !== null ? 1 - writing : 1;
      path.style.strokeDashoffset = off.toFixed(3);
    });
  }

  return {
    enter(ch, calm) {
      const p = calm ? still(ch) : pose(Math.min(st.t, CYCLE), ch);
      // whatever the arm holds flies home; the arm starts the new loop from where it is
      tools.forEach((el, i) => { if (s.home[i][0] || s.home[i][1]) s.fly[i] = { v: s.home[i], at: st.t }; });
      s.from = { x: s.x, g: s.g };
      s.cycle = 0;
      s.lastCycle = -1;
      st.t = 0;
      if (calm) { s.fly = tools.map(() => null); s.x = p.x; s.g = p.g; }
    },
    frame(dt, calm) {
      const ch = st.ch;
      const target = ch === 4 ? 1 : 0;
      s.agents = calm ? target : s.agents + (target - s.agents) * (1 - Math.exp(-dt / 0.25));
      agents.forEach((a, i) => {
        write(a, "opacity", (calm ? target : smooth(i * 0.3, 0.7 + i * 0.3, s.agents)).toFixed(3));
        write(agentLamps[i], "opacity", calm ? "1" : (0.35 + 0.65 * Math.max(0, Math.sin(st.clock * 2.4 - i * 1.6))).toFixed(3));
      });
      if (calm) {
        const p = still(ch);
        s.x = p.x; s.g = p.g;
        apply(p, ch, 0, true);
        rowsAt(3, null);
        return false;
      }
      if (st.t >= CYCLE) { st.t -= CYCLE; s.cycle++; }
      const t = st.t;
      const p = pose(t, ch);
      s.x = p.x; s.g = p.g;
      apply(p, ch, t, false);
      // the ledger: a row writes after each observation; a full page starts over
      const R = DATA.rows;
      const writing = t >= 6.5 && t < 7.1 && s.lastCycle !== s.cycle;
      if (t >= 7.1 && s.lastCycle !== s.cycle) { s.written++; s.lastCycle = s.cycle; }
      let full = s.written % R;
      if (full === 0 && s.written) full = R;
      if (writing) rowsAt(s.written % R, smooth(6.5, 7.1, t));
      else rowsAt(full, null);
      return true;
    },
    part() {},
  };
}

export default {
  svg: SVG, P, chapters: CHAPTERS, parts: PARTS, copy: COPY, live,
  dwell: () => CYCLE * 1000,
};
