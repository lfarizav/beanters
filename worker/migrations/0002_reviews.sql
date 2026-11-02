-- Visitor reviews, held as 'pending' until the owner approves them. Date only, no identifier of any kind.
CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  book       TEXT NOT NULL,
  stars      INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5),
  name       TEXT,
  comment    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);
