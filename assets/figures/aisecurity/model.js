// Shared model of the AI-security figure: a scale model of a 5G core site on a plinth.
// A signal router feeds a conveyor (the pipeline); every packet passes an inspection gate;
// clean packets reach AI racks inside a sandbox cage; a hostile one is pushed into quarantine;
// a risk light stays green. Used by build.mjs (static art) and live.js (per-frame motion).
// World units: x and y on the plinth, z up. No numbers here are claims about real equipment.

export const W = 640;
export const H = 480;
export const AZIMUTH = 57;

export const PLATE = { x: -120, y: -56, w: 236, d: 112, r: 8 };
export const FOOT = 17;
export const ROUTER = { x: -110, y: -30, w: 34, d: 44, r: 2, h: 52 };
export const BELT = { x0: -76, x1: 48, y: 0, half: 6, z: 13 }; // belt top at z
export const GATE_X = -24;
export const PUSH_X = -6;
export const BIN = { x: -16, y: 24, w: 20, d: 22, r: 1, h: 11 };
export const CAGE = { x: 38, y: -30, w: 74, d: 60, r: 2, h: 66 };
export const RACKS = [{ x: 46, y: -20, w: 24, d: 34, r: 1, h: 58 }, { x: 78, y: -20, w: 24, d: 34, r: 1, h: 58 }];
export const LAMP = { x: 16, y: -40 };
export const PACKET = { w: 7, d: 7, h: 6 };

export const SPEED = 15; // belt speed, units per second
export const GAP = 26; // spacing between packets on the belt
export const START = BELT.x0 + 4; // where a packet leaves the router port (packet centre)
export const END = RACKS[0].x + 6; // where it has gone into the first rack
export const LENGTH = END - START;

// Chapters are the program's six modules (courses/index.html, cm91 to cm96); each lights one part.
export const PART_OF = ["racks", "belt", "gate", "bin", "router", "lamp"];
export const PARTS = ["router", "belt", "gate", "bin", "racks", "lamp"];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// A clean packet at distance s along the belt: world offset from the packet's drawn rest place
// (centred on x = 0, y = 0, sitting on the belt top), and its opacity.
export function cleanAt(s) {
  const x = START + s;
  const op = smooth(0, 5, s) * (1 - smooth(LENGTH - 9, LENGTH - 2, s));
  return { x, y: 0, z: 0, op };
}

// The hostile packet: along the belt to the pusher, pushed off sideways, down the chute, into the bin.
// t is seconds since it left the router. Returns the offset, opacity and phase.
export const PUSH_AT = (PUSH_X - START) / SPEED; // arrives in front of the pusher
export const PUSH_T = 0.55;
export const SLIDE_T = 0.7;
export const DROP_T = 0.35;
export const CHUTE = { y0: BELT.half + 1, y1: BIN.y + 4, z0: 0, z1: -1.8 };
export const REST_IN_BIN = { x: PUSH_X, y: BIN.y + BIN.d / 2 + 1, z: -BELT.z + 1.5 };
export function hostileAt(t) {
  if (t < PUSH_AT) {
    const s = t * SPEED;
    return { x: START + s, y: 0, z: 0, op: smooth(0, 5, s), phase: "belt" };
  }
  let u = t - PUSH_AT;
  if (u < PUSH_T) {
    const k = smooth(0, 1, u / PUSH_T);
    return { x: PUSH_X, y: k * CHUTE.y0, z: 0, op: 1, phase: "push" };
  }
  u -= PUSH_T;
  if (u < SLIDE_T) {
    const k = u / SLIDE_T;
    const e = k * k; // it gathers speed down the slope
    return { x: PUSH_X, y: CHUTE.y0 + (CHUTE.y1 - CHUTE.y0) * e, z: CHUTE.z0 + (CHUTE.z1 - CHUTE.z0) * e, op: 1, phase: "chute" };
  }
  u -= SLIDE_T;
  const k = Math.min(1, u / DROP_T);
  const e = k * k;
  return { x: PUSH_X, y: CHUTE.y1 + (REST_IN_BIN.y - CHUTE.y1) * smooth(0, 1, k), z: CHUTE.z1 + (REST_IN_BIN.z - CHUTE.z1) * e, op: 1, phase: k >= 1 ? "bin" : "drop" };
}
export const HOSTILE_DONE = PUSH_AT + PUSH_T + SLIDE_T + DROP_T;

// The pusher plate's front face (world y) for the hostile packet's clock: it reaches the packet,
// pushes it off the belt, then pulls back behind the belt edge.
export const PLATE_REST = -BELT.half - 2;
export function pusherAt(t) {
  const back = -PACKET.d / 2; // the packet's back face when it sits on the belt
  if (t < PUSH_AT - 0.3) return PLATE_REST;
  if (t < PUSH_AT) return PLATE_REST + (back - PLATE_REST) * smooth(0, 1, (t - (PUSH_AT - 0.3)) / 0.3);
  const u = t - PUSH_AT;
  if (u < PUSH_T) return back + smooth(0, 1, u / PUSH_T) * CHUTE.y0;
  return back + CHUTE.y0 + (PLATE_REST - back - CHUTE.y0) * smooth(0, 1, (u - PUSH_T) / 0.6);
}
