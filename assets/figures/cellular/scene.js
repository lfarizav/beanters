// Stage scene for the Cellular Networks course: left page text per generation, right page the live mast.
import { GENS, PARTS } from "./content.js";

const HERE = new URL(".", import.meta.url).href;
const PART_ORDER = ["antenna", "baseband", "phone", "beam"];
const COPY = {
  es: { course: "Redes celulares", chapter: (i, n) => `Capítulo ${i} de ${n}`, parts: "Partes del sitio", tap: "Toque una parte del mástil o un botón para ver qué hace en esta generación.", sr: "Figura interactiva: use las flechas para cambiar de generación." },
  en: { course: "Cellular networks", chapter: (i, n) => `Chapter ${i} of ${n}`, parts: "Site parts", tap: "Tap a part of the mast or a button to see what it does in this generation.", sr: "Interactive figure: use the arrow keys to change the generation." },
};

function css(href) {
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
  return new Promise((done) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; l.onload = l.onerror = done; document.head.append(l); });
}

export default {
  title: { es: "Redes celulares: de 2G a 6G", en: "Cellular Networks: 2G to 6G" },
  chapters: GENS.map((g) => ({ id: g.id })),
  enroll: "/courses/cellular-networks/",
  preview: "/courses/cellular-networks/",
  async mount({ left, right, lang, mobile }) {
    const C = COPY[lang];
    await css(HERE + "mast.css");
    const { mountMast } = await import("./mast-live.js");
    left.closest(".stg-sheet").classList.add("iso");
    right.innerHTML = `<div class="stg-fig" style="width:100%;max-width:${mobile ? 460 : 640}px;outline-offset:4px"></div><p class="stg-sr">${C.sr}</p>`;
    const host = right.querySelector(".stg-fig");
    const listeners = {};
    let part = null;
    const ctl = mountMast(host, { lang, gen: 0, onGen: (i) => { render(i); listeners.chapter?.(i); }, onPart: (name, info) => { part = name; renderPart(info); }, onDemo: (on) => listeners.demo?.(on) });
    const svg = host.querySelector("svg");
    svg.style.maxHeight = mobile ? "52vh" : "calc(100vh - 210px)";
    svg.style.margin = "0 auto";

    function partButtons(i) {
      return `<div class="stg-parts" role="group" aria-label="${C.parts}">${PART_ORDER.map((p) => `<button type="button" data-part="${p}" style="--hue:var(--hl-${p})" aria-pressed="${p === part}"${p === "beam" && i < 3 ? " disabled" : ""}>${PARTS[p][lang].name}</button>`).join("")}</div>`;
    }
    function render(i) {
      const G = GENS[i];
      const paint = () => {
        left.innerHTML = `
          <p class="stg-kicker">${C.chapter(i + 1, GENS.length)} · ${C.course}</p>
          <h2 class="stg-h">${G.id}<small>${G.tech}</small></h2>
          <p class="stg-idea">${G[lang].idea}</p>
          <ul class="stg-checks">${G[lang].lines.map((l) => `<li>${l}</li>`).join("")}</ul>
          ${partButtons(i)}
          <div class="stg-part" aria-live="polite"${part ? ` style="--hue:var(--hl-${part})"` : " hidden"}>${part ? `<b>${PARTS[part][lang].name}</b>${PARTS[part][lang].by[i]}` : C.tap}</div>`;
      };
      if (!left.firstElementChild || matchMedia("(prefers-reduced-motion: reduce)").matches) { paint(); return; }
      left.setAttribute("data-swap", "");
      setTimeout(() => { paint(); requestAnimationFrame(() => left.removeAttribute("data-swap")); }, 180);
    }
    function renderPart(info) {
      const box = left.querySelector(".stg-part");
      left.querySelectorAll(".stg-parts button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.part === part)));
      if (!box) return;
      if (info && info.text) { box.hidden = false; box.style.setProperty("--hue", `var(--hl-${part})`); box.innerHTML = `<b>${info.name}</b>${info.text}`; }
      else { box.hidden = true; box.removeAttribute("style"); box.textContent = C.tap; }
    }
    left.addEventListener("click", (e) => { const b = e.target.closest(".stg-parts button"); if (b) ctl.select(b.dataset.part); });
    render(0);

    return {
      get chapter() { return ctl.gen; },
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
