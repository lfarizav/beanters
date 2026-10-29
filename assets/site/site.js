/* Beanters shared shell: theme toggle, ES/EN language, mobile menu, nav scroll edge.
   Storage keys match /books/ (bk-theme, bk-lang) so choices carry across the site.
   Translations: the page's HTML is the Spanish source. Elements carry data-i18n="key"
   (innerHTML) and/or data-i18n-attr="attr:key;attr:key". English strings come from
   window.SITE_I18N.en, defined by the page before this script loads. */
(function () {
  "use strict";

  var root = document.documentElement;
  var DICT = (window.SITE_I18N && window.SITE_I18N.en) || {};
  var UI = {
    es: { themeToDark: "Cambiar a tema oscuro", themeToLight: "Cambiar a tema claro", menuOpen: "Abrir menú", menuClose: "Cerrar menú" },
    en: { themeToDark: "Switch to dark theme", themeToLight: "Switch to light theme", menuOpen: "Open menu", menuClose: "Close menu" }
  };

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lang() { return root.getAttribute("lang") === "en" ? "en" : "es"; }

  /* Remember the Spanish source once, so switching back needs no second dictionary. */
  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  var attrNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n-attr]"));
  nodes.forEach(function (el) { el._es = el.innerHTML; });
  attrNodes.forEach(function (el) {
    el._esAttr = {};
    el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
      var a = pair.split(":")[0].trim();
      if (a) el._esAttr[a] = el.getAttribute(a);
    });
  });
  var esTitle = document.title;

  function applyLang(l) {
    root.setAttribute("lang", l); /* drives hyphenation and the data-only blocks */
    nodes.forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      el.innerHTML = l === "en" && DICT[k] != null ? DICT[k] : el._es;
    });
    attrNodes.forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":"), a = (p[0] || "").trim(), k = (p[1] || "").trim();
        if (!a || !k) return;
        var v = l === "en" && DICT[k] != null ? DICT[k] : el._esAttr[a];
        if (v != null) el.setAttribute(a, v);
      });
    });
    document.title = l === "en" && DICT._title ? DICT._title : esTitle;
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l));
    });
    syncThemeLabel();
    syncMenuLabel();
  }

  function isDark() {
    var a = root.getAttribute("data-theme");
    if (a === "dark") return true;
    if (a === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncThemeLabel() {
    var b = document.getElementById("theme-toggle");
    if (b) b.setAttribute("aria-label", UI[lang()][isDark() ? "themeToLight" : "themeToDark"]);
  }

  var nav = document.getElementById("nav");
  var menuBtn = document.querySelector(".nav__menu");
  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    syncMenuLabel();
  }
  function syncMenuLabel() {
    if (menuBtn) menuBtn.setAttribute("aria-label", UI[lang()][nav && nav.classList.contains("is-open") ? "menuClose" : "menuOpen"]);
  }

  document.addEventListener("click", function (e) {
    var l = e.target.closest("[data-set-lang]");
    if (l) {
      var v = l.getAttribute("data-set-lang");
      store("bk-lang", v);
      applyLang(v);
      return;
    }
    if (e.target.closest("#theme-toggle")) {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("bk-theme", next);
      syncThemeLabel();
      return;
    }
    if (menuBtn && e.target.closest(".nav__menu")) { setMenu(!nav.classList.contains("is-open")); return; }
    if (nav && nav.classList.contains("is-open") && (e.target.closest(".nav__links a") || !e.target.closest("#nav"))) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncThemeLabel);

  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  applyLang(lang());
})();
