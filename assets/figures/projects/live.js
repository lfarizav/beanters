// Live behaviour of the community cellular network model, one loop per phase:
// 1 the ministry's orchestration runs down to the site (author's proposal), 2 the computers, SDR and the
// service blocks come up and the base station covers the area at 900 MHz, 3 radio and TV reach phones, homes and
// the classroom as IPTV over the cellular network, 4 a local call between two phones and a video conference
// between the classroom and a home, 5 the internet link connects and web traffic flows too, 6 the ANE reads
// the spectrum. Writes attributes on refs only, through the engine's writer (no re-render per frame).
import { P, DATA, SVG } from "./art.js?v=20261030c";
import { CHAPTERS, PARTS, COPY, PINS } from "./content.js?v=20261030c";
import { smooth, lerp, f1 } from "../agentic/engine.js";

const PERIOD = [7, 8, 8, 8, 7, 7];

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
    homes: $$('[data-hit="homes"]'), phones: $$('[data-hit="phones"]'), sena: $$('[data-hit="sena"]'), ane: $$('[data-hit="ane"]'),
  };
  const CUR = [["ministry"], ["site", "hardware"], ["phones", "homes", "sena"], ["phones", "sena", "homes"], ["hardware"], ["ane"]];
  const wall = $$("[data-wall]"), sites = $$("[data-site]");
  const leds = $$("[data-led]"), panels = $$("[data-panel]");
  const svc = Object.fromEntries($$("[data-svc]").map((el) => [el.dataset.svc, el]));
  const SVC_ORDER = ["iptv", "voice", "video", "sena", "web"];
  const SVC_ON = [[], SVC_ORDER, ["iptv", "sena"], ["voice", "video"], ["web"], []];
  const orch = $("[data-orch]"), verify = $("[data-verify]"), feed = $("[data-feed]");
  const sparkO = $('[data-spark="orch"]'), sparkV = $('[data-spark="verify"]');
  const sparkA = $('[data-spark="a"]'), sparkB = $('[data-spark="b"]'), sparkN = $('[data-spark="net"]');
  const backhaul = $("[data-backhaul]"), bridge = $("[data-bridge]"), net = $("[data-net]");
  const ripples = $$("[data-ripple]"), airs = $$("[data-air]");
  const links = Object.fromEntries($$("[data-link]").map((el) => [el.dataset.link, el]));
  const windows = $$("[data-window]").filter((el) => el.tagName === "path");
  const classScreen = $("[data-class-screen]"), hands = $$("[data-hand]");
  const aneScreen = $("[data-ane-screen]"), spectrum = $("[data-spectrum]");
  spectrum.style.strokeDasharray = "1 1";
  const { tower, whip, k, sinE, rx, sdr } = DATA;
  const goO = along(DATA.orch), goV = along(DATA.verify), goN = along(DATA.net);
  const goCall = along([rx["phone-0"], whip, sdr, whip, rx["phone-1"]]);
  const goVideo = along([rx.classroom, whip, sdr, whip, rx.house]);
  // which receivers a phase uses; the house windows carry the names of their link
  const winName = (el) => { const w = el.getAttribute("data-window"); return w.startsWith("phone") ? w : w === "0" ? "house" : `house${w}`; };
  const USED = [[], [], Object.keys(links), ["phone-0", "phone-1", "classroom", "house"], Object.keys(links), []];

  function rings(list, R, t, on, speed) {
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
    if (u < 0 || !on) { write(el, "opacity", "0"); return; }
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
      const moving = !calm;
      for (const [name, els] of Object.entries(groups)) els.forEach((el) => write(el, "data-cur", CUR[ch].includes(name) ? "" : null));

      // 1. orchestration from the ministry to the site (the author's proposal)
      write(orch, "opacity", (moving && ch === 0 ? 1 : 0).toFixed(2));
      const uo = ch === 0 && moving ? (t % 2.2) / 2.2 : -1;
      spark(sparkO, goO, uo, 1);
      wall.forEach((el, i) => write(el, "data-on", ch === 0 ? (calm || Math.sin(clock * 1.7 + i * 1.3) > -0.4 ? "" : null) : i % 3 === 0 ? "" : null));
      sites.forEach((el, i) => {
        write(el, "data-ok", ch === 0 || ch === 5 ? "" : null);
        write(el, "opacity", ch === 0 && moving ? (0.45 + 0.55 * Math.max(0, Math.sin(clock * 3 - i * 0.9))).toFixed(3) : "1");
      });

      // 2. the site: computers, SDR and the services on the core; the base station covers the area
      leds.forEach((el, i) => {
        const on = ch === 1 ? calm || t > 0.6 + i * 0.5 : ch === 0 ? uo > 0.9 || calm : true;
        write(el, "data-on", on ? "" : null);
        write(el, "opacity", on && moving && ch >= 1 ? (0.55 + 0.45 * (Math.sin(clock * 5 + i * 2) > 0 ? 1 : 0)).toFixed(2) : "1");
      });
      SVC_ORDER.forEach((name, i) => {
        const on = ch === 1 ? calm || t > 1.6 + i * 0.45 : SVC_ON[ch].includes(name);
        write(svc[name], "data-on", on ? "" : null);
      });
      const radioOn = ch >= 1 && ch <= 4;
      panels.forEach((el) => write(el, "data-on", radioOn && (ch !== 1 || calm || t > 1.2) ? "" : null));
      write(feed, "opacity", (moving && radioOn ? (ch === 1 ? smooth(1.2, 1.8, t) : 0.7) : 0).toFixed(2));
      rings(ripples, 150, calm ? 0.5 : t, radioOn ? (ch === 1 ? smooth(3.8, 4.6, t) : 0.7) * (calm ? 0.6 : 1) : 0, 30);
      rings(airs, 46, calm ? 0.5 : t, moving && (ch === 2 || ch === 4) ? 1 : 0, 20);

      // 3 and 4. the services reach the devices over the radio links
      Object.entries(links).forEach(([name, el]) => {
        const used = USED[ch].includes(name);
        const a = used ? (calm ? 0.8 : smooth(0.6, 1.2, t)) * (ch === 4 ? 0.5 : 1) : 0;
        write(el, "opacity", a.toFixed(2));
      });
      windows.forEach((el) => {
        const name = winName(el), used = USED[ch].includes(name);
        write(el, "data-on", used && (calm || t > (ch === 2 ? 1 + 0.25 * Object.keys(links).indexOf(name) : 0.8)) ? "" : null);
      });
      write(classScreen, "data-on", USED[ch].includes("classroom") && (calm || t > 1) ? "" : null);
      hands.forEach((el, i) => {
        const up = (ch === 2 || ch === 3) && i % 3 !== 1 ? (calm ? 1 : smooth(2.4 + i * 0.4, 2.7 + i * 0.4, t) * (1 - smooth(PERIOD[ch] - 0.8, PERIOD[ch] - 0.2, t))) : 0;
        write(el, "opacity", up.toFixed(2));
      });
      // a local call (phone to phone) and a video conference (classroom and home), both through the local core
      spark(sparkA, goCall, ch === 3 && moving ? (t % 3) / 3 : -1, 1);
      spark(sparkB, goVideo, ch === 3 && moving ? 1 - ((t + 1.5) % 3) / 3 : -1, 1);

      // 5. the optional internet link connects and web traffic flows to the core
      const link = ch === 4 ? (calm ? 1 : smooth(0.4, 1.2, t)) : 0;
      write(bridge, "opacity", link.toFixed(2));
      write(backhaul, "data-cur", ch === 4 || ch === 1 ? "" : null);
      write(net, "opacity", (moving && ch === 4 ? link : 0).toFixed(2));
      spark(sparkN, goN, ch === 4 && moving && t > 1.2 ? ((t - 1.2) % 1.8) / 1.8 : -1, 1);

      // 6. the ANE reads the spectrum the site sends
      write(verify, "opacity", (moving && ch === 5 ? 1 : 0).toFixed(2));
      spark(sparkV, goV, ch === 5 && moving ? (t % 2.4) / 2.4 : -1, 1);
      write(aneScreen, "data-on", ch === 5 ? "" : null);
      spectrum.style.strokeDashoffset = ch === 5 ? (calm ? "0" : (1 - smooth(0, 1.6, t % 3.2)).toFixed(3)) : "0";
      return true;
    },
    part() {},
  };
}

export default {
  svg: SVG, P, chapters: CHAPTERS, parts: PARTS, copy: COPY, live, pins: PINS, data: DATA, size: [760, 580],
  dwell: (i) => PERIOD[i] * 1000,
};
