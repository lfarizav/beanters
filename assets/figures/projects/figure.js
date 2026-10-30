// In-page figure for /projects/: the live model at every width, phase chips, a pause button, a caption and
// HTML labels pinned to the parts (bilingual, re-rendered when the page language changes).
// Markup: <div data-projects-figure> with an <img class="pj-poster"> fallback inside. Shared runtime: ../agentic/engine.js.
import { mountFigure, langNow, darkNow } from "../agentic/engine.js";
import { PINS } from "./content.js?v=20261030c";

const W = 760, H = 580;
const root = document.querySelector("[data-projects-figure]");
const still = matchMedia("(prefers-reduced-motion: reduce)");

if (root) {
  root.classList.add("iso"); // the kit palette (mast.css) and scene tokens are scoped to .iso
  const poster = root.getAttribute("data-poster");
  let def = null, ctl = null, lang = null, ch = 0, paused = still.matches, inked = false;

  async function setup() {
    def = def || (await import("./live.js?v=20261030c")).default;
    if (ctl) { ch = ctl.chapter; ctl.destroy(); ctl = null; }
    lang = langNow();
    const C = def.copy[lang];
    root.innerHTML = `
      <div class="pj-card">
        <div class="pj-stage" style="aspect-ratio:${W}/${H}"></div>
        <div class="pj-pins" aria-hidden="true"></div>
      </div>
      <div class="pj-bar">
        <div class="pj-dial" role="group" aria-label="${C.phases}">${def.chapters.map((g, i) => `<button type="button" data-i="${i}" aria-label="${g.id}. ${g[lang].name}">${g.id}</button>`).join("")}</div>
        <button type="button" class="pj-pause" aria-pressed="${paused}" aria-label="${paused ? C.play : C.pause}"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="i-pause" d="M7 5v10M13 5v10"/><path class="i-play" d="M7 5.2v9.6L14.6 10z"/></svg></button>
      </div>
      <p class="pj-cap" aria-live="polite"><b></b> <span></span></p>`;
    const pins = root.querySelector(".pj-pins");
    const { DATA } = await import("./art.js?v=20261030c");
    pins.innerHTML = Object.entries(DATA.pins).map(([name, [x, y]]) => `<span class="pj-pin" data-pin="${name}" style="left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%"><i></i><em>${PINS[name][lang]}</em></span>`).join("");
    // a chip click counts as input, so the idle tour waits before it moves on (the engine listens for focusin)
    root.querySelectorAll(".pj-dial button").forEach((b) => b.addEventListener("click", () => { if (!ctl) return; ctl.set(+b.dataset.i); root.querySelector(".pj-stage").dispatchEvent(new Event("focusin")); }));
    const pauseBtn = root.querySelector(".pj-pause");
    pauseBtn.addEventListener("click", () => {
      paused = !paused;
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.setAttribute("aria-label", paused ? C.play : C.pause);
      ctl?.hold(paused);
    });
    ctl = mountFigure(root.querySelector(".pj-stage"), def, { lang, chapter: ch, idle: true, still: paused, onChapter: show });
    show(ctl.chapter);
    if (!inked && !still.matches) { inked = true; ctl.ink(); }
  }
  function show(i) {
    ch = i;
    const G = def.chapters[i];
    root.querySelector(".pj-cap b").textContent = `${G.id}. ${G[lang].name}.`;
    root.querySelector(".pj-cap span").textContent = G[lang].idea;
    root.querySelectorAll(".pj-dial button").forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
    root.querySelectorAll(".pj-pin").forEach((p) => p.toggleAttribute("data-on", G.pins.includes(p.dataset.pin)));
  }

  // Start when the figure comes near the viewport; keep the poster until then (and if scripts fail).
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); setup(); }
  }, { rootMargin: "300px 0px" });
  io.observe(root);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.attributeName === "lang" && ctl && langNow() !== lang) { setup(); return; }
      if (m.attributeName === "data-theme" && !ctl) { const img = root.querySelector(".pj-poster"); if (img && poster) img.src = poster + (darkNow() ? "#dark" : ""); }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "data-theme"] });
  if (poster) { const img = root.querySelector(".pj-poster"); if (img && darkNow()) img.src = poster + "#dark"; }
}
