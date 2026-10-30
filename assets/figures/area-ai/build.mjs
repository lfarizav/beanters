// Build the AI-native area scene: node build.mjs  (writes art.js and poster.svg)
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan) through ../areas/parts.mjs.
//
// Truth notes. The home card says: AI applied to telecommunications; deploying cellular networks from
// natural-language instructions; MLOps for the radio access network; in physical AI he designs and builds
// drones and robots from scratch, controlled by local AI. The model: a local GPU server runs the model, a
// laptop gives the natural-language instruction, an agent reaches its tools through an MCP hub and deploys
// the radio site, an MLOps conveyor carries trained models to the radio access network, and a drone and a
// small robot take orders from the local server over a local link (there is no cloud in the scene).
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, areaKit, writeScene, SCENE_CSS, W, H, r2 } from "../areas/parts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLATE = { x: -92, y: -66, w: 178, d: 122, r: 9 };
const GPU = { x: -70, y: -60, w: 36, d: 24, r: 1.6 }; // local model server
const GPU_H = 28;
const LAP = { x: -86, y: 14, w: 24, d: 16, r: 1 }; // laptop: the natural-language instruction
const MCP = { x: -50, y: -12, w: 20, d: 14, r: 1.2 }; // MCP hub
const MCP_H = 9;
const BELT = { x: -28, y: -54, w: 66, d: 12, r: 0.8 }; // MLOps conveyor
const BELT_Z = 9;
const MAST = [62, -44];
const MAST_H = 72;
const DRONE = { c: [56, 26], z: 34 };
const ROBOT = [16, 40];

const extremes = [...k.boxCorners(PLATE, -8, 0), [MAST[0], MAST[1], MAST_H + 4], [DRONE.c[0], DRONE.c[1], DRONE.z + 10], [GPU.x, GPU.y, GPU_H + 6]];
const A = areaKit(extremes, { pad: 8 });
const { P, S, L, D, at, poly, slab, cyl, plan, depth, rectY, rectX, textY, textX, base, box, led, wire, mast, rings, KK, sinE, pt } = A;

/* ---------- the local model: a GPU server with two fans, heatsink fins and lamps ---------- */
const FANS = [[GPU.x + 9.5, GPU.y + GPU.d + 0.06, 14], [GPU.x + 26.5, GPU.y + GPU.d + 0.06, 14]];
const FAN_R = 6.4;
function server() {
  const out = [box(GPU, GPU_H, { seams: [GPU_H - 4, 4.6] })];
  const yF = GPU.y + GPU.d + 0.05, xF = GPU.x + GPU.w + 0.05;
  for (const [x, y, z] of FANS) {
    const ring = (r) => k.sideRing([x, y, z], r, "y", P, 32);
    out.push(`<path class="ar-unit" d="${ring(FAN_R)}"/>`);
    out.push(L(ring(FAN_R) + ring(FAN_R + 1.2), { tone: "mid" }));
    out.push(L(ring(1.4), { tone: "hi" }));
  }
  out.push(`<path class="ar-blade" data-blades="" d=""/>`);
  for (let i = 0; i < 4; i++) out.push(led([GPU.x + 5 + i * 3, yF, GPU_H - 7.4], `data-gpu="${i}"`, 0.8));
  out.push(textX(xF, GPU.y + GPU.d / 2, 16, "LLM", 5));
  out.push(L([0, 1, 2].map((j) => rectX(xF, GPU.y + 5, GPU.y + GPU.d - 5, 6 + j * 2.6, 7 + j * 2.6)).join(""), { tone: "lo" }));
  // heatsink fins on the lid, edge to edge
  const fins = [];
  for (let x = GPU.x + 4; x <= GPU.x + GPU.w - 4; x += 2.6) fins.push(k.lineOnTop([x, GPU.y + 4], [x, GPU.y + GPU.d - 4], GPU_H, P));
  out.push(L(fins.join(""), { tone: "lo" }));
  out.push(L(k.planOutline(plan(GPU.x + GPU.w / 2, GPU.y + GPU.d / 2, GPU.w - 6, GPU.d - 6, 0.6), GPU_H, P), { tone: "mid" }));
  return out.join("");
}

/* ---------- laptop with the natural-language prompt on its screen ---------- */
function laptop() {
  const out = [A.halo(LAP)];
  out.push(S(slab(LAP, 0, 1.8, 3, 0.3), { tone: "hi", crease: "lo" }));
  out.push(L(k.planOutline(plan(LAP.x + LAP.w / 2, LAP.y + LAP.d / 2 + 2, LAP.w - 5, LAP.d - 8, 0.4), 1.8, P), { tone: "faint" }));
  const keys = [];
  for (let r = 0; r < 3; r++) keys.push(k.lineOnTop([LAP.x + 3.5, LAP.y + 4 + r * 2], [LAP.x + LAP.w - 3.5, LAP.y + 4 + r * 2], 1.8, P));
  out.push(L(keys.join(""), { tone: "faint" }));
  const lid = { x: LAP.x, y: LAP.y - 1.4, w: LAP.w, d: 1.4, r: 0.3 };
  out.push(S(slab(lid, 1.8, 15, 3, 0.2), { tone: "hi", crease: "lo" }));
  const yF = lid.y + lid.d + 0.05;
  out.push(`<path class="ar-screen" data-lap="" d="${rectY(yF, LAP.x + 1.6, LAP.x + LAP.w - 1.6, 3.4, 15.4)}"/>`);
  out.push(L(rectY(yF, LAP.x + 1.6, LAP.x + LAP.w - 1.6, 3.4, 15.4), { tone: "mid" }));
  // prompt lines: the instruction types itself in (live code shows them one by one)
  [[0.9, 13.4], [0.7, 11], [0.8, 8.6], [0.45, 6.2]].forEach(([f, z], i) => {
    out.push(`<path class="iso-line" data-tone="${i === 3 ? "lit" : "hi"}" data-free="" data-ink-skip="" data-line="${i}" style="stroke-width:1.2" d="${poly([[LAP.x + 3.4, yF + 0.02, z], [LAP.x + 3.4 + (LAP.w - 6.8) * f, yF + 0.02, z]])}"/>`);
  });
  return out.join("");
}

/* ---------- MCP hub: a box with three tool sockets on top ---------- */
function hub() {
  const out = [box(MCP, MCP_H, { seams: [MCP_H - 2.6] })];
  const yF = MCP.y + MCP.d + 0.05;
  out.push(textY(MCP.x + MCP.w / 2, yF, 3.2, "MCP", 3.8));
  for (const x of [MCP.x + 5, MCP.x + 10, MCP.x + 15]) {
    out.push(S(cyl(x, MCP.y + 6, 1.8, MCP_H, 1.6, 16, 0.3), { tone: "mid" }));
    out.push(led([x, MCP.y + 6, MCP_H + 1.6], `data-tool="${(x - MCP.x - 5) / 5}"`, 0.9));
  }
  return out.join("");
}

/* ---------- MLOps conveyor: belt on legs, rollers, two stage gates, model cubes ---------- */
const CUBE = 6;
function conveyor() {
  const out = [A.halo(BELT, 4)];
  const legs = [];
  for (const x of [BELT.x + 4, BELT.x + BELT.w / 2, BELT.x + BELT.w - 4]) for (const y of [BELT.y + 2, BELT.y + BELT.d - 2]) legs.push([x, y]);
  for (const [x, y] of A.K.byDepth(legs)) out.push(S(cyl(x, y, 1, 0, BELT_Z - 2, 10), { tone: "mid", crease: "none" }));
  out.push(S(slab(BELT, BELT_Z - 2, 2, 4, 0.3), { tone: "mid" }));
  const yF = BELT.y + BELT.d + 0.05;
  out.push(L([BELT.x + 3, BELT.x + BELT.w - 3].map((x) => k.sideRing([x, yF, BELT_Z - 1], 0.8, "y", P, 12)).join(""), { tone: "mid" }));
  const slats = [];
  for (let x = BELT.x + 3; x < BELT.x + BELT.w - 2; x += 4) slats.push(k.lineOnTop([x, BELT.y + 1], [x, BELT.y + BELT.d - 1], BELT_Z, P));
  out.push(L(slats.join(""), { tone: "faint" }));
  return out.join("");
}
function gate(x, label) {
  const out = [];
  for (const y of [BELT.y - 1.4, BELT.y + BELT.d + 1.4]) out.push(S(slab(plan(x, y, 2.4, 2.4, 0.3), 0, 26, 3, 0.2), { tone: "mid" }));
  const bar = { x: x - 1.2, y: BELT.y - 2.6, w: 2.4, d: BELT.d + 5.2, r: 0.3 };
  out.push(S(slab(bar, 26, 6, 3, 0.2), { tone: "hi", crease: "lo" }));
  out.push(textX(bar.x + bar.w, bar.y + bar.d / 2, 27.6, label, 3.4));
  return out.join("");
}
const CUBES = 3;
function cubes() {
  // built at the belt's start; the live code slides them along x
  const out = [];
  for (let i = 0; i < CUBES; i++) {
    const pl = plan(BELT.x + 6, BELT.y + BELT.d / 2, CUBE, CUBE, 0.4);
    out.push(`<g data-cube="${i}">${S(slab(pl, BELT_Z, CUBE, 3, 0.4), { tone: "hi", crease: "lo", lit: true })}${L(k.lineOnTop([pl.x + 1, pl.y + 1], [pl.x + pl.w - 1, pl.y + pl.d - 1], BELT_Z + CUBE, P), { tone: "lit", free: true })}</g>`);
  }
  return out.join("");
}

/* ---------- physical AI: a quadcopter and a small wheeled robot ---------- */
const ARMS = [[-10, -10], [10, -10], [-10, 10], [10, 10]];
const ROTOR_R = 6.2;
function drone() {
  const [cx, cy] = DRONE.c, z = DRONE.z;
  const out = [];
  const sorted = [...ARMS].sort((a, b) => depth([cx + a[0], cy + a[1]]) - depth([cx + b[0], cy + b[1]]));
  const rotor = ([dx, dy]) => {
    const x = cx + dx, y = cy + dy;
    return S(cyl(x, y, 1.4, z - 1, 3.2, 12), { tone: "mid", crease: "none" }) +
      `<path class="ar-lens" d="${k.ring(x, y, ROTOR_R, z + 2.2, P, 32)}"/>` + L(k.ring(x, y, ROTOR_R, z + 2.2, P, 32), { tone: "mid" });
  };
  // arms first, back rotors, body, front rotors
  out.push(`<path class="ar-bold" data-tone="mid" d="${ARMS.map(([dx, dy]) => k.segment([cx, cy, z], [cx + dx, cy + dy, z], P)).join("")}" style="stroke-width:2.4"/>`);
  for (const a of sorted.slice(0, 2)) out.push(rotor(a));
  const body = plan(cx, cy, 10, 10, 2);
  out.push(S(slab(body, z - 2.4, 4.6, 6, 0.6), { tone: "hi", crease: "lo", lit: true }));
  out.push(L(k.segment([cx - 3, cy + 5, z - 2.4], [cx - 3, cy + 5, z - 6], P) + k.segment([cx + 5, cy - 3, z - 2.4], [cx + 5, cy - 3, z - 6], P) + k.segment([cx - 6, cy + 5, z - 6], [cx + 2, cy + 5, z - 6], P) + k.segment([cx + 5, cy - 6, z - 6], [cx + 5, cy + 2, z - 6], P), { tone: "hi" }));
  out.push(led([cx, cy + 5.05, z], `data-eye="drone"`, 0.9));
  for (const a of sorted.slice(2)) out.push(rotor(a));
  out.push(`<path class="ar-blade" data-props="" d=""/>`);
  return `<g data-drone="">${out.join("")}</g>`;
}
function robot() {
  const [x, y] = ROBOT;
  const out = [];
  const bp = plan(x, y, 18, 13, 1.4);
  // back wheels peek out on the -y side, front wheels on the +y side
  const wheel = (wx, wy) => { const r = k.sideRing([wx, wy, 3.4], 3.4, "y", P, 24); return `<path class="iso-fill" d="${r}"/>` + L(r, { tone: "hi" }) + L(k.sideRing([wx, wy, 3.4], 1.2, "y", P, 12), { tone: "mid" }); };
  out.push(wheel(x - 5.5, bp.y - 0.6), wheel(x + 5.5, bp.y - 0.6));
  out.push(S(slab(bp, 2, 5, 4, 0.5), { tone: "mid", crease: "lo" }));
  out.push(wheel(x - 5.5, bp.y + bp.d + 0.6), wheel(x + 5.5, bp.y + bp.d + 0.6));
  const tp = plan(x - 1, y, 10, 8, 1);
  out.push(S(slab(tp, 7, 9, 4, 0.5), { tone: "hi", crease: "lo", inner: L(k.sideSeam(tp, 12, P, 4), { tone: "faint" }) }));
  // arm with a two-finger gripper on the +x side
  const sx = tp.x + tp.w;
  out.push(`<path class="ar-bold" data-tone="mid" d="${poly([[sx, y, 13], [sx + 6, y, 11], [sx + 9, y, 15]])}" style="stroke-width:2"/>`);
  out.push(L(poly([[sx + 9, y - 1.4, 15], [sx + 11, y - 1.4, 16.6]]) + poly([[sx + 9, y + 1.4, 15], [sx + 11, y + 1.4, 16.6]]), { tone: "hi" }));
  const hp = plan(x - 1, y, 9, 7, 1.6);
  out.push(S(slab(hp, 16.4, 6, 4, 0.6), { tone: "hi", crease: "lo", lit: true }));
  const yF = hp.y + hp.d + 0.05;
  out.push(led([x - 3, yF, 19.6], `data-eye="r0"`, 0.9), led([x + 1, yF, 19.6], `data-eye="r1"`, 0.9));
  out.push(L(k.segment([x - 1, y, 22.4], [x - 1, y, 26], P), { tone: "hi" }), D([at([x - 1, y, 26.4])], { size: 0.9, tone: "hi" }));
  return `<g data-robot="">${out.join("")}</g>`;
}

/* ---------- floor wires and the local radio link ---------- */
const W_LAP = [[LAP.x + LAP.w / 2, LAP.y - 2.4, 0.4], [LAP.x + LAP.w / 2, GPU.y + GPU.d + 2, 0.4]];
const W_MCP = [[GPU.x + GPU.w - 4, GPU.y + GPU.d + 1.6, 0.4], [GPU.x + GPU.w - 4, MCP.y + 7, 0.4], [MCP.x - 1.6, MCP.y + 7, 0.4]];
const W_RAN = [[MCP.x + MCP.w + 1.6, MCP.y + 7, 0.4], [MAST[0] - 4, MCP.y + 7, 0.4], [MAST[0] - 4, MAST[1] + 8.6, 0.4]];
const AGENT = [...W_LAP, ...W_MCP, ...W_RAN].map(at);
const GPU_TOP = [GPU.x + GPU.w - 6, GPU.y + 6, GPU_H + 1];
const curve = (a, b, lift) => { const [x0, y0] = at(a), [x1, y1] = at(b); const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - lift; const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * y1]); } return pts; };
const LINK_D = curve(GPU_TOP, [DRONE.c[0], DRONE.c[1], DRONE.z + 4], 46);
const LINK_R = curve(GPU_TOP, [ROBOT[0] - 1, ROBOT[1], 27], 26);
const linkPath = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

const items = [
  { d: depth([GPU.x + GPU.w / 2, GPU.y + GPU.d / 2]), s: `<g data-part="gpu">${server()}</g>` },
  { d: depth([LAP.x + LAP.w / 2, LAP.y + LAP.d / 2]), s: `<g data-part="lap">${laptop()}</g>` },
  { d: depth([MCP.x + MCP.w / 2, MCP.y + MCP.d / 2]), s: `<g data-part="mcp">${hub()}</g>` },
  { d: depth([BELT.x + BELT.w / 2, BELT.y + BELT.d / 2]), s: `<g data-part="belt">${conveyor()}${gate(BELT.x + 20, "DATA")}${cubes()}${gate(BELT.x + 44, "TRAIN")}</g>` },
  { d: depth(MAST) , s: `<g data-part="ran">${mast(MAST[0], MAST[1], MAST_H, { label: "RAN" })}</g>` },
  { d: depth(ROBOT), s: `<g data-part="robot">${robot()}</g>` },
  { d: depth(DRONE.c) + 30, s: `<g data-part="drone">${drone()}</g>` },
].sort((a, b) => a.d - b.d);

const body = [
  base(PLATE),
  `<path class="iso-halo" data-shadow="" d="${k.haloOf(plan(DRONE.c[0], DRONE.c[1], 24, 24, 10), 0, 0.5, P)}" style="filter:blur(4px)"/>`,
  wire(W_LAP, 'data-w="lap"'), wire(W_MCP, 'data-w="mcp"'), wire(W_RAN, 'data-w="ran"'),
  ...items.map((i) => i.s),
  rings("air", [MAST[0], MAST[1], MAST_H - 9], 3, "ar-air"),
  `<path class="ar-flow" data-link="d" d="${linkPath(LINK_D)}"/><path class="ar-flow" data-link="r" d="${linkPath(LINK_R)}"/>`,
  `<circle class="ar-spark" data-spark="agent" r="2.6"/>`,
];
const LABEL = "Isometric model of local AI: a GPU server runs the model, a laptop gives a natural-language instruction, an agent uses tools through an MCP hub to deploy the radio site, an MLOps conveyor with data and training gates carries models to the radio access network mast, and a quadcopter drone and a small wheeled robot take orders from the local server over a local link, with no cloud.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

const DATA = {
  size: [W, H],
  fans: FANS, fanR: FAN_R,
  rotors: ARMS.map(([dx, dy]) => [DRONE.c[0] + dx, DRONE.c[1] + dy, DRONE.z + 2.4]), rotorR: ROTOR_R,
  agent: AGENT.map(r2),
  linkD: LINK_D.map(r2), linkR: LINK_R.map(r2),
  belt: [r2(k.axisVector(P, [1, 0, 0])), BELT.w - 12],
  lift: r2(k.axisVector(P, [0, 0, 1])),
  air: pt([MAST[0], MAST[1], MAST_H - 9]),
  k: +KK.toFixed(4), sinE: +sinE.toFixed(4),
  pins: {
    model: pt([GPU.x + GPU.w / 2, GPU.y + GPU.d / 2, GPU_H + 5]),
    prompt: pt([LAP.x + LAP.w / 2, LAP.y, 20]),
    mcp: [...pt([MCP.x + MCP.w / 2, MCP.y + MCP.d, 0]), "b"],
    mlops: [...pt([BELT.x + BELT.w / 2, BELT.y + BELT.d + 3, 0]), "b"],
    ran: pt([MAST[0], MAST[1], MAST_H + 4]),
    drone: pt([DRONE.c[0], DRONE.c[1], DRONE.z + 12]),
    robot: [...pt([ROBOT[0], ROBOT[1] + 8, 0]), "b"],
    local: pt([GPU.x + GPU.w, GPU.y + GPU.d / 2, GPU_H + 4]),
  },
};
const posterOf = (s) => s.replace(/class="ar-led" /g, 'class="ar-led" data-on="" ').replace(/class="ar-screen" /g, 'class="ar-screen" data-on="" ');
writeScene(HERE, { P, svg, data: DATA, sceneCss: SCENE_CSS, poster: posterOf });
console.log("area-ai: wrote art.js, poster.svg", JSON.stringify({ scale: P.scale.toFixed(3), bytes: svg.length }));
