// Stage scene for the Cellular Networks course, second figure: an isometric scale model of a 5G system
// (NG-RAN with three gNBs, the 5G core on a service bus, a data network and a moving phone).
// Left page: chapter text, the procedure steps and the explanation of the picked part. Right page: the live model.
import { CHAPTERS, NF, IF, UI, srcLine } from "./content.js?v=20261030a";

const V = "?v=20261030a";
const HERE = new URL(".", import.meta.url).href;
const ORDER_NF = ["ue", "gnb", "amf", "smf", "upf", "ausf", "udm", "pcf", "nrf", "nssf", "dn"];
const ORDER_IF = ["uu", "n1", "n2", "n3", "n4", "n6", "xn", "sbi"];

function langNow() {
  const h = (document.documentElement.lang || "").slice(0, 2);
  if (h === "en" || h === "es") return h;
  try { const l = localStorage.getItem("bk-lang"); if (l === "en" || l === "es") return l; } catch (e) { /* ignore */ }
  return "es";
}
function css(href) {
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
  return new Promise((done) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; l.onload = l.onerror = done; document.head.append(l); });
}
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export default {
  title: { es: "Redes celulares: núcleo 5G y RAN", en: "Cellular Networks: 5G core and RAN" },
  get chapters() { const l = langNow(); return CHAPTERS.map((c) => ({ id: c.chip[l] })); },
  enroll: "/courses/cellular-networks/",
  preview: "/courses/cellular-networks/",
  async mount({ left, right, lang, mobile }) {
    const T = UI[lang];
    await css(HERE + "core.css" + V);
    await css(HERE + "scene.css" + V);
    const { mountCore } = await import("./live.js" + V);
    left.closest(".stg-sheet").classList.add("iso", "c5");
    right.innerHTML = `
      <div class="c5-card">
        <div class="c5-corners" aria-hidden="true"><span data-corner="fig">${T.fig}</span><span data-corner="title">${T.figTitle}</span><span data-corner="hint">${T.hint}</span><span data-corner="readout"></span></div>
        <div class="c5-host"></div>
        <div class="c5-legend" aria-label="${lang === "en" ? "Legend" : "Leyenda"}">
          <span data-k="cp"><svg viewBox="0 0 26 6" aria-hidden="true"><path d="M1 3h24"/></svg>${T.legend.cp}</span>
          <span data-k="up"><svg viewBox="0 0 26 6" aria-hidden="true"><path d="M1 3h24"/></svg>${T.legend.up}</span>
          <span data-k="n1"><svg viewBox="0 0 26 6" aria-hidden="true"><path d="M1 3h24"/></svg>${T.legend.n1}</span>
          <span data-k="radio"><svg viewBox="0 0 26 6" aria-hidden="true"><path d="M1 3h24"/></svg>${T.legend.radio}</span>
        </div>
      </div>`;
    const host = right.querySelector(".c5-host");
    const readout = right.querySelector("[data-corner=readout]");
    const listeners = {};
    let pickInfo = null;
    let ctl = null;
    ctl = mountCore(host, {
      lang, idle: true,
      onChapter: (i) => { render(i); listeners.chapter?.(i); requestAnimationFrame(() => { const c = left.closest(".stg-sheet")?.querySelector(".stg-chip[aria-pressed=true]"), row = c?.parentElement; if (row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: c.offsetLeft - (row.clientWidth - c.offsetWidth) / 2, behavior: "smooth" }); }); },
      onStep: (i, ctx) => markStep(i, ctx),
      onSelect: (key, info) => { pickInfo = key ? { key, info } : null; renderPick(); },
      onDemo: (on) => listeners.demo?.(on),
    });
    host.querySelector(".iso-svg").style.maxHeight = mobile ? "46vh" : "calc(100vh - 280px)";

    const gName = (i) => `gNB${i + 1}`;
    function stepText(C, s) { return s[lang]; }
    function partButtons() {
      const btn = (key, src) => `<button type="button" data-pick="${key}" data-plane="${src[key].plane}" aria-pressed="false">${src[key].name}</button>`;
      return `<div class="c5-group"><p class="c5-label">${T.nfs}</p><div class="stg-parts c5-parts">${ORDER_NF.map((k) => btn(k, NF)).join("")}</div></div>
        <div class="c5-group"><p class="c5-label">${T.ifs}</p><div class="stg-parts c5-parts">${ORDER_IF.map((k) => btn(k, IF)).join("")}</div></div>`;
    }
    function render(i) {
      const C = CHAPTERS[i];
      const L = C[lang];
      const paint = () => {
        const steps = C.steps.length && C.id !== "functions"
          ? `<p class="c5-label">${T.steps}${C.id === "handover" ? ` <span class="c5-ho" aria-live="polite"></span>` : ""}</p><ol class="c5-steps">${C.steps.map((s, n) => `<li><button type="button" data-step="${n}"><span class="c5-n">${n + 1}</span><span>${esc(stepText(C, s))}${s.ref ? ` <small>${esc(s.ref)}</small>` : ""}</span></button></li>`).join("")}</ol>`
          : partButtons();
        left.innerHTML = `
          <p class="stg-kicker">${T.chapter(i + 1, CHAPTERS.length)} · ${T.course}</p>
          <h2 class="stg-h">${L.title}<small>${L.sub}</small></h2>
          <p class="stg-idea">${L.idea}</p>
          ${C.note ? `<p class="c5-note">${C.note[lang]}</p>` : ""}
          ${steps}
          <div class="stg-part c5-info" aria-live="polite" hidden>${T.tap}</div>
          <p class="c5-src">${T.source}: ${esc(srcLine(C.ref))}</p>`;
        renderPick();
        if (ctl && ctl.step >= 0) markStep(ctl.step, ctl.ctx);
      };
      if (!left.firstElementChild || matchMedia("(prefers-reduced-motion: reduce)").matches) { paint(); return; }
      left.setAttribute("data-swap", "");
      setTimeout(() => { paint(); requestAnimationFrame(() => left.removeAttribute("data-swap")); }, 180);
    }
    function markStep(i, ctx) {
      const C = CHAPTERS[ctl ? ctl.chapter : 0];
      const s = C.steps[i];
      left.querySelectorAll(".c5-steps button").forEach((b) => b.toggleAttribute("data-now", +b.dataset.step === i));
      const ho = left.querySelector(".c5-ho");
      if (ho && ctx) ho.textContent = `· ${gName(ctx.s)} → ${gName(ctx.t)}`;
      if (s) readout.textContent = `${T.step} ${i + 1}/${C.steps.length}${ctx ? ` · ${gName(ctx.s)} → ${gName(ctx.t)}` : ""}`;
      const now = left.querySelector(".c5-steps button[data-now]");
      if (now && left.scrollHeight > left.clientHeight) { const r = now.getBoundingClientRect(), p = left.getBoundingClientRect(); if (r.bottom > p.bottom - 20 || r.top < p.top + 20) left.scrollTo({ top: left.scrollTop + r.top - p.top - p.height / 2, behavior: "smooth" }); }
    }
    function renderPick() {
      const box = left.querySelector(".c5-info");
      left.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(!!pickInfo && b.dataset.pick === pickInfo.key)));
      if (!box) return;
      if (pickInfo && pickInfo.info) {
        const I = pickInfo.info, W = I[lang];
        box.hidden = false;
        box.dataset.plane = I.plane;
        box.innerHTML = `<b>${I.name} · ${esc(W.full)}</b>${esc(W.text)}<small>${esc(srcLine(I.ref))}</small>`;
        if (ctl && CHAPTERS[ctl.chapter].id === "functions") readout.textContent = `${I.name} · ${W.full}`;
      } else { box.hidden = true; box.removeAttribute("data-plane"); box.textContent = T.tap; }
    }
    left.addEventListener("click", (e) => {
      const st = e.target.closest("[data-step]");
      if (st) { const ctx = ctl.ctx; ctl.stepIndex(+st.dataset.step, ctx ? ctx.s : 0); return; }
      const pk = e.target.closest("[data-pick]");
      if (pk) ctl.select(pk.dataset.pick);
    });
    left.innerHTML = "";
    render(ctl.chapter);

    return {
      get chapter() { return ctl.chapter; },
      go: (i) => ctl.setChapter(i),
      demo: (on) => ctl.demo(on),
      hold: (on) => ctl.hold(on),
      reveal: () => ctl.ink(),
      select: (p) => ctl.select(p),
      on: (name, fn) => { listeners[name] = fn; },
      destroy: () => ctl.destroy(),
    };
  },
};
