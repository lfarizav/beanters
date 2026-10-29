// Embeddable card: the live figure at 640px and wider, the static poster below that.
import { GENS, UI, langOf } from "./content.js";

const lang = langOf();
const T = UI[lang];
document.documentElement.lang = lang;
document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = T[el.dataset.t]; });
const card = document.querySelector(".cf-card");
const stageEl = document.querySelector(".cf-stage");
const poster = document.querySelector(".cf-poster");
const dialEl = document.querySelector(".cf-dial");
const idea = document.querySelector(".cf-idea");
const readout = document.querySelector("[data-readout]");
const dark = () => document.documentElement.getAttribute("data-theme") === "dark" || (!document.documentElement.hasAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
poster.alt = lang === "en" ? "Cell site in its 5G pose: an active antenna steers a beam to a phone." : "Sitio celular en 5G: una antena activa dirige un haz hacia un teléfono.";
if (dark()) poster.src = "poster.svg#dark";
dialEl.setAttribute("aria-label", T.gens);

const buttons = GENS.map((g, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = g.id;
  b.dataset.i = i;
  dialEl.append(b);
  return b;
});
function show(i) {
  const G = GENS[i];
  readout.textContent = `${G.id} · ${G.tech}`;
  idea.textContent = G[lang].idea;
  buttons.forEach((b, n) => b.setAttribute("aria-pressed", String(n === i)));
}

const wide = matchMedia("(min-width: 640px)");
let ctl = null;
async function setup() {
  if (wide.matches && !ctl) {
    const { mountMast } = await import("./mast-live.js");
    ctl = mountMast(stageEl, { lang, gen: 3, onGen: show });
    card.dataset.live = "";
  }
  if (!wide.matches) show(3);
}
buttons.forEach((b) => b.addEventListener("click", () => { if (ctl) ctl.set(+b.dataset.i); }));
wide.addEventListener("change", setup);
show(3);
setup();
