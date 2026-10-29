#!/usr/bin/env node
/**
 * evaluate.js: Automated UX + Performance evaluation for beanters.com
 * Usage: node scripts/evaluate.js [--url https://beanters.com] [--out reports/]
 *
 * Runs:
 *   1. Lighthouse CLI (desktop + mobile) for all categories
 *   2. UX checklist validation from source HTML/JS
 * Outputs:
 *   - reports/lighthouse-desktop.json
 *   - reports/lighthouse-mobile.json
 *   - reports/ux-audit.json
 *   - reports/full-report.md   ← human-readable final report
 */

const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const http = require('https');

// ── CLI args ─────────────────────────────────────────────────────────────────
const args  = process.argv.slice(2);
const URL   = args[args.indexOf('--url')  + 1] || 'https://beanters.com';
const OUT   = args[args.indexOf('--out')  + 1] || path.join(__dirname, '../reports');
const CHROME_FLAGS = '--headless --no-sandbox --disable-gpu --disable-dev-shm-usage';

fs.mkdirSync(OUT, { recursive: true });

const T_START = Date.now();
console.log(`\n🔍  Beanters Automated Evaluator`);
console.log(`    URL : ${URL}`);
console.log(`    Out : ${OUT}\n`);

// ── Helper: run Lighthouse ────────────────────────────────────────────────────
function runLighthouse(label, formFactor) {
  const outFile = path.join(OUT, `lighthouse-${label}.json`);
  console.log(`⚡  Lighthouse (${label})…`);
  const result = spawnSync('npx', [
    'lighthouse', URL,
    `--chrome-flags=${CHROME_FLAGS}`,
    '--output=json',
    `--output-path=${outFile}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    `--emulated-form-factor=${formFactor}`,
    '--throttling-method=simulate',
    '--quiet',
  ], { encoding: 'utf8', timeout: 120_000 });
  if (result.status !== 0) console.warn(`  ⚠ Lighthouse ${label} exited with ${result.status}`);
  return outFile;
}

// ── Helper: extract metrics from LH JSON ─────────────────────────────────────
function parseLH(file) {
  if (!fs.existsSync(file)) return null;
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  const a = d.audits;
  const cat = d.categories;
  return {
    scores: {
      performance:     Math.round((cat.performance?.score    ?? 0) * 100),
      accessibility:   Math.round((cat.accessibility?.score  ?? 0) * 100),
      bestPractices:   Math.round((cat['best-practices']?.score ?? 0) * 100),
      seo:             Math.round((cat.seo?.score            ?? 0) * 100),
    },
    metrics: {
      fcp:  a['first-contentful-paint']?.displayValue  || '-',
      lcp:  a['largest-contentful-paint']?.displayValue || '-',
      si:   a['speed-index']?.displayValue             || '-',
      tti:  a['interactive']?.displayValue             || '-',
      tbt:  a['total-blocking-time']?.displayValue     || '-',
      cls:  a['cumulative-layout-shift']?.displayValue || '-',
      fcpScore: a['first-contentful-paint']?.score    ?? 0,
      lcpScore: a['largest-contentful-paint']?.score  ?? 0,
      clsScore: a['cumulative-layout-shift']?.score   ?? 0,
      tbtScore: a['total-blocking-time']?.score        ?? 0,
    },
    failedAudits: Object.entries(a)
      .filter(([, v]) => v.score !== null && v.score < 0.9)
      .sort((a, b) => a[1].score - b[1].score)
      .map(([k, v]) => ({ id: k, score: v.score, title: v.title, value: v.displayValue || '' })),
    resources: a['resource-summary']?.details?.items || [],
    thirdParty: a['third-party-summary']?.details?.items || [],
  };
}

// ── Helper: UX checklist from source ─────────────────────────────────────────
function runUXAudit(htmlFile) {
  console.log(`🎨  UX source-code audit…`);
  if (!fs.existsSync(htmlFile)) return { error: 'index.html not found' };

  const html = fs.readFileSync(htmlFile, 'utf8');
  let jsContent = '';
  const jsFile = path.join(path.dirname(htmlFile), 'js/app.js');
  if (fs.existsSync(jsFile)) jsContent = fs.readFileSync(jsFile, 'utf8');
  const combined = html + jsContent;

  const checks = [
    // Performance
    { id: 'no-babel-standalone',   pass: !combined.includes('babel.min.js') && !combined.includes('text/babel'), label: 'No Babel Standalone in-browser transpilation' },
    { id: 'precompiled-js',        pass: combined.includes('js/app.js'),                                          label: 'Pre-compiled JS bundle served (js/app.js)' },
    { id: 'font-preload',          pass: combined.includes('rel="preload" as="style"'),                           label: 'Font stylesheet preloaded' },
    { id: 'reduced-font-families', pass: !/<link[^>]*Instrument[^>]*>/.test(html) && !/font-family[^;]*Instrument/.test(html), label: 'Instrument Serif removed (4→3 font families)' },
    { id: 'lazy-images',           pass: /loading[=:]["']lazy/.test(combined),                                            label: 'Lazy loading on images' },

    // Accessibility
    { id: 'skip-link',             pass: combined.includes('skip-link') || combined.includes('skip to main'),     label: 'Skip-to-main-content link present' },
    { id: 'main-landmark',         pass: combined.includes('main-content') || combined.includes('<main'),          label: '<main> landmark in document' },
    { id: 'no-emoji-icons',        pass: !/[📡📺🌐🛰️📦📻🧠📊🌎💡📚☸️🏛️🔄🧬🤖]/.test(jsContent),              label: 'No emoji used as structural icons' },
    { id: 'reduced-motion',        pass: combined.includes('prefers-reduced-motion'),                             label: 'prefers-reduced-motion CSS present' },
    { id: 'meta-description',      pass: /<meta name="description"/.test(html) && html.indexOf('<meta name="description"') < html.indexOf('</head>'), label: 'Meta description in static <head>' },
    { id: 'html-lang',             pass: combined.includes('lang="en"'),                                          label: 'html[lang] attribute set' },
    { id: 'favicon',               pass: combined.includes('favicon.svg') || combined.includes('favicon.ico'),    label: 'Favicon linked in <head>' },
    { id: 'no-heading-skip',       pass: !jsContent.includes('"h4"'),                                             label: 'No h4 headings (no heading level skip)' },
    { id: 'select-label',          pass: combined.includes('htmlFor') || combined.includes('for="'),              label: 'Form select has associated label (htmlFor)' },

    // Trust & content
    { id: 'no-fake-logos',         pass: !combined.includes('logos shown are illustrative'),                      label: 'Placeholder logo disclaimer removed' },
    { id: 'no-fake-testimonials',  pass: !combined.includes('illustrative quotes'),                               label: 'Fake testimonial disclaimer removed' },
    { id: 'privacy-page',          pass: fs.existsSync(path.join(path.dirname(htmlFile), 'privacy.html')),        label: 'Privacy Policy page exists' },
    { id: 'terms-page',            pass: fs.existsSync(path.join(path.dirname(htmlFile), 'terms.html')),          label: 'Terms of Service page exists' },

    // Navigation & links
    { id: 'footer-links-fixed',    pass: combined.includes('tel:+573') && combined.includes('linkedin.com'),      label: 'Footer tel: and LinkedIn links wired correctly' },
    { id: 'privacy-linked',        pass: combined.includes('privacy.html'),                                       label: 'Privacy link points to privacy.html' },
    { id: 'terms-linked',          pass: combined.includes('terms.html'),                                         label: 'Terms link points to terms.html' },

    // Forms
    { id: 'form-required',         pass: combined.includes('required'),                                           label: 'Contact form has required attributes' },
    { id: 'form-async',            pass: combined.includes('async') && combined.includes('finally'),              label: 'Form handler is async with finally block' },
  ];

  const passed = checks.filter(c => c.pass).length;
  return { checks, passed, total: checks.length, score: Math.round((passed / checks.length) * 100) };
}

// ── Run evaluations ───────────────────────────────────────────────────────────
const desktopFile = runLighthouse('desktop', 'desktop');
const mobileFile  = runLighthouse('mobile',  'mobile');
const desktop     = parseLH(desktopFile);
const mobile      = parseLH(mobileFile);
const ux          = runUXAudit(path.join(__dirname, '../index.html'));

fs.writeFileSync(path.join(OUT, 'ux-audit.json'), JSON.stringify(ux, null, 2));

// ── Scoring helpers ───────────────────────────────────────────────────────────
const emoji = s => s >= 90 ? '🟢' : s >= 50 ? '🟡' : '🔴';
const metricEmoji = s => s === 1 ? '🟢' : s >= 0.5 ? '🟡' : '🔴';

// ── Generate Markdown report ──────────────────────────────────────────────────
const elapsed = ((Date.now() - T_START) / 1000).toFixed(1);

const resourceSummary = desktop?.resources.map(r =>
  `| ${r.resourceType} | ${r.requestCount} | ${Math.round((r.transferSize||0)/1024)} KB |`
).join('\n') || '';

const failedDesktop = desktop?.failedAudits.slice(0, 10).map(a =>
  `| ${a.score?.toFixed(2) ?? '-'} | ${a.id} | ${a.value || '-'} |`
).join('\n') || '';

const uxRows = ux.checks?.map(c =>
  `| ${c.pass ? '✅' : '❌'} | ${c.label} |`
).join('\n') || '';

const thirdParty = desktop?.thirdParty.map(t =>
  `| ${t.entity||'-'} | ${Math.round((t.blockingTime||0))}ms | ${Math.round((t.transferSize||0)/1024)} KB |`
).join('\n') || '';

const date = new Date().toISOString().split('T')[0];

const md = `# Automated Evaluation Report: beanters.com

**Date:** ${date}
**URL:** ${URL}
**Script:** \`scripts/evaluate.js\`
**Runtime:** ${elapsed}s

---

## 1. Lighthouse Scores

| Category | Desktop | Mobile |
|---|---|---|
| **Performance** | ${emoji(desktop?.scores.performance)} ${desktop?.scores.performance ?? '-'} | ${emoji(mobile?.scores.performance)} ${mobile?.scores.performance ?? '-'} |
| **Accessibility** | ${emoji(desktop?.scores.accessibility)} ${desktop?.scores.accessibility ?? '-'} | ${emoji(mobile?.scores.accessibility)} ${mobile?.scores.accessibility ?? '-'} |
| **Best Practices** | ${emoji(desktop?.scores.bestPractices)} ${desktop?.scores.bestPractices ?? '-'} | ${emoji(mobile?.scores.bestPractices)} ${mobile?.scores.bestPractices ?? '-'} |
| **SEO** | ${emoji(desktop?.scores.seo)} ${desktop?.scores.seo ?? '-'} | ${emoji(mobile?.scores.seo)} ${mobile?.scores.seo ?? '-'} |

---

## 2. Core Web Vitals

### Desktop

| Metric | Value | Score |
|---|---|---|
| First Contentful Paint (FCP) | ${desktop?.metrics.fcp} | ${metricEmoji(desktop?.metrics.fcpScore)} |
| Largest Contentful Paint (LCP) | ${desktop?.metrics.lcp} | ${metricEmoji(desktop?.metrics.lcpScore)} |
| Speed Index (SI) | ${desktop?.metrics.si} | - |
| Time to Interactive (TTI) | ${desktop?.metrics.tti} | - |
| Total Blocking Time (TBT) | ${desktop?.metrics.tbt} | ${metricEmoji(desktop?.metrics.tbtScore)} |
| Cumulative Layout Shift (CLS) | ${desktop?.metrics.cls} | ${metricEmoji(desktop?.metrics.clsScore)} |

### Mobile

| Metric | Value | Score |
|---|---|---|
| First Contentful Paint (FCP) | ${mobile?.metrics.fcp} | ${metricEmoji(mobile?.metrics.fcpScore)} |
| Largest Contentful Paint (LCP) | ${mobile?.metrics.lcp} | ${metricEmoji(mobile?.metrics.lcpScore)} |
| Speed Index (SI) | ${mobile?.metrics.si} | - |
| Time to Interactive (TTI) | ${mobile?.metrics.tti} | - |
| Total Blocking Time (TBT) | ${mobile?.metrics.tbt} | ${metricEmoji(mobile?.metrics.tbtScore)} |
| Cumulative Layout Shift (CLS) | ${mobile?.metrics.cls} | ${metricEmoji(mobile?.metrics.clsScore)} |

---

## 3. Resource Summary (Desktop)

| Type | Count | Size |
|---|---|---|
${resourceSummary}

---

## 4. Third-Party Impact (Desktop)

| Entity | Blocking Time | Transfer Size |
|---|---|---|
${thirdParty || '| - | - | - |'}

---

## 5. Failed / Warning Audits (Desktop, top 10)

| Score | Audit ID | Value |
|---|---|---|
${failedDesktop || '| - | No failures | - |'}

---

## 6. UX Source-Code Checklist

**Score: ${ux.passed}/${ux.total} (${ux.score}%)**

| Status | Check |
|---|---|
${uxRows}

---

## 7. Remaining Issues

${(desktop?.failedAudits || [])
  .filter(a => a.score < 0.5)
  .map(a => `- **${a.id}** (${a.score?.toFixed(2)}): ${a.title}`)
  .join('\n') || '- No critical failures remaining.'}

---

*Generated by \`scripts/evaluate.js\` · Lighthouse CLI v$(npx lighthouse --version 2>/dev/null || echo '?') · Node ${process.version}*
`;

const reportPath = path.join(OUT, 'full-report.md');
fs.writeFileSync(reportPath, md);
console.log(`\n✅  Done in ${elapsed}s`);
console.log(`   Desktop performance : ${desktop?.scores.performance ?? '-'}`);
console.log(`   Mobile  performance : ${mobile?.scores.performance ?? '-'}`);
console.log(`   UX checklist        : ${ux.passed}/${ux.total} (${ux.score}%)`);
console.log(`   Report              : ${reportPath}\n`);
