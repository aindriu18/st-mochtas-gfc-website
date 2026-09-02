import { getClubAdminUser } from '../../../admin-auth';
import { ensureArchiveSchema, getArchiveBindings, getArchiveItem } from '../../../../db/archive';
import type { ArchiveStatus } from '../../../../db/schema';

export const dynamic = 'force-dynamic';
async function requireArchiveAdmin() {
  const user = await getClubAdminUser();
  if (!user) return { error: Response.json({ error: 'Sign in is required.' }, { status: 401 }) };
  return { user };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireArchiveAdmin();
  if ('error' in auth) return auth.error;
  const runtime = getArchiveBindings();
  if (!runtime) return Response.json({ error: 'Archive storage has not been provisioned yet.' }, { status: 503 });
  const { id } = await params;
  await ensureArchiveSchema(runtime.db);
  const current = await getArchiveItem(id);
  if (!current) return Response.json({ error: 'Archive item not found.' }, { status: 404 });
  let body: { status?: ArchiveStatus; title?: string; category?: string; year?: string; description?: string; altText?: string };
  try { body = await request.json() as typeof body; }
  catch { return Response.json({ error: 'The archive change could not be read.' }, { status: 400 }); }
  const status = body.status ?? current.status;
  const title = (body.title ?? current.title).trim();
  const category = (body.category ?? current.category).trim();
  const year = (body.year ?? current.year ?? '').trim();
  const description = (body.description ?? current.description ?? '').trim();
  const altText = (body.altText ?? current.alt_text ?? '').trim();
  if (!['pending', 'published', 'rejected'].includes(status)) return Response.json({ error: 'Choose a valid archive status.' }, { status: 400 });
  if (!title) return Response.json({ error: 'Add a title before saving this archive item.' }, { status: 400 });
  if (!['teams', 'matches', 'club-life', 'documents'].includes(category)) return Response.json({ error: 'Choose a valid archive category.' }, { status: 400 });
  if (year && !/^\d{4}(?:s)?$/.test(year)) return Response.json({ error: 'Use a four-digit year or decade, such as 1994 or 1990s.' }, { status: 400 });
  if (current.content_type.startsWith('image/') && !altText) return Response.json({ error: 'Alternative text is required for photographs.' }, { status: 400 });
  const now = new Date().toISOString();
  const result = await runtime.db.prepare(`UPDATE archive_items
    SET status = ?, title = ?, category = ?, year = ?, description = ?, alt_text = ?, updated_at = ?,
      published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, ?) ELSE NULL END
    WHERE id = ?`).bind(status, title.slice(0, 160), category, year || null, description.slice(0, 1200) || null,
      altText.slice(0, 300) || null, now, status, now, id).run();
  if (!result.meta.changes) return Response.json({ error: 'Archive item not found.' }, { status: 404 });
  return Response.json({ id, status });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireArchiveAdmin();
  if ('error' in auth) return auth.error;
  const runtime = getArchiveBindings();
  if (!runtime) return Response.json({ error: 'Archive storage has not been provisioned yet.' }, { status: 503 });
  const { id } = await params;
  const item = await getArchiveItem(id);
  if (!item) return Response.json({ error: 'Archive item not found.' }, { status: 404 });
  await runtime.bucket.delete(item.object_key);
  await runtime.db.prepare('DELETE FROM archive_items WHERE id = ?').bind(id).run();
  return new Response(null, { status: 204 });
}
