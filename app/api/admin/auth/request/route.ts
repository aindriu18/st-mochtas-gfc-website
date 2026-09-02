import { isArchiveAdmin } from '../../../../../db/archive';
import { requestSupabaseMagicLink } from '../../../../admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json() as { email?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!isArchiveAdmin(email)) {
    return Response.json({ ok: true }, { status: 202 });
  }
  const result = await requestSupabaseMagicLink(email, new URL('/admin/complete', request.url).toString());
  return result.ok
    ? Response.json({ ok: true }, { status: 202 })
    : Response.json({
      error: result.error,
      code: result.code,
      reference: result.reference,
      retryAfterSeconds: result.retryAfterSeconds,
    }, {
      status: result.status,
      headers: result.retryAfterSeconds ? { 'Retry-After': String(result.retryAfterSeconds) } : undefined,
    });
}
