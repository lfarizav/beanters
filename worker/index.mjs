/* Beanters anonymous counters. Cloudflare Worker + D1.
   Stores only integers per key (see schema.sql). No IP, User-Agent, cookie or any
   identifier is read into storage or logged.

   POST /api/counter/hit    body {"t":"visit"} or {"t":"book","id":"<book id>"}  -> 204
   GET  /api/counter/stats  -> {"visits":N,"books_opened":N,"by_book":{"id":N}}

   BOOK_IDS is the allow-list. Keep it equal to the ids in books/assets/js/books-data.js
   (the `id:` of each entry in window.BOOKS). README-DEPLOY.md explains how to add one. */

export const BOOK_IDS = ["kcna", "cka", "ckad", "cks"];

const ID_RE = /^[a-z0-9-]{1,40}$/;
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|preview|fetch|curl|wget|python|java\/|go-http|httpclient|okhttp|axios|node/i;
const ALLOWED_ORIGINS = ["https://beanters.com", "https://www.beanters.com", "http://localhost", "http://127.0.0.1"];
const MAX_BODY = 512;

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
  const out = { visits: 0, books_opened: 0, by_book: {} };
  for (const r of results) {
    if (r.key === "visits") out.visits = r.n;
    else if (r.key === "books_opened") out.books_opened = r.n;
    else if (r.key.startsWith("book:")) out.by_book[r.key.slice(5)] = r.n;
  }
  return new Response(JSON.stringify(out), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=30" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request.headers.get("Origin"));
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    try {
      if (url.pathname === "/api/counter/hit" && request.method === "POST") return await handleHit(request, env, headers);
      if (url.pathname === "/api/counter/stats" && request.method === "GET") return await handleStats(env, headers);
    } catch (e) {
      return new Response(null, { status: 500, headers });
    }
    return new Response(null, { status: 404, headers });
  },
};
