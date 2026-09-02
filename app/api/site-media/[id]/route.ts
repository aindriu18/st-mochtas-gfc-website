import { ensureSiteContentSchema, getSiteMediaBindings } from '../../../../db/site-content';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const runtime = getSiteMediaBindings();
  if (!runtime) return new Response('Media unavailable', { status: 503 });
  await ensureSiteContentSchema(runtime.db);
  const { id } = await params;
  const item = await runtime.db.prepare('SELECT object_key, content_type FROM site_media WHERE id = ?').bind(id).first<{ object_key: string; content_type: string }>();
  if (!item) return new Response('Not found', { status: 404 });
  const object = await runtime.bucket.get(item.object_key);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'Content-Type': item.content_type,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
