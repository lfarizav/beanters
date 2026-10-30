/* Living scene: the first view when a book opens from the catalog or the shelf.
   Mounted by reader.js inside its dialog once the cover has flown in and opened.
   Two renderers, one scene (shapes.js + books/<id>.js):
   - WebGL (640 px and wider, motion allowed, WebGL2): engine.js, three.js from the import map.
   - SVG (narrower, reduced motion, no WebGL, or the CDN failed): a static ink drawing of the
     same objects with the same text and buttons; three.js is never requested.
   "Hojear la muestra" hands over to the reader underneath (page reader or detail spread). */
import { buildObject, flat } from "./shapes.js?v=20261030d";

const STR = {
  es: {
    chapter: "Capítulo 1", free: "muestra gratuita", close: "Cerrar el libro", objects: "Objetos de la analogía",
    prev: "Objeto anterior", next: "Objeto siguiente", play: "Recorrido", stop: "Detener", still: "Quieto",
    stillOn: "Animación detenida", stillOff: "Detener la animación", sample: "Hojear la muestra",
    buy: "Comprar en Amazon", opens: " (abre Amazon)", hint: "Toque un objeto del dibujo o un botón de esta página.",
    is: "es", drawing: "Dibujo en tinta de la analogía del capítulo 1: ", scene: "Escena del capítulo 1"
  },
  en: {
    chapter: "Chapter 1", free: "free sample", close: "Close the book", objects: "Objects in the analogy",
    prev: "Previous object", next: "Next object", play: "Tour", stop: "Stop", still: "Still",
    stillOn: "Animation stopped", stillOff: "Stop the animation", sample: "Browse the sample",
    buy: "Buy on Amazon", opens: " (opens Amazon)", hint: "Tap an object in the drawing or a button on this page.",
    is: "is", drawing: "Ink drawing of the chapter 1 analogy: ", scene: "Chapter 1 scene"
  }
};
const ICON = {
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10H7z"/></svg>',
  still: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5.5c3-1 6-1 8.5 1 2.5-2 5.5-2 8.5-1v13c-3-1-6-1-8.5 1-2.5-2-5.5-2-8.5-1z"/><path d="M12 6.5v13"/></svg>',
  out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M17 14v5H5V7h5"/></svg>',
  check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>'
};
const PAGE_W = 300, PAGE_H = 402;
const DATA = { kcna: "kcna", cka: "cka", ckad: "ckad", cks: "cks" };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const mq = (q) => window.matchMedia(q).matches;

let cssReady = null;
function loadCSS() {
  if (cssReady) return cssReady;
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.href = new URL("living.css", import.meta.url).href;
  cssReady = new Promise((ok) => { l.onload = l.onerror = ok; });
  document.head.appendChild(l);
  return cssReady;
}
function hasWebGL2() { try { return !!document.createElement("canvas").getContext("webgl2"); } catch (e) { return false; } }

/* Homography: pin the HTML page onto the projected left page (same math as the hero). */
function quadMatrix(wd, ht, p) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = p;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
  return "matrix3d(" + [a / wd, d / wd, 0, g / wd, b / ht, e / ht, 0, h / ht, 0, 0, 1, 0, x0, y0, 0, 1].map((n) => +n.toFixed(6)).join(",") + ")";
}

/** Preload what the scene needs while the cover is still flying. */
export function preload(book) {
  if (!DATA[book.id]) return null;
  const webgl = mq("(min-width: 640px)") && !mq("(prefers-reduced-motion: reduce)") && hasWebGL2();
  return Promise.all([
    import(`./books/${DATA[book.id]}.js?v=20261030d`).then((m) => m.default),
    webgl ? import("./engine.js?v=20261030d").catch(() => null) : Promise.resolve(null),
    loadCSS()
  ]);
}

/** opts: { host, book, edition, lang, ready (from preload), onSample, onClose, hide (elements to make inert) } */
export async function mount(opts) {
  const ready = opts.ready || preload(opts.book);
  if (!ready) return null;
  const [data, engineMod] = await ready;
  return new Living(opts, data, engineMod);
}

class Living {
  constructor(o, data, engineMod) {
    this.o = o; this.data = data; this.b = o.book;
    this.ed = o.edition === "en" ? "en" : "es";
    this.L = o.lang === "en" ? "en" : "es";
    this.s = STR[this.L];
    this.sel = -1; this.seen = new Set(); this.tour = 0;
    this.reduce = mq("(prefers-reduced-motion: reduce)");
    try { this.still = localStorage.getItem("bk-still") === "1"; } catch (e) { this.still = false; }
    this.objs = data.objects.map(buildObject);
    this.active = true;
    this.build();
    this.inert(true);
    this.bind();
    if (engineMod && engineMod.createLiving) this.startGL(engineMod); else this.startSVG();
    this.el.focus({ preventScroll: true });
    requestAnimationFrame(() => this.el.classList.add("is-in"));
  }

  T(o) { return o[this.ed] || o.es; }

  build() {
    const b = this.b, s = this.s, d = this.data, ed = this.ed;
    const el = document.createElement("div");
    el.className = "lv";
    el.tabIndex = -1;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "lv-title");
    el.setAttribute("lang", this.L);
    el.style.setProperty("--hue", b.hue);
    el.style.setProperty("--hue-l", b.hueLight);
    el.toggleAttribute("data-still", this.still);
    const kindle = b.amazon[ed].kindle;
    const checks = d.objects.map((x, i) =>
      '<li><button type="button" class="lv__chk" data-obj="' + i + '" aria-pressed="false">' +
      '<span class="lv__tick">' + ICON.check + '</span><span>' + esc(this.T(x.name)) + '</span></button></li>').join("");
    const dots = d.objects.map((x, i) =>
      '<button type="button" class="capsule__dot lv__dot" data-obj="' + i + '" aria-pressed="false" aria-label="' + esc(this.T(x.name) + ": " + this.T(x.concept)) + '"><span></span><em lang="' + ed + '">' + esc(this.T(x.name)) + '</em></button>').join("");
    const twin = '<div class="sr-only" lang="' + ed + '"><p>' + esc(s.drawing + this.T(d.chapter)) + '</p><p>' + esc(this.T(d.intro)) + '</p><ul>' +
      d.objects.map((x) => '<li>' + esc(this.T(x.name) + " " + (STR[ed] || s).is + " " + this.T(x.concept) + ". " + this.T(x.lines).join(" ")) + '</li>').join("") + '</ul></div>';
    el.innerHTML =
      '<div class="lv__stage">' +
        '<canvas class="lv__canvas" aria-hidden="true"></canvas>' +
        '<div class="lv__spread">' +
          '<div class="lv__page" style="width:' + PAGE_W + 'px;height:' + PAGE_H + 'px">' +
            '<p class="lv__kicker"><i aria-hidden="true">1</i>' + esc(s.chapter) + ' · ' + esc(s.free) + '</p>' +
            '<h2 class="lv__title" id="lv-title" lang="' + ed + '">' + esc(b.title[ed]) + '</h2>' +
            '<p class="lv__chap" lang="' + ed + '">' + esc(this.T(d.chapter)) + '</p>' +
            '<div class="lv__focus" aria-hidden="true" lang="' + ed + '"></div>' +
            '<ul class="lv__checks" aria-label="' + esc(s.objects) + '" lang="' + ed + '">' + checks + '</ul>' +
          '</div>' +
          '<div class="lv__paper"><div class="lv__svg"></div></div>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="lv__close" aria-label="' + esc(s.close) + '">' + ICON.close + '</button>' +
      '<div class="lv__cap-wrap"><div class="capsule lv__cap" role="group" aria-label="' + esc(s.scene) + '">' +
        '<div class="lv__row">' +
          '<button type="button" class="capsule__arrow" data-cap="prev" aria-label="' + esc(s.prev) + '">' + ICON.prev + '</button>' +
          '<div class="capsule__dots" role="group" aria-label="' + esc(s.objects) + '">' + dots + '</div>' +
          '<button type="button" class="capsule__arrow" data-cap="next" aria-label="' + esc(s.next) + '">' + ICON.next + '</button>' +
        '</div>' +
        '<div class="lv__row lv__row--act">' +
          '<button type="button" class="lv__btn" data-cap="play" aria-pressed="false">' + ICON.play + '<span>' + esc(s.play) + '</span></button>' +
          '<button type="button" class="lv__btn" data-cap="still" aria-pressed="' + this.still + '" title="' + esc(this.still ? s.stillOn : s.stillOff) + '">' + ICON.still + '<span>' + esc(s.still) + '</span></button>' +
          '<button type="button" class="lv__btn lv__btn--sample" data-cap="sample">' + ICON.book + '<span>' + esc(s.sample) + '</span></button>' +
          '<a class="lv__btn lv__btn--buy" href="' + esc(kindle) + '" target="_blank" rel="noopener" aria-label="' + esc(s.buy + ", Kindle, " + b.title[ed] + s.opens) + '">' + ICON.out + '<span>' + esc(s.buy) + '</span></a>' +
        '</div>' +
      '</div></div>' +
      twin +
      '<p class="sr-only lv__live" aria-live="polite" aria-atomic="true"></p>';
    const q = (c) => el.querySelector(c);
    Object.assign(this, {
      el, stage: q(".lv__stage"), canvas: q(".lv__canvas"), page: q(".lv__page"), focusEl: q(".lv__focus"),
      svgHost: q(".lv__svg"), cap: q(".lv__cap"), live: q(".lv__live"), playBtn: q('[data-cap="play"]'), stillBtn: q('[data-cap="still"]')
    });
    this.o.host.appendChild(el);
    this.renderFocus();
  }

  /* The reader underneath stays out of reach while the scene is up. */
  inert(on) {
    if (on) {
      this.inerted = Array.from(this.o.host.children).filter((c) => c !== this.el && !c.inert);
      this.inerted.forEach((c) => { c.inert = true; });
    } else (this.inerted || []).forEach((c) => { c.inert = false; });
  }

  renderFocus() {
    const d = this.data, s = this.s;
    if (this.sel < 0) {
      this.focusEl.innerHTML = '<p class="lv__intro">' + esc(this.T(d.intro)) + '</p><p class="lv__hint">' + esc(s.hint) + '</p>';
    } else {
      const x = d.objects[this.sel];
      this.focusEl.innerHTML =
        '<p class="lv__map"><span class="lv__name">' + esc(this.T(x.name)) + '</span><span class="lv__arrow" aria-hidden="true"></span><span class="lv__concept">' + esc(this.T(x.concept)) + '</span></p>' +
        this.T(x.lines).map((l) => '<p class="lv__line">' + esc(l) + '</p>').join("");
    }
    this.focusEl.classList.remove("is-new"); void this.focusEl.offsetWidth; this.focusEl.classList.add("is-new");
  }

  select(i, from) {
    const n = this.data.objects.length;
    if (i >= n) i = n - 1;
    this.sel = i;
    if (i >= 0) this.seen.add(i);
    this.el.querySelectorAll("[data-obj]").forEach((btn) => {
      const k = +btn.getAttribute("data-obj");
      btn.setAttribute("aria-pressed", String(k === i));
      if (btn.classList.contains("lv__chk")) btn.classList.toggle("is-seen", this.seen.has(k));
    });
    this.renderFocus();
    if (this.gl) this.gl.select(i);
    if (this.svg) this.paintSVG();
    if (i >= 0) {
      const x = this.data.objects[i];
      this.live.textContent = this.T(x.name) + ": " + this.T(x.concept) + ". " + this.T(x.lines).join(" ");
    }
    if (from !== "tour") this.stopTour();
  }

  step(dir) {
    const n = this.data.objects.length;
    this.select(this.sel < 0 ? (dir > 0 ? 0 : n - 1) : (this.sel + dir + n) % n);
  }

  /* Auto tour: every object in the chapter's order, then stop. */
  playTour() {
    if (this.tour) { this.stopTour(); return; }
    const n = this.data.objects.length;
    let k = 0;
    const next = () => {
      if (!this.active) return;
      if (k >= n) { this.stopTour(); return; }
      this.select(k++, "tour");
      this.tour = setTimeout(next, this.still ? 2600 : 3400);
    };
    this.tour = -1;
    this.playBtn.setAttribute("aria-pressed", "true");
    this.playBtn.innerHTML = ICON.stop + "<span>" + esc(this.s.stop) + "</span>";
    next();
  }
  stopTour() {
    if (!this.tour) return;
    clearTimeout(this.tour); this.tour = 0;
    this.playBtn.setAttribute("aria-pressed", "false");
    this.playBtn.innerHTML = ICON.play + "<span>" + esc(this.s.play) + "</span>";
  }

  setStill(b) {
    this.still = b;
    try { localStorage.setItem("bk-still", b ? "1" : "0"); } catch (e) { /* private mode */ }
    this.el.toggleAttribute("data-still", b);
    this.stillBtn.setAttribute("aria-pressed", String(b));
    this.stillBtn.title = b ? this.s.stillOn : this.s.stillOff;
    if (this.gl) this.gl.setStill(b);
  }

  /* ---------- WebGL ---------- */
  startGL(mod) {
    this.mode = "webgl";
    this.el.dataset.mode = "webgl";
    try {
      this.gl = mod.createLiving({
        canvas: this.canvas, host: this.stage, data: this.data, hue: this.b.hue, hueLight: this.b.hueLight, still: this.still || this.reduce,
        safeRect: (w, h) => {
          const top = this.cap.getBoundingClientRect().top;
          return { left: 20, right: w - 20, top: 64, bottom: (top > 0 ? top : h - 120) - 18 };
        },
        onFrame: (quad) => { this.page.style.transform = quadMatrix(PAGE_W, PAGE_H, quad); this.page.classList.add("is-placed"); },
        onPick: (i) => { if (i >= 0) this.select(i); },
        onHover: (i) => this.el.querySelectorAll(".lv__dot").forEach((d, k) => d.classList.toggle("is-hover", k === i))
      });
      window.__living = this.gl;
    } catch (e) {
      this.gl = null;
      this.startSVG();
    }
  }

  /* ---------- SVG ---------- */
  startSVG() {
    this.mode = "svg";
    this.el.dataset.mode = "svg";
    const P = (p) => flat(p).map((v) => v.toFixed(2)).join(" ");
    const pathOf = (segs) => {
      let d = "", last = null;
      segs.forEach(([a, b]) => {
        const A = P(a), B = P(b);
        d += (A === last ? "" : "M" + A) + "L" + B;
        last = B;
      });
      return d;
    };
    const anchor = (o) => flat(o.anchor);
    const arcs = this.data.arcs.map(([a, b], k) => {
      const A = anchor(this.objs[a]), B = anchor(this.objs[b]);
      const C = [(A[0] + B[0]) / 2, Math.min(A[1], B[1]) - 10 - Math.hypot(A[0] - B[0], A[1] - B[1]) * 0.22];
      const d = "M" + A[0].toFixed(2) + " " + A[1].toFixed(2) + "Q" + C[0].toFixed(2) + " " + C[1].toFixed(2) + " " + B[0].toFixed(2) + " " + B[1].toFixed(2);
      return '<g class="lv-arc" data-arc="' + k + '"><path class="lv-arc__halo" d="' + d + '"/><path class="lv-arc__core" d="' + d + '"/>' +
        '<circle class="lv-arc__end" r="1.3" cx="' + B[0].toFixed(2) + '" cy="' + B[1].toFixed(2) + '"/></g>';
    }).join("");
    const objs = this.objs.map((o, i) => {
      const bb = o.bounds, top = Math.min(...o.segs.flat().map((p) => flat(p)[1]));
      const cx = (bb.x0 + bb.x1) / 2, cy = (top + bb.z1) / 2;
      return '<g class="lv-o" data-obj="' + i + '">' +
        '<ellipse class="lv-o__glow" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + ((bb.x1 - bb.x0) * 0.85 + 6).toFixed(1) + '" ry="' + ((bb.z1 - top) * 0.75 + 6).toFixed(1) + '"/>' +
        '<rect class="lv-o__hit" x="' + (bb.x0 - 3).toFixed(1) + '" y="' + (top - 3).toFixed(1) + '" width="' + (bb.x1 - bb.x0 + 6).toFixed(1) + '" height="' + (bb.z1 - top + 6).toFixed(1) + '"/>' +
        '<path class="lv-o__ink" d="' + pathOf(o.segs) + '"/></g>';
    }).join("");
    this.svgHost.innerHTML =
      '<svg class="lv-svg" viewBox="-4 -8 108 146" aria-hidden="true">' +
      '<defs><radialGradient id="lv-g"><stop offset="0" stop-color="var(--hue-l)" stop-opacity=".55"/><stop offset="1" stop-color="var(--hue-l)" stop-opacity="0"/></radialGradient></defs>' +
      objs + arcs + "</svg>";
    this.svg = this.svgHost.firstChild;
    this.svg.addEventListener("click", (e) => { const g = e.target.closest(".lv-o"); if (g) this.select(+g.getAttribute("data-obj")); });
    this.paintSVG();
  }

  paintSVG() {
    const i = this.sel;
    this.svg.querySelectorAll(".lv-o").forEach((g, k) => { g.classList.toggle("is-lit", k === i); g.classList.toggle("is-dim", i >= 0 && k !== i); });
    this.svg.querySelectorAll(".lv-arc").forEach((g, k) => {
      const [a, b] = this.data.arcs[k];
      g.classList.toggle("is-on", i >= 0 && (a === i || b === i));
    });
  }

  /* ---------- Events, focus, teardown ---------- */
  bind() {
    const offs = (this.offs = []);
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    on(this.el, "click", (e) => {
      const ob = e.target.closest("[data-obj]");
      if (ob && !ob.closest(".lv-svg")) { this.select(+ob.getAttribute("data-obj")); return; }
      const c = e.target.closest("[data-cap]");
      if (c) {
        const k = c.getAttribute("data-cap");
        if (k === "prev") this.step(-1);
        else if (k === "next") this.step(1);
        else if (k === "play") this.playTour();
        else if (k === "still") this.setStill(!this.still);
        else if (k === "sample") this.toSample();
        return;
      }
      if (e.target.closest(".lv__close")) this.o.onClose && this.o.onClose();
    });
    on(this.stage, "pointerdown", () => this.stopTour());
    on(this.el, "keydown", (e) => this.onKey(e));
  }

  onKey(e) {
    e.stopPropagation(); /* the reader underneath must not flip pages or trap focus meanwhile */
    if (e.key === "Escape") { e.preventDefault(); if (this.o.onClose) this.o.onClose(); return; }
    const inText = e.target.closest && e.target.closest("a, .lv__cap button");
    if (!inText && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { e.preventDefault(); this.step(e.key === "ArrowRight" ? 1 : -1); return; }
    if (e.key !== "Tab") return;
    const f = Array.from(this.el.querySelectorAll("button, a[href]")).filter((x) => !x.disabled && x.getClientRects().length && getComputedStyle(x).visibility !== "hidden");
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1], cur = document.activeElement;
    if (e.shiftKey && (cur === first || cur === this.el || !this.el.contains(cur))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (cur === last || !this.el.contains(cur))) { e.preventDefault(); first.focus(); }
  }

  toSample() {
    this.destroy(true);
    if (this.o.onSample) this.o.onSample();
  }

  destroy(fade) {
    if (!this.active) return;
    this.active = false;
    this.stopTour();
    (this.offs || []).forEach((f) => f());
    this.inert(false);
    const el = this.el, gl = this.gl;
    const end = () => { if (gl) gl.dispose(); el.remove(); };
    if (fade && !this.reduce) { el.classList.remove("is-in"); setTimeout(end, 260); } else end();
    if (window.__living === gl) window.__living = null;
  }
}
