/* WebGL hero: an open book whose cluster drawing lifts into 3D ink, layer by layer.
   Loaded with dynamic import() only on capable desktops. Needs the import map in
   index.html ("three" -> pinned three@0.186.1 on jsDelivr).
   Budget: ~16 draw calls, ~5k triangles; renders only while something moves. */
import * as THREE from "three";

export const PAGE = { x0: 0.07, x1: 0.83, z0: -0.51, z1: 0.51 };     /* drawing area, right page */
export const LEFT = { x0: -0.83, x1: -0.07, z0: -0.51, z1: 0.51 };   /* overlay area, left page */
const TOP = 0.068, DIP = 0.028, DECAY = 0.035;

export function stageWindow(i) { const s = 0.06 + i * 0.23; return [s, s + 0.14]; }

export function surfaceY(x) { const ax = Math.abs(x); return TOP - DIP * Math.exp(-(Math.max(ax, 0.02) - 0.02) / DECAY); }
export function ease(t) { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); }

function stripesTexture() {
  const c = document.createElement("canvas"); c.width = 8; c.height = 64;
  const g = c.getContext("2d");
  g.fillStyle = "#f6f5f1"; g.fillRect(0, 0, 8, 64);
  g.fillStyle = "#dcdcd6";
  for (let y = 0; y < 64; y += 3) g.fillRect(0, y, 8, 1);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 10); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function glowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* The open clothbound book: two boards, two curved page blocks and a round hinge.
   Shared with the per-book living scenes (assets/scene/engine.js); 7 draw calls. */
export function buildOpenBook(clothColor) {
  const cloth = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.85 });
  const paper = new THREE.MeshStandardMaterial({ color: 0xfdfcf9, roughness: 0.92, emissive: 0xfdfcf9, emissiveIntensity: 0.08 });
  const edges = new THREE.MeshStandardMaterial({ map: stripesTexture(), roughness: 1 });
  const book = new THREE.Group();

  [-1, 1].forEach((side) => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.91, 0.018, 1.2), cloth);
    board.position.set(side * 0.465, 0.009, 0); board.castShadow = true; board.receiveShadow = true; book.add(board);

    /* Page block: the curved paper profile extruded along the page depth.
       Built per side (no negative scale) so normals face outward on both pages. */
    const shape = new THREE.Shape(), xs = [];
    for (let k = 0; k <= 24; k++) xs.push(0.02 + (0.86 * k) / 24);
    shape.moveTo(side * 0.02, 0.018);
    xs.forEach((x) => shape.lineTo(side * x, surfaceY(x)));
    shape.lineTo(side * 0.88, 0.018); shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 1.15, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, -0.575);
    const block = new THREE.Mesh(g, [edges, paper]);
    block.castShadow = true; block.receiveShadow = true;
    book.add(block);
  });
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 12, 1, false, Math.PI / 2, Math.PI), cloth);
  hinge.rotation.x = Math.PI / 2; hinge.rotation.z = Math.PI; hinge.position.y = 0.018; book.add(hinge);
  return { group: book, cloth, paper, edges };
}

export function createScene(opts) {
  const { canvas, host, ink, books, onFrame, onPick, onHover } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;   /* re-render shadows only when ink moves */
  renderer.shadowMap.needsUpdate = true;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 40);
  const target = new THREE.Vector3(0.0, 0.02, 0.06);
  const baseDir = new THREE.Vector3(0.12, 1.0, 0.6).normalize();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xe3e9f0, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.55);
  sun.position.set(-1.6, 3.2, 1.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -1.3, right: 1.3, top: 1.3, bottom: -1.3, near: 0.5, far: 7 });
  sun.shadow.bias = -0.0004; sun.shadow.radius = 4; sun.shadow.normalBias = 0.01;
  scene.add(sun);

  /* Ground: shadows only, so the page's own CSS background shows through. */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  /* ---- The book ---- */
  const book = buildOpenBook(0x17304a).group; scene.add(book);

  /* ---- Ink layers: a flat print on the paper + a lifted 3D copy ---- */
  const box = new THREE.BoxGeometry(1, 1, 1);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const toX = (u) => PAGE.x0 + (u / ink.W) * (PAGE.x1 - PAGE.x0);
  const toZ = (w) => PAGE.z0 + (w / ink.H) * (PAGE.z1 - PAGE.z0);
  const INK = new THREE.Color(0x0d1b2a);

  const layers = ink.layers.map((polys, i) => {
    const segs = [];
    polys.forEach((p) => { for (let k = 0; k < p.length - 1; k++) segs.push([p[k], p[k + 1]]); });
    const printMat = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.92, depthWrite: false });
    const liftMat = new THREE.MeshStandardMaterial({ color: INK.clone(), roughness: 0.45, metalness: 0.0, emissive: new THREE.Color(books[i].hueLight), emissiveIntensity: 0 });
    const print = new THREE.InstancedMesh(box, printMat, segs.length);
    const lift = new THREE.InstancedMesh(box, liftMat, segs.length);
    lift.castShadow = true; lift.userData.layer = i;
    const base = [];
    segs.forEach((sg, k) => {
      const ax = toX(sg[0][0]), az = toZ(sg[0][1]), bx = toX(sg[1][0]), bz = toZ(sg[1][1]);
      const len = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2;
      q.setFromAxisAngle(up, -Math.atan2(bz - az, bx - ax));
      const y = surfaceY(mx);
      m4.compose(v.set(mx, y + 0.0012, mz), q, s.set(len + 0.0042, 0.0006, 0.0042)); print.setMatrixAt(k, m4);
      base.push({ mx, mz, y, len, q: q.clone() });
    });
    print.renderOrder = 1;
    book.add(print); book.add(lift);
    return { i, print, lift, base, liftMat, printMat, hue: new THREE.Color(books[i].hue), height: 0.05 + i * 0.034, shown: -1, hover: 0 };
  });

  function placeLift(L, t) {
    const h = L.height * ease(t), thick = 0.004 + 0.008 * ease(t);
    L.base.forEach((b, k) => {
      m4.compose(v.set(b.mx, b.y + 0.002 + h, b.mz), b.q, s.set(b.len + 0.011, thick, 0.011));
      L.lift.setMatrixAt(k, m4);
    });
    L.lift.instanceMatrix.needsUpdate = true;
    L.lift.computeBoundingSphere();
  }

  /* ---- Traffic packet ---- */
  const path = ink.packetPath.map((p) => new THREE.Vector3(toX(p[0]), 0, toZ(p[1])));
  const segLen = path.slice(1).map((p, k) => p.distanceTo(path[k]));
  const total = segLen.reduce((a, b) => a + b, 0);
  const packet = new THREE.Group();
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 2), new THREE.MeshBasicMaterial({ color: 0xe9fbff }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0x00d9ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.set(0.11, 0.11, 1);
  packet.add(core); packet.add(glow); packet.visible = false; book.add(packet);
  function packetAt(u) {
    let d = (u % 1) * total, k = 0;
    while (k < segLen.length - 1 && d > segLen[k]) { d -= segLen[k]; k++; }
    return v.copy(path[k]).lerp(path[k + 1], Math.min(1, d / segLen[k]));
  }

  /* ---- State, sizing, loop ---- */
  const state = { target: 0, shown: 0, still: false, px: 0, py: 0, sx: 0, sy: 0, hover: -1, visible: true, t0: performance.now() };
  let w = 1, h = 1, raf = 0, frames = 0;

  /* Fit: project the book's bounding box (covers plus the highest lifted layer, with
     pointer sway headroom) and solve camera distance and view offset so it sits inside
     the safe rectangle the page gives us (right of the intro, inside the content column). */
  const BOX = [];
  [-0.94, 0.94].forEach((x) => [0, 0.2].forEach((y) => [-0.61, 0.61].forEach((z) => BOX.push(new THREE.Vector3(x, y, z)))));
  const fitState = { ox: 0, oy: 0, bottom: 0 };
  function place(dist, ox, oy) {
    camera.userData.dist = dist;
    camera.position.copy(target).addScaledVector(baseDir, dist);
    camera.lookAt(target);
    camera.setViewOffset(w, h, ox, oy, w, h);
    camera.updateMatrixWorld();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    BOX.forEach((p) => {
      v.copy(p).project(camera);
      const sx = (v.x * 0.5 + 0.5) * w, sy = (-v.y * 0.5 + 0.5) * h;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    });
    return { x0, x1, y0, y1 };
  }
  function resize() {
    const r = host.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const safe = opts.safeRect ? opts.safeRect(w, h) : { left: w * 0.5, right: w - 48, top: 80, bottom: h - 110 };
    const sway = 1.06;                                  /* headroom for the pointer parallax */
    let dist = 6, ox = 0, oy = 0, b;
    for (let k = 0; k < 6; k++) {
      b = place(dist, ox, oy);
      const sW = ((b.x1 - b.x0) * sway) / (safe.right - safe.left), sH = ((b.y1 - b.y0) * sway) / (safe.bottom - safe.top);
      dist *= Math.max(sW, sH);
      b = place(dist, ox, oy);
      ox += (b.x0 + b.x1) / 2 - (safe.left + safe.right) / 2;
      oy += (b.y0 + b.y1) / 2 - (safe.top + safe.bottom) / 2;
    }
    b = place(dist, ox, oy);
    fitState.ox = ox; fitState.oy = oy; fitState.bounds = b;
    renderer.shadowMap.needsUpdate = true;
    kick();
  }

  function frame(now) {
    raf = 0; frames++;
    const k = state.still ? 1 : 0.14;
    state.shown += (state.target - state.shown) * k;
    if (Math.abs(state.target - state.shown) < 0.0004) state.shown = state.target;
    state.sx += (state.px - state.sx) * (state.still ? 1 : 0.08);
    state.sy += (state.py - state.sy) * (state.still ? 1 : 0.08);

    const dir = baseDir.clone().applyAxisAngle(up, state.sx * 0.08);
    dir.y += state.sy * 0.05; dir.normalize();
    camera.position.copy(target).addScaledVector(dir, camera.userData.dist || 4);
    camera.lookAt(target);

    let moving = state.shown !== state.target || Math.abs(state.px - state.sx) > 0.001 || Math.abs(state.py - state.sy) > 0.001;
    layers.forEach((L) => {
      const [a, b] = stageWindow(L.i);
      const t = Math.min(1, Math.max(0, (state.shown - a) / (b - a)));
      if (Math.abs(t - L.shown) > 0.0005) { placeLift(L, t); L.shown = t; renderer.shadowMap.needsUpdate = true; }
      L.lift.visible = t > 0.001;
      L.printMat.opacity = 0.92 - 0.8 * ease(t);
      L.liftMat.color.copy(INK).lerp(L.hue, ease(t * 1.4));
      const hv = state.hover === L.i ? 1 : 0;
      L.hover += (hv - L.hover) * (state.still ? 1 : 0.2);
      if (Math.abs(hv - L.hover) > 0.01) moving = true;
      L.liftMat.emissiveIntensity = 0.12 * ease(t) + 0.32 * L.hover;
    });

    const dev = layers[2] ? layers[2].shown : 0;
    packet.visible = dev > 0.6;
    if (packet.visible) {
      const u = state.still ? 0.5 : ((now - state.t0) / 2600) % 1;
      const p = packetAt(u);
      packet.position.set(p.x, surfaceY(p.x) + layers[2].height * ease(dev) + 0.026, p.z);
      glow.material.opacity = 0.55 + 0.25 * Math.sin(now / 260);
      if (!state.still) moving = true;
    }

    renderer.render(scene, camera);
    if (onFrame) onFrame(leftPageQuad(), w, h);
    if (moving && state.visible) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && state.visible) raf = requestAnimationFrame(frame); }

  function project(x, z) {
    v.set(x, surfaceY(x) + 0.001, z).project(camera);
    return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h];
  }
  function leftPageQuad() {
    return [project(LEFT.x0, LEFT.z0), project(LEFT.x1, LEFT.z0), project(LEFT.x1, LEFT.z1), project(LEFT.x0, LEFT.z1)];
  }

  /* ---- Picking ---- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  /* Strokes are thin, so cast a small ring of rays (about 8 px) and take the nearest hit. */
  const RING = [[0, 0], [8, 0], [-8, 0], [0, 8], [0, -8], [6, 6], [-6, 6], [6, -6], [-6, -6]];
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    const lit = layers.filter((L) => L.shown > 0.5).map((L) => L.lift);
    if (!lit.length) return -1;
    let best = null;
    for (const [dx, dy] of RING) {
      ndc.set(((e.clientX + dx - r.left) / r.width) * 2 - 1, -((e.clientY + dy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(lit, false)[0];
      if (hit && (!best || hit.distance < best.distance)) best = hit;
      if (best && dx === 0 && dy === 0) break;
    }
    return best ? best.object.userData.layer : -1;
  }
  canvas.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    state.px = (e.clientX - r.left) / r.width - 0.5; state.py = (e.clientY - r.top) / r.height - 0.5;
    const i = pick(e);
    if (i !== state.hover) { state.hover = i; canvas.style.cursor = i >= 0 ? "pointer" : ""; if (onHover) onHover(i); }
    kick();
  });
  canvas.addEventListener("pointerleave", () => { state.px = state.py = 0; state.hover = -1; canvas.style.cursor = ""; if (onHover) onHover(-1); kick(); });
  canvas.addEventListener("click", (e) => { const i = pick(e); if (i >= 0 && onPick) onPick(i); });

  window.addEventListener("resize", resize);
  resize();

  return {
    setProgress(p) { state.target = p; kick(); },
    setStill(b) { state.still = !!b; state.t0 = performance.now(); kick(); },
    setVisible(b) { state.visible = b; if (b) kick(); },
    setTheme(dark) { ground.material.opacity = dark ? 0.42 : 0.16; kick(); },
    frames: () => frames,
    stats: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }),
    resize,
    bounds: () => fitState.bounds
  };
}
