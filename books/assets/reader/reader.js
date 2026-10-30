/* 3D book reader for the chapter-1 sample.
   Flow: the card cover flies in (FLIP + WAAPI), the 3D cover opens, then a flat
   spread takes over for page turning (StPageFlip, MIT, vendored at v2.0.7 from the
   npm tarball, see vendor/). A drawn hand follows the pointer and holds the page.
   Data-driven: a book gets the page reader when it has `reader: { dir, pages }` and
   pages exist at pages/<dir>/<es|en>/p-NN.webp. Any other book opens to a detail
   spread (inside cover + title, sample and formats). The origin is a catalog cover
   (kind "cover") or a shelf spine (kind "spine"); closing flies the book back there. */
import { PageFlip } from "./vendor/page-flip-2.0.7.module.min.js";

const PAGE_W = 770, PAGE_H = 990; /* default trim; a book's reader entry may set w/h */
const EASE_OPEN = "cubic-bezier(.77,0,.175,1)";
const STR = {
  es: {
    sample: "Muestra: capítulo 1", close: "Cerrar la muestra", prev: "Página anterior", next: "Página siguiente",
    page: (x, n) => `Página ${x} de ${n}`, pages: (a, b, n) => `Páginas ${a} y ${b} de ${n}`,
    cover: "Portada", end: "Fin de la muestra", endTitle: "Fin de la muestra: capítulo 1",
    endText: "El libro completo continúa en Amazon.", skip: "Saltar la demostración",
    view3d: "Ver en 3D", view3dLabel: "Ver la escena del capítulo 1 en 3D",
    edition: { es: "Edición en español", en: "Edición en inglés" }
  },
  en: {
    sample: "Sample: chapter 1", close: "Close the sample", prev: "Previous page", next: "Next page",
    page: (x, n) => `Page ${x} of ${n}`, pages: (a, b, n) => `Pages ${a} and ${b} of ${n}`,
    cover: "Cover", end: "End of the sample", endTitle: "End of the sample: chapter 1",
    endText: "The full book continues on Amazon.", skip: "Skip the demo",
    view3d: "View in 3D", view3dLabel: "View the chapter 1 scene in 3D",
    edition: { es: "Spanish edition", en: "English edition" }
  }
};
const ICON = {
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  cube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>'
};
/* Line-art hand, two poses (point, pinch). Coordinates are px; each pose has its own hotspot. */
const HAND =
  '<div class="rd__hand-in">' +
  '<svg class="rd__hand-point" viewBox="0 0 48 56" aria-hidden="true">' +
    '<path d="M14 28V5.5a3 3 0 0 1 6 0V19.5a3 3 0 0 1 6 0V22a3 3 0 0 1 6 0v3a2.6 2.6 0 0 1 5.2 0V38c0 7-4.6 12.5-11.6 12.5h-4.2c-4.4 0-7.4-2.3-9.6-6.2L5.1 34.7a2.9 2.9 0 0 1 4.6-3.4L14 36.2Z"/>' +
    '<path class="rd__crease" d="M20 19.5V27M26 22v5.5M32 25v4M16.4 6.8h1.2"/>' +
  '</svg>' +
  '<svg class="rd__hand-pinch" viewBox="0 0 48 56" aria-hidden="true">' +
    '<path class="rd__to" d="M15 41C11.2 34 9.4 26 9.8 18.4"/><path class="rd__ti" d="M15 41C11.2 34 9.4 26 9.8 18.4"/>' +
    '<path class="rd__to" d="M20 29.5C19.6 21 18.6 12.6 14.4 10.8 12.2 9.9 10.6 11.6 10.9 14.6"/><path class="rd__ti" d="M20 29.5C19.6 21 18.6 12.6 14.4 10.8 12.2 9.9 10.6 11.6 10.9 14.6"/>' +
    '<path class="rd__crease" d="M18.4 18.6c-1 .4-2 .4-3 0"/>' +
    '<path d="M13.6 30c0-2 1.4-3.6 3.2-4 .9-1.2 2-1.9 3.4-1.9 1.4 0 2.6.9 3.1 2.1.5-1.6 1.9-2.6 3.5-2.6 1.6 0 2.9 1 3.4 2.4.6-1.3 1.9-2.1 3.3-2.1 2 0 3.6 1.6 3.6 3.6V38c0 7-4.6 12.5-11.6 12.5h-4.2c-4.4 0-7.4-2.3-9.6-6.2L11.4 39Z"/>' +
    '<path class="rd__crease" d="M22.5 26.4v4M29 26.2v4"/>' +
  '</svg></div>';

const mq = (q) => window.matchMedia(q).matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pad2 = (n) => String(n).padStart(2, "0");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let active = null;

/** Open the reader. opts: { book, edition, uiLang, origin, kind, coverSrc, labels }. */
export function open(opts) {
  if (active || !opts || !opts.book) return active;
  active = new Reader(opts);
  return active;
}

class Reader {
  constructor(o) {
    this.o = o;
    this.b = o.book;
    this.ed = o.edition === "en" ? "en" : "es";
    this.L = o.uiLang === "en" ? "en" : "es";
    this.s = STR[this.L];
    this.lab = o.labels || {};
    this.reduce = mq("(prefers-reduced-motion: reduce)");
    this.fine = mq("(hover: hover) and (pointer: fine)");
    this.detail = !this.b.reader;
    this.kind = o.kind === "spine" ? "spine" : "cover";
    this.n = this.detail ? 0 : this.b.reader.pages;
    this.pgW = (this.b.reader && this.b.reader.w) || PAGE_W;
    this.pgH = (this.b.reader && this.b.reader.h) || PAGE_H;
    this.ratio = this.pgW / this.pgH;
    this.total = this.n + 1; /* + end-of-sample page */
    this.base = this.detail ? "" : new URL(`pages/${this.b.reader.dir}/${this.ed}/`, import.meta.url).href;
    this.hand = { x: 0, y: 0, tx: 0, ty: 0, on: false };
    this.pressed = false;
    this.inertEls = [];
    this.build();
    this.lock();
    this.layout();
    if (!this.detail) this.initFlip();
    this.bind();
    this.root.focus({ preventScroll: true });
    if (this.reduce) this.fadeIn(); else this.intro();
  }

  url(i) { return `${this.base}p-${pad2(i + 1)}.webp`; }

  build() {
    const b = this.b, s = this.s, ed = this.ed;
    const root = document.createElement("div");
    root.className = "rd";
    root.tabIndex = -1;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "rd-title");
    root.setAttribute("lang", this.L);
    root.style.setProperty("--hue", b.hue);
    root.style.setProperty("--spine", b.hue);
    root.dataset.phase = "out";
    root.toggleAttribute("data-detail", this.detail);
    root.innerHTML =
      '<div class="rd__backdrop"></div>' +
      '<div class="rd__top"><p class="rd__meta" id="rd-title"><span lang="' + ed + '">' + esc(b.title[ed]) + '</span> <span>· ' + esc(s.sample) + '</span></p>' +
        '<button type="button" class="rd__btn rd__3dbtn" aria-label="' + esc(s.view3dLabel) + '">' + ICON.cube + '<span aria-hidden="true">' + esc(s.view3d) + '</span></button>' +
        '<button type="button" class="rd__btn rd__close" aria-label="' + esc(s.close) + '">' + ICON.close + '</button></div>' +
      '<div class="rd__stage"><div class="rd__book">' +
        '<div class="rd__under"><i class="rd__edge rd__edge--l"></i><i class="rd__edge rd__edge--r"></i></div>' +
        '<div class="rd__flip"></div>' +
        '<div class="rd__3d"><div class="rd__body">' +
          '<div class="rd__f rd__back"></div><div class="rd__f rd__spine"><span>' + esc(b.short ? b.short[ed] : "") + '</span></div>' +
          '<div class="rd__f rd__fore"></div><div class="rd__f rd__head"></div><div class="rd__f rd__tail"></div>' +
          '<div class="rd__f rd__inside"><i class="rd__shade"></i></div>' +
          '<div class="rd__cover"><div class="rd__f rd__cover-front"><i class="rd__shade"></i></div><div class="rd__f rd__cover-back"><i class="rd__shade"></i></div></div>' +
        '</div></div>' +
      '</div></div>' +
      '<div class="rd__bar">' +
        '<button type="button" class="rd__btn rd__prev" aria-label="' + esc(s.prev) + '">' + ICON.prev + '</button>' +
        '<p class="rd__count" aria-live="polite" aria-atomic="true"></p>' +
        '<button type="button" class="rd__btn rd__next" aria-label="' + esc(s.next) + '">' + ICON.next + '</button>' +
      '</div>' +
      '<button type="button" class="rd__skip" hidden>' + esc(s.skip) + '</button>' +
      '<div class="rd__hand" aria-hidden="true">' + HAND + '</div>';
    const q = (c) => root.querySelector(c);
    Object.assign(this, {
      root, bookEl: q(".rd__book"), flipEl: q(".rd__flip"), d3: q(".rd__3d"), body: q(".rd__body"),
      cover: q(".rd__cover"), coverFront: q(".rd__cover-front"), coverBack: q(".rd__cover-back"), inside: q(".rd__inside"),
      count: q(".rd__count"), prevBtn: q(".rd__prev"), nextBtn: q(".rd__next"), closeBtn: q(".rd__close"), btn3d: q(".rd__3dbtn"),
      skipBtn: q(".rd__skip"), handEl: q(".rd__hand"), under: q(".rd__under")
    });

    document.body.appendChild(root);
    if (this.detail) { this.buildDetail(); return; }

    /* Pages: images load lazily (see onPage), plus the end-of-sample page. */
    this.imgs = [];
    this.pages = [];
    for (let i = 0; i < this.n; i++) {
      const p = document.createElement("div");
      p.className = "rd__pg";
      const img = new Image(this.pgW, this.pgH);
      img.alt = "";
      img.decoding = "async";
      img.draggable = false;
      img.dataset.src = this.url(i);
      img.addEventListener("load", () => img.classList.add("is-in"));
      p.appendChild(img);
      this.imgs.push(img);
      this.pages.push(p);
    }
    const buy = this.buyLinks("rd__buy", "-1");
    const end = document.createElement("div");
    end.className = "rd__pg rd__end";
    end.innerHTML = '<div class="rd__end-in"><div class="rd__end-mark"></div>' +
      '<p class="rd__end-kicker" lang="' + ed + '">' + esc(b.title[ed]) + '</p>' +
      '<h3>' + esc(this.s.endTitle) + '</h3><p class="rd__end-text">' + esc(this.s.endText) + '</p>' +
      '<div class="rd__end-buy">' + buy + '</div><p class="rd__end-ed">' + esc(this.s.edition[ed]) + '</p></div>';
    this.pages.push(end);
    this.endLinks = Array.from(end.querySelectorAll("a"));
  }

  buyLinks(cls, tab) {
    const b = this.b, ed = this.ed, a = b.amazon[ed], lab = this.lab;
    return [["kindle", " " + cls + "--main"], ["paperback", ""], ["hardcover", ""]].map(([k, c]) =>
      '<a class="' + cls + c + '" href="' + esc(a[k]) + '" target="_blank" rel="noopener"' + (tab ? ' tabindex="' + tab + '"' : "") + ' aria-label="' +
      esc((lab[k] || k) + ", " + b.title[ed] + (lab.amazonOpens || "")) + '">' + esc(lab[k] || k) + "</a>").join("");
  }

  /* Detail spread for books without sample pages: inside cover + a title page. */
  buildDetail() {
    const b = this.b, ed = this.ed, lab = this.lab;
    this.coverBack.insertAdjacentHTML("beforeend",
      '<div class="rd__ic"><span class="rd__ic-band"></span><p class="rd__ic-series">' + esc(lab.series || "") + '</p>' +
      '<span class="rd__ic-rule"></span><p class="rd__ic-by">' + esc(lab.by || "") + '</p></div>');
    const sample = b.sample && b.sample[ed]
      ? '<a class="rd__d-sample" href="' + esc(b.sample[ed]) + '" type="application/pdf"><span aria-hidden="true"></span>' + esc(lab.sample || "") + '</a>' : "";
    const labs = b.labs ? '<a class="rd__d-labs" href="' + esc(b.labs) + '" target="_blank" rel="noopener">' + esc(lab.labs || "") + '</a>' : "";
    const html =
      '<div class="rd__d">' +
        '<p class="rd__d-topic"><i aria-hidden="true">' + esc(b.step) + '</i>' + esc(b.topic ? b.topic[this.L] : "") + '</p>' +
        '<h3 class="rd__d-title" lang="' + ed + '">' + esc(b.title[ed]) + '</h3>' +
        '<p class="rd__d-sub" lang="' + ed + '">' + esc(b.subtitle ? b.subtitle[ed] : "") + '</p>' +
        sample + '<div class="rd__d-buy">' + this.buyLinks("rd__buy") + '</div>' + labs +
        '<p class="rd__d-ed">' + esc(this.s.edition[ed]) + '</p>' +
      '</div>';
    /* The 3D copy is only seen during the flight; once open, a flat copy aligned on top
       takes pointer and keyboard input (hit-testing inside preserve-3d is unreliable). */
    this.inside.insertAdjacentHTML("beforeend", html);
    const ghost = this.inside.querySelector(".rd__d");
    ghost.setAttribute("aria-hidden", "true");
    ghost.querySelectorAll("a").forEach((a) => { a.tabIndex = -1; });
    this.dpage = document.createElement("div");
    this.dpage.className = "rd__dpage";
    this.dpage.innerHTML = html;
    this.bookEl.appendChild(this.dpage);
  }

  /* Scroll lock + inert background. A mobile nav menu left open is closed first,
     through its own button so its script keeps aria-expanded in sync. */
  lock() {
    const openMenu = document.querySelector(".nav.is-open .nav__menu");
    if (openMenu) openMenu.click();
    const de = document.documentElement, sw = window.innerWidth - de.clientWidth;
    this.prevPad = document.body.style.paddingRight;
    if (sw > 0) document.body.style.paddingRight = sw + "px";
    de.classList.add("rd-lock");
    document.body.classList.add("rd-lock");
    Array.from(document.body.children).forEach((el) => {
      if (el !== this.root && !el.inert && el.tagName !== "SCRIPT") { el.inert = true; this.inertEls.push(el); }
    });
  }

  unlock() {
    document.documentElement.classList.remove("rd-lock");
    document.body.classList.remove("rd-lock");
    document.body.style.paddingRight = this.prevPad || "";
    this.inertEls.forEach((el) => { el.inert = false; });
  }

  layout() {
    const vw = window.innerWidth, vh = window.innerHeight, small = vw <= 520;
    this.single = vw < 760 || vh > vw * 1.05;
    const chrome = (small ? 56 + 68 + 10 : 64 + 76 + 28);
    const availW = vw - (this.single ? 32 : 112);
    const pw = Math.floor(Math.max(120, Math.min(this.single ? availW : availW / 2, (vh - chrome) * this.ratio)));
    const ph = Math.floor(pw / this.ratio);
    this.pw = pw; this.ph = ph; this.W = this.single ? pw : pw * 2;
    Object.assign(this.bookEl.style, { width: this.W + "px", height: ph + "px" });
    this.setBox(this.boxState === "cover" ? this.coverBox() : this.pageBox());
    if (this.dpage) Object.assign(this.dpage.style, { left: (this.single ? 0 : pw) + "px", width: pw + "px", height: ph + "px" });
    this.d3.style.setProperty("--t", (this.tSpine || Math.max(10, Math.round(pw * 0.07))) + "px");
    this.root.style.setProperty("--pw", pw + "px");
    this.root.toggleAttribute("data-single", this.single);
    this.root.style.setProperty("--hs", Math.min(2, Math.max(1.3, pw / 300)).toFixed(2));
  }

  initFlip() {
    const pf = new PageFlip(this.flipEl, {
      width: this.pw, height: this.ph, size: "fixed", autoSize: false,
      showCover: true, usePortrait: true, startPage: this.single ? 2 : 1, /* single: skip the blank inside cover */
      drawShadow: true, maxShadowOpacity: 0.42, flippingTime: this.reduce ? 1 : 900,
      mobileScrollSupport: false, swipeDistance: 24,
      showPageCorners: !this.reduce, useMouseEvents: !this.reduce
    });
    pf.loadFromHTML(this.pages);
    pf.on("flip", (e) => this.onPage(e.data));
    pf.on("changeState", (e) => this.onState(e.data));
    pf.on("changeOrientation", () => { this.markSides(); this.onPage(pf.getCurrentPageIndex()); });
    this.pf = pf;
    this.markSides();
    this.onPage(pf.getCurrentPageIndex());
  }

  landscape() { return this.pf && this.pf.getOrientation() === "landscape"; }

  markSides() {
    const land = this.landscape();
    this.pages.forEach((p, i) => {
      p.classList.toggle("is-cover", i === 0);
      p.classList.toggle("is-l", land && i > 0 && i % 2 === 1);
      p.classList.toggle("is-r", i > 0 && (!land || i % 2 === 0));
    });
  }

  load(i) {
    const img = this.imgs[i];
    if (!img || !img.dataset.src) return;
    img.src = img.dataset.src;
    delete img.dataset.src;
  }

  onPage(i) {
    const land = this.landscape(), last = this.total - 1, n = this.n;
    let a, b;
    if (!land) { a = b = i; } else if (i === 0) { a = b = 0; } else { a = i % 2 ? i : i - 1; b = Math.min(a + 1, last); }
    this.spread = [a, b];
    /* Current spread, the previous one, and the next two spreads. */
    const ahead = land ? 4 : 2;
    for (let k = a - (land ? 2 : 1); k <= b + ahead; k++) this.load(k);
    const nums = [...new Set([a, b])].filter((x) => x < n).map((x) => x + 1);
    const endOn = b === last;
    let txt = nums.length === 2 ? this.s.pages(nums[0], nums[1], n) : nums.length ? this.s.page(nums[0], n) : "";
    if (a === 0) txt = this.s.cover + ", " + txt;
    if (endOn) txt = txt ? txt + " · " + this.s.end : this.s.end;
    this.count.textContent = txt;
    this.prevBtn.disabled = a <= 0;
    this.nextBtn.disabled = endOn;
    this.root.toggleAttribute("data-cover", land && a === 0);
    const prog = a / last;
    this.under.style.setProperty("--lt", (1 + Math.round(prog * 6)) + "px");
    this.under.style.setProperty("--rt", (1 + Math.round((1 - prog) * 6)) + "px");
    this.endLinks.forEach((l) => { l.tabIndex = endOn ? 0 : -1; });
  }

  onState(st) {
    this.state = st;
    if (st === "user_fold" && this.pressed) this.pose("pinch");
  }

  next() {
    if (!this.pf) return;
    if (this.reduce) { this.pf.turnToNextPage(); this.onPage(this.pf.getCurrentPageIndex()); }
    else this.pf.flipNext("bottom");
  }

  prev() {
    if (!this.pf) return;
    if (this.reduce) { this.pf.turnToPrevPage(); this.onPage(this.pf.getCurrentPageIndex()); }
    else this.pf.flipPrev("bottom");
  }

  /* ---------------- Intro: FLIP flight, then the Gloss-style cover opening ---------------- */
  /* Board sizes of the 3D book. While it flies (and until the cover is half open) it is
     cover-shaped: the cover image's own ratio, a touch taller than the page block, so the
     whole cover shows. It morphs to the page size while only the cover's blank back is in
     view, and back again when the book closes. */
  slot() { return this.single ? 0 : this.pw; }
  pageBox() { return { left: this.slot(), top: 0, width: this.pw, height: this.ph }; }
  coverBox() {
    const h = Math.round(this.ph * 1.015), w = Math.round(h * (this.coverRatio || 0.625));
    return { left: this.slot(), top: Math.round((this.ph - h) / 2), width: w, height: h };
  }
  boxFrame(b) { return { left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px" }; }
  setBox(b) { Object.assign(this.d3.style, this.boxFrame(b)); }
  /* Translation that centers the closed (cover-shaped) book in the stage. */
  closedShift() { return (this.single ? this.pw : this.pw * 2) / 2 - this.slot() - this.coverBox().width / 2; }

  setFaces() {
    const single = this.single;
    const cardImg = this.o.origin && this.o.origin.querySelector(".book__front img");
    const front = new Image();
    front.alt = "";
    front.src = (cardImg && cardImg.currentSrc) || this.o.coverSrc || this.url(0);
    this.coverFront.prepend(front);
    const ratioOf = (im) => (im && im.naturalWidth && im.naturalHeight ? im.naturalWidth / im.naturalHeight : 0);
    this.coverRatio = ratioOf(cardImg && cardImg.complete ? cardImg : null) || ratioOf(front.complete ? front : null) || 0;
    this.coverKnown = this.coverRatio ? Promise.resolve() : Promise.race([
      (front.decode ? front.decode() : Promise.resolve()).then(() => { this.coverRatio = ratioOf(front); }).catch(() => {}), wait(450)]);
    if (this.detail) return Promise.race([front.decode ? front.decode().catch(() => {}) : Promise.resolve(), wait(1200)]);
    const insideIdx = 2;
    this.load(insideIdx); this.load(1);
    const inside = new Image(); inside.alt = ""; inside.src = this.url(insideIdx);
    this.inside.appendChild(inside);
    if (!single) { const back = new Image(); back.alt = ""; back.src = this.url(1); this.coverBack.prepend(back); }
    const ready = [front, inside].map((im) => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()));
    return Promise.race([Promise.all(ready), wait(1200)]);
  }

  /* The element the book leaves from and returns to: the card's 3D book or the spine. */
  originEl() {
    const o = this.o.origin;
    if (!o) return null;
    return this.kind === "spine" ? o : (o.querySelector(".book") || o);
  }

  /* Transform that puts the 3D book exactly over its origin, in the stage frame.
     Cover: the card pose (rotateX 4, rotateY -24). Spine: rotateY 90, spine to the viewer. */
  originPose(z) {
    const el = this.originEl();
    const r = el && el.getBoundingClientRect();
    const pw = this.pw, cb = this.coverBox(), shift = this.closedShift();
    const br = this.bookEl.getBoundingClientRect();
    const cx = br.left + cb.left + cb.width / 2 + shift, cy = br.top + cb.top + cb.height / 2;
    if (!r || !r.width || r.bottom < 0 || r.top > window.innerHeight) return null;
    let s, dx, dy, rot;
    if (this.kind === "spine") {
      s = r.height / cb.height;
      const t = this.tSpine || Math.round(pw * 0.07);
      dx = r.left + r.width / 2 - cx + (t * s) / 2; dy = r.top + r.height / 2 - cy;
      rot = "rotateX(0deg) rotateY(90deg) rotateZ(0deg)";
    } else {
      s = r.width / cb.width;
      dx = r.left + r.width / 2 - cx; dy = r.top + r.height / 2 - cy;
      rot = "rotateX(4deg) rotateY(-24deg) rotateZ(0deg)";
    }
    return { dx, dy, s, k: `translate3d(${(dx + shift).toFixed(1)}px,${dy.toFixed(1)}px,${z || 0}px) scale(${s.toFixed(4)}) ${rot}` };
  }

  async intro() {
    const ready = this.setFaces();
    await this.coverKnown;
    if (this.closing) return;
    this.boxState = "cover";
    const cb = this.coverBox(), pb = this.pageBox();
    this.setBox(cb);
    const pw = this.pw, shift = this.closedShift();
    if (this.kind === "spine") {
      /* A shelf spine is wider than a page block would be at that scale: thicken the book. */
      const el = this.originEl(), r = el && el.getBoundingClientRect();
      if (r && r.height) { this.tSpine = Math.round(Math.min(r.width / (r.height / cb.height), pw * 0.13)); this.d3.style.setProperty("--t", this.tSpine + "px"); }
    }
    const pose = this.originPose();
    let k0, dx = 0, dy = 0;
    if (pose) {
      ({ dx, dy } = pose); k0 = pose.k;
      this.hiddenOrigin = this.originEl();
      this.hiddenOrigin.style.visibility = "hidden";
    } else {
      k0 = `translate3d(${shift}px,60px,-600px) scale(.5) rotateX(4deg) rotateY(-24deg) rotateZ(0deg)`;
    }
    const spine = this.kind === "spine";
    const kMid = spine
      ? `translate3d(${shift + dx * 0.3}px,${dy * 0.3 - 30}px,220px) scale(.8) rotateX(-6deg) rotateY(48deg) rotateZ(-2deg)`
      : `translate3d(${shift + dx * 0.1}px,${dy * 0.1 - 18}px,140px) scale(.86) rotateX(-7deg) rotateY(26deg) rotateZ(-2.5deg)`;
    const kEnd = `translate3d(${shift}px,0,40px) scale(.94) rotateX(-5deg) rotateY(14deg) rotateZ(-1.5deg)`;
    const kRest = "translate3d(0,0,0) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
    this.kEnd = kEnd; this.kRest = kRest;
    this.root.dataset.phase = "out";
    const fly = this.body.animate([{ transform: k0 }, { transform: kMid, offset: spine ? 0.5 : 0.55 }, { transform: kEnd }],
      { duration: spine ? 960 : 840, easing: "cubic-bezier(.22,.8,.24,1)", fill: "both" });
    this.anims = [fly];
    try { await fly.finished; await ready; } catch (e) { return; }
    if (this.closing) return;

    const t = { duration: 780, easing: EASE_OPEN, fill: "both" };
    const settle = this.body.animate([{ transform: kEnd }, { transform: kRest }], t);
    const open = this.cover.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }], t);
    const sF = this.coverFront.querySelector(".rd__shade").animate([{ opacity: 0 }, { opacity: 0.9 }], t);
    const sB = this.coverBack.querySelector(".rd__shade").animate([{ opacity: 0.75 }, { opacity: 0 }], t);
    const sI = this.inside.querySelector(".rd__shade").animate([{ opacity: 0.85 }, { opacity: 0.3, offset: 0.4 }, { opacity: 0 }], t);
    const extra = this.single ? [this.cover.animate([{ opacity: 1 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], t)] : [];
    /* Cover board to page size, only once the cover front has turned away. */
    const morph = this.d3.animate([this.boxFrame(cb), Object.assign(this.boxFrame(cb), { offset: 0.5 }), this.boxFrame(pb)], t);
    this.anims = [settle, open, sF, sB, sI, morph].concat(extra);
    try { await open.finished; } catch (e) { return; }
    this.boxState = "page";
    this.setBox(this.pageBox());
    if (this.closing) return;
    if (!this.detail) this.root.toggleAttribute("data-flat", true);
    this.root.dataset.phase = "open";
    this.opened = true;
    if (!this.detail) this.hint();
  }

  /* Optional living 3D scene (assets/scene/), loaded only when "Ver en 3D" is pressed.
     It lies over the pages, so "Hojear la muestra" (onSample) returns to the same page. */
  async openLiving() {
    if (this.living || this.livingBusy || this.closing) return;
    this.skipHint();
    this.livingBusy = true;
    this.btn3d.setAttribute("aria-busy", "true");
    let lv = null;
    try {
      const m = await (this.livingMod = this.livingMod || import("../scene/living.js?v=20261030d"));
      const ready = m.preload(this.b);
      if (ready && !this.closing) {
        lv = await m.mount({
          host: this.root, book: this.b, edition: this.ed, lang: this.L, ready,
          onSample: () => { this.living = null; this.btn3d.focus({ preventScroll: true }); },
          onClose: () => this.close()
        });
      }
    } catch (e) { lv = null; }
    this.livingBusy = false;
    this.btn3d.removeAttribute("aria-busy");
    if (lv && this.closing) { lv.destroy(); lv = null; }
    if (!lv) { if (!this.closing) { this.btn3d.hidden = true; this.root.focus({ preventScroll: true }); } return; }
    this.setHand(false);
    this.living = lv;
  }

  fadeIn() {
    if (this.detail) {
      this.setFaces();
      this.cover.style.transform = "rotateY(-180deg)";
      if (this.single) this.cover.style.opacity = "0";
    } else this.root.toggleAttribute("data-flat", true);
    this.root.dataset.phase = "open";
    this.root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "linear" });
    this.opened = true;
  }

  /* ---------------- First-open hint: the hand lifts the next corner and lets it fall ---------------- */
  async hint() {
    if (!this.fine || this.reduce) return;
    try { if (sessionStorage.getItem("rd-hint")) return; sessionStorage.setItem("rd-hint", "1"); } catch (e) { /* private mode */ }
    if (this.spread[1] >= this.total - 1) return;
    this.hinting = true;
    this.skipBtn.hidden = false;
    const r = this.bookEl.getBoundingClientRect(), W = this.W, pw = this.pw, ph = this.ph;
    const scr = (p) => ({ x: r.left + p.x, y: r.top + p.y });
    const corner = { x: W - 3, y: ph - 3 };
    let p = corner;
    try {
      const start = { x: r.right + 70, y: r.bottom + 60 };
      this.hand.x = this.hand.tx = start.x; this.hand.y = this.hand.ty = start.y;
      this.setHand(true);
      this.handEl.classList.remove("is-mirror");
      await this.step(250);
      await this.tween(start, scr({ x: corner.x - 6, y: corner.y - 6 }), 620, (q) => { this.hand.tx = q.x; this.hand.ty = q.y; });
      this.pose("pinch");
      await this.step(170);
      this.pf.startUserTouch(corner);
      const lift = { x: W - pw * 0.3, y: ph - ph * 0.2 };
      await this.tween(corner, lift, 760, (q) => { p = q; this.pf.userMove(q, false); const s = scr(q); this.hand.tx = s.x; this.hand.ty = s.y; });
      await this.step(260);
      this.pf.userStop(p);
      this.pose(null);
      const s0 = scr(p);
      await this.tween(s0, { x: s0.x + 40, y: s0.y + 36 }, 420, (q) => { this.hand.tx = q.x; this.hand.ty = q.y; });
      await this.step(300);
      this.setHand(false);
    } catch (e) {
      if (this.pf && this.pf.getState && this.pf.getState() === "user_fold") this.pf.userStop(p);
      this.pose(null);
    }
    this.hinting = false;
    this.skipBtn.hidden = true;
  }

  skipHint() { if (this.hinting) this.hintCancel = true; }

  step(ms) {
    return new Promise((res, rej) => {
      const t0 = performance.now();
      const f = () => {
        if (this.hintCancel || this.closing) return rej(new Error("skip"));
        if (performance.now() - t0 >= ms) return res();
        requestAnimationFrame(f);
      };
      f();
    });
  }

  tween(a, b, ms, fn) {
    return new Promise((res, rej) => {
      const t0 = performance.now();
      const f = (now) => {
        if (this.hintCancel || this.closing) return rej(new Error("skip"));
        const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        fn({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e });
        if (k < 1) requestAnimationFrame(f); else res();
      };
      requestAnimationFrame(f);
    });
  }

  /* ---------------- Virtual hand ---------------- */
  setHand(on) {
    if (on === this.hand.on) return;
    this.hand.on = on;
    if (on) { this.hand.x = this.hand.tx; this.hand.y = this.hand.ty; }
    this.root.classList.toggle("rd--hand", on);
  }

  pose(p) {
    this.handEl.classList.toggle("is-pinch", p === "pinch");
    this.handEl.classList.toggle("is-press", p === "press");
  }

  overBook(x, y) {
    const r = this.bookEl.getBoundingClientRect();
    let left = r.left;
    if (this.root.hasAttribute("data-cover")) left = r.left + r.width / 2;
    return x >= left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  tick() {
    const h = this.hand, k = this.pressed || this.hinting ? 0.6 : 0.34;
    h.x += (h.tx - h.x) * k; h.y += (h.ty - h.y) * k;
    this.handEl.style.transform = `translate3d(${h.x.toFixed(1)}px,${h.y.toFixed(1)}px,0)`;
    this.raf = requestAnimationFrame(() => this.tick());
  }

  onMove(e) {
    if (this.living) { this.setHand(false); return; }
    if (e.pointerType !== "mouse" || this.reduce || this.detail || this.closing) { this.setHand(false); return; }
    if (this.hinting) {
      const d = Math.hypot(e.movementX || 0, e.movementY || 0);
      if (d > 3) this.skipHint(); else return;
    }
    this.root.classList.remove("rd--kbd");
    this.hand.tx = e.clientX; this.hand.ty = e.clientY;
    const over = this.root.dataset.phase === "open" && (this.pressed || this.overBook(e.clientX, e.clientY));
    this.setHand(over);
    if (!this.single) {
      const r = this.bookEl.getBoundingClientRect();
      this.handEl.classList.toggle("is-mirror", e.clientX < r.left + r.width / 2);
    }
  }

  onDown(e) {
    if (this.living) return;
    this.skipHint();
    if (e.pointerType !== "mouse" || this.detail) { this.setHand(false); return; }
    if (!this.overBook(e.clientX, e.clientY) || e.target.closest("a,button")) return;
    this.pressed = true;
    const r = this.bookEl.getBoundingClientRect(), edge = Math.max(36, this.pw * 0.16);
    const near = e.clientX - r.left < edge || r.right - e.clientX < edge || e.clientY - r.top < edge * 0.8 || r.bottom - e.clientY < edge * 0.8;
    this.pose(near ? "pinch" : "press");
  }

  onUp() {
    if (!this.pressed) return;
    this.pressed = false;
    clearTimeout(this.relT);
    this.relT = setTimeout(() => { if (!this.pressed) this.pose(null); }, 140);
  }

  /* ---------------- Events, focus, resize, close ---------------- */
  bind() {
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); (this.offs = this.offs || []).push(() => t.removeEventListener(ev, fn, o)); };
    on(this.closeBtn, "click", () => this.close());
    on(this.btn3d, "click", () => this.openLiving());
    on(this.prevBtn, "click", () => this.prev());
    on(this.nextBtn, "click", () => this.next());
    on(this.skipBtn, "click", () => this.skipHint());
    on(this.root, "keydown", (e) => this.onKey(e));
    on(window, "pointermove", (e) => this.onMove(e), { passive: true });
    on(window, "pointerdown", (e) => this.onDown(e), true);
    on(window, "pointerup", () => this.onUp(), true);
    on(window, "pointercancel", () => this.onUp(), true);
    on(window, "resize", () => { clearTimeout(this.rzT); this.rzT = setTimeout(() => this.onResize(), 160); });
    on(this.root.querySelector(".rd__backdrop"), "click", () => this.close());
    if (this.detail) { /* no page turning */ } else if (!this.reduce) {
      /* StPageFlip picks the turn direction from the first drag sample, not from where
         the finger landed; seed the fold at the landing point (pinned v2.0.7 internals). */
      on(window, "touchmove", () => {
        const pf = this.pf, ui = pf.getUI(), fc = pf.getFlipController();
        if (pf.isUserTouch && !pf.isUserMove && fc && fc.calc === null && ui && ui.touchPoint) fc.fold(ui.touchPoint.point);
      }, { capture: true, passive: true });
      /* It also counts a swipe only inside 250 ms; a slower flick became a tap where the
         finger lifted. Re-time quick flicks (and taps that never curled) so the
         library's own swipe test decides the direction. */
      on(window, "touchstart", () => { this.touchT = performance.now(); this.forcedTurn = false; }, { capture: true, passive: true });
      on(window, "touchend", () => {
        const ui = this.pf.getUI(), flick = performance.now() - (this.touchT || 0) < 500;
        if (this.forcedTurn) { this.forcedTurn = false; if (ui) ui.touchPoint = null; return; }
        if (ui && ui.touchPoint && (flick || this.pf.getState() !== "user_fold")) ui.touchPoint.time = Date.now();
      }, true);
      /* Single page: the library only finishes a turn once the corner passes the page's far
         edge. Like a real page, finish it once it is pulled more than about halfway across.
         pointerup runs before the library's mouseup/touchend. */
      on(window, "pointerup", () => {
        const pf = this.pf;
        if (this.landscape() || pf.getState() !== "user_fold") return;
        const fc = pf.getFlipController(), c = fc && fc.calc;
        if (!c) return;
        const pos = c.getPosition(), rect = fc.getBoundsRect();
        if (pos.x > 0 && pos.x < rect.pageWidth * 0.55) {
          pf.isUserTouch = false; /* the library's own release handler now does nothing */
          this.forcedTurn = true;
          fc.animateFlippingTo(pos, { x: -rect.pageWidth, y: c.getCorner() === "bottom" ? rect.height : 0 }, true);
        }
      }, true);
    } else {
      this.bindReduced(on);
    }
    this.tick();
  }

  /* Reduced motion: no drag curl. Tap a half or swipe to swap pages instantly. */
  bindReduced(on) {
    let sx = null;
    on(this.bookEl, "pointerdown", (e) => { sx = e.clientX; });
    on(this.bookEl, "pointerup", (e) => {
      if (sx === null || e.target.closest("a,button")) { sx = null; return; }
      const dx = e.clientX - sx, r = this.bookEl.getBoundingClientRect();
      sx = null;
      if (Math.abs(dx) > 40) { if (dx < 0) this.next(); else this.prev(); return; }
      if (e.clientX < r.left + r.width * (this.single ? 0.35 : 0.5)) this.prev(); else this.next();
    });
  }

  onKey(e) {
    if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) { this.root.classList.add("rd--kbd"); this.skipHint(); }
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); this.close(); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); this.next(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); this.prev(); return; }
    if (e.key !== "Tab") return;
    const f = Array.from(this.root.querySelectorAll("button, a[href]")).filter((el) =>
      !el.disabled && !el.hidden && el.tabIndex >= 0 && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden");
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1], cur = document.activeElement;
    if (e.shiftKey && (cur === first || cur === this.root || !this.root.contains(cur))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (cur === last || !this.root.contains(cur))) { e.preventDefault(); first.focus(); }
  }

  onResize() {
    if (this.closing) return;
    this.layout();
    if (!this.pf) return;
    const s = this.pf.getSettings();
    s.width = this.pw; s.height = this.ph;
    this.pf.update();
    this.markSides();
    this.onPage(this.pf.getCurrentPageIndex());
  }

  close() {
    if (this.closing) return;
    this.closing = true;
    this.hintCancel = true;
    if (this.living) { this.living.destroy(true); this.living = null; }
    this.setHand(false);
    if (!this.reduce && this.opened && this.originPose()) { this.closeBook(); return; }
    this.root.dataset.phase = "leaving";
    (this.anims || []).forEach((a) => { try { a.pause(); } catch (e) { /* noop */ } });
    if (this.reduce) this.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
    setTimeout(() => this.destroy(), this.reduce ? 210 : 430);
  }

  /* Reverse of the intro: the book closes on the pages in view, flies back and lands
     on its origin (sliding into the slot for a shelf spine). */
  async closeBook() {
    const root = this.root, single = this.single, n = this.n;
    if (!this.detail) {
      const [a, b] = this.spread || [1, 2];
      const img = (host, i) => { let im = host.querySelector("img"); if (!im) { im = new Image(); im.alt = ""; host.prepend(im); } im.src = this.url(Math.max(0, Math.min(i, n - 1))); };
      if (single) img(this.inside, a); else { img(this.coverBack, a); img(this.inside, b); }
      root.removeAttribute("data-flat");
    }
    root.setAttribute("data-return", "");
    root.dataset.phase = "leaving";
    (this.anims || []).forEach((x) => { try { x.cancel(); } catch (e) { /* noop */ } });
    const kRest = this.kRest, kEnd = this.kEnd.replace("rotateY(14deg)", "rotateY(-10deg)").replace("rotateX(-5deg)", "rotateX(3deg)");
    const t = { duration: 700, easing: EASE_OPEN, fill: "both" };
    const shades = (sel, a, b) => this[sel].querySelector(".rd__shade").animate([{ opacity: a }, { opacity: b }], t);
    this.setBox(this.pageBox());
    const shut = [
      this.cover.animate([{ transform: "rotateY(-180deg)" }, { transform: "rotateY(0deg)" }], t),
      /* page size back to the cover board while only the cover's blank back is in view */
      this.d3.animate([this.boxFrame(this.pageBox()), Object.assign(this.boxFrame(this.coverBox()), { offset: 0.5 }), this.boxFrame(this.coverBox())], t),
      this.body.animate([{ transform: kRest }, { transform: kEnd }], t),
      shades("coverFront", 0.9, 0), shades("coverBack", 0, 0.75), shades("inside", 0, 0.85)
    ];
    if (single) shut.push(this.cover.animate([{ opacity: 0 }, { opacity: 1, offset: 0.55 }, { opacity: 1 }], t));
    this.anims = shut;
    try { await shut[0].finished; } catch (e) { /* noop */ }
    this.boxState = "cover";
    this.setBox(this.coverBox());
    const pose = this.originPose();
    if (!pose) { this.destroy(); return; }
    const spine = this.kind === "spine", shift = this.closedShift();
    const mid = spine
      ? `translate3d(${shift + pose.dx * 0.55}px,${pose.dy * 0.55 - 40}px,200px) scale(${((pose.s + 0.9) / 2).toFixed(3)}) rotateX(-4deg) rotateY(60deg) rotateZ(-1deg)`
      : `translate3d(${shift + pose.dx * 0.5}px,${pose.dy * 0.5 - 24}px,120px) scale(${((pose.s + 0.94) / 2).toFixed(3)}) rotateX(-3deg) rotateY(-30deg) rotateZ(-1.5deg)`;
    const frames = [{ transform: kEnd }, { transform: mid, offset: 0.5 }];
    if (spine) frames.push({ transform: this.originPose(90).k, offset: 0.8 });
    frames.push({ transform: pose.k });
    const fly = this.body.animate(frames, { duration: spine ? 900 : 760, easing: "cubic-bezier(.55,0,.25,1)", fill: "both" });
    this.anims.push(fly);
    try { await fly.finished; } catch (e) { /* noop */ }
    this.destroy();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.rzT); clearTimeout(this.relT);
    (this.offs || []).forEach((f) => f());
    try { const ui = this.pf.getUI(); if (ui && ui.removeHandlers) ui.removeHandlers(); this.pf.destroy(); } catch (e) { /* already gone */ }
    this.root.remove();
    this.unlock();
    if (this.hiddenOrigin) this.hiddenOrigin.style.visibility = "";
    const back = this.o.origin;
    if (back && back.focus) back.focus({ preventScroll: true });
    active = null;
  }
}
