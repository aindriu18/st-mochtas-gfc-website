import { getClubAdminUser } from '../../../../admin-auth';
import { getArchiveBindings, getArchiveItem } from '../../../../../db/archive';

export const dynamic = 'force-dynamic';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const runtime = getArchiveBindings();
  if (!runtime) return new Response('Archive storage is unavailable.', { status: 503 });
  const { id } = await params;
  const item = await getArchiveItem(id);
  if (!item) return new Response('Not found.', { status: 404 });
  if (item.status !== 'published') {
    const user = await getClubAdminUser();
    if (!user) return new Response('Not found.', { status: 404 });
  }
  const object = await runtime.bucket.get(item.object_key);
  if (!object) return new Response('Not found.', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  const disposition = new URL(request.url).searchParams.get('download') === '1' ? 'attachment' : 'inline';
  headers.set('Content-Disposition', `${disposition}; filename="${item.original_name.replace(/["\\\r\n]/g, '')}"`);
  headers.set('Cache-Control', item.status === 'published' ? 'public, max-age=86400' : 'private, no-store');
  return new Response(object.body, { headers });
}
