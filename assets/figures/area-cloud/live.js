// Live behaviour of the Cloud-native area scene, one loop per phase:
// 1 a commit lands in Git next to the Helm chart, 2 Flux runs the reconcile loop and the helm wheel turns,
// 3 the chart's pods (5G core functions) drop onto the front deck, 4 the magnifier sweeps the pods.
// Writes attributes on refs only, through the engine's writer (no re-render per frame).
import { P, DATA, SVG } from "./art.js?v=20261030b";
import { CHAPTERS, WORDS, COPY } from "./content.js?v=20261030b";
import { smooth, lerp, f1, along, spark, pathOf, flag } from "../areas/kit.js?v=20261030b";

const PERIOD = [7, 7, 6.5, 7];
const TAU = Math.PI * 2;

function live(svg, st, { write, project }) {
  const $ = (q) => svg.querySelector(q);
  const $$ = (q) => [...svg.querySelectorAll(q)];
  const parts = { cp: $$('[data-part="cp"]'), git: $$('[data-part="git"]'), helm: $$('[data-part="helm"]') };
  const CUR = [["git", "helm"], ["cp"], [], []];
  const spokes = $("[data-spokes]"), handles = $("[data-handles]");
  const commit = $("[data-commit]");
  const flux = $("[data-flux]"), to = $$("[data-to]"), helmLine = $("[data-helm-line]");
  const sFlux = $('[data-spark="flux"]'), sHelm = $('[data-spark="helm"]');
  const cpLeds = $$("[data-cp]"), nodeLeds = $$("[data-node]");
  const pods = $$("[data-pod]"), lens = $("[data-lens]");
  const goLoop = along(DATA.loop), goHelm = along(DATA.helm), goLens = along(DATA.lens);
  const { c, u, R } = DATA.wheel;
  const wp = (r, a) => project([c[0] + u[0] * r * Math.cos(a), c[1] + u[1] * r * Math.cos(a), c[2] + r * Math.sin(a)]);
  let phi = 0;
  function wheel(angle) {
    let s = [], h = [];
    for (let i = 0; i < 7; i++) {
      const a = angle + (i / 7) * TAU;
      s.push(pathOf([wp(R * 0.24, a), wp(R * 0.86, a)]));
      h.push(pathOf([wp(R * 1.04, a), wp(R * 1.32, a)]));
    }
    write(spokes, "d", s.join("")); write(handles, "d", h.join(""));
  }
  const [lx, ly] = DATA.lift;

  return {
    enter() {},
    frame(dt, calm) {
      const ch = st.ch;
      if (!calm && st.t >= PERIOD[ch]) st.t -= PERIOD[ch];
      const t = calm ? PERIOD[ch] * 0.7 : st.t;
      const clock = calm ? 0 : st.clock;
      for (const [name, els] of Object.entries(parts)) flag(write, els, "data-cur", !calm && CUR[ch].includes(name));

      // 1. the new commit appears in Git
      write(commit, "opacity", (calm || ch > 0 ? 1 : smooth(0.6, 1.1, t)).toFixed(2));
      write(commit, "r", f1(ch === 0 && !calm ? 1.9 + 1.6 * Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - 0.6) / 0.8)) * Math.PI)) : 1.9));

      // 2. Flux: the loop flows, a spark laps it twice, the wheel turns, the control plane lamps blink
      write(flux, "opacity", (calm ? 0 : ch === 1 ? 1 : ch === 0 ? smooth(3.5, 5, t) * 0.6 : 0).toFixed(2));
      spark(write, sFlux, goLoop, ch === 1 && !calm ? ((t * 0.42) % 1) : -1);
      const spin = ch === 1 ? 1.1 : ch === 2 ? 0.45 : 0.12;
      if (!calm) phi += dt * spin;
      wheel(calm ? 0 : phi);
      cpLeds.forEach((el, i) => write(el, "data-on", calm || ((ch === 1 || ch === 2) ? Math.sin(clock * 6 + i * 2) > -0.2 : i === 0) ? "" : null));
      to.forEach((el) => write(el, "opacity", (calm ? 0 : ch === 1 ? smooth(3.6, 4.4, t) : ch === 2 ? 1 - smooth(4, 5, t) : 0).toFixed(2)));

      // 3. Helm: a spark runs from the chart to the front deck, the pods drop in one by one
      write(helmLine, "opacity", (calm ? 0 : ch === 2 ? 1 - smooth(3.4, 4.2, t) : 0).toFixed(2));
      spark(write, sHelm, goHelm, ch === 2 && !calm ? t / 1.2 : -1);
      pods.forEach((el, i) => {
        if (+el.dataset.deck === 0) return;
        const j = i - 3;
        let k = 1;
        if (!calm && ch === 2) k = smooth(1 + j * 0.55, 1.7 + j * 0.55, t);
        else if (!calm && ch < 2) k = 0;
        const dz = (1 - k) * 34;
        write(el, "transform", dz > 0.05 ? `translate(${f1(lx * dz)} ${f1(ly * dz)})` : null);
        write(el, "opacity", (calm ? 1 : ch < 2 ? 0 : Math.min(1, k * 3)).toFixed(2));
        write(el, "data-cur", !calm && ch === 2 && k > 0.02 && t < 4.6 ? "" : null);
      });

      // 4. observability: the lens sweeps over the six pods and the one under it lights
      const sweep = ch === 3 && !calm;
      write(lens, "opacity", (calm ? 1 : sweep ? smooth(0, 0.5, t) * (1 - smooth(6.4, 6.9, t)) : 0).toFixed(2));
      const ul = sweep ? smooth(0.3, 6.2, t) : 0.12;
      const p = goLens(ul);
      write(lens, "transform", `translate(${f1(p[0])} ${f1(p[1])})`);
      const under = Math.round(ul * 5);
      if (ch === 3) pods.forEach((el, i) => write(el, "data-cur", sweep && i === under ? "" : null));
      nodeLeds.forEach((el, i) => write(el, "data-on", calm || ch !== 3 || Math.sin(clock * 5 + i) > -0.6 ? "" : null));
      return true;
    },
    part() {},
  };
}

export default {
  svg: SVG, P, size: DATA.size, pins: DATA.pins, words: WORDS,
  chapters: CHAPTERS, parts: {}, copy: COPY, live, still: 2,
  dwell: (i) => (PERIOD[i] - 0.6) * 1000,
};
