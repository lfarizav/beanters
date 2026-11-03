#!/usr/bin/env python3
"""Generate the crawlable detail pages and the English books page.

Writes, in Spanish and English (static HTML, one URL per language):
  /books/<slug>/          one page per published book (also /en/books/<slug>/)
  /presentations/<slug>/  one page per talk
  /projects/<slug>/       one page per project
  /about/ and /faq/
  /en/books/              English copy of /books/ (built from books/index.html)
and refreshes, inside books/index.html and en/books/index.html, the hreflang
tags, the JSON-LD and the "one page per book" card list.

Every sentence comes from text already published on the site: the Spanish and English
strings are read from the existing pages (their data-i18n keys and SITE_I18N
dictionaries, books-data.js, catalog.js, story.js). Nothing is written from memory.

    python3 scripts/site_pages.py          # write the pages
    python3 scripts/site_pages.py --check  # exit 1 if the files on disk are stale

build-en.py imports PAIRS from here to write the sitemap. Run build-en.py first, then
this script (build-en.py rewrites the translated pages that these pages link from).
"""
import html as H
import importlib.util
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://beanters.com"
CSS_V = {"site": "20261031a", "pages": "20261030a", "detail": "20261103b"}
JS_V = {"site": "20261101a", "counter": "20261031a"}
BOOKS_V = {"data": "20261103a", "catalog": "20261103a"}


def _load_build_en():
    spec = importlib.util.spec_from_file_location("build_en", os.path.join(ROOT, "scripts", "build-en.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


BEN = _load_build_en()


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


def node_json(js):
    return json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)


# ---------------------------------------------------------------- sources of text
_DICTS = {}


def en_dict(rel):
    if rel not in _DICTS:
        _DICTS[rel] = BEN.read_dict(read(rel))
    return _DICTS[rel]


def es_text(rel, key):
    """Inner HTML of the element carrying data-i18n="key" in the Spanish page."""
    src = read(rel)
    m = re.search(r'<(\w+)\b[^>]*\sdata-i18n="%s"[^>]*>(.*?)</\1>' % re.escape(key), src, re.S)
    if m:
        return m.group(2).strip()
    # attribute strings (data-i18n-attr="alt:key"): read the Spanish attribute from the same tag
    for tag in re.finditer(r"<[a-zA-Z][^<>]*\sdata-i18n-attr=\"([^\"]*)\"[^<>]*>", src):
        for pair in tag.group(1).split(";"):
            a, _, k = pair.partition(":")
            if k.strip() == key:
                am = re.search(r'\s%s="([^"]*)"' % re.escape(a.strip()), tag.group(0))
                if am:
                    return am.group(1)
    sys.exit("missing Spanish text %s in %s" % (key, rel))


def tx(rel, key, lang):
    """The site's own sentence for key, in the requested language (raw HTML)."""
    if lang == "es":
        return es_text(rel, key)
    d = en_dict(rel)
    if key not in d:
        sys.exit("missing English text %s in %s" % (key, rel))
    return d[key]


HOME, CRS, PRS, PRJ = "index.html", "courses/index.html", "presentations/index.html", "projects/index.html"


def load_books():
    data = node_json("const window={};" + read("books/assets/js/books-data.js").replace("\nwindow.COVER_PATH", "\nvoid 0;//") +
                     ";console.log(JSON.stringify(window.BOOKS))")
    story = read("books/assets/hero/story.js")
    blocks = re.findall(r"lines:\s*\[(.*?)\]", story, re.S)
    lines = {"es": json.loads("[" + blocks[0] + "]"), "en": json.loads("[" + blocks[1] + "]")}
    cat = read("books/assets/js/catalog.js")
    start = cat.index("  var T = {")
    end = cat.index("\n  };\n", start) + 5
    T = node_json("const " + cat[start:end].strip().lstrip("var ") + ";console.log(JSON.stringify(T))")
    return data, lines, T


BOOKS, BOOK_LINES, BT = load_books()

# slug -> data for talks and projects. Keys point at the existing pages' strings.
TALKS = [
    dict(slug="from-chaos-to-control", year="2026", ico="venue", venue="pm4", badge="pm5", abs="pm6", pills="pm7",
         title="From Chaos to Control: A Prescription for Managing Apps on Private Cellular Networks",
         tags=["KubeCon", "Kubernetes", "5G SA", "Helm", "FluxCD", "pm7", "Cloud native", "GitOps"],
         link=("https://raw.githubusercontent.com/lfarizav/techtalk-slides/main/kubecon%202026/FromChaostoControlAPrescriptionforManagingAppsonPrivateCellularNetworksLuisArizaBeanters.pdf", "pm8"),
         doc_title={"es": "From Chaos to Control, KubeCon Europe 2026", "en": "From Chaos to Control, KubeCon Europe 2026"}),
    dict(slug="cloud-native-platforms", year="2026", venue="pm10", abs="pm11",
         title="From Cloud-Native Apps to Cloud-Native Platforms",
         tags=["pm12", "IDP", "GitOps", "pm13", "Cloud native"],
         link=("https://raw.githubusercontent.com/lfarizav/techtalk-slides/main/kubecon%202026/2026-03-26_From%20Cloud-Native%20Apps%20to%20Cloud-Native%20Platforms.pdf", "pm14"),
         doc_title={"es": "From Cloud-Native Apps to Cloud-Native Platforms", "en": "From Cloud-Native Apps to Cloud-Native Platforms"}),
    dict(slug="kcd-colombia-2025", year="2025", venue_text={"es": "Kubernetes Community Days Colombia 2025 · Bogotá", "en": "Kubernetes Community Days Colombia 2025 · Bogotá"},
         abs="pm16",
         title="Enhancing Stability and Enabling Cloud-Native Capabilities for Private Cellular Networks",
         tags=["KCD Colombia", "Kubernetes", "4G LTE", "5G NR", "pm17", "Cloud native"],
         link=("https://github.com/lfarizav/techtalk-slides/blob/main/KCD%20Colombia%202025/EnhancingStabilityandEnabling%20CloudNativeCapabilitiesforPrivateCellularNetworks-KCDColombia2025.pdf", "slides"),
         doc_title={"es": "KCD Colombia 2025: redes celulares privadas", "en": "KCD Colombia 2025: Private Cellular Networks Talk"}),
    dict(slug="5g-broadcast-colombia", year="", venue="pm21", badge="pm22", abs="pm24", title_key="pm23",
         tags=["5G Broadcast", "FeMBMS", "5G MBS", "MinTIC", "Colombia", "pm25"],
         link=("mailto:lfarizav@gmail.com?subject=Solicitud%20de%20la%20presentaci%C3%B3n%20del%20piloto%205G%20Broadcast", "pm26", "pm33"),
         pilot=True,
         doc_title={"es": "Primer piloto de 5G Broadcast en Colombia", "en": "First 5G Broadcast Pilot in Colombia"}),
]
PROJECTS = [
    dict(slug="red-celular-900mhz", n="1", kicker=("pj1", PRJ), h1="pj2", body=["pj4", "pj5"], fine=None, fig="/assets/figures/projects/poster.svg?v=20261030c", alt="pj8",
         doc_title={"es": "Red celular comunitaria en 900 MHz", "en": "Community Cellular Network on 900 MHz"}, meta="metaDesc"),
    dict(slug="ia-agentica-redes", n="2", kicker=("pk1", PRJ), h1="pk2", body=["pk3", "pk4"], fine="pk5", fig="/assets/figures/agentic-network/poster.svg?v=20261030h", alt="pk7",
         doc_title={"es": "IA agéntica en redes 4G y 5G", "en": "Agentic AI on 4G and 5G Networks"}, meta=None),
]

NAV = {
    "es": [("home", "/", "Inicio"), ("courses", "/courses/", "Cursos"), ("talks", "/presentations/", "Presentaciones"),
           ("projects", "/projects/", "Proyectos"), ("books", "/books/", "Libros")],
    "en": [("home", "/en/", "Home"), ("courses", "/en/courses/", "Courses"), ("talks", "/en/presentations/", "Presentations"),
           ("projects", "/en/projects/", "Projects"), ("books", "/en/books/", "Books")],
}
UI = {
    "es": dict(skip="Saltar al contenido", brand="Beanters, inicio", main="Principal", langgrp="Idioma de la página", theme="Cambiar a tema oscuro",
               menu="Abrir menú", site="Sitio", contact="Contacto", email="Correo", amazon="Página en Amazon", privacy="Privacidad", terms="Términos",
               community="Comunidad", about="Sobre Luis", faq="Preguntas frecuentes",
               foot="Formación en cloud-native, AI-native y telco, desde Bogotá, en español y en inglés.",
               copy="© 2026 Luis Felipe Ariza Vesga. Todos los derechos reservados.", locale="es_ES", other="en_US"),
    "en": dict(skip="Skip to content", brand="Beanters, home", main="Main", langgrp="Page language", theme="Switch to dark theme",
               menu="Open menu", site="Site", contact="Contact", email="Email", amazon="Amazon page", privacy="Privacy", terms="Terms",
               community="Community", about="About Luis", faq="FAQ",
               foot="Training in cloud-native, AI-native and telco, from Bogotá, in Spanish and English.",
               copy="© 2026 Luis Felipe Ariza Vesga. All rights reserved.", locale="en_US", other="es_ES"),
}
LOGO = ('<svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="currentColor"/>'
        '<path d="M11 8v16h5.4c3.3 0 5.6-1.8 5.6-4.7 0-2-1.2-3.4-3-3.9 1.4-.6 2.3-1.8 2.3-3.4C21.3 9.5 19.3 8 16.2 8H11Z" fill="var(--nav-mark-ink)"/>'
        '<circle cx="24.5" cy="24.5" r="2.5" fill="var(--cyan)"/></svg>')
MOON = ('<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>\n'
        '        <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>')
BURGER = ('<svg class="i-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>\n'
          '        <svg class="i-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>')


def esc(s):
    return H.escape(s, quote=True)


def pre(lang):
    return """<script>
  /* Theme before first paint. The language is fixed by the URL. */
  (function () {
    var d = document.documentElement, t = null;
    try { t = localStorage.getItem("bk-theme"); } catch (e) {}
    if (t === "dark" || t === "light") d.setAttribute("data-theme", t);
    d.setAttribute("lang", "%s");
  })();
</script>""" % lang


def nav_html(lang, current):
    u = UI[lang]
    links = "\n".join('      <a href="%s"%s>%s</a>' % (href, ' aria-current="page"' if key == current else "", label) for key, href, label in NAV[lang])
    es_on, en_on = ("true", "false") if lang == "es" else ("false", "true")
    return f"""<header class="nav" id="nav">
  <div class="nav__in">
    <a class="brand" href="{'/en/' if lang == 'en' else '/'}" aria-label="{u['brand']}">
      {LOGO}
      <span>Beanters</span>
    </a>
    <nav class="nav__links" id="nav-links" aria-label="{u['main']}">
{links}
    </nav>
    <div class="nav__tools">
      <div class="seg seg--sm" role="group" aria-label="{u['langgrp']}">
        <button type="button" data-set-lang="es" aria-pressed="{es_on}" lang="es">ES</button>
        <button type="button" data-set-lang="en" aria-pressed="{en_on}" lang="en">EN</button>
      </div>
      <button type="button" class="icon-btn" id="theme-toggle" aria-label="{u['theme']}">
        {MOON}
      </button>
      <button type="button" class="icon-btn nav__menu" aria-expanded="false" aria-controls="nav-links" aria-label="{u['menu']}">
        {BURGER}
      </button>
    </div>
  </div>
</header>"""


def footer_html(lang):
    u = UI[lang]
    p = "/en" if lang == "en" else ""
    home = "/en/" if lang == "en" else "/"
    return f"""<footer class="footer">
  <div class="wrap footer__in">
    <div class="footer__brand">
      <a class="brand" href="{home}">
        {LOGO}
        <span>Beanters</span>
      </a>
      <p class="footer__note">{u['foot']}</p>
    </div>
    <nav class="footer__col" aria-label="{u['site']}">
      <h2>{u['site']}</h2>
{chr(10).join('      <a href="%s">%s</a>' % (href, label) for key, href, label in NAV[lang])}
      <a href="/colombia-openinfra-user-group/">{u['community']}</a>
      <a href="{p}/about/">{u['about']}</a>
      <a href="{p}/faq/">{u['faq']}</a>
    </nav>
    <nav class="footer__col" aria-label="{u['contact']}">
      <h2>{u['contact']}</h2>
      <a href="https://wa.me/573133980338" target="_blank" rel="noopener">WhatsApp</a>
      <a href="mailto:lfarizav@gmail.com">{u['email']}</a>
      <a href="https://github.com/lfarizav" target="_blank" rel="noopener">GitHub</a>
      <a href="https://linkedin.com/in/lfarizav" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://www.amazon.com/stores/PhD-Luis-Felipe-Ariza-Vesga/author/B0HJT5N651" target="_blank" rel="noopener">{u['amazon']}</a>
    </nav>
    <nav class="footer__col" aria-label="Legal">
      <h2>Legal</h2>
      <a href="{p}/privacy.html">{u['privacy']}</a>
      <a href="{p}/terms.html">{u['terms']}</a>
    </nav>
    <p class="footer__copy"><span>{u['copy']}</span></p>
  </div>
</footer>"""


def page(lang, es_url, en_url, title, desc, body, current=None, og_image=None, og_type="website", jsonld=None):
    u = UI[lang]
    self_url = en_url if lang == "en" else es_url
    ld = ""
    for obj in (jsonld or []):
        ld += '<script type="application/ld+json">\n%s\n</script>\n' % json.dumps(obj, ensure_ascii=False, indent=2)
    img = og_image or SITE + "/luis.jpg"
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="author" content="Luis Felipe Ariza Vesga">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f3f5f8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0a1420" media="(prefers-color-scheme: dark)">
<link rel="canonical" href="{SITE}{self_url}">
<link rel="alternate" hreflang="es" href="{SITE}{es_url}">
<link rel="alternate" hreflang="en" href="{SITE}{en_url}">
<link rel="alternate" hreflang="x-default" href="{SITE}{es_url}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">

<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Beanters">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{SITE}{self_url}">
<meta property="og:image" content="{img}">
<meta property="og:locale" content="{u['locale']}">
<meta property="og:locale:alternate" content="{u['other']}">
<meta name="twitter:card" content="summary">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wdth,wght@75..100,400..700&family=Literata:ital,opsz,wght@0,7..72,400..600;1,7..72,400&display=swap">
<link rel="stylesheet" href="/assets/site/site.css?v={CSS_V['site']}">
<link rel="stylesheet" href="/assets/site/pages.css?v={CSS_V['pages']}">
<link rel="stylesheet" href="/assets/site/detail.css?v={CSS_V['detail']}">
{pre(lang)}
{ld}</head>
<body class="site">
<a class="skip" href="#main">{u['skip']}</a>

{nav_html(lang, current)}

<main id="main">
{body}
</main>

{footer_html(lang)}

<script src="/assets/site/site.js?v={JS_V['site']}"></script>
<script src="/assets/site/counter.js?v={JS_V['counter']}" defer></script>
</body>
</html>
"""


def head_block(kicker, h1, lede=None, h1_class="dt-h1", meta=None, extra=""):
    out = '  <section class="page-head">\n    <div class="wrap">\n'
    out += '      <p class="kicker">%s</p>\n' % kicker
    out += '      <h1 class="%s">%s</h1>\n' % (h1_class, h1)
    if meta:
        out += '      <p class="dt-meta">%s</p>\n' % meta
    if lede:
        out += '      <p class="lede">%s</p>\n' % lede
    out += extra + "    </div>\n  </section>\n"
    return out


def first_sentence(html):
    return re.split(r"(?<=[.!?])\s", re.sub(r"<[^>]+>", "", html).strip())[0]


def clip(text, n=157):
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= n + 3:
        return text
    return text[:n].rsplit(" ", 1)[0].rstrip(",;:") + "..."


def path(lang, url):
    """Public URL path for a Spanish URL in the requested language."""
    return ("/en" + url) if lang == "en" else url


def out_file(url):
    p = url.lstrip("/")
    return os.path.join(ROOT, p + "index.html") if p.endswith("/") else os.path.join(ROOT, p)


PAIRS = []  # (es_url, en_url) of every page this module owns
FILES = {}  # absolute path -> text


def add(es_url, en_url, es_html, en_html):
    PAIRS.append((es_url, en_url))
    FILES[out_file(es_url)] = es_html
    FILES[out_file(en_url)] = en_html


# ---------------------------------------------------------------- books
SERIES = {"es": "«Lo que pasa es que…»", "en": "“Here’s What’s Actually Going On…”"}
L = {
    "es": dict(books="LIBROS", step="PASO {n} DE 4", series="Serie", topic="Tema", author="Autor", editions="Ediciones", formats="Formatos",
               eds_v="Español e inglés", fmt_v="Kindle, tapa blanda y tapa dura", about="De qué trata", buy="Dónde comprarlo",
               es_ed="Edición en español", en_ed="Edición en inglés", sample="Leer el capítulo 1 gratis (PDF)", labs="Laboratorios del libro",
               more="Los otros libros de la serie", all="Ver toda la colección", whois="Sobre el autor", whom="Más sobre Luis",
               path="Es el paso {n} de 4 de un recorrido sugerido para convertirse en Kubestronaut, de los fundamentos a la seguridad.",
               opens=" (abre Amazon)", auth_page="Página del autor en Amazon"),
    "en": dict(books="BOOKS", step="STEP {n} OF 4", series="Series", topic="Topic", author="Author", editions="Editions", formats="Formats",
               eds_v="Spanish and English", fmt_v="Kindle, paperback and hardcover", about="What it covers", buy="Where to buy it",
               es_ed="Spanish edition", en_ed="English edition", sample="Read chapter 1 free (PDF)", labs="Book labs",
               more="The other books in the series", all="See the whole collection", whois="About the author", whom="More about Luis",
               path="This is step {n} of 4 in a suggested path to become a Kubestronaut, from the basics to security.",
               opens=" (opens Amazon)", auth_page="Author page on Amazon"),
}


def book_url(b, lang):
    return path(lang, "/books/%s/" % b["anchor"])


def cover_img(b, lang, cls="", w=600, h=960, alt=True, lazy=False):
    base = b["cover"][lang]
    a = (BT[lang]["coverAlt"] + b["title"][lang]) if alt else ""
    return ('<picture><source type="image/webp" srcset="/books/assets/covers/%s.webp"><img src="/books/assets/covers/%s.jpg" alt="%s" '
            'width="%d" height="%d"%s decoding="async"></picture>') % (base, base, esc(a), w, h, ' loading="lazy"' if lazy else "")


def formats_row(b, ed, lang):
    t = BT[lang]
    a = b["amazon"][ed]
    out = ""
    for i, f in enumerate(("kindle", "paperback", "hardcover")):
        out += '<a class="btn %s" href="%s" target="_blank" rel="noopener" aria-label="%s">%s</a>' % (
            "btn--primary" if i == 0 else "btn--quiet", a[f], esc("%s, %s%s" % (t[f], b["title"][ed], L[lang]["opens"])), t[f])
    return out


def book_jsonld(b, lang, url):
    L_ = BT[lang]
    work = []
    for ed in (lang, "en" if lang == "es" else "es"):
        for f, schema in (("kindle", "EBook"), ("paperback", "Paperback"), ("hardcover", "Hardcover")):
            work.append({"@type": "Book", "name": b["title"][ed], "inLanguage": ed, "bookFormat": "https://schema.org/" + schema, "url": b["amazon"][ed][f]})
    return {
        "@context": "https://schema.org", "@type": "Book", "@id": SITE + url + "#book",
        "name": b["title"][lang], "alternativeHeadline": b["subtitle"][lang], "url": SITE + url, "inLanguage": lang,
        "image": SITE + "/books/assets/covers/%s.jpg" % b["cover"][lang],
        "author": {"@type": "Person", "name": "Luis Felipe Ariza Vesga", "url": SITE + path(lang, "/about/")},
        "isPartOf": {"@type": "BookSeries", "name": "Lo que pasa es que" if lang == "es" else "Here’s What’s Actually Going On", "url": SITE + path(lang, "/books/")},
        "position": b["step"], "workExample": work,
    }


def build_book(b):
    es_url, en_url = "/books/%s/" % b["anchor"], "/en/books/%s/" % b["anchor"]
    out = {}
    for lang in ("es", "en"):
        l = L[lang]
        url = en_url if lang == "en" else es_url
        other = "en" if lang == "es" else "es"
        series_lede = BT[lang]["heroLede"]
        method = BT[lang]["authorBio2"]
        line = BOOK_LINES[lang][b["step"] - 1]
        order = l["path"].format(n=b["step"])
        eds = ""
        for ed in (lang, other):
            eds += (f'<div class="panel dt-edition"><p class="kicker">{l["es_ed"] if ed == "es" else l["en_ed"]}</p>'
                    f'<h3 lang="{ed}">{esc(b["title"][ed])}</h3>'
                    f'<div class="btn-row">{formats_row(b, ed, lang)}</div></div>')
        extras = '<a class="btn btn--quiet" href="%s" type="application/pdf">%s</a>' % (b["sample"][lang], l["sample"])
        if b.get("labs"):
            extras += '<a class="btn btn--quiet" href="%s" target="_blank" rel="noopener">%s</a>' % (b["labs"], l["labs"])
        others = ""
        for o in BOOKS:
            if o["id"] == b["id"]:
                continue
            others += (f'<li class="dt-card"><a href="{book_url(o, lang)}">{cover_img(o, lang, w=600, h=960, alt=True, lazy=True)}'
                       f'<span class="dt-card__topic">{esc(o["topic"][lang])}</span><span class="dt-card__title">{esc(o["title"][lang])}</span></a></li>')
        body = head_block(f'{l["books"]} · {l["step"].format(n=b["step"])}', esc(b["title"][lang]), esc(b["subtitle"][lang])) + f"""
  <section class="wrap dt">
    <div class="dt-grid">
      <div>
        <dl class="panel dt-facts">
          <dt>{l['series']}</dt><dd>{SERIES[lang]}</dd>
          <dt>{l['topic']}</dt><dd>{esc(b['topic'][lang])}</dd>
          <dt>{l['author']}</dt><dd>Luis Felipe Ariza Vesga</dd>
          <dt>{l['editions']}</dt><dd>{l['eds_v']}</dd>
          <dt>{l['formats']}</dt><dd>{l['fmt_v']}</dd>
        </dl>
        <div class="dt-sec">
          <h2>{l['about']}</h2>
          <p class="prose">{esc(series_lede)}</p>
          <p class="prose">{esc(method)}</p>
          <p class="prose">{esc(order)}</p>
        </div>
      </div>
      <div class="dt-cover">{cover_img(b, lang)}</div>
    </div>

    <div class="dt-sec">
      <h2>{l['buy']}</h2>
      <div class="dt-editions">{eds}</div>
      <div class="btn-row" style="margin-top:16px">{extras}</div>
      <p class="dt-note">{esc(BT[lang]['footNote'])}</p>
    </div>

    <div class="dt-sec">
      <h2>{l['more']}</h2>
      <ul class="dt-cards dt-cards--3">{others}</ul>
      <div class="btn-row" style="margin-top:20px"><a class="btn btn--quiet" href="{path(lang, '/books/')}">{l['all']}</a></div>
    </div>

    <div class="dt-sec">
      <h2>{l['whois']}</h2>
      <div class="panel dt-who">
        <picture><source type="image/webp" srcset="/luis.webp"><img src="/luis.jpg" alt="Luis Felipe Ariza Vesga" width="76" height="76" loading="lazy" decoding="async"></picture>
        <p class="dt-who__name">Luis Felipe Ariza Vesga</p>
        <p class="dt-who__role">{esc(BT[lang]['authorBio1'])}</p>
      </div>
      <p style="margin-top:12px"><a class="text-link" href="{path(lang, '/about/')}">{l['whom']}</a></p>
    </div>
  </section>"""
        if lang == "es":
            desc = "%s. Libro %d de la serie «Lo que pasa es que…» de Luis Felipe Ariza Vesga, en español y en inglés, a la venta en Amazon." % (b["subtitle"]["es"], b["step"])
            title = {"kcna": "Libro: Kubernetes en lenguaje sencillo", "cka": "Libro: Administrar Kubernetes", "ckad": "Libro: Desarrollar en Kubernetes",
                     "cks": "Libro: Asegurar Kubernetes"}[b["id"]] + " | Beanters"
        else:
            desc = "%s. Book %d of the “Here’s What’s Actually Going On…” series by Luis Felipe Ariza Vesga, in Spanish and English, sold on Amazon." % (b["subtitle"]["en"], b["step"])
            title = {"kcna": "Kubernetes in Plain Language: Book", "cka": "Kubernetes Administration Book", "ckad": "Kubernetes App Development Book",
                     "cks": "Kubernetes Security Book"}[b["id"]] + " | Beanters"
        out[lang] = page(lang, es_url, en_url, title, desc, body, current="books",
                         og_image=SITE + "/books/assets/covers/%s.jpg" % b["cover"][lang], og_type="book", jsonld=[book_jsonld(b, lang, url)])
    add(es_url, en_url, out["es"], out["en"])


# ---------------------------------------------------------------- talks
TL = {
    "es": dict(kicker="PRESENTACIONES", who="Quién da la charla", free="✓ Gratis", all="Todas las presentaciones", more="Más sobre Luis",
               tags="Temas", pilot="Piloto documentado por 5G-MAG", soon="Ver los detalles de la charla"),
    "en": dict(kicker="PRESENTATIONS", who="Who gives the talk", free="✓ Free", all="All presentations", more="More about Luis",
               tags="Topics", pilot="Pilot documented by 5G-MAG", soon="See the talk details"),
}
G5MAG = "https://web.archive.org/web/20230928143851/https://www.5g-mag.com/post/lte-based-5g-broadcast-in-colombia-id-tol%C3%BA"


def talk_tag(t, lang):
    return tx(PRS, t, lang) if re.fullmatch(r"pm\d+", t) else t


def build_talk(t):
    es_url, en_url = "/presentations/%s/" % t["slug"], "/en/presentations/%s/" % t["slug"]
    out = {}
    for lang in ("es", "en"):
        l = TL[lang]
        title_txt = tx(PRS, t["title_key"], lang) if "title_key" in t else t["title"]
        venue = t["venue_text"][lang] if "venue_text" in t else tx(PRS, t["venue"], lang)
        badge = tx(PRS, t["badge"], lang) if "badge" in t else ""
        abstract = tx(PRS, t["abs"], lang)
        pills = "".join('<li class="pill">%s</li>' % talk_tag(x, lang) for x in t["tags"])
        lk = t["link"]
        if lk[1] == "slides":
            label = tx(HOME, "slides", lang)
            btn = '<a class="btn btn--primary" href="%s" target="_blank" rel="noopener">%s</a>' % (lk[0], label + (" (PDF)" if True else ""))
        elif len(lk) == 3:
            href = lk[0] if lang == "es" else tx(PRS, lk[2], "en")
            btn = '<a class="btn btn--quiet" href="%s">%s</a>' % (href, tx(PRS, lk[1], lang))
        else:
            btn = '<a class="btn btn--primary" href="%s" target="_blank" rel="noopener">%s</a>' % (lk[0], tx(PRS, lk[1], lang))
        pilot = ""
        if t.get("pilot"):
            pilot = '<p class="prose">%s</p>' % (
                ("Luis participó en la implementación del primer piloto de 5G Broadcast sobre LTE en Colombia (Santiago de Tolú, 2020–2021), "
                 '<a href="%s" target="_blank" rel="noopener">piloto documentado por 5G-MAG</a>.' % G5MAG) if lang == "es" else
                ("He took part in implementing the first LTE-based 5G Broadcast pilot in Colombia (Santiago de Tolú, 2020–2021), "
                 '<a href="%s" target="_blank" rel="noopener">pilot documented by 5G-MAG</a>.' % G5MAG))
        who = tx(HOME, "heroFacts", lang)
        badge_html = (' <span class="pill pill--accent">%s</span>' % badge) if badge else ""
        body = head_block(l["kicker"] + (" · " + t["year"] if t["year"] else ""), title_txt, None, meta=venue + badge_html) + f"""
  <section class="wrap dt">
    <div class="dt-sec" style="margin-top:0">
      <p class="prose">{abstract}</p>
      {pilot}
      <ul class="pills dt-tag" aria-label="{l['tags']}">{pills}</ul>
      <div class="btn-row" style="margin-top:20px">{btn}<span class="pt__free" style="align-self:center">{l['free']}</span></div>
    </div>
    <div class="dt-sec">
      <h2>{l['who']}</h2>
      <div class="panel dt-who">
        <picture><source type="image/webp" srcset="/luis.webp"><img src="/luis.jpg" alt="Luis Felipe Ariza Vesga" width="76" height="76" loading="lazy" decoding="async"></picture>
        <p class="dt-who__name">Luis Felipe Ariza Vesga</p>
        <p class="dt-who__role">{who}</p>
      </div>
      <div class="dt-links" style="margin-top:12px"><a class="text-link" href="{path(lang, '/about/')}">{l['more']}</a><a class="text-link" href="{path(lang, '/presentations/')}">{l['all']}</a></div>
    </div>
  </section>"""
        desc = clip(re.sub(r"<[^>]+>", "", abstract))
        title = "%s | Beanters" % t["doc_title"][lang]
        out[lang] = page(lang, es_url, en_url, title, desc, body, current="talks")
    add(es_url, en_url, out["es"], out["en"])


# ---------------------------------------------------------------- projects
PL = {"es": dict(all="Todos los proyectos", model="Ver el modelo 3D interactivo en la página de proyectos", more="Más sobre Luis"),
      "en": dict(all="All projects", model="See the interactive 3D model on the projects page", more="More about Luis")}


def build_project(p):
    es_url, en_url = "/projects/%s/" % p["slug"], "/en/projects/%s/" % p["slug"]
    out = {}
    for lang in ("es", "en"):
        l = PL[lang]
        kicker = tx(PRJ, p["kicker"][0], lang)
        h1 = tx(PRJ, p["h1"], lang)
        paras = "".join('<p class="prose">%s</p>' % tx(PRJ, k, lang) for k in p["body"])
        fine = ('<p class="dt-note">%s</p>' % tx(PRJ, p["fine"], lang)) if p["fine"] else ""
        alt = tx(PRJ, p["alt"], lang)
        body = head_block(kicker, h1) + f"""
  <section class="wrap dt">
    <div class="dt-grid dt-grid--wide">
      <div class="dt-sec" style="margin-top:0">
        {paras}
        {fine}
        <div class="dt-links" style="margin-top:16px"><a class="text-link" href="{path(lang, '/projects/')}">{l['model']}</a><a class="text-link" href="{path(lang, '/about/')}">{l['more']}</a></div>
      </div>
      <figure class="dt-fig" style="margin:0"><img src="{p['fig']}" width="760" height="580" alt="{esc(alt)}"></figure>
    </div>
  </section>"""
        if p["meta"]:
            desc = tx(PRJ, p["meta"], lang) if lang == "en" else re.search(r'<meta name="description" content="([^"]*)"', read(PRJ)).group(1)
        else:
            desc = clip(first_sentence(tx(PRJ, p["body"][0], lang)))
        out[lang] = page(lang, es_url, en_url, "%s | Beanters" % p["doc_title"][lang], desc, body, current="projects")
    add(es_url, en_url, out["es"], out["en"])


# ---------------------------------------------------------------- about
def build_about():
    es_url, en_url = "/about/", "/en/about/"
    out = {}
    names = {"es": dict(kicker="SOBRE LUIS", h1="Luis Felipe Ariza Vesga", path="Trayectoria", areas="Tres áreas de acción", comm="Comunidad",
                        offer="Qué ofrece", contact="Contacto", c_cur="Cursos", c_book="Libros", c_talk="Presentaciones", c_proj="Proyectos", faq="Preguntas frecuentes",
                        alt="Luis Felipe Ariza Vesga"),
             "en": dict(kicker="ABOUT LUIS", h1="Luis Felipe Ariza Vesga", path="Background", areas="Three areas of action", comm="Community",
                        offer="What he offers", contact="Contact", c_cur="Courses", c_book="Books", c_talk="Presentations", c_proj="Projects", faq="FAQ",
                        alt="Luis Felipe Ariza Vesga")}
    for lang in ("es", "en"):
        n = names[lang]
        p = "/en" if lang == "en" else ""
        body = head_block(n["kicker"], n["h1"], tx(HOME, "heroLede", lang)) + f"""
  <section class="wrap dt">
    <div class="dt-about">
      <picture><source type="image/webp" srcset="/luis.webp"><img src="/luis.jpg" alt="{n['alt']}" width="220" height="220" decoding="async"></picture>
      <div>
        <p class="kicker">{tx(HOME, 'heroBy', lang)}</p>
        <p class="prose" style="margin-top:8px"><strong>{tx(HOME, 'heroFacts', lang)}</strong></p>
        <h2 class="sr-only">{n['path']}</h2>
        <p class="prose" style="margin-top:14px">{tx(HOME, 'bio1', lang)}</p>
        <p class="prose">{tx(HOME, 'bio2', lang)}</p>
        <div class="dt-links" style="margin-top:12px">
          <a class="text-link" href="https://github.com/lfarizav" target="_blank" rel="noopener">GitHub</a>
          <a class="text-link" href="https://linkedin.com/in/lfarizav" target="_blank" rel="noopener">LinkedIn</a>
          <a class="text-link" href="https://www.amazon.com/stores/PhD-Luis-Felipe-Ariza-Vesga/author/B0HJT5N651" target="_blank" rel="noopener">{tx(HOME, 'amazon', lang)}</a>
        </div>
      </div>
    </div>

    <div class="dt-sec">
      <h2>{tx(HOME, 'fieldsTitle', lang)}</h2>
      <p class="prose" style="margin-bottom:16px">{tx(HOME, 'fieldsSub', lang)}</p>
      <div class="dt-areas">
        <div class="panel dt-area"><h3>Cloud-native</h3><p>{tx(HOME, 'p2Body', lang)}</p></div>
        <div class="panel dt-area"><h3>AI-native</h3><p>{tx(HOME, 'p3Body', lang)}</p></div>
        <div class="panel dt-area"><h3>Telco</h3><p>{tx(HOME, 'p1Body', lang)}</p></div>
      </div>
    </div>

    <div class="dt-sec">
      <h2>{n['comm']}</h2>
      <p class="prose">{tx(HOME, 'commBody', lang)}</p>
      <div class="btn-row" style="margin-top:14px"><a class="btn btn--quiet" href="/colombia-openinfra-user-group/">{tx(HOME, 'ctaGroup', lang)}</a></div>
    </div>

    <div class="dt-sec">
      <h2>{n['offer']}</h2>
      <p class="prose">{tx(HOME, 'trainSub', lang)}</p>
      <div class="dt-links" style="margin-top:12px">
        <a class="text-link" href="{p}/courses/">{n['c_cur']}</a>
        <a class="text-link" href="{p}/books/">{n['c_book']}</a>
        <a class="text-link" href="{p}/presentations/">{n['c_talk']}</a>
        <a class="text-link" href="{p}/projects/">{n['c_proj']}</a>
        <a class="text-link" href="{p}/faq/">{n['faq']}</a>
      </div>
    </div>

    <div class="dt-sec">
      <h2>{tx(HOME, 'contactTitle', lang)}</h2>
      <p class="prose">{tx(HOME, 'contactBody', lang)}</p>
      <div class="btn-row" style="margin-top:14px">
        <a class="btn btn--primary" href="{tx(HOME, 'waHref', lang) if lang == 'en' else 'https://wa.me/573133980338?text=Hola%20Luis%2C%20quiero%20hablar%20sobre%20formaci%C3%B3n%20para%20mi%20equipo.'}" target="_blank" rel="noopener">{tx(HOME, 'ctaWhatsapp', lang)}</a>
        <a class="btn btn--quiet" href="{tx(HOME, 'mailHref', lang) if lang == 'en' else 'mailto:lfarizav@gmail.com?subject=Formaci%C3%B3n'}">{tx(HOME, 'ctaEmail', lang)}</a>
      </div>
      <p class="dt-note">+57 313 398 0338 / lfarizav@gmail.com</p>
    </div>
  </section>"""
        if lang == "es":
            title = "Sobre Luis Felipe Ariza Vesga | Beanters"
            desc = "Luis Felipe Ariza Vesga, instructor de Beanters: doctor en Ingeniería Eléctrica y Kubestronaut, con redes celulares de nueva generación desde 2014. Bogotá, en español y en inglés."
        else:
            title = "About Luis Felipe Ariza Vesga | Beanters"
            desc = "Luis Felipe Ariza Vesga, Beanters instructor: PhD in Electrical Engineering and Kubestronaut, working on next-generation cellular networks since 2014. Bogotá, in Spanish and English."
        out[lang] = page(lang, es_url, en_url, title, desc, body)
    add(es_url, en_url, out["es"], out["en"])


# ---------------------------------------------------------------- faq
def build_faq():
    es_url, en_url = "/faq/", "/en/faq/"
    out = {}
    for lang in ("es", "en"):
        p = "/en" if lang == "en" else ""
        C = lambda k: tx(CRS, k, lang)
        Hm = lambda k: tx(HOME, k, lang)
        es = lang == "es"
        usd = "USD"
        progs = [
            (Hm("c2Title"), "$249", C("cm61"), C("cm62")),
            (Hm("c3Title"), "$199", C("cm74"), C("cm75")),
            (Hm("c4Title"), "$149", C("cm85"), C("cm86")),
            (Hm("c5Title").split(",")[0] if False else C("cm88"), "$279", C("cm99"), C("cm100")),
            (C("cm102"), "$229", C("cm113"), C("cm114")),
        ]
        prog_li = "".join("<li>%s: $%s %s, %s</li>" % (n, a[1:], per, hrs) for n, a, per, hrs in progs)
        prog_li += "<li>%s: %s</li>" % (Hm("wsTitle"), (C("wk8").replace("USD · desde, por persona", "desde $199 USD por persona") if es else "from $199 USD per person") + ", " + C("wk9"))
        books_li = "".join('<li><a href="%s">%s</a></li>' % (book_url(b, lang), esc(b["title"][lang])) for b in BOOKS)
        courses_li = "".join("<li>%s</li>" % Hm(k) for k in ("c1Title", "c2Title", "c3Title", "c4Title", "c5Title"))
        if es:
            qa = [
                ("¿Quién dicta los cursos y programas?",
                 [f"Luis Felipe Ariza Vesga es el instructor de todos los programas. Es doctor en Ingeniería Eléctrica, Kubestronaut y ponente en KubeCon Europe 2026, y trabaja desde 2014 en redes celulares de nueva generación. Puede leer más en <a href=\"/about/\">Sobre Luis</a>."]),
                ("¿Qué temas enseña Beanters?",
                 [Hm("fieldsSub"), "Los cursos y programas son:", ("ul", courses_li), "El catálogo completo está en <a href=\"/courses/\">Cursos</a>."]),
                ("¿En qué idiomas están los cursos y los libros?",
                 ["Los cursos y programas se dictan en español y en inglés. Los cuatro libros publicados también existen en los dos idiomas."]),
                ("¿Qué formatos de formación hay?",
                 [Hm("trainSub"), f"{Hm('c1Body')} {first_sentence(C('cmCap'))}", Hm("wsBody")]),
                ("¿Cuánto cuesta el curso de redes celulares?",
                 ["Tiene una vista previa gratuita con 3 módulos de entrada. El acceso completo (25 módulos, laboratorios y cuestionarios) cuesta $89 USD. El plan para equipos y universidades cuesta $490 USD, con 10 cupos y factura disponible. Los detalles están en la <a href=\"/courses/cellular-networks/\">página del curso</a>."]),
                ("¿Cuánto cuestan los programas en vivo?",
                 ["Estos son los precios publicados en la página de <a href=\"/courses/\">Cursos</a>:", ("ul", prog_li),
                  "La preparación para CKA, CKAD y CKS no garantiza la aprobación del examen."]),
                ("¿Hay precios para equipos y universidades?",
                 [f"{Hm('a1Body')} Cada programa tiene un enlace para pedir el precio para equipos por correo. {C('cmCap')}"]),
                ("¿Cómo me inscribo y cómo se paga?", [C("cm115")]),
                ("¿Qué libros hay y dónde se compran?",
                 [Hm("booksSub"), ("ul", books_li), f"Cada libro se vende en Kindle, tapa blanda y tapa dura. {BT['es']['footNote']} Vea la <a href=\"/books/\">colección completa</a>."]),
                ("¿Dónde puedo ver las charlas?",
                 [Hm("talksSub") + " Están en <a href=\"/presentations/\">Presentaciones</a>."]),
                ("¿Cuánto cuesta la revisión de seguridad de apps hechas con IA?", [Hm("rvBody")]),
                ("¿Cómo contacto a Luis?",
                 [f"{Hm('contactBody')} Por WhatsApp o por correo: +57 313 398 0338 y lfarizav@gmail.com. Beanters trabaja desde Bogotá."]),
            ]
        else:
            qa = [
                ("Who teaches the courses and programs?",
                 ["Luis Felipe Ariza Vesga is the instructor for all programs. He holds a PhD in Electrical Engineering, is a Kubestronaut and spoke at KubeCon Europe 2026, and has worked since 2014 on next-generation cellular networks. Read more on <a href=\"/en/about/\">About Luis</a>."]),
                ("What topics does Beanters teach?",
                 [Hm("fieldsSub"), "The courses and programs are:", ("ul", courses_li), "The full catalog is on <a href=\"/en/courses/\">Courses</a>."]),
                ("In which languages are the courses and the books?",
                 ["The courses and programs are taught in Spanish and English. The four published books also exist in both languages."]),
                ("What training formats are there?",
                 [Hm("trainSub"), f"{Hm('c1Body')} {first_sentence(C('cmCap'))}", Hm("wsBody")]),
                ("How much does the cellular networks course cost?",
                 ["It has a free preview with 3 starter modules. Full access (25 modules, labs and quizzes) costs $89 USD. The team and university plan costs $490 USD, with 10 seats and an invoice available. The details are on the <a href=\"/en/courses/cellular-networks/\">course page</a>."]),
                ("How much do the live programs cost?",
                 ["These are the prices published on the <a href=\"/en/courses/\">Courses</a> page:", ("ul", prog_li),
                  "The CKA, CKAD and CKS preparation does not guarantee that you pass the exam."]),
                ("Are there prices for teams and universities?",
                 [f"{Hm('a1Body')} Each program has a link to ask for team pricing by email. {C('cmCap')}"]),
                ("How do I enroll and how do I pay?", [C("cm115")]),
                ("Which books are there and where can I buy them?",
                 [Hm("booksSub"), ("ul", books_li), f"Each book is sold as a Kindle edition, paperback and hardcover. {BT['en']['footNote']} See the <a href=\"/en/books/\">whole collection</a>."]),
                ("Where can I see the talks?",
                 [Hm("talksSub") + " They are on <a href=\"/en/presentations/\">Presentations</a>."]),
                ("How much does the security review of apps built with AI cost?", [Hm("rvBody")]),
                ("How do I contact Luis?",
                 [f"{Hm('contactBody')} By WhatsApp or email: +57 313 398 0338 and lfarizav@gmail.com. Beanters works from Bogotá."]),
            ]
        items = ""
        for q, parts in qa:
            inner = ""
            for part in parts:
                if isinstance(part, tuple):
                    inner += "<ul>%s</ul>" % part[1]
                else:
                    inner += '<p class="prose">%s</p>' % part
            items += '      <article class="panel faq__item">\n        <h2>%s</h2>\n        %s\n      </article>\n' % (q, inner)
        kicker = "PREGUNTAS FRECUENTES" if es else "FREQUENTLY ASKED QUESTIONS"
        h1 = "Preguntas frecuentes sobre Beanters" if es else "Frequently asked questions about Beanters"
        lede = ("Respuestas sobre quién enseña, qué se enseña, cuánto cuesta y cómo inscribirse, con los datos publicados en este sitio." if es else
                "Answers about who teaches, what is taught, what it costs and how to enroll, based on the information published on this site.")
        body = head_block(kicker, h1, lede) + f'\n  <section class="wrap dt">\n    <div class="faq">\n{items}    </div>\n  </section>'
        title = "Preguntas frecuentes: cursos, precios y libros | Beanters" if es else "FAQ: Courses, Prices and Books | Beanters"
        desc = ("Quién enseña, qué temas cubre, en qué idiomas, cuánto cuestan los cursos y programas, cómo se inscribe y qué libros hay en Beanters." if es else
                "Who teaches, which topics are covered, in which languages, what the courses and programs cost, how to enroll and which books Beanters has.")
        out[lang] = page(lang, es_url, en_url, title, desc, body)
    add(es_url, en_url, out["es"], out["en"])


# ---------------------------------------------------------------- /books/ and /en/books/
CARDS_START, CARDS_END = "<!-- book-pages:start -->", "<!-- book-pages:end -->"


def cards_section(lang):
    t = BT[lang]
    cards = ""
    for b in BOOKS:
        cards += (f'<li class="dt-card"><a href="{book_url(b, lang)}">{cover_img(b, lang, lazy=True)}'
                  f'<span class="dt-card__topic">{esc(b["topic"][lang])}</span><span class="dt-card__title">{esc(b["title"][lang])}</span>'
                  f'<span class="dt-card__sub">{esc(b["subtitle"][lang])}</span></a></li>')
    return (f'{CARDS_START}\n  <section class="section" id="paginas" aria-labelledby="pages-title">\n    <div class="wrap">\n'
            f'      <div class="section__head">\n        <div>\n          <h2 id="pages-title" data-i18n="pagesTitle">{t["pagesTitle"]}</h2>\n'
            f'          <p class="section__sub" data-i18n="pagesSub">{t["pagesSub"]}</p>\n        </div>\n      </div>\n'
            f'      <ul class="dt-cards">{cards}</ul>\n    </div>\n  </section>\n  {CARDS_END}')


def books_jsonld(lang):
    graph = [
        {"@type": "Person", "@id": SITE + "/books/#author", "name": "Luis Felipe Ariza Vesga",
         "url": "https://www.amazon.com/stores/PhD-Luis-Felipe-Ariza-Vesga/author/B0HJT5N651",
         "jobTitle": "Telecommunications engineer, PhD in Electrical Engineering", "image": SITE + "/luis.jpg",
         "sameAs": ["https://github.com/lfarizav", "https://linkedin.com/in/lfarizav"]},
        {"@type": "BookSeries", "@id": SITE + "/books/#series", "name": "Lo que pasa es que", "alternateName": "Here's What's Actually Going On",
         "author": {"@id": SITE + "/books/#author"}, "inLanguage": ["es", "en"],
         "hasPart": [{"@id": SITE + "/books/#" + b["id"]} for b in BOOKS]},
    ]
    for b in BOOKS:
        other = "en" if lang == "es" else "es"
        work = []
        for ed in ("es", "en"):
            for f, schema in (("kindle", "EBook"), ("paperback", "Paperback"), ("hardcover", "Hardcover")):
                w = {"@type": "Book", "inLanguage": ed, "bookFormat": "https://schema.org/" + schema, "url": b["amazon"][ed][f]}
                if ed == "en":
                    w["name"] = b["title"]["en"].replace("’", "'")
                work.append(w)
        graph.append({"@type": "Book", "@id": SITE + "/books/#" + b["id"], "name": b["title"][lang], "alternativeHeadline": b["subtitle"][lang],
                      "url": SITE + book_url(b, lang), "author": {"@id": SITE + "/books/#author"}, "isPartOf": {"@id": SITE + "/books/#series"},
                      "position": b["step"], "image": SITE + "/books/assets/covers/%s.jpg" % b["cover"][lang], "workExample": work})
    return '<script type="application/ld+json">\n%s\n</script>' % json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)


def books_head(src, lang):
    """hreflang, canonical and JSON-LD for either language."""
    es_url, en_url = "/books/", "/en/books/"
    self_url = en_url if lang == "en" else es_url
    alt = (f'<link rel="canonical" href="{SITE}{self_url}">\n<link rel="alternate" hreflang="es" href="{SITE}{es_url}">\n'
           f'<link rel="alternate" hreflang="en" href="{SITE}{en_url}">\n<link rel="alternate" hreflang="x-default" href="{SITE}{es_url}">')
    src = re.sub(r'<link rel="canonical" href="[^"]*">(\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">)*', lambda m: alt, src, count=1)
    src = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda m: books_jsonld(lang), src, count=1, flags=re.S)
    return src


def build_books():
    es_path = os.path.join(ROOT, "books/index.html")
    es = open(es_path, encoding="utf-8").read()
    # Spanish page: cards, head, asset versions
    section = cards_section("es")
    if CARDS_START in es:
        es = re.sub(re.escape(CARDS_START) + r".*?" + re.escape(CARDS_END), lambda m: section, es, flags=re.S)
    else:
        es = es.replace('  <section class="section" id="orden"', "  " + section + '\n\n  <section class="section" id="orden"', 1)
    es = books_head(es, "es")
    FILES[es_path] = es

    # English page
    en = es
    d = dict(BT["en"])
    en = BEN.translate(en, d)
    en = en.replace('<html lang="es">', '<html lang="en">', 1)
    en = re.sub(r"<title>.*?</title>", "<title>Kubernetes Books: Here’s What’s Actually Going On | Beanters</title>", en, count=1, flags=re.S)
    desc_en = ("The “Here’s What’s Actually Going On…” series by Luis Felipe Ariza Vesga: Kubernetes explained through everyday analogies, in Spanish and English. "
               "Basics, administration, development and security.")
    en = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + H.escape(desc_en) + m.group(2), en, count=1)
    en = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda m: m.group(1) + "“Here’s What’s Actually Going On…”: Kubernetes books" + m.group(2), en, count=1)
    en = re.sub(r'(<meta property="og:description" content=")[^"]*(")', lambda m: m.group(1) + "Kubernetes explained through everyday analogies, in Spanish and English. Four published books: basics, administration, development and security." + m.group(2), en, count=1)
    en = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + SITE + "/en/books/" + m.group(2), en, count=1)
    en = en.replace('<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="en_US">')
    en = en.replace('<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="es_ES">')
    en = en.replace("kcna-kcsa-cloud-native-and-security-associate-es.jpg", "kcna-kcsa-cloud-native-and-security-associate-en.jpg")
    en = books_head(en, "en")
    # language: fixed by the URL
    en = re.sub(r"<script>\s*/\* Theme and language before first paint.*?</script>", lambda m: BEN.PREPAINT_EN, en, count=1, flags=re.S)
    # toggle
    en = en.replace('data-set-lang="es" aria-pressed="true"', 'data-set-lang="es" aria-pressed="false"').replace('data-set-lang="en" aria-pressed="false"', 'data-set-lang="en" aria-pressed="true"')
    # story steps in raw HTML
    steps = ""
    for i, b in enumerate(BOOKS):
        steps += (f'<li class="story-step" id="story-step-{i}" data-step="{i}" style="--hue:{b["hue"]};--hue-l:{b["hueLight"]}"><p class="story-step__topic"><i aria-hidden="true">{b["step"]}</i>{esc(b["topic"]["en"])}</p>'
                  f'<h2 class="story-step__title">{esc(b["title"]["en"])}</h2><p class="story-step__line">{esc(BOOK_LINES["en"][i])}</p>'
                  f'<a class="story-step__link" href="#{b["anchor"]}" data-goto="{b["anchor"]}">See the book</a></li>\n        ')
    en = re.sub(r'(<ol class="story__steps">\s*).*?(\s*</ol>)', lambda m: m.group(1) + steps.rstrip() + m.group(2), en, count=1, flags=re.S)
    en = en.replace('aria-label="Recorrido por la serie"', 'aria-label="Tour of the series"')
    en = en.replace('href="/books/samples/lo-que-pasa-es-que-kubernetes-es-sample.pdf"', 'href="/books/samples/lo-que-pasa-es-que-kubernetes-en-sample.pdf"')
    en = re.sub(re.escape(CARDS_START) + r".*?" + re.escape(CARDS_END), lambda m: cards_section("en"), en, count=1, flags=re.S)
    # internal links stay in English
    en = rewrite_en_links(en)
    # noscript list: English edition links
    ns = "".join('<li><a href="%s">%s (Kindle)</a></li>\n          ' % (b["amazon"]["en"]["kindle"], esc(b["title"]["en"])) for b in BOOKS)
    en = re.sub(r'(<noscript>\s*<ul class="noscript-list">\s*).*?(\s*</ul>\s*</noscript>)', lambda m: m.group(1) + ns.rstrip() + m.group(2), en, count=1, flags=re.S)
    FILES[os.path.join(ROOT, "en/books/index.html")] = en


EN_MAP = {"/": "/en/", "/courses/": "/en/courses/", "/presentations/": "/en/presentations/", "/projects/": "/en/projects/",
          "/books/": "/en/books/", "/privacy.html": "/en/privacy.html", "/terms.html": "/en/terms.html", "/about/": "/en/about/", "/faq/": "/en/faq/"}


def rewrite_en_links(s):
    def fix(m):
        base, sep, frag = m.group(2).partition("#")
        if base in EN_MAP:
            return '%s="%s%s%s"' % (m.group(1), EN_MAP[base], sep, frag)
        return m.group(0)
    return re.sub(r'\b(href)="([^"]*)"', fix, s)


def pairs():
    """(es_url, en_url) of every page this module writes, in sitemap order."""
    out = [("/books/%s/" % b["anchor"], "/en/books/%s/" % b["anchor"]) for b in BOOKS]
    out += [("/presentations/%s/" % t["slug"], "/en/presentations/%s/" % t["slug"]) for t in TALKS]
    out += [("/projects/%s/" % p["slug"], "/en/projects/%s/" % p["slug"]) for p in PROJECTS]
    out += [("/about/", "/en/about/"), ("/faq/", "/en/faq/")]
    return out


def build():
    FILES.clear()
    PAIRS.clear()
    for b in BOOKS:
        build_book(b)
    for t in TALKS:
        build_talk(t)
    for p in PROJECTS:
        build_project(p)
    build_about()
    build_faq()
    build_books()
    return FILES


def main():
    files = build()
    stale = []
    for p, text in files.items():
        cur = open(p, encoding="utf-8").read() if os.path.exists(p) else None
        if cur != text:
            stale.append(os.path.relpath(p, ROOT))
            if "--check" not in sys.argv:
                os.makedirs(os.path.dirname(p), exist_ok=True)
                open(p, "w", encoding="utf-8").write(text)
    if "--check" in sys.argv:
        if stale:
            print("stale:", ", ".join(stale))
            sys.exit(1)
        print("Detail pages are up to date")
    else:
        print("wrote/updated:", ", ".join(stale) if stale else "nothing (already current)")


if __name__ == "__main__":
    main()
