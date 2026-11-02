-- Anonymous aggregate counters. One integer per key, nothing else is stored.
-- Keys: "visits", "books_opened", "book:<id>".
CREATE TABLE IF NOT EXISTS counters (
  key TEXT PRIMARY KEY,
  n   INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  book       TEXT NOT NULL,
  stars      INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5),
  name       TEXT,
  comment    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);
