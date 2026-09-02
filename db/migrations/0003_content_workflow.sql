CREATE TABLE IF NOT EXISTS site_content_drafts (
  section TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_content_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT NOT NULL,
  data_json TEXT NOT NULL,
  action TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_content_revisions_section_updated
ON site_content_revisions(section, updated_at DESC);

PRAGMA optimize;
