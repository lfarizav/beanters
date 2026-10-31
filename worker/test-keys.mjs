// Unit tests for the validation logic: node worker/test-keys.mjs
import assert from "node:assert/strict";
import { keysFor, isBot, BOOK_IDS } from "./index.mjs";
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
console.log("ok");
