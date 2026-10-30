// Shared build-time parts for the three "areas of action" scenes on the home page (area-cloud, area-ai,
// area-telco). Node only. Geometry comes from the Anatomy kit already in the repo (../cellular/iso-kit.mjs,
// MIT, (c) 2026 Ryan) through ../agentic/bench.mjs, so the cards share the look of the course scenes.
// The cards are small (about 300 to 400 px wide), so parts are few, big and bold; words live in HTML pins.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, kitFor, writeScene } from "../agentic/bench.mjs";

export { k, writeScene };
const HERE = dirname(fileURLToPath(import.meta.url));
export const W = 400, H = 300;
export const SCENE_CSS = readFileSync(join(HERE, "scene.css"), "utf8");
export const r2 = (v) => v.map((n) => +n.toFixed(2));

export function areaKit(extremes, { pad = 10, azimuth = 45, elevation = 32 } = {}) {
  const P = k.fitProjection(extremes, W, H, { pad, azimuth, elevation });
  const K = kitFor(P);
  const { S, L, D, at, poly, slab, cyl, plan } = K;
  const KK = P.scale * Math.sqrt(1.6);
  const sinE = Math.sin(P.elevation * Math.PI / 180);
  const cosE = Math.cos(P.elevation * Math.PI / 180);
  const rectY = (yF, x0, x1, z0, z1) => poly([[x0, yF, z0], [x1, yF, z0], [x1, yF, z1], [x0, yF, z1]], true);
  const rectX = (xF, y0, y1, z0, z1) => poly([[xF, y0, z0], [xF, y1, z0], [xF, y1, z1], [xF, y0, z1]], true);
  const textY = (x, yF, z, text, size = 4, tone = "hi") => `<g data-ink-skip="">${k.faceTextSvg(K.faceY(x, yF + 0.06, z), text, { size, tone, anchor: "middle" })}</g>`;
  const textX = (xF, y, z, text, size = 4, tone = "hi") => `<g data-ink-skip="">${k.faceTextSvg(K.faceX(xF + 0.06, y, z), text, { size, tone, anchor: "middle" })}</g>`;
  const halo = (pl, blur = 4) => `<path class="iso-halo" d="${k.haloOf(pl, 0, 1, P)}" style="filter:blur(${blur}px)"/>`;
  const pt = (p) => r2(at(p));

  // the base every scene stands on: a thick plate with a groove and corner screws (no feet: cards are short)
  function base(PLATE) {
    const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -8, 8, P)}"/>`];
    out.push(S(slab(PLATE, -7, 7, 8, 1.2), { tone: "mid" }));
    out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
    const screws = k.corners(PLATE, 9);
    out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }));
    out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
    return out.join("");
  }
  // a box with a plinth, seams and corner screws on the front face
  function box(pl, h, { tone = "hi", foot = 2, seams = [] } = {}) {
    const out = [halo(pl)];
    if (foot) out.push(S(slab(k.insetPlan(pl, -1.4), 0, foot, 4, 0.4), { tone: "lo" }));
    out.push(S(slab(pl, foot, h - foot, 4, 0.6), { tone, crease: "lo", inner: seams.length ? L(seams.map((z) => k.sideSeam(pl, z, P, 4)).join(""), { tone: "faint" }) : "" }));
    return out.join("");
  }
  // a status lamp on a face (live code turns it on)
  const led = (p, attr, r = 1) => { const [x, y] = at(p); return `<circle class="ar-led" ${attr} cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`; };
  // horizontal rings (radio waves or ripples) the live code grows: n ellipses at one centre
  const rings = (name, p, n, cls = "ar-ring") => { const [x, y] = at(p); return Array.from({ length: n }, (_, i) => `<ellipse class="${cls}" data-${name}="${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="0" ry="0"/>`).join(""); };
  // a mast with three sector panels near the top and a small radio cabinet at its foot
  function mast(x, y, h, { r = 2.4, panels = true, cab = true, label = "" } = {}) {
    const out = [halo(plan(x, y, 14, 14, 3))];
    out.push(S(slab(plan(x, y, 14, 14, 2), 0, 1.6, 3, 0.4), { tone: "lo" }));
    if (cab) {
      const cp = plan(x + 10, y + 4, 8, 10, 0.6);
      out.push(S(slab(cp, 0, 12, 3, 0.4), { tone: "hi", crease: "lo", inner: L(k.sideSeam(cp, 9, P, 3), { tone: "faint" }) }));
      if (label) out.push(textX(cp.x + cp.w, y + 4, 5.4, label, 3.6));
      out.push(led([cp.x + cp.w + 0.1, y + 4, 9.8 - 0], `data-led="cab"`, 0.8));
    }
    out.push(S(cyl(x, y, r, 1.6, h - 1.6, 24), { tone: "mid", crease: "none" }));
    out.push(L([0.3, 0.55].map((f) => k.ring(x, y, r + 0.2, h * f, P, 24)).join(""), { tone: "lo" }));
    if (panels) {
      out.push(S(cyl(x, y, r + 3.6, h - 18, 1.2, 28, 0.3), { tone: "mid" }));
      const sector = (deg) => {
        const a = deg * Math.PI / 180, R = r + 2.6, cx = x + Math.cos(a) * R, cy = y + Math.sin(a) * R;
        const ux = Math.cos(a), uy = Math.sin(a), tx = -uy, ty = ux, w = 5, d = 1.8;
        const ring = [[d / 2, -w / 2], [d / 2, w / 2], [-d / 2, w / 2], [-d / 2, -w / 2]].map(([p, q]) => [cx + ux * p + tx * q, cy + uy * p + ty * q]);
        return { d: K.depth([cx, cy]), s: S(k.extrude(ring, h - 16.8, 13, P, { bevel: 0.3 }), { tone: "hi", crease: "lo" }) };
      };
      const secs = [210, 330, 90].map(sector).sort((a, b) => a.d - b.d);
      const pole = K.depth([x, y]);
      for (const s of secs) if (s.d <= pole) out.push(s.s);
      out.push(S(cyl(x, y, r * 0.8, h - 18, 18, 20), { tone: "mid", crease: "none" }));
      for (const s of secs) if (s.d > pole) out.push(s.s);
    }
    out.push(S(cyl(x, y, r * 0.9, h, 1.4, 20, 0.3), { tone: "hi", crease: "lo" }));
    return out.join("");
  }
  // a phone standing on a little stand, screen facing +y (live code lights it)
  function phone(x, y, id) {
    const out = [S(slab(plan(x, y + 1, 9, 6, 1), 0, 1.4, 3, 0.3), { tone: "lo" })];
    const pl = plan(x, y, 5.6, 1.4, 0.4);
    out.push(S(slab(pl, 1.4, 10, 3, 0.2), { tone: "hi", crease: "lo" }));
    const yF = pl.y + pl.d + 0.05;
    out.push(`<path class="ar-screen" data-phone="${id}" d="${rectY(yF, x - 2.1, x + 2.1, 3, 10.4)}"/>`);
    out.push(L(rectY(yF, x - 2.1, x + 2.1, 3, 10.4), { tone: "mid" }));
    return out.join("");
  }
  // a rack of server units: front face (+y) carries the units, a LED each, and a label above
  function rack(pl, h, { units = 4, label = "", ledAttr = "data-led" } = {}) {
    const out = [box(pl, h, { seams: [h - 4] })];
    const yF = pl.y + pl.d + 0.05, xF = pl.x + pl.w + 0.05;
    const uh = (h - 12) / units;
    for (let i = 0; i < units; i++) {
      const z0 = 4 + i * uh;
      out.push(`<path class="ar-unit" d="${rectY(yF, pl.x + 2.5, pl.x + pl.w - 2.5, z0 + 0.6, z0 + uh - 0.6)}"/>`);
      out.push(L(rectY(yF, pl.x + 2.5, pl.x + pl.w - 2.5, z0 + 0.6, z0 + uh - 0.6), { tone: "mid" }));
      out.push(L([0, 1, 2].map((j) => k.segment([pl.x + 5 + j * 2, yF, z0 + 1.6], [pl.x + 5 + j * 2, yF, z0 + uh - 1.6], P)).join(""), { tone: "faint" }));
      out.push(led([pl.x + pl.w - 5, yF, z0 + uh / 2], `${ledAttr}="${i}"`, 0.9));
    }
    out.push(L([0, 1, 2, 3].map((j) => rectX(xF, pl.y + 4, pl.y + pl.d - 4, 8 + j * 4, 9.4 + j * 4)).join(""), { tone: "lo" }));
    if (label) out.push(textY(pl.x + pl.w / 2, yF, h - 2.6, label, 3.8));
    return out.join("");
  }
  // a floor wire through world points, with a flow line on top the live code fades in
  function wire(pts, attr, { tone = "mid", flowCls = "ar-flow" } = {}) {
    const p = pts.map(at);
    return k.wireSvg(p[0], p[p.length - 1], { via: p.slice(1, -1), tone, size: 0.9 }) + `<path class="iso-line ${flowCls}" data-ink-skip="" ${attr} d="${k.pathOf(p)}"/>`;
  }
  return { P, K, ...K, KK, sinE, cosE, rectY, rectX, textY, textX, halo, pt, base, box, led, rings, mast, phone, rack, wire };
}
