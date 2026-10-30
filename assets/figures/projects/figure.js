// In-page figures for /projects/: each live model at every width, phase chips, a pause button, a caption and
// HTML labels pinned to the parts (bilingual, re-rendered when the page language changes).
// Markup: <div data-projects-figure data-live="/assets/figures/<scene>/live.js?v=..." data-poster="..."> with an
// <img class="pj-poster"> fallback inside. The live module's default export carries { svg, P, chapters, parts,
// copy, live, dwell, pins, data, size }. Shared runtime: ../agentic/engine.js.
import { mountFigure, langNow, darkNow } from "../agentic/engine.js";

const still = matchMedia("(prefers-reduced-motion: reduce)");

function mount(root) {
  root.classList.add("iso"); // the kit palette (mast.css) and scene tokens are scoped to .iso
  const poster = root.getAttribute("data-poster");
  let def = null, ctl = null, lang = null, ch = 0, paused = still.matches, inked = false;
  // Own tour: each phase stays for its full dwell (a chip click restarts the count); it waits while the figure is
  // hovered, offscreen, in a hidden tab, paused or under reduced motion.
  let tour = 0, visible = false, hovered = false;
  const schedule = () => { clearTimeout(tour); if (def && ctl) tour = setTimeout(step, def.dwell(ch)); };
  function step() {
    if (!ctl) return;
    if (paused || still.matches || hovered || !visible || document.hidden) { tour = setTimeout(step, 1000); return; }
    ctl.set((ctl.chapter + 1) % def.chapters.length);
  }
  new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; }, { rootMargin: "0px" }).observe(root);
  root.addEventListener("pointerenter", () => { hovered = true; });
  root.addEventListener("pointerleave", () => { hovered = false; });

  async function setup() {
    def = def || (await import(new URL(root.getAttribute("data-live"), location.href).href)).default;
    if (ctl) { ch = ctl.chapter; ctl.destroy(); ctl = null; }
    lang = langNow();
    const C = def.copy[lang];
    const [W, H] = def.size;
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
    root.querySelector(".pj-pins").innerHTML = Object.entries(def.data.pins).map(([name, [x, y]]) => `<span class="pj-pin" data-pin="${name}" style="left:${((x / W) * 100).toFixed(2)}%;top:${((y / H) * 100).toFixed(2)}%"><i></i><em>${def.pins[name][lang]}</em></span>`).join("");
    root.querySelectorAll(".pj-dial button").forEach((b) => b.addEventListener("click", () => { if (ctl) ctl.set(+b.dataset.i); }));
    const pauseBtn = root.querySelector(".pj-pause");
    pauseBtn.addEventListener("click", () => {
      paused = !paused;
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.setAttribute("aria-label", paused ? C.play : C.pause);
      ctl?.hold(paused);
      schedule();
    });
    ctl = mountFigure(root.querySelector(".pj-stage"), def, { lang, chapter: ch, idle: false, still: paused, onChapter: show });
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
    schedule();
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
  if (poster && darkNow()) { const img = root.querySelector(".pj-poster"); if (img) img.src = poster + "#dark"; }
}

document.querySelectorAll("[data-projects-figure]").forEach(mount);
