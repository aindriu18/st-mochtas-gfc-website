import { exchangeSupabaseAccessToken } from '../../../../admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json() as { accessToken?: string };
  if (!body.accessToken || body.accessToken.length > 5000) {
    return Response.json({ error: 'The sign-in link is invalid or has expired.' }, { status: 400 });
  }
  const result = await exchangeSupabaseAccessToken(body.accessToken);
  return result.ok
    ? Response.json({ ok: true })
    : Response.json({ error: result.error, code: result.code, reference: result.reference }, { status: result.status });
}
