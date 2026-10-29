// Build the certification-prep vault: node build.mjs  (writes art.js, certprep.css and poster.svg)
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan) through ../agentic/bench.mjs.
//
// Truth notes. Words come from courses/index.html, program "Preparación para las certificaciones CKA / CKAD / CKS"
// (cm76 to cm86): three tracks (CKA cluster administration, CKAD application development, CKS security
// specialist), about 30 h per track, with timed mock exams, live-cluster scenarios and common exam traps.
// The page lists no exam domains, so each drawer holds the three things the page says the prep includes,
// as three cards: a timer card, a cluster card and a trap card. The timer dial stands for the timed mocks.
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, kitFor, plinth, writeScene } from "../agentic/bench.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 600, H = 520;
const PLATE = { x: -92, y: -56, w: 184, d: 108, r: 8 };
const V = { x: -60, y: -42, w: 120, d: 36, r: 2 }; // vault body
const VZ = [4, 58];
const YF = V.y + V.d; // front face, faces +y
export const COLS = [-38, 0, 38];
const OPEN = { w: 30, z0: 10, z1: 23 }; // drawer opening on the face
const DR = { w: 28.4, d: 30, wall: 5.5 }; // drawer tray
export const TRAVEL = 34;
const KEY_Z = 41;
const DIAL = [34, -24], DIAL_R = 11, DIAL_TOP = VZ[1] + 5;

const extremes = [...k.boxCorners(PLATE, -14, 0), [V.x, V.y, VZ[1] + 8], [V.x + V.w, V.y, VZ[1] + 8], [0, YF + TRAVEL, 0]];
const P = k.fitProjection(extremes, W, H, { pad: 14, azimuth: 58 });
const K = kitFor(P);
const { S, L, D, at, poly, slab, cyl, plan, faceY, byDepth } = K;
const f2 = (v) => +v.toFixed(2);

/* ---------- vault body ---------- */
function vault() {
  const out = [`<path class="iso-halo" d="${k.haloOf(V, 0, 4, P)}" style="filter:blur(6px)"/>`];
  out.push(S(slab(k.insetPlan(V, -3), 0, VZ[0], 4, 0.6), { tone: "lo" }));
  out.push(S(slab(V, VZ[0], VZ[1] - VZ[0], 4, 1.2), { tone: "hi", crease: "lo", inner: L(k.sideSeam(V, VZ[1] - 5, P, 4) + k.sideSeam(V, VZ[0] + 4, P, 4), { tone: "faint" }) }));
  const yF = YF + 0.05, xF = V.x + V.w + 0.05;
  // column seams on the front, edge to edge between the two side seams
  out.push(L([-19, 19].map((x) => k.segment([x, yF, VZ[0] + 4], [x, yF, VZ[1] - 5], P)).join(""), { tone: "faint" }));
  // drawer openings: a dark recess you see once a drawer slides out
  for (const c of COLS) {
    const r = [[c - OPEN.w / 2, yF, OPEN.z0], [c + OPEN.w / 2, yF, OPEN.z0], [c + OPEN.w / 2, yF, OPEN.z1], [c - OPEN.w / 2, yF, OPEN.z1]];
    out.push(`<path class="iso-shade" data-shade="0" d="${poly(r, true)}"/>`, L(poly(r, true), { tone: "lo" }));
  }
  // rivets along the bottom and top seams
  const riv = [];
  for (let x = V.x + 5; x <= V.x + V.w - 5; x += 10) riv.push(at([x, yF, VZ[0] + 2]), at([x, yF, VZ[1] - 2.5]));
  out.push(D(riv, { size: 0.42 }));
  // side face: vent slots and a hinge pair
  out.push(L([0, 1, 2, 3, 4].map((j) => poly([[xF, V.y + 8, 22 + j * 4], [xF, V.y + V.d - 8, 22 + j * 4], [xF, V.y + V.d - 8, 23.6 + j * 4], [xF, V.y + 8, 23.6 + j * 4]], true)).join(""), { tone: "lo" }));
  out.push(D([[V.y + 4, 10], [V.y + V.d - 4, 10], [V.y + 4, 52], [V.y + V.d - 4, 52]].map(([y, z]) => at([xF, y, z])), { size: 0.45 }));
  return out.join("");
}
function top() {
  const out = [];
  const z = VZ[1];
  // label plate with rule lines and two screws
  const lp = { x: -50, y: -36, w: 34, d: 14, r: 1.2 };
  out.push(S(slab(lp, z, 0.8, 4, 0.3), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(lp, 1.6), z + 0.8, P), { tone: "faint" }));
  out.push(L([0, 1, 2].map((i) => k.lineOnTop([lp.x + 5, lp.y + 4 + i * 3], [lp.x + lp.w - 8 - i * 4, lp.y + 4 + i * 3], z + 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([lp.x + lp.w - 2.6, lp.y + 2.6, z + 0.8]), at([lp.x + lp.w - 2.6, lp.y + lp.d - 2.6, z + 0.8])], { size: 0.45 }));
  // three status lamps, one per key, along the top front edge
  COLS.forEach((c, i) => {
    out.push(S(cyl(c + 10, YF - 5, 2.4, z, 1, 20, 0.2), { tone: "mid" }));
    out.push(`<g data-led="${i}">${S(cyl(c + 10, YF - 5, 1.6, z + 1, 1.2, 16, 0.2), { tone: "hi", crease: "lo" })}</g>`);
  });
  return out.join("");
}
function timer() {
  const [x, y] = DIAL;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 12, y: y - 12, w: 24, d: 24, r: 12 }, VZ[1], 0.1, P)}" style="filter:blur(3px)"/>`];
  out.push(S(cyl(x, y, DIAL_R + 1.4, VZ[1], 1.6, 64, 0.4), { tone: "lo" }));
  out.push(S(cyl(x, y, DIAL_R, VZ[1] + 1.6, DIAL_TOP - VZ[1] - 1.6, 72, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DIAL_R, VZ[1] + 2, DIAL_TOP - 0.4, 84, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, DIAL_R - 1.8, DIAL_TOP, P, 64), { tone: "lo" }));
  const t = k.radialTicks(x, y, DIAL_R - 2.2, 60, 5, DIAL_TOP, [0.9, 2], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // elapsed arc, written by the live figure, and the hand
  out.push(`<path class="cp-arc" data-ink-skip="" data-arc="" d=""/>`);
  out.push(`<path class="iso-line" data-tone="lit" data-free="end" data-ink-skip="" data-hand="" style="stroke-width:1.3" d=""/>`);
  out.push(L(k.ring(x, y, 1.3, DIAL_TOP, P, 14), { tone: "mid" }));
  // crown and its push button
  out.push(S(cyl(x + DIAL_R + 3, y, 2, VZ[1], 3.4, 20, 0.3), { tone: "mid" }));
  out.push(L(k.knurl(x + DIAL_R + 3, y, 2, VZ[1] + 0.4, VZ[1] + 3.2, 16, P, 0.2), { tone: "faint" }));
  return out.join("");
}

/* ---------- keys (drawn in the face plane) ---------- */
// local face coordinates: u along +x, v down (-z); one unit = one world unit
function lock(i) {
  const c = COLS[i];
  const m = faceY(c, YF + 0.05, KEY_Z);
  const ring = (r) => `M${-r} 0A${r} ${r} 0 1 0 ${r} 0A${r} ${r} 0 1 0 ${-r} 0Z`;
  const fwd = (d) => k.axisVector(P, [0, d, 0]).map(f2);
  const f1 = fwd(1.6), f2v = fwd(3.2);
  const plate = `<g transform="${m}"><path class="iso-shade" data-shade="1" d="${ring(6.4)}"/><path class="iso-line" data-tone="lo" d="${ring(6.4)}"/></g>`;
  const bezel = `<g transform="translate(${f1[0]} ${f1[1]})"><g transform="${m}"><path class="iso-fill" d="${ring(5.2)}"/><path class="iso-line" data-tone="mid" d="${ring(5.2)}"/><path class="iso-line" data-tone="faint" d="${ring(3.8)}"/>${[0, 90, 180, 270].map((a) => `<circle class="cp-dot" cx="${f2(4.5 * Math.cos(a * Math.PI / 180))}" cy="${f2(4.5 * Math.sin(a * Math.PI / 180))}" r=".35"/>`).join("")}</g></g>`;
  // the key: a bow with a hole and a shank into the plug; thickness from a back copy
  const bow = "M-1.3 0L-1.3 -5.2Q-4.6 -5.6 -4.6 -9.4Q-4.6 -13.6 0 -13.6Q4.6 -13.6 4.6 -9.4Q4.6 -5.6 1.3 -5.2L1.3 0Z";
  const hole = "M-1.6 -9.6A1.6 1.6 0 1 0 1.6 -9.6A1.6 1.6 0 1 0 -1.6 -9.6Z";
  const keyFace = (cls) => `<path class="${cls}" d="${bow}"/>`;
  const key = `<g transform="translate(${f2v[0]} ${f2v[1]})"><g transform="${m}"><g data-key="${i}">${keyFace("iso-shade cp-key-back")}</g></g></g><g transform="translate(${f2(f2v[0] + f1[0] * 0.5)} ${f2(f2v[1] + f1[1] * 0.5)})"><g transform="${m}"><g data-key="${i}"><path class="iso-fill cp-key" d="${bow}"/><path class="iso-line" data-tone="faint" d="M-2.6 -9.4L2.6 -9.4"/><path class="iso-line iso-edge" data-tone="hi" d="${bow}"/><path class="iso-shade" data-shade="0" d="${hole}"/><path class="iso-line" data-tone="mid" d="${hole}"/></g></g></g>`;
  return `<g data-lock="${i}">${plate}${bezel}${key}</g>`;
}

/* ---------- drawers ---------- */
const hull = (pts) => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
};
function card(kind, x, y, z) {
  const pl = plan(x, y, 7.4, 5.6, 0.6);
  let s = S(slab(pl, z, 4.2, 3, 0.3), { tone: "hi", crease: "lo" });
  const zt = z + 4.2;
  if (kind === 0) s += L(k.ring(x, y, 1.9, zt, P, 20) + k.lineOnTop([x, y], [x + 1.2, y - 1], zt, P), { tone: "mid" }); // timer
  if (kind === 1) s += L([[-1.8, -1], [1.8, -1], [0, 1.2]].map(([a, b]) => k.planOutline(plan(x + a, y + b, 2, 1.6, 0.2), zt, P, 1)).join(""), { tone: "mid" }); // cluster
  if (kind === 2) s += L(k.onTop([[x - 2, y + 1.4], [x, y - 1.8], [x + 2, y + 1.4]], zt, P, true) + k.lineOnTop([x, y - 0.5], [x, y + 0.5], zt, P), { tone: "mid" }); // trap
  return `<g data-card="${kind}">${s}</g>`;
}
const NAMES = ["CKA", "CKAD", "CKS"];
function drawer(i) {
  const c = COLS[i];
  const y0 = YF - DR.d, z0 = OPEN.z0 + 0.6;
  const floor = { x: c - DR.w / 2, y: y0, w: DR.w, d: DR.d, r: 0.6 };
  const parts = [];
  parts.push(S(slab(floor, z0, 1, 2, 0), { tone: "mid", crease: "none" }));
  parts.push(S(slab({ x: c - DR.w / 2, y: y0, w: DR.w, d: 1.2, r: 0.3 }, z0 + 1, DR.wall, 2, 0.2), { tone: "mid" })); // back
  parts.push(S(slab({ x: c - DR.w / 2, y: y0, w: 1.2, d: DR.d, r: 0.3 }, z0 + 1, DR.wall, 2, 0.2), { tone: "mid" })); // left
  const cards = byDepth([[c - 7.4, YF - 22, 0], [c + 0.6, YF - 16, 1], [c + 7.6, YF - 23, 2]].map(([x, y, kd]) => [x, y, kd]));
  // cards stand on the floor; byDepth sorts by their footprint
  const order = [...cards].sort((a, b) => K.depth([a[0], a[1], 0]) - K.depth([b[0], b[1], 0]));
  for (const [x, y, kd] of order) parts.push(card(kd, x, y, z0 + 1));
  parts.push(S(slab({ x: c + DR.w / 2 - 1.2, y: y0, w: 1.2, d: DR.d, r: 0.3 }, z0 + 1, DR.wall, 2, 0.2), { tone: "mid" })); // right
  // the front plate, its pull and its label card
  const fp = { x: c - OPEN.w / 2 + 0.6, y: YF - 0.4, w: OPEN.w - 1.2, d: 2.6, r: 0.5 };
  parts.push(S(slab(fp, OPEN.z0 + 0.4, OPEN.z1 - OPEN.z0 - 0.8, 3, 0.4), { tone: "hi", crease: "lo" }));
  const yP = fp.y + fp.d + 0.05;
  parts.push(S(slab({ x: c - 6, y: yP, w: 12, d: 1.6, r: 0.5 }, 13, 1.6, 3, 0.2), { tone: "mid" }));
  parts.push(S(slab({ x: c - 6, y: yP, w: 1.6, d: 1.6, r: 0.3 }, 11.6, 1.4, 2, 0), { tone: "mid", crease: "none" }) + S(slab({ x: c + 4.4, y: yP, w: 1.6, d: 1.6, r: 0.3 }, 11.6, 1.4, 2, 0), { tone: "mid", crease: "none" }));
  parts.push(L(poly([[c - 8, yP, 16], [c + 8, yP, 16], [c + 8, yP, 21.6], [c - 8, yP, 21.6]], true), { tone: "lo" }));
  const o = at([c, yP, 17.5]);
  const X = at([c + 1, yP, 17.5]), Y = at([c, yP, 16.5]);
  const mtx = [X[0] - o[0], X[1] - o[1], Y[0] - o[0], Y[1] - o[1], o[0], o[1]].map((v) => f2(v)).join(" ");
  parts.push(k.faceTextSvg(`matrix(${mtx})`, NAMES[i], { size: 3.4, tone: "hi", anchor: "middle" }));
  parts.push(D([at([c - 10.6, yP, 20.6]), at([c + 10.6, yP, 20.6])], { size: 0.38 }));
  // clip: the opening swept along the travel, so the part still inside the vault stays hidden
  const rect = (dy) => [[c - OPEN.w / 2, YF + dy, OPEN.z0], [c + OPEN.w / 2, YF + dy, OPEN.z0], [c + OPEN.w / 2, YF + dy, OPEN.z1], [c - OPEN.w / 2, YF + dy, OPEN.z1]].map(at);
  const clip = k.pathOf(hull([...rect(0), ...rect(TRAVEL + 4)]), true);
  return `<clipPath id="cp-clip-${i}"><path d="${clip}"/></clipPath><g clip-path="url(#cp-clip-${i})"><g data-drawer="${i}">${parts.join("")}</g></g>`;
}

/* ---------- assemble ---------- */
const body = [
  plinth(K, PLATE, { strip: { x: -66, y: PLATE.y + PLATE.d - 13, w: 96, d: 6, r: 1 }, label: { x: 52, y: 36, w: 22, d: 11, r: 1.2 } }),
  vault(),
  `<g data-hit="timer">${timer()}</g>`,
  top(),
  `<g data-hit="key">${[0, 1, 2].map(lock).join("")}</g>`,
  `<g data-hit="drawer">${[0, 1, 2].map(drawer).join("")}</g>`,
];
const LABEL = "Scale model of a three-key vault on a plinth: one key and one drawer each for CKA, CKAD and CKS; each drawer holds three cards (a timer, a cluster and a trap), and a timer dial on top stands for the timed mock exams.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

const DATA = {
  open: k.axisVector(P, [0, TRAVEL, 0]).map(f2),
  dial: { c: at([DIAL[0], DIAL[1], DIAL_TOP + 0.05]).map(f2), u: k.axisVector(P, [1, 0, 0]).map(f2), v: k.axisVector(P, [0, 1, 0]).map(f2), r: DIAL_R - 2.6 },
};

const SCENE_CSS = `/* certprep vault: scene tokens and states (kit palette from ../cellular/mast.css) */
.iso{--cp-glow:#00D9FF;--cp-arc:#00708a}
:root[data-theme="dark"] .iso{--cp-arc:#00D9FF}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .iso{--cp-arc:#00D9FF}}
[data-hit]{--hl:var(--anatomy-lit)}
.cp-dot{fill:var(--anatomy-mid)}
.cp-key-back{fill:var(--anatomy-shade-0)}
.cp-arc{fill:color-mix(in srgb,var(--cp-glow) 28%,transparent);stroke:var(--cp-arc);stroke-width:.8}
[data-led][data-lit] .iso-top,[data-led][data-lit] .iso-shade{fill:var(--cp-glow)}
[data-lock][data-cur] .iso-edge,[data-lock][data-cur] [data-tone="mid"]{stroke:var(--anatomy-lit)}
[data-lock][data-cur] .cp-key{fill:color-mix(in srgb,var(--cp-glow) 18%,var(--anatomy-paper))}
[data-drawer][data-cur] > .iso-solid .iso-edge{stroke:var(--anatomy-lit)}
[data-card][data-lit] .iso-top{fill:color-mix(in srgb,var(--cp-glow) 40%,var(--anatomy-top))}
[data-card][data-lit] .iso-edge,[data-card][data-lit] .iso-line{stroke:var(--anatomy-lit)}
[data-hit="timer"][data-cur] .iso-edge{stroke:var(--anatomy-lit)}
.iso-svg[data-ink] .cp-arc{opacity:0}
`;
writeFileSync(HERE + "/certprep.css", SCENE_CSS);

// poster: CKA key turned, its drawer open, the timer card lit
function posterOf(s) {
  const ang = 90;
  const d = DATA.dial, pt = (a, r) => [d.c[0] + Math.sin(a) * r * d.u[0] - Math.cos(a) * r * d.v[0], d.c[1] + Math.sin(a) * r * d.u[1] - Math.cos(a) * r * d.v[1]].map(f2);
  const a = 0.3 * Math.PI * 2, h0 = pt(a + Math.PI, 1.6), h1 = pt(a, d.r);
  let arcD = `M${d.c.join(" ")}`;
  for (let j = 0; j <= 16; j++) arcD += `L${pt((a * j) / 16, d.r - 0.4).join(" ")}`;
  return s
    .replace('data-hand="" style="stroke-width:1.3" d=""', `data-hand="" style="stroke-width:1.3" d="M${h0.join(" ")}L${h1.join(" ")}"`)
    .replace('data-arc="" d=""', `data-arc="" d="${arcD}Z"`)
    .replace(/<g data-key="0">/g, `<g data-key="0" transform="rotate(${ang})">`)
    .replace('<g data-lock="0">', '<g data-lock="0" data-cur="">')
    .replace('<g data-drawer="0">', `<g data-drawer="0" data-cur="" transform="translate(${DATA.open[0]} ${DATA.open[1]})">`)
    .replace('<g data-led="0">', '<g data-led="0" data-lit="">')
    .replace(/(<g data-drawer="0"[\s\S]*?)<g data-card="0">/, '$1<g data-card="0" data-lit="">');
}
writeScene(HERE, { P, svg, data: DATA, sceneCss: SCENE_CSS, poster: posterOf });
console.log("certprep: wrote art.js, poster.svg, certprep.css", JSON.stringify({ scale: P.scale.toFixed(3) }));
