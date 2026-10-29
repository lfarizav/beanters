// Build the cell-site figure: node build.mjs
// Writes mast-art.js (static SVG art + data for mast-live.js), mast.css and poster.svg.
// Built with the Anatomy kit (iso-kit.mjs, MIT, (c) 2026 Ryan).
//
// Truth notes (labels in this figure are standard names only, no numeric specs):
// - GSM, UMTS, LTE and NR are 3GPP radio technologies (https://www.3gpp.org/about-us/introducing-3gpp).
// - 6G is shown as research only. ITU-R Recommendation M.2160 (11/2023), "Framework and overall
//   objectives of the future development of IMT for 2030 and beyond" (IMT-2030):
//   https://www.itu.int/rec/R-REC-M.2160 (checked 2026-10-29). No 6G equipment is drawn, only an empty mount.
// - The figure shows no frequency bands or element counts; the drawn element grids are illustrative.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./iso-kit.mjs";
import { W, H, DEG, PLATE, MAST, SECTORS, R_PIPE, PIPE_R, PLAT_Z, CAB, CAB_Z, CAB_TOP, GLAND, PHONE, DIAL, DIAL_R, DIAL_TOP, AAU, unit, centreOf, phoneScreen, dialAngle, pointerPath, beamPaths } from "./mast-model.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FOOT = 17;

const extremes = [...k.boxCorners(PLATE, -FOOT, 0), [MAST[0], MAST[1], 232]];
for (const a of SECTORS) {
  const [ux, uy] = unit(a);
  for (const z of [128, 228]) extremes.push([MAST[0] + ux * (R_PIPE + 16), MAST[1] + uy * (R_PIPE + 16), z]);
}
const P = k.fitProjection(extremes, W, H, { pad: 18, azimuth: 45 });
const VIEW = k.towardViewer(P);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const poly = (pts, closed = false) => k.pathOf(pts.map(at), closed);
const depth = ([x, y]) => k.depthOf([x, y, 0], P);
const byDepth = (pts) => [...pts].sort((a, b) => depth(a) - depth(b));
const faces = (n) => n[0] * VIEW[0] + n[1] * VIEW[1] > 0.04;

// A box turned to face `deg`: d runs along the facing direction u, w across it along t.
function boxRing(cx, cy, w, d, deg, ch = 0.5) {
  const [ux, uy] = unit(deg);
  const [tx, ty] = [-uy, ux];
  const loc = [[d / 2, -w / 2 + ch], [d / 2, w / 2 - ch], [d / 2 - ch, w / 2], [-d / 2 + ch, w / 2], [-d / 2, w / 2 - ch], [-d / 2, -w / 2 + ch], [-d / 2 + ch, -w / 2], [d / 2 - ch, -w / 2]];
  return loc.map(([a, b]) => [cx + ux * a + tx * b, cy + uy * a + ty * b]);
}
const box = (cx, cy, w, d, deg, z, h, bevel = 0.4, ch = 0.5) => k.extrude(boxRing(cx, cy, w, d, deg, ch), z, h, P, { bevel });
// A point on the face of such a box: side +1 is the front (toward u), -1 the back.
function facePoint(cx, cy, d, deg, side, b, z) {
  const [ux, uy] = unit(deg);
  const off = (d / 2 + 0.02) * side;
  return [cx + ux * off - uy * b, cy + uy * off + ux * b, z];
}
function faceRect(cx, cy, d, deg, side, b0, b1, z0, z1) {
  return poly([facePoint(cx, cy, d, deg, side, b0, z0), facePoint(cx, cy, d, deg, side, b1, z0), facePoint(cx, cy, d, deg, side, b1, z1), facePoint(cx, cy, d, deg, side, b0, z1)], true);
}
function faceText(cx, cy, d, deg, b, z, text, size) {
  const o = facePoint(cx, cy, d, deg, 1, b, z);
  const O = at(o);
  const [ux, uy] = unit(deg);
  const X = at([o[0] + uy, o[1] - ux, o[2]]); // along -t, so the text reads left to right
  const Y = at([o[0], o[1], o[2] - 1]);
  const m = [X[0] - O[0], X[1] - O[1], Y[0] - O[0], Y[1] - O[1], O[0], O[1]].map((v) => Math.round(v * 1000) / 1000).join(" ");
  return k.faceTextSvg(`matrix(${m})`, text, { size, tone: "hi", anchor: "middle" });
}

/* ---------- plinth ---------- */
function plinth() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -FOOT, FOOT, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -FOOT, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -FOOT + 1.6, 3.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: -62, y: PLATE.y + PLATE.d - 15, w: 136, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // label plate with three rule lines standing for engraved text
  const lp = { x: -70, y: 18, w: 22, d: 13, r: 1.2 };
  out.push(S(k.slabOf(lp, 0, 0.8, P, 4, 0.3), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(lp, 1.6), 0.8, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([lp.x + 4, lp.y + 4], [lp.x + 4, lp.y + 15], 0.8, P) + k.lineOnTop([lp.x + 7, lp.y + 4], [lp.x + 7, lp.y + 12], 0.8, P) + k.lineOnTop([lp.x + 10, lp.y + 4], [lp.x + 10, lp.y + 9], 0.8, P), { tone: "lo", free: true }));
  out.push(D([at([lp.x + 17.5, lp.y + 3, 0.8]), at([lp.x + 17.5, lp.y + 10, 0.8])], { size: 0.45 }));
  return out.join("");
}

/* ---------- generation dial (a detent selector on the plinth) ---------- */
function dial() {
  const [x, y] = DIAL;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 13, y: y - 13, w: 26, d: 26, r: 13 }, 0, 0.1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.cylinder(x, y, DIAL_R, 0, 1.6, P, 72, 0.6), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, DIAL_R - 1.2, 1.6, 0.9, P, 72, 0.4), { tone: "mid" }));
  const z = 2.5;
  const minor = [];
  const major = [];
  for (let i = 0; i <= 8; i++) {
    const a = dialAngle(i / 2);
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const r1 = DIAL_R - 1.2;
    const r0 = i % 2 ? r1 - 1.6 : r1 - 3;
    (i % 2 ? minor : major).push(k.lineOnTop([x + dx * r0, y + dy * r0], [x + dx * r1, y + dy * r1], z, P));
  }
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  // detent dots at each generation
  out.push(D([0, 1, 2, 3, 4].map((g) => { const a = dialAngle(g); return at([x + Math.sin(a) * (DIAL_R - 5.3), y - Math.cos(a) * (DIAL_R - 5.3), z]); }), { size: 0.5, tone: "mid" }));
  out.push(S(k.cylinder(x, y, 7.4, z, DIAL_TOP - z, P, 48, 0.5), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, 7.4, z + 0.6, DIAL_TOP - 0.6, 48, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, 5.6, DIAL_TOP, P, 48), { tone: "faint" }));
  return out.join("");
}

/* ---------- mast ---------- */
const SECTIONS = [
  { r: 6.5, z0: 2.5, z1: 62 },
  { r: 5.5, z0: 64.5, z1: 118 },
  { r: 4.6, z0: 120, z1: 137 },
];
function mastBase(front) {
  const [mx, my] = MAST;
  const out = [];
  const nuts = byDepth(k.corners({ x: mx - 12, y: my - 12, w: 24, d: 24, r: 2 }, 3.5)).filter(([x, y]) => (depth([x, y]) > depth(MAST)) === front);
  if (!front) {
    out.push(S(k.slabOf({ x: mx - 14, y: my - 14, w: 28, d: 28, r: 2 }, 0, 1.2, P, 3, 0.4), { tone: "lo" }));
    out.push(S(k.slabOf({ x: mx - 12, y: my - 12, w: 24, d: 24, r: 2 }, 1.2, 1.3, P, 3, 0.5), { tone: "mid" }));
  }
  for (const [x, y] of nuts) {
    out.push(S(k.cylinder(x, y, 1.5, 2.5, 1.4, P, 12), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 0.6, 3.9, 1.1, P, 10), { tone: "mid", crease: "none" }));
  }
  return out.join("");
}
function mastBody() {
  const [mx, my] = MAST;
  const out = [];
  SECTIONS.forEach((s, i) => {
    out.push(S(k.cylinder(mx, my, s.r, s.z0, s.z1 - s.z0, P, 40), { tone: "mid", crease: "none" }));
    if (i < 2) {
      const f = { r: s.r + 1.6, z0: s.z1, z1: SECTIONS[i + 1].z0 };
      out.push(S(k.cylinder(mx, my, f.r, f.z0, f.z1 - f.z0, P, 40, 0.3), { tone: "mid" }));
      const [vx, vy] = VIEW;
      const bolts = [-50, -25, 0, 25, 50].map((a) => { const c = Math.cos(Math.atan2(vy, vx) + a * DEG); const s2 = Math.sin(Math.atan2(vy, vx) + a * DEG); return at([mx + c * (f.r - 0.7), my + s2 * (f.r - 0.7), f.z1]); });
      out.push(D(bolts, { size: 0.42, tone: "mid" }));
    }
  });
  // climbing pegs on the visible flank, every 9 units, alternating sides
  const pegs = [];
  for (let z = 14, i = 0; z < 134; z += 9, i++) {
    const sec = SECTIONS.find((s) => z >= s.z0 && z <= s.z1);
    if (!sec) continue;
    const a = (45 + (i % 2 ? 62 : 28)) * DEG;
    const p0 = [mx + Math.cos(a) * sec.r, my + Math.sin(a) * sec.r, z];
    const p1 = [mx + Math.cos(a) * (sec.r + 3), my + Math.sin(a) * (sec.r + 3), z];
    pegs.push(k.segment(p0, p1, P));
  }
  out.push(L(pegs.join(""), { tone: "mid" }));
  out.push(L([30, 48, 86, 104].map((z) => { const s = SECTIONS.find((q) => z >= q.z0 && z <= q.z1); return k.sideArc(mx, my, s.r, z, P, 20); }).join(""), { tone: "faint" }));
  return out.join("");
}
const strutEnds = (deg) => {
  const [ux, uy] = unit(deg);
  return [[MAST[0] + ux * 5.5, MAST[1] + uy * 5.5, 106], [MAST[0] + ux * (R_PIPE - 2.6), MAST[1] + uy * (R_PIPE - 2.6), PLAT_Z - 3]];
};
const struts = (front) => SECTORS.filter((a) => faces(unit(a)) === front).map((a) => {
  const [p0, p1] = strutEnds(a);
  return `<path class="iso-line" data-tone="mid" style="stroke-width:1.3" d="${k.segment(p0, p1, P)}"/>`;
}).join("");
const pipeAt = (deg) => { const [ux, uy] = unit(deg); return [MAST[0] + ux * R_PIPE, MAST[1] + uy * R_PIPE]; };
function pipeLower() {
  return byDepth(SECTORS.map(pipeAt)).map(([x, y]) => S(k.cylinder(x, y, PIPE_R, PLAT_Z - 10, 7, P, 16), { tone: "mid", crease: "none" }) + S(k.cylinder(x, y, PIPE_R + 0.5, PLAT_Z - 11, 1.2, P, 16), { tone: "mid" })).join("");
}
function platform() {
  const ring = [];
  for (const a of SECTORS) for (const da of [-13, 13]) { const [ux, uy] = unit(a + da); ring.push([MAST[0] + ux * 35, MAST[1] + uy * 35]); }
  const out = [S(k.extrude(ring, PLAT_Z - 3, 3, P, { bevel: 0.5 }), { tone: "mid" })];
  const inner = ring.map(([x, y]) => [MAST[0] + (x - MAST[0]) * 0.86, MAST[1] + (y - MAST[1]) * 0.86]);
  out.push(L(k.onTop(inner, PLAT_Z, P, true), { tone: "faint" }));
  // grating bars across the inner outline, ending on it
  const bars = [];
  for (let i = 1; i < 6; i++) {
    const a = inner[0], b = inner[1], c = inner[3], d = inner[2];
    void c; void d;
    const t = i / 6;
    const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    bars.push(k.lineOnTop(p, [MAST[0] + (p[0] - MAST[0]) * 0.3, MAST[1] + (p[1] - MAST[1]) * 0.3], PLAT_Z, P));
  }
  out.push(L(bars.join(""), { tone: "faint" }));
  out.push(D(ring.map(([x, y]) => at([MAST[0] + (x - MAST[0]) * 0.93, MAST[1] + (y - MAST[1]) * 0.93, PLAT_Z])), { size: 0.45 }));
  return out.join("");
}
const pipeUpper = (deg) => { const [x, y] = pipeAt(deg); return S(k.cylinder(x, y, PIPE_R, PLAT_Z, 74, P, 16), { tone: "mid", crease: "none" }) + S(k.cylinder(x, y, PIPE_R + 0.4, PLAT_Z + 74, 1, P, 16), { tone: "mid" }); };
function mastTop() {
  const [mx, my] = MAST;
  return [
    S(k.cylinder(mx, my, 6.2, PLAT_Z, 1.6, P, 32, 0.3), { tone: "mid" }),
    S(k.cylinder(mx, my, 3.2, PLAT_Z + 1.6, 66, P, 28), { tone: "mid", crease: "none" }),
    S(k.cylinder(mx, my, 3.8, PLAT_Z + 67.6, 1.4, P, 28, 0.3), { tone: "mid" }),
    S(k.cylinder(mx, my, 2.2, PLAT_Z + 69, 4, P, 20), { tone: "hi", crease: "lo" }),
    L(k.sideArc(mx, my, 2.2, PLAT_Z + 71, P, 16), { tone: "lo" }),
    S(k.cylinder(mx, my, 0.5, PLAT_Z + 73, 12, P, 8), { tone: "mid", crease: "none" }),
    D([at([mx, my, PLAT_Z + 85])], { size: 0.7, tone: "mid" }),
  ].join("");
}

/* ---------- radio equipment, one group per generation and sector ---------- */
const ANT = {
  2: { w: 11, d: 4, z0: 152, z1: 202 },
  3: { w: 11.5, d: 4.2, z0: 152, z1: 204 },
  4: { w: 17, d: 5, z0: 166, z1: 222 },
  5: { ...AAU },
};
const NAME = { 2: "GSM", 3: "UMTS", 4: "LTE", 5: "NR" };
function brackets(deg, a, zs) {
  const [ux, uy] = unit(deg);
  const r0 = R_PIPE + PIPE_R - 0.3;
  const r1 = R_PIPE + PIPE_R + 1.45;
  const mid = (r0 + r1) / 2;
  return zs.map((z) => S(box(MAST[0] + ux * mid, MAST[1] + uy * mid, 2.8, r1 - r0, deg, z, 2, 0.2, 0.3), { tone: "mid" })).join("");
}
function antenna(gen, deg, front) {
  const a = ANT[gen];
  const [cx, cy] = centreOf(deg, a.d);
  const [ux, uy] = unit(deg);
  const n = [ux, uy];
  const out = [];
  const body = [];
  if (gen === 5) {
    // active antenna unit: deep box, radome on the front, heat-sink fins on the back
    body.push(S(box(cx, cy, a.w, a.d, deg, a.z0, a.z1 - a.z0, 0.6, 0.9), { tone: "hi", crease: "lo" }));
    if (faces(n)) {
      body.push(L(faceRect(cx, cy, a.d, deg, 1, -a.w / 2 + 1.2, a.w / 2 - 1.2, a.z0 + 4.5, a.z1 - 1.2), { tone: "lo" }));
      const pts = [];
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) pts.push(at(facePoint(cx, cy, a.d, deg, 1, -a.w / 2 + 2.4 + i * ((a.w - 4.8) / 7), a.z0 + 6.4 + j * ((a.z1 - a.z0 - 9.6) / 7))));
      body.push(`<g data-elements="">${D(pts, { size: 0.42, tone: "hi" })}</g>`);
    }
    // fibre and DC from the AAU's underside down to the platform
    const drops = [-3, 3].map((b) => [facePoint(cx, cy, 0, deg, 1, b, a.z0), facePoint(cx, cy, 0, deg, 1, b, PLAT_Z)]);
    body.push(`<path class="iso-line" data-tone="hi" style="stroke-width:.8" d="${drops.map(([p, q]) => k.segment(p, q, P)).join("")}"/>`);
    body.push(D(drops.map(([, q]) => at(q)), { size: 0.6, tone: "hi" }));
    if (faces([-ux, -uy])) {
      const fins = [];
      for (let b = -a.w / 2 + 1.4; b <= a.w / 2 - 1.4 + 1e-6; b += 1.5) fins.push(k.segment(facePoint(cx, cy, a.d, deg, -1, b, a.z0), facePoint(cx, cy, a.d, deg, -1, b, a.z1), P));
      body.push(L(fins.join(""), { tone: "lo" }));
    }
  } else {
    body.push(S(box(cx, cy, a.w, a.d, deg, a.z0, a.z1 - a.z0, 0.5, 0.8), { tone: "hi", crease: "lo" }));
    // end caps of the radome
    body.push(S(box(cx, cy, a.w + 0.4, a.d + 0.4, deg, a.z0 - 1.2, 1.2, 0.2, 0.6), { tone: "mid" }));
    body.push(S(box(cx, cy, a.w + 0.4, a.d + 0.4, deg, a.z1, 1, 0.2, 0.6), { tone: "mid" }));
    if (faces(n) && gen === 4) {
      // two columns of dual-polarised (+/-45 degree) radiators: four ports for MIMO
      const xs = [];
      for (const b of [-a.w / 4, a.w / 4]) for (let j = 0; j < 5; j++) {
        const z = a.z0 + 9 + j * ((a.z1 - a.z0 - 12) / 4);
        xs.push(k.segment(facePoint(cx, cy, a.d, deg, 1, b - 1.4, z - 1.4), facePoint(cx, cy, a.d, deg, 1, b + 1.4, z + 1.4), P));
        xs.push(k.segment(facePoint(cx, cy, a.d, deg, 1, b - 1.4, z + 1.4), facePoint(cx, cy, a.d, deg, 1, b + 1.4, z - 1.4), P));
      }
      body.push(L(faceRect(cx, cy, a.d, deg, 1, -a.w / 2 + 1, a.w / 2 - 1, a.z0 + 5, a.z1 - 1), { tone: "faint" }));
      body.push(L(xs.join(""), { tone: "mid" }));
    } else if (faces(n)) {
      body.push(L(faceRect(cx, cy, a.d, deg, 1, -a.w / 2 + 1, a.w / 2 - 1, a.z0 + 5, a.z1 - 1), { tone: "faint" }));
    }
    // RF connectors under the bottom cap
    const ports = gen === 4 ? [-4.8, -1.6, 1.6, 4.8] : [-2, 2];
    body.push(ports.map((b) => { const p = facePoint(cx, cy, 0, deg, 1, b, 0); return S(k.cylinder(p[0], p[1], 0.6, a.z0 - 3.2, 2, P, 10), { tone: "mid", crease: "none" }); }).join(""));
  }
  if (front && NAME[gen]) body.push(faceText(cx, cy, a.d, deg, 0, a.z0 + 3.3, NAME[gen], gen === 3 ? 2.6 : 2.9));
  const brk = gen === 4 ? brackets(deg, a, [a.z0 + 4, a.z1 - 6]) : brackets(deg, a, [a.z0 + 3, a.z1 - 5]);
  // RRU on the pipe under the LTE panel, jumpers up to its four ports
  let rru = "";
  if (gen === 4) {
    const rd = 6;
    const [rx, ry] = centreOf(deg, rd);
    rru += brackets(deg, a, [148]);
    rru += S(box(rx, ry, 11, rd, deg, 143, 14, 0.4, 0.6), { tone: "mid", crease: "lo" });
    if (faces(n)) {
      const fins = [];
      for (let b = -4.2; b <= 4.21; b += 1.4) fins.push(k.segment(facePoint(rx, ry, rd, deg, 1, b, 143), facePoint(rx, ry, rd, deg, 1, b, 157), P));
      rru += L(fins.join(""), { tone: "lo" });
    }
    const jumpers = [-4.8, -1.6, 1.6, 4.8].map((b) => k.segment(facePoint(rx, ry, 0, deg, 1, b, 157), facePoint(cx, cy, 0, deg, 1, b, a.z0 - 3.2), P));
    rru += `<path class="iso-line" data-tone="hi" style="stroke-width:.8" d="${jumpers.join("")}"/>`;
  }
  // painter: for a sector that faces away the antenna is behind its brackets
  out.push(front ? brk + rru + body.join("") : body.join("") + rru + brk);
  return out.join("");
}
function ghost(deg) {
  // 6G: an empty, reserved mount; nothing about 6G hardware is specified yet
  const a = { w: 21, d: 9, z0: 203, z1: 222 };
  const [cx, cy] = centreOf(deg, a.d);
  const ring = boxRing(cx, cy, a.w, a.d, deg, 0.9);
  return [
    L(k.onTop(ring, a.z1, P, true), { tone: "lit", dotted: true }),
    L(faceRect(cx, cy, a.d, deg, 1, -a.w / 2, a.w / 2, a.z0, a.z1), { tone: "lit", dotted: true }),
    brackets(deg, a, [a.z0 + 3, a.z1 - 5]),
  ].join("");
}
const genOf = { 0: 2, 1: 3, 2: 4, 3: 5 };
function equipment(front) {
  const out = [];
  const list = SECTORS.filter((a) => faces(unit(a)) === front).sort((a, b) => depth(unit(a)) - depth(unit(b)));
  for (const deg of list) {
    const sector = SECTORS.indexOf(deg);
    const groups = [];
    for (let i = 0; i < 4; i++) {
      const gen = genOf[i];
      if (gen === 2 && sector !== 0) continue; // 2G: one sector antenna
      groups.push(`<g data-gen="${i}" data-hit="antenna">${antenna(gen, deg, sector === 0)}</g>`);
    }
    if (sector === 0) groups.push(`<g data-gen="4" data-ghost="" data-hit="antenna">${ghost(deg)}</g>`);
    out.push(front ? pipeUpper(deg) + groups.join("") : groups.join("") + pipeUpper(deg));
  }
  return out.join("");
}

/* ---------- cabinet, cable tray and feeders ---------- */
const TRAY_DIR = (() => { const v = [GLAND[0] - MAST[0], GLAND[1] - MAST[1]]; const l = Math.hypot(...v); return [v[0] / l, v[1] / l]; })();
const TRAY_DEG = Math.atan2(TRAY_DIR[1], TRAY_DIR[0]) / DEG;
function cabinet() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CAB, 0, 2, P)}" style="filter:blur(5px)"/>`];
  out.push(S(k.slabOf(k.insetPlan(CAB, -2), 0, CAB_Z, P, 4, 0.5), { tone: "lo" }));
  const seam = k.sideSeam(CAB, CAB_TOP - 3, P, 4);
  const doorLine = k.segment([CAB.x + CAB.w / 2, CAB.y + CAB.d, CAB_Z], [CAB.x + CAB.w / 2, CAB.y + CAB.d, CAB_TOP - 3], P);
  out.push(S(k.slabOf(CAB, CAB_Z, CAB_TOP - CAB_Z, P, 4, 0.8), { tone: "hi", crease: "lo", inner: L(seam, { tone: "faint" }) + L(doorLine, { tone: "lo" }) }));
  const yF = CAB.y + CAB.d + 0.05;
  // handles on both doors
  for (const x of [CAB.x + CAB.w / 2 - 2.6, CAB.x + CAB.w / 2 + 2.6]) out.push(S(k.slabOf({ x: x - 0.6, y: yF, w: 1.2, d: 0.9, r: 0.3 }, 20, 8, P, 2), { tone: "mid", crease: "none" }));
  // vents on the +x face: closed slots
  const xF = CAB.x + CAB.w + 0.05;
  const slots = [];
  for (let i = 0; i < 6; i++) { const z = 10 + i * 3.4; slots.push(poly([[xF, CAB.y + 6, z], [xF, CAB.y + CAB.d - 6, z], [xF, CAB.y + CAB.d - 6, z + 1.4], [xF, CAB.y + 6, z + 1.4]], true)); }
  out.push(L(slots.join(""), { tone: "lo" }));
  // label holder on the left door with rule lines
  const lx0 = CAB.x + 3, lx1 = CAB.x + 12;
  out.push(L(poly([[lx0, yF, 36], [lx1, yF, 36], [lx1, yF, 31], [lx0, yF, 31]], true), { tone: "lo" }));
  out.push(L(poly([[lx0 + 1.5, yF, 34.3], [lx1 - 2, yF, 34.3]]) + poly([[lx0 + 1.5, yF, 32.6], [lx1 - 4, yF, 32.6]]), { tone: "lo", free: true }));
  out.push(D([[CAB.x + 1.6, 6], [CAB.x + CAB.w - 1.6, 6], [CAB.x + 1.6, 38], [CAB.x + CAB.w - 1.6, 38]].map(([x, z]) => at([x, yF, z])), { size: 0.42 }));
  // cable gland on the roof
  out.push(S(k.cylinder(GLAND[0], GLAND[1], 2.6, CAB_TOP, 1.2, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(GLAND[0], GLAND[1], 1.8, CAB_TOP + 1.2, 1.6, P, 16), { tone: "mid" }));
  return out.join("");
}
const TRAY_Z = 50;
function tray() {
  const len = Math.hypot(GLAND[0] - MAST[0], GLAND[1] - MAST[1]);
  const from = 7, to = len - 3.4;
  const mid = (from + to) / 2;
  const c = [MAST[0] + TRAY_DIR[0] * mid, MAST[1] + TRAY_DIR[1] * mid];
  const out = [];
  // a post from the cabinet roof carries the tray's far end
  const pc = [MAST[0] + TRAY_DIR[0] * (to - 4), MAST[1] + TRAY_DIR[1] * (to - 4)];
  out.push(S(k.cylinder(pc[0], pc[1], 0.9, CAB_TOP, TRAY_Z - 1.2 - CAB_TOP, P, 12), { tone: "mid", crease: "none" }));
  out.push(S(box(c[0], c[1], 6, to - from, TRAY_DEG, TRAY_Z - 1.2, 1.2, 0.3, 0.4), { tone: "mid" }));
  // rungs across the tray, edge to edge
  const rungs = [];
  for (let s = from + 3; s < to - 1; s += 4) { const p = [MAST[0] + TRAY_DIR[0] * s, MAST[1] + TRAY_DIR[1] * s]; const t = [-TRAY_DIR[1] * 3, TRAY_DIR[0] * 3]; rungs.push(k.lineOnTop([p[0] - t[0], p[1] - t[1]], [p[0] + t[0], p[1] + t[1]], TRAY_Z, P)); }
  out.push(L(rungs.join(""), { tone: "faint" }));
  // mast bracket under the near end
  const pb = [MAST[0] + TRAY_DIR[0] * 6.6, MAST[1] + TRAY_DIR[1] * 6.6];
  out.push(S(box(pb[0], pb[1], 4, 1.6, TRAY_DEG, TRAY_Z - 6, 4.8, 0.2, 0.3), { tone: "mid" }));
  return out.join("");
}
function feederRoute(offset) {
  const lat = [-TRAY_DIR[1], TRAY_DIR[0]];
  const len = Math.hypot(GLAND[0] - MAST[0], GLAND[1] - MAST[1]);
  const o = (s) => [MAST[0] + TRAY_DIR[0] * s + lat[0] * offset, MAST[1] + TRAY_DIR[1] * s + lat[1] * offset];
  const g = o(len);
  const m = o(8.9);
  return [[g[0], g[1], CAB_TOP + 2.8], [g[0], g[1], TRAY_Z + 0.5], [m[0], m[1], TRAY_Z + 0.5], [m[0], m[1], PLAT_Z - 3]];
}
function feeders() {
  // 2G/3G: thick coaxial feeders carry RF up from radios in the cabinet;
  // 4G onward: a thin fibre and a DC cable feed radios mounted on the mast.
  const sets = [
    { lines: [-0.9, 0.9], cls: "coax" },
    { lines: [-1.8, -0.6, 0.6, 1.8], cls: "coax" },
    { lines: [-0.5, 0.5], cls: "fibre" },
    { lines: [-0.5, 0.5], cls: "fibre" },
    { lines: [-0.5, 0.5], cls: "fibre" },
  ];
  return sets.map((s, i) => {
    const d = s.lines.map((o) => poly(feederRoute(o))).join("");
    const hang = [];
    for (let z = 62; z < PLAT_Z - 6; z += 14) { const r = feederRoute(0); hang.push(at([r[2][0], r[2][1], z])); }
    return `<g data-feed="${i}"><path class="iso-line feed-${s.cls}" data-tone="${s.cls === "coax" ? "mid" : "hi"}" d="${d}"/>${D(hang, { size: 0.55, tone: "hi" })}</g>`;
  }).join("");
}

/* ---------- phone on a stand ---------- */
function phone() {
  const { x, y } = PHONE;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 1, y: y - 1, w: 14, d: 9, r: 2 }, 0, 0.1, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf({ x, y, w: 14, d: 8, r: 1.5 }, 0, 1.4, P, 4, 0.3), { tone: "mid" }));
  const ph = { x: x + 3.5, y: y + 3, w: 7, d: 1.3, r: 0.6 };
  out.push(S(k.slabOf(ph, 1.4, 14, P, 3, 0.2), { tone: "hi", crease: "lo" }));
  const yF = ph.y + ph.d + 0.03;
  out.push(L(poly([[ph.x + 0.7, yF, 3.4], [ph.x + ph.w - 0.7, yF, 3.4], [ph.x + ph.w - 0.7, yF, 14.2], [ph.x + 0.7, yF, 14.2]], true), { tone: "lo" }));
  out.push(D([at([ph.x + ph.w / 2, yF, 14.8])], { size: 0.3, tone: "mid" }));
  return out.join("");
}

/* ---------- assemble ---------- */
const BEAM0 = beamPaths(P, 0);
const beam = `<g data-beam="" data-hit="beam"><path class="beam-lobe" d="${BEAM0.lobe}"/><path class="beam-arc" d="${BEAM0.arc}"/><circle class="beam-dot" cx="${BEAM0.tip[0].toFixed(1)}" cy="${BEAM0.tip[1].toFixed(1)}" r="2.2"/></g>`;
const pointer = `<path data-pointer="" class="iso-line" data-tone="lit" data-free="start" style="stroke-width:1.2" d="${pointerPath(3, P)}"/>`;

const body = [
  `<defs><linearGradient id="beam-grad" gradientUnits="userSpaceOnUse" x1="${BEAM0.apex[0].toFixed(1)}" y1="${BEAM0.apex[1].toFixed(1)}" x2="${BEAM0.tip[0].toFixed(1)}" y2="${BEAM0.tip[1].toFixed(1)}"><stop offset="0" stop-color="var(--beam)" stop-opacity=".55"/><stop offset="1" stop-color="var(--beam)" stop-opacity=".12"/></linearGradient></defs>`,
  plinth(),
  `<g data-part="dial">${dial()}${pointer}</g>`,
  mastBase(false),
  struts(false),
  mastBody(),
  mastBase(true),
  `<g data-hit="baseband">${cabinet()}</g>`,
  tray(),
  feeders(),
  struts(true),
  pipeLower(),
  platform(),
  equipment(false),
  mastTop(),
  equipment(true),
  `<g data-hit="phone">${phone()}</g>`,
  beam,
];

const LABEL = "Scale model of a cell site on a plinth: a monopole mast with a head frame and three mounting pipes, a baseband cabinet joined to the mast by a cable tray, a phone on a stand and a five-detent dial for the generations 2G to 6G.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

writeFileSync(join(HERE, "mast-art.js"), `// Generated by build.mjs. Do not edit by hand.\nexport const P = ${JSON.stringify(P)};\nexport const SVG = ${JSON.stringify(svg)};\n`);

/* ---------- CSS: kit styles with the site palette ---------- */
const kitRules = k.ISO_CSS.slice(k.ISO_CSS.indexOf(".iso-svg{"));
const LIGHT = `--anatomy-page:#f3f5f8;--anatomy-card:#ffffff;--anatomy-text:#3b4a5c;--anatomy-strong:#0d1b2a;--anatomy-muted:#6b7c8f;
  --anatomy-paper:#ffffff;--anatomy-face:#ffffff;--anatomy-top:#ffffff;
  --anatomy-shade-0:#d6dee7;--anatomy-shade-1:#e1e7ee;--anatomy-shade-2:#eaeff4;--anatomy-shade-3:#f3f6f9;
  --anatomy-lit-top:#ffffff;--anatomy-lit-shade:#e4f0f3;
  --anatomy-hi:#0d1b2a;--anatomy-mid:#6a7d91;--anatomy-lo:#a8b6c4;--anatomy-faint:#d3dbe4;--anatomy-lit:#00708a;
  --anatomy-halo:#1a5276;--anatomy-halo-opacity:.2;--anatomy-dot:#0d1b2a;
  --beam:#00D9FF;--beam-ink:#00708a;--hl-antenna:#00708a;--hl-baseband:#1a5276;--hl-phone:#00708a;--hl-beam:#00a8c6`;
const DARK = `--anatomy-page:#0a1420;--anatomy-card:#111f2e;--anatomy-text:#c3cfdb;--anatomy-strong:#eaf0f6;--anatomy-muted:#9aabbf;
  --anatomy-paper:#111f2e;--anatomy-face:#17293c;--anatomy-top:#1b2e43;
  --anatomy-shade-0:#0b1622;--anatomy-shade-1:#0e1a28;--anatomy-shade-2:#11202f;--anatomy-shade-3:#142537;
  --anatomy-lit-top:#20364c;--anatomy-lit-shade:#182b3f;
  --anatomy-hi:#dce6f0;--anatomy-mid:#6f849a;--anatomy-lo:#3f5368;--anatomy-faint:#26384b;--anatomy-lit:#00D9FF;
  --anatomy-halo:#02060b;--anatomy-halo-opacity:.8;--anatomy-dot:#eaf0f6;
  --beam:#00D9FF;--beam-ink:#00D9FF;--hl-antenna:#00D9FF;--hl-baseband:#a9c7e3;--hl-phone:#00D9FF;--hl-beam:#00D9FF`;
const FIG_CSS = `
/* figure styles (site palette); kit rules below are from iso-kit.mjs, MIT, (c) 2026 Ryan */
.iso{${LIGHT};--anatomy-weight:.6px;--anatomy-ease:cubic-bezier(.32,.72,0,1);--anatomy-mono:"Instrument Sans",ui-sans-serif,system-ui,sans-serif}
:root[data-theme="dark"] .iso{${DARK}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .iso{${DARK}}}
.iso-face-text{font-family:"Instrument Sans",ui-sans-serif,system-ui,sans-serif;font-weight:600;letter-spacing:.06em}
.feed-coax{stroke-width:1.5}.feed-fibre{stroke-width:.75}
.beam-lobe{fill:url(#beam-grad);stroke:var(--beam);stroke-width:.6;stroke-opacity:.7}
.beam-arc{fill:none;stroke:var(--beam-ink);stroke-width:1.1;stroke-dasharray:3 5;stroke-linecap:round;animation:beam-flow 1.1s linear infinite}
.beam-dot{fill:var(--beam);opacity:.9}
[data-beam][data-dotted] .beam-lobe{fill:none;stroke:var(--beam-ink);stroke-dasharray:.01 3.2;stroke-width:1.3;stroke-linecap:round;stroke-opacity:.9}
[data-beam][data-dotted] .beam-arc,[data-beam][data-dotted] .beam-dot{display:none}
@keyframes beam-flow{to{stroke-dashoffset:-16}}
[data-hit]{cursor:pointer}
[data-hit][data-on] .iso-edge,[data-hit][data-on] .iso-crease,[data-hit][data-on] .iso-bevel,[data-hit][data-on]>.iso-line,[data-hit][data-on] .iso-solid~.iso-line{stroke:var(--hl);transition:stroke .3s}
[data-hit][data-on] .iso-top{fill:color-mix(in srgb,var(--hl) 12%,var(--anatomy-top))}
[data-hit][data-on] .iso-shade{fill:color-mix(in srgb,var(--hl) 10%,var(--anatomy-shade-2))}
[data-hit][data-on] .iso-dots circle{fill:var(--hl);opacity:.95}
[data-hit="antenna"]{--hl:var(--hl-antenna)}[data-hit="baseband"]{--hl:var(--hl-baseband)}[data-hit="phone"]{--hl:var(--hl-phone)}[data-hit="beam"]{--hl:var(--hl-beam)}
[data-hit="beam"][data-on] .beam-lobe{stroke-width:1.2;stroke-opacity:1}
.iso-svg[data-ink] .iso-fill,.iso-svg[data-ink] .iso-shade,.iso-svg[data-ink] .iso-top,.iso-svg[data-ink] .iso-halo,.iso-svg[data-ink] .iso-dots,.iso-svg[data-ink] .iso-face-text,.iso-svg[data-ink] [data-beam]{opacity:0}
.iso-svg[data-ink] .iso-line{stroke-dasharray:1 1;stroke-dashoffset:1}
.iso-svg[data-inking] .iso-line{transition:stroke-dashoffset 1.5s cubic-bezier(.45,.05,.25,1)}
.iso-svg[data-filling] .iso-fill,.iso-svg[data-filling] .iso-shade,.iso-svg[data-filling] .iso-top,.iso-svg[data-filling] .iso-dots,.iso-svg[data-filling] .iso-face-text{transition:opacity .7s ease}
.iso-svg[data-filling] .iso-halo{transition:opacity .9s ease}
@media (prefers-reduced-motion:reduce){.beam-arc{animation:none}}
`;
writeFileSync(join(HERE, "mast.css"), FIG_CSS + kitRules.replace(/\.iso-figure\{[\s\S]*$/, "") + "\n");

/* ---------- poster: the 5G pose, static, light by default, dark via poster.svg#dark ---------- */
function posterOf() {
  let s = svg;
  // show 5G (index 3) and its feeders, hide the rest
  s = s.replace(/<g data-gen="(\d)"( data-ghost="")?/g, (m, i, gh) => `<g data-gen="${i}"${gh || ""}${i === "3" ? "" : ' style="display:none"'}`);
  s = s.replace(/<g data-feed="(\d)"/g, (m, i) => `<g data-feed="${i}"${i === "3" ? "" : ' style="display:none"'}`);
  const css = FIG_CSS.replace(/:root\[data-theme="dark"\] \.iso\{/, ".iso:has(#dark:target){").replace(/@media \(prefers-color-scheme:dark\)\{[^\n]*\n/, "") + kitRules.replace(/\.iso-figure\{[\s\S]*$/, "") + ".iso{background:var(--anatomy-card)}";
  s = s.replace('class="iso-svg"', `class="iso-svg iso"`).replace(/^<svg([^>]*)>/, `<svg$1><style>${css.replace(/\n/g, "")}</style><g id="dark"/><rect width="100%" height="100%" fill="var(--anatomy-card)"/>`);
  return s;
}
writeFileSync(join(HERE, "poster.svg"), posterOf());
console.log("wrote mast-art.js, mast.css, poster.svg", JSON.stringify(P));
