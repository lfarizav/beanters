/* Beanters anonymous counters. Cloudflare Worker + D1.
   Stores integers per key, plus reviews held as pending until approved (see schema.sql). No IP, User-Agent, cookie or any
   identifier is read into storage or logged.

   POST /api/counter/hit    body {"t":"visit"}, {"t":"book","id":"<book id>"} or {"t":"vote","id":"<ghost id>"}  -> 204
   GET  /api/counter/stats  -> {"visits":N,"books_opened":N,"by_book":{"id":N},"by_vote":{"id":N}}
   POST /api/counter/review body {"book","stars","comment","name","website"} -> 204, stored as "pending" with the date only
   GET  /api/counter/reviews -> approved reviews only, per published book (see handleReviews)

   BOOK_IDS and GHOST_IDS are the allow-lists. Keep them equal to the ids in
   books/assets/js/books-data.js (the `id:` of each entry in window.BOOKS and window.GHOSTS).
   README-DEPLOY.md explains how to add one. */

export const BOOK_IDS = ["kcna", "cka", "ckad", "cks"];
export const GHOST_IDS = [
  "aef-comico", "afcn-comico", "aft-comico", "aiko-comico", "atr-comico", "canonical-telco-comico",
  "capa-comico", "cba-comico", "cca-comico", "cgoa-comico", "iac-comico", "ica-comico", "kca-comico",
  "lfcs-comico", "otca-comico", "pca-comico", "specialty-coffee-seed-to-cup",
];

const ID_RE = /^[a-z0-9-]{1,40}$/;
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|preview|fetch|curl|wget|python|java\/|go-http|httpclient|okhttp|axios|node/i;
const ALLOWED_ORIGINS = ["https://beanters.com", "https://www.beanters.com", "http://localhost", "http://127.0.0.1"];
const MAX_BODY = 512;
const MAX_REVIEW_BODY = 3000;

/* Pure review validation, exported for unit tests. Returns the clean row fields, or null. */
export function reviewFor(body) {
  if (!body || typeof body !== "object") return null;
  if (typeof body.book !== "string" || !BOOK_IDS.includes(body.book)) return null;
  if (!Number.isInteger(body.stars) || body.stars < 1 || body.stars > 5) return null;
  if (typeof body.comment !== "string") return null;
  const comment = body.comment.trim();
  if (comment.length < 3 || comment.length > 1000) return null;
  let name = "";
  if (body.name !== undefined && body.name !== null) {
    if (typeof body.name !== "string") return null;
    name = body.name.trim();
    if (name.length > 40) return null;
  }
  return { book: body.book, stars: body.stars, name, comment };
}

function allowedOrigin(origin) {
  if (!origin) return null;
  for (const o of ALLOWED_ORIGINS) {
    if (origin === o || (o.startsWith("http://") && origin.startsWith(o + ":"))) return origin;
  }
  return null;
}

function cors(origin) {
  const h = { "Vary": "Origin" };
  const ok = allowedOrigin(origin);
  if (ok) {
    h["Access-Control-Allow-Origin"] = ok;
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

/* Pure validation, exported for unit tests. Returns the counter keys to increment, or null. */
export function keysFor(body) {
  if (!body || typeof body !== "object") return null;
  if (body.t === "visit") return ["visits"];
  if (body.t === "book" && typeof body.id === "string" && ID_RE.test(body.id) && BOOK_IDS.includes(body.id)) {
    return ["books_opened", "book:" + body.id];
  }
  /* A vote touches only its own key, never visits or books_opened. */
  if (body.t === "vote" && typeof body.id === "string" && ID_RE.test(body.id) && GHOST_IDS.includes(body.id)) {
    return ["vote:" + body.id];
  }
  return null;
}

export function isBot(ua) {
  return !ua || BOT_RE.test(ua);
}

async function handleHit(request, env, headers) {
  const origin = request.headers.get("Origin");
  if (origin && !allowedOrigin(origin)) return new Response(null, { status: 403, headers });
  const text = await request.text();
  if (text.length > MAX_BODY) return new Response(null, { status: 400, headers });
  let body = null;
  try { body = JSON.parse(text); } catch (e) { /* stays null */ }
  const keys = keysFor(body);
  if (!keys) return new Response(null, { status: 400, headers });
  /* Bots get the same 204, so they learn nothing, but are not counted. */
  if (isBot(request.headers.get("User-Agent"))) return new Response(null, { status: 204, headers });
  const stmt = env.DB.prepare("INSERT INTO counters (key, n) VALUES (?1, 1) ON CONFLICT(key) DO UPDATE SET n = n + 1");
  await env.DB.batch(keys.map((k) => stmt.bind(k)));
  return new Response(null, { status: 204, headers });
}

async function handleStats(env, headers) {
  const { results } = await env.DB.prepare("SELECT key, n FROM counters").all();
  const out = { visits: 0, books_opened: 0, by_book: {}, by_vote: {} };
  for (const r of results) {
    if (r.key === "visits") out.visits = r.n;
    else if (r.key === "books_opened") out.books_opened = r.n;
    else if (r.key.startsWith("book:")) out.by_book[r.key.slice(5)] = r.n;
    else if (r.key.startsWith("vote:")) out.by_vote[r.key.slice(5)] = r.n;
  }
  return new Response(JSON.stringify(out), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=30" },
  });
}

async function handleReview(request, env, headers) {
  const origin = request.headers.get("Origin");
  if (origin && !allowedOrigin(origin)) return new Response(null, { status: 403, headers });
  const text = await request.text();
  if (text.length > MAX_REVIEW_BODY) return new Response(null, { status: 400, headers });
  let body = null;
  try { body = JSON.parse(text); } catch (e) { /* stays null */ }
  /* Honeypot: a filled hidden field means a bot. Same 204, nothing stored. */
  if (body && typeof body === "object" && body.website) return new Response(null, { status: 204, headers });
  const r = reviewFor(body);
  if (!r) return new Response(null, { status: 400, headers });
  if (isBot(request.headers.get("User-Agent"))) return new Response(null, { status: 204, headers });
  const date = new Date().toISOString().slice(0, 10);
  await env.DB.prepare("INSERT INTO reviews (book, stars, name, comment, status, created_at) VALUES (?1, ?2, ?3, ?4, 'pending', ?5)")
    .bind(r.book, r.stars, r.name || null, r.comment, date).run();
  return new Response(null, { status: 204, headers });
}

/* Approved rows only, never ids. count and avg cover all approved rows; items are the 20 newest per book. */
async function handleReviews(env, headers) {
  const agg = await env.DB.prepare("SELECT book, COUNT(*) AS count, AVG(stars) AS avg FROM reviews WHERE status = 'approved' GROUP BY book").all();
  const list = await env.DB.prepare("SELECT book, stars, name, comment, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC, id DESC").all();
  const out = {};
  for (const r of agg.results) {
    if (BOOK_IDS.includes(r.book)) out[r.book] = { count: r.count, avg: Math.round(r.avg * 10) / 10, items: [] };
  }
  for (const r of list.results) {
    const o = out[r.book];
    if (o && o.items.length < 20) o.items.push({ stars: r.stars, name: r.name || "", comment: r.comment, date: r.created_at });
  }
  return new Response(JSON.stringify(out), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request.headers.get("Origin"));
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    try {
      if (url.pathname === "/api/counter/hit" && request.method === "POST") return await handleHit(request, env, headers);
      if (url.pathname === "/api/counter/review" && request.method === "POST") return await handleReview(request, env, headers);
      if (url.pathname === "/api/counter/reviews" && request.method === "GET") return await handleReviews(env, headers);
      if (url.pathname === "/api/counter/stats" && request.method === "GET") return await handleStats(env, headers);
    } catch (e) {
      return new Response(null, { status: 500, headers });
    }
    return new Response(null, { status: 404, headers });
  },
};
