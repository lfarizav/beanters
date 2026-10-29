// Course stage: a full-viewport scene that opens from a course card (FLIP flight), with a glass capsule.
// Usage: <article data-stage="/assets/figures/cellular/scene.js" data-stage-enroll="..." data-stage-preview="...">.
// A scene module default-exports { title: {es, en}, chapters: [{ id }], enroll, preview, mount(ctx) }.
// mount({ left, right, lang, reduced, mobile }) returns { go(i), demo(on), hold(on), reveal(), destroy(), on(name, fn) }.
const UI = {
  es: { close: "Cerrar", prev: "Capítulo anterior", next: "Capítulo siguiente", demo: "Demo", stop: "Pausa", still: "Quieto", enroll: "Inscribirse", preview: "Vista previa gratis", chapters: "Capítulos", contents: "Contenido" },
  en: { close: "Close", prev: "Previous chapter", next: "Next chapter", demo: "Demo", stop: "Pause", still: "Still", enroll: "Enroll", preview: "Free preview", chapters: "Chapters", contents: "Contents" },
};
const ICON = {
  close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>',
  prev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg>',
  next: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5L13 10l-5.5 5.5"/></svg>',
  play: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5.2v9.6L14.6 10z"/></svg>',
  pause: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg>',
  still: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="5.5"/><path d="M10 7v3"/></svg>',
};
const reducedQ = matchMedia("(prefers-reduced-motion: reduce)");
const mobileQ = matchMedia("(max-width: 639px)");
const EASE = "cubic-bezier(.2,.8,.2,1)";

function langNow() {
  const h = (document.documentElement.lang || "").slice(0, 2);
  if (h === "en" || h === "es") return h;
  try { const l = localStorage.getItem("bk-lang"); if (l === "en" || l === "es") return l; } catch (e) { /* ignore */ }
  return "es";
}
function cssOnce(href) {
  if (document.querySelector(`link[data-stage-css="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.href = href; l.dataset.stageCss = href;
  document.head.append(l);
}
const focusables = (root) => [...root.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"],input,select,textarea')].filter((el) => el.offsetParent !== null || el === document.activeElement);

let current = null;

export async function open(trigger) {
  if (current) return;
  const src = trigger.getAttribute("data-stage");
  const opener = !trigger.hasAttribute("tabindex") && trigger.contains(document.activeElement) ? document.activeElement : trigger; // return focus to the real opener when the card itself is not focusable
  const lang = langNow();
  const T = UI[lang];
  const reduced = reducedQ.matches;
  cssOnce(new URL("stage.css", import.meta.url).href);
  const scene = (await import(new URL(src, location.href).href)).default;
  const enroll = trigger.getAttribute("data-stage-enroll") || scene.enroll;
  const preview = trigger.getAttribute("data-stage-preview") || scene.preview;
  const title = scene.title[lang];

  const root = document.createElement("div");
  root.className = "stg";
  root.setAttribute("data-phase", "prep");
  root.innerHTML = `
    <div class="stg-backdrop"></div>
    <div class="stg-sheet" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="stg-book">
        <section class="stg-page stg-left"></section>
        <section class="stg-page stg-right"></section>
      </div>
      <button class="stg-close stg-glass" type="button" aria-label="${T.close}">${ICON.close}</button>
      <nav class="stg-capsule stg-glass" aria-label="${T.contents}">
        <div class="stg-row">
          <button class="stg-btn" data-act="prev" type="button" aria-label="${T.prev}">${ICON.prev}</button>
          <div class="stg-chapters" role="group" aria-label="${T.chapters}"></div>
          <button class="stg-btn" data-act="next" type="button" aria-label="${T.next}">${ICON.next}</button>
          <span class="stg-sep" aria-hidden="true"></span>
          <button class="stg-btn stg-label" data-act="demo" type="button" aria-pressed="false" aria-label="${T.demo}">${ICON.play}<span>${T.demo}</span></button>
          <button class="stg-btn stg-label" data-act="still" type="button" aria-pressed="${reduced}" aria-label="${T.still}">${ICON.still}<span>${T.still}</span></button>
        </div>
        <div class="stg-row stg-row-end">
          <span class="stg-title">${title}</span>
          ${preview ? `<a class="stg-link" href="${preview}">${T.preview}</a>` : ""}
          <a class="stg-cta" href="${enroll}">${T.enroll}</a>
        </div>
      </nav>
    </div>`;
  document.body.append(root);
  const sheet = root.querySelector(".stg-sheet");
  const backdrop = root.querySelector(".stg-backdrop");
  const chips = root.querySelector(".stg-chapters");
  const demoBtn = root.querySelector('[data-act="demo"]');
  const stillBtn = root.querySelector('[data-act="still"]');

  // scroll lock
  const html = document.documentElement;
  const gap = window.innerWidth - html.clientWidth;
  const lock = { overflow: html.style.overflow, pad: document.body.style.paddingRight };
  html.style.overflow = "hidden";
  if (gap > 0) document.body.style.paddingRight = `${gap}px`;

  const chipEls = scene.chapters.map((c, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "stg-chip"; b.textContent = c.id; b.dataset.i = i;
    chips.append(b);
    return b;
  });
  const api = await scene.mount({ left: root.querySelector(".stg-left"), right: root.querySelector(".stg-right"), lang, reduced, mobile: mobileQ.matches });
  const mark = (i) => chipEls.forEach((b, n) => b.setAttribute("aria-pressed", String(n === i)));
  api.on("chapter", mark);
  api.on("demo", (on) => { demoBtn.setAttribute("aria-pressed", String(on)); demoBtn.setAttribute("aria-label", on ? T.stop : T.demo); demoBtn.innerHTML = `${on ? ICON.pause : ICON.play}<span>${on ? T.stop : T.demo}</span>`; });
  mark(api.chapter);
  chips.addEventListener("click", (e) => { const b = e.target.closest(".stg-chip"); if (b) api.go(+b.dataset.i); });
  root.querySelector('[data-act="prev"]').addEventListener("click", () => api.go(Math.max(0, api.chapter - 1)));
  root.querySelector('[data-act="next"]').addEventListener("click", () => api.go(Math.min(scene.chapters.length - 1, api.chapter + 1)));
  demoBtn.addEventListener("click", () => api.demo(demoBtn.getAttribute("aria-pressed") !== "true"));
  stillBtn.addEventListener("click", () => { const on = stillBtn.getAttribute("aria-pressed") !== "true"; stillBtn.setAttribute("aria-pressed", String(on)); root.toggleAttribute("data-still", on); api.hold(on); });
  if (reduced) { root.setAttribute("data-still", ""); api.hold(true); }

  // FLIP flight from the card
  const from = trigger.getBoundingClientRect();
  const to = sheet.getBoundingClientRect();
  const flight = (forward) => {
    const r = trigger.isConnected ? trigger.getBoundingClientRect() : from;
    const sx = r.width / to.width, sy = r.height / to.height;
    const tx = r.left - to.left, ty = r.top - to.top;
    const card = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;
    const frames = [{ transform: card, borderRadius: "18px", opacity: 0.6 }, { transform: "none", borderRadius: getComputedStyle(sheet).borderRadius, opacity: 1 }];
    return sheet.animate(forward ? frames : frames.reverse(), { duration: forward ? 620 : 460, easing: EASE, fill: "both" });
  };
  root.setAttribute("data-phase", "opening");
  if (reduced) {
    await Promise.all([sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, fill: "both" }).finished, backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, fill: "both" }).finished]);
  } else {
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: "ease-out", fill: "both" });
    await flight(true).finished;
  }
  root.setAttribute("data-phase", "open");
  root.querySelector(".stg-close").focus({ preventScroll: true });
  api.reveal();

  async function close() {
    if (!current) return;
    current = null;
    api.demo(false);
    root.setAttribute("data-phase", "closing");
    document.removeEventListener("keydown", onKey, true);
    if (reduced || !trigger.isConnected) {
      await Promise.all([sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "both" }).finished, backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "both" }).finished]);
    } else {
      backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: "ease-in", fill: "both" });
      await flight(false).finished;
    }
    api.destroy();
    root.remove();
    html.style.overflow = lock.overflow;
    document.body.style.paddingRight = lock.pad;
    (opener.isConnected ? opener : trigger).focus({ preventScroll: true });
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const list = focusables(sheet);
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1];
    if (!sheet.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener("keydown", onKey, true);
  root.querySelector(".stg-close").addEventListener("click", close);
  backdrop.addEventListener("click", close);
  current = { close, root };
  return current;
}
export const close = () => current?.close();

// Delegate: any element with data-stage opens its scene (Enter/Space on a focusable card too).
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-stage]");
  if (!t || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
  if (e.target.closest("[data-stage-ignore]")) return; // an embedded live figure handles its own clicks
  const inner = e.target.closest("a[href],button");
  if (inner && inner !== t && !inner.hasAttribute("data-stage-open")) return; // let real links inside a card work
  e.preventDefault();
  open(t);
});
document.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("[data-stage]")) { e.preventDefault(); open(e.target); }
});
