// Live behaviour of the Telco area scene, one loop per phase:
// 1 the core's units come up and light flows down the fibre to every radio, 2 the eNB and gNB radiate and
// their phones light one by one, 3 the broadcast tower radiates and every phone lights at the same moment.
import { P, DATA, SVG } from "./art.js?v=20261030b";
import { CHAPTERS, WORDS, COPY } from "./content.js?v=20261030b";
import { smooth, grow, flag } from "../areas/kit.js?v=20261030b";

const PERIOD = [7, 8, 8];

function live(svg, st, { write }) {
  const $$ = (q) => [...svg.querySelectorAll(q)];
  const parts = { core: $$('[data-part="core"]'), enb: $$('[data-part="enb"]'), gnb: $$('[data-part="gnb"]'), bcast: $$('[data-part="bcast"],[data-part="tx"]') };
  const CUR = [["core"], ["enb", "gnb"], ["bcast"]];
  const coreLeds = $$("[data-core]"), cab = $$('[data-led="cab"]'), tx = $$('[data-led="tx"]');
  const fibres = $$("[data-fibre]");
  const enb = $$("[data-enb]"), gnb = $$("[data-gnb]"), bair = $$("[data-bair]"), ripple = $$("[data-ripple]");
  const phones = $$("[data-phone]");
  const { k, sinE } = DATA;

  return {
    enter() {},
    frame(dt, calm) {
      const ch = st.ch;
      if (!calm && st.t >= PERIOD[ch]) st.t -= PERIOD[ch];
      const t = calm ? PERIOD[ch] * 0.6 : st.t;
      const clock = calm ? 0 : st.clock;
      for (const [name, els] of Object.entries(parts)) flag(write, els, "data-cur", !calm && CUR[ch].includes(name));

      // 1. the core comes up, the fibres carry light to the radios
      coreLeds.forEach((el, i) => write(el, "data-on", calm || ch !== 0 || t > 0.4 + i * 0.35 ? (calm || Math.sin(clock * 6 + i * 2.1) > -0.5 ? "" : null) : null));
      fibres.forEach((el) => write(el, "opacity", (calm ? 0 : ch === 0 ? smooth(2.2, 2.8, t) : ch === 1 && el.dataset.fibre !== "tx" ? 0.5 : ch === 2 && el.dataset.fibre === "tx" ? 0.6 : 0).toFixed(2)));
      cab.forEach((el) => write(el, "data-on", calm || ch === 1 || (ch === 0 && t > 3) ? "" : null));
      tx.forEach((el) => write(el, "data-on", calm || ch === 2 || (ch === 0 && t > 3) ? "" : null));

      // 2. 4G and 5G: each base station radiates and its phones light in turn
      const cell = calm ? 0.8 : ch === 1 ? smooth(0.2, 0.9, t) * (1 - smooth(7.3, 8, t)) : 0;
      grow(write, enb, { R: 24, t: calm ? 0.5 : t, on: cell, speed: 13, k, sinE, r0: 5 });
      grow(write, gnb, { R: 24, t: calm ? 0.9 : t + 0.6, on: cell, speed: 13, k, sinE, r0: 5 });

      // 3. 5G Broadcast: one signal from the tower, every phone at once
      const bc = calm ? 0.8 : ch === 2 ? smooth(0.4, 1.2, t) * (1 - smooth(7.3, 8, t)) : 0;
      grow(write, bair, { R: 30, t: calm ? 0.5 : t, on: bc, speed: 14, k, sinE, r0: 5 });
      grow(write, ripple, { R: 150, t: calm ? 1.2 : t, on: bc * 0.8, speed: 40, k, sinE, r0: 8 });
      phones.forEach((el, i) => {
        let on = calm;
        if (ch === 1) on = t > 1.2 + i * 0.9 && t < 7.4;
        if (ch === 2) on = t > 2.4 && t < 7.4;
        write(el, "data-on", on ? "" : null);
      });
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
