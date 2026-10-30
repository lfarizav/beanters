// Build the agentic network services model: node build.mjs  (writes art.js, agentic-network.css and poster.svg)
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan) through ../agentic/bench.mjs.
//
// Truth notes (beanters-work/proyectos/agentic/RESEARCH.md, checked against RESEARCH.AUDIT.md, which wins):
// - CAMARA Device Location: Geofencing Subscriptions emits area-entered / area-left events for a circular area;
//   Location Verification answers TRUE, FALSE or PARTIAL for a circle. Quality on Demand requests stable latency or
//   throughput for a flow; Population Density Data returns anonymized estimates per grid cell. (audit claims 2, 3)
// - Tracking a person needs consent: CAMARA requires three-legged tokens (the line holder's authorization) when
//   personal data is processed. The specs do not name elderly people or children; that use is this project's.
// - Sylva (Linux Foundation Europe telco cloud): Cluster API manages cluster lifecycle and Flux keeps clusters in
//   sync with Git (audit claim 6). Sylva says nothing about agents: running the agent and the APIs on a
//   Sylva-aligned cloud is this project's design. No operator is claimed to deploy from natural language today.
// No version numbers are drawn.
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, kitFor, plinth, writeScene } from "../agentic/bench.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const W = 760, H = 580;
const PLATE = { x: -132, y: -108, w: 264, d: 216, r: 10 };
const CLOUD = { x: -126, y: -104, w: 92, d: 50, r: 2 }; // Sylva-aligned telco cloud platform
const CLOUD_Z = 4;
const RACKS = [{ x: -118, h: 36 }, { x: -92, h: 30 }, { x: -66, h: 30 }]; // management cluster first, two workload clusters
const RACK = { y: -98, w: 20, d: 16 };
const GIT = { x: -122, y: -74, w: 22, d: 14, r: 1 };
const GW = { x: -24, y: -100, w: 48, d: 22, r: 1.5 }; // CAMARA network API gateway
const GW_H = 18;
const AGENT = [45, -88];
const DESK = { x: 82, y: -96, w: 36, d: 20, r: 1 };
const DESK_Z = 14;
const PERSON = [96, -66];
const BS = [[-100, 2], [40, 40]];
const BS_TOP = 78;
const ZONE = { c: [-78, 56], r: 26 }; // geofence
const ELDER_FROM = [-84, 58], ELDER_TO = [-114, 80];
const CROWD = [-20, 46];
const POS = [36, 70], POS_ZONE = 16;
const PAY_IN = [26, 64], PAY_OUT = [62, 46];
const QOD = [108, 66];

const extremes = [...k.boxCorners(PLATE, -14, 0), ...BS.map(([x, y]) => [x, y, BS_TOP + 14]), [RACKS[0].x, RACK.y, CLOUD_Z + 46]];
const P = k.fitProjection(extremes, W, H, { pad: 14, azimuth: 45, elevation: 32 });
const K = kitFor(P);
const { S, L, D, at, poly, slab, cyl, plan, byDepth, depth, faceY, top } = K;
const KK = P.scale * Math.sqrt(1.6);
const sinE = Math.sin(P.elevation * Math.PI / 180);
const r2 = (v) => v.map((n) => +n.toFixed(2));
const rectY = (yF, x0, x1, z0, z1) => poly([[x0, yF, z0], [x1, yF, z0], [x1, yF, z1], [x0, yF, z1]], true);
const rectX = (xF, y0, y1, z0, z1) => poly([[xF, y0, z0], [xF, y1, z0], [xF, y1, z1], [xF, y0, z1]], true);
const textY = (x, yF, z, text, size = 4, tone = "hi") => k.faceTextSvg(faceY(x, yF + 0.06, z), text, { size, tone, anchor: "middle" });
const dot = (p, r, cls, extra = "") => { const q = at(p); return `<circle class="${cls}" ${extra} cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r}"/>`; };

/* ---------- Sylva-aligned telco cloud: racks (clusters), pods, Git and Flux ---------- */
export const PODS = [];
function cloud() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CLOUD, 0, 2, P)}" style="filter:blur(6px)"/>`];
  out.push(S(slab(CLOUD, 0, CLOUD_Z, 6, 0.6), { tone: "mid", inner: L(k.sideSeam(CLOUD, 2, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(CLOUD, 3), CLOUD_Z, P), { tone: "faint" }));
  // Git ledger and the Flux line to the racks
  out.push(S(slab(GIT, CLOUD_Z, 3, 3, 0.3), { tone: "mid" }));
  const g = k.insetPlan(GIT, 2);
  out.push(S(slab(g, CLOUD_Z + 3, 1.2, 3, 0.2), { tone: "hi", crease: "none" }));
  out.push(L([0, 1, 2, 3].map((i) => k.lineOnTop([g.x + 3, g.y + 2.4 + i * 2.4], [g.x + 9 + (i * 3) % 7, g.y + 2.4 + i * 2.4], CLOUD_Z + 4.2, P)).join(""), { tone: "lo", free: true }));
  out.push(D([0, 1, 2, 3].map((i) => at([g.x + 1.4, g.y + 2.4 + i * 2.4, CLOUD_Z + 4.2])), { size: 0.5, tone: "mid" }));
  const flux = [[GIT.x + GIT.w + 0.6, GIT.y + GIT.d / 2, CLOUD_Z + 0.4], [-40, GIT.y + GIT.d / 2, CLOUD_Z + 0.4], [-40, RACK.y + RACK.d + 1.2, CLOUD_Z + 0.4]];
  const fp = flux.map(at);
  out.push(k.wireSvg(fp[0], fp[2], { via: [fp[1]], tone: "lo", size: 0.8 }));
  out.push(`<path class="iso-line an-flow" data-ink-skip="" data-flux="" d="${k.pathOf(fp)}"/>`);
  // racks: front faces with server units and lamps, pods appear on top when the agent deploys
  RACKS.forEach((r, ri) => {
    const pl = { x: r.x, y: RACK.y, w: RACK.w, d: RACK.d, r: 0.8 };
    out.push(S(slab(pl, CLOUD_Z, r.h, 4, 0.5), { tone: "hi", crease: "lo", inner: L(k.sideSeam(pl, CLOUD_Z + r.h - 3, P, 4), { tone: "faint" }) }));
    const yF = pl.y + pl.d + 0.05;
    const units = Math.floor((r.h - 6) / 5);
    for (let u = 0; u < units; u++) {
      const z0 = CLOUD_Z + 2 + u * 5;
      out.push(L(rectY(yF, pl.x + 2, pl.x + pl.w - 2, z0, z0 + 4), { tone: "lo" }));
      out.push(L([0, 1, 2].map((j) => k.segment([pl.x + 4 + j * 2, yF, z0 + 1], [pl.x + 4 + j * 2, yF, z0 + 3], P)).join(""), { tone: "faint" }));
      out.push(dot([pl.x + pl.w - 4, yF, z0 + 2], 0.8, "an-led", `data-led="${ri}"`));
    }
    if (ri === 0) out.push(S(cyl(pl.x + 15, pl.y + 5, 1.6, CLOUD_Z + r.h, 3, 16, 0.3), { tone: "mid" })); // the management cluster's beacon
    const spots = ri === 0 ? [] : [[pl.x + 5, pl.y + 4], [pl.x + 13, pl.y + 4], [pl.x + 5, pl.y + 11], [pl.x + 13, pl.y + 11]];
    for (const [x, y] of byDepth(spots)) {
      const id = PODS.length;
      PODS.push([x, y]);
      out.push(`<g class="an-pod" data-pod="${id}">${S(slab(plan(x, y, 6, 5, 0.4), CLOUD_Z + r.h, 4.6, 3, 0.3), { tone: "hi", crease: "lo" })}</g>`);
    }
  });
  return out.join("");
}

/* ---------- CAMARA network API gateway: four service modules ---------- */
export const APIS = ["geo", "loc", "qod", "den"];
const API_TEXT = { geo: "GEO", loc: "LOC", qod: "QoD", den: "DEN" };
function gateway() {
  const out = [`<path class="iso-halo" d="${k.haloOf(GW, 0, 2, P)}" style="filter:blur(5px)"/>`];
  out.push(S(slab(k.insetPlan(GW, -1.6), 0, 2, 4, 0.4), { tone: "lo" }));
  out.push(S(slab(GW, 2, GW_H - 2, 4, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(GW, GW_H - 4, P, 4), { tone: "faint" }) }));
  const yF = GW.y + GW.d + 0.05;
  APIS.forEach((name, i) => {
    const x0 = GW.x + 3 + i * 11;
    out.push(`<g data-api="${name}"><path class="an-api" d="${rectY(yF, x0, x0 + 9.4, 4, 11)}"/>${L(rectY(yF, x0, x0 + 9.4, 4, 11), { tone: "mid" })}<g data-ink-skip="">${textY(x0 + 4.7, yF, 6, API_TEXT[name], 3)}</g></g>`);
  });
  out.push(`<g data-ink-skip="">${textY(GW.x + GW.w / 2, yF, 13, "CAMARA", 3.4, "mid")}</g>`);
  out.push(L([0, 1, 2].map((j) => rectX(GW.x + GW.w + 0.05, GW.y + 5, GW.y + GW.d - 5, 5 + j * 3.4, 6.2 + j * 3.4)).join(""), { tone: "lo" }));
  return out.join("");
}

/* ---------- the AI agent: a round controller with a lit ring ---------- */
function agent() {
  const [x, y] = AGENT;
  const out = [`<path class="iso-halo" d="${k.haloOf(plan(x, y, 28, 28, 14), 0, 1, P)}" style="filter:blur(5px)"/>`];
  out.push(S(cyl(x, y, 14, 0, 3, 56, 0.5), { tone: "lo" }));
  out.push(S(cyl(x, y, 11.5, 3, 12, 56, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideArc(x, y, 11.5, 9, P, 40), { tone: "faint" }) }));
  out.push(`<g data-agent-ring="">${S(cyl(x, y, 9, 15, 2, 48, 0.3), { tone: "hi", crease: "lo" })}</g>`);
  out.push(S(cyl(x, y, 6, 17, 4, 40, 0.4), { tone: "hi", crease: "lo" }));
  out.push(L(k.ring(x, y, 3.6, 21, P, 32), { tone: "lo" }));
  out.push(dot([x, y, 21], 1.4, "an-core", 'data-core=""'));
  // ticks round the top ring: the agent's "tools"
  const t = k.radialTicks(x, y, 8.6, 12, 3, 17, [0.8, 1.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  return out.join("");
}

/* ---------- the request: a desk with a laptop (chat), a family phone and a person ---------- */
function desk() {
  const out = [`<path class="iso-halo" d="${k.haloOf(DESK, 0, 1, P)}" style="filter:blur(4px)"/>`];
  for (const [x, y] of byDepth(k.corners(DESK, 2))) out.push(S(cyl(x, y, 1, 0, DESK_Z, 12), { tone: "mid", crease: "none" }));
  out.push(S(slab(DESK, DESK_Z, 2, 4, 0.4), { tone: "hi", crease: "lo" }));
  const z = DESK_Z + 2;
  const base = { x: DESK.x + 6, y: DESK.y + 8, w: 16, d: 10, r: 0.6 };
  out.push(S(slab(base, z, 0.9, 3, 0.2), { tone: "mid" }));
  out.push(L([0, 1, 2].map((i) => k.lineOnTop([base.x + 2, base.y + 3 + i * 2], [base.x + base.w - 2, base.y + 3 + i * 2], z + 0.9, P)).join(""), { tone: "faint", free: true }));
  const scr = { x: base.x, y: base.y - 1, w: base.w, d: 1, r: 0.2 };
  out.push(S(slab(scr, z, 11, 3, 0.2), { tone: "hi", crease: "lo" }));
  const yF = scr.y + scr.d + 0.05;
  out.push(`<path class="an-screen" data-laptop="" d="${rectY(yF, scr.x + 1, scr.x + scr.w - 1, z + 1.2, z + 10)}"/>`);
  // the chat: two message lines that type in, each its own path
  const line = (x0, x1, zz, i) => `<path class="iso-line an-chat" data-chat="${i}" data-ink-skip="" pathLength="1" d="${poly([[x0, yF + 0.02, zz], [x1, yF + 0.02, zz]])}"/>`;
  out.push(line(scr.x + 2.5, scr.x + 12, z + 8, 0), line(scr.x + 2.5, scr.x + 9, z + 6.4, 1), line(scr.x + 6, scr.x + 14, z + 3.6, 2));
  // microphone on its stand
  out.push(S(cyl(DESK.x + 28, DESK.y + 13, 2, z, 0.8, 16, 0.2), { tone: "mid" }));
  out.push(S(cyl(DESK.x + 28, DESK.y + 13, 0.4, z + 0.8, 5, 8), { tone: "mid", crease: "none" }));
  out.push(`<g data-mic="">${S(cyl(DESK.x + 28, DESK.y + 13, 1.3, z + 5.8, 2.6, 16, 0.5), { tone: "hi", crease: "lo" })}</g>`);
  // the family phone lying on the desk: its screen flashes on an alert
  const ph = { x: DESK.x + 26, y: DESK.y + 3, w: 5, d: 8, r: 0.6 };
  out.push(S(slab(ph, z, 0.9, 3, 0.2), { tone: "hi", crease: "lo" }));
  out.push(`<path class="an-screen" data-family="" d="${poly([[ph.x + 0.6, ph.y + 0.8, z + 0.95], [ph.x + ph.w - 0.6, ph.y + 0.8, z + 0.95], [ph.x + ph.w - 0.6, ph.y + ph.d - 0.8, z + 0.95], [ph.x + 0.6, ph.y + ph.d - 0.8, z + 0.95]], true)}"/>`);
  return out.join("");
}
function person([x, y], z0 = 0, tone = "hi") {
  return S(cyl(x, y, 2.6, z0, 13, 20), { tone: "mid", crease: "none" }) + S(cyl(x, y, 2.1, z0 + 13.4, 4, 20, 0.8), { tone, crease: "none" });
}

/* ---------- 4G and 5G base stations ---------- */
function station([x, y]) {
  const out = [`<path class="iso-halo" d="${k.haloOf(plan(x, y, 18, 18, 3), 0, 1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(slab(plan(x, y, 18, 18, 2), 0, 1.4, 3, 0.4), { tone: "lo" }));
  out.push(S(cyl(x, y, 3.6, 1.4, 40, 28), { tone: "mid", crease: "none" }));
  out.push(S(cyl(x, y, 4.4, 40, 2, 28, 0.3), { tone: "mid" }));
  out.push(S(cyl(x, y, 2.8, 42, BS_TOP - 42, 28), { tone: "mid", crease: "none" }));
  out.push(S(cyl(x, y, 8.5, BS_TOP - 16, 1.4, 40, 0.3), { tone: "mid" }));
  const panels = [210, 330, 90].map((deg) => {
    const a = deg * Math.PI / 180, cx = x + Math.cos(a) * 6, cy = y + Math.sin(a) * 6, ux = Math.cos(a), uy = Math.sin(a), tx = -uy, ty = ux;
    const ring = [[1, -3], [1, 3], [-1, 3], [-1, -3]].map(([p, q]) => [cx + ux * p + tx * q, cy + uy * p + ty * q]);
    return { d: depth([cx, cy]), s: `<g data-panel="">${S(k.extrude(ring, BS_TOP - 14.6, 14, P, { bevel: 0.3 }), { tone: "hi", crease: "lo" })}</g>` };
  }).sort((a, b) => a.d - b.d);
  const behind = panels.filter((p) => p.d < depth([x, y])), front = panels.filter((p) => p.d >= depth([x, y]));
  out.push(...behind.map((p) => p.s));
  out.push(S(cyl(x, y, 2.4, BS_TOP - 15, 15, 24), { tone: "mid", crease: "none" }));
  out.push(...front.map((p) => p.s));
  out.push(S(cyl(x, y, 0.5, BS_TOP, 8, 10), { tone: "mid", crease: "none" }));
  return out.join("");
}

/* ---------- phones on the floor (standing, screen to the viewer) ---------- */
function phoneAt([x, y], name) {
  const out = [S(slab(plan(x, y, 9, 6, 1), 0, 1.4, 3, 0.3), { tone: "lo" })];
  const pl = plan(x, y, 5.4, 1.5, 0.4);
  out.push(S(slab(pl, 1.4, 10, 3, 0.2), { tone: "hi", crease: "lo" }));
  const yF = pl.y + pl.d + 0.05;
  out.push(`<path class="an-screen" data-phone="${name}" d="${rectY(yF, x - 2, x + 2, 3, 10.6)}"/>`);
  out.push(L(rectY(yF, x - 2, x + 2, 3, 10.6), { tone: "mid" }));
  return out.join("");
}
// the payment terminal with an approve and a deny lamp
function pos() {
  const [x, y] = POS;
  const pl = plan(x, y, 12, 9, 1);
  const out = [`<path class="iso-halo" d="${k.haloOf(pl, 0, 1, P)}" style="filter:blur(3px)"/>`, S(slab(pl, 0, 8, 3, 0.4), { tone: "hi", crease: "lo" })];
  const yF = pl.y + pl.d + 0.05;
  out.push(`<path class="an-screen" data-pos-screen="" d="${rectY(yF, x - 4.6, x + 1.4, 3.4, 6.8)}"/>`);
  out.push(L(rectY(yF, x - 4.6, x + 1.4, 3.4, 6.8), { tone: "mid" }));
  out.push(dot([x + 3.4, yF, 5.9], 1, "an-ok", 'data-ok=""'), dot([x + 3.4, yF, 3.6], 1, "an-no", 'data-no=""'));
  out.push(L(k.lineOnTop([pl.x + 2, pl.y + 2], [pl.x + pl.w - 2, pl.y + 2], 8, P), { tone: "lo" })); // the card slot
  return out.join("");
}

/* ---------- floor: geofence, payment zone, density grid ---------- */
export const GRID = [];
function floor() {
  const out = [];
  const z = 0.15;
  out.push(`<path class="an-zone" data-zone="" d="${k.ring(ZONE.c[0], ZONE.c[1], ZONE.r, z, P, 64)}"/>`);
  out.push(`<path class="iso-line an-zone-edge" data-zone-edge="" d="${k.ring(ZONE.c[0], ZONE.c[1], ZONE.r, z, P, 64)}"/>`);
  out.push(`<path class="an-zone an-zone--pay" data-pay-zone="" d="${k.ring(POS[0], POS[1], POS_ZONE, z, P, 48)}"/>`);
  out.push(`<path class="iso-line an-zone-edge an-zone-edge--pay" d="${k.ring(POS[0], POS[1], POS_ZONE, z, P, 48)}"/>`);
  // anonymized density per grid cell over the crowd
  const N = 6, C = 8, x0 = CROWD[0] - (N * C) / 2, y0 = CROWD[1] - (N * C) / 2;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const cx = x0 + (i + 0.5) * C, cy = y0 + (j + 0.5) * C;
    const dd = Math.hypot(cx - CROWD[0], cy - CROWD[1]) / (C * 3.2);
    const v = Math.max(0.08, 1 - dd);
    GRID.push(+v.toFixed(2));
    out.push(`<path class="an-cell" data-cell="${GRID.length - 1}" d="${poly([[x0 + i * C + 0.4, y0 + j * C + 0.4, z], [x0 + (i + 1) * C - 0.4, y0 + j * C + 0.4, z], [x0 + (i + 1) * C - 0.4, y0 + (j + 1) * C - 0.4, z], [x0 + i * C + 0.4, y0 + (j + 1) * C - 0.4, z]], true)}"/>`);
  }
  return `<g data-ink-skip="">${out.join("")}</g>`;
}
const CROWD_AT = [[-26, 40], [-18, 38], [-11, 42], [-24, 48], [-15, 47], [-27, 55], [-19, 54], [-10, 52]];
const small = ([x, y]) => S(cyl(x, y, 1.7, 0, 7, 16), { tone: "mid", crease: "none" }) + S(cyl(x, y, 1.4, 7.3, 2.6, 16, 0.6), { tone: "mid", crease: "none" });
function crowd() { return byDepth(CROWD_AT).map(small).join(""); }

/* ---------- floor wires: desk to agent to gateway to cloud and stations ---------- */
const WIRES = {
  req: [[DESK.x - 0.6, -86, 0.4], [AGENT[0] + 14.4, -86, 0.4]],
  gw: [[AGENT[0] - 14.4, -89, 0.4], [GW.x + GW.w + 0.6, -89, 0.4]],
  cloud: [[GW.x - 0.6, -86, 0.4], [CLOUD.x + CLOUD.w + 0.6, -86, 0.4]],
  bs1: [[-8, GW.y + GW.d + 0.6, 0.4], [-8, -40, 0.4], [BS[0][0], -40, 0.4], [BS[0][0], BS[0][1] - 9.6, 0.4]],
  bs2: [[10, GW.y + GW.d + 0.6, 0.4], [10, -34, 0.4], [BS[1][0], -34, 0.4], [BS[1][0], BS[1][1] - 9.6, 0.4]],
};
function wires() {
  return Object.entries(WIRES).map(([name, pts]) => { const p = pts.map(at); return k.wireSvg(p[0], p[p.length - 1], { via: p.slice(1, -1), tone: "mid", size: 0.9 }) + `<path class="iso-line an-flow" data-ink-skip="" data-wire="${name}" d="${k.pathOf(p)}"/>`; }).join("");
}

/* ---------- the elder's phone (moves) and the QoD lane ---------- */
function elder() { return `<g data-elder="">${phoneAt(ELDER_FROM, "elder")}</g>`; }
const PANEL2 = [BS[1][0] + 5, BS[1][1] + 4, BS_TOP - 8];
function lane() {
  const a = at(PANEL2), b = at([QOD[0], QOD[1] + 0.8, 9]);
  return `<g data-ink-skip=""><path class="an-lane" data-lane="" d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/><path class="an-lane-core" data-lane-core="" d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/></g>`;
}

/* ---------- assemble ---------- */
const items = [
  { d: depth([CLOUD.x + CLOUD.w / 2, CLOUD.y + CLOUD.d / 2]), s: `<g data-hit="sylva">${cloud()}</g>` },
  { d: depth([GW.x + GW.w / 2, GW.y + GW.d / 2]), s: `<g data-hit="apis">${gateway()}</g>` },
  { d: depth(AGENT), s: `<g data-hit="agent">${agent()}</g>` },
  { d: depth([DESK.x + DESK.w / 2, DESK.y + DESK.d / 2]), s: `<g data-hit="request">${desk()}</g>` },
  { d: depth(PERSON), s: `<g data-hit="request">${person(PERSON)}</g>` },
  ...BS.map((b, i) => ({ d: depth(b), s: `<g data-hit="radio" data-bs="${i}">${station(b)}</g>` })),
  { d: depth(CROWD) + 4, s: `<g data-hit="density">${crowd()}</g>` },
  { d: depth(ELDER_FROM), s: `<g data-hit="geofence">${elder()}</g>` },
  { d: depth(POS), s: `<g data-hit="pay">${pos()}</g>` },
  { d: depth(PAY_IN), s: `<g data-hit="pay">${phoneAt(PAY_IN, "in")}</g>` },
  { d: depth(PAY_OUT), s: `<g data-hit="pay">${phoneAt(PAY_OUT, "out")}</g>` },
  { d: depth(QOD), s: `<g data-hit="qod">${phoneAt(QOD, "qod")}</g>` },
].sort((a, b) => a.d - b.d);

const body = [
  plinth(K, PLATE, { strip: { x: -66, y: PLATE.y + PLATE.d - 14, w: 132, d: 6, r: 1 }, label: { x: 96, y: PLATE.y + PLATE.d - 26, w: 24, d: 12, r: 1.2 } }),
  floor(),
  wires(),
  ...items.map((i) => i.s),
  lane(),
  `<circle class="an-spark" data-spark="a" r="2" cx="0" cy="0"/><circle class="an-spark an-spark--alert" data-spark="b" r="2.2" cx="0" cy="0"/>`,
];
const LABEL = "Isometric model of agentic AI on a 4G and 5G network: a person at a desk types or speaks a request to a round AI agent; the agent calls a CAMARA network API gateway with four modules (geofencing, location verification, quality on demand, population density) that runs on a Sylva-aligned telco cloud of Kubernetes racks with a Git ledger and a Flux line; two base stations serve a geofenced area with an older person's phone, a payment terminal inside its zone, a phone with a reserved quality lane and a crowd over a density grid.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

const vec = (dx, dy) => r2(k.axisVector(P, [dx, dy, 0]));
const DATA = {
  wires: Object.fromEntries(Object.entries(WIRES).map(([n, pts]) => [n, pts.map(at).map(r2)])),
  elderMove: vec(ELDER_TO[0] - ELDER_FROM[0], ELDER_TO[1] - ELDER_FROM[1]),
  elderCross: +((ZONE.r - Math.hypot(ELDER_FROM[0] - ZONE.c[0], ELDER_FROM[1] - ZONE.c[1])) / Math.hypot(ELDER_TO[0] - ELDER_FROM[0], ELDER_TO[1] - ELDER_FROM[1])).toFixed(3),
  // the alert travels from the elder's phone (at its end point) to the station, the gateway, the agent and the family phone
  alert: [[ELDER_TO[0], ELDER_TO[1] + 0.8, 9], [BS[0][0], BS[0][1], BS_TOP - 8], [BS[0][0], BS[0][1], 1], [BS[0][0], -40, 0.4], [-8, -40, 0.4], [-8, GW.y + GW.d, 10], [AGENT[0], AGENT[1], 18], [DESK.x + 28, DESK.y + 7, DESK_Z + 3]].map(at).map(r2),
  check: [[POS[0], POS[1], 8], [BS[1][0], BS[1][1], BS_TOP - 8], [BS[1][0], BS[1][1], 1], [BS[1][0], -34, 0.4], [10, -34, 0.4], [10, GW.y + GW.d, 10]].map(at).map(r2),
  grid: GRID,
  pods: PODS.length,
  pins: {
    "a-request": r2(at([DESK.x + DESK.w / 2, DESK.y + DESK.d, 0.2])),
    "a-agent": r2(at([AGENT[0], AGENT[1], 24])),
    "a-apis": r2(at([GW.x + GW.w / 2, GW.y + GW.d / 2, GW_H + 8])),
    "a-sylva": r2(at([RACKS[1].x + 10, RACK.y + 8, CLOUD_Z + 44])),
    "a-radio": r2(at([BS[1][0], BS[1][1], BS_TOP + 12])),
    "a-geofence": r2(at([ZONE.c[0], ZONE.c[1] - ZONE.r, 0.2])),
    "a-pay": r2(at([POS[0], POS[1] + POS_ZONE, 0.2])),
    "a-qod": r2(at([QOD[0], QOD[1], 16])),
    "a-density": r2(at([CROWD[0] - 24, CROWD[1] + 6, 0.2])),
  },
};

const SCENE_CSS = `/* agentic network model: scene tokens and states (kit palette from ../cellular/mast.css) */
.iso{--an-spark:#00D9FF;--an-flow:#00708a;--an-glow:#00b8d9;--an-alert:#dc2626;--an-ok:#16a34a;--an-heat:#f59e0b;--an-lane:#7c3aed;--an-zone:rgba(0,112,138,.07)}
:root[data-theme="dark"] .iso{--an-flow:#00D9FF;--an-glow:#00D9FF;--an-alert:#f87171;--an-ok:#4ade80;--an-heat:#fbbf24;--an-lane:#a78bfa;--an-zone:rgba(0,217,255,.07)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .iso{--an-flow:#00D9FF;--an-glow:#00D9FF;--an-alert:#f87171;--an-ok:#4ade80;--an-heat:#fbbf24;--an-lane:#a78bfa;--an-zone:rgba(0,217,255,.07)}}
[data-hit]{--hl:var(--anatomy-lit)}
.an-flow{fill:none;stroke:var(--an-flow);stroke-width:1.2;stroke-dasharray:2 5;stroke-linecap:round;opacity:0;animation:iso-flow .9s linear infinite}
.an-spark{fill:var(--an-spark);opacity:0}.an-spark--alert{fill:var(--an-alert)}
.an-screen{fill:var(--anatomy-shade-1);stroke:none;transition:fill .4s}
.an-screen[data-on]{fill:color-mix(in srgb,var(--an-glow) 45%,var(--anatomy-top))}
.an-screen[data-alert]{fill:color-mix(in srgb,var(--an-alert) 55%,var(--anatomy-top))}
.an-screen[data-okay]{fill:color-mix(in srgb,var(--an-ok) 50%,var(--anatomy-top))}
.an-chat{stroke:var(--anatomy-hi);stroke-width:1.1;stroke-dasharray:1 1;stroke-dashoffset:1}
.an-api{fill:var(--anatomy-shade-2);stroke:none;transition:fill .4s}
[data-api][data-on] .an-api{fill:color-mix(in srgb,var(--an-glow) 40%,var(--anatomy-top))}
.an-led{fill:var(--anatomy-lo)}.an-led[data-on]{fill:var(--an-spark)}
.an-core{fill:var(--anatomy-lo)}.an-core[data-on]{fill:var(--an-spark)}
[data-agent-ring][data-on] .iso-top,[data-agent-ring][data-on] .iso-shade{fill:color-mix(in srgb,var(--an-glow) 40%,var(--anatomy-top))}
[data-mic][data-on] .iso-top,[data-mic][data-on] .iso-shade{fill:color-mix(in srgb,var(--an-glow) 40%,var(--anatomy-top))}
.an-pod{opacity:0}
.an-pod .iso-top{fill:color-mix(in srgb,var(--an-glow) 22%,var(--anatomy-top))}
.an-zone{fill:var(--an-zone);stroke:none}
.an-zone-edge{stroke:var(--an-flow);stroke-width:1;stroke-dasharray:3 3;fill:none}
[data-zone-edge][data-alert]{stroke:var(--an-alert)}
.an-zone-edge--pay{stroke:var(--anatomy-mid)}
.an-cell{fill:var(--an-heat);stroke:none;opacity:0}
.an-ok{fill:var(--anatomy-lo)}.an-ok[data-on]{fill:var(--an-ok)}
.an-no{fill:var(--anatomy-lo)}.an-no[data-on]{fill:var(--an-alert)}
.an-lane{fill:none;stroke:var(--an-lane);stroke-width:6;stroke-linecap:round;opacity:0}
.an-lane-core{fill:none;stroke:var(--an-lane);stroke-width:1.4;stroke-dasharray:3 4;stroke-linecap:round;opacity:0;animation:iso-flow .7s linear infinite}
[data-panel][data-on] .iso-top,[data-panel][data-on] .iso-shade{fill:color-mix(in srgb,var(--an-glow) 22%,var(--anatomy-top))}
[data-cur] .iso-edge{stroke:var(--anatomy-lit)}
[data-cur] .iso-top{fill:var(--anatomy-lit-top)}
[data-cur] .iso-shade{fill:var(--anatomy-lit-shade)}
.iso-svg[data-ink] .an-spark,.iso-svg[data-ink] .an-flow,.iso-svg[data-ink] .an-zone,.iso-svg[data-ink] .an-cell,.iso-svg[data-ink] .an-lane,.iso-svg[data-ink] .an-lane-core,.iso-svg[data-ink] .an-screen,.iso-svg[data-ink] .an-api{opacity:0!important}
`;
writeFileSync(HERE + "/agentic-network.css", SCENE_CSS);

// poster: the deployed pose, pods up, APIs lit, the density grid and the QoD lane showing
function posterOf(s) {
  s = s.replace(/class="an-pod" /g, 'class="an-pod" style="opacity:1" ');
  s = s.replace(/<g data-api="/g, '<g data-on="" data-api="');
  GRID.forEach((v, i) => { s = s.replace(`class="an-cell" data-cell="${i}"`, `class="an-cell" data-cell="${i}" style="opacity:${(v * 0.55).toFixed(2)}"`); });
  s = s.replace('class="an-lane" data-lane=""', 'class="an-lane" data-lane="" style="opacity:.28"').replace('class="an-lane-core" data-lane-core=""', 'class="an-lane-core" data-lane-core="" style="opacity:.9"');
  s = s.replace(/class="an-screen" data-phone="qod"/, 'class="an-screen" data-on="" data-phone="qod"').replace(/class="an-screen" data-laptop=""/, 'class="an-screen" data-on="" data-laptop=""');
  s = s.replace(/class="iso-line an-chat"/g, 'class="iso-line an-chat" style="stroke-dashoffset:0"');
  return s;
}
writeScene(HERE, { P, svg, data: DATA, sceneCss: SCENE_CSS, poster: posterOf });
console.log("agentic-network: wrote art.js, poster.svg, agentic-network.css", JSON.stringify({ scale: P.scale.toFixed(3), pods: PODS.length }));
