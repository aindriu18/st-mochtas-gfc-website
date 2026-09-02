import { clearClubAdminSession } from '../../../../admin-auth';

export async function GET(request: Request) {
  await clearClubAdminSession();
  return Response.redirect(new URL('/admin', request.url), 303);
}
