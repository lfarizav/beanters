// Build the agentic-engineering workbench: node build.mjs  (writes art.js and poster.svg)
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan) through bench.mjs.
//
// Truth notes. Every word the scene shows comes from courses/index.html, program "Ingeniería agéntica"
// (cm50 to cm62): five modules, LLM fundamentals 8 h, prompt engineering 6 h, agent patterns 14 h,
// AEF framework 10 h, multi-agent orchestration 20 h. The object is a metaphor, not a claim:
// a gantry arm (the agent) runs plan, act, observe; each tool on the rack stands for one module;
// the ledger keeps what each action returned. Nothing on the bench carries a number.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, kitFor, plinth, writeScene } from "./bench.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 600, H = 520;
const PLATE = { x: -104, y: -44, w: 208, d: 112, r: 8 };
const POST_X = 80, BEAM_Y = -27, BEAM_Z = 66;
const ARM_Y = -12; // the line the gripper works on
export const SLOTS = [-72, -50, -28, -6, 16]; // one cradle per module, along x
export const PAD = [52, -10];
export const G_UP = 36, G_DOWN = 18.5; // finger-tip height
const TOOL_Z = 4; // tools stand on cradles 4 high
const ROD_LEN = 50;

const extremes = [...k.boxCorners(PLATE, -14, 0), [-POST_X, BEAM_Y, 108], [POST_X, BEAM_Y, 108], [0, ARM_Y, 108]];
const P = k.fitProjection(extremes, W, H, { pad: 14, azimuth: 58 });
const K = kitFor(P);
const { S, L, D, at, poly, slab, cyl, plan, byDepth } = K;

/* ---------- gantry ---------- */
function post(x, front) {
  const out = [];
  if (!front) {
    out.push(S(slab(plan(x, BEAM_Y, 16, 16, 1.5), 0, 1.6, 4, 0.4), { tone: "lo" }));
    out.push(D([[-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]].map(([a, b]) => at([x + a, BEAM_Y + b, 1.6])), { size: 0.45 }));
  }
  out.push(S(slab(plan(x, BEAM_Y, 8, 8, 1), 1.6, BEAM_Z - 1.6, 4, 0.5), { tone: "mid", crease: "none", inner: L(k.sideSeam(plan(x, BEAM_Y, 8, 8, 1), 30, P, 4), { tone: "faint" }) }));
  return out.join("");
}
function beam() {
  const b = { x: -POST_X - 6, y: BEAM_Y - 4, w: POST_X * 2 + 12, d: 8, r: 1 };
  const out = [S(slab(b, BEAM_Z, 8, 3, 0.5), { tone: "mid" })];
  // linear rail on the beam top, with its end stops
  out.push(S(slab({ x: b.x + 6, y: BEAM_Y - 1.2, w: b.w - 12, d: 2.4, r: 0.4 }, BEAM_Z + 8, 1.2, 2, 0.2), { tone: "mid", crease: "none" }));
  for (const x of [b.x + 4, b.x + b.w - 7]) out.push(S(slab({ x, y: BEAM_Y - 2.4, w: 3, d: 4.8, r: 0.5 }, BEAM_Z + 8, 3, 2, 0.2), { tone: "mid" }));
  // bolt dots along the beam's front face
  const yF = b.y + b.d + 0.05;
  const dots = [];
  for (let x = b.x + 10; x < b.x + b.w - 6; x += 12) dots.push(at([x, yF, BEAM_Z + 4]));
  out.push(D(dots, { size: 0.4, tone: "mid" }));
  // cable anchor block at the left end
  out.push(S(slab(plan(-70, BEAM_Y, 6, 6, 0.8), BEAM_Z + 8, 5, 3, 0.3), { tone: "mid" }));
  return out.join("");
}
// carriage and the parts that ride on it, built at x = 0
function carriage() {
  const c = { x: -9, y: BEAM_Y - 7, w: 18, d: 29, r: 1.5 };
  const out = [];
  out.push(S(slab(c, 60, 20, 4, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(c, 70, P, 4), { tone: "faint" }) }));
  // a vent of closed slots on the front face and two screws
  const yF = c.y + c.d + 0.05;
  out.push(L([0, 1, 2].map((i) => poly([[-5, yF, 64 + i * 3.2], [5, yF, 64 + i * 3.2], [5, yF, 65.4 + i * 3.2], [-5, yF, 65.4 + i * 3.2]], true)).join(""), { tone: "lo" }));
  out.push(D([[-7, 77.5], [7, 77.5]].map(([x, z]) => at([x, yF, z])), { size: 0.42 }));
  // sleeve that guides the rod, with a cap
  out.push(S(slab(plan(0, ARM_Y, 7, 7, 0.8), 80, 24, 3, 0.4), { tone: "mid", crease: "none" }));
  out.push(S(slab(plan(0, ARM_Y, 9, 9, 1), 104, 2, 3, 0.3), { tone: "mid" }));
  out.push(S(cyl(-2.8, ARM_Y + 3.6, 1.2, 96, 2.4, 12), { tone: "mid" }));
  return out.join("");
}
// rod, gripper body and fingers, built with the finger tips at z = 0
function gripper() {
  const out = [];
  out.push(S(slab(plan(0, ARM_Y, 3, 3, 0.6), 11, ROD_LEN, 2, 0.2), { tone: "mid", crease: "none" }));
  out.push(S(slab(plan(0, ARM_Y, 13, 9, 1.2), 6, 5, 3, 0.5), { tone: "hi", crease: "lo" }));
  out.push(D([[-4.5, 11], [4.5, 11]].map(([x, z]) => at([x, ARM_Y + 4.55, z - 2.5])), { size: 0.4 }));
  const finger = (s) => `<g data-finger="${s}">${S(slab(plan(s * 3.4, ARM_Y, 1.6, 5, 0.3), 0, 6, 2, 0.2), { tone: "hi", crease: "lo" })}</g>`;
  out.push(finger(-1), finger(1));
  return out.join("");
}

/* ---------- rack and tools ---------- */
function rack() {
  const base = { x: -85, y: -22, w: 114, d: 24, r: 2 };
  const out = [S(slab(base, 0, 2, 4, 0.4), { tone: "lo" })];
  for (const x of SLOTS) {
    const cr = plan(x, -10, 18, 18, 1.6);
    out.push(`<g data-cradle="${SLOTS.indexOf(x)}">${S(slab(cr, 2, 2, 4, 0.4), { tone: "mid" })}${L(k.planOutline(k.insetPlan(cr, 2.2), 4, P), { tone: "faint" })}</g>`);
    // label holder on the rack's front lip with one rule line standing for printed text
    const lp = { x: x - 4, y: -0.6, w: 8, d: 0.6, r: 0.2 };
    void lp;
    out.push(L(poly([[x - 5, base.y + base.d + 0.05, 0.5], [x + 5, base.y + base.d + 0.05, 0.5], [x + 5, base.y + base.d + 0.05, 1.6], [x - 5, base.y + base.d + 0.05, 1.6]], true), { tone: "lo" }));
  }
  return out.join("");
}
const knob = (x, y, z) => S(cyl(x, y, 1.7, z, 4, 16, 0.2), { tone: "hi", crease: "lo" }) + L(k.ring(x, y, 0.8, z + 4, P, 12), { tone: "lo" });
const TOOLS = [
  // 1 LLM fundamentals: a core block with a dot grid on top
  (x, y) => S(slab(plan(x, y, 13, 13, 1.2), TOOL_Z, 14, 4, 0.6), { tone: "hi", crease: "lo" }) + D(k.dotGrid(x - 4.2, y - 4.2, 4, 4, 2.8, TOOL_Z + 14, P), { size: 0.38, tone: "mid" }) + knob(x, y, TOOL_Z + 14),
  // 2 prompt engineering: a stylus in a collar
  (x, y) => S(cyl(x, y, 5.6, TOOL_Z, 3.4, 28, 0.4), { tone: "mid" }) + S(cyl(x, y, 3.8, TOOL_Z + 3.4, 9.4, 24), { tone: "hi", crease: "none", inner: L(k.sideArc(x, y, 3.8, TOOL_Z + 8, P, 16), { tone: "faint" }) }) + S(cyl(x, y, 4.6, TOOL_Z + 12.8, 1.2, 24, 0.3), { tone: "mid" }) + knob(x, y, TOOL_Z + 14),
  // 3 agent patterns: a stencil plate with a 3 by 3 pattern of holes
  (x, y) => S(slab(plan(x, y, 15, 14, 1.2), TOOL_Z, 4.4, 4, 0.5), { tone: "hi", crease: "lo" }) + L([0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => k.ring(x - 4.4 + i * 4.4, y - 4.2 + j * 4.2, 1.1, TOOL_Z + 4.4, P, 12))).join(""), { tone: "mid" }) + S(slab(plan(x, y, 3.4, 3.4, 0.6), TOOL_Z + 4.4, 9.6, 2, 0.2), { tone: "mid", crease: "none" }) + knob(x, y, TOOL_Z + 14),
  // 4 AEF framework: a square frame of four bars around a centre post
  (x, y) => {
    const bars = [plan(x, y - 6, 14, 2.2, 0.5), plan(x - 6, y, 2.2, 14, 0.5), plan(x + 6, y, 2.2, 14, 0.5), plan(x, y + 6, 14, 2.2, 0.5)];
    return bars.slice(0, 3).map((b) => S(slab(b, TOOL_Z, 8, 2, 0.2), { tone: "hi", crease: "lo" })).join("") + S(slab(plan(x, y, 3.2, 3.2, 0.6), TOOL_Z, 14, 2, 0.2), { tone: "mid", crease: "none" }) + S(slab(bars[3], TOOL_Z, 8, 2, 0.2), { tone: "hi", crease: "lo" }) + knob(x, y, TOOL_Z + 14);
  },
  // 5 multi-agent orchestration: a hub with three pegs
  (x, y) => S(cyl(x, y, 7, TOOL_Z, 4.4, 36, 0.5), { tone: "hi", crease: "lo" }) + byDepth([0, 120, 240].map((a) => [x + 4.6 * Math.sin(a * Math.PI / 180), y - 4.6 * Math.cos(a * Math.PI / 180)])).map(([px, py]) => S(cyl(px, py, 1.4, TOOL_Z + 4.4, 3.4, 12), { tone: "mid" })).join("") + S(slab(plan(x, y, 2.8, 2.8, 0.5), TOOL_Z + 4.4, 9.6, 2, 0.2), { tone: "mid", crease: "none" }) + knob(x, y, TOOL_Z + 14),
];
const tools = () => SLOTS.map((x, i) => `<g data-tool="${i}">${TOOLS[i](x, -10)}</g>`).join("");

/* ---------- work pad, wire, ledger ---------- */
function pad() {
  const [x, y] = PAD;
  const pl = plan(x, y, 24, 24, 2.4);
  const out = [S(slab(pl, 0, 4, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(pl, 1.4, P, 6), { tone: "faint" }) })];
  out.push(L(k.ring(x, y, 9, 4, P, 48), { tone: "lo" }));
  out.push(D(k.corners(k.insetPlan(pl, 2.4)).map(([a, b]) => at([a, b, 4])), { size: 0.45 }));
  const pulse = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; pulse.push(at([x + 9 * Math.cos(a), y + 9 * Math.sin(a), 4])); }
  out.push(`<g data-pulse-ring="">${D(pulse, { size: 0.65, tone: "hi" })}</g>`);
  // sensor post beside the pad: it watches the result
  out.push(S(cyl(x + 17, y - 9, 2.4, 0, 2, 20, 0.3), { tone: "lo" }));
  out.push(S(cyl(x + 17, y - 9, 1.1, 2, 18, 12), { tone: "mid", crease: "none" }));
  out.push(`<g data-eye="">${S(slab(plan(x + 17, y - 9, 4.4, 4.4, 0.8), 20, 4, 3, 0.3), { tone: "hi", crease: "lo" })}</g>`);
  return out.join("");
}
const WIRE = [[PAD[0], PAD[1] + 12, 0.4], [PAD[0], 14, 0.4], [44, 20, 0.4], [44, 24, 2.2]];
function wire() {
  const pts = WIRE.map(at);
  return k.wireSvg(pts[0], pts[pts.length - 1], { via: pts.slice(1, -1), tone: "mid", size: 1 }) + `<path class="iso-line ag-flow" data-ink-skip="" data-wire-flow="" d="${k.pathOf(pts)}"/>` + `<circle class="ag-spark" data-spark="" r="1.9" cx="${pts[0][0].toFixed(1)}" cy="${pts[0][1].toFixed(1)}"/>`;
}
export const ROWS = 8;
function ledger() {
  const out = [];
  const st = { x: 22, y: 22, w: 68, d: 42, r: 2 };
  out.push(S(slab(st, 0, 2, 4, 0.4), { tone: "lo" }));
  const book = { x: 26, y: 25, w: 60, d: 36, r: 1.2 };
  out.push(S(slab(book, 2, 3, 3, 0.3), { tone: "mid", inner: L(k.sideSeam(book, 3.4, P, 3) + k.sideSeam(book, 4.2, P, 3), { tone: "faint" }) }));
  // two open pages and the spine
  out.push(S(slab({ x: 27, y: 26, w: 28.6, d: 34, r: 0.6 }, 5, 0.6, 2, 0), { tone: "hi", crease: "none" }));
  out.push(S(slab({ x: 56.4, y: 26, w: 28.6, d: 34, r: 0.6 }, 5, 0.6, 2, 0), { tone: "hi", crease: "none" }));
  out.push(L(k.lineOnTop([56, 26], [56, 60], 5.6, P), { tone: "mid" }));
  // left page: earlier entries, faint rule lines that stand for written text
  const hist = [];
  for (let i = 0; i < ROWS; i++) hist.push(k.lineOnTop([31, 29.5 + i * 3.8], [31 + 12 + ((i * 7) % 11), 29.5 + i * 3.8], 5.6, P));
  out.push(L(hist.join(""), { tone: "faint", free: true }));
  out.push(D(Array.from({ length: ROWS }, (_, i) => at([29.4, 29.5 + i * 3.8, 5.6])), { size: 0.4, tone: "lo" }));
  // right page: one row per observed result, written by the live figure
  const rows = [];
  for (let i = 0; i < ROWS; i++) {
    const y = 29.5 + i * 3.8;
    const len = 12 + ((i * 5) % 9);
    rows.push(`<g data-row="${i}" style="display:none">${D([at([59.6, y, 5.6])], { size: 0.5, tone: "hi" })}<path class="iso-line" data-tone="mid" data-free="" data-ink-skip="" d="${k.lineOnTop([61.4, y], [61.4 + len, y], 5.6, P)}"/></g>`);
  }
  out.push(rows.join(""));
  // a pen resting on the stand
  out.push(S(slab({ x: 76, y: 61.2, w: 12, d: 1.6, r: 0.6 }, 2, 1.4, 2, 0.1), { tone: "mid" }));
  return out.join("");
}

/* ---------- loop lamps, agents for chapter 5 ---------- */
export const LAMPS = [-84, -76, -68];
function console_() {
  const c = { x: -94, y: 20, w: 34, d: 20, r: 2 };
  const out = [S(slab(c, 0, 9, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(c, 2.2, P, 4), { tone: "faint" }) })];
  const yF = c.y + c.d + 0.05;
  out.push(L([0, 1, 2, 3].map((i) => poly([[-90 + i * 7, yF, 4], [-86 + i * 7, yF, 4], [-86 + i * 7, yF, 5.4], [-90 + i * 7, yF, 5.4]], true)).join(""), { tone: "lo" }));
  LAMPS.forEach((x, i) => {
    out.push(S(cyl(x, 30, 3.2, 9, 1.4, 28, 0.3), { tone: "mid" }));
    out.push(`<g data-lamp="${i}">${S(cyl(x, 30, 2.3, 10.4, 1.4, 24, 0.3), { tone: "hi", crease: "lo" })}</g>`);
  });
  // the lamps run in a loop: a ring line joins them on the console top, back to the first
  out.push(L(k.onTop([[-86.5, 34.6], [-65.5, 34.6]], 9, P), { tone: "faint" }));
  out.push(D([at([-92, 23, 9]), at([-62, 23, 9]), at([-92, 37, 9]), at([-62, 37, 9])], { size: 0.42 }));
  return out.join("");
}
const AGENTS = [[-38, 44], [-14, 56]];
function agents() {
  return AGENTS.map(([x, y], i) => {
    const w = [[x + 7.4, y, 0.4], [16, y, 0.4], [22, y - (i ? 6 : -2), 1.2]];
    const pts = w.map(at);
    return `<g data-agent="${i}">${S(cyl(x, y, 7, 0, 3, 36, 0.5), { tone: "lo" })}${S(cyl(x, y, 5, 3, 5, 32, 0.4), { tone: "hi", crease: "lo" })}${S(cyl(x, y, 1.3, 8, 10, 12), { tone: "mid", crease: "none" })}${S(slab(plan(x, y, 6, 4.4, 0.8), 18, 3.4, 3, 0.3), { tone: "hi", crease: "lo" })}${S(slab(plan(x + 2.4, y, 1.2, 3.4, 0.3), 14.6, 3.4, 2, 0.1), { tone: "mid" })}<g data-agent-lamp="">${D([at([x, y, 21.4])], { size: 1.1, tone: "hi" })}</g>${k.wireSvg(pts[0], pts[2], { via: [pts[1]], tone: "mid", size: 0.9 })}</g>`;
  }).join("");
}

/* ---------- assemble ---------- */
const CAR_SCREEN = k.axisVector(P, [1, 0, 0]);
const body = [
  plinth(K, PLATE, { strip: { x: -86, y: -41, w: 120, d: 6, r: 1 }, label: { x: -98, y: 50, w: 22, d: 12, r: 1.2 } }),
  post(-POST_X, false), post(POST_X, false),
  beam(),
  `<g data-hit="rack">${rack()}${tools()}</g>`,
  `<g data-hit="arm" class="ag-arm"><g data-lift="">${gripper()}</g><g data-car="">${carriage()}</g></g>`,
  `<path class="iso-line" data-tone="mid" data-ink-skip="" data-cable="" style="stroke-width:1.2" d=""/>`,
  pad(),
  wire(),
  `<g data-hit="loop">${console_()}</g>`,
  `<g data-hit="ledger">${ledger()}</g>`,
  agents(),
];
const LABEL = "Scale model of a workbench: a gantry arm runs plan, act and observe; it picks one of five tools from a rack, works it on a pad, and a ledger records each result. Three loop lamps show the phase.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

// data the live figure needs, so it never loads the kit
const DATA = {
  slots: SLOTS, pad: PAD, gUp: G_UP, gDown: G_DOWN, rows: ROWS,
  x1: CAR_SCREEN, z1: k.axisVector(P, [0, 0, 1]),
  wire: WIRE.map(at).map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]),
  cableA: at([-70, BEAM_Y, BEAM_Z + 13]).map((v) => +v.toFixed(1)),
  cableB: at([-3.6, ARM_Y + 3.6, 97.2]).map((v) => +v.toFixed(1)),
};

const SCENE_CSS = `/* agentic workbench: scene tokens and states (kit palette from ../cellular/mast.css) */
.iso{--ag-spark:#00D9FF;--ag-flow:#00708a;--ag-lamp:#00D9FF}
:root[data-theme="dark"] .iso{--ag-flow:#00D9FF}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .iso{--ag-flow:#00D9FF}}
[data-hit]{--hl:var(--anatomy-lit)}
.ag-flow{fill:none;stroke:var(--ag-flow);stroke-width:1.2;stroke-dasharray:2 5;stroke-linecap:round;opacity:0;animation:iso-flow .9s linear infinite}
.ag-spark{fill:var(--ag-spark);opacity:0}
[data-pulse-ring] circle{fill:var(--ag-spark);opacity:.95}
[data-pulse-ring]{opacity:0}
[data-lamp][data-lit] .iso-top{fill:var(--ag-lamp)}
[data-lamp][data-lit] .iso-shade{fill:color-mix(in srgb,var(--ag-lamp) 45%,var(--anatomy-shade-2))}
[data-lamp][data-lit] .iso-edge{stroke:var(--anatomy-lit)}
[data-eye][data-lit] .iso-top{fill:color-mix(in srgb,var(--ag-lamp) 55%,var(--anatomy-top))}
[data-tool][data-cur] .iso-edge,[data-cradle][data-cur] .iso-edge{stroke:var(--anatomy-lit)}
[data-tool][data-cur] .iso-top{fill:var(--anatomy-lit-top)}
[data-tool][data-cur] .iso-shade{fill:var(--anatomy-lit-shade)}
[data-tool][data-cur] .iso-dots circle{fill:var(--anatomy-lit);opacity:.9}
[data-agent-lamp] circle{fill:var(--ag-spark)}
.iso-svg[data-ink] .ag-spark,.iso-svg[data-ink] [data-pulse-ring],.iso-svg[data-ink] .ag-flow{opacity:0!important}
`;
import { writeFileSync } from "node:fs";
writeFileSync(HERE + "/agentic.css", SCENE_CSS);
writeScene(HERE, {
  P, svg, data: DATA, sceneCss: SCENE_CSS,
  // poster: the act pose, tool 3 (agent patterns) on the pad with the gripper down, lamp 2 lit
  poster: (s) => {
    const dx = k.axisVector(P, [PAD[0] - SLOTS[2], 0, 0]);
    const car = k.axisVector(P, [PAD[0], 0, 0]);
    const lift = k.axisVector(P, [PAD[0], 0, G_DOWN]);
    return s
      .replace('<g data-tool="2">', `<g data-tool="2" data-cur="" transform="translate(${dx[0].toFixed(2)} ${dx[1].toFixed(2)})">`)
      .replace('<g data-cradle="2">', '<g data-cradle="2" data-cur="">')
      .replace('<g data-lift="">', `<g data-lift="" transform="translate(${lift[0].toFixed(2)} ${lift[1].toFixed(2)})">`)
      .replace('<g data-car="">', `<g data-car="" transform="translate(${car[0].toFixed(2)} ${car[1].toFixed(2)})">`)
      .replace('<g data-lamp="1">', '<g data-lamp="1" data-lit="">')
      .replace(/<g data-row="([0-2])" style="display:none">/g, '<g data-row="$1">')
      .replace(/<g data-agent="(\d)">/g, '<g data-agent="$1" style="display:none">')
      .replace('d=""', `d="M${DATA.cableA.join(" ")}Q${((DATA.cableA[0] + DATA.cableB[0] + car[0]) / 2).toFixed(1)} ${(Math.min(DATA.cableA[1], DATA.cableB[1] + car[1]) - 14).toFixed(1)} ${(DATA.cableB[0] + car[0]).toFixed(1)} ${(DATA.cableB[1] + car[1]).toFixed(1)}"`)
      .replace('data-pulse-ring=""', 'data-pulse-ring="" style="opacity:1"');
  },
});
console.log("agentic: wrote art.js, poster.svg, agentic.css", JSON.stringify({ scale: P.scale.toFixed(3) }));
