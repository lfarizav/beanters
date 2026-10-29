// Stage scene for "Gestión del riesgo para telco e IA cloud native": left page text per module, right page the live register.
// Loaded by /assets/figures/stage/stage.js from a card with data-stage="/assets/figures/riskmgmt/scene.js".
import { CHAPTERS, PARTS, COURSE, UI, ENROLL } from "./content.js";
import { PARTS as PART_ORDER } from "./model.js";

const HERE = new URL(".", import.meta.url).href;
const langNow = () => ((document.documentElement.lang || "").slice(0, 2) === "en" ? "en" : "es");

function css(href) {
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
  return new Promise((done) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; l.onload = l.onerror = done; document.head.append(l); });
}

export default {
  title: { es: COURSE.es.title, en: COURSE.en.title },
  // short ids under 640px, so six chips fit the phone capsule
  get chapters() { const narrow = matchMedia("(max-width: 639px)").matches; return CHAPTERS.map((c) => ({ id: narrow ? c.id.slice(1) : c.id })); },
  get enroll() { return ENROLL[langNow()]; },
  preview: null,
  async mount({ left, right, lang, mobile }) {
    const T = UI[lang];
    const K = COURSE[lang];
    await css(HERE + "scene.css");
    const { mountScene } = await import("./live.js");
    left.closest(".stg-sheet").classList.add("iso", "sc-long");
    right.innerHTML = `<div class="stg-fig" style="width:100%;max-width:${mobile ? 520 : 820}px;outline-offset:4px"></div><p class="stg-sr">${T.sr}</p>`;
    const host = right.querySelector(".stg-fig");
    const listeners = {};
    let part = null, info = null;
    const ctl = mountScene(host, { lang, sweep: false, onChapter: (i) => { render(i); listeners.chapter?.(i); }, onPart: (name, inf) => { part = name; info = inf; renderPart(); }, onDemo: (on) => listeners.demo?.(on) });
    const svg = host.querySelector("svg");
    svg.style.maxHeight = mobile ? "46vh" : "calc(100vh - 210px)";
    svg.style.margin = "0 auto";

    const partButtons = () => `<div class="stg-parts" role="group" aria-label="${T.parts}">${PART_ORDER.map((p) => `<button type="button" data-part="${p}" aria-pressed="${p === part}">${PARTS[p][lang].name}</button>`).join("")}</div>`;
    const partBox = () => (info ? `<b>${info.name}</b>${info.text}${info.tokens && info.tokens.length ? `<span class="sc-tokens">${T.lit}: ${info.tokens.join(" · ")}</span>` : ""}` : T.hint);
    function render(i) {
      const C = CHAPTERS[i][lang];
      const paint = () => {
        left.innerHTML = `
          <p class="stg-kicker">${T.chapter(i + 1, CHAPTERS.length)} · ${K.level}</p>
          <h2 class="stg-h">${C.name}<small>${CHAPTERS[i].id} · ${C.hours}</small></h2>
          <p class="stg-idea">${C.idea}</p>
          <ul class="stg-checks">${C.lines.map((l) => `<li>${l}</li>`).join("")}</ul>
          ${partButtons()}
          <div class="stg-part" aria-live="polite"${info ? "" : " hidden"}>${partBox()}</div>`;
      };
      if (!left.firstElementChild || matchMedia("(prefers-reduced-motion: reduce)").matches) { paint(); return; }
      left.setAttribute("data-swap", "");
      setTimeout(() => { paint(); requestAnimationFrame(() => left.removeAttribute("data-swap")); }, 180);
    }
    function renderPart() {
      left.querySelectorAll(".stg-parts button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.part === part)));
      const box = left.querySelector(".stg-part");
      if (!box) return;
      box.hidden = !info;
      box.innerHTML = partBox();
    }
    left.addEventListener("click", (e) => { const b = e.target.closest(".stg-parts button"); if (b) ctl.select(b.dataset.part); });
    render(0);

    return {
      get chapter() { return ctl.chapter; },
      go: (i) => ctl.set(i),
      demo: (on) => ctl.demo(on),
      hold: (on) => ctl.hold(on),
      reveal: () => ctl.ink(),
      select: (p) => ctl.select(p),
      on: (name, fn) => { listeners[name] = fn; },
      destroy: () => ctl.destroy(),
    };
  },
};
