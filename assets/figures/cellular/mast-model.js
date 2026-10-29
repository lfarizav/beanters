// Shared model of the cell-site figure: world layout, the generation dial and the 5G beam.
// Used by build.mjs (static art, poster) and by mast-live.js (per-frame paths).
// World units are about 1 px of a scale model; x and y lie on the plinth, z points up.
import { iso, lineOnTop, pathOf } from "./iso-kit.mjs";

export const W = 520;
export const H = 600;
export const DEG = Math.PI / 180;
export const GENS = ["2G", "3G", "4G", "5G", "6G"];

export const PLATE = { x: -80, y: -80, w: 170, d: 160, r: 8 };
export const MAST = [-15, -15];
export const SECTORS = [30, 150, 270]; // sector azimuths on the floor, degrees; 30 faces the viewer
export const R_PIPE = 30; // mounting pipes on the head frame
export const PIPE_R = 2;
export const PLAT_Z = 140; // top of the head-frame platform
export const CAB = { x: 24, y: -64, w: 30, d: 24, r: 2 }; // baseband cabinet
export const CAB_Z = 3;
export const CAB_TOP = 44;
export const GLAND = [30, -47];
export const PHONE = { x: 12, y: 44 }; // phone stand origin
export const DIAL = [62, 30];
export const DIAL_R = 15;
export const DIAL_TOP = 8.5;

// The front sector's active antenna (5G AAU), the beam's apex.
export const AAU = { w: 21, d: 9, z0: 152, z1: 198 };
export const unit = (deg) => [Math.cos(deg * DEG), Math.sin(deg * DEG)];
export const centreOf = (deg, d) => {
  const [ux, uy] = unit(deg);
  const r = R_PIPE + PIPE_R + 1.4 + d / 2;
  return [MAST[0] + ux * r, MAST[1] + uy * r];
};
export const phoneScreen = () => [PHONE.x + 7, PHONE.y + 4.3 + 0.05, 8.8];

// Dial: five detents, 2G on the left, 6G on the right, the arc facing the viewer (kit convention: angle 0 points to -y, clockwise from above).
export const dialAngle = (g) => (195 - g * 30) * DEG;
export function pointerPath(g, P) {
  const a = dialAngle(g);
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const [cx, cy] = DIAL;
  return lineOnTop([cx - dx * 1.8, cy - dy * 1.8], [cx + dx * 6.4, cy + dy * 6.4], DIAL_TOP + 0.1, P);
}

// The beam: a lobe from the face of the front AAU toward the phone, turned about the vertical by theta.
export function beamPaths(P, theta = 0) {
  const [cx, cy] = centreOf(SECTORS[0], AAU.d);
  const [ux, uy] = unit(SECTORS[0]);
  const F = [cx + ux * (AAU.d / 2 + 0.1), cy + uy * (AAU.d / 2 + 0.1), (AAU.z0 + AAU.z1) / 2];
  const T0 = phoneScreen();
  let vx = T0[0] - F[0];
  let vy = T0[1] - F[1];
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  [vx, vy] = [vx * c - vy * s, vx * s + vy * c];
  const T = [F[0] + vx, F[1] + vy, T0[2]];
  const L = Math.hypot(T[0] - F[0], T[1] - F[1], T[2] - F[2]);
  const dir = [(T[0] - F[0]) / L, (T[1] - F[1]) / L, (T[2] - F[2]) / L];
  const h = Math.hypot(dir[0], dir[1]) || 1;
  const lat = [-dir[1] / h, dir[0] / h, 0];
  const wMax = 0.075 * L;
  const left = [];
  const right = [];
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const along = L * 1.06 * t;
    const w = wMax * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, 1.5))), 0.75);
    const p = [F[0] + dir[0] * along, F[1] + dir[1] * along, F[2] + dir[2] * along];
    left.push(iso([p[0] + lat[0] * w, p[1] + lat[1] * w, p[2]], P));
    right.push(iso([p[0] - lat[0] * w, p[1] - lat[1] * w, p[2]], P));
  }
  const lobe = pathOf([...left, ...right.reverse()], true);
  const arc = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    arc.push(iso([F[0] + (T[0] - F[0]) * t, F[1] + (T[1] - F[1]) * t, F[2] + (T[2] - F[2]) * t + Math.sin(Math.PI * t) * 2.5], P));
  }
  return { lobe, arc: pathOf(arc), apex: iso(F, P), tip: iso(T, P) };
}
