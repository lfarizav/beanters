/* Living scenes: the ink drawing of each book's chapter-1 analogy, in page units.
   One source for both renderers, like hero/geometry.js: engine.js lifts these
   edges into 3D ink and fills the solids; living.js draws the same edges in SVG.
   No three.js here, so the SVG fallback never downloads it.

   Page units: u (left to right) 0..100, w (top to bottom) 0..134, h = height.
   A drawing on paper is the oblique view of the solid: a point at height h sits
   at w - h * OBL on the paper, so "lifting" moves it from there to its true 3D place. */
export const PW = 100, PH = 134, OBL = 0.55;

const D2R = Math.PI / 180;

function rot(p, c, o) {
  /* Euler order YXZ, the same as three's Euler(rx, ry, rz, "YXZ"): Rz, then Rx, then Ry. */
  let x = p[0] - c[0], y = p[1] - c[1], z = p[2] - c[2], a, s, k;
  if (o.rz) { a = o.rz * D2R; s = Math.sin(a); k = Math.cos(a); [x, y] = [x * k - y * s, x * s + y * k]; }
  if (o.rx) { a = o.rx * D2R; s = Math.sin(a); k = Math.cos(a); [y, z] = [y * k - z * s, y * s + z * k]; }
  if (o.ry) { a = o.ry * D2R; s = Math.sin(a); k = Math.cos(a); [x, z] = [x * k + z * s, -x * s + z * k]; }
  return [x + c[0], y + c[1], z + c[2]];
}

function circle(cx, cy, cz, r, n, plane) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, c = Math.cos(a) * r, s = Math.sin(a) * r;
    pts.push(plane === "xy" ? [cx + c, cy + s, cz] : [cx + c, cy, cz + s]);
  }
  return pts;
}

function polySegs(pts, out) { for (let i = 0; i < pts.length - 1; i++) out.push([pts[i], pts[i + 1]]); }

/* Edges of one solid, in drawing order (base first, then uprights, then top). */
export function solidEdges(s) {
  const out = [], y0 = s.y0 || 0, c = [s.x, y0 + (s.h || 0) / 2, s.z];
  const R = (p) => (s.rx || s.ry || s.rz ? rot(p, c, s) : p);
  if (s.t === "box") {
    const x0 = s.x - s.w / 2, x1 = s.x + s.w / 2, z0 = s.z - s.d / 2, z1 = s.z + s.d / 2, y1 = y0 + s.h;
    const b = [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]].map(R);
    const t = [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]].map(R);
    polySegs([...b, b[0]], out);
    for (let i = 0; i < 4; i++) out.push([b[i], t[i]]);
    polySegs([...t, t[0]], out);
  } else if (s.t === "cyl") {
    const r1 = s.r, r2 = s.r2 == null ? s.r : s.r2, n = s.n || 20, y1 = y0 + s.h;
    polySegs(circle(s.x, y0, s.z, r1, n).map(R), out);
    out.push([R([s.x - r1, y0, s.z]), R([s.x - r2, y1, s.z])]);
    out.push([R([s.x + r1, y0, s.z]), R([s.x + r2, y1, s.z])]);
    polySegs(circle(s.x, y1, s.z, r2, n).map(R), out);
  } else if (s.t === "dome") {
    const n = 20;
    polySegs(circle(s.x, y0, s.z, s.r, n), out);
    const arc = [];
    for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; arc.push([s.x + Math.cos(a) * s.r, y0 + Math.sin(a) * s.r, s.z]); }
    polySegs(arc, out);
    polySegs(circle(s.x, y0 + s.r * 0.62, s.z, s.r * 0.78, n), out);
  } else if (s.t === "ball") {
    const cy = y0 + s.r;
    polySegs(circle(s.x, cy, s.z, s.r, 18), out);
    polySegs(circle(s.x, cy, s.z, s.r, 18, "xy"), out);
  } else if (s.t === "roof") {
    /* Gable roof: ridge runs along w (depth). */
    const x0 = s.x - s.w / 2, x1 = s.x + s.w / 2, z0 = s.z - s.d / 2, z1 = s.z + s.d / 2, y1 = y0 + s.h;
    const f = [[x0, y0, z1], [s.x, y1, z1], [x1, y0, z1]].map(R), k = [[x0, y0, z0], [s.x, y1, z0], [x1, y0, z0]].map(R);
    polySegs([...f, f[0]], out); polySegs([...k, k[0]], out);
    for (let i = 0; i < 3; i++) out.push([f[i], k[i]]);
  }
  return out;
}

/* Decorations: ink-only strokes that ride on the solids (text lines, burners, windows). */
export function decorEdges(d) {
  const out = [];
  if (d.d === "poly") polySegs(d.pts, out);
  else if (d.d === "ring") polySegs(circle(d.x, d.h, d.z, d.r, d.n || 16), out);
  else if (d.d === "fring") polySegs(circle(d.x, d.y, d.z, d.r, d.n || 16, "xy"), out);
  else if (d.d === "lines") {
    /* n parallel lines across a horizontal surface at height h. */
    for (let i = 0; i < d.n; i++) {
      const w = d.z0 + ((d.z1 - d.z0) * (i + 0.5)) / d.n, x1 = d.x1 - (i === d.n - 1 ? (d.x1 - d.x0) * 0.4 : 0);
      out.push([[d.x0, d.h, w], [x1, d.h, w]]);
    }
  } else if (d.d === "flines") {
    /* n lines on a vertical face at depth z, between heights y0 and y1. */
    for (let i = 0; i < d.n; i++) {
      const y = d.y1 - ((d.y1 - d.y0) * (i + 0.5)) / d.n, x1 = d.x1 - (i === d.n - 1 ? (d.x1 - d.x0) * 0.35 : 0);
      out.push([[d.x0, y, d.z], [x1, y, d.z]]);
    }
  } else if (d.d === "grid") {
    /* Windows or drawers: cols x rows small rectangles on a vertical face at depth z. */
    const gw = (d.x1 - d.x0) / d.cols, gh = (d.y1 - d.y0) / d.rows, m = d.m == null ? 0.22 : d.m;
    for (let i = 0; i < d.cols; i++) for (let j = 0; j < d.rows; j++) {
      const a = d.x0 + gw * (i + m), b = d.x0 + gw * (i + 1 - m), lo = d.y0 + gh * (j + m), hi = d.y0 + gh * (j + 1 - m);
      polySegs([[a, lo, d.z], [b, lo, d.z], [b, hi, d.z], [a, hi, d.z], [a, lo, d.z]], out);
    }
  }
  return out;
}

/* Everything a renderer needs for one object: its edges in pen order, its bounds,
   and the anchor (top centre) where light arcs start and end. */
export function buildObject(o) {
  const segs = [];
  o.solids.forEach((s) => solidEdges(s).forEach((e) => segs.push(e)));
  (o.decor || []).forEach((d) => decorEdges(d).forEach((e) => segs.push(e)));
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, h1 = 0;
  segs.forEach((e) => e.forEach((p) => {
    x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); h1 = Math.max(h1, p[1]);
  }));
  return { segs, bounds: { x0, x1, z0, z1, h1 }, anchor: [(x0 + x1) / 2, h1, (z0 + z1) / 2] };
}

/* Where a 3D page point lands on the flat paper drawing (SVG and the t = 0 pose). */
export function flat(p) { return [p[0], p[2] - p[1] * OBL]; }
