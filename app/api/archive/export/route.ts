import { getClubAdminUser } from '../../../admin-auth';
import { listArchiveItems } from '../../../../db/archive';

export const dynamic = 'force-dynamic';

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const user = await getClubAdminUser();
  if (!user) return Response.json({ error: 'Sign in is required.' }, { status: 401 });

  const url = new URL(request.url);
  const format = url.searchParams.get('format') === 'json' ? 'json' : 'csv';
  const items = await listArchiveItems();
  const exportedAt = new Date().toISOString();
  const records = items.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    year: item.year,
    description: item.description,
    alternative_text: item.alt_text,
    status: item.status,
    original_filename: item.original_name,
    content_type: item.content_type,
    size_bytes: item.size_bytes,
    storage_key: item.object_key,
    uploaded_by: item.created_by,
    created_at: item.created_at,
    updated_at: item.updated_at,
    published_at: item.published_at,
    download_path: `/api/archive/files/${item.id}?download=1`,
  }));
  const date = exportedAt.slice(0, 10);

  if (format === 'json') {
    return new Response(JSON.stringify({ archive: 'St. Mochtas GFC', exported_at: exportedAt, item_count: records.length, items: records }, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="st-mochtas-archive-${date}.json"`,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  const headings = Object.keys(records[0] ?? {
    id: '', title: '', category: '', year: '', description: '', alternative_text: '', status: '',
    original_filename: '', content_type: '', size_bytes: '', storage_key: '', uploaded_by: '',
    created_at: '', updated_at: '', published_at: '', download_path: '',
  });
  const rows = records.map((record) => headings.map((heading) => csvCell(record[heading as keyof typeof record])).join(','));
  const csv = [headings.map(csvCell).join(','), ...rows].join('\r\n');
  return new Response(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="st-mochtas-archive-${date}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
