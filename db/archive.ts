import { env } from 'cloudflare:workers';
import { archiveSchemaStatements, type ArchiveItem, type ArchiveStatus } from './schema';

type ArchiveEnvironment = Cloudflare.Env & {
  DB?: D1Database;
  ARCHIVE?: R2Bucket;
  ADMIN_EMAILS?: string;
};

function bindings() { return env as ArchiveEnvironment; }

export function getArchiveBindings() {
  const runtime = bindings();
  if (!runtime.DB || !runtime.ARCHIVE) return null;
  return { db: runtime.DB, bucket: runtime.ARCHIVE };
}

export function isArchiveAdmin(email: string) {
  const allowed = (bindings().ADMIN_EMAILS ?? '')
    .split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export async function ensureArchiveSchema(db: D1Database) {
  await db.batch(archiveSchemaStatements.map((statement) => db.prepare(statement)));
  await db.prepare('PRAGMA optimize').run();
}

export async function listArchiveItems(status?: ArchiveStatus) {
  const runtime = getArchiveBindings();
  if (!runtime) return [] as ArchiveItem[];
  await ensureArchiveSchema(runtime.db);
  const query = status
    ? runtime.db.prepare('SELECT * FROM archive_items WHERE status = ? ORDER BY COALESCE(published_at, created_at) DESC').bind(status)
    : runtime.db.prepare('SELECT * FROM archive_items ORDER BY created_at DESC');
  const result = await query.all<ArchiveItem>();
  return result.results;
}

export async function getArchiveItem(id: string) {
  const runtime = getArchiveBindings();
  if (!runtime) return null;
  await ensureArchiveSchema(runtime.db);
  return runtime.db.prepare('SELECT * FROM archive_items WHERE id = ?').bind(id).first<ArchiveItem>();
}
