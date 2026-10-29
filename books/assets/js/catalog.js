/* Catalog: language, theme, collection rows, reading order, shelf, 3D tilt.
   Reads window.BOOKS. Exposes window.Catalog for the hero module. */
(function () {
  "use strict";

  var BOOKS = window.BOOKS || [];
  var COVERS = window.COVER_PATH || "assets/covers/";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var T = {
    es: {
      skip: "Saltar al contenido", navMain: "Principal", navHome: "Inicio", navCourses: "Cursos", navBooks: "Libros",
      langGroup: "Idioma de la página", themeToDark: "Cambiar a tema oscuro", themeToLight: "Cambiar a tema claro",
      heroBy: "Una serie de Luis Felipe Ariza Vesga",
      heroTitle: "«Lo que pasa es que…»",
      heroLede: "Kubernetes explicado con analogías de la vida cotidiana. Cada concepto técnico se cuenta con una historia que cualquiera reconoce, y cada mecanismo se contrasta con la documentación oficial.",
      heroFacts: "Cuatro libros, en español y en inglés: fundamentos, administración, desarrollo y seguridad.",
      ctaCollection: "Ver la colección", ctaSample: "Leer el capítulo 1 gratis (PDF)",
      colTitle: "La colección", colSub: "Elija la edición en español o en inglés de cada libro. Los enlaces llevan a Amazon.",
      viewGroup: "Vista de la colección", tabList: "Colección", tabShelf: "Estante",
      shelfHint: "Ocho lomos: cada libro en español y en inglés. Elija uno para ver su edición.",
      orderTitle: "Orden de lectura", orderSub: "Un recorrido sugerido, de los fundamentos a la seguridad.",
      authorTitle: "Sobre el autor",
      authorBio1: "Ingeniero de telecomunicaciones con doctorado y autor de libros técnicos sobre Kubernetes, GitOps, seguridad, redes 5G privadas y Linux.",
      authorBio2: "Su método es el mismo en toda la serie: contar cada concepto con una historia cotidiana, publicarlo a la vez en español y en inglés, y contrastar cada comportamiento con la documentación oficial. La analogía nunca reemplaza el rigor.",
      authorBio3: "Cada libro está dedicado a una especie extinguida por la actividad humana; por eso hay un animal en cada portada.",
      authorLink: "Página del autor en Amazon",
      footNote: "Las muestras gratuitas contienen solo el capítulo 1. Los libros completos se venden en Amazon.",
      footSite: "Sitio", footAuthor: "Autor", footAmazon: "Página en Amazon", footPrivacy: "Privacidad", footTerms: "Términos",
      footCopy: "© 2026 Luis Felipe Ariza Vesga. Todos los derechos reservados.",
      edition: "Edición", editionGroup: "Idioma de la edición",
      kindle: "Kindle", paperback: "Tapa blanda", hardcover: "Tapa dura",
      sample: "Leer el capítulo 1 gratis (PDF)", labs: "Laboratorios del libro",
      coverAlt: "Portada de ", step: "Paso ", amazonOpens: " (abre Amazon)"
    },
    en: {
      skip: "Skip to content", navMain: "Main", navHome: "Home", navCourses: "Courses", navBooks: "Books",
      langGroup: "Page language", themeToDark: "Switch to dark theme", themeToLight: "Switch to light theme",
      heroBy: "A series by Luis Felipe Ariza Vesga",
      heroTitle: "Here’s What’s Actually Going On…",
      heroLede: "Kubernetes explained through everyday analogies. Every technical concept is told as a story anyone recognizes, and every mechanism is checked against the official documentation.",
      heroFacts: "Four books, in Spanish and English: basics, administration, development and security.",
      ctaCollection: "See the collection", ctaSample: "Read chapter 1 free (PDF)",
      colTitle: "The collection", colSub: "Choose the Spanish or English edition of each book. Links go to Amazon.",
      viewGroup: "Collection view", tabList: "Collection", tabShelf: "Shelf",
      shelfHint: "Eight spines: each book in Spanish and English. Pick one to see its edition.",
      orderTitle: "Reading order", orderSub: "A suggested path, from the basics to security.",
      authorTitle: "About the author",
      authorBio1: "Telecommunications engineer with a doctorate and author of technical books on Kubernetes, GitOps, security, private 5G networks and Linux.",
      authorBio2: "His method is the same across the series: tell every concept through an everyday story, publish it in Spanish and English at the same time, and check every behavior against the official documentation. The analogy never replaces rigor.",
      authorBio3: "Each book is dedicated to a species driven extinct by human activity, which is why every cover carries an animal.",
      authorLink: "Author page on Amazon",
      footNote: "The free samples contain chapter 1 only. The complete books are sold on Amazon.",
      footSite: "Site", footAuthor: "Author", footAmazon: "Amazon page", footPrivacy: "Privacy", footTerms: "Terms",
      footCopy: "© 2026 Luis Felipe Ariza Vesga. All rights reserved.",
      edition: "Edition", editionGroup: "Edition language",
      kindle: "Kindle", paperback: "Paperback", hardcover: "Hardcover",
      sample: "Read chapter 1 free (PDF)", labs: "Book labs",
      coverAlt: "Cover of ", step: "Step ", amazonOpens: " (opens Amazon)"
    }
  };

  var state = { lang: root.getAttribute("lang") === "en" ? "en" : "es", edition: {} };
  BOOKS.forEach(function (b) { state.edition[b.id] = state.lang; });

  function t(k) { return (T[state.lang] && T[state.lang][k]) || T.es[k] || k; }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function picture(base, alt, cls, eager) {
    return '<picture class="' + (cls || "") + '"><source type="image/webp" srcset="' + COVERS + base + '.webp">' +
      '<img src="' + COVERS + base + '.jpg" alt="' + esc(alt) + '" width="600" height="960"' +
      (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"></picture>';
  }

  /* A realistic CSS 3D book. Used by cards, the hero poster and the shelf detail. */
  function book3d(b, lang, opts) {
    opts = opts || {};
    return '<div class="book" style="--spine:' + b.hue + (opts.style ? ";" + opts.style : "") + '">' +
      '<div class="book__body">' +
        '<div class="book__face book__back"></div>' +
        '<div class="book__face book__pages"></div>' +
        '<div class="book__face book__top"></div>' +
        '<div class="book__face book__spine"><span>' + esc(b.short[lang]) + '</span></div>' +
        '<div class="book__face book__front">' + picture(b.cover[lang], opts.alt === false ? "" : t("coverAlt") + b.title[lang], "", opts.eager) + '</div>' +
      '</div><div class="book__shadow"></div></div>';
  }

  function itemHTML(b, lang, idPrefix) {
    var a = b.amazon[lang], L = state.lang;
    var formats = [["kindle", "buy buy--main"], ["paperback", "buy"], ["hardcover", "buy"]].map(function (f) {
      return '<a class="' + f[1] + '" href="' + a[f[0]] + '" target="_blank" rel="noopener" aria-label="' +
        esc(t(f[0]) + ", " + b.title[lang] + t("amazonOpens")) + '">' + t(f[0]) + "</a>";
    }).join("");
    var extra = "";
    if (b.sample && b.sample[lang]) {
      extra += '<a class="extra-link" href="' + b.sample[lang] + '" type="application/pdf"><span class="dot" aria-hidden="true"></span>' + t("sample") + "</a>";
    }
    if (b.labs) {
      extra += '<a class="extra-link" href="' + b.labs + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 14h9"/></svg>' + t("labs") + "</a>";
    }
    var gid = idPrefix + b.id;
    return '<div class="item__art">' + book3d(b, lang) + '</div>' +
      '<div class="item__info">' +
        '<p class="item__topic"><i aria-hidden="true">' + b.step + '</i><span class="sr-only">' + t("step") + b.step + ': </span>' + b.topic[L] + '</p>' +
        '<h3 id="' + gid + '-title" lang="' + lang + '">' + esc(b.title[lang]) + '</h3>' +
        '<p class="item__sub" lang="' + lang + '">' + esc(b.subtitle[lang]) + '</p>' +
        '<div class="item__edition"><span class="item__edition-label" id="' + gid + '-ed">' + t("edition") + '</span>' +
          '<div class="seg seg--sm" role="group" aria-labelledby="' + gid + '-ed" data-book="' + b.id + '">' +
            '<button type="button" data-edition="es" aria-pressed="' + (lang === "es") + '">ES</button>' +
            '<button type="button" data-edition="en" aria-pressed="' + (lang === "en") + '">EN</button>' +
          '</div></div>' +
        '<div class="item__buy">' + formats + '</div>' +
        (extra ? '<div class="item__extra">' + extra + '</div>' : "") +
      '</div>';
  }

  function hueVars(b) { return "--hue:" + b.hue + ";--hue-l:" + b.hueLight; }

  function renderCollection() {
    var host = document.getElementById("collection");
    if (!host) return;
    host.innerHTML = BOOKS.map(function (b) {
      return '<article class="item" id="' + b.anchor + '" style="' + hueVars(b) + '" aria-labelledby="c-' + b.id + '-title">' +
        itemHTML(b, state.edition[b.id], "c-") + "</article>";
    }).join("");
    bindTilt(host);
  }

  function renderOne(id) {
    var b = BOOKS.filter(function (x) { return x.id === id; })[0];
    var el = document.getElementById(b.anchor);
    if (!el) return;
    el.innerHTML = itemHTML(b, state.edition[id], "c-");
    bindTilt(el);
  }

  function renderSteps() {
    var host = document.getElementById("steps");
    if (!host) return;
    var L = state.lang;
    host.style.cssText = BOOKS.map(function (b, i) { return "--s" + (i + 1) + ":" + b.hue; }).join(";");
    host.innerHTML = BOOKS.map(function (b) {
      return '<li class="step" style="' + hueVars(b) + '"><a href="#' + b.anchor + '">' +
        '<span class="step__n" aria-hidden="true">' + b.step + '</span>' +
        picture(b.cover[L], "", "step__cover") +
        '<span class="step__topic"><span class="sr-only">' + t("step") + b.step + ": </span>" + b.topic[L] + "</span>" +
        '<span class="step__title">' + esc(b.title[L]) + "</span></a></li>";
    }).join("");
  }

  var shelfPick = null;
  function renderShelf() {
    var host = document.getElementById("shelf");
    if (!host) return;
    var html = [];
    ["es", "en"].forEach(function (lang, li) {
      if (li) html.push('<span class="gap" aria-hidden="true"></span>');
      BOOKS.forEach(function (b, i) {
        var key = b.id + ":" + lang;
        html.push('<button type="button" class="spine" style="' + hueVars(b) + ';--sh:' + (238 + i * 12) + 'px;--sw:' + (44 + (i % 2) * 6) + 'px" data-pick="' + key + '" aria-pressed="' + (shelfPick === key) + '" lang="' + lang + '">' +
          '<span class="spine__t">' + esc(b.short[lang]) + '</span><span class="spine__l">' + lang.toUpperCase() + "</span></button>");
      });
    });
    host.innerHTML = html.join("");
    renderShelfDetail();
  }
  function renderShelfDetail() {
    var host = document.getElementById("shelf-detail");
    if (!host) return;
    if (!shelfPick) { host.innerHTML = ""; return; }
    var p = shelfPick.split(":"), b = BOOKS.filter(function (x) { return x.id === p[0]; })[0];
    host.innerHTML = '<div class="item" style="' + hueVars(b) + '">' + itemHTML(b, p[1], "s-") + "</div>";
    var seg = host.querySelector(".seg");
    if (seg) seg.parentNode.remove(); /* the spine already chose the edition */
    bindTilt(host);
  }

  function applyStatic() {
    root.setAttribute("lang", state.lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var kv = pair.split(":"); el.setAttribute(kv[0], t(kv[1]));
      });
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === state.lang));
    });
    var hs = document.getElementById("hero-sample");
    if (hs) hs.setAttribute("href", BOOKS[0].sample[state.lang]);
    document.title = state.lang === "en" ? "Kubernetes books | Beanters" : "Libros de Kubernetes | Beanters";
    syncThemeLabel();
  }

  function setLang(lang) {
    state.lang = lang;
    BOOKS.forEach(function (b) { state.edition[b.id] = lang; });
    store("bk-lang", lang);
    applyStatic(); renderCollection(); renderSteps(); renderShelf();
    document.dispatchEvent(new CustomEvent("catalog:lang", { detail: { lang: lang } }));
  }

  /* ---- Theme ---- */
  function isDark() {
    var a = root.getAttribute("data-theme");
    return a ? a === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncThemeLabel() {
    var b = document.getElementById("theme-toggle");
    if (b) b.setAttribute("aria-label", t(isDark() ? "themeToLight" : "themeToDark"));
  }

  /* ---- 3D tilt that answers the pointer; a springy settle on leave ---- */
  function bindTilt(scope) {
    if (reduceMotion.matches || !window.matchMedia("(hover: hover)").matches) return;
    scope.querySelectorAll(".item").forEach(function (item) {
      var bk = item.querySelector(".book");
      if (!bk || item._tilt) return;
      item._tilt = true;
      var art = item.querySelector(".item__art"), raf = 0;
      art.addEventListener("pointermove", function (e) {
        var r = art.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          bk.style.setProperty("--ry", (-12 + x * 26).toFixed(1) + "deg");
          bk.style.setProperty("--rx", (2 - y * 12).toFixed(1) + "deg");
        });
      });
      art.addEventListener("pointerleave", function () {
        cancelAnimationFrame(raf);
        bk.style.removeProperty("--ry"); bk.style.removeProperty("--rx");
      });
    });
  }

  /* ---- Events ---- */
  document.addEventListener("click", function (e) {
    var l = e.target.closest("[data-set-lang]");
    if (l) { setLang(l.getAttribute("data-set-lang")); return; }

    var ed = e.target.closest("[data-edition]");
    if (ed) {
      var id = ed.parentNode.getAttribute("data-book");
      state.edition[id] = ed.getAttribute("data-edition");
      renderOne(id);
      var again = document.querySelector('#' + BOOKS.filter(function (x) { return x.id === id; })[0].anchor + ' [data-edition="' + state.edition[id] + '"]');
      if (again) again.focus();
      return;
    }

    var sp = e.target.closest("[data-pick]");
    if (sp) {
      var k = sp.getAttribute("data-pick");
      shelfPick = shelfPick === k ? null : k;
      document.querySelectorAll("[data-pick]").forEach(function (s) { s.setAttribute("aria-pressed", String(s.getAttribute("data-pick") === shelfPick)); });
      renderShelfDetail();
      return;
    }

    if (e.target.closest("#theme-toggle")) {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("bk-theme", next);
      syncThemeLabel();
    }
  });

  /* Tabs: roving tabindex, arrow keys, Home/End (WAI-ARIA tabs pattern). */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (x) {
      var on = x === tab;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      selectTab(tabs[(n + tabs.length) % tabs.length], true);
    });
  });

  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  window.Catalog = {
    get lang() { return state.lang; },
    t: t, book3d: book3d, picture: picture, books: BOOKS,
    goTo: function (anchor) {
      var el = document.getElementById(anchor);
      if (!el) return;
      if (document.getElementById("panel-list").hidden) selectTab(document.getElementById("tab-list"));
      el.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", "#" + anchor);
    }
  };

  applyStatic(); renderCollection(); renderSteps(); renderShelf();
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
})();
