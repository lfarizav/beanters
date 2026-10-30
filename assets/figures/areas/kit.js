// Runtime helpers shared by the three area scenes' live.js (browser). Small on purpose.
export { smooth, lerp, f1, projector } from "../agentic/engine.js";
import { smooth, lerp, f1 } from "../agentic/engine.js";

// a point that runs along a screen polyline, u in [0, 1]
export function along(pts) {
  const seg = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return (u) => {
    const L = Math.min(1, Math.max(0, u)) * seg[seg.length - 1];
    let i = 1;
    while (i < seg.length - 1 && seg[i] < L) i++;
    const t = (L - seg[i - 1]) / (seg[i] - seg[i - 1] || 1);
    return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)];
  };
}
// horizontal rings growing out of a centre: radio waves, broadcast ripples
export function grow(write, list, { R, t, on, speed, k, sinE, r0 = 4 }) {
  const n = list.length;
  list.forEach((el, i) => {
    const u = ((t * speed) / R + i / n) % 1;
    const r = r0 + u * R;
    write(el, "rx", f1(r * k));
    write(el, "ry", f1(r * k * sinE));
    write(el, "opacity", (on * (1 - u) * smooth(0, 0.1, u) * 0.9).toFixed(3));
  });
}
// a spark that travels a path and fades in and out at the ends
export function spark(write, el, go, u, on = 1) {
  if (u < 0 || u > 1 || !on) { write(el, "opacity", "0"); return; }
  const p = go(u);
  write(el, "cx", f1(p[0])); write(el, "cy", f1(p[1]));
  write(el, "opacity", (on * smooth(0, 0.08, u) * (1 - smooth(0.92, 1, u))).toFixed(3));
}
// a path string from screen points
export const pathOf = (pts, closed = false) => pts.map((p, i) => `${i ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`).join("") + (closed ? "Z" : "");
// switch a set of elements on and off together
export const flag = (write, els, name, on) => els.forEach((el) => write(el, name, on ? "" : null));
