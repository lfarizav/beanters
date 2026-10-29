// In-page embed of the cell-site figure (no iframe): <div data-mast-embed></div> + <script type="module" src=".../embed.js">.
// The card sizes itself from its content, so it never clips. Live figure at 640px and wider, poster below.
// It follows the page's language (html[lang]) and theme (html[data-theme]) as they change.
import { GENS, UI } from "./content.js";

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
  css(HERE + "mast.css");
  css(HERE + "embed.css");
  root.classList.add("cf", "iso");
  root.setAttribute("data-stage-ignore", "");
  let ctl = null, lang = null, gen = 3, live = false;

  function build() {
    lang = langNow();
    const T = UI[lang];
    root.innerHTML = `
      <div class="cf-card">
        <div class="cf-corners" aria-hidden="true"><span data-corner="fig">${T.fig}</span><span data-corner="title">${T.title}</span><span data-corner="hint">${T.hint}</span><span data-corner="readout"></span></div>
        <div class="cf-stage"></div>
        <img class="cf-poster" alt="" width="520" height="600" decoding="async">
      </div>
      <div class="cf-dial" role="group" aria-label="${T.gens}">${GENS.map((g, i) => `<button type="button" data-i="${i}">${g.id}</button>`).join("")}</div>
      <p class="cf-idea" aria-live="polite"></p>`;
    const poster = root.querySelector(".cf-poster");
    poster.alt = lang === "en" ? "Cell site in its 5G pose: an active antenna steers a beam to a phone." : "Sitio celular en 5G: una antena activa dirige un haz hacia un teléfono.";
    poster.src = HERE + "poster.svg" + (darkNow() ? "#dark" : "");
    root.querySelectorAll(".cf-dial button").forEach((b) => b.addEventListener("click", () => ctl?.set(+b.dataset.i)));
    show(gen);
  }
  function show(i) {
    gen = i;
    const G = GENS[i];
    root.querySelector("[data-corner=readout]").textContent = `${G.id} · ${G.tech}`;
    root.querySelector(".cf-idea").textContent = G[lang].idea;
    root.querySelectorAll(".cf-dial button").forEach((b, n) => b.setAttribute("aria-pressed", String(n === i)));
  }
  async function setup() {
    if (ctl) { ctl.destroy(); ctl = null; }
    build();
    live = wide.matches;
    root.querySelector(".cf-card").toggleAttribute("data-live", live);
    if (!live) return;
    const { mountMast } = await import("./mast-live.js");
    if (!wide.matches) return;
    ctl = mountMast(root.querySelector(".cf-stage"), { lang, gen, idle, onGen: show });
  }
  wide.addEventListener("change", setup);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.attributeName === "lang" && langNow() !== lang) { setup(); return; }
      if (m.attributeName === "data-theme") { const p = root.querySelector(".cf-poster"); if (p) p.src = HERE + "poster.svg" + (darkNow() ? "#dark" : ""); }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "data-theme"] });
  setup();
  return { get controller() { return ctl; } };
}

// Auto-mount: lazily, when the placeholder comes near the viewport.
const targets = document.querySelectorAll("[data-mast-embed]");
if (targets.length) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); mountCard(e.target, { idle: e.target.dataset.mastEmbed !== "still" }); }
  }, { rootMargin: "400px 0px" });
  targets.forEach((t) => io.observe(t));
}
