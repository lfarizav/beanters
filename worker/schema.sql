-- Anonymous aggregate counters. One integer per key, nothing else is stored.
-- Keys: "visits", "books_opened", "book:<id>".
CREATE TABLE IF NOT EXISTS counters (
  key TEXT PRIMARY KEY,
  n   INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;
