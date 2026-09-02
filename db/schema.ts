export const archiveSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS archive_items (
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
  )`,
  `CREATE INDEX IF NOT EXISTS idx_archive_items_status_created
    ON archive_items(status, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_archive_items_category_year
    ON archive_items(category, year)`,
] as const;

export const siteContentSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS site_content (
    section TEXT PRIMARY KEY,
    data_json TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS site_media (
    id TEXT PRIMARY KEY,
    object_key TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    alt_text TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_site_media_created
    ON site_media(created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS site_content_drafts (
    section TEXT PRIMARY KEY,
    data_json TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS site_content_revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    data_json TEXT NOT NULL,
    action TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_site_content_revisions_section_updated
    ON site_content_revisions(section, updated_at DESC)`,
] as const;

export type ArchiveStatus = 'pending' | 'published' | 'rejected';
export type ArchiveCategory = 'teams' | 'matches' | 'club-life' | 'documents';
export type ArchiveItem = {
  id: string; title: string; category: ArchiveCategory; year: string | null;
  description: string | null; alt_text: string | null; object_key: string;
  original_name: string; content_type: string; size_bytes: number;
  status: ArchiveStatus; created_by: string; created_at: string;
  updated_at: string; published_at: string | null;
};
