import { getClubAdminUser } from '../../../../admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getClubAdminUser();
  return user
    ? Response.json({ authenticated: true, email: user.email, method: user.method }, { headers: { 'Cache-Control': 'no-store' } })
    : Response.json({ authenticated: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
}
