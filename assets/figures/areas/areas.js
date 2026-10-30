// Home page, "areas of action": one live isometric scene at the top of each pillar card.
// Markup: <div class="ar" data-area data-src="/assets/figures/area-x/live.js?v=..." data-poster="..."> with an
// <img class="ar-poster"> inside. The poster stays until the scene's script loads (and if it fails).
// Each scene loads only when its card comes near the viewport, loops through its phases by itself (the
// engine's idle tour), pauses offscreen (the engine's IntersectionObserver) and holds a still pose under
// prefers-reduced-motion. Labels are HTML pins, bilingual, re-rendered when the page language changes.
import { mountFigure, langNow, darkNow, css } from "../agentic/engine.js";

const V = "?v=20261030b";
const KIT_CSS = new URL("../cellular/mast.css" + V, import.meta.url).href;
const SCENE_CSS = new URL("./scene.css" + V, import.meta.url).href;

const still = matchMedia("(prefers-reduced-motion: reduce)");
const UI = {
  es: { pause: "Pausar animación", play: "Reanudar animación" },
  en: { pause: "Pause animation", play: "Resume animation" },
};

function card(root) {
  root.classList.add("iso"); // the kit palette and scene tokens are scoped to .iso
  const poster = root.getAttribute("data-poster");
  let def = null, ctl = null, lang = null, ch = 0, paused = false, inked = false;

  async function setup() {
    try { [def] = await Promise.all([def || import(root.getAttribute("data-src")).then((m) => m.default), css(KIT_CSS), css(SCENE_CSS)]); } catch (e) { return; } // keep the poster
    if (ctl) { ch = ctl.chapter; ctl.destroy(); ctl = null; }
    lang = langNow();
    const W = def.size[0], H = def.size[1];
    const n = def.chapters.length;
    root.innerHTML = `
      <div class="ar-card">
        <div class="ar-stage" style="aspect-ratio:${W}/${H}"></div>
        <div class="ar-pins" aria-hidden="true">${Object.entries(def.pins).map(([name, [x, y, dir]]) => {
          const side = x / W > 0.64 ? "r" : x / W < 0.36 ? "l" : "c";
          return `<span class="ar-pin" data-pin="${name}" data-side="${side}"${dir === "b" ? " data-below" : ""} style="left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%"><em>${def.words[name][lang]}</em><i></i></span>`;
        }).join("")}</div>
      </div>
      <div class="ar-bar">
        <p class="ar-cap" aria-live="polite"><b></b> <span></span></p>
        <button type="button" class="ar-pause" aria-pressed="${paused}" aria-label="${paused ? UI[lang].play : UI[lang].pause}"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="i-pause" d="M7 5v10M13 5v10"/><path class="i-play" d="M7 5.2v9.6L14.6 10z"/></svg></button>
      </div>`;
    const btn = root.querySelector(".ar-pause");
    btn.hidden = still.matches;
    btn.addEventListener("click", () => {
      paused = !paused;
      btn.setAttribute("aria-pressed", String(paused));
      btn.setAttribute("aria-label", paused ? UI[lang].play : UI[lang].pause);
      ctl?.hold(paused);
    });
    const start = still.matches ? def.still : ch;
    ctl = mountFigure(root.querySelector(".ar-stage"), def, { lang, chapter: start, idle: true, still: paused, onChapter: show });
    show(ctl.chapter);
    if (!inked && !still.matches) { inked = true; ctl.ink(); }
    root.setAttribute("data-live", "");
    root.dataset.n = String(n);
  }
  function show(i) {
    ch = i;
    const G = def.chapters[i];
    root.querySelector(".ar-cap b").textContent = `${i + 1}/${def.chapters.length}`;
    root.querySelector(".ar-cap span").textContent = G[lang].name;
    root.querySelectorAll(".ar-pin").forEach((p) => p.toggleAttribute("data-on", G.pins.includes(p.dataset.pin)));
    root.dataset.chapter = String(i);
  }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); setup(); }
  }, { rootMargin: "300px 0px" });
  io.observe(root);
  still.addEventListener("change", () => { if (ctl) { if (still.matches) ctl.set(def.still); const b = root.querySelector(".ar-pause"); if (b) b.hidden = still.matches; } });
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.attributeName === "lang" && ctl && langNow() !== lang) { setup(); return; }
      if (m.attributeName === "data-theme" && !ctl) { const img = root.querySelector(".ar-poster"); if (img && poster) img.src = poster + (darkNow() ? "#dark" : ""); }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "data-theme"] });
  if (poster && darkNow()) { const img = root.querySelector(".ar-poster"); if (img) img.src = poster + "#dark"; }
}

document.querySelectorAll("[data-area]").forEach(card);
