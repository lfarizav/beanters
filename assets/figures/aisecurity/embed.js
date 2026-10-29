// In-page embed of the AI-security model (no iframe): <div data-aisec-embed></div> + <script type="module" src=".../embed.js">.
// Live figure at 640px and wider, the poster below. Follows the page's language and theme as they change.
import { CHAPTERS, UI } from "./content.js";

const HERE = new URL(".", import.meta.url).href;
const wide = matchMedia("(min-width: 640px)");

function css(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.href = href;
  document.head.append(l);
}
const langNow = () => {
  const h = (document.documentElement.lang || "").slice(0, 2);
  if (h === "en" || h === "es") return h;
  try { const l = localStorage.getItem("bk-lang"); if (l === "en" || l === "es") return l; } catch (e) { /* ignore */ }
  return "es";
};
const darkNow = () => {
  const t = document.documentElement.getAttribute("data-theme");
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
};

export function mountCard(root, { idle = true } = {}) {
  css(HERE + "scene.css");
  css(HERE + "embed.css");
  root.classList.add("sf", "iso");
  root.setAttribute("data-stage-ignore", "");
  let ctl = null, lang = null, chapter = 0;

  function build() {
    lang = langNow();
    const T = UI[lang];
    root.innerHTML = `
      <div class="sf-card">
        <div class="sf-corners" aria-hidden="true"><span data-corner="fig">${T.fig}</span><span data-corner="title">${T.title}</span><span data-corner="hint">${T.hint}</span><span data-corner="readout"></span></div>
        <div class="sf-stage"></div>
        <img class="sf-poster" alt="" width="640" height="480" decoding="async">
      </div>
      <div class="sf-dial" role="group" aria-label="${T.chapters}">${CHAPTERS.map((c, i) => `<button type="button" data-i="${i}" title="${c[lang].name}">${c.id}</button>`).join("")}</div>
      <p class="sf-idea" aria-live="polite"></p>`;
    const poster = root.querySelector(".sf-poster");
    poster.alt = T.alt;
    poster.src = HERE + "poster.svg" + (darkNow() ? "#dark" : "");
    root.querySelectorAll(".sf-dial button").forEach((b) => b.addEventListener("click", () => ctl?.set(+b.dataset.i)));
    show(chapter);
  }
  function show(i) {
    chapter = i;
    const C = CHAPTERS[i][lang];
    root.querySelector(".sf-idea").textContent = `${CHAPTERS[i].id} · ${C.name}: ${C.idea}`;
    root.querySelectorAll(".sf-dial button").forEach((b, n) => b.setAttribute("aria-pressed", String(n === i)));
  }
  async function setup() {
    if (ctl) { ctl.destroy(); ctl = null; }
    build();
    const live = wide.matches;
    root.querySelector(".sf-card").toggleAttribute("data-live", live);
    if (!live) return;
    const { mountScene } = await import("./live.js");
    if (!wide.matches) return;
    ctl = mountScene(root.querySelector(".sf-stage"), { lang, chapter, idle, onChapter: show, onReadout: (t) => { const r = root.querySelector("[data-corner=readout]"); if (r) r.textContent = t; } });
  }
  wide.addEventListener("change", setup);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.attributeName === "lang" && langNow() !== lang) { setup(); return; }
      if (m.attributeName === "data-theme") { const p = root.querySelector(".sf-poster"); if (p) p.src = HERE + "poster.svg" + (darkNow() ? "#dark" : ""); }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "data-theme"] });
  setup();
  return { get controller() { return ctl; } };
}

const targets = document.querySelectorAll("[data-aisec-embed]");
if (targets.length) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); mountCard(e.target, { idle: e.target.dataset.aisecEmbed !== "still" }); }
  }, { rootMargin: "400px 0px" });
  targets.forEach((t) => io.observe(t));
}
