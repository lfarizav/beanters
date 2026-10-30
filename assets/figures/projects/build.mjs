// Build the community cellular network model: node build.mjs  (writes art.js, projects.css and poster.svg)
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan) through ../agentic/bench.mjs.
//
// Truth notes. The model follows the author's CRC 2026 article on open-source community cellular networks
// in the 900 MHz band: a private LTE/5G base station on free software and general-purpose hardware with an SDR
// (p. 5, p. 7); the core (EPC/5GC and IMS) runs inside the community, so community radio and TV as IPTV by local
// multicast, SMS and voice need no internet link; a backhaul, when it exists, adds internet access (p. 8). Those
// local services are a regulatory recommendation, not an authorized use today (p. 11). IPTV for training via SENA
// (p. 10). Local video conferences are the author's addition. Remote spectrum verification by the ANE (p. 10,
// p. 12). Central control of every site from the ministry (MinTIC) is the author's proposal, labelled so.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, kitFor, plinth, writeScene } from "../agentic/bench.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const W = 760, H = 580;
const PLATE = { x: -132, y: -108, w: 264, d: 216, r: 10 };
const TOWER = [26, -46];
const TOWER_TOP = 122;
const MIN = { x: -120, y: -98, w: 56, d: 36, r: 1.5 }; // ministry control centre
const MIN_H = 40;
const MAP = { x: -116, y: -50, w: 34, d: 22, r: 1.5 }; // map table with the sites
const ANE = { x: 76, y: -104, w: 30, d: 22, r: 1.5 }; // spectrum monitoring station
const ANE_H = 18;
const ANE_MAST = [68, -100];
const CAB = { x: 40, y: -32, w: 28, d: 18, r: 1 }; // general-purpose hardware cabinet
const CAB_H = 30;
const SDR = { x: 54, y: -31.5, w: 12, d: 6, r: 0.6 };
const SVC = { x: 41, y: -23.4, w: 21, d: 8.4, r: 0.5 }; // the services stacked on the core
export const SERVICES = ["web", "sena", "video", "voice", "iptv"]; // bottom to top
const SVC_TEXT = { iptv: "IPTV", voice: "VoLTE", video: "VIDEO", sena: "SENA", web: "WEB" };
const CLASS = { x: -118, y: 6, w: 64, d: 50, r: 1 }; // SENA classroom, cut away
const WALL_H = 26;
const HOUSES = [[64, 34], [104, 26], [86, 76]];
const HOUSE = { w: 26, d: 18, h: 14, roof: 10 };
const PHONES = [[44, 84], [-30, 78], [-10, 40]];

const extremes = [...k.boxCorners(PLATE, -14, 0), [TOWER[0], TOWER[1], TOWER_TOP + 22], [ANE_MAST[0], ANE_MAST[1], 74], [MIN.x, MIN.y, MIN_H + 16]];
const P = k.fitProjection(extremes, W, H, { pad: 14, azimuth: 45, elevation: 32 });
const K = kitFor(P);
const { S, L, D, at, poly, slab, cyl, plan, byDepth, depth, faceY, faceX } = K;
const KK = P.scale * Math.sqrt(1.6);
const sinE = Math.sin(P.elevation * Math.PI / 180);
const r2 = (v) => v.map((n) => +n.toFixed(2));

const rectY = (yF, x0, x1, z0, z1) => poly([[x0, yF, z0], [x1, yF, z0], [x1, yF, z1], [x0, yF, z1]], true);
const rectX = (xF, y0, y1, z0, z1) => poly([[xF, y0, z0], [xF, y1, z0], [xF, y1, z1], [xF, y0, z1]], true);
const textY = (x, yF, z, text, size = 4.2, tone = "hi") => k.faceTextSvg(faceY(x, yF + 0.06, z), text, { size, tone, anchor: "middle" });

/* ---------- ministry control centre (the author's proposal) ---------- */
function ministry() {
  const out = [`<path class="iso-halo" d="${k.haloOf(MIN, 0, 2, P)}" style="filter:blur(6px)"/>`];
  out.push(S(slab(k.insetPlan(MIN, -2), 0, 3, 4, 0.5), { tone: "lo" }));
  out.push(S(slab(MIN, 3, MIN_H - 3, 4, 0.8), { tone: "hi", crease: "lo", inner: L(k.sideSeam(MIN, MIN_H - 8, P, 4) + k.sideSeam(MIN, 14, P, 4), { tone: "faint" }) }));
  const yF = MIN.y + MIN.d + 0.05, xF = MIN.x + MIN.w + 0.05;
  // the wall of screens on the front: 4 x 2, each a lit pane in its frame
  const screens = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const x0 = MIN.x + 5 + c * 12, z0 = 16 + r * 8.5;
    screens.push(`<path class="pj-screen" data-wall="${r * 4 + c}" d="${rectY(yF, x0, x0 + 10.5, z0, z0 + 7)}"/>`);
    out.push(L(rectY(yF, x0, x0 + 10.5, z0, z0 + 7), { tone: "mid" }));
  }
  out.push(screens.join(""));
  // a trace on two of the panes (the network's health), drawn in the face plane
  const trace = (x0, z0) => poly([0, 1.5, 3, 4.5, 6, 7.5, 9].map((u, i) => [x0 + 0.8 + u, yF + 0.02, z0 + 2 + [1, 3, 2, 4.2, 2.6, 3.4, 2.2][i]]));
  out.push(L(trace(MIN.x + 5, 24.5) + trace(MIN.x + 41, 16), { tone: "lit", free: true }));
  out.push(`<g data-ink-skip="">${textY(MIN.x + MIN.w / 2, yF, 10.5, "MinTIC", 4.6)}</g>`);
  // door and the plinth line
  out.push(L(rectY(yF, MIN.x + MIN.w - 13, MIN.x + MIN.w - 6, 3, 12), { tone: "lo" }));
  // side vents
  out.push(L([0, 1, 2, 3].map((j) => rectX(xF, MIN.y + 6, MIN.y + MIN.d - 6, 18 + j * 4, 19.2 + j * 4)).join(""), { tone: "lo" }));
  out.push(D([[MIN.x + 2, 5], [MIN.x + MIN.w - 2, 5], [MIN.x + 2, MIN_H - 3], [MIN.x + MIN.w - 2, MIN_H - 3]].map(([x, z]) => at([x, yF, z])), { size: 0.45 }));
  // roof: plant box, a dish on a post, and a beacon
  out.push(S(slab(plan(MIN.x + 12, MIN.y + 11, 14, 10, 1), MIN_H, 5, 3, 0.4), { tone: "mid" }));
  out.push(L(k.sideSeam(plan(MIN.x + 12, MIN.y + 11, 14, 10, 1), MIN_H + 3, P, 3), { tone: "faint" }));
  const dx = MIN.x + 40, dy = MIN.y + 14;
  out.push(S(cyl(dx, dy, 3.4, MIN_H, 1.6, 24, 0.3), { tone: "mid" }));
  out.push(S(cyl(dx, dy, 1, MIN_H + 1.6, 8, 12), { tone: "mid", crease: "none" }));
  out.push(S(cyl(dx, dy, 7, MIN_H + 9.6, 1.6, 40, 0.4), { tone: "hi", crease: "lo" }));
  out.push(L(k.ring(dx, dy, 4.6, MIN_H + 11.2, P, 40) + k.ring(dx, dy, 2.2, MIN_H + 11.2, P, 24), { tone: "faint" }));
  out.push(`<g data-min-beacon="">${S(cyl(MIN.x + 50, MIN.y + 30, 1.8, MIN_H, 3.4, 16, 0.3), { tone: "hi", crease: "lo" })}</g>`);
  return out.join("");
}
export const SITES = [[0.18, 0.3], [0.42, 0.22], [0.66, 0.4], [0.3, 0.66], [0.58, 0.72], [0.82, 0.62]];
function mapTable() {
  const out = [S(slab(MAP, 0, 7, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(MAP, 5, P, 4), { tone: "faint" }) })];
  const top = k.insetPlan(MAP, 2);
  out.push(S(slab(top, 7, 0.6, 3, 0.2), { tone: "hi", crease: "none" }));
  // a coarse country outline as a closed polygon on the glass
  const shape = [[0.1, 0.18], [0.36, 0.06], [0.62, 0.12], [0.86, 0.3], [0.92, 0.62], [0.72, 0.9], [0.4, 0.92], [0.16, 0.78], [0.06, 0.46]];
  out.push(L(poly(shape.map(([u, v]) => [top.x + u * top.w, top.y + v * top.d, 7.7]), true), { tone: "lo" }));
  out.push(`<g data-sites="">${SITES.map(([u, v], i) => `<g data-site="${i}">${D([at([top.x + u * top.w, top.y + v * top.d, 7.7])], { size: 0.9, tone: "hi" })}</g>`).join("")}</g>`);
  return out.join("");
}

/* ---------- ANE spectrum monitoring station ---------- */
function ane() {
  const out = [`<path class="iso-halo" d="${k.haloOf(ANE, 0, 2, P)}" style="filter:blur(5px)"/>`];
  out.push(S(slab(k.insetPlan(ANE, -2), 0, 2, 4, 0.4), { tone: "lo" }));
  out.push(S(slab(ANE, 2, ANE_H - 2, 4, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(ANE, ANE_H - 4, P, 4), { tone: "faint" }) }));
  const yF = ANE.y + ANE.d + 0.05, xF = ANE.x + ANE.w + 0.05;
  // the analyser screen with its spectrum trace and the marked block
  out.push(`<path class="pj-screen" data-ane-screen="" d="${rectY(yF, ANE.x + 4, ANE.x + 22, 8, 15)}"/>`);
  out.push(L(rectY(yF, ANE.x + 4, ANE.x + 22, 8, 15), { tone: "mid" }));
  const sp = [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5, 15, 16.4].map((u, i) => [ANE.x + 4.8 + u, yF + 0.02, 9 + [0.4, 0.6, 0.3, 0.8, 4.6, 4.9, 4.7, 0.7, 0.4, 0.6, 0.3, 0.5][i]]);
  out.push(`<path class="iso-line" data-tone="lit" data-free="" data-ink-skip="" data-spectrum="" pathLength="1" d="${poly(sp)}"/>`);
  out.push(L(rectY(yF, ANE.x + 10.6, ANE.x + 14.6, 8.4, 14.6), { tone: "lo", dashed: true }));
  out.push(D([at([ANE.x + 25, yF, 12]), at([ANE.x + 25, yF, 9])], { size: 0.6, tone: "mid" }));
  out.push(`<g data-ink-skip="">${textY(ANE.x + 13, yF, 6.6, "ANE", 3)}</g>`);
  out.push(L([0, 1, 2].map((j) => rectX(xF, ANE.y + 5, ANE.y + ANE.d - 5, 6 + j * 3.4, 7.2 + j * 3.4)).join(""), { tone: "lo" }));
  return out.join("");
}
function aneMast() {
  const [x, y] = ANE_MAST;
  const out = [S(slab(plan(x, y, 10, 10, 1), 0, 1.6, 3, 0.3), { tone: "lo" })];
  out.push(S(cyl(x, y, 1.4, 1.6, 54, 16), { tone: "mid", crease: "none" }));
  // log-periodic antenna: a boom with elements that shorten toward the tip
  const z = 58, boom = [[x - 9, y, z], [x + 9, y, z]];
  out.push(S(slab(plan(x, y, 3, 3, 0.4), 55.6, 2.4, 2, 0.2), { tone: "mid" }));
  out.push(L(poly(boom), { tone: "hi" }));
  const el = [];
  for (let i = 0; i < 7; i++) { const bx = x - 8 + i * 2.6, h = 9 - i * 1.1; el.push(poly([[bx, y - h, z], [bx, y + h, z]])); }
  out.push(L(el.join(""), { tone: "mid" }));
  out.push(D([at([x + 9, y, z]), at([x - 9, y, z])], { size: 0.5, tone: "hi" }));
  return out.join("");
}

/* ---------- cellular base station: pole, sector antennas, lightning rod ---------- */
const POLE = [{ r: 4.6, z0: 2, z1: 52 }, { r: 3.8, z0: 53.5, z1: 96 }, { r: 3, z0: 97.5, z1: TOWER_TOP }];
function towerBase() {
  const [x, y] = TOWER;
  const out = [`<path class="iso-halo" d="${k.haloOf(plan(x, y, 22, 22, 3), 0, 1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(slab(plan(x, y, 22, 22, 2), 0, 1.4, 3, 0.4), { tone: "lo" }));
  out.push(S(slab(plan(x, y, 17, 17, 2), 1.4, 0.8, 3, 0.3), { tone: "mid" }));
  for (const [cx, cy] of byDepth(k.corners(plan(x, y, 17, 17, 2), 2.6))) out.push(S(cyl(cx, cy, 1, 2.2, 1.2, 10), { tone: "mid" }));
  return out.join("");
}
function sectorAt(deg) {
  const a = deg * Math.PI / 180, [x, y] = TOWER, R = 7.4;
  const cx = x + Math.cos(a) * R, cy = y + Math.sin(a) * R;
  const ux = Math.cos(a), uy = Math.sin(a), tx = -uy, ty = ux, w = 7, d = 2.4;
  const ringPts = [[d / 2, -w / 2], [d / 2, w / 2], [-d / 2, w / 2], [-d / 2, -w / 2]].map(([p, q]) => [cx + ux * p + tx * q, cy + uy * p + ty * q]);
  return `<g data-panel="">${S(k.extrude(ringPts, 100, 18, P, { bevel: 0.3 }), { tone: "hi", crease: "lo" })}</g>`;
}
function tower() {
  const [x, y] = TOWER;
  const out = [];
  POLE.forEach((s, i) => {
    out.push(S(cyl(x, y, s.r, s.z0, s.z1 - s.z0, 32), { tone: "mid", crease: "none" }));
    if (i < 2) out.push(S(cyl(x, y, s.r + 0.9, s.z1 - 1, 2.6, 32, 0.3), { tone: "mid" }));
  });
  // climbing steps on the front
  const steps = [];
  for (let z = 10; z < 120; z += 6) steps.push(k.segment([x + 3.2, y + 3.2, z], [x + 4.4, y + 4.4, z], P));
  out.push(L(steps.join(""), { tone: "lo" }));
  // antenna platform and the three sector panels, back ones first
  out.push(S(cyl(x, y, 10.5, 96, 1.6, 48, 0.4), { tone: "mid" }));
  out.push(L(k.ring(x, y, 9, 97.6, P, 48), { tone: "faint" }));
  const sectors = [210, 330, 90].sort((a, b) => depth([x + Math.cos(a * Math.PI / 180) * 7, y + Math.sin(a * Math.PI / 180) * 7]) - depth([x + Math.cos(b * Math.PI / 180) * 7, y + Math.sin(b * Math.PI / 180) * 7]));
  const frontSectors = sectors.filter((a) => depth([x + Math.cos(a * Math.PI / 180), y + Math.sin(a * Math.PI / 180)]) > depth([x, y]));
  for (const a of sectors) if (!frontSectors.includes(a)) out.push(sectorAt(a));
  out.push(S(cyl(x, y, 3, 97.5, TOWER_TOP - 97.5, 32), { tone: "mid", crease: "none" }));
  for (const a of frontSectors) out.push(sectorAt(a));
  // cap and a lightning rod on top
  out.push(S(cyl(x, y, 2.2, TOWER_TOP, 2, 20, 0.3), { tone: "mid" }));
  out.push(S(cyl(x, y, 0.5, TOWER_TOP + 2, 10, 10), { tone: "mid", crease: "none" }));
  out.push(D([at([x, y, TOWER_TOP + 12])], { size: 0.6, tone: "hi" }));
  return out.join("");
}

/* ---------- general-purpose hardware: cabinet of small computers, SDR on top ---------- */
export const UNITS = 3;
function cabinet() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CAB, 0, 2, P)}" style="filter:blur(4px)"/>`];
  out.push(S(slab(k.insetPlan(CAB, -1.6), 0, 2, 3, 0.4), { tone: "lo" }));
  out.push(S(slab(CAB, 2, CAB_H - 2, 4, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(CAB, CAB_H - 4, P, 4), { tone: "faint" }) }));
  const yF = CAB.y + CAB.d + 0.05, xF = CAB.x + CAB.w + 0.05;
  // three shelves with a small computer each (front), every one with a status lamp and vent slots
  for (let i = 0; i < UNITS; i++) {
    const z0 = 5 + i * 7.4;
    out.push(L(rectY(yF, CAB.x + 3, CAB.x + CAB.w - 3, z0, z0 + 6), { tone: "lo" }));
    out.push(`<g data-unit="${i}"><path class="pj-unit" d="${rectY(yF, CAB.x + 4, CAB.x + 19, z0 + 1, z0 + 5)}"/>${L(rectY(yF, CAB.x + 4, CAB.x + 19, z0 + 1, z0 + 5), { tone: "mid" })}${L([0, 1, 2, 3].map((j) => k.segment([CAB.x + 6 + j * 2.4, yF, z0 + 2], [CAB.x + 6 + j * 2.4, yF, z0 + 4], P)).join(""), { tone: "faint" })}<circle class="pj-led" data-led="${i}" cx="${at([CAB.x + 22.5, yF, z0 + 3])[0].toFixed(1)}" cy="${at([CAB.x + 22.5, yF, z0 + 3])[1].toFixed(1)}" r="1"/></g>`);
  }
  // side: vents and a cable gland at the bottom for the (optional) backhaul
  out.push(L([0, 1, 2, 3, 4].map((j) => rectX(xF, CAB.y + 4, CAB.y + CAB.d - 4, 8 + j * 3.4, 9.2 + j * 3.4)).join(""), { tone: "lo" }));
  out.push(D([[CAB.x + 1.6, 4], [CAB.x + CAB.w - 1.6, 4], [CAB.x + 1.6, CAB_H - 2], [CAB.x + CAB.w - 1.6, CAB_H - 2]].map(([x, z]) => at([x, yF, z])), { size: 0.4 }));
  // the SDR on top: a flat box with two antenna ports and a lamp
  out.push(`<g data-sdr="">${S(slab(SDR, CAB_H, 4, 3, 0.4), { tone: "hi", crease: "lo", inner: L(k.sideSeam(SDR, CAB_H + 2.4, P, 3), { tone: "faint" }) })}</g>`);
  const sy = SDR.y + SDR.d + 0.05;
  for (const px of [SDR.x + 3, SDR.x + 6.4]) out.push(S(k.cylinder(px, SDR.y + 2, 0.9, CAB_H + 4, 1.6, P, 12), { tone: "mid" }));
  out.push(`<g data-ink-skip="">${textY(SDR.x + 5, sy, CAB_H + 2.9, "SDR", 2.2, "mid")}</g>`);
  out.push(`<circle class="pj-led" data-led="sdr" cx="${at([SDR.x + 10, sy, CAB_H + 2])[0].toFixed(1)}" cy="${at([SDR.x + 10, sy, CAB_H + 2])[1].toFixed(1)}" r=".7"/>`);
  out.push(services());
  return out.join("");
}
// the services, stacked on the core like blocks on a shelf: each block is one service of the same network
const SVC_H = 5;
function services() {
  const out = [];
  SERVICES.forEach((name, i) => {
    const z = CAB_H + i * (SVC_H + 0.4);
    const pl = k.insetPlan(SVC, i % 2 ? 0.4 : 0);
    const yF = pl.y + pl.d + 0.05;
    out.push(`<g class="pj-svc" data-svc="${name}">${S(slab(pl, z, SVC_H, 3, 0.3), { tone: "hi", crease: "lo" })}<g data-ink-skip="">${textY(pl.x + pl.w / 2, yF, z + 1, SVC_TEXT[name], 3.8, "hi")}</g></g>`);
  });
  return out.join("");
}
// feeder from the SDR ports up the pole to the platform
const FEED = [[SDR.x + 3, SDR.y + 2, CAB_H + 5.6], [SDR.x + 3, SDR.y + 2, CAB_H + 10], [TOWER[0] + 4.2, TOWER[1] + 3.2, 52], [TOWER[0] + 3.6, TOWER[1] + 2.6, 95]];
function feeder() {
  const pts = FEED.map(at);
  return k.wireSvg(pts[0], pts[pts.length - 1], { via: pts.slice(1, -1), tone: "mid", size: 0.8 }) + `<path class="iso-line pj-flow" data-ink-skip="" data-feed="" d="${k.pathOf(pts)}"/>`;
}

/* ---------- floor lines: orchestration (ministry), verification (ANE), the optional backhaul ---------- */
export const ORCH = [[MIN.x + MIN.w + 2, -76, 0.4], [-10, -76, 0.4], [-10, -20, 0.4], [CAB.x - 0.6, -20, 0.4]];
export const VERIFY = [[CAB.x + CAB.w + 0.6, -27, 0.4], [86, -27, 0.4], [86, ANE.y + ANE.d + 1.2, 0.4]];
const BACK_A = [[CAB.x + CAB.w + 0.6, -18, 0.4], [100, -18, 0.4]];
const BACK_B = [[108, -18, 0.4], [PLATE.x + PLATE.w - 6, -18, 0.4]];
function floorLines() {
  const w = (pts, tone, size = 0.9) => { const p = pts.map(at); return k.wireSvg(p[0], p[p.length - 1], { via: p.slice(1, -1), tone, size }); };
  return [
    w(ORCH, "mid"), `<path class="iso-line pj-flow" data-ink-skip="" data-orch="" d="${k.pathOf(ORCH.map(at))}"/>`,
    w(VERIFY, "mid"), `<path class="iso-line pj-flow pj-flow--ane" data-ink-skip="" data-verify="" d="${k.pathOf(VERIFY.map(at))}"/>`,
    `<g data-backhaul="">${(() => { const a = BACK_A.map(at), b = BACK_B.map(at); return k.wireSvg(a[0], a[1], { tone: "lo", dashed: true, size: 0.8 }) + k.wireSvg(b[0], b[1], { tone: "faint", dashed: true, size: 0.8 }); })()}</g>`,
    `<path class="iso-line pj-bridge" data-ink-skip="" data-bridge="" d="${k.pathOf([BACK_A[1], BACK_B[0]].map(at))}"/>`,
    `<path class="iso-line pj-flow pj-flow--net" data-ink-skip="" data-net="" d="${k.pathOf([BACK_B[1], BACK_A[0]].map(at))}"/>`,
  ].join("");
}

/* ---------- SENA classroom, cut away: two walls, a screen, desks and learners ---------- */
export const SEATS = [];
for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) SEATS.push([CLASS.x + 16 + c * 17, CLASS.y + 22 + r * 14]);
function classroom() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CLASS, 0, 1, P)}" style="filter:blur(5px)"/>`];
  out.push(S(slab(CLASS, 0, 2, 4, 0.4), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(CLASS, 3), 2, P), { tone: "faint" }));
  const back = { x: CLASS.x, y: CLASS.y, w: CLASS.w, d: 3, r: 0.3 };
  const left = { x: CLASS.x, y: CLASS.y + 3, w: 3, d: CLASS.d - 3, r: 0.3 };
  out.push(S(slab(back, 2, WALL_H, 4, 0.3), { tone: "mid", crease: "lo" }));
  out.push(S(slab(left, 2, WALL_H, 4, 0.3), { tone: "mid", crease: "lo" }));
  const yF = back.y + back.d + 0.05, xF = left.x + left.w + 0.05;
  // the screen on the back wall, and the name of the classroom above it
  out.push(`<path class="pj-screen" data-class-screen="" d="${rectY(yF, CLASS.x + 18, CLASS.x + 46, 9, 21)}"/>`);
  out.push(L(rectY(yF, CLASS.x + 18, CLASS.x + 46, 9, 21), { tone: "hi" }));
  out.push(L(rectY(yF, CLASS.x + 30, CLASS.x + 34, 6, 9), { tone: "lo" }));
  out.push(`<path class="iso-line pj-play" data-ink-skip="" d="${poly([[CLASS.x + 30.5, yF + 0.03, 17], [CLASS.x + 30.5, yF + 0.03, 13], [CLASS.x + 34.5, yF + 0.03, 15]], true)}"/>`);
  out.push(`<g data-ink-skip="">${textY(CLASS.x + 32, yF, 25, "SENA", 3.6)}</g>`);
  // a window on the side wall and a shelf on the back wall
  out.push(L(poly([[xF, CLASS.y + 14, 10], [xF, CLASS.y + 34, 10], [xF, CLASS.y + 34, 20], [xF, CLASS.y + 14, 20]], true) + poly([[xF, CLASS.y + 24, 10], [xF, CLASS.y + 24, 20]]), { tone: "lo" }));
  out.push(L(rectY(yF, CLASS.x + 50, CLASS.x + 60, 12, 13), { tone: "lo" }));
  // desks and learners, back to front
  for (const [x, y] of byDepth(SEATS)) {
    const i = SEATS.findIndex(([a, b]) => a === x && b === y);
    out.push(S(slab(plan(x, y - 3, 11, 4.6, 0.4), 2, 5.4, 3, 0.2), { tone: "mid" }));
    out.push(L(k.lineOnTop([x - 3, y - 3], [x + 1, y - 3], 7.4, P), { tone: "faint", free: true }));
    out.push(S(cyl(x, y + 2.6, 1.9, 2, 6.4, 16), { tone: "mid", crease: "none" }));
    out.push(S(cyl(x, y + 2.6, 1.5, 8.6, 2.8, 16, 0.4), { tone: "hi", crease: "none" }));
    const h0 = at([x + 1.6, y + 2.6, 7.6]), h1 = at([x + 1.9, y + 2.6, 14.2]);
    out.push(`<path class="iso-line pj-hand" data-hand="${i}" data-ink-skip="" d="M${h0[0].toFixed(1)} ${h0[1].toFixed(1)}L${h1[0].toFixed(1)} ${h1[1].toFixed(1)}"/>`);
  }
  return out.join("");
}

/* ---------- rural homes with a roof antenna, a phone and a radio ---------- */
function gable(cx, cy) {
  const { w, d, h, roof } = HOUSE;
  const x0 = cx - w / 2 - 1.2, x1 = cx + w / 2 + 1.2, y0 = cy - d / 2 - 1.2, y1 = cy + d / 2 + 1.2, z0 = h, z1 = h + roof;
  const faces = [
    { pts: [[x0, y0, z0], [x1, y0, z0], [x1, cy, z1], [x0, cy, z1]], cls: 'class="iso-top"' },
    { pts: [[x0, y1, z0], [x1, y1, z0], [x1, cy, z1], [x0, cy, z1]], cls: 'class="iso-shade" data-shade="2"' },
    { pts: [[x1, y0, z0], [x1, y1, z0], [x1, cy, z1]], cls: 'class="iso-shade" data-shade="1"' },
    { pts: [[x0, y0, z0], [x0, y1, z0], [x0, cy, z1]], cls: 'class="iso-shade" data-shade="1"' },
  ].map((f) => ({ ...f, dep: depth(f.pts.reduce((a, p) => [a[0] + p[0] / f.pts.length, a[1] + p[1] / f.pts.length, a[2] + p[2] / f.pts.length], [0, 0, 0])) }));
  faces.sort((a, b) => a.dep - b.dep);
  const fill = faces.map((f) => `<path ${f.cls} d="${poly(f.pts, true)}"/>`).join("");
  const edges = poly([[x0, y1, z0], [x1, y1, z0], [x1, y0, z0]]) + poly([[x0, cy, z1], [x1, cy, z1]]) + poly([[x1, y1, z0], [x1, cy, z1], [x1, y0, z0]]) + poly([[x0, y1, z0], [x0, cy, z1]]);
  const tiles = [0.25, 0.5, 0.75].map((t) => poly([[x0 + 0.6, y1 + (cy - y1) * t, z0 + roof * t], [x1 - 0.6, y1 + (cy - y1) * t, z0 + roof * t]])).join("");
  return `<g class="iso-solid">${fill}${L(tiles, { tone: "faint" })}<path class="iso-line iso-edge" data-tone="hi" d="${edges}"/></g>`;
}
function house(i) {
  const [cx, cy] = HOUSES[i];
  const { w, d, h } = HOUSE;
  const pl = plan(cx, cy, w, d, 0.4);
  const out = [`<path class="iso-halo" d="${k.haloOf(pl, 0, 1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(slab(k.insetPlan(pl, -1), 0, 1.4, 3, 0.3), { tone: "lo" }));
  out.push(S(slab(pl, 1.4, h - 1.4, 4, 0.3), { tone: "hi", crease: "lo" }));
  const yF = pl.y + pl.d + 0.05, xF = pl.x + pl.w + 0.05;
  out.push(L(rectY(yF, cx - 9, cx - 3, 1.4, 10), { tone: "mid" }));
  out.push(`<path class="pj-window" data-window="${i}" d="${rectY(yF, cx + 1, cx + 9, 5, 10.5)}"/>`);
  out.push(L(rectY(yF, cx + 1, cx + 9, 5, 10.5) + poly([[cx + 5, yF, 5], [cx + 5, yF, 10.5]]), { tone: "mid" }));
  out.push(`<path class="pj-window" data-window="${i}" d="${rectX(xF, cy - 4, cy + 4, 5, 10.5)}"/>`);
  out.push(L(rectX(xF, cy - 4, cy + 4, 5, 10.5), { tone: "mid" }));
  out.push(gable(cx, cy));
  // a TV antenna on the ridge
  const ax = cx - 6, az = h + HOUSE.roof;
  out.push(L(k.segment([ax, cy, az], [ax, cy, az + 12], P), { tone: "hi" }));
  out.push(L([0, 1, 2].map((j) => k.segment([ax - 4 + j, cy, az + 8 + j * 1.6], [ax + 4 - j, cy, az + 8 + j * 1.6], P)).join(""), { tone: "mid" }));
  out.push(`<g data-rx="${i}">${D([at([ax, cy, az + 12])], { size: 0.8, tone: "hi" })}</g>`);
  return out.join("");
}
function phone(i) {
  const [x, y] = PHONES[i];
  const out = [S(slab(plan(x, y, 10, 7, 1), 0, 1.6, 3, 0.3), { tone: "lo" })];
  const pl = plan(x, y, 6, 1.6, 0.4);
  out.push(S(slab(pl, 1.6, 11, 3, 0.2), { tone: "hi", crease: "lo" }));
  const yF = pl.y + pl.d + 0.05;
  out.push(`<path class="pj-window" data-window="phone-${i}" d="${rectY(yF, x - 2.3, x + 2.3, 3.4, 11.4)}"/>`);
  out.push(L(rectY(yF, x - 2.3, x + 2.3, 3.4, 11.4), { tone: "mid" }));
  out.push(D([at([x, yF, 2.6])], { size: 0.5, tone: "mid" }));
  return out.join("");
}
// radio links from the sector panels to every device (drawn over the scene, shown per phase)
const PANEL = [TOWER[0] + 4, TOWER[1] + 4, 108];
const RX = {
  "phone-0": [PHONES[0][0], PHONES[0][1] + 0.9, 8], "phone-1": [PHONES[1][0], PHONES[1][1] + 0.9, 8], "phone-2": [PHONES[2][0], PHONES[2][1] + 0.9, 8],
  house: [HOUSES[0][0] + 5, HOUSES[0][1] + HOUSE.d / 2, 8], house1: [HOUSES[1][0] + 5, HOUSES[1][1] + HOUSE.d / 2, 8], house2: [HOUSES[2][0] + 5, HOUSES[2][1] + HOUSE.d / 2, 8],
  classroom: [CLASS.x + 32, CLASS.y + 3, 15],
};
function links() {
  const a = at(PANEL);
  return `<g data-ink-skip="">${Object.entries(RX).map(([name, p]) => { const b = at(p); return `<path class="pj-link" data-link="${name}" d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/>`; }).join("")}</g>`;
}
// the 900 MHz mark engraved on the floor in front of the pole
function bandMark() {
  return `<g data-ink-skip="">${k.faceTextSvg(K.top(-6, -4, 0.1), "900 MHz", { size: 6, tone: "hi" })}</g>`;
}

/* ---------- radio coverage: floor ripples (clipped to the plate) and rings round the sector antennas ---------- */
const RIPPLES = 4, AIRS = 3;
function waves(where) {
  if (where === "floor") {
    const top = k.planOutline(k.insetPlan(PLATE, 2), 0, P);
    const c = at([TOWER[0], TOWER[1], 0.2]);
    return `<defs><clipPath id="pj-plate"><path d="${top}"/></clipPath></defs><g clip-path="url(#pj-plate)" data-ink-skip="">${Array.from({ length: RIPPLES }, (_, i) => `<ellipse class="pj-ripple" data-ripple="${i}" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="0" ry="0"/>`).join("")}</g>`;
  }
  const c = at(PANEL);
  return `<g data-ink-skip="">${Array.from({ length: AIRS }, (_, i) => `<ellipse class="pj-air" data-air="${i}" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="0" ry="0"/>`).join("")}</g>`;
}

/* ---------- assemble, back to front ---------- */
const items = [
  { d: depth([MIN.x + MIN.w / 2, MIN.y + MIN.d / 2]), s: `<g data-hit="ministry" data-part="ministry">${ministry()}</g>` },
  { d: depth([MAP.x + MAP.w / 2, MAP.y + MAP.d / 2]), s: `<g data-hit="ministry" data-part="map">${mapTable()}</g>` },
  { d: depth([ANE.x + ANE.w / 2, ANE.y + ANE.d / 2]), s: `<g data-hit="ane" data-part="ane">${ane()}</g>` },
  { d: depth(ANE_MAST), s: `<g data-hit="ane" data-part="ane-mast">${aneMast()}</g>` },
  { d: depth(TOWER) - 30, s: `<g data-hit="site" data-part="tower-base">${towerBase()}</g>` },
  { d: depth(TOWER), s: `<g data-hit="site" data-part="tower">${tower()}</g>` },
  { d: depth([CAB.x + CAB.w / 2, CAB.y + CAB.d / 2]), s: `<g data-hit="hardware" data-part="cabinet">${cabinet()}${feeder()}</g>` },
  { d: depth([CLASS.x + CLASS.w / 2, CLASS.y]), s: `<g data-hit="sena" data-part="classroom">${classroom()}</g>` },
  ...HOUSES.map((h, i) => ({ d: depth(h), s: `<g data-hit="homes" data-part="house">${house(i)}</g>` })),
  ...PHONES.map((ph, i) => ({ d: depth(ph), s: `<g data-hit="phones" data-part="phone">${phone(i)}</g>` })),
].sort((a, b) => a.d - b.d);

const body = [
  plinth(K, PLATE, { strip: { x: -66, y: PLATE.y + PLATE.d - 14, w: 132, d: 6, r: 1 }, label: { x: 96, y: PLATE.y + PLATE.d - 26, w: 24, d: 12, r: 1.2 } }),
  waves("floor"),
  bandMark(),
  floorLines(),
  ...items.map((i) => i.s),
  waves("air"),
  links(),
  `<circle class="pj-spark" data-spark="a" r="2" cx="0" cy="0"/><circle class="pj-spark" data-spark="b" r="2" cx="0" cy="0"/><circle class="pj-spark pj-spark--net" data-spark="net" r="2" cx="0" cy="0"/><circle class="pj-spark" data-spark="orch" r="2" cx="0" cy="0"/><circle class="pj-spark pj-spark--ane" data-spark="verify" r="2" cx="0" cy="0"/>`,
];
const LABEL = "Isometric model of a community cellular network in the 900 MHz band on a plinth: a cellular base station fed by a cabinet of general-purpose computers with an SDR and the open-source core, with a stack of service blocks on it (IPTV, VoLTE, video, SENA, web); phones, rural homes and a SENA classroom receive the services; a ministry control centre with a map table (the author's proposal) and an ANE spectrum monitoring station. The internet cable is optional.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

const DATA = {
  orch: ORCH.map(at).map(r2),
  verify: [...VERIFY].reverse().map(at).map(r2),
  tower: r2(at([TOWER[0], TOWER[1], 0.2])),
  whip: r2(at(PANEL)),
  rx: Object.fromEntries(Object.entries(RX).map(([n, p]) => [n, r2(at(p))])),
  sdr: r2(at([SDR.x + 3, SDR.y + 2, CAB_H + 6])),
  net: [BACK_B[1], BACK_A[0]].map(at).map(r2),
  k: +(KK).toFixed(4), sinE: +sinE.toFixed(4),
  // pin anchors for the HTML labels, in viewBox units
  pins: {
    ministry: r2(at([MIN.x + MIN.w / 2, MIN.y + MIN.d / 2, MIN_H + 14])),
    ane: r2(at([ANE_MAST[0], ANE_MAST[1], 66])),
    site: r2(at([TOWER[0], TOWER[1], TOWER_TOP + 16])),
    services: r2(at([SVC.x, SVC.y + SVC.d, CAB_H + 10])),
    phones: r2(at([PHONES[1][0], PHONES[1][1] + 6, 0])),
    hardware: r2(at([CAB.x + CAB.w, CAB.y + CAB.d, 4])),
    homes: r2(at([HOUSES[0][0], HOUSES[0][1], HOUSE.h + HOUSE.roof + 16])),
    sena: r2(at([CLASS.x + 10, CLASS.y + 2, WALL_H + 6])),
    offline: r2(at([122, -18, 0.4])),
  },
};

const SCENE_CSS = `/* projects model: scene tokens and states (kit palette from ../cellular/mast.css) */
.iso{--pj-spark:#00D9FF;--pj-flow:#00708a;--pj-ane:#b45309;--pj-glow:#00b8d9;--pj-wave:#00a8c6;--pj-net:#4f46e5}
:root[data-theme="dark"] .iso{--pj-flow:#00D9FF;--pj-ane:#f59e0b;--pj-glow:#00D9FF;--pj-wave:#00D9FF;--pj-net:#a5b4fc}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .iso{--pj-flow:#00D9FF;--pj-ane:#f59e0b;--pj-glow:#00D9FF;--pj-wave:#00D9FF;--pj-net:#a5b4fc}}
[data-hit]{--hl:var(--anatomy-lit)}
.pj-flow{fill:none;stroke:var(--pj-flow);stroke-width:1.2;stroke-dasharray:2 5;stroke-linecap:round;opacity:0;animation:iso-flow .9s linear infinite}
.pj-flow--ane{stroke:var(--pj-ane)}
.pj-spark{fill:var(--pj-spark);opacity:0}.pj-spark--ane{fill:var(--pj-ane)}
.pj-screen{fill:var(--anatomy-shade-1);stroke:none}
.pj-screen[data-on]{fill:color-mix(in srgb,var(--pj-glow) 26%,var(--anatomy-top))}
.pj-unit{fill:var(--anatomy-shade-2);stroke:none}
.pj-led{fill:var(--anatomy-lo)}.pj-led[data-on]{fill:var(--pj-spark)}
.pj-window{fill:var(--anatomy-shade-0);stroke:none;transition:fill .5s}
.pj-window[data-on]{fill:color-mix(in srgb,var(--pj-glow) 55%,var(--anatomy-top))}
.pj-play{fill:none;stroke:var(--anatomy-mid);stroke-width:.8}
.pj-hand{stroke:var(--anatomy-hi);stroke-width:1.3;opacity:0}
.pj-ripple,.pj-air{fill:none;stroke:var(--pj-wave);stroke-width:1.1;opacity:0}
.pj-air{stroke-dasharray:3 4}
[data-cur] .iso-edge{stroke:var(--anatomy-lit)}
[data-cur] .iso-top{fill:var(--anatomy-lit-top)}
[data-cur] .iso-shade{fill:var(--anatomy-lit-shade)}
[data-site][data-alert] circle{fill:#dc2626;opacity:1}
[data-site][data-ok] circle{fill:var(--pj-spark);opacity:1}
[data-backhaul][data-cur] .iso-line{stroke:var(--anatomy-mid)}
.pj-link{fill:none;stroke:var(--pj-wave);stroke-width:1;stroke-dasharray:2 4;stroke-linecap:round;opacity:0;animation:iso-flow 1.2s linear infinite}
.pj-bridge{stroke:var(--pj-flow);stroke-width:1.4;opacity:0}
.pj-flow--net{stroke:var(--pj-net)}.pj-spark--net{fill:var(--pj-net)}
.pj-svc[data-on] .iso-top{fill:color-mix(in srgb,var(--pj-glow) 30%,var(--anatomy-top))}
.pj-svc[data-on] .iso-shade{fill:color-mix(in srgb,var(--pj-glow) 18%,var(--anatomy-shade-2))}
.pj-svc[data-on] .iso-edge{stroke:var(--anatomy-lit)}
[data-panel][data-on] .iso-top,[data-panel][data-on] .iso-shade{fill:color-mix(in srgb,var(--pj-glow) 22%,var(--anatomy-top))}
.iso-svg[data-ink] .pj-spark,.iso-svg[data-ink] .pj-flow,.iso-svg[data-ink] .pj-ripple,.iso-svg[data-ink] .pj-air,.iso-svg[data-ink] .pj-screen,.iso-svg[data-ink] .pj-window,.iso-svg[data-ink] .pj-unit,.iso-svg[data-ink] .pj-link,.iso-svg[data-ink] .pj-bridge{opacity:0!important}
`;
import { writeFileSync } from "node:fs";
writeFileSync(HERE + "/projects.css", SCENE_CSS);

// poster: the IPTV pose, services, windows and screens lit, links and two rings on the floor
function posterOf(s) {
  for (const [i, r] of [[0, 60], [1, 110]]) s = s.replace(new RegExp(`(data-ripple="${i}" cx="[^"]*" cy="[^"]*") rx="0" ry="0"`), `$1 rx="${(r * KK).toFixed(1)}" ry="${(r * KK * sinE).toFixed(1)}" style="opacity:.45"`);
  s = s.replace(/class="pj-svc" /g, 'class="pj-svc" data-on="" ').replace(/class="pj-link" /g, 'class="pj-link" style="opacity:.4" ');
  s = s.replace(/class="pj-window" /g, 'class="pj-window" data-on="" ').replace(/class="pj-screen" /g, 'class="pj-screen" data-on="" ').replace(/class="pj-led" /g, 'class="pj-led" data-on="" ');
  return s;
}
writeScene(HERE, { P, svg, data: DATA, sceneCss: SCENE_CSS, poster: posterOf });
console.log("projects: wrote art.js, poster.svg, projects.css", JSON.stringify({ scale: P.scale.toFixed(3) }));
