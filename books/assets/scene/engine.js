/* Living scene engine (WebGL). One engine, four books: the book's chapter-1 analogy is
   drawn on the right page in ink, the strokes lift into 3D ink objects, the objects fill
   with soft shading, and a lit object sends glowing arcs to the objects it feeds.
   Reuses the hero's open book, page curve and glow from ../hero/scene.js and the same
   pinned three.js (import map in index.html), so a visitor who saw the hero has it cached.
   Budget per book: about 20 draw calls at rest, 33 with the busiest object lit; under
   15k triangles. The loop runs only while something moves (setAnimationLoop(null) at rest). */
import * as THREE from "three";
import { buildOpenBook, surfaceY, ease, glowTexture, PAGE, LEFT } from "../hero/scene.js?v=20261029c";
import { PW, OBL, buildObject } from "./shapes.js?v=20261029c";

const S = (PAGE.x1 - PAGE.x0) / PW;               /* page unit -> world */
const wx = (u) => PAGE.x0 + u * S;
const wz = (w) => PAGE.z0 + w * S;
const NAVY = new THREE.Color(0x0d1b2a), TEAL = new THREE.Color(0x00708a), CYAN = new THREE.Color(0x00d9ff);
const PAPER = new THREE.Color(0xfbfaf7);
const PULSE_MS = 5200;

function mergeGeoms(list) {
  let n = 0;
  const flat = list.map((g) => { const f = g.index ? g.toNonIndexed() : g; n += f.attributes.position.count; return f; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  flat.forEach((f) => { pos.set(f.attributes.position.array, o * 3); nor.set(f.attributes.normal.array, o * 3); o += f.attributes.position.count; f.dispose(); });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  return g;
}

/* A solid as a three geometry in page units, posed like shapes.js poses its edges. */
function solidGeom(s) {
  const y0 = s.y0 || 0;
  let g;
  if (s.t === "box") { g = new THREE.BoxGeometry(s.w, s.h, s.d); g.translate(0, s.h / 2, 0); }
  else if (s.t === "cyl") { g = new THREE.CylinderGeometry(s.r2 == null ? s.r : s.r2, s.r, s.h, s.n || 20); g.translate(0, s.h / 2, 0); }
  else if (s.t === "dome") g = new THREE.SphereGeometry(s.r, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  else if (s.t === "ball") { g = new THREE.SphereGeometry(s.r, 16, 10); g.translate(0, s.r, 0); }
  else if (s.t === "roof") {
    const sh = new THREE.Shape([new THREE.Vector2(-s.w / 2, 0), new THREE.Vector2(s.w / 2, 0), new THREE.Vector2(0, s.h)]);
    g = new THREE.ExtrudeGeometry(sh, { depth: s.d, bevelEnabled: false }); g.translate(0, 0, -s.d / 2);
  }
  if (s.rx || s.ry || s.rz) {
    const h = s.t === "box" || s.t === "cyl" || s.t === "roof" ? (s.h || 0) / 2 : 0;
    g.translate(0, -h, 0);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler((s.rx || 0) * Math.PI / 180, (s.ry || 0) * Math.PI / 180, (s.rz || 0) * Math.PI / 180, "YXZ")));
    g.translate(0, h, 0);
  }
  g.translate(s.x, y0, s.z);
  /* page units -> world, following the paper's curve */
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const X = wx(p.getX(i));
    p.setXYZ(i, X, surfaceY(X) + p.getY(i) * S + 0.0004, wz(p.getZ(i)));
  }
  return g;
}

/* World position of a page point at lift t (0 = drawn flat on paper, 1 = standing). */
function lifted(p, t, out) {
  const X = wx(p[0]), e = ease(t);
  return out.set(X, surfaceY(X) + 0.0009 + p[1] * S * e, wz(p[2] - p[1] * OBL * (1 - e)));
}

export function createLiving(opts) {
  const { canvas, host, data, hue, hueLight, onPick, onHover, onFrame, safeRect } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 40);
  const target = new THREE.Vector3(0, 0.03, 0.04);
  const baseDir = new THREE.Vector3(0.05, 0.74, 0.86).normalize();
  const up = new THREE.Vector3(0, 1, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe6ee, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7);
  sun.position.set(-1.4, 3.0, 1.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: 0.5, far: 7 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.012; sun.shadow.radius = 5;
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.14 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const HUE = new THREE.Color(hue), HUEL = new THREE.Color(hueLight);
  const book = buildOpenBook(HUE.clone().multiplyScalar(0.82).getHex());
  scene.add(book.group);

  /* ---- Ink objects ---- */
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), va = new THREE.Vector3(), vb = new THREE.Vector3(), vs = new THREE.Vector3(), dir = new THREE.Vector3();
  const X1 = new THREE.Vector3(1, 0, 0);
  const n = data.objects.length;
  const FILL0 = PAPER.clone().lerp(HUEL, 0.24), FILLON = PAPER.clone().lerp(HUEL, 0.62);

  const objs = data.objects.map((o, i) => {
    const b = buildObject(o);
    const inkMat = new THREE.MeshStandardMaterial({ color: NAVY.clone(), roughness: 0.55, emissive: HUE.clone(), emissiveIntensity: 0 });
    const ink = new THREE.InstancedMesh(unit, inkMat, b.segs.length);
    ink.castShadow = true; ink.frustumCulled = false;
    const fillMat = new THREE.MeshStandardMaterial({ color: FILL0.clone(), roughness: 0.88, transparent: true, opacity: 0, emissive: HUEL.clone(), emissiveIntensity: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const fill = new THREE.Mesh(mergeGeoms(o.solids.map(solidGeom)), fillMat);
    fill.castShadow = true; fill.receiveShadow = true; fill.visible = false;
    book.group.add(fill); book.group.add(ink);
    const bb = b.bounds;
    const box = new THREE.Box3(new THREE.Vector3(wx(bb.x0) - 0.012, 0, wz(bb.z0) - 0.012), new THREE.Vector3(wx(bb.x1) + 0.012, surfaceY(wx(bb.x1)) + bb.h1 * S + 0.02, wz(bb.z1) + 0.012));
    const a = b.anchor, ax = wx(a[0]);
    return {
      i, segs: b.segs, ink, inkMat, fill, fillMat, box, bounds: bb,
      anchor: new THREE.Vector3(ax, surfaceY(ax) + a[1] * S + 0.012, wz(a[2])),
      w: 0, l: -1, f: -1, lit: 0, hov: 0,
      win: { w0: 0, w1: 0, l0: 0, l1: 0, f0: 0, f1: 0 }
    };
  });

  /* Intro timeline (seconds): ink writes on object by object, then lifts, then fills. */
  const WRITE = 2.0, step = WRITE / (n + 1.6);
  objs.forEach((O, i) => {
    O.win.w0 = i * step; O.win.w1 = O.win.w0 + step * 2.2;
    O.win.l0 = WRITE + 0.15 + i * 0.12; O.win.l1 = O.win.l0 + 0.95;
    O.win.f0 = O.win.l1 - 0.2; O.win.f1 = O.win.f0 + 0.75;
  });
  const INTRO_END = Math.max(...objs.map((O) => O.win.f1));

  function placeInk(O, w, l) {
    const segs = O.segs, N = segs.length, shown = w * N;
    const e = ease(l), thick = 0.0036 + 0.0014 * e, tall = 0.0007 + 0.0043 * e;
    let k = 0;
    for (; k < N; k++) {
      const r = Math.min(1, shown - k);
      if (r <= 0) break;
      lifted(segs[k][0], l, va); lifted(segs[k][1], l, vb);
      vb.lerpVectors(va, vb, r);
      dir.subVectors(vb, va);
      const len = dir.length();
      if (len < 1e-6) { m4.makeScale(0, 0, 0); O.ink.setMatrixAt(k, m4); continue; }
      q.setFromUnitVectors(X1, dir.divideScalar(len));
      m4.compose(vs.addVectors(va, vb).multiplyScalar(0.5), q, dir.set(len + thick * 0.9, tall, thick));
      O.ink.setMatrixAt(k, m4);
    }
    O.ink.count = k;
    O.ink.instanceMatrix.needsUpdate = true;
  }

  /* ---- Light: a glow pool under the lit object, and arcs to the objects it feeds ---- */
  const gtex = glowTexture();
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: gtex, color: HUEL, transparent: true, opacity: 0, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2; pool.renderOrder = 2; pool.visible = false; book.group.add(pool);

  const arcs = data.arcs.map(([a, b]) => {
    const A = objs[a].anchor, B = objs[b].anchor;
    const mid = A.clone().lerp(B, 0.5); mid.y = Math.max(A.y, B.y) + 0.07 + A.distanceTo(B) * 0.32;
    const curve = new THREE.QuadraticBezierCurve3(A.clone(), mid, B.clone());
    const SEG = 64, RAD = 6;
    const core = new THREE.Mesh(new THREE.TubeGeometry(curve, SEG, 0.0034, RAD, false), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.95 }));
    const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, SEG, 0.011, RAD, false), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.22, depthWrite: false }));
    const spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, color: CYAN, transparent: true, depthWrite: false, opacity: 0.95 }));
    spark.scale.set(0.07, 0.07, 1);
    [core, halo, spark].forEach((m) => { m.visible = false; book.group.add(m); });
    halo.renderOrder = 3; spark.renderOrder = 4;
    return { a, b, curve, core, halo, spark, full: SEG * RAD * 6, grow: 0, on: 0 };
  });

  /* ---- State ---- */
  const st = { sel: -1, hov: -1, still: !!opts.still, start: performance.now(), selAt: 0, px: 0, py: 0, sx: 0, sy: 0, done: false, dist: 4 };
  let w = 1, h = 1, running = false, frames = 0;

  const BOX = [];
  [-0.95, 0.95].forEach((x) => [0, 0.28].forEach((y) => [-0.62, 0.62].forEach((z) => BOX.push(new THREE.Vector3(x, y, z)))));
  function place(dist, ox, oy) {
    camera.position.copy(target).addScaledVector(baseDir, dist);
    camera.lookAt(target);
    camera.setViewOffset(w, h, ox, oy, w, h);
    camera.updateMatrixWorld();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    BOX.forEach((p) => {
      va.copy(p).project(camera);
      const sx = (va.x * 0.5 + 0.5) * w, sy = (-va.y * 0.5 + 0.5) * h;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    });
    return { x0, x1, y0, y1 };
  }
  function resize() {
    const r = host.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const safe = safeRect ? safeRect(w, h) : { left: 24, right: w - 24, top: 64, bottom: h - 110 };
    let dist = 6, ox = 0, oy = 0, b;
    for (let k = 0; k < 6; k++) {
      b = place(dist, ox, oy);
      dist *= Math.max(((b.x1 - b.x0) * 1.04) / (safe.right - safe.left), ((b.y1 - b.y0) * 1.04) / (safe.bottom - safe.top));
      b = place(dist, ox, oy);
      ox += (b.x0 + b.x1) / 2 - (safe.left + safe.right) / 2;
      oy += (b.y0 + b.y1) / 2 - (safe.top + safe.bottom) / 2;
    }
    place(dist, ox, oy);
    st.dist = dist;
    renderer.shadowMap.needsUpdate = true;
    kick();
  }

  function phase(now) {
    if (st.still || st.done) return INTRO_END + 1;
    return (now - st.start) / 1000;
  }
  const clamp01 = (x) => Math.min(1, Math.max(0, x));

  function frame(now) {
    frames++;
    const dt = Math.min(0.1, (now - (st.last || now)) / 1000); st.last = now;
    let moving = false;
    const T = phase(now);
    if (T < INTRO_END) moving = true; else st.done = true;

    /* camera sway */
    const k = st.still ? 1 : 0.08;
    st.sx += (st.px - st.sx) * k; st.sy += (st.py - st.sy) * k;
    if (Math.abs(st.px - st.sx) > 0.001 || Math.abs(st.py - st.sy) > 0.001) moving = true;
    dir.copy(baseDir).applyAxisAngle(up, st.sx * 0.07); dir.y += st.sy * 0.04; dir.normalize();
    camera.position.copy(target).addScaledVector(dir, st.dist);
    camera.lookAt(target);

    const any = st.sel >= 0;
    objs.forEach((O) => {
      const wv = clamp01((T - O.win.w0) / (O.win.w1 - O.win.w0));
      const lv = clamp01((T - O.win.l0) / (O.win.l1 - O.win.l0));
      const fv = clamp01((T - O.win.f0) / (O.win.f1 - O.win.f0));
      if (wv !== O.w || lv !== O.l) { placeInk(O, wv, lv); if (lv !== O.l) renderer.shadowMap.needsUpdate = true; O.w = wv; O.l = lv; }
      if (fv !== O.f) {
        O.f = fv; O.fill.visible = fv > 0.001;
        O.fillMat.opacity = ease(fv);
        const solid = fv >= 1;
        if (O.fillMat.transparent === solid) { O.fillMat.transparent = !solid; O.fillMat.needsUpdate = true; }
      }
      const litT = st.sel === O.i ? 1 : 0, hovT = st.hov === O.i ? 1 : 0, kk = st.still ? 1 : 0.16;
      O.lit += (litT - O.lit) * kk; O.hov += (hovT - O.hov) * kk;
      if (Math.abs(litT - O.lit) > 0.004 || Math.abs(hovT - O.hov) > 0.004) moving = true; else { O.lit = litT; O.hov = hovT; }
      const dim = any && st.sel !== O.i ? 0.35 : 0;
      O.fillMat.color.copy(FILL0).lerp(FILLON, O.lit).lerp(PAPER, dim * (1 - O.lit));
      O.fillMat.emissiveIntensity = 0.22 * O.lit + 0.06 * O.hov;
      O.inkMat.color.copy(NAVY).lerp(HUE, Math.max(O.lit, O.hov * 0.6));
      O.inkMat.emissiveIntensity = 0.35 * O.lit + 0.15 * O.hov;
      O.inkMat.opacity = 1;
    });

    /* glow pool */
    if (any) {
      const O = objs[st.sel], b = O.bounds, sx = (b.x1 - b.x0) * S * 2.1 + 0.08, sz = (b.z1 - b.z0) * S * 2.1 + 0.08;
      const cx = wx((b.x0 + b.x1) / 2);
      pool.position.set(cx, surfaceY(cx) + 0.0012, wz((b.z0 + b.z1) / 2));
      pool.scale.set(sx, sz, 1);
    }
    pool.visible = any;
    pool.material.opacity = any ? 0.75 * objs[st.sel].lit : 0;

    /* arcs: grow out from the lit object, then a spark runs along each one */
    const since = now - st.selAt;
    arcs.forEach((A) => {
      const on = any && (A.a === st.sel || A.b === st.sel) && st.done ? 1 : 0;
      A.grow = st.still ? on : on ? Math.min(1, A.grow + dt / 0.7) : Math.max(0, A.grow - dt / 0.3);
      if (A.grow > 0 && A.grow < 1) moving = true;
      const vis = A.grow > 0.001;
      A.core.visible = A.halo.visible = vis;
      const cnt = Math.max(6, Math.floor((A.full * ease(A.grow)) / 36) * 36);
      A.core.geometry.setDrawRange(0, cnt); A.halo.geometry.setDrawRange(0, cnt);
      A.halo.material.opacity = 0.22 + (st.still ? 0 : 0.08 * Math.sin(now / 240));
      const pulse = vis && A.grow >= 1 && !st.still && since < PULSE_MS;
      A.spark.visible = pulse || (vis && st.still);
      if (A.spark.visible) {
        const u = st.still ? 0.62 : ((since / 1400) % 1);
        A.curve.getPoint(u, A.spark.position);
        A.spark.material.opacity = st.still ? 0.8 : 0.55 + 0.4 * Math.sin(u * Math.PI);
      }
      if (pulse) moving = true;
    });

    renderer.render(scene, camera);
    if (onFrame) onFrame(leftQuad(), w, h);
    if (!moving) stop();
  }

  function kick() { if (!running) { running = true; st.last = 0; renderer.setAnimationLoop(frame); } }
  function stop() { if (running) { running = false; renderer.setAnimationLoop(null); } }

  function project(x, z) {
    va.set(x, surfaceY(x) + 0.001, z).project(camera);
    return [(va.x * 0.5 + 0.5) * w, (-va.y * 0.5 + 0.5) * h];
  }
  function leftQuad() { return [project(LEFT.x0, LEFT.z0), project(LEFT.x1, LEFT.z0), project(LEFT.x1, LEFT.z1), project(LEFT.x0, LEFT.z1)]; }

  /* ---- Picking: generous boxes around each object, so thin ink is easy to hit ---- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
  function pick(e) {
    if (!st.done && !st.still) return -1;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    let best = -1, bd = Infinity;
    objs.forEach((O) => { if (ray.ray.intersectBox(O.box, hit)) { const d = hit.distanceTo(ray.ray.origin); if (d < bd) { bd = d; best = O.i; } } });
    return best;
  }
  const offs = [];
  const on = (t, ev, fn) => { t.addEventListener(ev, fn); offs.push(() => t.removeEventListener(ev, fn)); };
  on(canvas, "pointermove", (e) => {
    if (e.pointerType === "mouse") {
      const r = host.getBoundingClientRect();
      st.px = (e.clientX - r.left) / r.width - 0.5; st.py = (e.clientY - r.top) / r.height - 0.5;
    }
    const i = pick(e);
    if (i !== st.hov) { st.hov = i; canvas.style.cursor = i >= 0 ? "pointer" : ""; if (onHover) onHover(i); }
    kick();
  });
  on(canvas, "pointerleave", () => { st.px = st.py = 0; st.hov = -1; canvas.style.cursor = ""; if (onHover) onHover(-1); kick(); });
  on(canvas, "click", (e) => { const i = pick(e); if (onPick) onPick(i); });
  on(window, "resize", resize);
  resize();

  return {
    select(i) { st.sel = i; st.selAt = performance.now(); if (i >= 0) st.done = true; kick(); },
    hover(i) { st.hov = i; kick(); },
    setStill(b) { st.still = !!b; if (b) st.done = true; kick(); },
    replay() { st.done = false; st.start = performance.now(); st.sel = -1; objs.forEach((O) => { O.w = O.l = O.f = -1; }); kick(); },
    introDone: () => st.done || st.still,
    running: () => running,
    frames: () => frames,
    stats: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }),
    resize,
    dispose() {
      stop();
      offs.forEach((f) => f());
      scene.traverse((o) => {
        if (o.geometry && o.geometry !== unit) o.geometry.dispose();
        [o.material || []].flat().forEach((m) => { if (m.map && m.map !== gtex) m.map.dispose(); m.dispose(); });
      });
      unit.dispose(); gtex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    }
  };
}
