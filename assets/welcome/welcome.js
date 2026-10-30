/* Home welcome, once per browser session.
   A round window opens in the hero. A small robot climbs into it over the sill (one slip,
   then it makes it), walks to the middle, greets by the visitor's local time and asks its
   question. A drone arrives, hooks the robot's antenna loop and flies off with it; the
   window then closes into the page.
   - Part of the page, never a modal: no backdrop, pointer-events none except the close button.
   - Starts after the load event and an idle slot; three.js (import map "three", pinned
     0.186.1 on jsDelivr) is requested only then, so the home's own loading is untouched.
   - prefers-reduced-motion: no 3D, a small static note for 4 s (dismissable).
   - No WebGL: nothing at all.
   - ?welcome=1 replays it even when this session has already seen it. */

const KEY = "bt-welcome";
const CSS_URL = new URL("./welcome.css?v=20261030e", import.meta.url).href;

const TEXT = {
  es: {
    morning: "¡Buenos días!", afternoon: "¡Buenas tardes!", evening: "¡Buenas noches!",
    ask: "¿Quieres aprender de tecnologías cloud-native, AI-native y Physical AI para telcos?",
    go: "¡Vámonos! Necesitamos optimizar y agregar nuevos servicios a una infraestructura telco.",
    bye: "¡Cuídate!", close: "Cerrar la bienvenida",
  },
  en: {
    morning: "Good morning!", afternoon: "Good afternoon!", evening: "Good evening!",
    ask: "Want to learn cloud-native, AI-native and Physical AI technologies for telcos?",
    go: "Let's go! We need to optimize and add new services to a telco infrastructure.",
    bye: "Take care!", close: "Close the welcome",
  },
};
const lang = () => (document.documentElement.getAttribute("lang") === "en" ? "en" : "es");
const t = (k) => TEXT[lang()][k];
function greetingKey(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "morning" : h < 19 ? "afternoon" : "evening";
}

function seen() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
function markSeen() { try { sessionStorage.setItem(KEY, "1"); } catch (e) {} }
function forced() { try { return new URLSearchParams(location.search).get("welcome") === "1"; } catch (e) { return false; } }
function webgl() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}
function isDark() {
  const a = document.documentElement.getAttribute("data-theme");
  if (a) return a === "dark";
  return matchMedia("(prefers-color-scheme: dark)").matches;
}
function loadCss() {
  return new Promise((res) => {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = CSS_URL;
    l.onload = res; l.onerror = res; setTimeout(res, 2500);
    document.head.appendChild(l);
  });
}
const closeSvg = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2 2 10"/></svg>';

/* ---------- Where the window goes ----------
   Wide (two-column hero): the empty quadrant above the hero drawing, below the nav.
   Narrow (stacked hero): the top-right corner of the drawing, under the buttons. */
function layout() {
  const art = document.querySelector(".hero__art"), hero = document.querySelector(".hero");
  if (!art || !hero) return null;
  const a = art.getBoundingClientRect(), h = hero.getBoundingClientRect();
  const sx = scrollX, sy = scrollY, vw = document.documentElement.clientWidth;
  let d, cx, cy;
  if (innerWidth > 960) {
    d = Math.max(170, Math.min(196, a.width * 0.41));
    cx = a.left + a.width * 0.47; cy = h.top + 40 + d / 2;
  } else {
    d = Math.max(120, Math.min(176, a.width * 0.42));
    cx = a.right - d / 2 - 6; cy = a.top + d / 2 - 2;
  }
  return { cx: cx + sx, cy: cy + sy, R: d / 2, vw, sx };
}

/* ---------- Reduced motion ---------- */
function staticNote() {
  const L = layout(); if (!L) return;
  const n = document.createElement("div");
  n.className = "bw-note"; n.setAttribute("role", "status");
  const w = Math.min(320, L.vw - 32);
  n.style.width = w + "px";
  n.style.left = Math.max(16, Math.min(L.vw - 16 - w, L.cx + L.R - w)) + "px";
  n.style.top = (L.cy - L.R) + "px";
  n.innerHTML = `<strong></strong><span></span><button type="button" class="bw-close">${closeSvg}</button>`;
  n.querySelector("strong").textContent = t(greetingKey());
  n.querySelector("span").textContent = t("ask");
  const btn = n.querySelector("button");
  btn.setAttribute("aria-label", t("close")); btn.title = t("close");
  document.body.appendChild(n);
  requestAnimationFrame(() => n.classList.add("is-on"));
  let left = 4000, last = performance.now(), hold = false, gone = false;
  const bye = () => { if (gone) return; gone = true; n.classList.remove("is-on"); setTimeout(() => n.remove(), 350); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") bye(); };
  btn.addEventListener("click", bye);
  document.addEventListener("keydown", onKey);
  n.addEventListener("pointerenter", () => { hold = true; });
  n.addEventListener("pointerleave", () => { hold = false; last = performance.now(); });
  const tick = setInterval(() => {
    const now = performance.now();
    if (!hold) left -= now - last;
    last = now;
    if (left <= 0) { clearInterval(tick); bye(); }
  }, 200);
}

/* ---------- Easing ---------- */
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const seg = (x, a, b) => clamp01((x - a) / (b - a));
const sm = (x) => x * x * (3 - 2 * x);
const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outC = (x) => 1 - Math.pow(1 - x, 3);
const inC = (x) => x * x * x;
const outBack = (x) => { const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;

/* ---------- Story timeline (seconds) ---------- */
const T = {
  open: 0.0, jump: [0.35, 0.7], pull1: [0.75, 1.45], slip: [1.45, 1.65], pull2: [2.0, 2.7],
  leg: [2.4, 2.85], heave: [3.0, 3.5], walk: [3.7, 4.6], greet: [4.7, 6.8], ask: [7.1, 10.4],
  droneIn: [9.9, 11.3], hook: [11.3, 11.8], go: [11.5, 15.4], lift: [11.9, 12.6], bye: [13.4, 15.4],
  away: [14.3, 16.0], close: 16.0, end: 16.7,
};

async function play() {
  const L0 = layout(); if (!L0) return;
  const [THREE] = await Promise.all([import("three"), loadCss()]);
  const dark = isDark();

  /* DOM */
  const root = document.createElement("div");
  root.className = "bw";
  root.innerHTML =
    '<div class="bw-port"></div><canvas class="bw-canvas" aria-hidden="true"></canvas>' +
    '<div class="bw-bubble" data-who="robot" aria-hidden="true"></div>' +
    '<div class="bw-bubble" data-who="drone" aria-hidden="true"></div>' +
    `<button type="button" class="bw-close">${closeSvg}</button>` +
    '<p class="sr-only" aria-live="polite"></p>';
  const port = root.querySelector(".bw-port"), canvas = root.querySelector("canvas");
  const bRobot = root.querySelector('[data-who="robot"]'), bDrone = root.querySelector('[data-who="drone"]');
  const closeBtn = root.querySelector(".bw-close"), live = root.querySelector("[aria-live]");
  closeBtn.setAttribute("aria-label", t("close")); closeBtn.title = t("close");
  document.body.appendChild(root);

  /* Renderer */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch (e) { root.remove(); return; }
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  scene.add(new THREE.HemisphereLight(0xffffff, dark ? 0x3a4a5c : 0xb9c4cf, dark ? 1.9 : 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, dark ? 1.5 : 1.8); sun.position.set(-2.5, 4, 6); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9fe9ff, dark ? 0.9 : 0.5); rim.position.set(3, 1.5, -3); scene.add(rim);

  /* World: circle centre at the origin, radius 1. Sill top line at SY. */
  const SY = -0.55, FEET = -0.58;
  let L = L0, cam = {};
  function size() {
    const nl = layout(); if (nl) L = nl;
    const { cx, cy, R, vw } = L;
    const left = Math.max(L.sx, cx - 1.55 * R), right = Math.min(L.sx + vw, cx + 1.55 * R);
    const top = cy - 1.55 * R, bottom = cy + 1.06 * R;
    const cw = Math.max(1, Math.round(right - left)), ch = Math.round(bottom - top);
    const FW = 2 * Math.max(cx - left, right - cx), FH = 2 * Math.max(cy - top, bottom - cy);
    camera.aspect = FW / FH;
    const dist = (FH / R) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0);
    camera.setViewOffset(FW, FH, FW / 2 - (cx - left), FH / 2 - (cy - top), cw, ch);
    camera.updateProjectionMatrix();
    renderer.setSize(cw, ch, false);
    Object.assign(canvas.style, { left: left + "px", top: top + "px", width: cw + "px", height: ch + "px" });
    Object.assign(port.style, { left: cx - R + "px", top: cy - R + "px", width: 2 * R + "px", height: 2 * R + "px" });
    const k = Math.SQRT1_2 * R;
    Object.assign(closeBtn.style, { left: Math.min(L.sx + vw - 32, cx + k - 6) + "px", top: cy - k - 22 + "px" });
    cam = { left, top, cw, ch };
  }
  size();

  /* ---------- Materials ---------- */
  const clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), -SY);
  const robotMats = [];
  const std = (color, o = {}, mine) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, ...o });
    if (mine) robotMats.push(m);
    return m;
  };
  const glow = (color, mine) => { const m = new THREE.MeshBasicMaterial({ color }); if (mine) robotMats.push(m); return m; };
  const TEAL = 0x00708a, INK = 0x0d1b2a, CYAN = 0x00d9ff;

  function shadowTex() {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(0,0,0,1)"); r.addColorStop(0.5, "rgba(0,0,0,.45)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  const shTex = shadowTex();
  const blob = (op) => new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shTex, transparent: true, opacity: op, depthWrite: false, color: dark ? 0x000000 : INK }));

  /* ---------- The robot (units: about 1.33 tall, feet at y = 0) ---------- */
  function buildRobot() {
    const r = { root: new THREE.Group() };
    const shell = std(0xf7f9fb, { roughness: 0.38 }, true), teal = std(TEAL, { roughness: 0.5 }, true);
    const ink = std(INK, { roughness: 0.25, metalness: 0.2 }, true), dim = std(0x2b3d50, { roughness: 0.5 }, true);
    const body = new THREE.Group(); r.root.add(body); r.body = body;

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.12, 8, 24), shell);
    torso.scale.set(1.08, 1, 0.86); torso.position.y = 0.49; body.add(torso);
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.178, 0.02, 10, 40), teal);
    belt.rotation.x = Math.PI / 2; belt.scale.set(1.08, 0.86, 1); belt.position.y = 0.38; body.add(belt);
    const panel = new THREE.Mesh(new THREE.CircleGeometry(0.055, 32), ink);
    panel.position.set(0, 0.52, 0.152); body.add(panel);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), glow(CYAN, true));
    led.position.set(0, 0.52, 0.16); body.add(led); r.led = led;

    const limb = (len, rad, mat, end, endMat) => {
      const p = new THREE.Group();
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(rad, len, 6, 12), mat);
      m.position.y = -len / 2 - rad * 0.4; p.add(m);
      const e = new THREE.Mesh(end, endMat); e.position.y = -len - rad * 1.2; p.add(e);
      p.end = e; return p;
    };
    r.arms = [-1, 1].map((s) => {
      const a = limb(0.15, 0.042, teal, new THREE.SphereGeometry(0.06, 16, 12), shell);
      a.position.set(s * 0.215, 0.62, 0); body.add(a); return a;
    });
    r.legs = [-1, 1].map((s) => {
      const footG = new THREE.SphereGeometry(0.07, 16, 10);
      const l = limb(0.12, 0.05, dim, footG, teal);
      l.end.scale.set(1.05, 0.6, 1.45); l.end.position.z = 0.025;
      l.position.set(s * 0.09, 0.29, 0); body.add(l); return l;
    });

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.07, 16), dim);
    neck.position.y = 0.74; body.add(neck);
    const head = new THREE.Group(); head.position.y = 0.93; body.add(head); r.head = head;
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.22, 40, 28), shell);
    skull.scale.set(1.18, 0.92, 1); head.add(skull);
    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.2235, 40, 20, Math.PI / 2 - 0.92, 1.84, Math.PI / 2 - 0.44, 0.8), ink);
    visor.scale.copy(skull.scale); head.add(visor);
    const eyes = new THREE.Group(); head.add(eyes); r.eyes = eyes;
    const eyeMat = glow(CYAN, true);
    r.eye = [-1, 1].map((s) => {
      const e = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.04, 4, 10), eyeMat);
      e.position.set(s * 0.085, 0.02, 0.212); eyes.add(e); return e;
    });
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.0075, 6, 20, Math.PI), eyeMat);
    smile.rotation.z = Math.PI; smile.position.set(0, -0.05, 0.214); eyes.add(smile); r.smile = smile;
    [-1, 1].forEach((s) => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.05, 20), teal);
      ear.rotation.z = Math.PI / 2; ear.position.set(s * 0.262, 0, 0); head.add(ear);
    });
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.12, 8), dim);
    stalk.position.y = 0.245; head.add(stalk);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.013, 10, 28), teal);
    loop.position.y = 0.34; head.add(loop);

    const sh = blob(dark ? 0.45 : 0.16); sh.position.set(0, 0.005, -0.02); sh.scale.set(0.62, 0.07, 1);
    r.root.add(sh); r.shadow = sh;
    r.loopTop = 0.93 + 0.34 + 0.045; // loop top, robot units, head upright
    return r;
  }

  /* ---------- The drone ---------- */
  function buildDrone() {
    const d = { root: new THREE.Group() };
    const model = new THREE.Group(); d.root.add(model); d.model = model;
    const body = std(TEAL, { roughness: 0.4 }), shellM = std(0xf7f9fb, { roughness: 0.35 });
    const ink = std(INK, { roughness: 0.25, metalness: 0.2 }), dim = std(0x2b3d50, { roughness: 0.5 });
    const hull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 40, 24), body);
    hull.scale.set(1, 0.56, 0.9); model.add(hull);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.405, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.3), shellM);
    cap.scale.copy(hull.scale); model.add(cap);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.407, 40, 16, Math.PI / 2 - 0.7, 1.4, Math.PI / 2 - 0.36, 0.6), ink);
    visor.scale.copy(hull.scale); model.add(visor);
    const eyeM = new THREE.MeshBasicMaterial({ color: CYAN });
    d.eye = [-1, 1].map((s) => {
      const e = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.05, 4, 10), eyeM);
      e.rotation.z = Math.PI / 2; e.position.set(s * 0.1, 0.035, 0.352); model.add(e); return e;
    });
    d.props = [];
    const blurM = new THREE.MeshBasicMaterial({ color: dark ? 0xeaf0f6 : INK, transparent: true, opacity: dark ? 0.12 : 0.08, depthWrite: false, side: THREE.DoubleSide });
    [45, 135, 225, 315].forEach((deg) => {
      const a = (deg * Math.PI) / 180, x = Math.cos(a) * 0.6, z = Math.sin(a) * 0.48;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 10), dim);
      arm.position.set(x / 2, 0.02, z / 2); arm.rotation.z = Math.PI / 2;
      arm.rotation.y = -Math.atan2(z, x); model.add(arm);
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.1, 18), shellM);
      motor.position.set(x, 0.05, z); model.add(motor);
      const hub = new THREE.Group(); hub.position.set(x, 0.115, z); model.add(hub);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.008, 0.045), ink); hub.add(blade);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.24, 32), blurM); disc.rotation.x = -Math.PI / 2; hub.add(disc);
      d.props.push(hub);
    });
    const winch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 16), dim);
    winch.position.y = -0.2; model.add(winch);

    /* Cable and hook hang from the root, so they stay plumb while the drone banks. */
    const rig = new THREE.Group(); d.root.add(rig); d.rig = rig;
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 6), dim);
    cable.geometry.translate(0, -0.5, 0); rig.add(cable); d.cable = cable;
    const hook = new THREE.Group(); rig.add(hook); d.hook = hook;
    const RH = 0.05;
    const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.07, 8), ink);
    shank.position.y = -0.035; hook.add(shank);
    const u = new THREE.Mesh(new THREE.TorusGeometry(RH, 0.011, 8, 24, Math.PI * 1.3), ink);
    u.rotation.z = Math.PI; u.position.set(RH, -0.07, 0); hook.add(u);
    d.RH = RH; d.hookDrop = 0.07 + RH; // cable end to the inside bottom of the hook
    const sh = blob(dark ? 0.35 : 0.1); scene.add(sh); d.shadow = sh;
    return d;
  }

  const robot = buildRobot(), drone = buildDrone();
  const RS = 0.86, DS = 0.6;
  robot.root.scale.setScalar(RS); drone.model.scale.setScalar(DS);
  scene.add(robot.root, drone.root);
  robotMats.forEach((m) => { m.clippingPlanes = [clip]; });

  /* ---------- Speech ---------- */
  const v3 = new THREE.Vector3();
  function toPage(x, y, z) {
    v3.set(x, y, z).project(camera);
    return { x: cam.left + (v3.x * 0.5 + 0.5) * cam.cw, y: cam.top + (-v3.y * 0.5 + 0.5) * cam.ch };
  }
  const said = new Set();
  function bubble(el, key, on, anchor, below) {
    if (!on) { el.classList.remove("is-on"); return; }
    const txt = key === "greet" ? t(greetingKey()) : t(key);
    if (el.dataset.key !== key || el.dataset.lang !== lang()) {
      el.textContent = txt; el.dataset.key = key; el.dataset.lang = lang();
    }
    if (!said.has(key)) { said.add(key); live.textContent = txt; }
    const portLeft = L.cx - L.R, minL = L.sx + 16;
    const maxW = Math.min(280, portLeft - 14 - minL);
    el.style.maxWidth = Math.max(140, maxW) + "px";
    el.style.width = "max-content";
    const w = el.offsetWidth, h = el.offsetHeight;
    const x = Math.max(minL, portLeft - 14 - w);
    const navB = (document.getElementById("nav")?.getBoundingClientRect().bottom || 0) + scrollY + 8;
    const y = Math.max(navB, L.cy - L.R - 10, below || 0, anchor.y - h / 2);
    el.style.left = x + "px"; el.style.top = y + "px";
    el.style.setProperty("--tail", Math.max(14, Math.min(h - 14, anchor.y - y)) + "px");
    el.classList.add("is-on");
    return y + h;
  }

  /* ---------- Animation ---------- */
  const X0 = 0.34; // where the robot climbs in
  function robotPose(s) {
    const r = robot, A = r.arms, G = r.legs;
    let x = X0, y = SY - 1.4, z = 0, rz = 0, ry = 0, lean = 0;
    const SPREAD = 0.5; // arms in a V while climbing, so the hands show beside the head
    let armA = [-Math.PI + 0.15, -Math.PI + 0.15], armZ = [-SPREAD, SPREAD], legX = [0, 0], legZ = [0, 0];
    let eyeY = 1, eyeUp = 0, headX = 0, headZ = 0, clipOn = true, clipY = SY, shadow = 0;

    const reach = (rootY) => { // arm angle that keeps the hands on the sill
      const sh = rootY + 0.62 * RS, need = SY + 0.05 - sh, len = 0.27 * RS * Math.cos(SPREAD);
      return -Math.acos(Math.max(-1, Math.min(1, -need / len)));
    };
    const hang = SY + 0.05 - (0.62 + 0.27 * Math.cos(SPREAD)) * RS;

    if (s < T.jump[1]) { // jump up from behind the sill and catch it
      const k = outBack(seg(s, T.jump[0], T.jump[1]));
      y = lerp(SY - 1.3, hang, k);
    } else if (s < T.slip[0]) { // first pull: halfway up, wobbling
      const k = io(seg(s, T.pull1[0], T.pull1[1]));
      y = lerp(hang, hang + 0.26, k) + Math.sin(s * 30) * 0.006 * k;
      rz = Math.sin(s * 9) * 0.06 * k; eyeY = lerp(1, 0.35, k);
      armA = [reach(y), reach(y)];
    } else if (s < T.pull2[0]) { // the slip, then a dangle
      const k = seg(s, T.slip[0], T.slip[1]);
      y = lerp(hang + 0.26, hang - 0.03, inC(k));
      if (s > T.slip[1]) { const b = seg(s, T.slip[1], T.pull2[0]); y = hang - 0.03 * Math.cos(b * Math.PI * 2) * (1 - b); headZ = Math.sin(b * 12) * 0.12 * (1 - b); }
      eyeY = 1.35; armA = [reach(y), reach(y)]; rz = Math.sin(s * 14) * 0.05;
    } else if (s < T.heave[0]) { // second pull, leg over the sill
      const k = io(seg(s, T.pull2[0], T.pull2[1]));
      y = lerp(hang, SY - 0.12 * RS, k);
      armA = [reach(y), reach(y)]; eyeY = 0.3 + 0.1 * Math.sin(s * 20);
      rz = Math.sin(s * 11) * 0.05 * (1 - k) - 0.08 * seg(s, T.leg[0], T.leg[1]);
      const lk = outC(seg(s, T.leg[0], T.leg[1]));
      legZ[1] = 1.95 * lk; legX[1] = -0.35 * lk;
      legX[0] = Math.sin(s * 16) * 0.5 * (1 - lk);
    } else if (s < T.walk[0]) { // heave over, stand up, a little shake
      const k = io(seg(s, T.heave[0], T.heave[1]));
      y = lerp(SY - 0.12 * RS, FEET, k) + Math.sin(k * Math.PI) * 0.1;
      z = 0.06 * k; clipY = lerp(SY, FEET - 0.08, k);
      armA = [lerp(reach(SY - 0.12 * RS), 0, k), lerp(reach(SY - 0.12 * RS), 0, k)];
      armZ = [-SPREAD * (1 - k), SPREAD * (1 - k)];
      legZ[1] = 1.95 * (1 - sm(k)); legX[1] = -0.35 * (1 - k); rz = -0.08 * (1 - k);
      const st = seg(s, T.heave[1], T.walk[0]);
      if (st > 0) { y = FEET + Math.sin(st * Math.PI) * 0.025; headZ = Math.sin(st * Math.PI * 4) * 0.08 * (1 - st); clipOn = false; }
      eyeY = k < 1 ? 0.4 : 1; shadow = st;
    } else { // standing inside the window
      clipOn = false; z = 0.06; y = FEET; shadow = 1;
      const w = seg(s, T.walk[0], T.walk[1]);
      x = lerp(X0, 0, io(w));
      if (w > 0 && w < 1) {
        const ph = w * Math.PI * 6;
        legX = [Math.sin(ph) * 0.45, -Math.sin(ph) * 0.45]; armA = [-Math.sin(ph) * 0.35, Math.sin(ph) * 0.35];
        y += Math.abs(Math.sin(ph)) * 0.02; ry = -0.5 * Math.sin(w * Math.PI);
      } else armA = [0, 0];
      armZ = [-0.08, 0.08];
      const breathe = Math.sin(s * 2.4) * 0.006; y += breathe;
      // greeting: wave the arm on the screen-left side
      const g = seg(s, T.greet[0], T.greet[0] + 0.35) * (1 - seg(s, T.greet[1] - 0.3, T.greet[1]));
      if (g > 0) { armZ[0] = lerp(-0.08, -2.5 + Math.sin(s * 11) * 0.32, sm(g)); headZ = 0.1 * g; eyeY = lerp(1, 0.55, g); }
      // the question: open arms, head tilted
      const q = seg(s, T.ask[0], T.ask[0] + 0.4) * (1 - seg(s, T.droneIn[0], T.droneIn[0] + 0.5));
      if (q > 0) { armZ = [lerp(-0.08, -0.65, sm(q)), lerp(0.08, 0.65, sm(q))]; headZ = -0.12 * q; }
      // drone arrives: look up
      const lu = seg(s, T.droneIn[0] + 0.3, T.droneIn[1]) * (1 - seg(s, T.hook[0], T.hook[1]));
      eyeUp = seg(s, T.droneIn[0] + 0.3, T.droneIn[1]);
      headX = -0.25 * sm(lu);
    }
    if (s > T.hook[1]) { eyeUp = 0.6; }
    const bye = seg(s, T.bye[0], T.bye[0] + 0.3) * (1 - seg(s, T.bye[1] - 0.3, T.bye[1]));
    if (bye > 0) { armZ[1] = lerp(armZ[1], 2.5 + Math.sin(s * 12) * 0.35, sm(bye)); eyeY = lerp(eyeY, 0.5, bye); }

    // blink every few seconds
    const bl = (s * 1000) % 3100; if (bl < 120 && eyeY > 0.8) eyeY *= 0.12;

    r.root.position.set(x, y, z); r.root.rotation.set(lean, ry, rz);
    A.forEach((a, i) => { a.rotation.set(armA[i], 0, armZ[i]); });
    G.forEach((l, i) => { l.rotation.set(legX[i], 0, legZ[i]); });
    r.head.rotation.set(headX, 0, headZ);
    r.eye.forEach((e) => { e.scale.y = eyeY; });
    r.eyes.position.y = eyeUp * 0.02;
    r.smile.scale.y = eyeY < 0.6 ? 1.25 : 1;
    clip.constant = clipOn ? -clipY : 100;
    r.shadow.material.opacity = (dark ? 0.45 : 0.16) * shadow;
    r.led.material.color.setHex(Math.sin(s * 5) > 0 ? CYAN : 0x7beeff);
  }

  let swing = 0;
  function dronePose(s) {
    const d = drone;
    const standLoop = FEET + robot.loopTop * RS, hoverY = standLoop + d.hookDrop + 0.2 * DS + 0.16;
    const hx = 0 - d.RH; // hook bottom sits on the loop
    let x, y, z, bank = 0, vis = s >= T.droneIn[0];
    const bob = Math.sin(s * 3.1) * 0.025;
    if (s < T.droneIn[1]) {
      const k = outC(seg(s, T.droneIn[0], T.droneIn[1]));
      x = lerp(2.4, hx, k); y = lerp(2.1, hoverY, k) + bob * k; z = lerp(-11, 0.08, k);
      bank = 0.3 * (1 - k) * Math.sin(k * Math.PI + 0.4);
    } else if (s < T.away[0]) {
      const lk = io(seg(s, T.lift[0], T.lift[1]));
      x = hx; y = hoverY + bob + lk * 0.22; z = 0.08;
    } else {
      const k = seg(s, T.away[0], T.away[1]), e = inC(k) * 0.85 + k * 0.15;
      x = lerp(hx, 1.9, e); y = lerp(hoverY + 0.22 + bob, 2.2, e); z = lerp(0.08, -18, e);
      bank = -0.32 * sm(seg(s, T.away[0], T.away[0] + 0.5));
    }
    d.root.visible = vis;
    d.root.position.set(x, y, z); d.root.rotation.set(0, 0, bank);
    d.model.rotation.set(0.32, Math.sin(s * 1.3) * 0.08, 0);

    // cable: lower to the loop, then carry
    const belly = 0.2 * DS;
    const reachLen = Math.max(0.04, hoverY - belly - d.hookDrop - standLoop);
    const cl = s < T.hook[0] ? 0.04 : lerp(0.04, reachLen, outC(seg(s, T.hook[0], T.hook[1])));
    const carrying = s >= T.hook[1];
    const target = carrying ? (s > T.away[0] ? -0.28 * sm(seg(s, T.away[0], T.away[0] + 0.6)) : 0) : 0;
    swing += (target - swing) * 0.08;
    const wob = carrying ? Math.sin((s - T.hook[1]) * 4.2) * 0.06 * Math.exp(-(s - T.lift[0]) * 0.8) : 0;
    const th = swing + (s > T.lift[0] ? wob : 0);
    d.rig.position.set(0, -belly, 0); d.rig.rotation.set(0, 0, th - bank);
    d.cable.scale.y = cl; d.hook.position.y = -cl;

    if (carrying) { // robot hangs from the hook by its antenna loop
      const len = cl + d.hookDrop;
      const px = x + belly * Math.sin(bank) + d.RH * Math.cos(th) + len * Math.sin(th);
      const py = y - belly * Math.cos(bank) + d.RH * Math.sin(th) - len * Math.cos(th);
      const h = robot.loopTop * RS;
      robot.root.position.set(px + h * Math.sin(th), py - h * Math.cos(th), z);
      robot.root.rotation.set(0, 0, th);
      robot.head.rotation.set(0, 0, 0);
      const air = clamp01((robot.root.position.y - FEET) / 0.25);
      robot.shadow.material.opacity *= 1 - air;
      if (s > T.lift[0]) robot.legs.forEach((l, i) => { l.rotation.x = Math.sin(s * 5 + i * 1.7) * 0.25; });
    }
    // props always spinning
    d.props.forEach((p, i) => { p.rotation.y = s * (i % 2 ? -46 : 46); });
    const blink = (s * 1000) % 2700 < 110 ? 0.15 : 1;
    d.eye.forEach((e) => { e.scale.x = blink; });
    // its shadow on the sill
    d.shadow.visible = vis && s < T.away[0] + 0.4;
    d.shadow.position.set(x + 0.02, FEET + 0.01, 0.0);
    const hgt = Math.max(0, y - FEET);
    d.shadow.scale.set(0.55 + hgt * 0.1, 0.06, 1);
    d.shadow.material.opacity = (dark ? 0.3 : 0.1) * clamp01(1.6 - hgt * 0.5) * clamp01((z + 2) / 2);
  }

  /* ---------- Loop, controls ---------- */
  let s = 0, last = performance.now(), raf = 0, done = false, visible = true, frozen = false;
  const io2 = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.05 });
  io2.observe(port);
  const opener = document.activeElement;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000); last = now; // keeps real time down to 10 fps
    if (!visible || document.hidden) return;
    if (!frozen) s += dt;
    robotPose(s); dronePose(s);
    renderer.render(scene, camera);
    const head = robot.root.position, hy = head.y + 0.95 * RS;
    const rp = toPage(head.x, hy, head.z), dp = toPage(drone.root.position.x, drone.root.position.y, drone.root.position.z);
    const dOn = s > T.go[0] && s < T.go[1];
    const dBottom = dOn ? bubble(bDrone, "go", true, dp) + 8 : 0;
    if (!dOn) bubble(bDrone, "go", false);
    const line = s > T.greet[0] && s < T.greet[1] ? "greet" : s > T.ask[0] && s < T.ask[1] ? "ask" : s > T.bye[0] && s < T.bye[1] ? "bye" : null;
    if (line) bubble(bRobot, line, true, rp, dBottom); else bubble(bRobot, null, false);
    if (s > T.close) finish();
  }
  function finish() {
    if (done) return; done = true;
    root.classList.add("is-closing");
    bRobot.classList.remove("is-on"); bDrone.classList.remove("is-on");
    document.removeEventListener("keydown", onKey);
    removeEventListener("resize", onResize);
    if (root.contains(document.activeElement) && opener && opener.focus) opener.focus({ preventScroll: true });
    setTimeout(() => {
      cancelAnimationFrame(raf); io2.disconnect();
      renderer.dispose(); renderer.forceContextLoss();
      root.remove();
    }, 700);
  }
  const onKey = (e) => { if (e.key === "Escape") finish(); };
  let rz = 0;
  const onResize = () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(size); };
  closeBtn.addEventListener("click", finish);
  document.addEventListener("keydown", onKey);
  addEventListener("resize", onResize);

  robotPose(0); dronePose(0);
  requestAnimationFrame(() => { root.classList.add("is-open"); last = performance.now(); raf = requestAnimationFrame(frame); });
  /* Test hook: read the story clock, or freeze it on a beat for screenshots. */
  window.__welcome = { finish, time: () => s, hold: (v) => { s = v; frozen = true; }, resume: () => { frozen = false; } };
}

function start() {
  if (seen() && !forced()) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { markSeen(); loadCss().then(staticNote); return; }
  if (!webgl()) return;
  markSeen();
  play().catch(() => {});
}

/* After the page has loaded and painted, in an idle slot. */
function later() {
  const go = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300));
  if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
}
later();
