// Shared model of the risk-management figure: a risk register built as a bench instrument.
// A 5 x 5 heat-map board (likelihood x impact) sits on a register cabinet; each risk is a token;
// the frameworks and regulations the program names are dial gauges on a bridge behind the board;
// a control lever slides tokens toward the green zone. Used by build.mjs and live.js.
// Token positions and gauge readings are illustrative, not measurements.

export const W = 640;
export const H = 520;
export const AZIMUTH = 50;

export const PLATE = { x: -74, y: -82, w: 156, d: 154, r: 8 };
export const FOOT = 17;
export const CAB = { x: -58, y: -44, w: 104, d: 104, r: 2, h: 18 };
export const FRAME = { x: -60, y: -46, w: 108, d: 108, r: 2.5, z: 18, h: 3 };
export const TOP = FRAME.z + FRAME.h; // board surface
export const GRID = { x: -53, y: -39, n: 5, cell: 19 }; // impact along +x, likelihood along -y
export const BRIDGE = { x: -64, y: -74, w: 128, d: 22, r: 2, h: 38 };
export const GAUGE_R = 8;
export const GAUGE_Y = BRIDGE.y + BRIDGE.d / 2;
export const GAUGE_XS = [-48, -24, 0, 24, 48];
export const GAUGE_TOP = BRIDGE.h + 6;
export const LEVER = { x: 56, y: -24, w: 14, d: 74, r: 2, h: 7, y0: -14, y1: 38 };
export const DRAWER = { x: -38, w: 60, z0: 3, z1: 15, out: 7 };

// Frameworks and regulations named in the program (courses/index.html cm104, cm105, cm108).
export const GAUGES = ["ISO 27005", "NIST RMF", "3GPP", "EU AI ACT", "GDPR"];

// Risks named in the program (cm104, cm106, cm107, cm109, cm110); [likelihood, impact], 1 to 5.
// from: before controls, to: after controls. Both are illustrative.
export const TOKENS = [
  { key: "drift", from: [4, 4], to: [2, 3], gauges: [0, 1, 3] },
  { key: "hallucination", from: [5, 3], to: [2, 2], gauges: [0, 1, 3] },
  { key: "bias", from: [3, 4], to: [1, 3], gauges: [0, 1, 3] },
  { key: "failure", from: [4, 5], to: [2, 4], gauges: [0, 1, 2] },
  { key: "availability", from: [3, 5], to: [1, 4], gauges: [0, 1, 2] },
  { key: "data", from: [2, 4], to: [1, 2], gauges: [0, 1, 4] },
  { key: "continuity", from: [3, 3], to: [1, 1], gauges: [0, 1] },
];

// Chapters are the program's six modules (cm105 to cm110): the part each lights, and which tokens and gauges.
export const CHAPTER_LIGHTS = [
  { part: "gauges", tokens: [], gauges: [0, 1] },
  { part: "tokens", tokens: [0, 1, 2], gauges: [3] },
  { part: "tokens", tokens: [4], gauges: [2] },
  { part: "gauges", tokens: [5], gauges: [3, 4] },
  { part: "drawer", tokens: [3], gauges: [] },
  { part: "lever", tokens: [6], gauges: [] },
];
export const PARTS = ["board", "tokens", "gauges", "lever", "drawer"];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// Centre of a cell, world units. Likelihood rises toward the back (-y), impact toward +x.
export const cellAt = (l, i) => [GRID.x + (i - 0.5) * GRID.cell, GRID.y + (GRID.n - l + 0.5) * GRID.cell];
export const zoneOf = (l, i) => { const s = l * i; return s <= 4 ? 0 : s <= 9 ? 1 : s <= 14 ? 2 : 3; };

// Token n at lever value t (0: no controls, 1: all controls): world position and live score.
// Tokens leave one after another, so the board reads as a sequence.
export function tokenAt(n, t) {
  const T = TOKENS[n];
  const k = smooth(0, 1, clamp(t * 2.2 - n * 0.2, 0, 1));
  const a = cellAt(...T.from);
  const b = cellAt(...T.to);
  const l = T.from[0] + (T.to[0] - T.from[0]) * k;
  const i = T.from[1] + (T.to[1] - T.from[1]) * k;
  return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, k, l, i, score: l * i };
}
// A gauge reads the mean live score of its tokens over 25, from 0 (low) to 1 (high).
export function gaugeAt(g, t) {
  const list = TOKENS.map((T, n) => (T.gauges.includes(g) ? tokenAt(n, t).score : null)).filter((v) => v !== null);
  return list.reduce((a, b) => a + b, 0) / list.length / 25;
}
// Needle angle on a face-up dial (kit convention: 0 points to -y, clockwise from above), radians.
export const needleAngle = (v) => ((-120 + 240 * clamp(v, 0, 1)) * Math.PI) / 180;
export const leverY = (t) => LEVER.y0 + (LEVER.y1 - LEVER.y0) * t;
