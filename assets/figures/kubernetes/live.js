// Live behaviour of the Kubernetes model: crates (pods) drop, scale, reschedule off a failed node,
// a Helm release lands as a group, Git changes travel down the Flux line, and the gauge reads the nodes.
// Writes attributes on refs only; crates are re-parented into per-tray layers in depth order when that changes.
import { P, DATA, SVG } from "./art.js";
import { CHAPTERS, PARTS, COPY } from "./content.js";
import { smooth, lerp, f1 } from "../agentic/engine.js";

const PERIOD = [7.5, 11, 8, 9, 6];
const BASE = [0, 4, 8]; // one crate per tray
const drop = (t, at) => ({ a: smooth(at, at + 0.3, t), dz: 24 * (1 - smooth(at, at + 0.55, t)) * (1 - smooth(at, at + 0.55, t)) });
const out = (t, at) => 1 - smooth(at, at + 0.5, t);

// What each chapter shows at time t (seconds into its loop) and age (seconds since the chapter began).
function scene(ch, t, age, calm) {
  const c = [];
  const put = (id, slot, a = 1, dz = 0, fly = null) => c.push({ id, slot, a, dz, fly });
  const fadeIn = calm ? 1 : smooth(0, 0.4, age);
  const s = { down: -1, beacon: 0, helm: 0, row: null, spark: -1, dial: 0, sync: 0, metrics: 0, pulse: 0 };
  if (ch === 0) {
    if (calm) BASE.forEach((slot, i) => put(i, slot));
    else BASE.forEach((slot, i) => { const d = drop(t, 0.5 + i * 0.7); put(i, slot, d.a * out(t, 6.6), d.dz); s.beacon = Math.max(s.beacon, smooth(0.4 + i * 0.7, 0.5 + i * 0.7, t) * out(t, 0.9 + i * 0.7)); });
  } else if (ch === 1) {
    const end = calm ? 1 : out(t, 10.2);
    if (calm) {
      [0, 4, 2, 1, 5, 6].forEach((slot, i) => put(i, slot));
      s.down = 2;
    } else {
      BASE.forEach((slot, i) => { const d = drop(t, 0.1 + i * 0.15); if (i < 2) put(i, slot, d.a * end, d.dz); });
      [1, 5].forEach((slot, i) => { const d = drop(t, 1.2 + i * 0.4); put(3 + i, slot, d.a * end, d.dz); });
      // crates of tray 2 (slots 8 and 9) fly to the free slots 2 and 6
      const d8 = drop(t, 0.4), d9 = drop(t, 2.0);
      const u8 = smooth(4.4, 5.6, t), u9 = smooth(4.8, 6.0, t);
      put(2, u8 >= 1 ? 2 : 8, d8.a * end, d8.dz, u8 > 0 && u8 < 1 ? { from: 8, to: 2, u: u8 } : null);
      put(5, u9 >= 1 ? 6 : 9, d9.a * end, d9.dz, u9 > 0 && u9 < 1 ? { from: 9, to: 6, u: u9 } : null);
      s.down = t > 3.8 && t < 7.5 ? 2 : -1;
      s.beacon = smooth(4.1, 4.3, t) * out(t, 5.4);
    }
  } else if (ch === 2) {
    BASE.forEach((slot, i) => put(i, slot, fadeIn));
    if (calm) { [1, 5, 9].forEach((slot, i) => put(12 + i, slot)); s.helm = 1; }
    else {
      s.helm = smooth(0.5, 0.9, t) * out(t, 2.6);
      [1, 5, 9].forEach((slot, i) => { const d = drop(t, 1.4 + i * 0.12); put(12 + i, slot, d.a * out(t, 7.2), d.dz); });
      s.beacon = smooth(1.2, 1.4, t) * out(t, 2.2);
    }
  } else if (ch === 3) {
    BASE.forEach((slot, i) => put(i, slot, fadeIn));
    if (calm) { [1, 5].forEach((slot, i) => put(3 + i, slot)); s.row = 1; s.sync = 1; }
    else {
      s.row = smooth(0.6, 1.2, t);
      s.spark = t > 1.2 && t < 2.7 ? smooth(1.2, 2.6, t) : -1;
      s.dial = smooth(1.2, 2.6, t);
      s.sync = smooth(1.1, 1.3, t) * out(t, 2.6);
      s.beacon = smooth(2.5, 2.7, t) * out(t, 3.4);
      [1, 5].forEach((slot, i) => { const d = drop(t, 3.0 + i * 0.3); put(3 + i, slot, d.a * out(t, 8.2), d.dz); });
    }
  } else {
    [0, 1, 4, 5, 8, 9].forEach((slot, i) => put(i, slot, fadeIn));
    s.metrics = fadeIn;
    s.pulse = 1;
  }
  return { crates: c, ...s };
}

function live(svg, st, { write }) {
  const $ = (q) => svg.querySelector(q);
  const $$ = (q) => [...svg.querySelectorAll(q)];
  const store = $("[data-store]");
  const layers = [0, 1, 2].map((i) => $(`[data-layer="${i}"]`));
  const fly = $('[data-layer="fly"]');
  const crates = $$("[data-crate]");
  const nodes = $$("[data-node]"), lamps = $$("[data-node-lamp]");
  const beacon = $("[data-beacon]"), leds = $$("[data-cp-led]");
  const cur = { plane: $('[data-hit="plane"]'), nodes: $$("[data-node]"), helm: $("[data-helm]"), ledger: $("[data-ledger]"), flux: $("[data-flux]"), gauge: $("[data-gauge]") };
  const rows = $$("[data-row]");
  const flowLine = $("[data-flow-line]"), spark = $("[data-spark]");
  const fluxHand = $("[data-flux-hand]"), needle = $("[data-needle]");
  const metric = $$("[data-metric]");
  const { slots, slotDepth, z1, flux, fluxDial, gaugeDial } = DATA;
  rows.forEach((r) => { const p = r.querySelector("path"); p.setAttribute("pathLength", "1"); p.style.strokeDasharray = "1 1"; });
  const st2 = { age: 0, key: "", cycle: 0, last: new Map(), ghosts: new Map(), dialTurn: 0 };

  const seg = [0];
  for (let i = 1; i < flux.length; i++) seg.push(seg[i - 1] + Math.hypot(flux[i][0] - flux[i - 1][0], flux[i][1] - flux[i - 1][1]));
  const along = (u) => {
    const L = u * seg[seg.length - 1];
    let i = 1;
    while (i < seg.length - 1 && seg[i] < L) i++;
    const t = (L - seg[i - 1]) / (seg[i] - seg[i - 1] || 1);
    return [lerp(flux[i - 1][0], flux[i][0], t), lerp(flux[i - 1][1], flux[i][1], t)];
  };
  // a hand on a face-up dial: angle 0 points to -y, clockwise from above (kit convention)
  const hand = (d, ang, r0, r1) => {
    const p = (r) => [d.c[0] + Math.sin(ang) * r * d.u[0] - Math.cos(ang) * r * d.v[0], d.c[1] + Math.sin(ang) * r * d.u[1] - Math.cos(ang) * r * d.v[1]];
    const a = p(r0), b = p(r1);
    return `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`;
  };
  const posOf = (c) => {
    if (c.fly) {
      const a = slots[c.fly.from], b = slots[c.fly.to], u = c.fly.u;
      const lift = Math.sin(Math.PI * u) * 34;
      return [lerp(a[0], b[0], u) + z1[0] * lift, lerp(a[1], b[1], u) + z1[1] * lift];
    }
    return [slots[c.slot][0] + z1[0] * c.dz, slots[c.slot][1] + z1[1] * c.dz];
  };

  function place(list) {
    // crates that left the scene fade out where they were
    const seen = new Set(list.map((c) => c.id));
    for (const [id, last] of st2.last) if (!seen.has(id) && last.a > 0.01 && !st2.ghosts.has(id)) st2.ghosts.set(id, { ...last, at: st2.age });
    const shown = [];
    for (const c of list) { st2.ghosts.delete(c.id); if (c.a > 0.003) shown.push(c); }
    for (const [id, g] of st2.ghosts) {
      const a = g.a * (1 - smooth(g.at, g.at + 0.35, st2.age));
      if (a <= 0.003) { st2.ghosts.delete(id); continue; }
      shown.push({ ...g, id, a });
    }
    st2.last = new Map(list.map((c) => [c.id, c]));
    const key = shown.map((c) => `${c.id}:${c.fly ? "f" : Math.floor(c.slot / 4)}`).sort().join(",");
    if (key !== st2.key) {
      st2.key = key;
      const on = new Set(shown.map((c) => c.id));
      crates.forEach((el, id) => { if (!on.has(id) && el.parentNode !== store) store.append(el); });
      const byLayer = [[], [], [], []];
      for (const c of shown) byLayer[c.fly ? 3 : Math.floor(c.slot / 4)].push(c);
      byLayer.forEach((group, li) => {
        const host = li === 3 ? fly : layers[li];
        group.sort((a, b) => slotDepth[a.slot] - slotDepth[b.slot]).forEach((c) => host.append(crates[c.id]));
      });
    }
    for (const c of shown) {
      const el = crates[c.id];
      const v = posOf(c);
      write(el, "transform", `translate(${f1(v[0])} ${f1(v[1])})`);
      write(el, "opacity", c.a >= 0.999 ? "1" : c.a.toFixed(3));
    }
  }

  function rowsAt(n, writing) {
    rows.forEach((r, i) => {
      write(r, "opacity", i < n || (writing !== null && i === n) ? "1" : "0");
      r.querySelector("path").style.strokeDashoffset = (i < n ? 0 : i === n && writing !== null ? 1 - writing : 1).toFixed(3);
    });
  }

  return {
    enter(ch, calm) {
      st2.age = 0; st2.cycle = 0;
      if (calm) st2.ghosts.clear();
    },
    frame(dt, calm) {
      const ch = st.ch;
      st2.age += dt;
      if (!calm && st.t >= PERIOD[ch]) { st.t -= PERIOD[ch]; st2.cycle++; }
      const t = calm ? 0 : st.t;
      const S = scene(ch, t, st2.age, calm);
      place(S.crates);
      nodes.forEach((n, i) => write(n, "data-down", S.down === i ? "" : null));
      lamps.forEach((l, i) => write(l, "opacity", S.down === i ? "1" : S.pulse ? (0.55 + 0.45 * Math.max(0, Math.sin(st.clock * 3 - i * 1.2))).toFixed(3) : "1"));
      write(beacon, "data-lit", S.beacon > 0.5 || (calm && ch === 0) ? "" : null);
      leds.forEach((l, i) => write(l, "opacity", calm ? "1" : (0.3 + 0.7 * (Math.sin(st.clock * 2.2 - i * 2.1) > 0.2 ? 1 : 0)).toFixed(2)));
      write(cur.plane, "data-cur", ch === 0 ? "" : null);
      cur.nodes.forEach((n) => write(n, "data-cur", ch === 1 ? "" : null));
      write(cur.helm, "data-cur", ch === 2 ? "" : null);
      write(cur.ledger, "data-cur", ch === 3 ? "" : null);
      write(cur.flux, "data-cur", ch === 3 ? "" : null);
      write(cur.gauge, "data-cur", ch === 4 ? "" : null);
      // Git ledger: one new row per sync, a full page starts over
      if (ch === 3) {
        const R = DATA.rows;
        if (calm) rowsAt(2, null);
        else {
          const done = st2.cycle % R;
          if (t < 1.2 && S.row > 0) rowsAt(done, S.row);
          else rowsAt(done + (t >= 1.2 ? 1 : 0), null);
        }
      } else rowsAt(0, null);
      // Flux: spark down the line, the sync dial turns once per change
      write(flowLine, "opacity", (calm ? 0 : S.sync).toFixed(3));
      const sp = S.spark >= 0 ? along(S.spark) : flux[0];
      write(spark, "cx", f1(sp[0])); write(spark, "cy", f1(sp[1]));
      write(spark, "opacity", S.spark >= 0 ? (smooth(0, 0.08, S.spark) * (1 - smooth(0.92, 1, S.spark))).toFixed(3) : "0");
      write(fluxHand, "d", hand(fluxDial, (st2.cycle + S.dial) * Math.PI * 2 * (ch === 3 ? 1 : 0), -1.4, 4.6));
      // gauge: a calm reading that breathes with the nodes in chapter 5
      const g = ch === 4 && !calm ? 0.1 + 0.18 * Math.sin(st.clock * 0.9) + 0.07 * Math.sin(st.clock * 2.3 + 1) : ch === 4 ? 0.12 : -0.45;
      write(needle, "d", hand(gaugeDial, g * Math.PI, -1.6, 5.8));
      metric.forEach((m, i) => write(m, "opacity", (calm ? 0 : S.metrics * (0.6 + 0.4 * Math.max(0, Math.sin(st.clock * 1.6 - i)))).toFixed(3)));
      return true;
    },
    part() {},
  };
}

export default {
  svg: SVG, P, chapters: CHAPTERS, parts: PARTS, copy: COPY, live,
  dwell: (i) => PERIOD[i] * 1000,
};
