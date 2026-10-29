// Build the Kubernetes scale-model cluster: node build.mjs  (writes art.js, kubernetes.css and poster.svg)
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan) through ../agentic/bench.mjs.
//
// Truth notes. Words come from courses/index.html, program "Kubernetes cloud native" (cm63 to cm75):
// five modules, containers and K8s basics 12 h, workloads and production 22 h, Helm charts 8 h,
// GitOps and Flux 10 h, observability 14 h. The model is a metaphor: a control-plane block, three node
// trays, pods as crates, a Git ledger synced by a Flux line, a Helm package and a gauge. No numbers on it.
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, kitFor, plinth, writeScene } from "../agentic/bench.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 600, H = 480;
const PLATE = { x: -100, y: -62, w: 200, d: 118, r: 8 };
export const TRAYS = [-56, 0, 56]; // node tray centres along x
const TRAY_Y = 22, TRAY = { w: 44, d: 34 }, TRAY_TOP = 6;
const SLOT = [[-11, -7.5], [11, -7.5], [-11, 7.5], [11, 7.5]]; // crate spots on a tray
const CRATE = { w: 15, d: 11, h: 10 };
const CP = { x: -78, y: -50, w: 38, d: 28, r: 2 }; // control plane block
const CP_TOP = 32;
const LEDGER = { x: 28, y: -56, w: 46, d: 26, r: 2 };
const FLUX = [6, -44];
const HELM = [-22, -32];
const GAUGE = [84, -16];

const extremes = [...k.boxCorners(PLATE, -14, 0), [CP.x, CP.y, CP_TOP + 14], [CP.x + CP.w, CP.y, CP_TOP + 14], [0, TRAY_Y, 70]];
const P = k.fitProjection(extremes, W, H, { pad: 12, azimuth: 50, elevation: 35 });
const K = kitFor(P);
const { S, L, D, at, poly, slab, cyl, plan, byDepth, depth } = K;

/* ---------- control plane ---------- */
function controlPlane() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CP, 0, 2, P)}" style="filter:blur(5px)"/>`];
  out.push(S(slab(k.insetPlan(CP, -2), 0, 3, 4, 0.5), { tone: "lo" }));
  out.push(S(slab(CP, 3, CP_TOP - 3, 4, 0.8), { tone: "hi", crease: "lo", inner: L(k.sideSeam(CP, CP_TOP - 6, P, 4) + k.sideSeam(CP, 12, P, 4), { tone: "faint" }) }));
  const yF = CP.y + CP.d + 0.05, xF = CP.x + CP.w + 0.05;
  // front: three rack modules with closed vent slots and a status dot each
  for (let i = 0; i < 3; i++) {
    const x0 = CP.x + 4 + i * 11.4;
    out.push(L(poly([[x0, yF, 14], [x0 + 9.6, yF, 14], [x0 + 9.6, yF, 24], [x0, yF, 24]], true), { tone: "lo" }));
    out.push(L([0, 1, 2].map((j) => poly([[x0 + 1.6, yF, 16.4 + j * 2.4], [x0 + 6.4, yF, 16.4 + j * 2.4], [x0 + 6.4, yF, 17.4 + j * 2.4], [x0 + 1.6, yF, 17.4 + j * 2.4]], true)).join(""), { tone: "faint" }));
    out.push(`<g data-cp-led="${i}">${D([at([x0 + 8, yF, 22])], { size: 0.7, tone: "hi" })}</g>`);
  }
  out.push(L(poly([[CP.x + 4, yF, 5], [CP.x + 16, yF, 5], [CP.x + 16, yF, 9], [CP.x + 4, yF, 9]], true), { tone: "lo" }));
  out.push(L(poly([[CP.x + 6, yF, 7.6], [CP.x + 13, yF, 7.6]]), { tone: "lo", free: true }));
  // side: vent slots
  out.push(L([0, 1, 2, 3, 4].map((j) => poly([[xF, CP.y + 6, 8 + j * 3.4], [xF, CP.y + CP.d - 6, 8 + j * 3.4], [xF, CP.y + CP.d - 6, 9.4 + j * 3.4], [xF, CP.y + 6, 9.4 + j * 3.4]], true)).join(""), { tone: "lo" }));
  out.push(D([[CP.x + 2, 6], [CP.x + CP.w - 2, 6], [CP.x + 2, CP_TOP - 3], [CP.x + CP.w - 2, CP_TOP - 3]].map(([x, z]) => at([x, yF, z])), { size: 0.42 }));
  // top: three small units and a beacon
  const units = byDepth([[CP.x + 9, CP.y + 9], [CP.x + 22, CP.y + 9], [CP.x + 9, CP.y + 20]]);
  for (const [x, y] of units) out.push(S(slab(plan(x, y, 9, 7, 1), CP_TOP, 5, 3, 0.4), { tone: "mid" }));
  out.push(S(cyl(CP.x + 28, CP.y + 19, 4, CP_TOP, 2, 28, 0.3), { tone: "mid" }));
  out.push(`<g data-beacon="">${S(cyl(CP.x + 28, CP.y + 19, 2.6, CP_TOP + 2, 4, 24, 0.4), { tone: "hi", crease: "lo" })}</g>`);
  return out.join("");
}

/* ---------- node trays ---------- */
const trayPlan = (x) => ({ x: x - TRAY.w / 2, y: TRAY_Y - TRAY.d / 2, w: TRAY.w, d: TRAY.d, r: 2.4 });
function tray(i) {
  const x = TRAYS[i];
  const pl = trayPlan(x);
  const out = [`<path class="iso-halo" d="${k.haloOf(pl, 0, 2, P)}" style="filter:blur(4px)"/>`];
  for (const [fx, fy] of byDepth(k.corners(pl, 4))) out.push(S(cyl(fx, fy, 2, 0, 2.4, P ? 16 : 16), { tone: "mid" }));
  out.push(S(slab(pl, 2.4, TRAY_TOP - 2.4, 6, 0.6), { tone: "mid", inner: L(k.sideSeam(pl, 4, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(pl, 2.4), TRAY_TOP, P, 6), { tone: "lo" }));
  out.push(D(k.corners(k.insetPlan(pl, 1.2)).map(([a, b]) => at([a, b, TRAY_TOP])), { size: 0.42 }));
  // status lamp and a label holder on the front lip
  const yF = pl.y + pl.d + 0.05;
  out.push(`<g data-node-lamp="${i}">${S(cyl(x + 16, yF + 1.4, 1.5, 2.6, 2.2, 16), { tone: "hi", crease: "lo" })}</g>`);
  out.push(L(poly([[x - 8, yF, 3.2], [x + 8, yF, 3.2], [x + 8, yF, 5.2], [x - 8, yF, 5.2]], true), { tone: "lo" }));
  return `<g data-node="${i}">${out.join("")}</g>`;
}
export const SLOTS = TRAYS.flatMap((x) => SLOT.map(([a, b]) => [x + a, TRAY_Y + b]));
// a crate (pod), built at the origin of slot 0 and moved by the live figure
function crate(kind) {
  const [x, y] = SLOTS[0];
  const pl = plan(x, y, CRATE.w, CRATE.d, 0.8);
  const inner = L(k.sideSeam(pl, TRAY_TOP + CRATE.h - 2.2, P, 3), { tone: "faint" });
  let s = S(slab(pl, TRAY_TOP, CRATE.h, 3, 0.5), { tone: "hi", crease: "lo", inner });
  // slats on the front and side faces, edge to edge
  const yF = pl.y + pl.d + 0.05, xF = pl.x + pl.w + 0.05;
  s += L([3.75, 7.5, 11.25].map((a) => k.segment([pl.x + a, yF, TRAY_TOP], [pl.x + a, yF, TRAY_TOP + CRATE.h - 2.2], P)).join("") + [3.67, 7.33].map((b) => k.segment([xF, pl.y + b, TRAY_TOP], [xF, pl.y + b, TRAY_TOP + CRATE.h - 2.2], P)).join(""), { tone: "faint" });
  if (kind === "release") s += L(k.lineOnTop([pl.x + 0.6, y], [pl.x + pl.w - 0.6, y], TRAY_TOP + CRATE.h, P) + k.segment([pl.x + pl.w + 0.06, y, TRAY_TOP], [pl.x + pl.w + 0.06, y, TRAY_TOP + CRATE.h], P), { tone: "lit" });
  return s;
}

/* ---------- Git ledger, Flux, Helm, gauge ---------- */
export const ROWS = 6;
function ledger() {
  const out = [S(slab(LEDGER, 0, 2.4, 4, 0.4), { tone: "lo" })];
  const book = k.insetPlan(LEDGER, 3);
  out.push(S(slab(book, 2.4, 3, 3, 0.3), { tone: "mid", inner: L(k.sideSeam(book, 3.6, P, 3) + k.sideSeam(book, 4.4, P, 3), { tone: "faint" }) }));
  const z = 5.4;
  const mid = book.x + book.w / 2;
  out.push(S(slab({ x: book.x + 1, y: book.y + 1, w: book.w / 2 - 1.4, d: book.d - 2, r: 0.5 }, z, 0.6, 2, 0), { tone: "hi", crease: "none" }));
  out.push(S(slab({ x: mid + 0.4, y: book.y + 1, w: book.w / 2 - 1.4, d: book.d - 2, r: 0.5 }, z, 0.6, 2, 0), { tone: "hi", crease: "none" }));
  out.push(L(k.lineOnTop([mid, book.y + 1], [mid, book.y + book.d - 1], z + 0.6, P), { tone: "mid" }));
  const hist = [];
  for (let i = 0; i < ROWS; i++) hist.push(k.lineOnTop([book.x + 4, book.y + 4 + i * 2.9], [book.x + 9 + ((i * 7) % 9), book.y + 4 + i * 2.9], z + 0.6, P));
  out.push(L(hist.join(""), { tone: "faint", free: true }));
  // the commit dots form a branch line on the left page
  out.push(L(k.lineOnTop([book.x + 2.6, book.y + 4], [book.x + 2.6, book.y + 4 + (ROWS - 1) * 2.9], z + 0.6, P), { tone: "lo" }));
  out.push(D(Array.from({ length: ROWS }, (_, i) => at([book.x + 2.6, book.y + 4 + i * 2.9, z + 0.6])), { size: 0.5, tone: "mid" }));
  const rows = [];
  for (let i = 0; i < ROWS; i++) {
    const y = book.y + 4 + i * 2.9;
    rows.push(`<g data-row="${i}" style="display:none">${D([at([mid + 3, y, z + 0.6])], { size: 0.55, tone: "hi" })}<path class="iso-line" data-tone="mid" data-free="" data-ink-skip="" d="${k.lineOnTop([mid + 4.6, y], [mid + 11 + ((i * 5) % 8), y], z + 0.6, P)}"/></g>`);
  }
  out.push(rows.join(""));
  return out.join("");
}
const FLUX_LINE = [[LEDGER.x, -45, 0.5], [FLUX[0] + 8, -45, 0.5]];
const FLUX_LINE2 = [[FLUX[0] - 8, -45, 0.5], [CP.x + CP.w + 2, -45, 0.5]];
function flux() {
  const [x, y] = FLUX;
  const out = [];
  const a = FLUX_LINE.map(at), b = FLUX_LINE2.map(at);
  out.push(k.wireSvg(a[0], a[1], { tone: "mid", size: 0.9 }), k.wireSvg(b[0], b[1], { tone: "mid", size: 0.9 }));
  out.push(`<path class="iso-line k8-flow" data-ink-skip="" data-flow-line="" d="${k.pathOf([a[0], a[1]])}M${b[0].map((v) => v.toFixed(1)).join(" ")}L${b[1].map((v) => v.toFixed(1)).join(" ")}"/>`);
  out.push(S(slab(plan(x, y, 16, 14, 1.6), 0, 3, 4, 0.5), { tone: "lo" }));
  out.push(S(cyl(x, y, 6, 3, 4, 40, 0.5), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, 6, 3.4, 6.6, 40, P, 0.2), { tone: "faint" }));
  const t = k.radialTicks(x, y, 5.2, 24, 6, 7, [0.8, 1.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(`<path class="iso-line" data-tone="lit" data-free="end" data-ink-skip="" data-flux-hand="" style="stroke-width:1.2" d=""/>`);
  out.push(L(k.ring(x, y, 1, 7, P, 12), { tone: "mid" }));
  out.push(`<circle class="k8-spark" data-spark="" r="1.9" cx="0" cy="0"/>`);
  return out.join("");
}
function helm() {
  const [x, y] = HELM;
  const out = [S(slab(plan(x, y, 18, 16, 1), 0, 2, 3, 0.3), { tone: "lo" })];
  // pallet boards
  out.push(L([-5, 0, 5].map((d) => k.lineOnTop([x - 9, y + d], [x + 9, y + d], 2, P)).join(""), { tone: "faint" }));
  const pk = plan(x, y, 14, 12, 1);
  out.push(S(slab(pk, 2, 10, 3, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(pk, 7, P, 3), { tone: "faint" }) }));
  // two straps over the package, wrapping its visible faces
  const straps = [];
  for (const sx of [x - 3, x + 3]) straps.push(k.lineOnTop([sx, pk.y], [sx, pk.y + pk.d], 12, P) + k.segment([sx, pk.y + pk.d + 0.05, 12], [sx, pk.y + pk.d + 0.05, 2], P));
  out.push(L(straps.join(""), { tone: "mid" }));
  out.push(D([at([x, y, 12])], { size: 0.7, tone: "hi" }));
  return out.join("");
}
function gauge() {
  const [x, y] = GAUGE;
  const out = [S(slab(plan(x, y, 20, 20, 2), 0, 2, 4, 0.4), { tone: "lo" })];
  out.push(S(cyl(x, y, 8.6, 2, 6, 56, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, 8.6, 4.6, 8, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, 7, 8, P, 56), { tone: "lo" }));
  const t = k.radialTicks(x, y, 6.6, 20, 5, 8, [1, 2], P, -Math.PI * 0.75, Math.PI * 1.5);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(`<path class="iso-line" data-tone="lit" data-free="end" data-ink-skip="" data-needle="" style="stroke-width:1.2" d=""/>`);
  out.push(L(k.ring(x, y, 1.1, 8, P, 12), { tone: "mid" }));
  return out.join("");
}
// floor wires: control plane to each tray, trays to the gauge (metrics)
function wires() {
  const out = [];
  const from = (i) => [CP.x + 8 + i * 11, CP.y + CP.d + 2, 0.4];
  TRAYS.forEach((x, i) => {
    const a = from(i);
    const end = [x - 14 + i * 4, TRAY_Y - TRAY.d / 2 + 1, 0.4];
    const via = i === 0 ? [] : [[a[0], -6 + i * 3, 0.4], [end[0], -6 + i * 3, 0.4]];
    const pts = [a, ...via, end].map(at);
    out.push(k.wireSvg(pts[0], pts[pts.length - 1], { via: pts.slice(1, -1), tone: "lo", size: 0.8 }));
  });
  return out.join("");
}
const METRIC = TRAYS.map((x, i) => [[x + 18 - i * 2, TRAY_Y - TRAY.d / 2 + 1, 0.4], [x + 18 - i * 2, -4 - i * 2.5, 0.4], [GAUGE[0] - 6, -4 - i * 2.5, 0.4]]);
function metrics() {
  return METRIC.map((r, i) => { const pts = r.map(at); return k.wireSvg(pts[0], pts[pts.length - 1], { via: pts.slice(1, -1), tone: "faint", size: 0.7 }) + `<path class="iso-line k8-metric" data-ink-skip="" data-metric="${i}" d="${k.pathOf(pts)}"/>`; }).join("");
}

/* ---------- assemble ---------- */
const body = [
  plinth(K, PLATE, { strip: { x: -60, y: PLATE.y + PLATE.d - 14, w: 120, d: 6, r: 1 }, label: { x: -94, y: 42, w: 22, d: 11, r: 1.2 } }),
  `<g data-hit="git" data-flux="">${flux()}</g>`,
  wires(),
  metrics(),
  `<g data-hit="plane">${controlPlane()}</g>`,
  `<g data-helm="">${helm()}</g>`,
  `<g data-hit="git" data-ledger="">${ledger()}</g>`,
  `<g data-gauge="">${gauge()}</g>`,
  `<g data-hit="nodes">${TRAYS.map((_, i) => `${tray(i)}<g data-layer="${i}"></g>`).join("")}</g>`,
  `<g data-hit="pods" data-pods=""><g data-store="" style="display:none">${Array.from({ length: 12 }, (_, i) => `<g data-crate="${i}">${crate("plain")}</g>`).join("")}${Array.from({ length: 3 }, (_, i) => `<g data-crate="${12 + i}" data-release="">${crate("release")}</g>`).join("")}</g><g data-layer="fly"></g></g>`,
];
const LABEL = "Scale model of a Kubernetes cluster on a plinth: a control-plane block, three node trays holding pods as crates, a Git ledger joined to the control plane by a Flux line through a sync dial, a Helm package on a pallet, and a gauge wired to the nodes.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

const r2 = (v) => v.map((n) => +n.toFixed(2));
const ellipse = (cx, cy, z, r) => ({ c: r2(at([cx, cy, z])), u: r2(k.axisVector(P, [r, 0, 0])), v: r2(k.axisVector(P, [0, r, 0])) });
const DATA = {
  slots: SLOTS.map(([x, y]) => r2(k.axisVector(P, [x - SLOTS[0][0], y - SLOTS[0][1], 0]))),
  slotDepth: SLOTS.map(([x, y]) => +depth([x, y, 0]).toFixed(2)),
  z1: r2(k.axisVector(P, [0, 0, 1])),
  rows: ROWS,
  flux: [...FLUX_LINE, ...FLUX_LINE2].map(at).map(r2),
  fluxDial: ellipse(FLUX[0], FLUX[1], 7, 1),
  gaugeDial: ellipse(GAUGE[0], GAUGE[1], 8.1, 1),
};

const SCENE_CSS = `/* kubernetes model: scene tokens and states (kit palette from ../cellular/mast.css) */
.iso{--k8-spark:#00D9FF;--k8-flow:#00708a}
:root[data-theme="dark"] .iso{--k8-flow:#00D9FF}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .iso{--k8-flow:#00D9FF}}
[data-hit]{--hl:var(--anatomy-lit)}
.k8-flow,.k8-metric{fill:none;stroke:var(--k8-flow);stroke-width:1.1;stroke-dasharray:2 5;stroke-linecap:round;opacity:0;animation:iso-flow .9s linear infinite}
.k8-metric{stroke-width:.9;animation-duration:1.4s}
.k8-spark{fill:var(--k8-spark);opacity:0}
[data-node][data-down] .iso-line{stroke:var(--anatomy-faint);transition:stroke .5s}
[data-node][data-down] .iso-top{fill:var(--anatomy-shade-3)}[data-node][data-down] .iso-shade{fill:var(--anatomy-shade-1)}
[data-node][data-down] .iso-dots{opacity:.3}
[data-node-lamp] .iso-top{fill:var(--k8-spark)}
[data-node][data-down] [data-node-lamp] .iso-top{fill:var(--anatomy-shade-0)}
[data-beacon][data-lit] .iso-top,[data-beacon][data-lit] .iso-shade{fill:color-mix(in srgb,var(--k8-spark) 70%,var(--anatomy-top))}
[data-cp-led] circle{fill:var(--k8-spark)}
[data-cur] .iso-edge{stroke:var(--anatomy-lit)}
[data-cur] .iso-top{fill:var(--anatomy-lit-top)}
[data-cur] .iso-shade{fill:var(--anatomy-lit-shade)}
[data-release] .iso-top{fill:color-mix(in srgb,var(--k8-spark) 16%,var(--anatomy-top))}
[data-release] .iso-edge{stroke:var(--anatomy-lit)}
.iso-svg[data-ink] .k8-spark,.iso-svg[data-ink] .k8-flow,.iso-svg[data-ink] .k8-metric{opacity:0!important}
`;
writeFileSync(HERE + "/kubernetes.css", SCENE_CSS);

// poster: the workloads pose after a failed node, crates placed statically (2 + 2 on trays 1 and 2, 2 rescheduled)
function posterOf(s) {
  const at6 = [0, 1, 2, 4, 5, 6];
  let crates = "";
  at6.forEach((slot, n) => { const v = DATA.slots[slot]; crates += `<g transform="translate(${v[0]} ${v[1]})">${crate("plain")}</g>`; });
  void crates;
  const byTray = [[], [], []];
  at6.forEach((slot) => byTray[Math.floor(slot / 4)].push(slot));
  for (let t = 0; t < 3; t++) {
    const g = byTray[t].sort((a, b) => DATA.slotDepth[a] - DATA.slotDepth[b]).map((slot) => { const v = DATA.slots[slot]; return `<g transform="translate(${v[0]} ${v[1]})">${crate("plain")}</g>`; }).join("");
    s = s.replace(`<g data-layer="${t}"></g>`, `<g data-layer="${t}">${g}</g>`);
  }
  const hand = (e, ang, r0, r1) => { const q = (r) => [e.c[0] + Math.sin(ang) * r * e.u[0] - Math.cos(ang) * r * e.v[0], e.c[1] + Math.sin(ang) * r * e.u[1] - Math.cos(ang) * r * e.v[1]].map((v) => v.toFixed(1)); return `M${q(r0).join(" ")}L${q(r1).join(" ")}`; };
  s = s.replace('data-needle="" style="stroke-width:1.2" d=""', `data-needle="" style="stroke-width:1.2" d="${hand(DATA.gaugeDial, -0.45 * Math.PI, -1.6, 5.8)}"`).replace('data-flux-hand="" style="stroke-width:1.2" d=""', `data-flux-hand="" style="stroke-width:1.2" d="${hand(DATA.fluxDial, 0, -1.4, 4.6)}"`);
  return s.replace('<g data-node="2">', '<g data-node="2" data-down="">').replace(/<g data-store="" style="display:none">[\s\S]*?<\/g><g data-layer="fly">/, '<g data-layer="fly">');
}
writeScene(HERE, { P, svg, data: DATA, sceneCss: SCENE_CSS, poster: posterOf });
console.log("kubernetes: wrote art.js, poster.svg, kubernetes.css", JSON.stringify({ scale: P.scale.toFixed(3) }));
