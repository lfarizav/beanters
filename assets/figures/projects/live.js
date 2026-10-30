// Live behaviour of the community radio and TV model, one loop per phase:
// 1 the ministry's orchestration runs down to the site (author's proposal), 2 the site's computers and SDR
// come up while the internet cable stays cut, 3 the whip broadcasts and the homes light up, 4 the SENA
// classroom screen plays and learners raise their hands, 5 the ANE reads the spectrum the site sends.
// Writes attributes on refs only, through the engine's writer (no re-render per frame).
import { P, DATA, SVG } from "./art.js";
import { CHAPTERS, PARTS, COPY } from "./content.js";
import { smooth, lerp, f1 } from "../agentic/engine.js";

const PERIOD = [7, 8, 8, 8, 7];
const R_FLOOR = 150, R_AIR = 46;

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

function live(svg, st, { write }) {
  const $ = (q) => svg.querySelector(q);
  const $$ = (q) => [...svg.querySelectorAll(q)];
  const groups = {
    ministry: $$('[data-hit="ministry"]'), site: $$('[data-hit="site"]'), hardware: $$('[data-hit="hardware"]'),
    homes: $$('[data-hit="homes"]'), sena: $$('[data-hit="sena"]'), ane: $$('[data-hit="ane"]'),
  };
  const CUR = [["ministry"], ["site", "hardware"], ["homes", "site"], ["sena", "site"], ["ane"]];
  const wall = $$("[data-wall]"), sites = $$("[data-site]");
  const leds = $$("[data-led]");
  const orch = $("[data-orch]"), verify = $("[data-verify]"), feed = $("[data-feed]");
  const sparkO = $('[data-spark="orch"]'), sparkV = $('[data-spark="verify"]');
  const backhaul = $("[data-backhaul]");
  const ripples = $$("[data-ripple]"), airs = $$("[data-air]");
  const windows = $$("[data-window]").filter((el) => el.tagName === "path");
  const classScreen = $("[data-class-screen]"), hands = $$("[data-hand]");
  const aneScreen = $("[data-ane-screen]"), spectrum = $("[data-spectrum]");
  spectrum.style.strokeDasharray = "1 1";
  const goO = along(DATA.orch), goV = along(DATA.verify);
  const { tower, whip, k, sinE } = DATA;
  const winAt = (el) => { const w = el.getAttribute("data-window"); return w === "phone" ? 1.1 : w === "radio" ? 1.6 : 0.6 + 0.4 * +w; };

  function rings(list, c, R, t, on, speed) {
    const n = list.length;
    list.forEach((el, i) => {
      const u = ((t * speed) / R + i / n) % 1;
      const r = 6 + u * R;
      write(el, "rx", f1(r * k));
      write(el, "ry", f1(r * k * sinE));
      write(el, "opacity", (on * (1 - u) * smooth(0, 0.08, u) * 0.85).toFixed(3));
    });
  }
  const spark = (el, go, u, on) => {
    const p = go(Math.min(1, Math.max(0, u)));
    write(el, "cx", f1(p[0])); write(el, "cy", f1(p[1]));
    write(el, "opacity", (on * smooth(0, 0.06, u) * (1 - smooth(0.94, 1, u))).toFixed(3));
  };

  return {
    enter() {},
    frame(dt, calm) {
      const ch = st.ch;
      if (!calm && st.t >= PERIOD[ch]) st.t -= PERIOD[ch];
      const t = calm ? PERIOD[ch] * 0.6 : st.t;
      const clock = calm ? 0 : st.clock;
      for (const [name, els] of Object.entries(groups)) els.forEach((el) => write(el, "data-cur", CUR[ch].includes(name) ? "" : null));

      // 1. orchestration from the ministry to the site
      const orchOn = ch === 0 ? 1 : ch === 1 ? 0.5 : 0;
      write(orch, "opacity", (calm ? 0 : orchOn).toFixed(2));
      const uo = ch === 0 && !calm ? (t % 2.2) / 2.2 : -1;
      if (uo >= 0) spark(sparkO, goO, uo, 1); else write(sparkO, "opacity", "0");
      wall.forEach((el, i) => write(el, "data-on", ch === 0 ? (calm || Math.sin(clock * 1.7 + i * 1.3) > -0.4 ? "" : null) : i % 3 === 0 ? "" : null));
      sites.forEach((el, i) => {
        write(el, "data-ok", ch === 0 || ch === 4 ? "" : null);
        write(el, "opacity", ch === 0 && !calm ? (0.45 + 0.55 * Math.max(0, Math.sin(clock * 3 - i * 0.9))).toFixed(3) : "1");
      });

      // 2. the site: computers and SDR come up, the feeder carries the signal, the internet cable stays cut
      leds.forEach((el, i) => {
        const on = ch === 1 ? calm || t > 0.6 + i * 0.5 : ch === 0 ? uo > 0.9 || calm : true;
        write(el, "data-on", on ? "" : null);
        write(el, "opacity", on && !calm && ch >= 1 ? (0.55 + 0.45 * (Math.sin(clock * 5 + i * 2) > 0 ? 1 : 0)).toFixed(2) : "1");
      });
      write(feed, "opacity", (calm ? 0 : ch === 1 ? smooth(1.8, 2.4, t) : ch === 2 || ch === 3 ? 0.6 : 0).toFixed(2));
      write(backhaul, "data-cur", ch === 1 ? "" : null);

      // 3 and 4. broadcast: rings on the floor and round the whip
      const bc = ch === 1 ? smooth(2.4, 3.2, t) * 0.55 : ch === 2 || ch === 3 ? 1 : 0;
      rings(ripples, tower, R_FLOOR, calm ? 0.5 : t, calm ? bc * 0.6 : bc, 34);
      rings(airs, whip, R_AIR, calm ? 0.5 : t, calm ? 0 : ch === 2 || ch === 3 ? 1 : 0, 20);
      windows.forEach((el) => write(el, "data-on", ch === 2 ? (calm || t > winAt(el) ? "" : null) : ch === 3 ? "" : null));
      write(classScreen, "data-on", ch === 3 ? (calm || t > 0.8 ? "" : null) : ch === 2 ? "" : null);
      hands.forEach((el, i) => {
        const up = ch === 3 && i % 3 !== 1 ? (calm ? 1 : smooth(2 + i * 0.45, 2.3 + i * 0.45, t) * (1 - smooth(6.6, 7.2, t))) : 0;
        write(el, "opacity", up.toFixed(2));
      });

      // 5. the ANE reads the spectrum the site sends
      write(verify, "opacity", (calm ? 0 : ch === 4 ? 1 : 0).toFixed(2));
      const uv = ch === 4 && !calm ? (t % 2.4) / 2.4 : -1;
      if (uv >= 0) spark(sparkV, goV, uv, 1); else write(sparkV, "opacity", "0");
      write(aneScreen, "data-on", ch === 4 ? "" : null);
      spectrum.style.strokeDashoffset = ch === 4 ? (calm ? "0" : (1 - smooth(0, 1.6, t % 3.2)).toFixed(3)) : "0";
      return true;
    },
    part() {},
  };
}

export default {
  svg: SVG, P, chapters: CHAPTERS, parts: PARTS, copy: COPY, live,
  dwell: (i) => PERIOD[i] * 1000,
};
