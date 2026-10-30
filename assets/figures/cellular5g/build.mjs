// Build the 5G core and RAN scale model: node build.mjs
// Writes art.js (static SVG, overlay SVG and screen-space routes for live.js), core.css and poster.svg.
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan).
//
// Truth notes (sources in content.js): the drawn nodes and reference points follow 3GPP TS 23.501 V20.3.0
// clause 4.2.3 (non-roaming architecture), 4.2.6 (service-based interfaces) and 4.2.7 (reference points),
// and TS 38.300 V19.4.0 clause 4.1 (gNBs joined by Xn, NG-C to the AMF, NG-U to the UPF).
// Conduits are a teaching device: N1, N2, N3 and Xn are logical interfaces, not separate cables.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../cellular/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 760, H = 500;

/* ---------- world layout (x along the road, y toward the viewer, z up) ---------- */
const BOARD = { x: 0, y: 0, w: 330, d: 216, r: 8 };
const DECK = { x: 12, y: 10, w: 252, d: 78, r: 3 };
const DZ = 5; // deck top
const NFW = 30, NFD = 18, NFTOP = 28;
const BACK = { nssf: 20, nrf: 62, ausf: 104, udm: 146, pcf: 188 }; // x0, row y 16..34
const FRONT = { amf: 34, smf: 112, upf: 222 }; // x0, row y 60..78
const BY0 = 16, FY0 = 60;
const BUS = { x: 16, y: 44, w: 198, d: 5 }; // busbar, z 10..14
const BUS_Z0 = 10, BUS_Z1 = 14;
const DNP = { x: 274, y: 26, w: 44, d: 52, r: 2 }; // data network plinth
const DNT = { x: 281, y: 33, w: 30, d: 38, r: 1.2 }; // data network tower
const DN_TOP = 46;
const SITES = [100, 194, 276]; // gNB cabinet x0 (masts sit in the screen gaps between core units)
const CAB_Y = 128, CAB_W = 16, CAB_D = 14, CAB_TOP = 22;
const MAST_DX = 24, MAST_Y = 128, MAST_TOP = 52;
const TRAY_Y = 94, TRAY_Z = 18; // N2 cable tray (control plane, overhead)
const DUCT_Y = 100; // N3 duct (user plane, on the floor)
const XN_Y = 137;
const WALK = { x: 4, y: 158, w: 322, d: 15, r: 1.5 };
const ROAD = { x: 4, y: 177, w: 322, d: 27, r: 2 };
const LANE_Y = 190.5;
const UES = [[146, 163.5], [262, 163.5]]; // static phones on the walk
const CAR_X0 = 0; // the car is built at x = 0 and moved along x at run time

const amfC = FRONT.amf + NFW / 2, smfC = FRONT.smf + NFW / 2, upfC = FRONT.upf + NFW / 2;
const centreX = (key) => (BACK[key] ?? FRONT[key]) + NFW / 2;

const extremes = [...k.boxCorners(BOARD, -17, 0), [DNT.x, DNT.y, DN_TOP], [DNT.x + DNT.w, DNT.y, DN_TOP]];
for (const X of SITES) extremes.push([X + MAST_DX, MAST_Y, MAST_TOP + 10]);
for (const x of [6, 324]) extremes.push([x, LANE_Y, 22]);
for (const x0 of Object.values(BACK)) extremes.push([x0, BY0, NFTOP + 2]);
const P = k.fitProjection(extremes, W, H, { pad: 10, azimuth: 58, elevation: 42 });
const VIEW = k.towardViewer(P);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const poly = (pts, closed = false) => k.pathOf(pts.map(at), closed);
const slab = (plan, z, h, bevel = 0.3, steps = 3) => k.slabOf({ r: 0.6, ...plan }, z, h, P, steps, bevel);
const r1 = (v) => Math.round(v * 10) / 10;
const scr = (pts) => pts.map((p) => at(p).map(r1));

// text on a +y face (front), a +x face (right) or a top
const front = (x, y, z) => k.sideMatrix([x, y], z, P, "left");
const right = (x, y, z) => k.sideMatrix([x, y], z, P, "right");
const ftext = (x, y, z, text, size, tone = "hi", anchor = "middle") => k.faceTextSvg(front(x, y + 0.03, z), text, { size, tone, anchor });
const rtext = (x, y, z, text, size, tone = "hi", anchor = "middle") => k.faceTextSvg(right(x + 0.03, y, z), text, { size, tone, anchor });
const ttext = (x, y, z, text, size, tone = "mid", anchor = "middle") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor });

/* ---------- board ---------- */
function board() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BOARD, -17, 17, P)}"/>`];
  for (const [x, y] of k.corners(BOARD, 24).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(k.cylinder(x, y, 8, -17, 1.8, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6, -15.2, 3.2, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BOARD, -12, 12, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BOARD, 4), 0, P), { tone: "lo" }));
  const screws = k.corners(BOARD, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front edge, ticks every 5 units with a major every 25
  const strip = { x: 24, y: BOARD.d - 9, w: 282, d: 5, r: 0.8 };
  out.push(S(k.slabOf(strip, 0, 0.5, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 5, 5, strip.y + 0.6, 0.5, [1.6, 3], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  return out.join("");
}

/* ---------- core deck ---------- */
function deck() {
  const out = [];
  out.push(S(k.slabOf(DECK, 0, DZ, P, 6, 0.6), { tone: "mid", inner: L(k.sideSeam(DECK, 1.6, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(DECK, 3), DZ, P), { tone: "faint" }));
  // floor tiles of a raised data-centre floor
  const tiles = [];
  for (let x = DECK.x + 3 + 24; x < DECK.x + DECK.w - 4; x += 24) tiles.push(k.lineOnTop([x, DECK.y + 3], [x, DECK.y + DECK.d - 3], DZ, P));
  for (let y = DECK.y + 3 + 24; y < DECK.y + DECK.d - 4; y += 24) tiles.push(k.lineOnTop([DECK.x + 3, y], [DECK.x + DECK.w - 3, y], DZ, P));
  out.push(L(tiles.join(""), { tone: "faint" }));
  out.push(ftext(DECK.x + 6, DECK.y + DECK.d, 2.4, "5GC", 2.6, "mid", "start"));
  out.push(D(k.corners(DECK, 6).map(([x, y]) => at([x, y, DZ])), { size: 0.42 }));
  return out.join("");
}

/* ---------- a network function: a three-unit server on a plinth ---------- */
function nfUnit(key, x0, y0, name) {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: x0 - 1, y: y0 - 1, w: NFW + 2, d: NFD + 2, r: 1 }, DZ, 1, P)}" fill-opacity=".5"/>`);
  out.push(S(slab({ x: x0 - 1.2, y: y0 - 1.2, w: NFW + 2.4, d: NFD + 2.4, r: 1 }, DZ, 1.6, 0.3), { tone: "lo" }));
  const units = [[DZ + 1.6, 6.4], [DZ + 8.4, 6.4], [DZ + 15.2, 7.4]];
  const yF = y0 + NFD;
  const xR = x0 + NFW;
  units.forEach(([z, h], i) => {
    const inner = [];
    // bezel on the front, vent slots, two drive bays and status LEDs
    inner.push(L(poly([[x0 + 1, yF + 0.02, z + 1], [xR - 1, yF + 0.02, z + 1], [xR - 1, yF + 0.02, z + h - 1], [x0 + 1, yF + 0.02, z + h - 1]], true), { tone: "faint" }));
    if (i < 2) {
      const slots = [];
      for (let s = 0; s < 6; s++) { const x = x0 + 3 + s * 2.2; slots.push(poly([[x, yF + 0.03, z + 2], [x + 1, yF + 0.03, z + 2], [x + 1, yF + 0.03, z + h - 2], [x, yF + 0.03, z + h - 2]], true)); }
      inner.push(L(slots.join(""), { tone: "lo" }));
      inner.push(L(poly([[x0 + 17, yF + 0.03, z + 2.2], [x0 + 24, yF + 0.03, z + 2.2], [x0 + 24, yF + 0.03, z + h - 2.2], [x0 + 17, yF + 0.03, z + h - 2.2]], true), { tone: "lo" }));
    }
    // side vents on the +x face: closed slots
    const side = [];
    for (let s = 0; s < 4; s++) { const y = y0 + 3 + s * 3.4; side.push(poly([[xR + 0.03, y, z + 1.6], [xR + 0.03, y + 1.6, z + 1.6], [xR + 0.03, y + 1.6, z + h - 1.6], [xR + 0.03, y, z + h - 1.6]], true)); }
    inner.push(L(side.join(""), { tone: "lo" }));
    out.push(S(slab({ x: x0, y: y0, w: NFW, d: NFD, r: 0.6 }, z, h, 0.35), { tone: "hi", crease: "lo", inner: inner.join("") }));
    out.push(`<g class="c5-led">${D([at([xR - 3.4, yF + 0.05, z + h / 2]), at([xR - 2, yF + 0.05, z + h / 2])], { size: 0.62, tone: "hi" })}</g>`);
  });
  out.push(ftext(x0 + 12, yF, DZ + 15.2 + 1.9, name, 5.4, "hi"));
  out.push(D([[x0 + 1.6, y0 + 1.6], [xR - 1.6, y0 + 1.6], [x0 + 1.6, yF - 1.6], [xR - 1.6, yF - 1.6]].map(([x, y]) => at([x, y, NFTOP])), { size: 0.42 }));
  out.push(L(k.lineOnTop([x0 + 4, y0 + 5], [x0 + 14, y0 + 5], NFTOP, P) + k.lineOnTop([x0 + 4, y0 + 7.4], [x0 + 11, y0 + 7.4], NFTOP, P), { tone: "faint", free: true }));
  return `<g data-hit="${key}">${out.join("")}</g>`;
}

/* ---------- conduits ---------- */
// An axis-aligned world polyline drawn as square duct pieces, nearest piece last.
function duct(pts, w, h, tone = "mid") {
  const pieces = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    if (a[0] === b[0] && a[1] === b[1]) {
      pieces.push({ d: k.depthOf([a[0], a[1], Math.min(a[2], b[2])], P), s: slab({ x: a[0] - w / 2, y: a[1] - w / 2, w, d: w, r: 0.3 }, Math.min(a[2], b[2]) - h, Math.abs(b[2] - a[2]) + h, 0.15, 2) });
    } else {
      const x0 = Math.min(a[0], b[0]) - (a[0] === b[0] ? w / 2 : 0), x1 = Math.max(a[0], b[0]) + (a[0] === b[0] ? w / 2 : 0);
      const y0 = Math.min(a[1], b[1]) - (a[1] === b[1] ? w / 2 : 0), y1 = Math.max(a[1], b[1]) + (a[1] === b[1] ? w / 2 : 0);
      pieces.push({ d: k.depthOf([(x0 + x1) / 2, (y0 + y1) / 2, a[2]], P), s: slab({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: 0.3 }, a[2] - h, h, 0.15, 2) });
    }
  }
  return pieces.map((p) => S(p.s, { tone, crease: "lo" })).join("");
}
const flow = (pts, plane) => `<path class="c5-flow" data-plane="${plane}" d="${poly(pts)}"/>`;

// routes: the centreline on top of each conduit, in world units; exported in screen space
const R = {};
const N2Z = TRAY_Z + 1.2;
SITES.forEach((X, i) => {
  R[`n2:${i}`] = [[X + 4, CAB_Y, N2Z], [X + 4, TRAY_Y, N2Z], [amfC, TRAY_Y, N2Z], [amfC, FY0 + NFD, N2Z]];
  R[`n3:${i}`] = [[upfC, FY0 + NFD, DZ + 2.2], [upfC, DECK.y + DECK.d + 0.6, DZ + 2.2], [upfC, DECK.y + DECK.d + 0.6, 2.2], [upfC, DUCT_Y, 2.2], [X + 11, DUCT_Y, 2.2], [X + 11, CAB_Y, 2.2]];
  R[`mast:${i}`] = [[X + 8, CAB_Y + CAB_D / 2, CAB_TOP + 1], [X + MAST_DX, MAST_Y + 2.6, 30], [X + MAST_DX, MAST_Y + 6.6, 44]];
});
R["xn:0-1"] = [[SITES[0] + CAB_W, XN_Y, 2.2], [SITES[1], XN_Y, 2.2]];
R["xn:1-2"] = [[SITES[1] + CAB_W, XN_Y, 2.2], [SITES[2], XN_Y, 2.2]];
R.n4 = [[FRONT.smf + NFW, 69, 16.6], [FRONT.upf, 69, 16.6]];
R.n6 = [[FRONT.upf + NFW, 69, 18.6], [DNT.x, 69, 18.6]];
const BUS_TOP = [BUS.y + BUS.d / 2, BUS_Z1 + 0.2];
for (const key of Object.keys(BACK)) R[`stub:${key}`] = [[centreX(key), BY0 + NFD, 12.8], [centreX(key), BUS_TOP[0], BUS_TOP[1]]];
for (const key of ["amf", "smf"]) R[`stub:${key}`] = [[centreX(key), FY0, 12.8], [centreX(key), BUS_TOP[0], BUS_TOP[1]]];

function n3Floor() {
  // the floor part of the N3 duct: risers from each cabinet, the run along the front of the deck, the climb at the UPF
  const out = [];
  const run = [[SITES[0] + 11, DUCT_Y, 2.2], [SITES[2] + 11, DUCT_Y, 2.2]];
  out.push(duct([[upfC, DECK.y + DECK.d + 0.6, DZ + 2.2], [upfC, DECK.y + DECK.d + 0.6, 2.2], [upfC, DUCT_Y, 2.2]], 3.2, 2.2, "mid"));
  out.push(duct(run, 3.2, 2.2, "mid"));
  SITES.forEach((X) => out.push(duct([[X + 11, DUCT_Y, 2.2], [X + 11, CAB_Y, 2.2]], 3.2, 2.2, "mid")));
  const lines = [flow(run, "up"), flow([[upfC, DECK.y + DECK.d + 0.6, 2.2], [upfC, DUCT_Y, 2.2]], "up")];
  SITES.forEach((X, i) => lines.push(`<path class="c5-flow" data-plane="up" data-leg="${i}" d="${poly([[X + 11, DUCT_Y, 2.2], [X + 11, CAB_Y, 2.2]])}"/>`));
  out.push(lines.join(""));
  // couplers on the run
  const cpl = [];
  for (let x = SITES[0] + 30; x < SITES[2]; x += 36) cpl.push(slab({ x: x - 0.8, y: DUCT_Y - 2.1, w: 1.6, d: 4.2, r: 0.2 }, 0, 2.6, 0.1, 2));
  out.push(cpl.map((c) => S(c, { tone: "lo", crease: "none" })).join(""));
  return `<g data-hit="n3">${out.join("")}</g>`;
}
function n3Deck() {
  return `<g data-hit="n3">${duct([[upfC, FY0 + NFD, DZ + 2.2], [upfC, DECK.y + DECK.d + 0.6, DZ + 2.2]], 3.2, 2.2, "mid")}${flow([[upfC, FY0 + NFD, DZ + 2.2], [upfC, DECK.y + DECK.d + 0.6, DZ + 2.2]], "up")}</g>`;
}
function n2Tray() {
  // overhead cable tray on posts: risers from the cabinets, a run along the deck front, a drop to the AMF
  const out = [];
  const trayAt = (pts) => duct(pts, 4, 1.2, "mid");
  const posts = [];
  for (const x of [amfC, 90, 135, 180, 225]) posts.push([x, TRAY_Y]);
  SITES.forEach((X) => posts.push([X + 4, CAB_Y - 9]));
  for (const [x, y] of posts.sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    const z0 = y < DECK.y + DECK.d ? DZ : 0;
    out.push(S(k.cylinder(x, y, 0.8, z0, TRAY_Z - 1.2 - z0, P, 10), { tone: "mid", crease: "none" }));
  }
  out.push(trayAt([[amfC, FY0 + NFD, TRAY_Z], [amfC, TRAY_Y, TRAY_Z]]));
  out.push(trayAt([[amfC, TRAY_Y, TRAY_Z], [SITES[2] + 4, TRAY_Y, TRAY_Z]]));
  SITES.forEach((X) => out.push(trayAt([[X + 4, TRAY_Y, TRAY_Z], [X + 4, CAB_Y, TRAY_Z]])));
  // rungs across the run
  const rungs = [];
  for (let x = amfC + 4; x < SITES[2] + 2; x += 5) rungs.push(k.lineOnTop([x, TRAY_Y - 1.8], [x, TRAY_Y + 1.8], TRAY_Z, P));
  out.push(L(rungs.join(""), { tone: "faint" }));
  out.push(flow([[amfC, FY0 + NFD, N2Z - 1.2], [amfC, TRAY_Y, N2Z - 1.2], [SITES[2] + 4, TRAY_Y, N2Z - 1.2]], "cp"));
  SITES.forEach((X, i) => out.push(`<path class="c5-flow" data-plane="cp" data-leg="${i}" d="${poly([[X + 4, TRAY_Y, N2Z - 1.2], [X + 4, CAB_Y, N2Z - 1.2]])}"/>`));
  return `<g data-hit="n2">${out.join("")}</g>`;
}
function bus() {
  const out = [];
  // back stubs (Nnssf, Nnrf, Nausf, Nudm, Npcf) from each unit's front to the bus
  for (const key of Object.keys(BACK)) out.push(`<g data-hit="sbi">${duct([[centreX(key), BY0 + NFD, 12.8], [centreX(key), BUS.y, 12.8]], 2.4, 1.6, "mid")}</g>`);
  const posts = [BUS.x + 6, BUS.x + 66, BUS.x + 132, BUS.x + BUS.w - 6];
  const inner = [L(k.sideSeam({ x: BUS.x, y: BUS.y, w: BUS.w, d: BUS.d, r: 0.6 }, BUS_Z0 + 2, P, 3), { tone: "faint" })];
  const parts = [];
  for (const x of posts) parts.push(S(slab({ x: x - 1.2, y: BUS.y + 0.8, w: 2.4, d: BUS.d - 1.6, r: 0.3 }, DZ, BUS_Z0 - DZ, 0.1, 2), { tone: "mid", crease: "none" }));
  parts.push(S(slab({ ...BUS, r: 0.6 }, BUS_Z0, BUS_Z1 - BUS_Z0, 0.3), { tone: "hi", crease: "lo", inner: inner.join("") }));
  parts.push(rtext(BUS.x + BUS.w, BUS.y + BUS.d / 2, BUS_Z0 + 1.2, "SBI", 2.6, "mid"));
  parts.push(ftext(BUS.x + 4, BUS.y + BUS.d, BUS_Z0 + 1.1, "SBI", 2.6, "mid", "start"));
  parts.push(flow([[BUS.x + 1, BUS_TOP[0], BUS_TOP[1] - 0.2], [BUS.x + BUS.w - 1, BUS_TOP[0], BUS_TOP[1] - 0.2]], "cp"));
  parts.push(D([BUS.x + 2, BUS.x + BUS.w - 2].map((x) => at([x, BUS_TOP[0], BUS_Z1])), { size: 0.45 }));
  out.push(`<g data-hit="sbi">${parts.join("")}</g>`);
  for (const key of ["amf", "smf"]) out.push(`<g data-hit="sbi">${duct([[centreX(key), BUS.y + BUS.d, 12.8], [centreX(key), FY0, 12.8]], 2.4, 1.6, "mid")}</g>`);
  return out.join("");
}
function n4() {
  const pts = [[FRONT.smf + NFW, 69, 16.6], [FRONT.upf, 69, 16.6]];
  const mid = (FRONT.smf + NFW + FRONT.upf) / 2;
  const post = S(slab({ x: mid - 1, y: 68, w: 2, d: 2, r: 0.3 }, DZ, 16.6 - 2 - DZ, 0.1, 2), { tone: "mid", crease: "none" });
  return `<g data-hit="n4">${post}${duct(pts, 2.6, 2, "mid")}${flow(pts, "cp")}</g>`;
}
function n6() {
  const pts = [[FRONT.upf + NFW, 69, 18.6], [DNT.x, 69, 18.6]];
  const post = S(k.cylinder(269, 69, 0.9, 0, 16.6, P, 10), { tone: "mid", crease: "none" });
  return `<g data-hit="n6">${post}${duct(pts, 3.2, 2.2, "mid")}${flow(pts, "up")}</g>`;
}
function dataNetwork() {
  const out = [`<path class="iso-halo" d="${k.haloOf(DNP, 0, 2, P)}"/>`];
  out.push(S(k.slabOf(DNP, 0, 3, P, 4, 0.4), { tone: "lo" }));
  const yF = DNT.y + DNT.d, xR = DNT.x + DNT.w;
  const inner = [];
  // a meshed panel on the front: the outside world
  inner.push(L(poly([[DNT.x + 2, yF + 0.02, 6], [xR - 2, yF + 0.02, 6], [xR - 2, yF + 0.02, DN_TOP - 12], [DNT.x + 2, yF + 0.02, DN_TOP - 12]], true), { tone: "lo" }));
  const mesh = [];
  for (let x = DNT.x + 5; x < xR - 3; x += 3.2) mesh.push(poly([[x, yF + 0.03, 7.4], [x, yF + 0.03, DN_TOP - 13.4]]));
  inner.push(L(mesh.join(""), { tone: "faint" }));
  for (let s = 0; s < 5; s++) { const y = DNT.y + 4 + s * 6.4; inner.push(L(poly([[xR + 0.03, y, 8], [xR + 0.03, y + 3, 8], [xR + 0.03, y + 3, DN_TOP - 8], [xR + 0.03, y, DN_TOP - 8]], true), { tone: "lo" })); }
  inner.push(L(k.sideSeam(DNT, DN_TOP - 10, P, 4), { tone: "faint" }));
  out.push(S(k.slabOf(DNT, 3, DN_TOP - 3, P, 4, 0.6), { tone: "hi", crease: "lo", inner: inner.join("") }));
  out.push(ftext(DNT.x + DNT.w / 2, yF, DN_TOP - 7.2, "DN", 5.2, "hi"));
  out.push(ftext(DNT.x + DNT.w / 2, yF, 2.6, "INTERNET", 2, "mid"));
  // a dish on the roof
  out.push(S(k.cylinder(DNT.x + 9, DNT.y + 10, 3, DN_TOP, 1.2, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(DNT.x + 9, DNT.y + 10, 0.6, DN_TOP + 1.2, 4, P, 8), { tone: "mid", crease: "none" }));
  out.push(D([[DNT.x + 2, DNT.y + 2], [xR - 2, DNT.y + 2], [DNT.x + 2, yF - 2], [xR - 2, yF - 2]].map(([x, y]) => at([x, y, DN_TOP])), { size: 0.42 }));
  return `<g data-hit="dn">${out.join("")}</g>`;
}

/* ---------- a gNB site ---------- */
const DEG = Math.PI / 180;
function mast(X, i) {
  const mx = X + MAST_DX, my = MAST_Y;
  const out = [];
  out.push(S(slab({ x: mx - 5, y: my - 5, w: 10, d: 10, r: 1 }, 0, 1.4, 0.3), { tone: "lo" }));
  out.push(D(k.corners({ x: mx - 5, y: my - 5, w: 10, d: 10 }, 1.4).map(([x, y]) => at([x, y, 1.4])), { size: 0.45, tone: "mid" }));
  const secs = [[2.4, 1.4, 17], [2.0, 18.6, 15], [1.6, 33.8, MAST_TOP - 33.8]];
  secs.forEach(([r, z, h], n) => {
    out.push(S(k.cylinder(mx, my, r, z, h, P, 20), { tone: "mid", crease: "none" }));
    if (n < 2) out.push(S(k.cylinder(mx, my, r + 0.9, z + h - 0.2, 1.2, P, 20, 0.2), { tone: "mid" }));
  });
  // head frame ring and three sector panels (90 faces the road, 210 and 330 the other sectors)
  out.push(S(k.cylinder(mx, my, 6.4, 35, 1, P, 28, 0.2), { tone: "mid" }));
  const panels = [210, 330, 90].map((a) => {
    const [ux, uy] = [Math.cos(a * DEG), Math.sin(a * DEG)];
    const cx = mx + ux * 5, cy = my + uy * 5;
    const ring = [[0.9, -3], [0.9, 3], [-0.9, 3], [-0.9, -3]].map(([u, t]) => [cx + ux * u - uy * t, cy + uy * u + ux * t]);
    return { a, d: k.depthOf([cx, cy, 0], P), s: k.extrude(ring, 37.5, 13, P, { bevel: 0.2 }), cx, cy, ux, uy };
  }).sort((p, q) => p.d - q.d);
  for (const p of panels) {
    out.push(S(p.s, { tone: "hi", crease: "lo" }));
    if (p.a === 90) {
      // the panel facing the road: a slot for each radiating column
      const fy = p.cy + 0.92;
      out.push(L([-1.6, 0, 1.6].map((t) => poly([[p.cx + t, fy, 39.4], [p.cx + t, fy, 48.6]])).join(""), { tone: "lo" }));
    }
  }
  out.push(S(k.cylinder(mx, my, 0.4, MAST_TOP, 7, P, 8), { tone: "mid", crease: "none" }));
  out.push(D([at([mx, my, MAST_TOP + 7.4])], { size: 0.6, tone: "mid" }));
  return `<g data-hit="gnb" data-g="${i}">${out.join("")}</g>`;
}
function cabinet(X, i) {
  const c = { x: X, y: CAB_Y, w: CAB_W, d: CAB_D, r: 0.8 };
  const out = [`<path class="iso-halo" d="${k.haloOf(c, 0, 2, P)}" fill-opacity=".6"/>`];
  out.push(S(slab({ x: X - 1, y: CAB_Y - 1, w: CAB_W + 2, d: CAB_D + 2, r: 0.8 }, 0, 1.5, 0.3), { tone: "lo" }));
  const yF = CAB_Y + CAB_D, xR = X + CAB_W;
  const inner = [L(k.sideSeam(c, CAB_TOP - 2.4, P, 3), { tone: "faint" })];
  inner.push(L(poly([[X + 1, yF + 0.02, CAB_TOP - 6.6], [X + CAB_W - 1, yF + 0.02, CAB_TOP - 6.6]]) + poly([[X + CAB_W / 2, yF + 0.02, 2.4], [X + CAB_W / 2, yF + 0.02, CAB_TOP - 6.6]]), { tone: "lo" }));
  const vents = [];
  for (let s = 0; s < 4; s++) { const z = 5 + s * 2.6; vents.push(poly([[xR + 0.03, CAB_Y + 3, z], [xR + 0.03, yF - 3, z], [xR + 0.03, yF - 3, z + 1.1], [xR + 0.03, CAB_Y + 3, z + 1.1]], true)); }
  inner.push(L(vents.join(""), { tone: "lo" }));
  out.push(S(slab(c, 1.5, CAB_TOP - 1.5, 0.5), { tone: "hi", crease: "lo", inner: inner.join("") }));
  for (const x of [X + CAB_W / 2 - 1.4, X + CAB_W / 2 + 1.4]) out.push(S(slab({ x: x - 0.4, y: yF, w: 0.8, d: 0.6, r: 0.2 }, 7, 4.6, 0, 2), { tone: "mid", crease: "none" }));
  out.push(ftext(X + CAB_W / 2, yF, CAB_TOP - 4.6, `gNB${i + 1}`, 3.3, "hi"));
  out.push(`<g class="c5-led">${D([at([X + CAB_W - 3.4, yF + 0.05, 11.3]), at([X + CAB_W - 2, yF + 0.05, 11.3])], { size: 0.55, tone: "hi" })}</g>`);
  out.push(S(k.cylinder(X + 8, CAB_Y + CAB_D / 2, 1.6, CAB_TOP, 1, P, 14), { tone: "mid" }));
  out.push(D([[X + 1.6, CAB_Y + 1.6], [xR - 1.6, CAB_Y + 1.6], [X + 1.6, yF - 1.6], [xR - 1.6, yF - 1.6]].map(([x, y]) => at([x, y, CAB_TOP])), { size: 0.42 }));
  return `<g data-hit="gnb" data-g="${i}">${out.join("")}</g>`;
}
function pad(X) {
  const p = { x: X - 6, y: 118, w: 40, d: 30, r: 1.5 };
  return S(k.slabOf(p, 0, 0.6, P, 3), { tone: "lo", crease: "none" }) + L(k.planOutline(k.insetPlan(p, 2), 0.6, P), { tone: "faint" });
}
function xn(i) {
  const pts = R[`xn:${i}-${i + 1}`];
  const sleepers = [];
  for (let x = pts[0][0] + 10; x < pts[1][0] - 4; x += 22) sleepers.push(S(slab({ x: x - 0.8, y: XN_Y - 2, w: 1.6, d: 4, r: 0.2 }, 0, 2.6, 0.1, 2), { tone: "lo", crease: "none" }));
  return `<g data-hit="xn">${duct(pts, 3, 2.2, "mid")}${sleepers.join("")}${flow(pts, "cp")}</g>`;
}

/* ---------- walk, road, phones ---------- */
function walk() {
  const out = [S(k.slabOf(WALK, 0, 1.4, P, 3, 0.2), { tone: "mid" })];
  const joints = [];
  for (let x = WALK.x + 16; x < WALK.x + WALK.w - 4; x += 16) joints.push(k.lineOnTop([x, WALK.y + 0.6], [x, WALK.y + WALK.d - 0.6], 1.4, P));
  out.push(L(joints.join(""), { tone: "faint" }));
  return out.join("");
}
function road() {
  const out = [S(k.slabOf(ROAD, 0, 0.6, P, 3), { tone: "lo", crease: "none" })];
  const dash = [];
  for (let x = ROAD.x + 8; x < ROAD.x + ROAD.w - 10; x += 16) dash.push(k.lineOnTop([x, ROAD.y + ROAD.d / 2 - 0.3], [x + 8, ROAD.y + ROAD.d / 2 - 0.3], 0.6, P));
  out.push(L(dash.join(""), { tone: "mid" }));
  out.push(L(k.lineOnTop([ROAD.x + 2, ROAD.y + 1.6], [ROAD.x + ROAD.w - 2, ROAD.y + 1.6], 0.6, P) + k.lineOnTop([ROAD.x + 2, ROAD.y + ROAD.d - 1.6], [ROAD.x + ROAD.w - 2, ROAD.y + ROAD.d - 1.6], 0.6, P), { tone: "faint" }));
  return out.join("");
}
function phoneOnStand(x, y, n) {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 1, y: y - 1, w: 9, d: 7, r: 2 }, 1.4, 0.1, P)}" fill-opacity=".5"/>`];
  out.push(S(slab({ x, y, w: 8, d: 6, r: 1.2 }, 1.4, 1.2, 0.3), { tone: "mid" }));
  const ph = { x: x + 1.6, y: y + 2.4, w: 4.8, d: 1, r: 0.4 };
  out.push(S(slab(ph, 2.6, 9.6, 0.15, 2), { tone: "hi", crease: "lo" }));
  const yF = ph.y + ph.d + 0.03;
  out.push(L(poly([[ph.x + 0.5, yF, 4], [ph.x + ph.w - 0.5, yF, 4], [ph.x + ph.w - 0.5, yF, 11.4], [ph.x + 0.5, yF, 11.4]], true), { tone: "lo" }));
  out.push(D([at([ph.x + ph.w / 2, yF, 11.8])], { size: 0.3, tone: "mid" }));
  return `<g data-hit="ue" data-ue="${n}">${out.join("")}</g>`;
}
function car() {
  // a small car carrying a phone on a roof mount; built at x = 0 on the lane
  const y = LANE_Y - 5, out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -10, y: y - 0.5, w: 20, d: 11, r: 3 }, 0.6, 0.1, P)}" fill-opacity=".55"/>`);
  for (const [wx, wy] of [[-6, y - 0.4], [6, y - 0.4], [-6, y + 10.4], [6, y + 10.4]].sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(slab({ x: wx - 2, y: wy - 0.6, w: 4, d: 1.2, r: 0.5 }, 0.6, 3.6, 0.1, 3), { tone: "mid", crease: "none" }));
  }
  const body = { x: -9.5, y, w: 19, d: 10, r: 2 };
  const yF = y + body.d;
  out.push(S(slab(body, 2, 4.4, 0.5, 4), { tone: "hi", crease: "lo", inner: L(k.sideSeam(body, 4, P, 4), { tone: "faint" }) }));
  const cab = { x: -5.5, y: y + 1, w: 10, d: 8, r: 1.6 };
  out.push(S(slab(cab, 6.4, 3.6, 0.4, 4), { tone: "hi", crease: "lo", inner: L(poly([[cab.x + 1.2, cab.y + cab.d + 0.02, 7.2], [cab.x + cab.w - 1.2, cab.y + cab.d + 0.02, 7.2], [cab.x + cab.w - 2, cab.y + cab.d + 0.02, 9.4], [cab.x + 2, cab.y + cab.d + 0.02, 9.4]], true), { tone: "lo" }) }));
  out.push(D([at([9.5 + 0.02, y + 2, 4.6]), at([9.5 + 0.02, y + 8, 4.6])], { size: 0.55, tone: "hi" }));
  out.push(L(poly([[-1, yF + 0.02, 2.6], [-1, yF + 0.02, 6]]), { tone: "lo" }));
  // roof mount and phone
  out.push(S(slab({ x: -1.2, y: y + 4, w: 2.4, d: 2, r: 0.4 }, 10, 1.6, 0.1, 2), { tone: "mid", crease: "none" }));
  const ph = { x: -2.4, y: y + 4.5, w: 4.8, d: 1, r: 0.4 };
  out.push(S(slab(ph, 11.6, 9, 0.15, 2), { tone: "hi", crease: "lo" }));
  out.push(L(poly([[ph.x + 0.5, ph.y + ph.d + 0.03, 12.8], [ph.x + ph.w - 0.5, ph.y + ph.d + 0.03, 12.8], [ph.x + ph.w - 0.5, ph.y + ph.d + 0.03, 19.8], [ph.x + 0.5, ph.y + ph.d + 0.03, 19.8]], true), { tone: "lo" }));
  return `<g data-hit="ue" data-ue="0">${out.join("")}</g>`;
}

/* ---------- labels (screen space, in the overlay) ---------- */
const TAGS = [
  ["n2", [80, TRAY_Y, TRAY_Z + 1.2], "cp"],
  ["n3", [160, DUCT_Y, 2.2], "up"],
  ["xn", [158, XN_Y, 2.2], "cp"],
  ["xn", [245, XN_Y, 2.2], "cp", 1],
  ["n4", [(FRONT.smf + NFW + FRONT.upf) / 2, 69, 17], "cp"],
  ["n6", [266, 69, 19], "up"],
  ["sbi", [BUS.x + 77, BUS.y + BUS.d / 2, BUS_Z1], "sbi"],
];
const tagSvg = (key, [x, y], plane, alt) => `<g class="c5-tag" data-hit="${key}" data-plane="${plane}"${alt ? ` data-alt="${alt}"` : ""} transform="translate(${r1(x)} ${r1(y)})"><g class="c5-tag-in"><rect x="-11" y="-7" width="22" height="14" rx="7"/><text y="3.6">${key === "sbi" ? "SBI" : key[0].toUpperCase() + key.slice(1)}</text></g></g>`;

/* ---------- assemble ---------- */
const backKeys = Object.keys(BACK).sort((a, b) => BACK[a] - BACK[b]);
const body = [
  board(),
  walk(),
  road(),
  ...SITES.map(pad),
  n3Floor(),
  deck(),
  ...backKeys.map((key) => nfUnit(key, BACK[key], BY0, key.toUpperCase())),
  bus(),
  nfUnit("amf", FRONT.amf, FY0, "AMF"),
  nfUnit("smf", FRONT.smf, FY0, "SMF"),
  n4(),
  nfUnit("upf", FRONT.upf, FY0, "UPF"),
  n6(),
  dataNetwork(),
  n3Deck(),
  n2Tray(),
];
SITES.forEach((X, i) => {
  body.push(cabinet(X, i));
  body.push(mast(X, i));
  if (i < SITES.length - 1) body.push(xn(i));
});
body.push(...UES.map(([x, y], n) => phoneOnStand(x, y, n + 1)));
const LABEL_ES = "Modelo a escala de un sistema 5G: tres estaciones base junto a una vía con teléfonos, y el núcleo 5G con sus funciones sobre una barra de servicios.";
const ART = k.figureSvg({ width: W, height: H, label: LABEL_ES, body });

// overlay: radio links, the car, the tunnel, packets and labels (drawn above the static art)
const ANT = SITES.map((X) => at([X + MAST_DX, MAST_Y + 6.6, 44]).map(r1));
const PHONE = [at([0, LANE_Y - 0.5, 20.6]).map(r1), ...UES.map(([x, y]) => at([x + 4, y + 3.4, 12.2]).map(r1))];
const CARV = k.axisVector(P, [1, 0, 0]).map((v) => Math.round(v * 10000) / 10000);
const AMFTOP = at([amfC, FY0 + 6, NFTOP + 1]).map(r1);
const tags = TAGS.map(([key, p, plane, alt]) => tagSvg(key, at(p), plane, alt)).join("");
const OVER = `<svg xmlns="http://www.w3.org/2000/svg" class="c5-over" viewBox="0 0 ${W} ${H}" aria-hidden="true">`
  + `<path class="c5-tunnel" d=""/><g class="c5-lit"></g>`
  + `<g class="c5-uu"><path data-uu="1" d=""/><path data-uu="2" d=""/><path data-uu="0" d=""/></g>`
  + `<path class="c5-n1" d=""/>`
  + `<g class="c5-car" data-hit="ue">${car()}</g>`
  + `<g class="c5-stream"></g><g class="c5-packets"></g>`
  + `<g class="c5-tags">${tags}<g class="c5-tag" data-hit="uu" data-plane="radio" data-float="uu"><g class="c5-tag-in"><rect x="-11" y="-7" width="22" height="14" rx="7"/><text y="3.6">Uu</text></g></g><g class="c5-tag" data-hit="n1" data-plane="n1" data-float="n1"><g class="c5-tag-in"><rect x="-11" y="-7" width="22" height="14" rx="7"/><text y="3.6">N1</text></g></g></g>`
  + `</svg>`;

const ROUTES = {};
for (const [key, pts] of Object.entries(R)) ROUTES[key] = scr(pts);
const BUSLINE = scr([[BUS.x, ...BUS_TOP], [BUS.x + BUS.w, ...BUS_TOP]]);
const ROAD_X = [24, 312];

writeFileSync(join(HERE, "art.js"), `// Generated by build.mjs. Do not edit by hand.\n`
  + `export const W = ${W}, H = ${H};\n`
  + `export const ART = ${JSON.stringify(ART)};\n`
  + `export const OVER = ${JSON.stringify(OVER)};\n`
  + `export const ROUTES = ${JSON.stringify(ROUTES)};\n`
  + `export const GEO = ${JSON.stringify({ ANT, PHONE, CARV, AMFTOP, BUSLINE, ROAD_X, SITES_X: SITES.map((X) => X + MAST_DX) })};\n`);

/* ---------- CSS: kit styles with the site palette ---------- */
const kitRules = k.ISO_CSS.slice(k.ISO_CSS.indexOf(".iso-svg{")).replace(/\.iso-figure\{[\s\S]*$/, "");
const LIGHT = `--anatomy-page:#f3f5f8;--anatomy-card:#ffffff;--anatomy-text:#3b4a5c;--anatomy-strong:#0d1b2a;--anatomy-muted:#6b7c8f;
  --anatomy-paper:#ffffff;--anatomy-face:#ffffff;--anatomy-top:#ffffff;
  --anatomy-shade-0:#d6dee7;--anatomy-shade-1:#e1e7ee;--anatomy-shade-2:#eaeff4;--anatomy-shade-3:#f3f6f9;
  --anatomy-lit-top:#ffffff;--anatomy-lit-shade:#e4f0f3;
  --anatomy-hi:#0d1b2a;--anatomy-mid:#6a7d91;--anatomy-lo:#a8b6c4;--anatomy-faint:#d3dbe4;--anatomy-lit:#00708a;
  --anatomy-halo:#1a5276;--anatomy-halo-opacity:.18;--anatomy-dot:#0d1b2a;
  --c5-cp:#00708a;--c5-up:#00a8c6;--c5-ran:#1a5276;--c5-radio:#00a8c6;--c5-n1:#00708a;--c5-tag:#ffffff`;
const DARK = `--anatomy-page:#0a1420;--anatomy-card:#111f2e;--anatomy-text:#c3cfdb;--anatomy-strong:#eaf0f6;--anatomy-muted:#9aabbf;
  --anatomy-paper:#111f2e;--anatomy-face:#17293c;--anatomy-top:#1b2e43;
  --anatomy-shade-0:#0b1622;--anatomy-shade-1:#0e1a28;--anatomy-shade-2:#11202f;--anatomy-shade-3:#142537;
  --anatomy-lit-top:#20364c;--anatomy-lit-shade:#182b3f;
  --anatomy-hi:#dce6f0;--anatomy-mid:#6f849a;--anatomy-lo:#3f5368;--anatomy-faint:#26384b;--anatomy-lit:#00D9FF;
  --anatomy-halo:#02060b;--anatomy-halo-opacity:.75;--anatomy-dot:#eaf0f6;
  --c5-cp:#3fd6c6;--c5-up:#00D9FF;--c5-ran:#a9c7e3;--c5-radio:#00D9FF;--c5-n1:#3fd6c6;--c5-tag:#111f2e`;
const FIG_CSS = `
/* 5G core and RAN figure (site palette); kit rules below are from iso-kit.mjs, MIT, (c) 2026 Ryan */
.iso.c5{${LIGHT};--anatomy-weight:.6px;--anatomy-ease:cubic-bezier(.32,.72,0,1);--anatomy-mono:"Instrument Sans",ui-sans-serif,system-ui,sans-serif}
:root[data-theme="dark"] .iso.c5{${DARK}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .iso.c5{${DARK}}}
.c5 .iso-face-text{font-family:"Instrument Sans",ui-sans-serif,system-ui,sans-serif;font-weight:650;letter-spacing:.05em}
.c5-fig{position:relative;width:100%}
.c5-fig .iso-svg,.c5-over{display:block;width:100%;height:auto;overflow:visible}
.c5-over{position:absolute;inset:0;pointer-events:none;will-change:transform}
.c5-fig>.iso-svg{contain:paint}
.c5-over [data-hit],.c5-over .c5-tag{pointer-events:auto}
.c5-flow{fill:none;stroke-linecap:round;vector-effect:non-scaling-stroke;opacity:.5;transition:opacity .3s}
.c5-flow[data-plane="cp"]{stroke:var(--c5-cp);stroke-width:1;stroke-dasharray:2.5 3}
.c5-flow[data-plane="up"]{stroke:var(--c5-up);stroke-width:1.5;stroke-dasharray:9 3}
[data-hit]:is([data-on],[data-pick]) .c5-flow{opacity:1}
.c5-lit .c5-flow{opacity:1;stroke-width:1.6;animation:c5-dash 1s linear infinite}
.c5-lit .c5-flow[data-plane="up"]{stroke-width:2.2;animation-duration:.8s}
@keyframes c5-dash{to{stroke-dashoffset:-11}}
[data-hit]{cursor:pointer}
[data-hit="amf"],[data-hit="smf"],[data-hit="ausf"],[data-hit="udm"],[data-hit="pcf"],[data-hit="nrf"],[data-hit="nssf"],[data-hit="n2"],[data-hit="n4"],[data-hit="xn"],[data-hit="sbi"]{--hl:var(--c5-cp)}
[data-hit="upf"],[data-hit="dn"],[data-hit="n3"],[data-hit="n6"]{--hl:var(--c5-up)}
[data-hit="gnb"],[data-hit="ue"]{--hl:var(--c5-ran)}
[data-hit]:is([data-on],[data-pick]) .iso-edge,[data-hit]:is([data-on],[data-pick]) .iso-crease,[data-hit]:is([data-on],[data-pick]) .iso-bevel{stroke:var(--hl);transition:stroke .3s}
[data-hit]:is([data-on],[data-pick]) .iso-edge{stroke-width:1.1px}
[data-hit]:is([data-on],[data-pick]) .iso-top{fill:color-mix(in srgb,var(--hl) 14%,var(--anatomy-top))}
[data-hit]:is([data-on],[data-pick]) .iso-shade{fill:color-mix(in srgb,var(--hl) 10%,var(--anatomy-shade-2))}
[data-hit]:is([data-on],[data-pick]) .iso-face-text[data-tone="hi"]{fill:var(--hl)}
.c5-led circle{transition:fill .3s}
[data-hit]:is([data-on],[data-pick]) .c5-led circle{fill:var(--hl);opacity:1}
.c5-uu path{fill:none;stroke:var(--c5-radio);stroke-width:1.2;stroke-dasharray:1.6 3.2;stroke-linecap:round;vector-effect:non-scaling-stroke;opacity:.55;transition:opacity .3s}
.c5-uu path:is([data-on],[data-pick]){opacity:1;stroke-width:1.6;animation:c5-dash .9s linear infinite}
.c5-n1{fill:none;stroke:var(--c5-n1);stroke-width:1.8;stroke-dasharray:.01 4.2;stroke-linecap:round;vector-effect:non-scaling-stroke;opacity:0;transition:opacity .4s}
.c5-n1:is([data-on],[data-pick]){opacity:.95;animation:c5-dash 1.2s linear infinite}
.c5-tunnel{fill:none;stroke:var(--c5-up);stroke-width:7;stroke-linecap:round;stroke-linejoin:round;opacity:0;vector-effect:non-scaling-stroke;transition:opacity .5s}
.c5-tunnel[data-on]{opacity:.22}
.c5-packets circle{stroke:var(--anatomy-card);stroke-width:1.2;vector-effect:non-scaling-stroke}
.c5-packets [data-plane="cp"]{fill:var(--c5-cp)}.c5-packets [data-plane="up"]{fill:var(--c5-up)}
.c5-packets .c5-halo{fill:none;stroke-width:5;opacity:.25}
.c5-packets [data-plane="cp"].c5-halo{stroke:var(--c5-cp)}.c5-packets [data-plane="up"].c5-halo{stroke:var(--c5-up)}
.c5-stream circle{fill:var(--c5-up);stroke:var(--anatomy-card);stroke-width:.8;vector-effect:non-scaling-stroke}
.c5-tag rect{fill:var(--c5-tag);stroke:var(--anatomy-mid);stroke-width:1;vector-effect:non-scaling-stroke;transition:stroke .3s,fill .3s}
.c5-tag text{font:700 9.5px/1 "Instrument Sans",ui-sans-serif,system-ui,sans-serif;letter-spacing:.04em;text-anchor:middle;fill:var(--anatomy-strong)}
.c5-tag[data-plane="cp"] rect,.c5-tag[data-plane="sbi"] rect,.c5-tag[data-plane="n1"] rect{stroke:var(--c5-cp)}
.c5-tag[data-plane="up"] rect,.c5-tag[data-plane="radio"] rect{stroke:var(--c5-up);stroke-dasharray:4 1.6}
.c5-tag[data-plane="n1"] rect{stroke-dasharray:.01 2.6;stroke-linecap:round;stroke-width:1.6}
.c5-tag:is([data-on],[data-pick]) rect{fill:var(--hl,var(--c5-cp));stroke:var(--hl,var(--c5-cp))}
.c5-tag[data-plane="up"],.c5-tag[data-plane="radio"]{--hl:var(--c5-up)}
.c5-tag:is([data-on],[data-pick]) text{fill:var(--anatomy-card)}
.c5-tag[data-float]{opacity:0;transition:opacity .3s}.c5-tag[data-float][data-show]{opacity:1}
.c5-tag-in{transition:transform .3s}
.c5-fig[data-small] .c5-tag-in{transform:scale(1.55)}
.iso-svg[data-ink] .iso-fill,.iso-svg[data-ink] .iso-shade,.iso-svg[data-ink] .iso-top,.iso-svg[data-ink] .iso-halo,.iso-svg[data-ink] .iso-dots,.iso-svg[data-ink] .iso-face-text,.iso-svg[data-ink] .c5-flow{opacity:0}
.iso-svg[data-ink] .iso-line{stroke-dasharray:1 1;stroke-dashoffset:1}
.iso-svg[data-inking] .iso-line{transition:stroke-dashoffset 1.4s cubic-bezier(.45,.05,.25,1)}
.iso-svg[data-filling] .iso-fill,.iso-svg[data-filling] .iso-shade,.iso-svg[data-filling] .iso-top,.iso-svg[data-filling] .iso-dots,.iso-svg[data-filling] .iso-face-text,.iso-svg[data-filling] .c5-flow{transition:opacity .7s ease}
.iso-svg[data-filling] .iso-halo{transition:opacity .9s ease}
.c5-fig[data-ink] .c5-over{opacity:0}.c5-over{transition:opacity .6s ease}
.c5-fig[data-still] .c5-flow,.c5-fig[data-still] .c5-uu path,.c5-fig[data-still] .c5-n1,.c5-fig[data-still] .c5-led circle{animation:none!important}
@media (prefers-reduced-motion:reduce){.c5-flow,.c5-uu path,.c5-n1,.c5-led circle{animation:none!important}}
`;
writeFileSync(join(HERE, "core.css"), FIG_CSS + kitRules + "\n");

/* ---------- poster: the overview pose, static, light by default, dark via poster.svg#dark ---------- */
function posterOf() {
  const css = (FIG_CSS.replace(/:root\[data-theme="dark"\] \.iso\.c5\{/, ".iso.c5:has(#dark:target){").replace(/@media \(prefers-color-scheme:dark\)\{[^\n]*\n/, "") + kitRules + ".iso{background:var(--anatomy-card)}").replace(/\n/g, "");
  const uu = UES.map((_, n) => { const a = ANT[n === 0 ? 0 : 2], b = PHONE[n + 1]; const c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 26]; return `<path d="M${a[0]} ${a[1]}Q${r1(c[0])} ${r1(c[1])} ${b[0]} ${b[1]}"/>`; }).join("");
  const carAt = 70;
  const over = `<g class="c5-uu">${uu}</g><g transform="translate(${r1(CARV[0] * carAt)} ${r1(CARV[1] * carAt)})">${car()}</g><g class="c5-tags">${tags}</g>`;
  return ART.replace('class="iso-svg"', 'class="iso-svg iso c5"').replace(/^<svg([^>]*)>/, `<svg$1><style>${css}</style><g id="dark"/><rect width="100%" height="100%" fill="var(--anatomy-card)"/>`).replace(/<\/svg>$/, `${over}</svg>`);
}
writeFileSync(join(HERE, "poster.svg"), posterOf());
console.log("wrote art.js, core.css, poster.svg", JSON.stringify(P));
