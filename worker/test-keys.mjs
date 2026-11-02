// Unit tests for the validation logic: node worker/test-keys.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker, { keysFor, reviewFor, isBot, BOOK_IDS, GHOST_IDS } from "./index.mjs";
assert.deepEqual(keysFor({ t: "visit" }), ["visits"]);
assert.deepEqual(keysFor({ t: "book", id: "cka" }), ["books_opened", "book:cka"]);
for (const bad of [null, 1, "x", {}, { t: "book" }, { t: "book", id: "nope" }, { t: "book", id: "CKA" },
  { t: "book", id: "../x" }, { t: "book", id: "a".repeat(41) }, { t: "book", id: 5 }, { t: "other" }]) {
  assert.equal(keysFor(bad), null, JSON.stringify(bad));
}
for (const id of BOOK_IDS) assert.ok(/^[a-z0-9-]{1,40}$/.test(id));
assert.equal(isBot("Googlebot/2.1"), true);
assert.equal(isBot("curl/8.0"), true);
assert.equal(isBot(""), true);
assert.equal(isBot("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"), false);

// Votes: own key only, ghost allow-list only.
assert.deepEqual(keysFor({ t: "vote", id: "lfcs-comico" }), ["vote:lfcs-comico"]);
assert.deepEqual(keysFor({ t: "vote", id: "specialty-coffee-seed-to-cup" }), ["vote:specialty-coffee-seed-to-cup"]);
for (const bad of [{ t: "vote" }, { t: "vote", id: "nope" }, { t: "vote", id: "cka" }, { t: "vote", id: "LFCS-COMICO" },
  { t: "vote", id: "../x" }, { t: "vote", id: "a".repeat(41) }, { t: "vote", id: 5 }, { t: "book", id: "lfcs-comico" }]) {
  assert.equal(keysFor(bad), null, JSON.stringify(bad));
}
assert.equal(GHOST_IDS.length, 17);
for (const id of GHOST_IDS) assert.ok(/^[a-z0-9-]{1,40}$/.test(id));

// The allow-lists match the ids the site really uses.
const site = {};
new Function("window", readFileSync(new URL("../books/assets/js/books-data.js", import.meta.url), "utf8"))(site);
assert.deepEqual(site.BOOKS.map((b) => b.id), BOOK_IDS);
assert.deepEqual(site.GHOSTS.map((b) => b.id), GHOST_IDS);

// End to end through the handler, with an in-memory D1.
const rows = new Map();
const env = { DB: {
  prepare: (sql) => ({
    bind: (k) => ({ k }),
    all: async () => ({ results: [...rows].map(([key, n]) => ({ key, n })) }),
  }),
  batch: async (list) => { for (const { k } of list) rows.set(k, (rows.get(k) || 0) + 1); },
} };
const browser = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const hit = (body, ua = browser) => worker.fetch(new Request("https://beanters.com/api/counter/hit",
  { method: "POST", body: JSON.stringify(body), headers: { "User-Agent": ua } }), env);
const stats = async () => {
  const r = await worker.fetch(new Request("https://beanters.com/api/counter/stats"), env);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("Cache-Control"), "public, max-age=30");
  return r.json();
};
assert.equal((await hit({ t: "visit" })).status, 204);
assert.equal((await hit({ t: "book", id: "cka" })).status, 204);
assert.equal((await hit({ t: "vote", id: "lfcs-comico" })).status, 204);
assert.equal((await hit({ t: "vote", id: "lfcs-comico" })).status, 204);
assert.equal((await hit({ t: "vote", id: "nope" })).status, 400);
assert.equal((await hit({ t: "vote", id: "cka" })).status, 400);
assert.equal((await hit({ t: "vote", id: "kca-comico" }, "Googlebot/2.1")).status, 204); // answered, not counted
assert.deepEqual(await stats(), { visits: 1, books_opened: 1, by_book: { cka: 1 }, by_vote: { "lfcs-comico": 2 } });

// Reviews: validation, honeypot, bots, approved-only output.
const ok = { book: "cka", stars: 5, comment: "  Muy util  ", name: " Ana " };
assert.deepEqual(reviewFor(ok), { book: "cka", stars: 5, name: "Ana", comment: "Muy util" });
assert.equal(reviewFor({ ...ok, name: undefined }).name, "");
for (const bad of [null, "x", {}, { ...ok, book: "lfcs-comico" }, { ...ok, book: 5 }, { ...ok, stars: 0 }, { ...ok, stars: 6 },
  { ...ok, stars: 4.5 }, { ...ok, stars: "5" }, { ...ok, comment: "ab" }, { ...ok, comment: "   " }, { ...ok, comment: "a".repeat(1001) },
  { ...ok, comment: 7 }, { ...ok, name: "n".repeat(41) }, { ...ok, name: 3 }]) {
  assert.equal(reviewFor(bad), null, JSON.stringify(bad));
}
assert.ok(reviewFor({ ...ok, comment: "a".repeat(1000), name: "n".repeat(40) }));
const store = [];
const renv = { DB: { prepare: (sql) => ({
  bind: (...args) => ({ run: async () => { assert.ok(/\?1.*\?5/.test(sql)); store.push({ id: store.length + 1, book: args[0], stars: args[1], name: args[2], comment: args[3], status: "pending", created_at: args[4] }); } }),
  all: async () => {
    const appr = store.filter((r) => r.status === "approved");
    if (/GROUP BY/.test(sql)) {
      const g = {};
      for (const r of appr) (g[r.book] ||= []).push(r.stars);
      return { results: Object.entries(g).map(([book, a]) => ({ book, count: a.length, avg: a.reduce((x, y) => x + y, 0) / a.length })) };
    }
    return { results: appr.slice().reverse() };
  },
}) } };
const post = (body, { ua = browser, raw, origin } = {}) => worker.fetch(new Request("https://beanters.com/api/counter/review",
  { method: "POST", body: raw ?? JSON.stringify(body), headers: { "User-Agent": ua, ...(origin ? { Origin: origin } : {}) } }), renv);
assert.equal((await post(ok)).status, 204);
assert.equal(store.length, 1);
assert.equal(store[0].status, "pending");
assert.match(store[0].created_at, /^\d{4}-\d{2}-\d{2}$/);
assert.deepEqual(Object.keys(store[0]).sort(), ["book", "comment", "created_at", "id", "name", "stars", "status"]);
assert.equal((await post({ ...ok, stars: 9 })).status, 400);
assert.equal((await post(null, { raw: "{bad" })).status, 400);
assert.equal((await post({ ...ok, comment: "a".repeat(3100) })).status, 400);
assert.equal((await post({ ...ok, website: "http://spam" })).status, 204); // honeypot: answered, not stored
assert.equal((await post(ok, { ua: "Googlebot/2.1" })).status, 204);        // bot: answered, not stored
assert.equal((await post(ok, { origin: "https://evil.example" })).status, 403);
assert.equal(store.length, 1);
let g = await (await worker.fetch(new Request("https://beanters.com/api/counter/reviews"), renv)).json();
assert.deepEqual(g, {}); // pending is never public
store[0].status = "approved";
for (let i = 0; i < 25; i++) store.push({ id: 10 + i, book: "cka", stars: 3, name: null, comment: "c" + i, status: "approved", created_at: "2026-11-01" });
store.push({ id: 99, book: "cks", stars: 1, name: "x", comment: "hidden", status: "pending", created_at: "2026-11-01" });
const rr = await worker.fetch(new Request("https://beanters.com/api/counter/reviews"), renv);
assert.match(rr.headers.get("Cache-Control"), /^public, max-age=\d+$/);
g = await rr.json();
assert.deepEqual(Object.keys(g), ["cka"]);
assert.equal(g.cka.count, 26);
assert.equal(g.cka.avg, 3.1);
assert.equal(g.cka.items.length, 20);
assert.ok(!JSON.stringify(g).includes("hidden") && !("id" in g.cka.items[0]));
assert.deepEqual(Object.keys(g.cka.items[0]).sort(), ["comment", "date", "name", "stars"]);
console.log("ok");
