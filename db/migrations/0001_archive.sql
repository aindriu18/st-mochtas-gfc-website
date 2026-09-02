CREATE TABLE IF NOT EXISTS archive_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('teams', 'matches', 'club-life', 'documents')),
  year TEXT,
  description TEXT,
  alt_text TEXT,
  object_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_archive_items_status_created
ON archive_items(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_archive_items_category_year
ON archive_items(category, year);

PRAGMA optimize;
