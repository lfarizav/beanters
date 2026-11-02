#!/usr/bin/env python3
"""Build real English URLs (/en/...) from the Spanish pages.

The Spanish HTML is the source. Each page carries its English strings in
window.SITE_I18N.en (keys used by data-i18n and data-i18n-attr). This script
applies that dictionary at build time and writes a static English copy under
/en/, with lang="en", canonical and hreflang tags, and internal links that
stay inside /en/. No dependencies; run from anywhere:

    python3 scripts/build-en.py          # write /en/ pages and sitemap.xml
    python3 scripts/build-en.py --check  # exit 1 if the files on disk are stale

Commit the generated files together with the Spanish change.
"""
import html as H
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://beanters.com"

# Spanish source file -> (Spanish URL path, English URL path)
PAGES = {
    "index.html": ("/", "/en/"),
    "courses/index.html": ("/courses/", "/en/courses/"),
    "courses/cellular-networks/index.html": ("/courses/cellular-networks/", "/en/courses/cellular-networks/"),
    "presentations/index.html": ("/presentations/", "/en/presentations/"),
    "projects/index.html": ("/projects/", "/en/projects/"),
    "privacy.html": ("/privacy.html", "/en/privacy.html"),
    "terms.html": ("/terms.html", "/en/terms.html"),
}
ES2EN = {es: en for es, en in PAGES.values()}
VOID = {"meta", "link", "img", "br", "hr", "input", "source", "path", "circle", "rect", "line", "polygon", "use"}


def out_path(en_url):
    p = en_url.lstrip("/")
    if p.endswith("/"):
        p += "index.html"
    return os.path.join(ROOT, p)


def read_dict(src):
    m = re.search(r"window\.SITE_I18N\s*=\s*(\{.*?\})\s*;\s*</script>", src, re.S)
    if not m:
        sys.exit("no SITE_I18N dictionary found")
    js = "const window = {}; window.SITE_I18N = " + m.group(1) + "; console.log(JSON.stringify(window.SITE_I18N.en));"
    res = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def start_tag_end(s, i):
    """Index just after the '>' that closes the start tag beginning at i (respects quotes)."""
    q = None
    while i < len(s):
        c = s[i]
        if q:
            if c == q:
                q = None
        elif c in "\"'":
            q = c
        elif c == ">":
            return i + 1
        i += 1
    raise ValueError("unterminated tag")


def element_end(s, name, after_start):
    """Index of the '<' of the matching close tag for an element whose start tag ends at after_start."""
    depth, pos = 1, after_start
    pat = re.compile(r"<(/?)%s\b" % re.escape(name), re.I)
    while True:
        m = pat.search(s, pos)
        if not m:
            raise ValueError("no close tag for " + name)
        if m.group(1):
            depth -= 1
            if depth == 0:
                return m.start()
        else:
            e = start_tag_end(s, m.start())
            if s[e - 2] != "/":
                depth += 1
            pos = e
            continue
        pos = m.end()


def set_attr(tag, attr, value):
    v = H.escape(value, quote=True).replace("&#x27;", "'")
    pat = re.compile(r'(\s%s=)(")(.*?)(")' % re.escape(attr), re.S)
    if pat.search(tag):
        return pat.sub(lambda m: m.group(1) + '"' + v + '"', tag, count=1)
    return tag[:-1] + ' %s="%s">' % (attr, v)


MISSING = []


def translate(src, d):
    out, i = [], 0
    tag_re = re.compile(r"<([a-zA-Z][\w-]*)\b", re.S)
    while True:
        m = tag_re.search(src, i)
        if not m:
            out.append(src[i:])
            break
        e = start_tag_end(src, m.start())
        tag = src[m.start():e]
        name = m.group(1).lower()
        # raw-text elements are copied untouched
        if name in ("script", "style"):
            close = re.search(r"</%s\s*>" % name, src[e:], re.I)
            end = e + close.end()
            out.append(src[i:m.start()])
            out.append(src[m.start():end])
            i = end
            continue
        out.append(src[i:m.start()])
        am = re.search(r'\sdata-i18n-attr="([^"]*)"', tag)
        if am:
            for pair in am.group(1).split(";"):
                a, _, k = pair.partition(":")
                a, k = a.strip(), k.strip()
                if a and k and k in d:
                    tag = set_attr(tag, a, d[k])
        km = re.search(r'\sdata-i18n="([^"]+)"', tag)
        if km and km.group(1) not in d:
            MISSING.append(km.group(1))
        if km and km.group(1) in d and name not in VOID and not tag.rstrip().endswith("/>"):
            close = element_end(src, name, e)
            out.append(tag + d[km.group(1)])
            i = close
            continue
        out.append(tag)
        i = e
    return "".join(out)


def absolutize(src_dir_url, tag_attr_value):
    v = tag_attr_value
    if re.match(r"^(/|#|[a-zA-Z][a-zA-Z0-9+.-]*:)", v):
        return v
    base = src_dir_url if src_dir_url.endswith("/") else src_dir_url.rsplit("/", 1)[0] + "/"
    parts = (base + v).split("/")
    stack = []
    for p in parts:
        if p == "..":
            if len(stack) > 1:
                stack.pop()
        elif p != ".":
            stack.append(p)
    return "/".join(stack)


def map_link(v):
    base, sep, frag = v.partition("#")
    if base.startswith("/books/") and "lang=" not in base:
        return base + ("&" if "?" in base else "?") + "lang=en" + sep + frag
    if base in ES2EN:
        return ES2EN[base] + sep + frag
    return v


def rewrite_links(s, es_url):
    def fix(m):
        attr, q, v = m.group(1), m.group(2), m.group(3)
        if attr == "href" or attr == "src" or attr == "srcset":
            nv = absolutize(es_url, v)
            if attr == "href":
                nv = map_link(nv)
            return '%s=%s%s%s' % (attr, q, nv, q)
        return m.group(0)
    return re.sub(r'\b(href|src|srcset)=(["\'])(.*?)\2', fix, s)


def head_fixes(s, es_url, en_url):
    s = re.sub(r'<html lang="es">', '<html lang="en">', s, count=1)
    s = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s%s">' % (SITE, en_url), s, count=1)
    s = re.sub(r'\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">', "", s)
    alt = ('\n<link rel="alternate" hreflang="es" href="%s%s">\n<link rel="alternate" hreflang="en" href="%s%s">'
           '\n<link rel="alternate" hreflang="x-default" href="%s%s">') % (SITE, es_url, SITE, en_url, SITE, es_url)
    s = re.sub(r'(<link rel="canonical" href="[^"]*">)', lambda m: m.group(1) + alt, s, count=1)
    s = s.replace('<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="en_US">')
    s = s.replace('<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="es_ES">')
    s = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + SITE + en_url + m.group(2), s, count=1)
    return s


def fix_toggle(s):
    s = s.replace('data-set-lang="es" aria-pressed="true"', 'data-set-lang="es" aria-pressed="false"')
    return s.replace('data-set-lang="en" aria-pressed="false"', 'data-set-lang="en" aria-pressed="true"')


def set_titles(s, d):
    if "_title" in d:
        t = H.escape(d["_title"], quote=False)
        s = re.sub(r"<title>.*?</title>", lambda m: "<title>%s</title>" % t, s, count=1, flags=re.S)
        if '<meta property="og:title"' in s:
            s = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda m: m.group(1) + H.escape(d["_title"], quote=True) + m.group(2), s, count=1)
    if "ogDesc" in d:
        s = re.sub(r'(<meta property="og:description" content=")[^"]*(")', lambda m: m.group(1) + H.escape(d["ogDesc"], quote=True) + m.group(2), s, count=1)
    return s


PREPAINT_EN = """<script>
  /* English page: theme before first paint. The language is fixed by the URL (/en/). */
  (function () {
    var d = document.documentElement, t = null;
    try { t = localStorage.getItem("bk-theme"); } catch (e) {}
    if (t === "dark" || t === "light") d.setAttribute("data-theme", t);
    d.setAttribute("lang", "en");
  })();
</script>"""


def swap_scripts(s):
    # replace the language pre-paint script and drop the dictionary; keep everything else
    def one(m):
        body = m.group(1)
        if "bk-lang" in body:
            return PREPAINT_EN
        if "window.SITE_I18N" in body:
            return ""
        return m.group(0)
    return re.sub(r"<script>([\s\S]*?)</script>\n?", one, s)


def sitemap():
    urls = []
    for es, en in PAGES.values():
        urls.append((es, es, en))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    def entry(loc, es, en):
        return ("  <url>\n    <loc>%s%s</loc>\n"
                '    <xhtml:link rel="alternate" hreflang="es" href="%s%s"/>\n'
                '    <xhtml:link rel="alternate" hreflang="en" href="%s%s"/>\n  </url>') % (SITE, loc, SITE, es, SITE, en)
    for es, en in PAGES.values():
        lines.append(entry(es, es, en))
        lines.append(entry(en, es, en))
    lines.append("  <url>\n    <loc>%s/books/</loc>\n  </url>" % SITE)
    lines.append("</urlset>\n")
    return "\n".join(lines)


def ensure_es_alternates(path, src, es_url, en_url):
    """Make sure the Spanish page declares es / en / x-default alternates."""
    want = ('<link rel="alternate" hreflang="es" href="%s%s">\n<link rel="alternate" hreflang="en" href="%s%s">\n'
            '<link rel="alternate" hreflang="x-default" href="%s%s">') % (SITE, es_url, SITE, en_url, SITE, es_url)
    new = re.sub(r'(<link rel="alternate" hreflang="[^"]*" href="[^"]*">\s*)+', "", src)
    new = re.sub(r'(<link rel="canonical" href="[^"]*">)', lambda m: m.group(1) + "\n" + want + "\n", new, count=1)
    return new


def build():
    files = {}
    for rel, (es_url, en_url) in PAGES.items():
        path = os.path.join(ROOT, rel)
        src = open(path, encoding="utf-8").read()
        d = read_dict(src)
        files[path] = ensure_es_alternates(path, src, es_url, en_url)
        s = translate(src, d)
        s = set_titles(s, d)
        s = head_fixes(s, es_url, en_url)
        s = swap_scripts(s)
        s = fix_toggle(s)
        s = rewrite_links(s, es_url)
        files[out_path(en_url)] = s
    files[os.path.join(ROOT, "sitemap.xml")] = sitemap()
    return files


def main():
    files = build()
    if MISSING:
        print("warning: data-i18n keys without English text:", sorted(set(MISSING)))
    stale = []
    for path, text in files.items():
        cur = open(path, encoding="utf-8").read() if os.path.exists(path) else None
        if cur != text:
            stale.append(os.path.relpath(path, ROOT))
            if "--check" not in sys.argv:
                os.makedirs(os.path.dirname(path), exist_ok=True)
                open(path, "w", encoding="utf-8").write(text)
    if "--check" in sys.argv:
        if stale:
            print("stale:", ", ".join(stale))
            sys.exit(1)
        print("English pages are up to date")
    else:
        print("wrote/updated:", ", ".join(stale) if stale else "nothing (already current)")


if __name__ == "__main__":
    main()
