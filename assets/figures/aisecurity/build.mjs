// Build the AI-security figure: node build.mjs
// Writes art.js (static SVG + data for live.js), scene.css and poster.svg.
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan), reused, not copied.
//
// Truth notes: the figure is a metaphor for the program "IA y seguridad para telco cloud native"
// (courses/index.html, cm87 to cm96). It shows no real product, port count or specification.
// The only engraved label is "5G CORE", the program's own setting (cm89, cm90: 5G, 4G/5G).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../cellular/iso-kit.mjs";
import { W, H, AZIMUTH, PLATE, FOOT, ROUTER, BELT, GATE_X, PUSH_X, BIN, CAGE, RACKS, LAMP, PACKET, PLATE_REST, CHUTE, cleanAt, hostileAt, HOSTILE_DONE, GAP, LENGTH } from "./model.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const extremes = [...k.boxCorners(PLATE, -FOOT, 0), ...k.boxCorners(CAGE, 0, CAGE.h), [LAMP.x, LAMP.y, 88], ...k.boxCorners(ROUTER, 0, ROUTER.h + 6)];
const P = k.fitProjection(extremes, W, H, { pad: 16, azimuth: AZIMUTH });
const VIEW = k.towardViewer(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const poly = (pts, closed = false) => k.pathOf(pts.map(at), closed);
const depth = ([x, y]) => k.depthOf([x, y, 0], P);
const byDepth = (pts) => [...pts].sort((a, b) => depth(a) - depth(b));
const slab = (plan, z, h, steps = 3, bevel = 0.4) => k.slabOf(plan, z, h, P, steps, bevel);
// closed rectangle on the +y face (y = const) or the +x face (x = const)
const rectY = (y, x0, x1, z0, z1) => poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
const rectX = (x, y0, y1, z0, z1) => poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], true);
const textOnY = (x, y, z, text, size) => {
  const O = at([x, y, z]);
  const X = at([x + 1, y, z]);
  const Y = at([x, y, z - 1]);
  const m = [X[0] - O[0], X[1] - O[1], Y[0] - O[0], Y[1] - O[1], O[0], O[1]].map((v) => Math.round(v * 1000) / 1000).join(" ");
  return k.faceTextSvg(`matrix(${m})`, text, { size, tone: "hi", anchor: "middle" });
};

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
  // ruler strip along the front edge, left of the quarantine bin
  const strip = { x: -104, y: PLATE.y + PLATE.d - 15, w: 80, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // label plate with three rule lines standing for engraved text
  const lp = { x: 74, y: 38, w: 24, d: 12, r: 1.2 };
  out.push(S(k.slabOf(lp, 0, 0.8, P, 4, 0.3), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(lp, 1.6), 0.8, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([lp.x + 4, lp.y + 4], [lp.x + 18, lp.y + 4], 0.8, P) + k.lineOnTop([lp.x + 4, lp.y + 6.5], [lp.x + 14, lp.y + 6.5], 0.8, P) + k.lineOnTop([lp.x + 4, lp.y + 9], [lp.x + 11, lp.y + 9], 0.8, P), { tone: "lo", free: true }));
  out.push(D([at([lp.x + 21, lp.y + 3, 0.8]), at([lp.x + 21, lp.y + 9, 0.8])], { size: 0.45 }));
  return out.join("");
}

/* ---------- floor cables: router to the gate's sensor post, router to the risk light ---------- */
function cables() {
  const z = 0.15;
  const a = [[ROUTER.x + ROUTER.w + 0.6, -10, 3.05], [-73.2, -10, 3.05], [-73.2, -10, z], [-40, -10, z], [-40, -14.5, z], [GATE_X - 3, -14.5, z]];
  const b = [[ROUTER.x + ROUTER.w + 0.6, -24, 3.05], [-73.2, -24, 3.05], [-73.2, -24, z], [-36, -24, z], [-36, -40, z], [LAMP.x - 7, -40, z]];
  return [a, b].map((r) => k.wireSvg(at(r[0]), at(r[r.length - 1]), { via: r.slice(1, -1).map(at), tone: "mid", size: 0.9 })).join("");
}

/* ---------- signal router: the 5G core site ---------- */
function router() {
  const R = ROUTER;
  const out = [`<path class="iso-halo" d="${k.haloOf(R, 0, 2, P)}" style="filter:blur(5px)"/>`];
  out.push(S(slab(k.insetPlan(R, -2), 0, 3, 4, 0.5), { tone: "lo" }));
  const yF = R.y + R.d + 0.05;
  const xF = R.x + R.w + 0.05;
  const seams = [12, 22, 32, 42].map((z) => k.sideSeam(R, z, P, 3)).join("");
  out.push(S(slab(R, 3, R.h, 3, 0.8), { tone: "hi", crease: "lo", inner: L(seams, { tone: "faint" }) }));
  // front face: four line cards, each with a row of ports and two status lights
  const ports = [];
  const leds = [];
  [3, 12, 22, 32].forEach((z0, row) => {
    for (let i = 0; i < 6; i++) { const x = R.x + 4 + i * 3.6; ports.push(rectY(yF, x, x + 2.4, z0 + 3.2, z0 + 5.6)); }
    leds.push(at([R.x + R.w - 5, yF, z0 + 5.6]), at([R.x + R.w - 3, yF, z0 + 5.6]));
    void row;
  });
  out.push(L(ports.join(""), { tone: "mid" }));
  out.push(`<g data-leds="">${D(leds, { size: 0.55, tone: "hi" })}</g>`);
  out.push(textOnY(R.x + R.w / 2, yF, R.h - 2.4, "5G CORE", 3.4));
  // +x face: the port the packets leave by, with its recess, and closed vent slots above
  const slot = [[xF, -5, BELT.z - 1], [xF, 5, BELT.z - 1], [xF, 5, BELT.z + 8], [xF, -5, BELT.z + 8]];
  out.push(`<path class="iso-shade" data-shade="0" d="${poly(slot, true)}"/>`);
  out.push(L(poly(slot, true), { tone: "mid" }));
  const vents = [];
  for (let i = 0; i < 5; i++) { const z = 27 + i * 4; vents.push(rectX(xF, -22, -8, z, z + 1.6)); }
  out.push(L(vents.join(""), { tone: "lo" }));
  // roof: two fan rings and a GNSS puck
  const top = R.h + 3;
  for (const [x, y] of [[R.x + 10, R.y + 12], [R.x + 10, R.y + 30]]) {
    out.push(L(k.ring(x, y, 6, top, P, 32) + k.ring(x, y, 2, top, P, 16), { tone: "lo" }));
    out.push(L([0, 60, 120, 180, 240, 300].map((a) => { const r = (a * Math.PI) / 180; return k.lineOnTop([x + Math.cos(r) * 2, y + Math.sin(r) * 2], [x + Math.cos(r) * 6, y + Math.sin(r) * 6], top, P); }).join(""), { tone: "faint" }));
  }
  out.push(S(k.cylinder(R.x + 25, R.y + 14, 3.4, top, 1.4, P, 28, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(R.x + 25, R.y + 14, 2.6, top + 1.4, 2.2, P, 28, 0.4), { tone: "hi", crease: "lo" }));
  out.push(D([[R.x + 2, R.y + 2], [R.x + R.w - 2, R.y + 2], [R.x + 2, R.y + R.d - 2], [R.x + R.w - 2, R.y + R.d - 2]].map(([x, y]) => at([x, y, top])), { size: 0.45 }));
  return out.join("");
}

/* ---------- risk light: a stack light whose top lens stays lit ---------- */
function lamp() {
  const { x, y } = LAMP;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 7, y: y - 7, w: 14, d: 14, r: 7 }, 0, 0.1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.cylinder(x, y, 7, 0, 2, P, 40, 0.5), { tone: "lo" }));
  out.push(D([0, 90, 180, 270].map((a) => { const r = ((a + 45) * Math.PI) / 180; return at([x + Math.cos(r) * 5.4, y + Math.sin(r) * 5.4, 2]); }), { size: 0.45 }));
  out.push(S(k.cylinder(x, y, 1.5, 2, 54, P, 20), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, 3, 56, 2, P, 28, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 4.2, 58, 8, P, 36, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 4.2, 66.4, 8, P, 36, 0.3), { tone: "mid" }));
  out.push(`<g class="lamp-on">${S(k.cylinder(x, y, 4.2, 74.8, 9, P, 36, 0.3), { tone: "lit", lit: true, inner: L(k.sideArc(x, y, 4.2, 79.3, P, 24), { tone: "faint" }) })}</g>`);
  out.push(S(k.cylinder(x, y, 4.4, 83.8, 1.6, P, 36, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 2, 85.4, 1.2, P, 20, 0.2), { tone: "mid" }));
  const g = at([x, y, 79.3]);
  return `<ellipse class="lamp-glow" cx="${g[0].toFixed(1)}" cy="${g[1].toFixed(1)}" rx="15" ry="13"/>` + out.join("");
}

/* ---------- inspection gate ---------- */
const POST = { w: 6, d: 5 };
const postPlan = (y) => ({ x: GATE_X - POST.w / 2, y, w: POST.w, d: POST.d, r: 0.8 });
const GATE_TOP = 42;
function gatePost(y) {
  const pl = postPlan(y);
  const out = [S(slab({ ...k.insetPlan(pl, -1.6), r: 1 }, 0, 1.4, 3, 0.3), { tone: "lo" })];
  out.push(S(slab(pl, 1.4, GATE_TOP - 1.4, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(pl, 22, P, 3), { tone: "faint" }) }));
  // sensor window on the face toward the belt (+y face of the back post)
  if (y < 0) out.push(L(rectY(pl.y + pl.d + 0.05, pl.x + 1.4, pl.x + pl.w - 1.4, 16, 30), { tone: "lo" }), D([at([GATE_X, pl.y + pl.d + 0.05, 33])], { size: 0.5, tone: "hi" }));
  else out.push(L(rectX(pl.x + pl.w + 0.05, pl.y + 1, pl.y + pl.d - 1, 16, 30), { tone: "lo" }));
  out.push(D([[pl.x - 0.8, pl.y - 0.8], [pl.x + pl.w + 0.8, pl.y + pl.d + 0.8], [pl.x + pl.w + 0.8, pl.y - 0.8], [pl.x - 0.8, pl.y + pl.d + 0.8]].map(([a, b]) => at([a, b, 1.4])), { size: 0.4 }));
  return out.join("");
}
function gateTop() {
  const bar = { x: GATE_X - 3.6, y: -18.5, w: 7.2, d: 37, r: 1 };
  const out = [S(slab(bar, GATE_TOP, 5, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(bar, GATE_TOP + 2.5, P, 3), { tone: "faint" }) })];
  out.push(D([-16, -13.5, 13.5, 16].map((y) => at([GATE_X, y, GATE_TOP + 5])), { size: 0.45 }));
  // scanner head under the crossbar, its lens on the +x face
  const head = { x: GATE_X - 2.2, y: -9, w: 4.4, d: 18, r: 0.6 };
  out.push(S(slab(head, GATE_TOP - 3, 3, 3, 0.3), { tone: "hi", crease: "lo" }));
  out.push(`<path class="iso-line scan-lens" d="${poly([[head.x + head.w + 0.05, -7.5, GATE_TOP - 1.5], [head.x + head.w + 0.05, 7.5, GATE_TOP - 1.5]])}"/>`);
  return out.join("");
}
function curtain() {
  const zt = GATE_TOP - 3;
  const quad = poly([[GATE_X, -8, zt], [GATE_X, 8, zt], [GATE_X, BELT.half + 0.5, BELT.z + 0.2], [GATE_X, -BELT.half - 0.5, BELT.z + 0.2]], true);
  const a = at([GATE_X, 0, zt]);
  const b = at([GATE_X, 0, BELT.z]);
  return `<g data-scan="" style="opacity:0"><defs><linearGradient id="scan-grad" gradientUnits="userSpaceOnUse" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"><stop offset="0" stop-color="var(--scan)" stop-opacity=".5"/><stop offset="1" stop-color="var(--scan)" stop-opacity=".06"/></linearGradient></defs><path class="scan-sheet" d="${quad}"/><path class="scan-edge" d="${poly([[GATE_X, -BELT.half - 0.5, BELT.z + 0.2], [GATE_X, BELT.half + 0.5, BELT.z + 0.2]])}"/></g>`;
}

/* ---------- pusher (diverter): housing on a pedestal, rod and plate ---------- */
const HOUSING = { x: PUSH_X - 6, y: -25, w: 12, d: 12, r: 1.2 };
const PLATE_T = 1.6;
function pusherBack() {
  const out = [S(slab({ x: HOUSING.x + 1, y: HOUSING.y + 1, w: 10, d: 10, r: 1 }, 0, 9, 3, 0.4), { tone: "lo" })];
  out.push(S(slab(HOUSING, 9, 11, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(HOUSING, 14.5, P, 3), { tone: "faint" }) }));
  out.push(L(rectY(HOUSING.y + HOUSING.d + 0.05, PUSH_X - 2, PUSH_X + 2, 14.6, 18.4), { tone: "lo" }));
  out.push(D([[HOUSING.x + 1.5, HOUSING.y + 1.5], [HOUSING.x + HOUSING.w - 1.5, HOUSING.y + 1.5], [HOUSING.x + 1.5, HOUSING.y + HOUSING.d - 1.5], [HOUSING.x + HOUSING.w - 1.5, HOUSING.y + HOUSING.d - 1.5]].map(([x, y]) => at([x, y, 20])), { size: 0.45 }));
  return out.join("");
}
export const ROD = { z: 16.5, from: HOUSING.y + HOUSING.d };
function pusherMoving() {
  const pl = { x: PUSH_X - 4.6, y: PLATE_REST - PLATE_T, w: 9.2, d: PLATE_T, r: 0.4 };
  const rod = `<path data-rod="" class="iso-line" data-tone="mid" style="stroke-width:1.6" d="${poly([[PUSH_X, ROD.from, ROD.z], [PUSH_X, pl.y, ROD.z]])}"/>`;
  const plate = `<g data-pusher="">${S(slab(pl, BELT.z + 0.6, 6.4, 2, 0.2), { tone: "hi", crease: "lo" })}</g>`;
  return rod + plate;
}

/* ---------- conveyor: the pipeline ---------- */
function belt() {
  const out = [];
  const legs = [];
  for (const x of [BELT.x0 + 6, -48, 12, 40]) for (const y of [-BELT.half + 1, BELT.half - 2.6]) legs.push([x, y]);
  for (const [x, y] of byDepth(legs)) out.push(S(slab({ x: x - 1.2, y, w: 2.6, d: 1.6, r: 0.3 }, 0, BELT.z - 3, 2, 0.2), { tone: "mid", crease: "none" }));
  const bed = { x: BELT.x0, y: -BELT.half, w: BELT.x1 - BELT.x0, d: BELT.half * 2, r: 1 };
  out.push(S(slab(bed, BELT.z - 3, 2.6, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(bed, BELT.z - 1.6, P, 3), { tone: "faint" }) }));
  const surf = { x: bed.x + 0.6, y: bed.y + 0.6, w: bed.w - 1.2, d: bed.d - 1.2, r: 0.6 };
  out.push(S(slab(surf, BELT.z - 0.4, 0.4, 3, 0), { tone: "lo", crease: "none" }));
  const ribs = [];
  for (let x = surf.x + 3; x < surf.x + surf.w - 1; x += 3.4) ribs.push(k.lineOnTop([x, surf.y], [x, surf.y + surf.d], BELT.z, P));
  out.push(`<path class="iso-line belt-ribs" data-tone="faint" d="${ribs.join("")}"/>`);
  // side guide rails with bolts, on both edges
  for (const y of [-BELT.half - 0.8, BELT.half]) {
    const g = { x: bed.x + 2, y, w: bed.w - 4, d: 0.8, r: 0.2 };
    out.push(S(slab(g, BELT.z, 1.4, 2, 0.1), { tone: "mid", crease: "none" }));
  }
  out.push(D([-60, -38, 18, 34].map((x) => at([x, BELT.half + 0.85, BELT.z - 1.6])), { size: 0.45 }));
  return out.join("");
}

/* ---------- packets ---------- */
function packetSvg(kind) {
  const pl = { x: -PACKET.w / 2, y: -PACKET.d / 2, w: PACKET.w, d: PACKET.d, r: 0.6 };
  const z = BELT.z;
  const tape = k.lineOnTop([0, pl.y], [0, pl.y + pl.d], z + PACKET.h, P) + poly([[0, pl.y + pl.d + 0.02, z + PACKET.h], [0, pl.y + pl.d + 0.02, z + 1]]);
  const body = S(slab(pl, z, PACKET.h, 2, 0.4), { tone: kind === "hostile" ? "hi" : "mid", crease: "lo", inner: L(tape, { tone: "faint" }) });
  if (kind !== "hostile") return body;
  // the hostile packet: a dotted seal, and a flag ring that lights when the scanner marks it
  const mark = L(k.ring(0, 0, 2.2, z + PACKET.h, P, 20), { tone: "hi", dotted: true });
  const flag = `<path class="flag-ring" d="${k.ring(0, 0, 2.2, z + PACKET.h, P, 20)}"/>`;
  return body + mark + flag;
}

/* ---------- chute and quarantine bin ---------- */
function chute() {
  const x0 = PUSH_X - 5.2, x1 = PUSH_X + 5.2;
  const y0 = BELT.half + 0.02, y1 = BIN.y + 1.4;
  const z0 = BELT.z - 0.3, z1 = BIN.h + 0.3;
  const th = 1;
  const top = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z1], [x0, y1, z1]];
  const sideX = [[x1, y0, z0], [x1, y1, z1], [x1, y1, z1 - th], [x1, y0, z0 - th]];
  const end = [[x0, y1, z1], [x1, y1, z1], [x1, y1, z1 - th], [x0, y1, z1 - th]];
  const out = [`<g class="iso-solid"><path class="iso-fill" d="${poly([...top, ...end.slice(2)], true)}"/><path class="iso-shade" data-shade="1" d="${poly(sideX, true)}"/><path class="iso-shade" data-shade="2" d="${poly(end, true)}"/><path class="iso-top" d="${poly(top, true)}"/><path class="iso-line iso-edge" data-tone="mid" d="${poly([top[0], top[3], end[3], end[2], sideX[3], top[1]])}"/><path class="iso-line iso-crease" data-tone="faint" d="${poly([top[3], top[2], top[1]])}"/></g>`];
  // low side rails keep the packet on the slope
  for (const x of [x0 + 0.4, x1 - 0.4]) out.push(`<path class="iso-line" data-tone="mid" style="stroke-width:1.1" d="${poly([[x, y0 + 1, z0 + 1.6], [x, y1 - 0.6, z1 + 1.6]])}"/>`, D([at([x, y0 + 1, z0 + 1.6]), at([x, y1 - 0.6, z1 + 1.6])], { size: 0.5, tone: "mid" }));
  return out.join("");
}
const wall = (plan, h = BIN.h) => S(slab(plan, 1.2, h - 1.2, 2, 0.3), { tone: "hi", crease: "lo" });
function binBack() {
  const B = BIN;
  const out = [`<path class="iso-halo" d="${k.haloOf(B, 0, 1, P)}" style="filter:blur(4px)"/>`];
  // lid, hinged open against the back
  out.push(S(slab(B, 0, 1.2, 3, 0.3), { tone: "mid" }));
  out.push(`<path class="iso-shade bin-dark" data-shade="0" d="${poly([[B.x + 1.4, B.y + 1.4, 1.2], [B.x + B.w - 1.4, B.y + 1.4, 1.2], [B.x + B.w - 1.4, B.y + B.d - 1.4, 1.2], [B.x + 1.4, B.y + B.d - 1.4, 1.2]], true)}"/>`);
  out.push(wall({ x: B.x, y: B.y, w: B.w, d: 1.4, r: 0.3 }));
  out.push(wall({ x: B.x, y: B.y, w: 1.4, d: B.d, r: 0.3 }));
  return out.join("");
}
function binFront() {
  const B = BIN;
  const out = [wall({ x: B.x + B.w - 1.4, y: B.y, w: 1.4, d: B.d, r: 0.3 })];
  const fr = { x: B.x, y: B.y + B.d - 1.4, w: B.w, d: 1.4, r: 0.3 };
  const yF = fr.y + fr.d + 0.05;
  const stripes = [];
  for (let i = 0; i < 3; i++) { const x = B.x + 3 + i * 3.2; stripes.push(poly([[x, yF, 3], [x + 1.4, yF, 3], [x + 3.4, yF, 8], [x + 2, yF, 8]], true)); }
  out.push(S(slab(fr, 1.2, B.h - 1.2, 2, 0.3), { tone: "hi", crease: "lo", inner: L(stripes.join(""), { tone: "lo" }) }));
  out.push(L(rectY(yF, B.x + B.w - 6.5, B.x + B.w - 2, 4.5, 8), { tone: "lo" }));
  // lid, hinged open on the near side wall so the chute stays clear
  const lid = { x: B.x + B.w + 0.2, y: B.y + 1, w: 1.2, d: B.d - 2, r: 0.3 };
  out.push(D([at([B.x + B.w - 0.7, B.y + 4, B.h]), at([B.x + B.w - 0.7, B.y + B.d - 4, B.h])], { size: 0.55, tone: "mid" }));
  out.push(S(slab(lid, B.h - 0.4, 13, 2, 0.3), { tone: "mid", inner: L(rectX(lid.x + lid.w + 0.05, lid.y + 4, lid.y + lid.d - 4, B.h + 8, B.h + 10), { tone: "lo" }) }));
  const lightAt = at([B.x + B.w - 4.25, yF, 9.6]);
  out.push(`<circle class="bin-light" cx="${lightAt[0].toFixed(1)}" cy="${lightAt[1].toFixed(1)}" r="1.1"/>`);
  return out.join("");
}

/* ---------- sandbox cage with two AI racks ---------- */
const C = CAGE;
const CZ = 2;
const bars = (pts) => pts.join("");
function cageBack() {
  const out = [S(slab(C, 0, CZ, 4, 0.4), { tone: "lo" })];
  out.push(L(k.planOutline(k.insetPlan(C, 3), CZ, P), { tone: "faint" }));
  out.push(S(slab({ x: C.x, y: C.y, w: 3, d: 3, r: 0.4 }, CZ, C.h - CZ, 2, 0.2), { tone: "mid", crease: "none" }));
  // mesh on the far faces: the -y face, and the -x face behind the belt
  const back = [];
  for (let x = C.x + 5; x < C.x + C.w - 2; x += 5) back.push(poly([[x, C.y + 1.5, CZ], [x, C.y + 1.5, C.h - 3]]));
  for (let y = C.y + 5; y < C.y + C.d - 2; y += 4) {
    if (y > -BELT.half - 2 && y < BELT.half + 2) back.push(poly([[C.x + 1.5, y, BELT.z + 9], [C.x + 1.5, y, C.h - 3]]));
    else if (y < 0) back.push(poly([[C.x + 1.5, y, CZ], [C.x + 1.5, y, C.h - 3]]));
  }
  out.push(L(bars(back), { tone: "faint" }));
  out.push(L(poly([[C.x + 1.5, C.y + 1.5, 34], [C.x + C.w - 1.5, C.y + 1.5, 34]]) + poly([[C.x + 1.5, C.y + 1.5, 34], [C.x + 1.5, -BELT.half - 2, 34]]), { tone: "lo" }));
  // the belt's portal through the -x face
  out.push(L(poly([[C.x + 1.5, -BELT.half - 2, CZ], [C.x + 1.5, -BELT.half - 2, BELT.z + 9], [C.x + 1.5, BELT.half + 2, BELT.z + 9], [C.x + 1.5, BELT.half + 2, CZ]]), { tone: "lo" }));
  return out.join("");
}
function rack(R, i) {
  const out = [`<path class="iso-halo" d="${k.haloOf(R, CZ, 1, P)}" style="filter:blur(4px)"/>`];
  const seams = [];
  for (let z = CZ + 7; z < CZ + R.h - 3; z += 7) seams.push(k.sideSeam(R, z, P, 3));
  out.push(S(slab(R, CZ, R.h, 3, 0.6), { tone: "hi", crease: "lo", inner: L(seams.join(""), { tone: "faint" }) }));
  const yF = R.y + R.d + 0.05;
  const vents = [];
  const leds = [];
  for (let z = CZ + 7, u = 0; z < CZ + R.h - 3; z += 7, u++) {
    vents.push(rectY(yF, R.x + 3, R.x + 13, z - 4.6, z - 2.6));
    leds.push(at([R.x + R.w - 6, yF, z - 3.6]), at([R.x + R.w - 3.6, yF, z - 3.6]));
  }
  out.push(L(vents.join(""), { tone: "lo" }));
  out.push(`<g data-rack-leds="${i}">${D(leds, { size: 0.5, tone: "hi" })}</g>`);
  // roof: a fan grille
  const top = CZ + R.h;
  const c = [R.x + R.w / 2, R.y + R.d / 2];
  out.push(L(k.ring(c[0], c[1], 7, top, P, 36) + k.ring(c[0], c[1], 4.4, top, P, 28) + k.ring(c[0], c[1], 1.6, top, P, 16), { tone: "lo" }));
  out.push(D([[R.x + 2, R.y + 2], [R.x + R.w - 2, R.y + 2], [R.x + 2, R.y + R.d - 2], [R.x + R.w - 2, R.y + R.d - 2]].map(([x, y]) => at([x, y, top])), { size: 0.45 }));
  return out.join("");
}
function cageFront() {
  const out = [];
  const near = [];
  for (let y = C.y + 5; y < C.y + C.d - 2; y += 4) if (y > BELT.half + 1) near.push(poly([[C.x + 1.5, y, CZ], [C.x + 1.5, y, C.h - 3]]));
  out.push(L(bars(near), { tone: "faint" }));
  out.push(L(poly([[C.x + 1.5, BELT.half + 2, 34], [C.x + 1.5, C.y + C.d - 1.5, 34]]), { tone: "lo" }));
  const posts = byDepth([[C.x, C.y + C.d - 3], [C.x + C.w - 3, C.y], [C.x + C.w - 3, C.y + C.d - 3]]);
  // mesh on the near faces (+y and +x) with a door on the +y face
  const doorX0 = C.x + 12, doorX1 = C.x + 36;
  const front = [];
  for (let x = C.x + 5; x < C.x + C.w - 2; x += 5) front.push(poly([[x, C.y + C.d - 1.5, CZ], [x, C.y + C.d - 1.5, C.h - 3]]));
  const side = [];
  for (let y = C.y + 5; y < C.y + C.d - 2; y += 4) side.push(poly([[C.x + C.w - 1.5, y, CZ], [C.x + C.w - 1.5, y, C.h - 3]]));
  out.push(L(bars(side), { tone: "lo" }));
  out.push(L(poly([[C.x + C.w - 1.5, C.y + 1.5, 34], [C.x + C.w - 1.5, C.y + C.d - 1.5, 34]]), { tone: "mid" }));
  out.push(S(slab({ x: C.x + C.w - 3, y: C.y, w: 3, d: 3, r: 0.4 }, CZ, C.h - CZ, 2, 0.2), { tone: "mid", crease: "none" }));
  out.push(L(bars(front), { tone: "lo" }));
  out.push(L(poly([[C.x + 1.5, C.y + C.d - 1.5, 34], [doorX0, C.y + C.d - 1.5, 34]]) + poly([[doorX1, C.y + C.d - 1.5, 34], [C.x + C.w - 1.5, C.y + C.d - 1.5, 34]]), { tone: "mid" }));
  const yD = C.y + C.d - 1.2;
  out.push(L(poly([[doorX0, yD, CZ + 1], [doorX0, yD, C.h - 6], [doorX1, yD, C.h - 6], [doorX1, yD, CZ + 1]], true), { tone: "mid" }));
  out.push(L(poly([[doorX0, yD, 34], [doorX1, yD, 34]]), { tone: "mid" }));
  out.push(D([at([doorX0, yD, 12]), at([doorX0, yD, 52])], { size: 0.6, tone: "mid" }));
  // padlock on the door's latch
  const lk = { x: doorX1 - 4.6, y: yD + 0.1, w: 3.6, d: 1.4, r: 0.3 };
  out.push(L(poly([[lk.x + 0.7, lk.y + 0.7, 33], [lk.x + 0.7, lk.y + 0.7, 35.4], [lk.x + 2.9, lk.y + 0.7, 35.4], [lk.x + 2.9, lk.y + 0.7, 33]]), { tone: "hi" }));
  out.push(S(slab(lk, 29.6, 3.4, 2, 0.2), { tone: "hi", crease: "lo" }));
  out.push(D([at([lk.x + 1.8, lk.y + lk.d + 0.05, 31])], { size: 0.4, tone: "hi" }));
  for (const [x, y] of posts) if (!(x === C.x + C.w - 3 && y === C.y)) out.push(S(slab({ x, y, w: 3, d: 3, r: 0.4 }, CZ, C.h - CZ, 2, 0.2), { tone: "mid", crease: "none" }));
  // top frame
  out.push(S(slab({ x: C.x, y: C.y, w: C.w, d: 3, r: 0.4 }, C.h - 3, 3, 2, 0.2), { tone: "mid" }));
  out.push(S(slab({ x: C.x, y: C.y, w: 3, d: C.d, r: 0.4 }, C.h - 3, 3, 2, 0.2), { tone: "mid" }));
  out.push(S(slab({ x: C.x + C.w - 3, y: C.y, w: 3, d: C.d, r: 0.4 }, C.h - 3, 3, 2, 0.2), { tone: "mid" }));
  out.push(S(slab({ x: C.x, y: C.y + C.d - 3, w: C.w, d: 3, r: 0.4 }, C.h - 3, 3, 2, 0.2), { tone: "mid" }));
  out.push(D(k.corners(C, 1.5).map(([x, y]) => at([x, y, C.h])), { size: 0.5 }));
  return out.join("");
}

/* ---------- assemble ---------- */
const hit = (name, body) => `<g data-hit="${name}">${body}</g>`;
const packets = Array.from({ length: 5 }, (_, i) => `<g data-packet="${i}" style="opacity:0">${packetSvg("clean")}</g>`).join("");
const hostile = `<g data-hostile="" style="opacity:0">${packetSvg("hostile")}</g>`;

const layers = (where, hostileOpen = `<g data-hostile="" style="opacity:0">`) => {
  const h = `${hostileOpen}${packetSvg("hostile")}</g>`;
  return [
    plinth(),
    cables(),
    hit("router", router()),
    hit("racks", cageBack()),
    hit("lamp", lamp()),
    hit("gate", gatePost(-17)),
    hit("bin", pusherBack() + pusherMoving()),
    hit("belt", belt()),
    `<g data-layer="belt">${packets}${where === "belt" ? h : ""}</g>`,
    curtain(),
    hit("gate", gatePost(12) + gateTop()),
    hit("bin", chute() + binBack()),
    `<g data-layer="bin">${where === "bin" ? h : ""}</g>`,
    hit("bin", binFront()),
    hit("racks", RACKS.map(rack).join("") + cageFront()),
  ];
};
const body = layers("belt");
void hostile;

const LABEL = "Scale model of a 5G core site on a plinth: a signal router feeds a conveyor of packets through an inspection gate; clean packets reach two AI racks inside a sandbox cage, a pusher sends a hostile packet down a chute into a quarantine bin, and a stack light stays lit green.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

const AX = k.axisVector(P, [1, 0, 0]);
const AY = k.axisVector(P, [0, 1, 0]);
const AZ = k.axisVector(P, [0, 0, 1]);
const round = (v) => v.map((n) => Math.round(n * 10000) / 10000);
writeFileSync(join(HERE, "art.js"), `// Generated by build.mjs. Do not edit by hand.\nexport const AXES = ${JSON.stringify([round(AX), round(AY), round(AZ)])};\nexport const ROD = ${JSON.stringify({ ...ROD, x: PUSH_X, plateT: PLATE_T, origin: round(at([PUSH_X, 0, ROD.z])) })};\nexport const SVG = ${JSON.stringify(svg)};\n`);

/* ---------- CSS: kit styles with the site palette ---------- */
const kitRules = k.ISO_CSS.slice(k.ISO_CSS.indexOf(".iso-svg{")).replace(/\.iso-figure\{[\s\S]*$/, "");
const LIGHT = `--anatomy-page:#f3f5f8;--anatomy-card:#ffffff;--anatomy-text:#3b4a5c;--anatomy-strong:#0d1b2a;--anatomy-muted:#6b7c8f;
  --anatomy-paper:#ffffff;--anatomy-face:#ffffff;--anatomy-top:#ffffff;
  --anatomy-shade-0:#d6dee7;--anatomy-shade-1:#e1e7ee;--anatomy-shade-2:#eaeff4;--anatomy-shade-3:#f3f6f9;
  --anatomy-lit-top:#ffffff;--anatomy-lit-shade:#e4f0f3;
  --anatomy-hi:#0d1b2a;--anatomy-mid:#6a7d91;--anatomy-lo:#a8b6c4;--anatomy-faint:#d3dbe4;--anatomy-lit:#00708a;
  --anatomy-halo:#1a5276;--anatomy-halo-opacity:.2;--anatomy-dot:#0d1b2a;
  --scan:#00D9FF;--lamp:#00708a;--lamp-glow:#00D9FF;--hl:#00708a`;
const DARK = `--anatomy-page:#0a1420;--anatomy-card:#111f2e;--anatomy-text:#c3cfdb;--anatomy-strong:#eaf0f6;--anatomy-muted:#9aabbf;
  --anatomy-paper:#111f2e;--anatomy-face:#17293c;--anatomy-top:#1b2e43;
  --anatomy-shade-0:#0b1622;--anatomy-shade-1:#0e1a28;--anatomy-shade-2:#11202f;--anatomy-shade-3:#142537;
  --anatomy-lit-top:#20364c;--anatomy-lit-shade:#182b3f;
  --anatomy-hi:#dce6f0;--anatomy-mid:#6f849a;--anatomy-lo:#3f5368;--anatomy-faint:#26384b;--anatomy-lit:#00D9FF;
  --anatomy-halo:#02060b;--anatomy-halo-opacity:.8;--anatomy-dot:#eaf0f6;
  --scan:#00D9FF;--lamp:#00D9FF;--lamp-glow:#00D9FF;--hl:#00D9FF`;
const FIG_CSS = `
/* AI-security figure (site palette); kit rules below are from iso-kit.mjs, MIT, (c) 2026 Ryan */
.iso{${LIGHT};--anatomy-weight:.6px;--anatomy-ease:cubic-bezier(.32,.72,0,1);--anatomy-mono:"Instrument Sans",ui-sans-serif,system-ui,sans-serif}
:root[data-theme="dark"] .iso{${DARK}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .iso{${DARK}}}
.sc-long .stg-h{font-size:clamp(30px,3.3vw,46px);line-height:1.04}
.sc-long .stg-h small{font-size:.42em}
@media (max-width:639px){.sc-long .stg-h{font-size:30px}}
.iso-face-text{font-family:"Instrument Sans",ui-sans-serif,system-ui,sans-serif;font-weight:600;letter-spacing:.08em}
.scan-sheet{fill:url(#scan-grad);stroke:none}
.scan-edge{fill:none;stroke:var(--scan);stroke-width:1.2;stroke-linecap:round}
.scan-lens{fill:none;stroke:var(--scan);stroke-width:1.4;stroke-linecap:round}
.flag-ring{fill:none;stroke:var(--anatomy-lit);stroke-width:1.3;opacity:0;transition:opacity .25s}
[data-hostile][data-flag] .flag-ring{opacity:1}
.lamp-on .iso-solid[data-lit]>.iso-fill,.lamp-on .iso-solid[data-lit]>.iso-top{fill:color-mix(in srgb,var(--lamp) 40%,var(--anatomy-paper))}
.lamp-on .iso-solid[data-lit]>.iso-shade{fill:color-mix(in srgb,var(--lamp) 58%,var(--anatomy-paper))}
.lamp-on .iso-solid[data-lit]>.iso-edge{stroke:var(--lamp)}
.lamp-glow{fill:var(--lamp-glow);opacity:.22;filter:blur(6px)}
.bin-light{fill:var(--anatomy-faint);transition:fill .3s}
[data-caught] .bin-light{fill:var(--scan)}
.bin-dark{fill:var(--anatomy-shade-0)}
[data-hit]{cursor:pointer}
[data-hit][data-on] .iso-edge,[data-hit][data-on] .iso-crease,[data-hit][data-on] .iso-bevel,[data-hit][data-on] .iso-line[data-tone="mid"],[data-hit][data-on] .iso-line[data-tone="hi"]{stroke:var(--hl);transition:stroke .3s}
[data-hit][data-on] .iso-top{fill:color-mix(in srgb,var(--hl) 12%,var(--anatomy-top))}
[data-hit][data-on] .iso-shade:not(.bin-dark){fill:color-mix(in srgb,var(--hl) 10%,var(--anatomy-shade-2))}
[data-hit][data-on] .iso-dots circle{fill:var(--hl);opacity:.95}
[data-hit][data-on] .iso-wire-end{stroke:var(--hl)}
.iso-svg[data-ink] .iso-fill,.iso-svg[data-ink] .iso-shade,.iso-svg[data-ink] .iso-top,.iso-svg[data-ink] .iso-halo,.iso-svg[data-ink] .iso-dots,.iso-svg[data-ink] .iso-face-text,.iso-svg[data-ink] .lamp-glow,.iso-svg[data-ink] [data-scan],.iso-svg[data-ink] [data-layer],.iso-svg[data-ink] .iso-wire-end,.iso-svg[data-ink] .bin-light{opacity:0}
.iso-svg[data-ink] .iso-line{stroke-dasharray:1 1;stroke-dashoffset:1}
.iso-svg[data-inking] .iso-line{transition:stroke-dashoffset 1.5s cubic-bezier(.45,.05,.25,1)}
.iso-svg[data-filling] .iso-fill,.iso-svg[data-filling] .iso-shade,.iso-svg[data-filling] .iso-top,.iso-svg[data-filling] .iso-dots,.iso-svg[data-filling] .iso-face-text,.iso-svg[data-filling] .lamp-glow,.iso-svg[data-filling] [data-layer],.iso-svg[data-filling] .iso-wire-end,.iso-svg[data-filling] .bin-light{transition:opacity .7s ease}
.iso-svg[data-filling] .iso-halo{transition:opacity .9s ease}
`;
writeFileSync(join(HERE, "scene.css"), FIG_CSS + kitRules + "\n");

/* ---------- poster: a still pose, light by default, dark via poster.svg#dark ---------- */
function posterOf() {
  const tr = (o) => k.translateAlong(P, [o.x, o.y, o.z]);
  const h = hostileAt(HOSTILE_DONE + 1);
  let s = k.figureSvg({ width: W, height: H, label: LABEL, body: layers("bin", `<g data-hostile="" data-flag="" transform="${tr(h)}">`) });
  // clean packets spaced along the belt, one under the scanner
  [10, 32, 54, 78, 100].forEach((v, i) => { s = s.replace(`<g data-packet="${i}" style="opacity:0">`, `<g data-packet="${i}" transform="${tr(cleanAt(v))}">`); });
  s = s.replace('<g data-scan="" style="opacity:0">', '<g data-scan="" style="opacity:.75">').replace('<g data-hit="bin"><g class="iso-solid">', '<g data-hit="bin" data-caught=""><g class="iso-solid">');
  const css = FIG_CSS.replace(/:root\[data-theme="dark"\] \.iso\{/, ".iso:has(#dark:target){").replace(/@media \(prefers-color-scheme:dark\)\{[^\n]*\n/, "") + kitRules + ".iso{background:var(--anatomy-card)}";
  s = s.replace('class="iso-svg"', 'class="iso-svg iso"').replace(/^<svg([^>]*)>/, `<svg$1><style>${css.replace(/\n/g, "")}</style><g id="dark"/><rect width="100%" height="100%" fill="var(--anatomy-card)"/>`);
  return s;
}
writeFileSync(join(HERE, "poster.svg"), posterOf());
console.log("wrote art.js, scene.css, poster.svg", JSON.stringify(P));
