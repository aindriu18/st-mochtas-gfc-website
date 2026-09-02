import { getClubAdminUser } from '../../admin-auth';
import { ensureArchiveSchema, getArchiveBindings, listArchiveItems } from '../../../db/archive';

export const dynamic = 'force-dynamic';
const permittedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const permittedCategories = new Set(['teams', 'matches', 'club-life', 'documents']);
const maxFileSize = 12 * 1024 * 1024;

function cleanFilename(value: string) {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'archive-upload';
}

async function requireArchiveAdmin() {
  const user = await getClubAdminUser();
  if (!user) return { error: Response.json({ error: 'Sign in is required.' }, { status: 401 }) };
  return { user };
}

export async function GET() {
  const auth = await requireArchiveAdmin();
  if ('error' in auth) return auth.error;
  return Response.json({ items: await listArchiveItems() }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const auth = await requireArchiveAdmin();
  if ('error' in auth) return auth.error;
  const runtime = getArchiveBindings();
  if (!runtime) return Response.json({ error: 'Archive storage has not been provisioned yet.' }, { status: 503 });

  const form = await request.formData();
  const file = form.get('file');
  const title = String(form.get('title') ?? '').trim();
  const category = String(form.get('category') ?? '').trim();
  const year = String(form.get('year') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const altText = String(form.get('altText') ?? '').trim();

  if (!(file instanceof File) || !title || !permittedCategories.has(category)) {
    return Response.json({ error: 'A file, title and valid category are required.' }, { status: 400 });
  }
  if (!permittedTypes.has(file.type)) return Response.json({ error: 'Upload a JPG, PNG, WebP, GIF or PDF file.' }, { status: 400 });
  if (file.size < 1 || file.size > maxFileSize) return Response.json({ error: 'The file must be no larger than 12 MB.' }, { status: 400 });
  if (file.type.startsWith('image/') && !altText) return Response.json({ error: 'Alternative text is required for photographs.' }, { status: 400 });
  if (year && !/^\d{4}(?:s)?$/.test(year)) return Response.json({ error: 'Use a four-digit year or decade, such as 1994 or 1990s.' }, { status: 400 });

  await ensureArchiveSchema(runtime.db);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const objectKey = `archive/${id}/${cleanFilename(file.name)}`;
  await runtime.bucket.put(objectKey, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { uploadedBy: auth.user.email, archiveId: id },
  });

  try {
    await runtime.db.prepare(`INSERT INTO archive_items (
      id, title, category, year, description, alt_text, object_key, original_name,
      content_type, size_bytes, status, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`)
      .bind(id, title.slice(0, 160), category, year || null,
        description.slice(0, 1200) || null, altText.slice(0, 300) || null,
        objectKey, file.name.slice(0, 180), file.type, file.size,
        auth.user.email, now, now).run();
  } catch (error) {
    await runtime.bucket.delete(objectKey);
    throw error;
  }
  return Response.json({ id, status: 'pending' }, { status: 201 });
}
