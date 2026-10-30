// Build the Telco area scene: node build.mjs  (writes art.js and poster.svg)
// Built with the Anatomy kit (../cellular/iso-kit.mjs, MIT, (c) 2026 Ryan) through ../areas/parts.mjs.
//
// Truth notes. The home card says: 4G and 5G networks with real deployments; the first LTE-based 5G Broadcast
// trial in Latin America; work at EURECOM on OpenAirInterface (open-source software for 4G and 5G networks,
// as the card's bio says). The model: a core network cabinet running open-source software, a 4G base station
// (eNB) and a 5G base station (gNB) on masts with fibre back to the core, phones that light up, and a tall
// broadcast tower whose signal reaches every phone at once. No pilot, partner or place is named or drawn.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, areaKit, writeScene, SCENE_CSS, W, H } from "../areas/parts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLATE = { x: -92, y: -66, w: 178, d: 122, r: 9 };
const CORE = { x: -84, y: -60, w: 26, d: 18, r: 1.4 };
const CORE_H = 38;
const ENB = [8, -48], GNB = [66, -12];
const MAST_H = 58;
const TOWER = [-60, 26], TOWER_H = 96, TB = 8, TT = 2.4; // lattice half-widths at base and top
const TX = { x: -48, y: 32, w: 12, d: 12, r: 0.8 };
const PHONES = [[-14, 44], [12, 46], [34, 30], [56, 42], [76, 22]];

const extremes = [...k.boxCorners(PLATE, -8, 0), [TOWER[0], TOWER[1], TOWER_H + 16], [ENB[0], ENB[1], MAST_H + 4], [CORE.x, CORE.y, CORE_H + 4]];
const A = areaKit(extremes, { pad: 8 });
const { P, S, L, D, at, poly, slab, cyl, plan, depth, textX, base, rack, mast, phone, wire, rings, led, KK, sinE, pt } = A;

/* ---------- the broadcast tower: a tapered lattice with braces, a whip on top and the transmitter below ---------- */
function tower() {
  const [x, y] = TOWER;
  const out = [A.halo(plan(x, y, TB * 2 + 6, TB * 2 + 6, 2))];
  out.push(S(slab(plan(x, y, TB * 2 + 6, TB * 2 + 6, 1.4), 0, 2, 4, 0.4), { tone: "lo" }));
  const hw = (z) => TB + (TT - TB) * (z / TOWER_H);
  const leg = (sx, sy) => poly([[x + sx * TB, y + sy * TB, 2], [x + sx * TT, y + sy * TT, TOWER_H]]);
  const back = leg(-1, -1), side = [leg(1, -1), leg(-1, 1)], front = leg(1, 1);
  const braces = (sx0, sy0, sx1, sy1) => {
    const segs = [];
    for (let z = 2; z < TOWER_H - 6; z += 12) {
      const z1 = Math.min(TOWER_H, z + 12), a = hw(z), b = hw(z1);
      segs.push(poly([[x + sx0 * a, y + sy0 * a, z], [x + sx1 * b, y + sy1 * b, z1]]), poly([[x + sx1 * a, y + sy1 * a, z], [x + sx0 * b, y + sy0 * b, z1]]), poly([[x + sx0 * b, y + sy0 * b, z1], [x + sx1 * b, y + sy1 * b, z1]]));
    }
    return segs.join("");
  };
  out.push(L(back + braces(-1, -1, 1, -1) + braces(-1, -1, -1, 1), { tone: "lo" }));
  out.push(`<path class="ar-bold" data-tone="mid" d="${side.join("")}" style="stroke-width:1.6"/>`);
  out.push(L(braces(-1, 1, 1, 1) + braces(1, -1, 1, 1), { tone: "mid" }));
  out.push(`<path class="ar-bold" d="${front}" style="stroke-width:1.8"/>`);
  // platform, whip and its tip
  out.push(S(slab(plan(x, y, TT * 2 + 4, TT * 2 + 4, 0.6), TOWER_H, 1.6, 3, 0.3), { tone: "mid" }));
  out.push(S(cyl(x, y, 1.1, TOWER_H + 1.6, 14, 12), { tone: "hi", crease: "none" }));
  out.push(`<g data-tip="">${S(cyl(x, y, 1.6, TOWER_H + 15.6, 1.4, 12, 0.3), { tone: "hi", crease: "lo", lit: true })}</g>`);
  return out.join("");
}
function transmitter() {
  const out = [A.box(TX, 14, { seams: [11] })];
  const xF = TX.x + TX.w + 0.05;
  out.push(textX(xF, TX.y + TX.d / 2, 5.6, "TX", 4));
  out.push(led([xF, TX.y + 3, 9], `data-led="tx"`, 0.9));
  // feeder from the transmitter up the tower's front leg
  const a = at([TX.x + 3, TX.y + 3, 14]), b = at([TOWER[0] + 6, TOWER[1] + 6, 24]);
  out.push(k.wireSvg(a, b, { tone: "mid", size: 0.8 }));
  return out.join("");
}

/* ---------- fibre from the core to every radio, and broadcast ripples on the floor ---------- */
const F_ENB = [[CORE.x + CORE.w + 1.6, CORE.y + 6, 0.4], [ENB[0] - 6, CORE.y + 6, 0.4], [ENB[0] - 6, ENB[1] + 4, 0.4]];
const F_GNB = [[CORE.x + CORE.w + 1.6, CORE.y + 12, 0.4], [-20, CORE.y + 12, 0.4], [-20, GNB[1] + 4, 0.4], [GNB[0] - 6, GNB[1] + 4, 0.4]];
const F_TX = [[CORE.x + 8, CORE.y + CORE.d + 1.6, 0.4], [CORE.x + 8, TX.y + 6, 0.4], [TX.x - 1.6, TX.y + 6, 0.4]];
function floorRipples() {
  const top = k.planOutline(k.insetPlan(PLATE, 1), 0, P);
  return `<defs><clipPath id="ar-telco-plate"><path d="${top}"/></clipPath></defs><g clip-path="url(#ar-telco-plate)" data-ink-skip="">${rings("ripple", [TOWER[0], TOWER[1], 0.2], 4)}</g>`;
}

const items = [
  { d: depth([CORE.x + CORE.w / 2, CORE.y + CORE.d / 2]), s: `<g data-part="core">${rack(CORE, CORE_H, { units: 5, label: "CORE", ledAttr: "data-core" })}${textX(CORE.x + CORE.w + 0.05, CORE.y + CORE.d / 2, CORE_H - 6, "OAI", 4.4)}</g>` },
  { d: depth(ENB), s: `<g data-part="enb">${mast(ENB[0], ENB[1], MAST_H, { label: "4G" })}</g>` },
  { d: depth(GNB), s: `<g data-part="gnb">${mast(GNB[0], GNB[1], MAST_H, { label: "5G" })}</g>` },
  { d: depth(TOWER), s: `<g data-part="bcast">${tower()}</g>` },
  { d: depth([TX.x + TX.w / 2, TX.y + TX.d / 2]), s: `<g data-part="tx">${transmitter()}</g>` },
  ...PHONES.map((p, i) => ({ d: depth(p), s: phone(p[0], p[1], i) })),
].sort((a, b) => a.d - b.d);

const body = [
  base(PLATE),
  floorRipples(),
  wire(F_ENB, 'data-fibre="enb"'), wire(F_GNB, 'data-fibre="gnb"'), wire(F_TX, 'data-fibre="tx"'),
  ...items.map((i) => i.s),
  rings("enb", [ENB[0], ENB[1], MAST_H - 10], 3, "ar-air"),
  rings("gnb", [GNB[0], GNB[1], MAST_H - 10], 3, "ar-air"),
  rings("bair", [TOWER[0], TOWER[1], TOWER_H + 10], 3, "ar-air"),
];
const LABEL = "Isometric model of a 4G and 5G network: a core network cabinet running open-source OpenAirInterface software, fibre to a 4G base station (eNB) and a 5G base station (gNB) on masts, five phones, and a tall lattice broadcast tower with its transmitter whose 5G Broadcast signal reaches every phone at once.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body });

const DATA = {
  size: [W, H],
  k: +KK.toFixed(4), sinE: +sinE.toFixed(4),
  // each phone's nearest base station: 0 = eNB (4G), 1 = gNB (5G)
  serve: PHONES.map((p) => (Math.hypot(p[0] - ENB[0], p[1] - ENB[1]) < Math.hypot(p[0] - GNB[0], p[1] - GNB[1]) ? 0 : 1)),
  pins: {
    core: pt([CORE.x + CORE.w / 2, CORE.y + CORE.d / 2, CORE_H + 4]),
    enb: pt([ENB[0], ENB[1], MAST_H + 4]),
    gnb: pt([GNB[0], GNB[1], MAST_H + 4]),
    phones: [...pt([PHONES[2][0], PHONES[2][1] + 4, 0]), "b"],
    bcast: pt([TOWER[0] + 10, TOWER[1] - 10, TOWER_H * 0.62]),
  },
};
const posterOf = (s) => {
  s = s.replace(/class="ar-led" /g, 'class="ar-led" data-on="" ').replace(/class="ar-screen" /g, 'class="ar-screen" data-on="" ');
  for (const [i, r] of [[0, 50], [1, 95]]) s = s.replace(new RegExp(`(data-ripple="${i}" cx="[^"]*" cy="[^"]*") rx="0" ry="0"`), `$1 rx="${(r * KK).toFixed(1)}" ry="${(r * KK * sinE).toFixed(1)}" style="opacity:.5"`);
  return s;
};
writeScene(HERE, { P, svg, data: DATA, sceneCss: SCENE_CSS, poster: posterOf });
console.log("area-telco: wrote art.js, poster.svg", JSON.stringify({ scale: P.scale.toFixed(3), bytes: svg.length }));
