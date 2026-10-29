// Build the risk-management figure: node build.mjs
// Writes art.js (static SVG + data for live.js), scene.css and poster.svg.
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan), reused, not copied.
//
// Truth notes: the figure is a metaphor for the program "Gestión del riesgo para telco e IA cloud native"
// (courses/index.html, cm101 to cm114). The engraved gauge names are the frameworks and regulations the
// program names (cm104, cm105, cm108). Token positions and gauge readings are illustrative.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../cellular/iso-kit.mjs";
import { W, H, AZIMUTH, PLATE, FOOT, CAB, FRAME, TOP, GRID, BRIDGE, GAUGE_R, GAUGE_Y, GAUGE_XS, GAUGE_TOP, LEVER, DRAWER, GAUGES, TOKENS, cellAt, zoneOf, tokenAt, gaugeAt, needleAngle, leverY } from "./model.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const extremes = [...k.boxCorners(PLATE, -FOOT, 0), ...k.boxCorners(BRIDGE, 0, GAUGE_TOP + 1), [LEVER.x + 7, LEVER.y1, 32]];
const P = k.fitProjection(extremes, W, H, { pad: 8, azimuth: AZIMUTH });
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const poly = (pts, closed = false) => k.pathOf(pts.map(at), closed);
const depth = ([x, y]) => k.depthOf([x, y, 0], P);
const byDepth = (pts) => [...pts].sort((a, b) => depth(a) - depth(b));
const slab = (plan, z, h, steps = 3, bevel = 0.4) => k.slabOf(plan, z, h, P, steps, bevel);
const rectY = (y, x0, x1, z0, z1) => poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
const rectX = (x, y0, y1, z0, z1) => poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], true);
const textOnY = (x, y, z, text, size, tone = "hi") => {
  const O = at([x, y, z]);
  const X = at([x + 1, y, z]);
  const Y = at([x, y, z - 1]);
  const m = [X[0] - O[0], X[1] - O[1], Y[0] - O[0], Y[1] - O[1], O[0], O[1]].map((v) => Math.round(v * 1000) / 1000).join(" ");
  return k.faceTextSvg(`matrix(${m})`, text, { size, tone, anchor: "middle" });
};

/* ---------- plinth ---------- */
function plinth() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -FOOT, FOOT, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -FOOT, 1.6, P, 22), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -FOOT + 1.6, 3.4, P, 22), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const lp = { x: 50, y: 56, w: 22, d: 11, r: 1.2 };
  out.push(S(k.slabOf(lp, 0, 0.8, P, 4, 0.3), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(lp, 1.6), 0.8, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([lp.x + 4, lp.y + 3.6], [lp.x + 16, lp.y + 3.6], 0.8, P) + k.lineOnTop([lp.x + 4, lp.y + 5.8], [lp.x + 13, lp.y + 5.8], 0.8, P) + k.lineOnTop([lp.x + 4, lp.y + 8], [lp.x + 10, lp.y + 8], 0.8, P), { tone: "lo", free: true }));
  out.push(D([at([lp.x + 19, lp.y + 3, 0.8]), at([lp.x + 19, lp.y + 8, 0.8])], { size: 0.45 }));
  return out.join("");
}

/* ---------- gauge bridge with five dial gauges ---------- */
function bridge() {
  const B = BRIDGE;
  const out = [`<path class="iso-halo" d="${k.haloOf(B, 0, 2, P)}" style="filter:blur(5px)"/>`];
  out.push(S(slab(k.insetPlan(B, -1.5), 0, 2.4, 4, 0.4), { tone: "lo" }));
  out.push(S(slab(B, 2.4, B.h - 2.4, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(B, 8, P, 4) + k.sideSeam(B, 22, P, 4), { tone: "faint" }) }));
  const yF = B.y + B.d + 0.05;
  // name plates on the front face, one under each gauge, engraved with the framework's name
  GAUGE_XS.forEach((x, g) => {
    out.push(`<g data-plate="${g}">${L(rectY(yF, x - 10.5, x + 10.5, 25, 33.5), { tone: "lo" })}${textOnY(x, yF, 28.2, GAUGES[g], 2.5)}${D([at([x - 9.3, yF, 32.3]), at([x + 9.3, yF, 32.3]), at([x - 9.3, yF, 26.2]), at([x + 9.3, yF, 26.2])], { size: 0.38 })}</g>`);
  });
  const xF = B.x + B.w + 0.05;
  const vents = [];
  for (let i = 0; i < 5; i++) { const z = 14 + i * 3.6; vents.push(rectX(xF, B.y + 5, B.y + B.d - 5, z, z + 1.4)); }
  out.push(L(vents.join(""), { tone: "lo" }));
  return out.join("");
}
const TICK_FROM = -120 * Math.PI / 180;
const TICK_SPAN = 240 * Math.PI / 180;
function gauge(x, g, t) {
  const y = GAUGE_Y;
  const z0 = BRIDGE.h;
  const top = GAUGE_TOP;
  const out = [];
  out.push(S(k.cylinder(x, y, GAUGE_R + 0.8, z0, 1.2, P, 28, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, GAUGE_R, z0 + 1.2, top - z0 - 1.2, P, 32, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideArc(x, y, GAUGE_R, top - 2.2, P, 32), { tone: "faint" }) }));
  out.push(L(k.knurl(x, y, GAUGE_R, top - 2.2, top, 36, P, 0.25), { tone: "lo" }));
  out.push(L(k.ring(x, y, GAUGE_R - 1.4, top, P, 32), { tone: "lo" }));
  // the green band at the low end of the scale
  const band = [];
  for (let i = 0; i <= 16; i++) { const a = TICK_FROM + (i / 16) * (TICK_SPAN * 0.25); band.push([x + Math.sin(a) * (GAUGE_R - 3.1), y - Math.cos(a) * (GAUGE_R - 3.1)]); }
  out.push(`<path class="gauge-band" d="${k.onTop(band, top, P)}"/>`);
  const ticks = k.radialTicks(x, y, GAUGE_R - 1.6, 12, 3, top, [1, 2], P, TICK_FROM, TICK_SPAN);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.1, top, P, 16), { tone: "mid" }));
  const v = gaugeAt(g, t);
  out.push(`<path data-needle="${g}" class="iso-line needle" data-tone="lit" data-free="start" d="${needleD(x, v)}"/>`);
  out.push(D([at([x, y, top])], { size: 0.6, tone: "hi" }));
  return `<g data-gauge="${g}">${out.join("")}</g>`;
}
function needleD(x, v) {
  const a = needleAngle(v);
  const dx = Math.sin(a), dy = -Math.cos(a);
  return k.lineOnTop([x - dx * 1.8, GAUGE_Y - dy * 1.8], [x + dx * (GAUGE_R - 2.4), GAUGE_Y + dy * (GAUGE_R - 2.4)], GAUGE_TOP + 0.1, P);
}

/* ---------- register cabinet with a card drawer pulled part way out ---------- */
function cabinet() {
  const C = CAB;
  const out = [`<path class="iso-halo" d="${k.haloOf(C, 0, 2, P)}" style="filter:blur(5px)"/>`];
  out.push(S(slab(k.insetPlan(C, -1.5), 0, 2, 4, 0.4), { tone: "lo" }));
  out.push(S(slab(C, 2, C.h - 2, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(C, 9.5, P, 4), { tone: "faint" }) }));
  const yF = C.y + C.d + 0.05;
  const xF = C.x + C.w + 0.05;
  // second (closed) drawer on the right, with its pull
  out.push(L(rectY(yF, 28, 42, DRAWER.z0, DRAWER.z1), { tone: "lo" }));
  out.push(L(poly([[32, yF, 10.6], [38, yF, 10.6]]), { tone: "mid" }));
  out.push(D([at([32, yF, 10.6]), at([38, yF, 10.6])], { size: 0.5, tone: "mid" }));
  // closed vents on the +x face
  const vents = [];
  for (let i = 0; i < 3; i++) { const z = 5 + i * 3.4; vents.push(rectX(xF, C.y + 30, C.y + C.d - 30, z, z + 1.4)); }
  out.push(L(vents.join(""), { tone: "lo" }));
  // the open drawer's slot, dark inside
  out.push(`<path class="iso-shade" data-shade="0" d="${rectY(yF, DRAWER.x - 0.4, DRAWER.x + DRAWER.w + 0.4, DRAWER.z0 - 0.4, DRAWER.z1 + 0.4)}"/>`);
  return out.join("");
}
function drawer() {
  const y0 = CAB.y + CAB.d;
  const y1 = y0 + DRAWER.out;
  const body = { x: DRAWER.x, y: y0 - 1, w: DRAWER.w, d: DRAWER.out + 1, r: 0.3 };
  const out = [S(slab(body, DRAWER.z0, DRAWER.z1 - DRAWER.z0 - 2, 2, 0.2), { tone: "mid" })];
  // index cards standing in the drawer, tabs staggered
  const cards = [];
  for (let i = 0; i < 6; i++) {
    const y = y0 + 0.4 + i * 1.05;
    const tab = DRAWER.x + 6 + (i % 3) * 16;
    cards.push(S(slab({ x: DRAWER.x + 2, y, w: DRAWER.w - 4, d: 0.35, r: 0 }, DRAWER.z1 - 3, 2.6, 1, 0), { tone: "lo", crease: "none" }));
    cards.push(S(slab({ x: tab, y, w: 9, d: 0.35, r: 0 }, DRAWER.z1 - 0.4, 1.4, 1, 0), { tone: "mid", crease: "none" }));
  }
  out.push(`<g data-cards="">${cards.join("")}</g>`);
  const front = { x: DRAWER.x - 1, y: y1, w: DRAWER.w + 2, d: 1.4, r: 0.4 };
  const yF = y1 + 1.45;
  out.push(S(slab(front, DRAWER.z0 - 0.6, DRAWER.z1 - DRAWER.z0 + 1.2, 2, 0.3), { tone: "hi", crease: "lo" }));
  const cx = DRAWER.x + DRAWER.w / 2;
  out.push(L(rectY(yF, cx - 7, cx + 7, 10.2, 13.6), { tone: "lo" }));
  out.push(L(poly([[cx - 5.6, yF, 12.5], [cx + 3.5, yF, 12.5]]) + poly([[cx - 5.6, yF, 11.3], [cx + 1, yF, 11.3]]), { tone: "lo", free: true }));
  // pull: two posts and a bar
  for (const x of [cx - 5, cx + 5]) out.push(S(slab({ x: x - 0.6, y: yF, w: 1.2, d: 1.6, r: 0.3 }, 6.3, 1.4, 2, 0.1), { tone: "mid", crease: "none" }));
  out.push(S(slab({ x: cx - 6, y: yF + 1.6, w: 12, d: 1, r: 0.4 }, 6.1, 1.8, 2, 0.2), { tone: "hi", crease: "lo" }));
  return out.join("");
}

/* ---------- heat-map board ---------- */
function board() {
  const F = { x: FRAME.x, y: FRAME.y, w: FRAME.w, d: FRAME.d, r: FRAME.r };
  const out = [S(slab(F, FRAME.z, FRAME.h, 4, 0.8), { tone: "mid" })];
  const tiles = [];
  for (let l = 1; l <= 5; l++) for (let i = 1; i <= 5; i++) {
    const [cx, cy] = cellAt(l, i);
    const h = GRID.cell / 2 - 0.8;
    tiles.push(`<g class="tile" data-z="${zoneOf(l, i)}">${S(slab({ x: cx - h, y: cy - h, w: h * 2, d: h * 2, r: 0.8 }, TOP, 0.5, 2, 0), { tone: "lo", crease: "none", flat: true })}</g>`);
  }
  out.push(tiles.join(""));
  // rulers on the frame margins: impact along the front, likelihood along the left
  const front = k.topTicks(GRID.x, GRID.x + GRID.n * GRID.cell, GRID.cell / 4, 4, GRID.y + GRID.n * GRID.cell + 0.6, TOP, [1.6, 3], P);
  const left = k.topTicks(GRID.y, GRID.y + GRID.n * GRID.cell, GRID.cell / 4, 4, FRAME.x + 1.2, TOP, [1.6, 3], P, "y");
  out.push(L(front.minor + left.minor, { tone: "lo" }), L(front.major + left.major, { tone: "mid" }));
  out.push(D(k.corners(F, 2.6).map(([x, y]) => at([x, y, TOP])), { size: 0.5 }));
  return out.join("");
}

/* ---------- tokens ---------- */
function tokenSvg(n) {
  const z = TOP + 0.5;
  const r = 4.3;
  const body = S(k.cylinder(0, 0, r, z, 2.6, P, 22, 0.4), { tone: "hi", crease: "lo", inner: L(k.sideArc(0, 0, r, z + 1.3, P, 24), { tone: "faint" }) });
  const pips = [];
  for (let i = 0; i <= n; i++) { const a = (i / (n + 1)) * Math.PI * 2 - Math.PI / 2; pips.push(n === 0 ? at([0, 0, z + 2.6]) : at([Math.cos(a) * 1.7, Math.sin(a) * 1.7, z + 2.6])); }
  return `<g data-token="${n}">` + `<path class="iso-halo" d="${k.haloOf({ x: -r, y: -r, w: r * 2, d: r * 2, r }, z, 0.1, P)}" style="filter:blur(2px)"/>` + body + L(k.ring(0, 0, r - 1, z + 2.6, P, 18), { tone: "lo" }) + D(pips, { size: 0.42, tone: "hi" }) + `</g>`;
}

/* ---------- control lever ---------- */
function leverBase() {
  const V = LEVER;
  const out = [`<path class="iso-halo" d="${k.haloOf(V, 0, 1, P)}" style="filter:blur(4px)"/>`];
  // linkage: a push rod from the lever housing into the register cabinet, with a boot at each end
  const ry = 12, rz = 4.6;
  out.push(S(slab({ x: CAB.x + CAB.w, y: ry - 2, w: 1.4, d: 4, r: 0.5 }, rz - 2, 4, 2, 0.2), { tone: "mid" }));
  out.push(`<path class="iso-line" data-tone="mid" style="stroke-width:1.4" d="${poly([[CAB.x + CAB.w + 1.4, ry, rz], [V.x - 1.4, ry, rz]])}"/>`);
  out.push(S(slab({ x: V.x - 1.4, y: ry - 2, w: 1.4, d: 4, r: 0.5 }, rz - 2, 4, 2, 0.2), { tone: "mid" }));
  out.push(S(slab(V, 0, V.h, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(V, 3.5, P, 3), { tone: "faint" }) }));
  const slot = { x: V.x + 5, y: V.y0 - 4, w: 4, d: V.y1 - V.y0 + 8, r: 2 };
  out.push(`<path class="iso-shade" data-shade="0" d="${k.planOutline(slot, V.h, P)}"/>`);
  out.push(L(k.planOutline(slot, V.h, P), { tone: "mid" }));
  // ticks hang inward from the housing's near edge, like a ruler strip
  const t = k.topTicks(V.y0, V.y1, (V.y1 - V.y0) / 8, 4, V.x + V.w - 0.5, V.h, [-1.6, -2.8], P, "y");
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // the green end of the travel
  out.push(`<path class="gauge-band" d="${k.lineOnTop([V.x + V.w - 0.9, V.y1 - (V.y1 - V.y0) / 4], [V.x + V.w - 0.9, V.y1], V.h + 0.05, P)}"/>`);
  out.push(D(k.corners(V, 1.8).map(([x, y]) => at([x, y, V.h])), { size: 0.45 }));
  return out.join("");
}
function leverHandle() {
  const V = LEVER;
  const x = V.x + 7;
  const y = V.y0;
  const out = [];
  out.push(S(slab({ x: x - 4.5, y: y - 3.5, w: 9, d: 7, r: 1 }, V.h, 1.8, 2, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 1.4, V.h + 1.8, 15, P, 20), { tone: "mid", crease: "none", inner: L(k.sideArc(x, y, 1.4, V.h + 9, P, 12), { tone: "faint" }) }));
  out.push(S(k.cylinder(x, y, 2.2, V.h + 16.8, 1.2, P, 24, 0.2), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 3.8, V.h + 18, 6, P, 40, 0.5), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, 3.8, V.h + 18, V.h + 24, 40, P, 0.6), { tone: "lo" }));
  out.push(L(k.ring(x, y, 2.2, V.h + 24, P, 24), { tone: "faint" }));
  return out.join("");
}

/* ---------- assemble ---------- */
const hit = (name, body) => `<g data-hit="${name}">${body}</g>`;
const layers = (t) => [
  plinth(),
  hit("gauges", bridge() + GAUGE_XS.map((x, g) => gauge(x, g, t)).join("")),
  hit("drawer", cabinet() + drawer()),
  hit("board", board()),
  `<g data-hit="tokens" data-layer="tokens">${byDepthTokens(t).map((n) => tokenPlaced(n, t)).join("")}</g>`,
  hit("lever", leverBase() + `<g data-handle=""${t > 0 ? ` transform="${k.translateAlong(P, [0, leverY(t) - LEVER.y0, 0])}"` : ""}>${leverHandle()}</g>`),
];
function byDepthTokens(t) { return TOKENS.map((_, n) => n).sort((a, b) => { const A = tokenAt(a, t), B = tokenAt(b, t); return depth([A.x, A.y]) - depth([B.x, B.y]); }); }
function tokenPlaced(n, t) { const p = tokenAt(n, t); return tokenSvg(n).replace(`<g data-token="${n}">`, `<g data-token="${n}" transform="${k.translateAlong(P, [p.x, p.y, 0])}">`); }

const LABEL = "Scale model of a risk register on a plinth: a five by five heat-map board of likelihood by impact on a card cabinet, seven risk tokens on the board, five dial gauges for ISO 27005, NIST RMF, 3GPP, the EU AI Act and GDPR on a bridge behind it, and a control lever that slides the tokens toward the green corner.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body: layers(0) });

const AX = k.axisVector(P, [1, 0, 0]);
const AY = k.axisVector(P, [0, 1, 0]);
const AZ = k.axisVector(P, [0, 0, 1]);
const round = (v) => v.map((n) => Math.round(n * 10000) / 10000);
writeFileSync(join(HERE, "art.js"), `// Generated by build.mjs. Do not edit by hand.\nexport const AXES = ${JSON.stringify([round(AX), round(AY), round(AZ)])};\nexport const ORIGIN = ${JSON.stringify(round(at([0, 0, 0])))};\nexport const SVG = ${JSON.stringify(svg)};\n`);

/* ---------- CSS ---------- */
const kitRules = k.ISO_CSS.slice(k.ISO_CSS.indexOf(".iso-svg{")).replace(/\.iso-figure\{[\s\S]*$/, "");
const LIGHT = `--anatomy-page:#f3f5f8;--anatomy-card:#ffffff;--anatomy-text:#3b4a5c;--anatomy-strong:#0d1b2a;--anatomy-muted:#6b7c8f;
  --anatomy-paper:#ffffff;--anatomy-face:#ffffff;--anatomy-top:#ffffff;
  --anatomy-shade-0:#d6dee7;--anatomy-shade-1:#e1e7ee;--anatomy-shade-2:#eaeff4;--anatomy-shade-3:#f3f6f9;
  --anatomy-lit-top:#ffffff;--anatomy-lit-shade:#e4f0f3;
  --anatomy-hi:#0d1b2a;--anatomy-mid:#6a7d91;--anatomy-lo:#a8b6c4;--anatomy-faint:#d3dbe4;--anatomy-lit:#00708a;
  --anatomy-halo:#1a5276;--anatomy-halo-opacity:.2;--anatomy-dot:#0d1b2a;
  --z0:color-mix(in srgb,#00708a 22%,#fff);--z1:#f3f6f9;--z2:color-mix(in srgb,#0d1b2a 9%,#fff);--z3:color-mix(in srgb,#0d1b2a 20%,#fff);--band:#00708a;--hl:#00708a`;
const DARK = `--anatomy-page:#0a1420;--anatomy-card:#111f2e;--anatomy-text:#c3cfdb;--anatomy-strong:#eaf0f6;--anatomy-muted:#9aabbf;
  --anatomy-paper:#111f2e;--anatomy-face:#17293c;--anatomy-top:#1b2e43;
  --anatomy-shade-0:#0b1622;--anatomy-shade-1:#0e1a28;--anatomy-shade-2:#11202f;--anatomy-shade-3:#142537;
  --anatomy-lit-top:#20364c;--anatomy-lit-shade:#182b3f;
  --anatomy-hi:#dce6f0;--anatomy-mid:#6f849a;--anatomy-lo:#3f5368;--anatomy-faint:#26384b;--anatomy-lit:#00D9FF;
  --anatomy-halo:#02060b;--anatomy-halo-opacity:.8;--anatomy-dot:#eaf0f6;
  --z0:color-mix(in srgb,#00D9FF 20%,#111f2e);--z1:#17293c;--z2:color-mix(in srgb,#eaf0f6 10%,#111f2e);--z3:color-mix(in srgb,#eaf0f6 19%,#111f2e);--band:#00D9FF;--hl:#00D9FF`;
const FIG_CSS = `
/* risk-management figure (site palette); kit rules below are from iso-kit.mjs, MIT, (c) 2026 Ryan */
.iso{${LIGHT};--anatomy-weight:.6px;--anatomy-ease:cubic-bezier(.32,.72,0,1);--anatomy-mono:"Instrument Sans",ui-sans-serif,system-ui,sans-serif}
:root[data-theme="dark"] .iso{${DARK}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .iso{${DARK}}}
.sc-long .stg-h{font-size:clamp(30px,3.3vw,46px);line-height:1.04}
.sc-long .stg-h small{font-size:.42em}
@media (max-width:639px){.sc-long .stg-h{font-size:30px}}
.sc-tokens{display:block;margin-top:8px;font-size:13px;color:var(--s-ink-2,#1a5276)}
.iso-face-text{font-family:"Instrument Sans",ui-sans-serif,system-ui,sans-serif;font-weight:600;letter-spacing:.06em}
[data-hit] .tile[data-z] .iso-fill,[data-hit] .tile[data-z] .iso-top{fill:var(--z1)}
[data-hit] .tile[data-z="0"] .iso-fill,[data-hit] .tile[data-z="0"] .iso-top{fill:var(--z0)}
[data-hit] .tile[data-z="2"] .iso-fill,[data-hit] .tile[data-z="2"] .iso-top{fill:var(--z2)}
[data-hit] .tile[data-z="3"] .iso-fill,[data-hit] .tile[data-z="3"] .iso-top{fill:var(--z3)}
.gauge-band{fill:none;stroke:var(--band);stroke-width:1.6;stroke-linecap:round}
.needle{stroke-width:1.1}
[data-hit]{cursor:pointer}
[data-hit="lever"]{cursor:grab}
[data-hit][data-on] .iso-edge,[data-hit][data-on] .iso-crease,[data-hit][data-on] .iso-bevel,[data-hit][data-on] .iso-line[data-tone="mid"],[data-hit][data-on] .iso-line[data-tone="hi"],
[data-token][data-on] .iso-edge,[data-token][data-on] .iso-crease,[data-gauge][data-on] .iso-edge,[data-gauge][data-on] .iso-crease,[data-gauge][data-on] .iso-line[data-tone="mid"],[data-plate][data-on] .iso-line{stroke:var(--hl);transition:stroke .3s}
[data-hit][data-on] .iso-top,[data-token][data-on] .iso-top,[data-gauge][data-on] .iso-top{fill:color-mix(in srgb,var(--hl) 14%,var(--anatomy-top))}
[data-hit][data-on] .iso-shade,[data-token][data-on] .iso-shade,[data-gauge][data-on] .iso-shade{fill:color-mix(in srgb,var(--hl) 12%,var(--anatomy-shade-2))}
[data-hit][data-on] .iso-dots circle,[data-token][data-on] .iso-dots circle{fill:var(--hl);opacity:.95}
[data-plate][data-on] .iso-face-text{fill:var(--hl)}
.iso-svg[data-ink] .iso-fill,.iso-svg[data-ink] .iso-shade,.iso-svg[data-ink] .iso-top,.iso-svg[data-ink] .iso-halo,.iso-svg[data-ink] .iso-dots,.iso-svg[data-ink] .iso-face-text,.iso-svg[data-ink] .gauge-band,.iso-svg[data-ink] [data-layer]{opacity:0}
.iso-svg[data-ink] .iso-line{stroke-dasharray:1 1;stroke-dashoffset:1}
.iso-svg[data-inking] .iso-line{transition:stroke-dashoffset 1.5s cubic-bezier(.45,.05,.25,1)}
.iso-svg[data-filling] .iso-fill,.iso-svg[data-filling] .iso-shade,.iso-svg[data-filling] .iso-top,.iso-svg[data-filling] .iso-dots,.iso-svg[data-filling] .iso-face-text,.iso-svg[data-filling] .gauge-band,.iso-svg[data-filling] [data-layer]{transition:opacity .7s ease}
.iso-svg[data-filling] .iso-halo{transition:opacity .9s ease}
`;
writeFileSync(join(HERE, "scene.css"), FIG_CSS + kitRules + "\n");

/* ---------- poster: controls applied, light by default, dark via poster.svg#dark ---------- */
function posterOf() {
  let s = k.figureSvg({ width: W, height: H, label: LABEL, body: layers(1) });
  const css = FIG_CSS.replace(/:root\[data-theme="dark"\] \.iso\{/, ".iso:has(#dark:target){").replace(/@media \(prefers-color-scheme:dark\)\{[^\n]*\n/, "").replace(/\.sc-long[^\n]*\n/g, "").replace(/@media \(max-width:639px\)[^\n]*\n/, "") + kitRules + ".iso{background:var(--anatomy-card)}";
  s = s.replace('class="iso-svg"', 'class="iso-svg iso"').replace(/^<svg([^>]*)>/, `<svg$1><style>${css.replace(/\n/g, "")}</style><g id="dark"/><rect width="100%" height="100%" fill="var(--anatomy-card)"/>`);
  return s;
}
writeFileSync(join(HERE, "poster.svg"), posterOf());
console.log("wrote art.js, scene.css, poster.svg", JSON.stringify(P));
