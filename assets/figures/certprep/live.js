// Live behaviour of the certification vault: the chapter's key turns, its drawer slides out, its three
// cards light one by one, and the timer dial on top runs. Writes attributes on refs only.
import { P, DATA, SVG } from "./art.js";
import { CHAPTERS, PARTS, COPY } from "./content.js";
import { smooth, f1 } from "../agentic/engine.js";

const PERIOD = 10;
function live(svg, st, { write }) {
  const $$ = (q) => [...svg.querySelectorAll(q)];
  const keys = [0, 1, 2].map((i) => $$(`[data-key="${i}"]`));
  const locks = $$("[data-lock]"), drawers = $$("[data-drawer]"), leds = $$("[data-led]");
  const cards = drawers.map((d) => [0, 1, 2].map((kd) => d.querySelector(`[data-card="${kd}"]`)));
  const hand = svg.querySelector("[data-hand]"), arc = svg.querySelector("[data-arc]"), timer = svg.querySelector('[data-hit="timer"]');
  const { open, dial } = DATA;
  const s = { key: [0, 0, 0], open: [0, 0, 0], sweep: 0 };
  const pt = (a, r) => [dial.c[0] + Math.sin(a) * r * dial.u[0] - Math.cos(a) * r * dial.v[0], dial.c[1] + Math.sin(a) * r * dial.u[1] - Math.cos(a) * r * dial.v[1]];
  // targets for the current chapter at loop time t: turn, slide, light the cards, close
  const target = (t) => ({ key: smooth(0.2, 1.2, t) * (1 - smooth(8.6, 9.4, t)), open: smooth(1.2, 2.4, t) * (1 - smooth(7.8, 8.8, t)), card: t < 2.8 || t > 7.8 ? -1 : Math.min(2, Math.floor((t - 2.8) / 1.7)) });
  return {
    enter() {},
    frame(dt, calm) {
      const ch = st.ch;
      if (!calm && st.t >= PERIOD) st.t -= PERIOD;
      const T = calm ? { key: 1, open: 1, card: 0 } : target(st.t);
      const f = calm ? 1 : 1 - Math.exp(-dt / 0.18);
      for (let i = 0; i < 3; i++) {
        const kt = i === ch ? T.key : 0, ot = i === ch ? T.open : 0;
        s.key[i] += (kt - s.key[i]) * f;
        s.open[i] += (ot - s.open[i]) * f;
        if (Math.abs(kt - s.key[i]) < 1e-3) s.key[i] = kt;
        if (Math.abs(ot - s.open[i]) < 1e-3) s.open[i] = ot;
        const rot = s.key[i] * 90;
        keys[i].forEach((g) => write(g, "transform", rot ? `rotate(${f1(rot)})` : null));
        write(drawers[i], "transform", s.open[i] ? `translate(${f1(open[0] * s.open[i])} ${f1(open[1] * s.open[i])})` : null);
        write(locks[i], "data-cur", i === ch ? "" : null);
        write(drawers[i], "data-cur", i === ch ? "" : null);
        write(leds[i], "data-lit", s.open[i] > 0.5 ? "" : null);
        cards[i].forEach((c, kd) => write(c, "data-lit", i === ch && kd === T.card ? "" : null));
      }
      // the timer: one turn per minute of the loop's own clock, faster while the timer card is lit
      s.sweep = calm ? 0.3 : s.sweep + dt * (T.card === 0 ? 0.25 : 0.06);
      const a = (s.sweep % 1) * Math.PI * 2;
      const p0 = pt(a + Math.PI, 1.6), p1 = pt(a, dial.r);
      write(hand, "d", `M${f1(p0[0])} ${f1(p0[1])}L${f1(p1[0])} ${f1(p1[1])}`);
      const n = Math.max(2, Math.ceil((a / (Math.PI * 2)) * 48));
      let d = `M${f1(dial.c[0])} ${f1(dial.c[1])}`;
      for (let j = 0; j <= n; j++) { const q = pt((a * j) / n, dial.r - 0.4); d += `L${f1(q[0])} ${f1(q[1])}`; }
      write(arc, "d", d + "Z");
      write(timer, "data-cur", T.card === 0 ? "" : null);
      return true;
    },
    part() {},
  };
}
export default { svg: SVG, P, chapters: CHAPTERS, parts: PARTS, copy: COPY, live, dwell: () => PERIOD * 1000 };
