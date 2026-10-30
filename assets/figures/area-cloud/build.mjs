// Build the Cloud-native area scene: node build.mjs  (writes art.js and poster.svg)
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan) through ../areas/parts.mjs.
//
// Truth notes. The home card says: Kubestronaut; he runs cellular network functions with Helm, Flux and
// GitOps. The model: a Kubernetes cluster as a ship (the control plane is the helm wheel, worker nodes are
// decks, pods are shipping containers), a Helm chart as a packaged crate, a Git repository that Flux
// reconciles in a loop, and a magnifier for observability. The pods on the front deck are 5G core network
// functions (AMF, SMF, UPF are 3GPP 5G core functions). No numbers are drawn.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, areaKit, writeScene, SCENE_CSS, W, H, r2 } from "../areas/parts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLATE = { x: -96, y: -66, w: 180, d: 122, r: 9 };
const PED = { x: -70, y: -58, w: 16, d: 16, r: 1.4 }; // control plane pedestal (binnacle)
const PED_H = 30;
const WHEEL = { c: [-52, -40, 34], R: 18 }; // ship's wheel in front of the pedestal, facing the viewer
const REPO = { x: -88, y: 10, w: 28, d: 22, r: 1.6 }; // Git repository
const REPO_H = 12;
const CRATE = { x: -52, y: 34, w: 20, d: 16, r: 0.8 }; // Helm chart
const CRATE_H = 13;
const DECKS = [{ x: 4, y: -58, w: 76, d: 32, r: 2 }, { x: -6, y: 12, w: 76, d: 32, r: 2 }];
const DECK_H = 5;
const BOX = { w: 20, d: 13, h: 13 }; // a shipping container
const LOOP = { x0: -80, x1: -56, y0: -40, y1: 10 }; // Flux reconcile loop on the floor

const extremes = [...k.boxCorners(PLATE, -8, 0), [WHEEL.c[0] - 16, WHEEL.c[1] + 16, WHEEL.c[2] + 24], [WHEEL.c[0] + 16, WHEEL.c[1] - 16, WHEEL.c[2] + 24], [42, -42, 62]];
const A = areaKit(extremes, { pad: 8 });
const { P, S, L, D, at, poly, slab, cyl, plan, depth, rectY, rectX, textY, textX, base, box, led, wire, KK, sinE, pt } = A;

/* ---------- control plane: the helm wheel on its pedestal ---------- */
const U = [Math.SQRT1_2, -Math.SQRT1_2, 0]; // in-plane horizontal axis of the wheel (faces the viewer)
const wheelPt = (r, a) => { const [cx, cy, cz] = WHEEL.c; return at([cx + U[0] * r * Math.cos(a), cy + U[1] * r * Math.cos(a), cz + r * Math.sin(a)]); };
const ringPath = (r, n = 48) => k.pathOf(Array.from({ length: n }, (_, i) => wheelPt(r, (i / n) * Math.PI * 2)), true);
export function spokes(phi) {
  let s = "", h = "";
  for (let i = 0; i < 7; i++) {
    const a = phi + (i / 7) * Math.PI * 2;
    s += k.pathOf([wheelPt(WHEEL.R * 0.24, a), wheelPt(WHEEL.R * 0.86, a)]);
    h += k.pathOf([wheelPt(WHEEL.R * 1.04, a), wheelPt(WHEEL.R * 1.32, a)]);
  }
  return { s, h };
}
function controlPlane() {
  const out = [box(PED, PED_H, { seams: [PED_H - 4, 8] })];
  const yF = PED.y + PED.d + 0.05, xF = PED.x + PED.w + 0.05;
  out.push(L(rectY(yF, PED.x + 3, PED.x + PED.w - 3, 12, 22), { tone: "lo" }));
  for (let i = 0; i < 3; i++) out.push(led([PED.x + 5 + i * 3, yF, 9.6], `data-cp="${i}"`, 0.8));
  out.push(L([0, 1, 2].map((j) => rectX(xF, PED.y + 4, PED.y + PED.d - 4, 11 + j * 3.6, 12.2 + j * 3.6)).join(""), { tone: "lo" }));
  // compass dome on top of the binnacle
  out.push(S(cyl(PED.x + PED.w / 2, PED.y + PED.d / 2, 5, PED_H, 2, 24, 0.3), { tone: "mid" }));
  out.push(S(cyl(PED.x + PED.w / 2, PED.y + PED.d / 2, 3.4, PED_H + 2, 2.4, 24, 0.6), { tone: "hi", crease: "lo" }));
  // axle from the pedestal's front corner to the hub
  const hub = at(WHEEL.c), back = at([PED.x + PED.w - 1, PED.y + PED.d - 1, WHEEL.c[2]]);
  out.push(`<path class="ar-bold" data-tone="mid" d="${k.pathOf([back, hub])}" style="stroke-width:3"/>`);
  // the wheel: a rim (annulus), seven spokes with handles, and the lit hub
  out.push(`<g data-wheel=""><path class="iso-fill" fill-rule="evenodd" d="${ringPath(WHEEL.R)}${ringPath(WHEEL.R * 0.84)}"/>`);
  out.push(`<path class="iso-top" fill-rule="evenodd" d="${ringPath(WHEEL.R)}${ringPath(WHEEL.R * 0.84)}" style="fill:var(--anatomy-shade-3)"/>`);
  out.push(`<path class="iso-line" data-tone="hi" d="${ringPath(WHEEL.R)}${ringPath(WHEEL.R * 0.84)}"/>`);
  const sp = spokes(0);
  out.push(`<path class="ar-bold" data-spokes="" d="${sp.s}"/><path class="ar-bold" data-handles="" d="${sp.h}" style="stroke-width:3.4"/>`);
  const [hx, hy] = hub;
  out.push(`<ellipse class="ar-hub" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" rx="${(WHEEL.R * 0.24 * KK).toFixed(1)}" ry="${(WHEEL.R * 0.24 * KK * Math.cos(32 * Math.PI / 180)).toFixed(1)}"/></g>`);
  return out.join("");
}

/* ---------- Git repository with its commit graph on top ---------- */
const GIT_Y = REPO.y + 8;
const COMMITS = [0, 1, 2, 3].map((i) => [REPO.x + 5 + i * 5.4, GIT_Y]);
const NEW_COMMIT = [REPO.x + 5 + 4 * 5.4, GIT_Y];
function repo() {
  const out = [box(REPO, REPO_H, { tone: "hi", seams: [REPO_H - 3] })];
  const z = REPO_H;
  out.push(L(k.lineOnTop(COMMITS[0], NEW_COMMIT, z, P), { tone: "mid" }));
  out.push(L(k.onTop([COMMITS[1], [COMMITS[1][0] + 2, GIT_Y + 7], [COMMITS[3][0] - 2, GIT_Y + 7], COMMITS[3]], z, P), { tone: "mid" }));
  out.push(D([...COMMITS, [COMMITS[1][0] + 5, GIT_Y + 7]].map(([x, y]) => at([x, y, z])), { size: 1.1, tone: "hi" }));
  const [nx, ny] = at([...NEW_COMMIT, z]);
  out.push(`<circle class="ar-hub" data-commit="" cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="1.9"/>`);
  const yF = REPO.y + REPO.d + 0.05, xF = REPO.x + REPO.w + 0.05;
  out.push(textY(REPO.x + REPO.w / 2, yF, 4.4, "git", 5));
  out.push(L([0, 1].map((j) => rectX(xF, REPO.y + 4, REPO.y + REPO.d - 4, 5 + j * 2.6, 6 + j * 2.6)).join(""), { tone: "lo" }));
  return out.join("");
}

/* ---------- Helm chart: a packaged crate with planks, a brace and straps ---------- */
function crate() {
  const out = [A.halo(CRATE)];
  out.push(S(slab(k.insetPlan(CRATE, -1.6), 0, 2, 3, 0.3), { tone: "lo" }));
  out.push(L([-4, 0, 4].map((d) => k.lineOnTop([CRATE.x - 1, CRATE.y + CRATE.d / 2 + d], [CRATE.x + CRATE.w + 1, CRATE.y + CRATE.d / 2 + d], 2, P)).join(""), { tone: "faint" }));
  out.push(S(slab(CRATE, 2, CRATE_H - 2, 3, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(CRATE, 6.4, P, 3) + k.sideSeam(CRATE, 10, P, 3), { tone: "faint" }) }));
  const yF = CRATE.y + CRATE.d + 0.05, xF = CRATE.x + CRATE.w + 0.05;
  out.push(L(poly([[CRATE.x + 1, yF, 2.6], [CRATE.x + CRATE.w - 1, yF, CRATE_H - 0.6]]) + poly([[CRATE.x + 1, yF, CRATE_H - 0.6], [CRATE.x + CRATE.w - 1, yF, 2.6]]), { tone: "lo" }));
  out.push(textX(xF, CRATE.y + CRATE.d / 2, 6.2, "HELM", 3.4));
  const straps = [CRATE.x + 6, CRATE.x + 14].map((sx) => k.lineOnTop([sx, CRATE.y], [sx, CRATE.y + CRATE.d], CRATE_H, P)).join("");
  out.push(L(straps, { tone: "mid" }));
  return out.join("");
}

/* ---------- worker nodes: decks with bollards, carrying shipping containers (pods) ---------- */
function deck(pl, i) {
  const out = [A.halo(pl, 5)];
  out.push(S(slab(pl, 0, DECK_H, 6, 0.6), { tone: "mid", inner: L(k.sideSeam(pl, 2.4, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(pl, 2.4), DECK_H, P, 6), { tone: "lo" }));
  // deck planks along x
  out.push(L([0.33, 0.66].map((f) => k.lineOnTop([pl.x + 3, pl.y + pl.d * f], [pl.x + pl.w - 3, pl.y + pl.d * f], DECK_H, P)).join(""), { tone: "faint" }));
  const yF = pl.y + pl.d + 0.05;
  out.push(led([pl.x + pl.w - 5, yF, 2.6], `data-node="${i}"`, 1));
  out.push(textY(pl.x + 12, yF, 1.3, `node-${i + 1}`, 2.6, "mid"));
  return out.join("");
}
const slotsOf = (pl) => [0, 1, 2].map((j) => [pl.x + 13 + j * 25, pl.y + pl.d / 2]);
function container([cx, cy]) {
  const pl = plan(cx, cy, BOX.w, BOX.d, 0.4);
  const z0 = DECK_H, z1 = DECK_H + BOX.h;
  const out = [S(slab(pl, z0, BOX.h, 3, 0.4), { tone: "hi", crease: "lo" })];
  const yF = pl.y + pl.d + 0.05, xF = pl.x + pl.w + 0.05;
  // corrugated long side, edge to edge
  const ribs = [];
  for (let x = pl.x + 1.6; x < pl.x + pl.w - 1; x += 1.7) ribs.push(k.segment([x, yF, z0 + 0.6], [x, yF, z1 - 0.6], P));
  out.push(L(ribs.join(""), { tone: "faint" }));
  out.push(L(rectY(yF, pl.x + 0.6, pl.x + pl.w - 0.6, z0 + 0.6, z1 - 0.6), { tone: "lo" }));
  // doors on the end: two leaves and four lock bars
  out.push(L(rectX(xF, pl.y + 0.8, pl.y + pl.d - 0.8, z0 + 0.8, z1 - 0.8) + poly([[xF, cy, z0 + 0.8], [xF, cy, z1 - 0.8]]), { tone: "mid" }));
  out.push(L([cy - 3.6, cy - 1.4, cy + 1.4, cy + 3.6].map((y) => poly([[xF, y, z0 + 1.6], [xF, y, z1 - 1.6]])).join(""), { tone: "lo" }));
  // corner castings
  out.push(D([[pl.x + pl.w, pl.y + pl.d, z1], [pl.x + pl.w, pl.y + pl.d, z0 + 0.4], [pl.x, pl.y + pl.d, z1], [pl.x + pl.w, pl.y, z1]].map(at), { size: 0.7, tone: "hi" }));
  return out.join("");
}
const NF = ["AMF", "SMF", "UPF"];
function pods(i) {
  const pl = DECKS[i];
  return slotsOf(pl).map((s, j) => {
    const top = at([s[0], s[1] + BOX.d / 2 + 0.05, DECK_H + BOX.h + 3.4]);
    // the front deck carries the 5G core functions: a small tag above each container, in the face plane
    const tag = i === 1 ? `<g data-ink-skip="">${k.faceTextSvg(A.K.faceY(s[0], s[1] + BOX.d / 2 + 0.06, DECK_H + 3.6), NF[j], { size: 3.6, tone: "hi", anchor: "middle" })}</g>` : "";
    return `<g data-pod="${i * 3 + j}" data-deck="${i}">${container(s)}${tag}</g>`;
  }).join("");
}

/* ---------- Flux: the reconcile loop on the floor between Git and the control plane ---------- */
const loopPts = (() => {
  const { x0, x1, y0, y1 } = LOOP, r = 10, pts = [];
  const arc = (cx, cy, a0) => { for (let i = 0; i <= 8; i++) { const a = a0 + (i / 8) * Math.PI / 2; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), 0.4]); } };
  arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI); arc(x1 - r, y0 + r, Math.PI * 1.5);
  pts.push(pts[0]);
  return pts;
})();
function fluxLoop() {
  const p = loopPts.map(at);
  // the loop runs clockwise as seen from above: Git -> cluster -> Git; chevrons show the direction
  const chev = [0.18, 0.43, 0.68, 0.93].map((f) => {
    const i = Math.floor(f * (loopPts.length - 1)), a = loopPts[i], b = loopPts[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    return k.onTop([[a[0] - ux * 2 - uy * 2, a[1] - uy * 2 + ux * 2], [a[0] + ux * 1.4, a[1] + uy * 1.4], [a[0] - ux * 2 + uy * 2, a[1] - uy * 2 - ux * 2]], 0.4, P);
  }).join("");
  return `<path class="iso-line" data-tone="mid" d="${k.pathOf(p, true)}" style="stroke-width:2.2"/>${L(chev, { tone: "hi" })}<path class="iso-line ar-flow" data-ink-skip="" data-flux="" d="${k.pathOf(p, true)}"/>`;
}
// control plane to the worker decks, and the Helm crate to the front deck
const TO_A = [[PED.x + PED.w + 1.5, PED.y + 4, 0.4], [DECKS[0].x - 1.2, PED.y + 4, 0.4]];
const TO_B = [[PED.x + PED.w + 1.5, PED.y + 10, 0.4], [-30, PED.y + 10, 0.4], [-30, DECKS[1].y + 8, 0.4], [DECKS[1].x - 1.2, DECKS[1].y + 8, 0.4]];
const HELM_LINE = [[CRATE.x + CRATE.w + 1.5, CRATE.y + 8, 0.4], [DECKS[1].x - 1.2, CRATE.y + 8, 0.4]];

/* ---------- observability: a magnifying glass that sweeps over the pods ---------- */
const LENS_R = 9;
function magnifier() {
  // drawn around (0, 0) in screen space facing the viewer; the live code moves it
  const rx = LENS_R * KK, ry = rx * 0.94;
  const hx = rx * 0.72, hy = ry * 0.72;
  return `<g data-lens="" transform="translate(${pt([42, -42, 46]).join(" ")})"><ellipse class="ar-lens" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"/>` +
    `<path class="ar-bold" d="M${(hx).toFixed(1)} ${(hy).toFixed(1)}L${(hx + 15).toFixed(1)} ${(hy + 15).toFixed(1)}" style="stroke-width:4.4"/>` +
    `<ellipse fill="none" class="ar-bold" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" style="stroke-width:2.6"/>` +
    `<ellipse fill="none" class="ar-bold" data-tone="lit" rx="${(rx * 0.82).toFixed(1)}" ry="${(ry * 0.82).toFixed(1)}" style="stroke-width:.8"/>` +
    `<path class="ar-bold" data-tone="lit" d="M${(-rx * 0.6).toFixed(1)} ${(ry * 0.1).toFixed(1)}l${(rx * 0.3).toFixed(1)} 0l${(rx * 0.18).toFixed(1)} ${(-ry * 0.42).toFixed(1)}l${(rx * 0.22).toFixed(1)} ${(ry * 0.7).toFixed(1)}l${(rx * 0.16).toFixed(1)} ${(-ry * 0.28).toFixed(1)}l${(rx * 0.3).toFixed(1)} 0" style="stroke-width:1.2"/></g>`;
}

/* ---------- assemble, back to front ---------- */
const items = [
  { d: depth([PED.x + PED.w / 2, PED.y + PED.d / 2]), s: `<g data-part="cp">${controlPlane()}</g>` },
  { d: depth([REPO.x + REPO.w / 2, REPO.y + REPO.d / 2]), s: `<g data-part="git">${repo()}</g>` },
  { d: depth([CRATE.x + CRATE.w / 2, CRATE.y + CRATE.d / 2]), s: `<g data-part="helm">${crate()}</g>` },
  ...DECKS.map((pl, i) => ({ d: depth([pl.x + pl.w / 2, pl.y + pl.d / 2]), s: `<g data-part="deck${i}">${deck(pl, i)}${pods(i)}</g>` })),
].sort((a, b) => a.d - b.d);

const body = [
  base(PLATE),
  fluxLoop(),
  wire(TO_A, 'data-to="0"'), wire(TO_B, 'data-to="1"'), wire(HELM_LINE, 'data-helm-line=""'),
  ...items.map((i) => i.s),
  magnifier(),
  `<circle class="ar-spark" data-spark="flux" r="2.6"/><circle class="ar-spark" data-spark="helm" r="2.6"/>`,
];
const LABEL = "Isometric model of a Kubernetes cluster as a ship: a helm wheel on a pedestal is the control plane, two decks are the worker nodes carrying shipping containers (pods, three of them 5G core functions AMF, SMF and UPF), a Git repository and a Helm chart crate feed a Flux reconcile loop, and a magnifying glass watches the pods.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

const DATA = {
  size: [W, H],
  wheel: { c: WHEEL.c, u: U, R: WHEEL.R },
  loop: loopPts.map(at).map(r2),
  helm: HELM_LINE.map(at).map(r2),
  lift: r2(k.axisVector(P, [0, 0, 1])),
  // the lens visits these points (over each container top)
  lens: [...DECKS[0] ? slotsOf(DECKS[0]) : [], ...slotsOf(DECKS[1])].map(([x, y]) => r2(at([x - 2, y - 2, DECK_H + BOX.h + 16]))),
  pins: {
    git: pt([REPO.x + REPO.w / 2, REPO.y + REPO.d / 2, REPO_H + 7]),
    helm: [...pt([CRATE.x + CRATE.w / 2, CRATE.y + CRATE.d, 0]), "b"],
    flux: [...pt([LOOP.x1, (LOOP.y0 + LOOP.y1) / 2 + 6, 0.4]), "b"],
    cp: pt([WHEEL.c[0] + U[0] * WHEEL.R * 1.5, WHEEL.c[1] + U[1] * WHEEL.R * 1.5, WHEEL.c[2] + 4]),
    nodes: [...pt([DECKS[0].x + DECKS[0].w - 8, DECKS[0].y + DECKS[0].d, 0]), "b"],
    pods: [...pt([DECKS[1].x + DECKS[1].w / 2, DECKS[1].y + DECKS[1].d, 0]), "b"],
    obs: [...pt([DECKS[0].x + DECKS[0].w / 2, DECKS[0].y + DECKS[0].d, 0]), "b"],
  },
};

// poster: pods in place, flows off, the wheel at rest, the lens over the first deck, LEDs lit
const posterOf = (s) => s.replace(/class="ar-led" /g, 'class="ar-led" data-on="" ');
writeScene(HERE, { P, svg, data: DATA, sceneCss: SCENE_CSS, poster: posterOf });
console.log("area-cloud: wrote art.js, poster.svg", JSON.stringify({ scale: P.scale.toFixed(3), bytes: svg.length }));
