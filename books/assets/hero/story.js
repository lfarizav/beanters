/* Hero story controller. Two renderers, one story:
   - WebGL (desktop, fine pointer, motion allowed, WebGL2): scene.js, pinned by
     position: sticky, progress read from native scroll.
   - SVG (mobile, reduced motion, no WebGL): the same drawing assembles with
     stroke-dashoffset as the text steps enter the viewport.
   The steps are real HTML in both modes (visible in SVG mode, sr-only in WebGL). */
(function () {
  "use strict";
  var C = window.Catalog, INK = window.CLUSTER_INK, BOOKS = window.BOOKS;
  var root = document.querySelector("[data-story]");
  if (!root || !C || !INK || !BOOKS) return;

  var T = {
    es: {
      capsule: "Recorrido por la serie", prev: "Capa anterior", next: "Capa siguiente",
      still: "Quieto", stillOn: "Animación detenida", stillOff: "Detener la animación",
      see: "Ver el libro", layer: "Capa ",
      introTitle: "Cuatro libros, un mismo clúster",
      introText: "Siga bajando: cada capa del dibujo es un libro de la serie, en el orden en que conviene leerlos.",
      lines: [
        "Primero el contorno: qué es un clúster y cómo encajan sus piezas.",
        "Después, el plano de control y los nodos: operar y mantener el clúster.",
        "Luego las cargas: pods y Deployments que llevan sus aplicaciones al clúster.",
        "Por último, las cercas: políticas y controles que protegen cada capa."
      ],
      drawing: "Dibujo de un clúster de Kubernetes: contorno y red, plano de control y nodos, pods y un Deployment, y cercas de seguridad."
    },
    en: {
      capsule: "Tour of the series", prev: "Previous layer", next: "Next layer",
      still: "Still", stillOn: "Animation stopped", stillOff: "Stop the animation",
      see: "See the book", layer: "Layer ",
      introTitle: "Four books, one cluster",
      introText: "Keep scrolling: each layer of the drawing is a book in the series, in the order they are best read.",
      lines: [
        "First the outline: what a cluster is and how its pieces fit together.",
        "Then the control plane and the nodes: running and maintaining the cluster.",
        "Next the workloads: Pods and Deployments that bring your applications to the cluster.",
        "Finally the fences: policies and controls that protect every layer."
      ],
      drawing: "Drawing of a Kubernetes cluster: outline and network, control plane and nodes, Pods and a Deployment, and security fences."
    }
  };
  function s(k) { return T[C.lang][k]; }
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var mq = {
    reduce: window.matchMedia("(prefers-reduced-motion: reduce)"),
    desktop: window.matchMedia("(min-width: 980px) and (hover: hover) and (pointer: fine)"),
    wide: window.matchMedia("(min-width: 980px)")
  };
  function hasWebGL2() {
    try { var c = document.createElement("canvas"); return !!c.getContext("webgl2"); } catch (e) { return false; }
  }
  var still = false;
  try { still = localStorage.getItem("bk-still") === "1"; } catch (e) {}

  var intro = root.querySelector(".story__intro");
  var track = root.querySelector(".story__track");
  var pin = root.querySelector(".story__pin");
  var stage = root.querySelector(".story__stage");
  var steps = root.querySelector(".story__steps");
  var page = root.querySelector(".story__page");
  var capsule = root.querySelector(".capsule");
  var poster = root.querySelector(".story__poster");
  var mode = "svg", scene = null, active = -1;

  /* ---------- SVG drawing (fallback renderer and the WebGL poster) ---------- */
  function svgDrawing() {
    var paths = INK.layers.map(function (polys, i) {
      var d = polys.map(function (p) {
        return "M" + p.map(function (pt) { return pt[0].toFixed(1) + " " + pt[1].toFixed(1); }).join("L");
      }).join("");
      return '<path class="ink ink--' + i + '" style="--hue:' + BOOKS[i].hue + '" pathLength="1" d="' + d + '"/>' +
             '<path class="sketch" d="' + d + '"/>';
    }).join("");
    return '<svg class="drawing" viewBox="0 0 ' + INK.W + " " + INK.H + '" role="img" aria-label="' + esc(s("drawing")) + '">' + paths + "</svg>";
  }

  function renderSteps() {
    steps.innerHTML = BOOKS.map(function (b, i) {
      return '<li class="story-step" id="story-step-' + i + '" data-step="' + i + '" style="--hue:' + b.hue + ";--hue-l:" + b.hueLight + '">' +
        '<p class="story-step__topic"><i aria-hidden="true">' + b.step + "</i>" + esc(b.topic[C.lang]) + "</p>" +
        '<h2 class="story-step__title">' + esc(b.title[C.lang]) + "</h2>" +
        '<p class="story-step__line">' + esc(s("lines")[i]) + "</p>" +
        '<a class="story-step__link" href="#' + b.anchor + '" data-goto="' + b.anchor + '">' + esc(s("see")) + "</a></li>";
    }).join("");
  }

  function renderCapsule() {
    capsule.setAttribute("aria-label", s("capsule"));
    capsule.innerHTML =
      '<button type="button" class="capsule__arrow" data-cap="prev" aria-label="' + esc(s("prev")) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<div class="capsule__dots">' + BOOKS.map(function (b, i) {
        return '<button type="button" class="capsule__dot" data-cap="' + i + '" style="--hue:' + b.hue + ";--hue-l:" + b.hueLight + '" aria-label="' + esc(s("layer") + b.step + ": " + b.topic[C.lang]) + '" aria-current="' + (i === active ? "step" : "false") + '"><span></span><em>' + esc(b.topic[C.lang]) + "</em></button>";
      }).join("") + "</div>" +
      '<button type="button" class="capsule__arrow" data-cap="next" aria-label="' + esc(s("next")) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '<button type="button" class="capsule__still" data-cap="still" aria-pressed="' + still + '" title="' + esc(still ? s("stillOn") : s("stillOff")) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>' + esc(s("still")) + "</button>";
  }

  function renderPage() {
    if (!page) return;
    if (active < 0) {
      page.innerHTML = '<div class="page-copy"><h2 class="page-copy__title">' + esc(s("introTitle")) + '</h2><p class="page-copy__line">' + esc(s("introText")) + "</p></div>";
      return;
    }
    var b = BOOKS[active];
    page.innerHTML = '<div class="page-copy" style="--hue:' + b.hue + '">' +
      '<p class="page-copy__topic"><i aria-hidden="true">' + b.step + "</i>" + esc(b.topic[C.lang]) + "</p>" +
      '<h2 class="page-copy__title">' + esc(b.title[C.lang]) + "</h2>" +
      '<p class="page-copy__line">' + esc(s("lines")[active]) + "</p>" +
      '<a class="page-copy__link" href="#' + b.anchor + '" data-goto="' + b.anchor + '">' + esc(s("see")) + "</a></div>";
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    root.setAttribute("data-layer", String(i));
    capsule.querySelectorAll(".capsule__dot").forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "step" : "false"); });
    steps.querySelectorAll(".story-step").forEach(function (el, k) { el.classList.toggle("is-active", k === i); });
    renderPage();
  }

  /* ---------- Homography: pin the HTML page copy onto the 3D left page ---------- */
  function quadMatrix(wd, ht, p) {
    var x0 = p[0][0], y0 = p[0][1], x1 = p[1][0], y1 = p[1][1], x2 = p[2][0], y2 = p[2][1], x3 = p[3][0], y3 = p[3][1];
    var dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    var den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
    var a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3, f = y0;
    return "matrix3d(" + [a / wd, d / wd, 0, g / wd, b / ht, e / ht, 0, h / ht, 0, 0, 1, 0, c, f, 0, 1].map(function (n) { return +n.toFixed(6); }).join(",") + ")";
  }
  var PW = 290, PH = 389;
  function onFrame(quad) { page.style.transform = quadMatrix(PW, PH, quad); page.classList.add("is-placed"); }

  /* Where the 3D book may sit: right of the intro copy, inside the content column
     with a 48 px margin, below the nav and above the capsule. */
  function safeRect(w, h) {
    var pad = Math.min(28, Math.max(16, w * 0.04)), col = Math.min(w, 1120);
    var colRight = (w + col) / 2 - pad, introRight = 0;
    Array.prototype.forEach.call(intro.children, function (c) { introRight = Math.max(introRight, c.getBoundingClientRect().right); });
    var cap = capsule.getBoundingClientRect(), pinTop = pin.getBoundingClientRect().top;
    return {
      left: introRight + 40,
      right: Math.min(colRight, w - 48),
      top: 84,
      bottom: (cap.height ? cap.top - pinTop : h - 110) - 28
    };
  }

  /* ---------- Scroll progress (WebGL mode) ---------- */
  function windowOf(i) { var a = 0.06 + i * 0.23; return [a, a + 0.14]; }
  function progress() {
    var r = track.getBoundingClientRect(), span = r.height - window.innerHeight;
    return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
  }
  function onScroll() {
    var p = progress(), i = -1;
    for (var k = 0; k < BOOKS.length; k++) if (p >= windowOf(k)[0] + 0.03) i = k;
    setActive(i);
    var next = document.getElementById("coleccion"), cap = capsule.getBoundingClientRect();
    root.classList.toggle("is-end", p > 0.97 || (next && cap.height && next.getBoundingClientRect().top < cap.bottom + 24));
    if (scene) scene.setProgress(p);
  }
  function scrollToLayer(i) {
    var smooth = still || mq.reduce.matches ? "auto" : "smooth";
    if (mode === "webgl") {
      var r = track.getBoundingClientRect(), top = window.scrollY + r.top, span = r.height - window.innerHeight;
      var w = windowOf(i);
      window.scrollTo({ top: top + span * (w[1] + 0.02), behavior: smooth });
    } else {
      var el = document.getElementById("story-step-" + i);
      if (el) el.scrollIntoView({ behavior: smooth, block: mq.wide.matches ? "center" : "end" });
    }
  }

  /* ---------- Modes ---------- */
  /* Pull the next section up into the empty band under the book, so the collection
     heading follows about 100 px after the book once the story unpins. */
  function fitTail() {
    if (!scene || !scene.bounds()) return;
    var empty = window.innerHeight - scene.bounds().y1;
    track.style.marginBottom = -Math.max(0, Math.round(empty - 24)) + "px";
  }

  function startSVG() {
    mode = "svg";
    root.classList.add("is-svg"); root.classList.remove("is-webgl");
    stage.querySelector(".story__drawing").innerHTML = svgDrawing();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(+en.target.getAttribute("data-step"));
      });
    }, { rootMargin: mq.wide.matches ? "-45% 0px -45% 0px" : "-60% 0px -25% 0px" });
    steps.querySelectorAll(".story-step").forEach(function (el) { io.observe(el); });
    startSVG.io = io;
  }

  function startWebGL() {
    mode = "webgl";
    root.classList.add("is-webgl"); root.classList.remove("is-svg");
    pin.insertBefore(intro, pin.firstChild);
    stage.querySelector(".story__drawing").innerHTML = svgDrawing(); /* the poster until the scene is ready */
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    var canvas = stage.querySelector("canvas");
    var load = function () {
      import("./scene.js").then(function (mod) {
        scene = mod.createScene({
          canvas: canvas, host: stage, ink: INK, books: BOOKS, onFrame: onFrame,
          safeRect: safeRect,
          onPick: function (i) { C.goTo(BOOKS[i].anchor); },
          onHover: function (i) {
            capsule.querySelectorAll(".capsule__dot").forEach(function (d, k) { d.classList.toggle("is-hover", k === i); });
          }
        });
        scene.setStill(still);
        scene.setTheme(isDark());
        scene.setProgress(progress());
        fitTail();
        window.addEventListener("resize", fitTail);
        new IntersectionObserver(function (en) { scene.setVisible(en[0].isIntersecting); }).observe(track);
        requestAnimationFrame(function () { root.classList.add("is-ready"); });
        window.__heroScene = scene;
      }).catch(function () {
        /* The scene could not load (offline CDN, blocked module): fall back cleanly. */
        window.removeEventListener("scroll", onScroll);
        track.parentNode.insertBefore(intro, track);
        startSVG();
      });
    };
    if (document.readyState === "complete") setTimeout(load, 60);
    else window.addEventListener("load", function () { setTimeout(load, 60); });
  }

  function isDark() {
    var a = document.documentElement.getAttribute("data-theme");
    return a ? a === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  /* ---------- Events ---------- */
  capsule.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cap]"); if (!b) return;
    var c = b.getAttribute("data-cap");
    if (c === "still") {
      still = !still;
      try { localStorage.setItem("bk-still", still ? "1" : "0"); } catch (err) {}
      root.classList.toggle("is-still", still);
      if (scene) scene.setStill(still);
      renderCapsule();
      capsule.querySelector('[data-cap="still"]').focus();
      return;
    }
    var n = c === "prev" ? Math.max(0, active - 1) : c === "next" ? Math.min(BOOKS.length - 1, active + 1) : +c;
    scrollToLayer(n);
  });
  root.addEventListener("click", function (e) {
    var g = e.target.closest("[data-goto]"); if (!g) return;
    e.preventDefault(); C.goTo(g.getAttribute("data-goto"));
  });
  document.addEventListener("catalog:lang", function () {
    renderSteps(); renderCapsule(); renderPage();
    var svg = stage.querySelector(".drawing"); if (svg) svg.setAttribute("aria-label", s("drawing"));
    steps.querySelectorAll(".story-step").forEach(function (el, k) { el.classList.toggle("is-active", k === active); });
    if (mode === "svg" && startSVG.io) steps.querySelectorAll(".story-step").forEach(function (el) { startSVG.io.observe(el); });
  });
  new MutationObserver(function () { if (scene) scene.setTheme(isDark()); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------- Boot ---------- */
  root.classList.toggle("is-still", still);
  renderSteps(); renderCapsule();
  if (mq.desktop.matches && !mq.reduce.matches && hasWebGL2()) startWebGL(); else startSVG();
  renderPage();
})();
