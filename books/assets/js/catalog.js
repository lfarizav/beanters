/* Catalog: language, theme, collection rows, reading order, shelf of spines, votes, 3D tilt.
   Reads window.BOOKS and window.GHOSTS. Exposes window.Catalog for the hero module. */
(function () {
  "use strict";

  var BOOKS = window.BOOKS || [];
  var GHOSTS = window.GHOSTS || [];
  var COVERS = window.COVER_PATH || "/books/assets/covers/";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  /* 3D reader: a book gets it once its pages exist in reader/pages/<dir>/<es|en>/p-NN.webp.
     w/h is the page image size (trim); it defaults to 770x990 when left out. */
  var READER_BASE = new URL("../reader/", document.currentScript.src).href;
  var READERS = {
    kcna: { dir: "kubernetes", pages: 28 },
    cka: { dir: "administrar", pages: 37, w: 676, h: 1014 },
    ckad: { dir: "desarrollar", pages: 41 },
    cks: { dir: "asegurar", pages: 35 }
  };
  BOOKS.forEach(function (b) { if (!b.reader && READERS[b.id]) b.reader = READERS[b.id]; });

  var T = {
    es: {
      rvTitle: "Opiniones de lectores", rvNone: "Aún no hay comentarios.", rvWrite: "Escribir un comentario",
      rvLegend: "Su puntuación (1 es la más baja, 5 la mejor)", rvStar1: "1 estrella", rvStarN: " estrellas",
      rvComment: "Su comentario", rvName: "Su nombre (opcional)", rvSend: "Enviar", rvSending: "Enviando",
      rvMore: "Más recientes primero", rvAnon: "Anónimo", rvAvgOf: " de 5", rvOne: " opinión", rvMany: " opiniones",
      rvNeedStars: "Elija de 1 a 5 estrellas.", rvNeedText: "Escriba un comentario de al menos 3 caracteres.",
      rvFail: "No pudimos enviar su comentario ahora. Su texto sigue aquí; intente de nuevo en unos minutos.",
      rvThanks: "Gracias. Su comentario se publicará cuando sea revisado.", rvChars: " de 1000",
      skip: "Saltar al contenido", navMain: "Principal", navHome: "Inicio", navCourses: "Cursos", navBooks: "Libros",
      langGroup: "Idioma de la página", themeToDark: "Cambiar a tema oscuro", themeToLight: "Cambiar a tema claro",
      heroBy: "Una serie de Luis Felipe Ariza Vesga",
      heroTitle: "«Lo que pasa es que…»",
      heroLede: "Kubernetes explicado con analogías de la vida cotidiana. Cada concepto técnico se cuenta con una historia que cualquiera reconoce, y cada mecanismo se contrasta con la documentación oficial.",
      heroFacts: "Cuatro libros publicados, en español y en inglés: fundamentos, administración, desarrollo y seguridad.",
      ctaCollection: "Ver la colección", ctaSample: "Leer el capítulo 1 gratis (PDF)",
      colTitle: "La colección", colSub: "Los libros en color ya están en Amazon, en español y en inglés. Los demás se publicarán más adelante.",
      viewGroup: "Vista de la colección", tabList: "Colección", tabShelf: "Estante",
      shelfHint: "Los lomos de color ya están en Amazon; los pálidos se publicarán más adelante. Elija un lomo para ver su portada y su edición.",
      orderTitle: "Orden de lectura", orderSub: "Un recorrido sugerido para convertirte en Kubestronaut, de los fundamentos a la seguridad.",
      authorTitle: "Sobre el autor",
      authorBio1: "Ingeniero de telecomunicaciones con doctorado y autor de libros técnicos sobre Kubernetes, GitOps, seguridad, redes 5G privadas y Linux.",
      authorBio2: "Su método es el mismo en toda la serie: contar cada concepto con una historia cotidiana, publicarlo a la vez en español y en inglés, y contrastar cada comportamiento con la documentación oficial. La analogía nunca reemplaza el rigor.",
      authorBio3: "Cada libro de la serie «Lo que pasa es que…» está dedicado a una especie extinguida por la actividad humana; por eso hay un animal en cada una de esas portadas.",
      authorLink: "Página del autor en Amazon",
      footNote: "Las muestras gratuitas contienen solo el capítulo 1. Los libros publicados se venden completos en Amazon; los demás aún no están a la venta.",
      footSite: "Sitio", footAuthor: "Autor", footAmazon: "Página en Amazon", footPrivacy: "Privacidad", footTerms: "Términos",
      footCopy: "© 2026 Luis Felipe Ariza Vesga. Todos los derechos reservados.",
      footAbout: "Sobre Luis", footFaq: "Preguntas frecuentes", bookPage: "Página del libro",
      pagesTitle: "Una página por libro", pagesSub: "Cada libro tiene su propia página, con el tema, las ediciones y los enlaces de compra.", pageOpen: "Ver el libro",
      edition: "Edición", editionGroup: "Idioma de la edición",
      kindle: "Kindle", paperback: "Tapa blanda", hardcover: "Tapa dura",
      sample: "Leer el capítulo 1 gratis (PDF)", labs: "Laboratorios del libro",
      coverAlt: "Portada de ", step: "Paso ", amazonOpens: " (abre Amazon)", openBook: "Abrir el libro",
      statePublished: "publicado en Amazon", stateGhost: "aún no publicado", langRowes: "Edición en español", langRowen: "Edición en inglés", ghostTag: "Próximamente", ghostState: "Aún no publicado",
      ghostMsg: "Este libro se publicará más adelante. Vote por el que quiere ver pronto en Amazon.",
      noSample: "Sin muestra disponible por ahora",
      vote: "Votar", voted: "Voto registrado", voteBusy: "Enviando…",
      voteThanks: "Gracias. Su voto quedó registrado.",
      voteFail: "No pudimos registrar su voto en este momento. Inténtelo de nuevo más tarde.",
      votesNone: "Aún sin votos", votesOne: "1 voto", votesMany: " votos",
      closeDetail: "Cerrar el detalle"
    },
    en: {
      rvTitle: "Reader reviews", rvNone: "No comments yet.", rvWrite: "Write a comment",
      rvLegend: "Your rating (1 is lowest, 5 is best)", rvStar1: "1 star", rvStarN: " stars",
      rvComment: "Your comment", rvName: "Your name (optional)", rvSend: "Send", rvSending: "Sending",
      rvMore: "Newest first", rvAnon: "Anonymous", rvAvgOf: " out of 5", rvOne: " review", rvMany: " reviews",
      rvNeedStars: "Please choose 1 to 5 stars.", rvNeedText: "Please write a comment of at least 3 characters.",
      rvFail: "We could not send your comment right now. Your text is still here; please try again in a few minutes.",
      rvThanks: "Thank you. Your comment will be published once it has been reviewed.", rvChars: " of 1000",
      skip: "Skip to content", navMain: "Main", navHome: "Home", navCourses: "Courses", navBooks: "Books",
      langGroup: "Page language", themeToDark: "Switch to dark theme", themeToLight: "Switch to light theme",
      heroBy: "A series by Luis Felipe Ariza Vesga",
      heroTitle: "Here’s What’s Actually Going On…",
      heroLede: "Kubernetes explained through everyday analogies. Every technical concept is told as a story anyone recognizes, and every mechanism is checked against the official documentation.",
      heroFacts: "Four published books, in Spanish and English: basics, administration, development and security.",
      ctaCollection: "See the collection", ctaSample: "Read chapter 1 free (PDF)",
      colTitle: "The collection", colSub: "The books in color are on Amazon, in Spanish and English. The others will be published later.",
      viewGroup: "Collection view", tabList: "Collection", tabShelf: "Shelf",
      shelfHint: "The colored spines are on Amazon; the pale ones will be published later. Pick a spine to see its cover and edition.",
      orderTitle: "Reading order", orderSub: "A suggested path to become a Kubestronaut, from the basics to security.",
      authorTitle: "About the author",
      authorBio1: "Telecommunications engineer with a doctorate and author of technical books on Kubernetes, GitOps, security, private 5G networks and Linux.",
      authorBio2: "His method is the same across the series: tell every concept through an everyday story, publish it in Spanish and English at the same time, and check every behavior against the official documentation. The analogy never replaces rigor.",
      authorBio3: "Each book in the “Here’s What’s Actually Going On…” series is dedicated to a species driven extinct by human activity, which is why each of those covers carries an animal.",
      authorLink: "Author page on Amazon",
      footNote: "The free samples contain chapter 1 only. The published books are sold complete on Amazon; the others are not on sale yet.",
      footSite: "Site", footAuthor: "Author", footAmazon: "Amazon page", footPrivacy: "Privacy", footTerms: "Terms",
      footCopy: "© 2026 Luis Felipe Ariza Vesga. All rights reserved.",
      footAbout: "About Luis", footFaq: "FAQ", bookPage: "Book page",
      pagesTitle: "One page per book", pagesSub: "Each book has its own page, with its topic, its editions and the buy links.", pageOpen: "See the book",
      edition: "Edition", editionGroup: "Edition language",
      kindle: "Kindle", paperback: "Paperback", hardcover: "Hardcover",
      sample: "Read chapter 1 free (PDF)", labs: "Book labs",
      coverAlt: "Cover of ", step: "Step ", amazonOpens: " (opens Amazon)", openBook: "Open the book",
      statePublished: "published on Amazon", stateGhost: "not yet published", langRowes: "Spanish edition", langRowen: "English edition", ghostTag: "Coming soon", ghostState: "Not yet published",
      ghostMsg: "This book will be published later. Vote for the one you want to see soon on Amazon.",
      noSample: "No sample available yet",
      vote: "Vote", voted: "Vote recorded", voteBusy: "Sending…",
      voteThanks: "Thank you. Your vote was recorded.",
      voteFail: "We could not record your vote right now. Please try again later.",
      votesNone: "No votes yet", votesOne: "1 vote", votesMany: " votes",
      closeDetail: "Close the details"
    }
  };

  var baseTitle = document.title;
  var state = { lang: root.getAttribute("lang") === "en" ? "en" : "es", edition: {} };
  var baseLang = state.lang;
  BOOKS.forEach(function (b) { state.edition[b.id] = state.lang; });

  function t(k) { return (T[state.lang] && T[state.lang][k]) || T.es[k] || k; }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function picture(base, alt, cls, eager, w, h) {
    return '<picture class="' + (cls || "") + '"><source type="image/webp" srcset="' + COVERS + base + '.webp">' +
      '<img src="' + COVERS + base + '.jpg" alt="' + esc(alt) + '" width="' + (w || 600) + '" height="' + (h || 960) + '"' +
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
    extra = '<a class="extra-link" href="' + (state.lang === "en" ? "/en/books/" : "/books/") + b.anchor + '/">' + t("bookPage") + "</a>" + extra;
    var gid = idPrefix + b.id;
    return '<div class="item__art" data-reader="' + b.id + ':' + lang + '" role="button" tabindex="0" aria-haspopup="dialog" style="cursor:pointer" aria-label="' + esc((b.reader ? t("sample").replace(" (PDF)", "") : t("openBook")) + ": " + b.title[lang]) + '">' + book3d(b, lang) + '</div>' +
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
    snapDrafts();
    host.innerHTML = BOOKS.map(function (b) {
      return '<article class="item" id="' + b.anchor + '" style="' + hueVars(b) + '" aria-labelledby="c-' + b.id + '-title">' +
        itemHTML(b, state.edition[b.id], "c-") + reviewsHTML(b) + "</article>";
    }).join("") + GHOSTS.map(function (g) {
      return '<article class="item item--ghost" aria-labelledby="c-' + g.id + '-title">' + ghostHTML(g, state.lang, "c-") + "</article>";
    }).join("");
    GHOSTS.forEach(function (g) { syncVote(g.id); });
    BOOKS.forEach(function (b) { syncReviews(b.id); });
    bindTilt(host);
  }

  function renderOne(id) {
    var b = BOOKS.filter(function (x) { return x.id === id; })[0];
    var el = document.getElementById(b.anchor);
    if (!el) return;
    snapDrafts();
    el.innerHTML = itemHTML(b, state.edition[id], "c-") + reviewsHTML(b);
    syncReviews(id);
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

  /* ---- Shelf: one group of boards per language, published spines first, then ghosts.
     shelfPick is "<id>:<edition>"; a spine chooses the edition. ---- */
  var GHOST_W = 400, GHOST_H = 514;
  var shelfPick = null;
  function findBook(id) { return BOOKS.filter(function (x) { return x.id === id; })[0]; }
  function findGhost(id) { return GHOSTS.filter(function (x) { return x.id === id; })[0]; }

  function renderShelf() {
    var host = document.getElementById("shelf");
    if (!host) return;
    host.innerHTML = ["es", "en"].map(function (lang) {
      return '<div class="shelf__row" role="group" aria-label="' + esc(t("langRow" + lang)) + '">' +
        BOOKS.concat(GHOSTS).map(function (b, i) {
          var key = b.id + ":" + lang, ghost = i >= BOOKS.length;
          return '<button type="button" class="spine' + (ghost ? " spine--ghost" : "") + '" style="' + (ghost ? "" : hueVars(b) + ";") + "--sh:" + (238 + (i % 4) * 12) + "px;--sw:" + (44 + (i % 2) * 6) + 'px" data-pick="' + key + '" aria-pressed="' + (shelfPick === key) + '" aria-controls="shelf-detail" lang="' + lang + '"' +
            ' title="' + esc(b.title[lang]) + '" aria-label="' + esc(b.title[lang] + ", " + t(ghost ? "stateGhost" : "statePublished") + ", " + t("langRow" + lang)) + '">' +
            '<span class="spine__t">' + esc(b.short[lang]) + '</span><span class="spine__l">' + lang.toUpperCase() + "</span></button>";
        }).join("") + "</div>";
    }).join("");
    renderShelfDetail();
  }

  /* Cover, message and vote of a book not yet published: list row and shelf detail. */
  function ghostHTML(g, lang, idPrefix) {
    return '<div class="item__art"><div class="ghost-art"><span class="ghost-art__tag" aria-hidden="true">' + t("ghostTag") + "</span>" +
        picture(g.cover[lang], t("coverAlt") + g.title[lang], "", false, GHOST_W, GHOST_H) + "</div></div>" +
      '<div class="item__info">' +
        '<p class="item__topic">' + t("ghostState") + "</p>" +
        '<h3 id="' + idPrefix + g.id + '-title" lang="' + lang + '" tabindex="-1">' + esc(g.title[lang]) + "</h3>" +
        '<p class="item__sub" lang="' + lang + '">' + esc(g.subtitle[lang]) + "</p>" +
        '<p class="ghost__msg">' + t("ghostMsg") + "</p>" +
        '<div class="vote" data-vote-box="' + g.id + '">' +
          '<button type="button" class="buy buy--main vote__btn" data-vote="' + g.id + '"></button>' +
          '<span class="vote__count" hidden></span>' +
        "</div>" +
        '<p class="vote__status" role="status"></p>' +
        '<p class="ghost__nosample">' + t("noSample") + "</p>" +
      "</div>";
  }

  function renderShelfDetail(moveFocus) {
    var host = document.getElementById("shelf-detail");
    if (!host) return;
    if (!shelfPick) { host.innerHTML = ""; return; }
    var p = shelfPick.split(":"), b = findBook(p[0]), g = !b && findGhost(p[0]);
    var close = '<button type="button" class="shelf__close" data-close-detail aria-label="' + esc(t("closeDetail")) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
    if (b) {
      host.innerHTML = close + '<div class="item" style="' + hueVars(b) + '">' + itemHTML(b, p[1], "s-") + "</div>";
      var seg = host.querySelector(".seg");
      if (seg) seg.parentNode.remove(); /* the spine already chose the edition */
      var h = host.querySelector("h3");
      if (h) h.setAttribute("tabindex", "-1");
      bindTilt(host);
    } else if (g) {
      host.innerHTML = close + '<div class="item item--ghost">' + ghostHTML(g, p[1], "s-") + "</div>";
      syncVote(g.id);
      loadVotes();
    }
    if (moveFocus) {
      var head = host.querySelector("h3");
      host.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest" });
      if (head) head.focus({ preventScroll: true });
    }
  }

  function pickShelf(key) {
    shelfPick = key;
    document.querySelectorAll("#shelf [data-pick]").forEach(function (el) {
      el.setAttribute("aria-pressed", String(el.getAttribute("data-pick") === key));
    });
    renderShelfDetail(true);
  }

  function closeDetail() {
    var key = shelfPick;
    shelfPick = null;
    renderShelfDetail();
    document.querySelectorAll("#shelf [data-pick]").forEach(function (el) {
      el.setAttribute("aria-pressed", "false");
      if (el.getAttribute("data-pick") === key) el.focus();
    });
  }

  /* ---- Votes: one per browser and book. localStorage keeps only "bk-vote-<id>" = the count
     shown right after voting, so a cached /stats (30 s) never takes the visible number back.
     Sent only to the Worker; on localhost only with ?counter=test, like counter.js.
     Anything but a 204 leaves the book unvoted and shows a calm message. ---- */
  var COUNTER_API = "/api/counter/";
  var counterOk = !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || /[?&]counter=test(&|$)/.test(location.search);
  var votes = null;      /* by_vote from /stats, or null while unknown or unavailable */
  var votesAsked = false;
  var votedNow = {};     /* same session, in case localStorage is blocked */
  var voteState = {};    /* id -> "busy" | "fail" | "thanks" */

  function votedCount(id) {
    if (votedNow[id]) return votedNow[id];
    try { return Number(localStorage.getItem("bk-vote-" + id)) || 0; } catch (e) { return 0; }
  }
  function shownCount(id) {
    if (!votes) return null;
    return Math.max(Number(votes[id]) || 0, votedCount(id));
  }
  function votesText(n) {
    if (n === 0) return t("votesNone");
    if (n === 1) return t("votesOne");
    var f;
    try { f = new Intl.NumberFormat(state.lang === "en" ? "en-US" : "es-CO").format(n); } catch (e) { f = String(n); }
    return f + t("votesMany");
  }
  /* The same book can be open in the list and in the shelf detail: keep both in step. */
  function syncVote(id) {
    document.querySelectorAll('[data-vote-box="' + id + '"]').forEach(function (box) {
      var btn = box.querySelector("[data-vote]"), count = box.querySelector(".vote__count");
      var status = box.parentNode.querySelector(".vote__status");
      var done = votedCount(id) > 0, st = voteState[id], n = shownCount(id);
      btn.textContent = done ? t("voted") : st === "busy" ? t("voteBusy") : t("vote");
      btn.classList.toggle("is-voted", done);
      btn.setAttribute("aria-disabled", String(done || st === "busy"));
      count.hidden = n === null;
      count.textContent = n === null ? "" : votesText(n);
      status.textContent = st === "fail" ? t("voteFail") : st === "thanks" ? t("voteThanks") : "";
    });
  }
  function loadVotes() {
    if (votesAsked) return;
    votesAsked = true;
    fetch(COUNTER_API + "stats", { credentials: "omit", headers: { Accept: "application/json" } })
      .then(function (r) {
        var ct = r.headers.get("content-type") || "";
        if (!r.ok || ct.indexOf("json") < 0) throw new Error("stats unavailable");
        return r.json();
      })
      .then(function (j) {
        if (!j || typeof j.by_vote !== "object" || j.by_vote === null) return;
        votes = j.by_vote;
        GHOSTS.forEach(function (g) { syncVote(g.id); });
      })
      .catch(function () { votesAsked = false; });
  }
  function castVote(id) {
    if (votedCount(id) || voteState[id] === "busy") return;
    voteState[id] = "busy";
    syncVote(id);
    var sent = counterOk
      ? fetch(COUNTER_API + "hit", { method: "POST", body: JSON.stringify({ t: "vote", id: id }), credentials: "omit" })
      : Promise.reject(new Error("counter off"));
    sent.then(function (r) {
      if (r.status !== 204) throw new Error("vote refused");
      var n = (votes ? Number(votes[id]) || 0 : 0) + 1;
      votedNow[id] = n;
      try { localStorage.setItem("bk-vote-" + id, String(n)); } catch (e) {}
      voteState[id] = "thanks";
    }).catch(function () {
      voteState[id] = "fail";
    }).then(function () { syncVote(id); });
  }

  /* ---- Reviews: only the 4 published books in the collection list. Held for approval by the owner,
     so nothing shows until the Worker returns it as approved. Names and comments go through esc() only. ---- */
  var reviews = null;      /* null = not loaded or unavailable (list hidden) */
  var reviewsAsked = false;
  var drafts = {};         /* typed text survives a re-render (language toggle, edition switch) */
  var rvBusy = {};
  function rvDone(id) { try { return localStorage.getItem("bk-review-" + id) === "1"; } catch (e) { return false; } }
  function rvNum(n) {
    try { return new Intl.NumberFormat(state.lang === "en" ? "en-US" : "es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n); } catch (e) { return String(n); }
  }
  function rvStars(n) { return "★★★★★".slice(0, Math.round(n)) + "☆☆☆☆☆".slice(0, 5 - Math.round(n)); }
  function reviewsHTML(b) {
    var id = b.id, p = "rv-" + id, radios = "";
    for (var i = 1; i <= 5; i++) {
      radios += '<span class="rv__opt"><input type="radio" class="rv__radio" name="stars" id="' + p + '-s' + i + '" value="' + i + '">' +
        '<label class="rv__star" for="' + p + '-s' + i + '"><span class="sr-only">' + (i === 1 ? t("rvStar1") : i + t("rvStarN")) + '</span><span aria-hidden="true">★</span></label></span>';
    }
    var done = rvDone(id);
    return '<section class="rv" data-rv="' + id + '" aria-labelledby="' + p + '-h">' +
      '<h4 class="rv__h" id="' + p + '-h">' + t("rvTitle") + '</h4>' +
      '<div class="rv__list" data-rv-list="' + id + '" hidden></div>' +
      (done ? '<p class="rv__note">' + t("rvThanks") + '</p>' :
      '<button type="button" class="rv__open" data-rv-open="' + id + '" aria-expanded="false" aria-controls="' + p + '-form">' + t("rvWrite") + '</button>' +
      '<form class="rv__form" id="' + p + '-form" data-rv-form="' + id + '" hidden novalidate>' +
        '<fieldset class="rv__stars"><legend>' + t("rvLegend") + '</legend><div class="rv__radios">' + radios + '</div></fieldset>' +
        '<label class="rv__lab" for="' + p + '-c">' + t("rvComment") + '</label>' +
        '<textarea id="' + p + '-c" name="comment" rows="4" maxlength="1000" required></textarea>' +
        '<p class="rv__count" data-rv-count aria-hidden="true">0' + t("rvChars") + '</p>' +
        '<label class="rv__lab" for="' + p + '-n">' + t("rvName") + '</label>' +
        '<input type="text" id="' + p + '-n" name="name" maxlength="40" autocomplete="off">' +
        '<div class="rv__hp" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>' +
        '<div class="rv__row"><button type="submit" class="rv__send">' + t("rvSend") + '</button>' +
        '<p class="rv__msg" data-rv-msg role="status" aria-live="polite"></p></div>' +
      '</form>') +
      '</section>';
  }
  function syncReviews(id) {
    var box = document.querySelector('[data-rv-list="' + id + '"]');
    if (!box) return;
    var d = reviews && reviews[id], h;
    if (!reviews) { box.hidden = true; box.innerHTML = ""; }
    else if (!d || !d.count) { box.hidden = false; box.innerHTML = '<p class="rv__none">' + esc(t("rvNone")) + "</p>"; }
    else {
      h = '<p class="rv__avg"><span class="rv__stars" aria-hidden="true">' + rvStars(d.avg) + '</span> <strong>' + rvNum(d.avg) + '</strong>' +
        '<span class="sr-only">' + t("rvAvgOf") + '</span> <span class="rv__n">(' + d.count + (d.count === 1 ? t("rvOne") : t("rvMany")) + ")</span></p><ul class=\"rv__items\">";
      (d.items || []).forEach(function (r) {
        h += '<li class="rv__item"><p class="rv__meta"><span class="rv__stars" aria-hidden="true">' + rvStars(r.stars) + '</span>' +
          '<span class="sr-only">' + esc(r.stars + t("rvAvgOf")) + '</span> <strong>' + esc(r.name || t("rvAnon")) + '</strong> <span class="rv__date">' + esc(r.date) + '</span></p>' +
          '<p class="rv__text">' + esc(r.comment) + "</p></li>";
      });
      box.hidden = false; box.innerHTML = h + "</ul>";
    }
    restoreDraft(id);
  }
  function snapDrafts() {
    document.querySelectorAll("[data-rv-form]").forEach(function (f) {
      var id = f.getAttribute("data-rv-form"), r = f.querySelector("input[name=stars]:checked");
      drafts[id] = { open: !f.hidden, stars: r ? r.value : "", comment: f.elements.comment.value, name: f.elements.name.value };
    });
  }
  function restoreDraft(id) {
    var f = document.querySelector('[data-rv-form="' + id + '"]'), d = drafts[id];
    if (!f || !d || f.getAttribute("data-restored")) return;
    f.setAttribute("data-restored", "1");
    f.hidden = !d.open;
    var o = document.querySelector('[data-rv-open="' + id + '"]');
    if (o) o.setAttribute("aria-expanded", String(d.open));
    if (d.stars) { var r = f.querySelector("input[name=stars][value='" + d.stars + "']"); if (r) { r.checked = true; paintStars(f); } }
    f.elements.comment.value = d.comment; f.elements.name.value = d.name;
    f.querySelector("[data-rv-count]").textContent = d.comment.length + t("rvChars");
  }
  function paintStars(f) {
    var r = f.querySelector("input[name=stars]:checked"), v = r ? Number(r.value) : 0;
    f.querySelectorAll(".rv__star").forEach(function (l, i) { l.classList.toggle("on", i < v); });
  }
  function loadReviews() {
    if (reviewsAsked || !counterOk) return;
    reviewsAsked = true;
    fetch(COUNTER_API + "reviews", { credentials: "omit", headers: { Accept: "application/json" } })
      .then(function (r) {
        var ct = r.headers.get("content-type") || "";
        if (!r.ok || ct.indexOf("json") < 0) throw new Error("reviews unavailable");
        return r.json();
      })
      .then(function (j) {
        if (!j || typeof j !== "object" || Array.isArray(j)) return;
        reviews = j;
        BOOKS.forEach(function (b) { syncReviews(b.id); });
      })
      .catch(function () { reviewsAsked = false; });
  }
  function sendReview(f) {
    var id = f.getAttribute("data-rv-form"), msg = f.querySelector("[data-rv-msg]"), btn = f.querySelector(".rv__send");
    var r = f.querySelector("input[name=stars]:checked"), comment = f.elements.comment.value.trim();
    if (rvBusy[id]) return;
    if (!r) { msg.textContent = t("rvNeedStars"); return; }
    if (comment.length < 3) { msg.textContent = t("rvNeedText"); return; }
    rvBusy[id] = true; btn.setAttribute("aria-disabled", "true"); msg.textContent = t("rvSending");
    var sent = counterOk
      ? fetch(COUNTER_API + "review", { method: "POST", credentials: "omit",
          body: JSON.stringify({ book: id, stars: Number(r.value), comment: comment, name: f.elements.name.value.trim(), website: f.elements.website.value }) })
      : Promise.reject(new Error("counter off"));
    sent.then(function (res) {
      if (res.status !== 204) throw new Error("review refused");
      try { localStorage.setItem("bk-review-" + id, "1"); } catch (e) {}
      delete drafts[id];
      var sec = f.closest(".rv"), note = document.createElement("p");
      note.className = "rv__note"; note.setAttribute("role", "status"); note.textContent = t("rvThanks");
      sec.querySelector("[data-rv-open]").remove(); f.replaceWith(note);
    }).catch(function () {
      msg.textContent = t("rvFail");
    }).then(function () { rvBusy[id] = false; btn.removeAttribute("aria-disabled"); });
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-rv-open]");
    if (!o) return;
    var f = document.querySelector('[data-rv-form="' + o.getAttribute("data-rv-open") + '"]');
    f.hidden = !f.hidden;
    o.setAttribute("aria-expanded", String(!f.hidden));
    if (!f.hidden) f.querySelector("input[name=stars]").focus();
  });
  document.addEventListener("submit", function (e) {
    var f = e.target.closest("[data-rv-form]");
    if (!f) return;
    e.preventDefault(); sendReview(f);
  });
  document.addEventListener("input", function (e) {
    var f = e.target.closest && e.target.closest("[data-rv-form]");
    if (!f) return;
    if (e.target.name === "comment") f.querySelector("[data-rv-count]").textContent = e.target.value.length + t("rvChars");
    if (e.target.name === "stars") { paintStars(f); f.querySelector("[data-rv-msg]").textContent = ""; }
  });

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
    document.title = state.lang === baseLang ? baseTitle : (state.lang === "en" ? "Kubernetes books | Beanters" : "Libros de Kubernetes | Beanters");
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
  /* Opens the 3D book from a cover in the list or in the shelf detail (data-reader). */
  function openReader(el, kind) {
    var p = el.getAttribute(kind === "spine" ? "data-pick" : "data-reader").split(":"), b = BOOKS.filter(function (x) { return x.id === p[0]; })[0];
    /* Anonymous "book opened" count: once per open action, never per page turn. */
    if (b && window.BeantersCounter) window.BeantersCounter.book(b.id);
    var css = document.getElementById("rd-css");
    if (!css) {
      css = document.createElement("link");
      css.id = "rd-css"; css.rel = "stylesheet"; css.href = READER_BASE + "reader.css?v=20261030d";
      css._ready = new Promise(function (ok) { css.onload = css.onerror = ok; });
      document.head.appendChild(css);
    }
    Promise.all([import(READER_BASE + "reader.js?v=20261030d"), css._ready]).then(function (r) {
      r[0].open({ book: b, edition: p[1], uiLang: state.lang, origin: el, kind: kind || "cover", coverSrc: COVERS + b.cover[p[1]] + ".webp",
        labels: { kindle: t("kindle"), paperback: t("paperback"), hardcover: t("hardcover"), amazonOpens: t("amazonOpens"),
          sample: t("sample"), labs: t("labs"), series: t("heroTitle"), by: t("heroBy") } });
    });
  }
  document.addEventListener("keydown", function (e) {
    var rd = (e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("[data-reader]");
    if (rd) { e.preventDefault(); openReader(rd); }
  });

  document.addEventListener("click", function (e) {
    var rd = e.target.closest("[data-reader]");
    if (rd) { openReader(rd); return; }
    var l = e.target.closest("[data-set-lang]");
    if (l) {
      var v = l.getAttribute("data-set-lang");
      /* /books/ and /en/books/ are separate URLs: follow the hreflang alternate, as site.js does. */
      var alt = document.querySelector('link[rel="alternate"][hreflang="' + v + '"]');
      if (alt && v !== state.lang) {
        var u = new URL(alt.href, location.href);
        if (u.pathname !== location.pathname) { store("bk-lang", v); location.assign(u.pathname + u.search + location.hash); return; }
      }
      setLang(v); return;
    }

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
      /* Published spine: the 3D book flies out and back. Ghost spine: its detail panel. */
      if (sp.classList.contains("spine--ghost")) pickShelf(sp.getAttribute("data-pick"));
      else openReader(sp, "spine");
      return;
    }
    if (e.target.closest("[data-close-detail]")) { closeDetail(); return; }
    var vb = e.target.closest("[data-vote]");
    if (vb) { castVote(vb.getAttribute("data-vote")); return; }

    /* A link to a book row (reading order, for instance) shows the list panel first. */
    var hashLink = e.target.closest('a[href^="#"]');
    if (hashLink) showListFor(hashLink.getAttribute("href").slice(1));

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
    if (tab.id === "tab-list") { loadVotes(); loadReviews(); }
    if (focus) tab.focus();
  }
  function showListFor(id) {
    var el = id && document.getElementById(id), list = document.getElementById("panel-list");
    if (el && list && list.hidden && list.contains(el)) selectTab(document.getElementById("tab-list"));
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
    showListFor(location.hash.slice(1));
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
})();
