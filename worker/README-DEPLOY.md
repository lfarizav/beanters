# Beanters counters: deploy guide

Anonymous counters (page visits, books opened, votes for unpublished books) served by a Cloudflare Worker with a
D1 database on `beanters.com/api/counter/*`. The site works without it: if the API is missing the counters and
vote counts stay hidden, and a vote shows a calm message instead of being marked as done.

What is stored: one integer per key in D1 (`visits`, `books_opened`, `book:<id>`, `vote:<id>`). No IP, User-Agent,
cookie or identifier. This folder is removed from the GitHub Pages artifact by `.github/workflows/pages.yml`
and holds no secrets (the `database_id` in `wrangler.toml` is a placeholder until you paste yours).

Commands follow the Cloudflare docs: [D1 wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/),
[wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/),
[Workers routes](https://developers.cloudflare.com/workers/configuration/routing/routes/).

## Deploy (the owner runs these; `wrangler login` is interactive)

```bash
cd worker
npm install --no-save wrangler        # or use: npx wrangler ...
npx wrangler login                    # opens the browser, approve once

# 1. Create the database. Copy the database_id it prints.
npx wrangler d1 create beanters-counter

# 2. Paste that id into wrangler.toml (replace 00000000-0000-0000-0000-000000000000).

# 3. Create the table in the REMOTE database (--remote is required, local is a separate copy).
npx wrangler d1 execute beanters-counter --remote --file=schema.sql

# 4. Deploy the Worker. The [[routes]] block in wrangler.toml attaches beanters.com/api/counter/*.
npx wrangler deploy
```

Requirement for the route: the `beanters.com` DNS record must be proxied by Cloudflare (orange cloud). If you
prefer the dashboard: Workers & Pages > beanters-counter > Settings > Domains & Routes > Add > Route >
`beanters.com/api/counter/*`.

## Smoke test

```bash
curl -i https://beanters.com/api/counter/stats
# 200, JSON {"visits":0,"books_opened":0,"by_book":{},"by_vote":{}}

curl -i -X POST https://beanters.com/api/counter/hit -d '{"t":"visit"}' -A "Mozilla/5.0 Chrome/120"
# 204

curl -i -X POST https://beanters.com/api/counter/hit -d '{"t":"book","id":"cka"}' -A "Mozilla/5.0 Chrome/120"
# 204

curl -i -X POST https://beanters.com/api/counter/hit -d '{"t":"book","id":"nope"}' -A "Mozilla/5.0 Chrome/120"
# 400 (id not on the allow-list)

curl -i -X POST https://beanters.com/api/counter/hit -d '{"t":"vote","id":"lfcs-comico"}' -A "Mozilla/5.0 Chrome/120"
# 204 (increments vote:lfcs-comico only, never visits or books_opened)

curl -i -X POST https://beanters.com/api/counter/hit -d '{"t":"vote","id":"cka"}' -A "Mozilla/5.0 Chrome/120"
# 400 (published books are not on the vote allow-list)

curl -s https://beanters.com/api/counter/stats   # Cloudflare may cache it up to 30 s
```

Requests whose User-Agent looks like a bot or a command-line client (for example plain `curl`) get 204 but are
not counted, so always pass a browser-like `-A` when testing.

## Local run (no login, no network to Cloudflare)

```bash
cd worker
npx wrangler d1 execute beanters-counter --local --file=schema.sql
npx wrangler dev --local --port 8787
node test-keys.mjs                    # unit tests of the validation logic
```

## Add a new book id to the allow-list

1. Add the book to `books/assets/js/books-data.js` (its `id:`).
2. Add the same id to `BOOK_IDS` at the top of `worker/index.mjs`.
3. `npx wrangler deploy` again. No schema change is needed: the key `book:<id>` is created on the first open.

The id must match `^[a-z0-9-]{1,40}$`.

## Add or publish an unpublished book (votes)

1. Unpublished books live in `window.GHOSTS` in `books/assets/js/books-data.js`; their ids are in `GHOST_IDS` at the top
   of `worker/index.mjs`. `node test-keys.mjs` fails if the two lists differ, and the same for `window.BOOKS` and `BOOK_IDS`.
2. To add a book, add it to both lists. To publish one, move it to `window.BOOKS` and `BOOK_IDS`.
3. `npx wrangler deploy` again. No schema change is needed: the key `vote:<id>` is created on the first vote.

The Worker cannot tell who voted, by design. The one vote per browser rule lives only in the visitor's `localStorage`
(`bk-vote-<id>`, which holds the count shown after voting). `/stats` stays cached for 30 s, so the page adds the visitor's own vote locally.

## Reset or inspect

```bash
npx wrangler d1 execute beanters-counter --remote --command "SELECT key, n FROM counters"
npx wrangler d1 execute beanters-counter --remote --command "UPDATE counters SET n = 0"
```

## Notes

- Increments are one atomic SQL statement (`INSERT ... ON CONFLICT DO UPDATE SET n = n + 1`), safe under concurrency.
- `wrangler d1 execute` needs an explicit `--local` or `--remote`; this guide always passes one.
- No rate limit is implemented. If abuse appears, add a Cloudflare WAF rate-limiting rule on `/api/counter/hit`.

---

_Hecho con ❤️ por Luis Felipe Ariza Vesga._
