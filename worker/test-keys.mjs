// Unit tests for the validation logic: node worker/test-keys.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker, { keysFor, isBot, BOOK_IDS, GHOST_IDS } from "./index.mjs";
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
console.log("ok");
