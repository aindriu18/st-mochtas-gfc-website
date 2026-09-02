import { getClubAdminUser } from '../../../admin-auth';
import { ensureSiteContentSchema, getSiteMediaBindings } from '../../../../db/site-content';

export const dynamic = 'force-dynamic';
const permittedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const maxFileSize = 12 * 1024 * 1024;

function cleanFilename(value: string) {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'club-image';
}

export async function POST(request: Request) {
  const user = await getClubAdminUser();
  if (!user) return Response.json({ error: 'Sign in is required.' }, { status: 401 });
  const runtime = getSiteMediaBindings();
  if (!runtime) return Response.json({ error: 'Club media storage has not been provisioned.' }, { status: 503 });
  const form = await request.formData();
  const file = form.get('file');
  const altText = String(form.get('altText') ?? '').trim();
  if (!(file instanceof File) || !altText) return Response.json({ error: 'Choose an image and describe it.' }, { status: 400 });
  if (!permittedTypes.has(file.type)) return Response.json({ error: 'Upload a JPG, PNG, WebP or GIF image.' }, { status: 400 });
  if (file.size < 1 || file.size > maxFileSize) return Response.json({ error: 'The image must be no larger than 12 MB.' }, { status: 400 });

  await ensureSiteContentSchema(runtime.db);
  const id = crypto.randomUUID();
  const objectKey = `site-media/${id}/${cleanFilename(file.name)}`;
  const now = new Date().toISOString();
  await runtime.bucket.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { uploadedBy: user.email, mediaId: id } });
  try {
    await runtime.db.prepare(`INSERT INTO site_media (id, object_key, original_name, content_type, size_bytes, alt_text, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, objectKey, file.name.slice(0, 180), file.type, file.size, altText.slice(0, 300), user.email, now).run();
  } catch (error) {
    await runtime.bucket.delete(objectKey);
    throw error;
  }
  return Response.json({ id, url: `/api/site-media/${id}`, altText }, { status: 201 });
}
