// Live behaviour of the AI-native area scene, one loop per phase:
// 1 the local GPU server spins up, 2 a natural-language prompt types itself, a spark runs laptop -> model ->
// MCP hub -> radio site and the site starts to radiate, 3 model cubes ride the MLOps conveyor to the radio
// access network, 4 the drone takes off and the robot drives, both on the local link (no cloud).
import { P, DATA, SVG } from "./art.js?v=20261030b";
import { CHAPTERS, WORDS, COPY } from "./content.js?v=20261030b";
import { smooth, f1, along, spark, grow, pathOf, flag } from "../areas/kit.js?v=20261030b";

const PERIOD = [7, 7.5, 7, 8];
const TAU = Math.PI * 2;

function live(svg, st, { write, project }) {
  const $ = (q) => svg.querySelector(q);
  const $$ = (q) => [...svg.querySelectorAll(q)];
  const parts = { gpu: $$('[data-part="gpu"]'), lap: $$('[data-part="lap"]'), mcp: $$('[data-part="mcp"]'), belt: $$('[data-part="belt"]'), ran: $$('[data-part="ran"]'), drone: $$('[data-part="drone"]'), robot: $$('[data-part="robot"]') };
  const CUR = [["gpu"], ["lap", "mcp"], ["belt", "ran"], ["drone", "robot"]];
  const blades = $("[data-blades]"), props = $("[data-props]");
  const gpuLeds = $$("[data-gpu]"), tools = $$("[data-tool]"), eyes = $$("[data-eye]"), cab = $$('[data-led="cab"]');
  const lap = $("[data-lap]"), lines = $$("[data-line]");
  const wires = $$("[data-w]"), sAgent = $('[data-spark="agent"]');
  const air = $$("[data-air]"), cubes = $$("[data-cube]");
  const droneG = $("[data-drone]"), robotG = $("[data-robot]"), shadow = $("[data-shadow]"), links = $$("[data-link]");
  const goAgent = along(DATA.agent);
  const [ax, ay] = DATA.belt[0], beltLen = DATA.belt[1];
  const [lx, ly] = DATA.lift;
  let fan = 0, rot = 0;

  return {
    enter() {},
    frame(dt, calm) {
      const ch = st.ch;
      if (!calm && st.t >= PERIOD[ch]) st.t -= PERIOD[ch];
      const t = calm ? PERIOD[ch] * 0.6 : st.t;
      const clock = calm ? 0 : st.clock;
      for (const [name, els] of Object.entries(parts)) flag(write, els, "data-cur", !calm && CUR[ch].includes(name));

      // 1. the fans of the local model server
      if (!calm) fan += dt * (ch === 0 ? 2 + 10 * smooth(0, 2, t) : 9);
      const fb = [];
      for (const [x, y, z] of DATA.fans) for (let i = 0; i < 4; i++) {
        const a = fan + (i / 4) * TAU, b = a + 0.5;
        fb.push(pathOf([project([x + 1.4 * Math.cos(a), y, z + 1.4 * Math.sin(a)]), project([x + 5.6 * Math.cos(b), y, z + 5.6 * Math.sin(b)])]));
      }
      write(blades, "d", fb.join(""));
      gpuLeds.forEach((el, i) => write(el, "data-on", calm || ch !== 0 || t > 0.5 + i * 0.4 ? (calm || Math.sin(clock * 7 + i * 1.7) > -0.5 ? "" : null) : null));

      // 2. the agent: prompt types in, a spark runs to the model, the MCP hub and the radio site
      write(lap, "data-on", calm || ch === 1 ? "" : null);
      lines.forEach((el, i) => write(el, "opacity", (calm ? 1 : ch === 1 ? smooth(0.3 + i * 0.35, 0.5 + i * 0.35, t) : 0).toFixed(2)));
      const ua = ch === 1 && !calm ? (t - 1.8) / 2.6 : -1;
      spark(write, sAgent, goAgent, ua);
      wires.forEach((el) => write(el, "opacity", (calm ? 0 : ch === 1 ? smooth(1.6, 2, t) * (1 - smooth(6.4, 7, t)) : 0).toFixed(2)));
      tools.forEach((el, i) => write(el, "data-on", calm || (ch === 1 && ua > 0.48 + i * 0.04) || ch === 2 ? "" : null));
      const radiate = calm ? 0.8 : ch === 1 ? smooth(4.3, 4.8, t) : ch === 2 ? smooth(1.5, 2.5, t) : ch === 3 ? 0.4 : 0;
      cab.forEach((el) => write(el, "data-on", radiate > 0.1 ? "" : null));
      grow(write, air, { R: 22, t: calm ? 0.6 : t, on: radiate, speed: 12, k: DATA.k, sinE: DATA.sinE, r0: 5 });

      // 3. MLOps: three model cubes ride the conveyor through the data and training gates
      cubes.forEach((el, i) => {
        const u = calm ? [0.12, 0.5, 0.88][i] : ch === 2 ? (t / 5 + i / 3) % 1 : -1;
        if (u < 0) { write(el, "opacity", "0"); return; }
        write(el, "transform", `translate(${f1(ax * u * beltLen)} ${f1(ay * u * beltLen)})`);
        write(el, "opacity", (calm ? 1 : smooth(0, 0.06, u) * (1 - smooth(0.94, 1, u))).toFixed(2));
      });

      // 4. physical AI: the drone lifts off and hovers, the robot drives, both on the local link
      const up = calm ? 1 : ch === 3 ? smooth(0.6, 2, t) * (1 - smooth(6.6, 7.6, t)) : 0;
      const dz = -(1 - up) * 28 + (calm ? 0 : up * Math.sin(clock * 2.4) * 1.2);
      write(droneG, "transform", `translate(${f1(lx * dz)} ${f1(ly * dz)})`);
      write(shadow, "opacity", (0.06 + 0.3 * up).toFixed(2));
      if (!calm) rot += dt * (ch === 3 ? 4 + 30 * up : 0);
      const pb = [];
      for (const [x, y, z] of DATA.rotors) pb.push(pathOf([project([x + 5.4 * Math.cos(rot), y + 5.4 * Math.sin(rot), z]), project([x - 5.4 * Math.cos(rot), y - 5.4 * Math.sin(rot), z])]));
      write(props, "d", pb.join(""));
      const drive = calm ? 0 : ch === 3 ? Math.sin(Math.max(0, t - 1) * 0.9) * 9 * (1 - smooth(6.6, 7.6, t)) : 0;
      write(robotG, "transform", drive ? `translate(${f1(ax * drive)} ${f1(ay * drive)})` : null);
      eyes.forEach((el) => write(el, "data-on", calm || ch === 3 ? "" : null));
      links.forEach((el) => write(el, "opacity", (calm ? 0.8 : ch === 3 ? smooth(0.2, 0.8, t) * (1 - smooth(7, 7.8, t)) : 0).toFixed(2)));
      return true;
    },
    part() {},
  };
}

export default {
  svg: SVG, P, size: DATA.size, pins: DATA.pins, words: WORDS,
  chapters: CHAPTERS, parts: {}, copy: COPY, live, still: 3,
  dwell: (i) => (PERIOD[i] - 0.6) * 1000,
};
