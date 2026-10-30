// Live behaviour of the agentic network services model, one loop per phase:
// 1 a natural-language request types in and travels to the AI agent, 2 the agent lights the CAMARA APIs and
// deploys pods on the Sylva-aligned cloud (Flux line runs), 3 a phone leaves the geofence and the alert reaches
// the family phone, 4 a payment terminal asks the network where the phone is: approved inside, denied outside,
// 5 a reserved quality lane for a video call and a density grid over a crowd.
// Writes attributes on refs only, through the engine's writer (no re-render per frame).
import { P, DATA, SVG } from "./art.js?v=20261030h";
import { CHAPTERS, PARTS, COPY, PINS } from "./content.js?v=20261030h";
import { smooth, lerp, f1 } from "../agentic/engine.js";

const PERIOD = [7, 8, 8, 8, 7];

function along(pts) {
  const seg = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return (u) => {
    const L = u * seg[seg.length - 1];
    let i = 1;
    while (i < seg.length - 1 && seg[i] < L) i++;
    const t = (L - seg[i - 1]) / (seg[i] - seg[i - 1] || 1);
    return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)];
  };
}
const win = (t, a, b) => (t >= a && t <= b ? (t - a) / (b - a) : -1);

function live(svg, st, { write }) {
  const $ = (q) => svg.querySelector(q);
  const $$ = (q) => [...svg.querySelectorAll(q)];
  const names = ["request", "agent", "apis", "sylva", "radio", "geofence", "pay", "qod", "density"];
  const groups = Object.fromEntries(names.map((n) => [n, $$(`[data-hit="${n}"]`)]));
  const CUR = [["request", "agent"], ["agent", "apis", "sylva"], ["geofence"], ["pay"], ["qod", "density"]];
  const chat = $$("[data-chat]"), mic = $("[data-mic]"), laptop = $("[data-laptop]"), family = $("[data-family]");
  const ring = $("[data-agent-ring]"), core = $("[data-core]");
  const apis = $$("[data-api]"), pods = $$("[data-pod]"), leds = $$("[data-led]"), flux = $("[data-flux]");
  const wires = Object.fromEntries($$("[data-wire]").map((el) => [el.dataset.wire, el]));
  const sparkA = $('[data-spark="a"]'), sparkB = $('[data-spark="b"]');
  const elder = $("[data-elder]"), elderScreen = $('[data-phone="elder"]'), zoneEdge = $("[data-zone-edge]");
  const posScreen = $("[data-pos-screen]"), ok = $("[data-ok]"), no = $("[data-no]");
  const phIn = $('[data-phone="in"]'), phOut = $('[data-phone="out"]'), phQod = $('[data-phone="qod"]');
  const lane = $("[data-lane]"), laneCore = $("[data-lane-core]"), cells = $$("[data-cell]"), panels = $$("[data-panel]");
  chat.forEach((el) => { el.style.strokeDasharray = "1 1"; });
  const W = DATA.wires;
  const go = { req: along(W.req), gw: along(W.gw), cloud: along(W.cloud), alert: along(DATA.alert), check: along(DATA.check), back: along([...DATA.check].reverse()) };
  const spark = (el, path, u) => {
    if (u < 0) { write(el, "opacity", "0"); return; }
    const p = path(Math.min(1, Math.max(0, u)));
    write(el, "cx", f1(p[0])); write(el, "cy", f1(p[1]));
    write(el, "opacity", (smooth(0, 0.06, u) * (1 - smooth(0.94, 1, u))).toFixed(3));
  };

  return {
    enter() {},
    frame(dt, calm) {
      const ch = st.ch;
      if (!calm && st.t >= PERIOD[ch]) st.t -= PERIOD[ch];
      const t = calm ? PERIOD[ch] : st.t;
      const clock = calm ? 0 : st.clock;
      const moving = !calm;
      for (const [n, els] of Object.entries(groups)) els.forEach((el) => write(el, "data-cur", CUR[ch].includes(n) ? "" : null));

      // 1. the request types in, travels to the agent, the agent answers
      const typed = [ch === 0 ? smooth(0.4, 1.6, t) : 1, ch === 0 ? smooth(1.6, 2.6, t) : 1, ch === 0 ? smooth(3.8, 4.8, t) : 1];
      chat.forEach((el, i) => { el.style.strokeDashoffset = (1 - typed[i]).toFixed(3); });
      write(laptop, "data-on", "");
      write(mic, "data-on", ch === 0 && (calm || (t < 2.8 && Math.sin(clock * 9) > 0)) ? "" : null);
      write(wires.req, "opacity", (moving && ch === 0 ? smooth(2.4, 2.7, t) * (1 - smooth(3.8, 4.1, t)) : 0).toFixed(2));
      spark(sparkA, go.req, ch === 0 && moving ? win(t, 2.6, 3.6) : -1);
      const thinking = ch === 0 ? (calm || t > 3.6) : ch === 1 ? true : false;
      write(ring, "data-on", thinking && (calm || Math.sin(clock * 4) > -0.3) ? "" : null);
      write(core, "data-on", ch !== 0 || calm || t > 3.6 ? "" : null);

      // 2. the agent lights the APIs and deploys pods on the cloud; Flux reconciles from Git
      if (ch === 1 && moving) {
        const ug = win(t, 0.3, 1.0), uc = win(t, 2.2, 2.9);
        spark(sparkA, ug >= 0 ? go.gw : go.cloud, ug >= 0 ? ug : uc);
      } else if (ch !== 0) spark(sparkA, go.gw, -1);
      write(wires.gw, "opacity", (moving && ch === 1 ? smooth(0.2, 0.4, t) * (1 - smooth(1.1, 1.4, t)) : 0).toFixed(2));
      write(wires.cloud, "opacity", (moving && ch === 1 ? smooth(2.1, 2.3, t) * (1 - smooth(3.0, 3.3, t)) : 0).toFixed(2));
      const USE = [[], ["geo", "loc", "qod", "den"], ["geo"], ["loc"], ["qod", "den"]][ch];
      apis.forEach((el, i) => write(el, "data-on", USE.includes(el.dataset.api) && (ch !== 1 || calm || t > 1 + i * 0.3) ? "" : null));
      write(flux, "opacity", (moving && ch === 1 ? smooth(2.9, 3.2, t) : 0).toFixed(2));
      pods.forEach((el, i) => {
        const a = ch === 0 ? 0 : ch === 1 && moving ? smooth(3.2 + i * 0.35, 3.5 + i * 0.35, t) : 1;
        write(el, "opacity", a.toFixed(3));
      });
      leds.forEach((el, i) => {
        write(el, "data-on", ch >= 1 ? "" : null);
        write(el, "opacity", moving && ch >= 1 ? (0.5 + 0.5 * (Math.sin(clock * 4 + i * 1.7) > 0 ? 1 : 0)).toFixed(2) : "1");
      });

      // 3. the phone leaves the geofence; the network reports the exit; the alert reaches the family phone
      const u = ch === 2 ? (calm ? 1 : smooth(0.8, 3.8, t)) : 0;
      const m = DATA.elderMove;
      write(elder, "transform", u > 0 ? `translate(${f1(m[0] * u)} ${f1(m[1] * u)})` : null);
      const out = ch === 2 && u >= DATA.elderCross;
      write(zoneEdge, "data-alert", out ? "" : null);
      write(elderScreen, "data-on", ch === 2 ? "" : null);
      const tc = 0.8 + 3 * 0.5; // about when the phone crosses the edge
      spark(sparkB, go.alert, ch === 2 && moving ? win(t, tc + 0.4, tc + 2.4) : -1);
      write(wires.bs1, "opacity", (moving && ch === 2 ? smooth(tc + 0.8, tc + 1.0, t) * (1 - smooth(tc + 2.2, tc + 2.5, t)) : 0).toFixed(2));
      const alerted = ch === 2 && (calm || t > tc + 2.4);
      write(family, "data-alert", alerted && (calm || Math.sin(clock * 8) > -0.2) ? "" : null);

      // 4. the terminal asks the network where the phone is: approved inside, denied outside
      const A = ch === 3 && moving ? (t < 4 ? 0 : 1) : -1; // which attempt runs
      const tt = A === 1 ? t - 4 : t;
      if (ch === 3 && moving) {
        const f = win(tt, 0.3, 1.3), b = win(tt, 1.3, 2.3);
        spark(sparkB, f >= 0 ? go.check : go.back, f >= 0 ? f : b);
      } else if (ch !== 2) spark(sparkB, go.alert, -1);
      write(wires.bs2, "opacity", (!moving ? 0 : ch === 3 ? (tt > 0.7 && tt < 1.9 ? 1 : 0) : ch === 4 ? 0.8 : 0).toFixed(2));
      const answered = ch === 3 && (calm || tt > 2.3);
      const approve = ch === 3 && (calm || (A === 0 && answered));
      const deny = ch === 3 && moving && A === 1 && answered;
      write(ok, "data-on", approve ? "" : null);
      write(no, "data-on", deny ? "" : null);
      write(posScreen, "data-okay", approve ? "" : null);
      write(posScreen, "data-alert", deny ? "" : null);
      write(phIn, "data-okay", approve ? "" : null);
      write(phIn, "data-on", ch === 3 && A !== 1 ? "" : null);
      write(phOut, "data-alert", deny ? "" : null);
      write(phOut, "data-on", ch === 3 && A === 1 ? "" : null);

      // 5. a reserved quality lane for a video call, and a density grid over the crowd
      const q = ch === 4 ? (calm ? 1 : smooth(0.4, 1.4, t)) : 0;
      write(lane, "opacity", (q * 0.28).toFixed(3));
      write(laneCore, "opacity", (q * 0.95).toFixed(3));
      write(phQod, "data-on", q > 0.5 ? "" : null);
      panels.forEach((el) => write(el, "data-on", ch >= 2 ? "" : null));
      const d = ch === 4 ? (calm ? 1 : smooth(1.6, 3, t)) : 0;
      cells.forEach((el, i) => write(el, "opacity", (d * DATA.grid[i] * (0.5 + (moving ? 0.08 * Math.sin(clock * 1.3 + i) : 0))).toFixed(3)));
      return true;
    },
    part() {},
  };
}

export default {
  svg: SVG, P, chapters: CHAPTERS, parts: PARTS, copy: COPY, live, pins: PINS, data: DATA, size: [760, 580],
  dwell: (i) => PERIOD[i] * 1000,
};
