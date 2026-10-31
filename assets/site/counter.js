/* Beanters anonymous counters: page visits and books opened.
   No cookies, no IP, no identifiers. The only browser storage is one sessionStorage flag
   ("bk-visit") so a tab counts as one visit however often it reloads or navigates.
   Backend: Cloudflare Worker + D1 at /api/counter/* (see /worker/ in the repo).
   If the API is missing or fails, nothing is rendered and the page behaves as before.
   On localhost nothing is sent unless the URL has ?counter=test. */
(function () {
  "use strict";

  var API = "/api/counter/";
  var root = document.documentElement;
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var sendOk = !isLocal || /[?&]counter=test(&|$)/.test(location.search);
  var L = {
    es: { visits: "Visitas", books: "Libros abiertos", aria: "Contadores anónimos del sitio" },
    en: { visits: "Visits", books: "Books opened", aria: "Anonymous site counters" }
  };

  function lang() { return root.getAttribute("lang") === "en" ? "en" : "es"; }

  function post(payload) {
    if (!sendOk) return;
    var body = JSON.stringify(payload);
    try {
      /* text/plain keeps the request "simple" (no CORS preflight) in any deployment. */
      if (navigator.sendBeacon && navigator.sendBeacon(API + "hit", body)) return;
    } catch (e) {}
    try {
      fetch(API + "hit", { method: "POST", body: body, keepalive: true, credentials: "omit" }).catch(function () {});
    } catch (e) {}
  }

  /* One visit per tab session. Without sessionStorage nothing is sent, to avoid inflating. */
  function countVisit() {
    try {
      if (sessionStorage.getItem("bk-visit")) return;
      sessionStorage.setItem("bk-visit", "1");
    } catch (e) { return; }
    post({ t: "visit" });
  }

  window.BeantersCounter = {
    book: function (id) { if (typeof id === "string" && id) post({ t: "book", id: id }); }
  };

  /* ---- Footer block ---- */
  var box = document.querySelector("[data-counters]");
  var data = null;
  var animated = false;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fmt(n) {
    try { return new Intl.NumberFormat(lang() === "en" ? "en-US" : "es-CO").format(n); } catch (e) { return String(n); }
  }

  function build() {
    box.innerHTML = "";
    box.setAttribute("role", "group");
    [["visits", "visits"], ["books", "books_opened"]].forEach(function (p) {
      var item = document.createElement("p");
      item.className = "counter";
      var num = document.createElement("span");
      num.className = "counter__n";
      num.setAttribute("data-n", String(data[p[1]]));
      var lab = document.createElement("span");
      lab.className = "counter__l";
      lab.setAttribute("data-k", p[0]);
      item.appendChild(num);
      item.appendChild(lab);
      box.appendChild(item);
    });
  }

  function labels() {
    box.setAttribute("aria-label", L[lang()].aria);
    Array.prototype.forEach.call(box.querySelectorAll(".counter__l"), function (el) {
      el.textContent = L[lang()][el.getAttribute("data-k")];
    });
    if (!animated) Array.prototype.forEach.call(box.querySelectorAll(".counter__n"), function (el) {
      el.textContent = fmt(Number(el.getAttribute("data-n")));
    });
  }

  function countUp() {
    animated = true;
    var els = Array.prototype.slice.call(box.querySelectorAll(".counter__n"));
    var t0 = null, dur = 700;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      els.forEach(function (el) { el.textContent = fmt(Math.round(Number(el.getAttribute("data-n")) * e)); });
      if (k < 1) requestAnimationFrame(step); else animated = false;
    }
    requestAnimationFrame(step);
  }

  function valid(j) {
    return j && typeof j === "object" && isFinite(j.visits) && isFinite(j.books_opened) && j.visits >= 0 && j.books_opened >= 0;
  }

  function render() {
    if (!box) return;
    fetch(API + "stats", { credentials: "omit", headers: { Accept: "application/json" } })
      .then(function (r) {
        var ct = r.headers.get("content-type") || "";
        if (!r.ok || ct.indexOf("json") < 0) throw new Error("stats unavailable");
        return r.json();
      })
      .then(function (j) {
        if (!valid(j)) throw new Error("stats malformed");
        data = j;
        build();
        labels();
        box.hidden = false;
        if (!reduce) countUp();
      })
      .catch(function () {
        box.hidden = true;
        try { console.warn("[counter] stats not available"); } catch (e) {}
      });
  }

  if (box) {
    box.hidden = true;
    new MutationObserver(function () { if (data) labels(); }).observe(root, { attributes: true, attributeFilter: ["lang"] });
  }

  countVisit();
  render();
})();
