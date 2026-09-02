import { getClubAdminUser } from '../../../admin-auth';
import { deleteSiteContentDraft, getSiteContentAdminState, restoreSiteContentRevision, saveSiteContentSection, type SiteContent } from '../../../../db/site-content';
import { validateSectionForPublish } from '../../../../lib/site-content-rules';

export const dynamic = 'force-dynamic';
const sections = new Set<keyof SiteContent>(['notices', 'fixtures', 'results', 'updates', 'sponsors', 'shops', 'officers', 'gallery', 'history', 'honours', 'contact', 'links']);

export async function GET() {
  const user = await getClubAdminUser();
  if (!user) return Response.json({ error: 'Sign in is required.' }, { status: 401 });
  try {
    return Response.json(await getSiteContentAdminState(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'The website editor could not load its saved content. Please refresh the page and try again.' }, { status: 500 });
  }
}

function validPayload(section: keyof SiteContent, data: unknown) {
  if (section === 'contact' || section === 'links') return !!data && typeof data === 'object' && !Array.isArray(data);
  return Array.isArray(data) && data.length <= 50 && data.every((item) => item && typeof item === 'object' && !Array.isArray(item));
}

export async function PATCH(request: Request) {
  const user = await getClubAdminUser();
  if (!user) return Response.json({ error: 'Sign in is required.' }, { status: 401 });
  let body: { section?: keyof SiteContent; data?: unknown; mode?: 'draft' | 'publish'; restoreId?: number };
  try {
    body = await request.json() as typeof body;
  } catch {
    return Response.json({ error: 'The change could not be read. Refresh the page and try again.' }, { status: 400 });
  }
  if (body.restoreId) {
    try { return Response.json({ ok: true, section: await restoreSiteContentRevision(body.restoreId, user.email) }); }
    catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'The earlier version could not be restored.' }, { status: 404 }); }
  }
  if (!body.section || !sections.has(body.section) || !validPayload(body.section, body.data)) {
    return Response.json({ error: 'Choose a valid website section and supply valid content.' }, { status: 400 });
  }
  if (body.mode !== 'draft') { const issue = validateSectionForPublish(body.section, body.data); if (issue) return Response.json({ error: `${issue} You can save incomplete work as a draft.` }, { status: 400 }); }
  const encoded = JSON.stringify(body.data);
  if (encoded.length > 100_000) return Response.json({ error: 'This update is too large.' }, { status: 413 });
  try {
    await saveSiteContentSection(body.section, body.data as never, user.email, body.mode === 'draft' ? 'draft' : 'publish');
    return Response.json({ ok: true, section: body.section, mode: body.mode === 'draft' ? 'draft' : 'publish' });
  } catch {
    return Response.json({ error: body.mode === 'draft' ? 'The draft could not be saved. Your changes are still on this screen, so please try again.' : 'The changes could not be published. They are still on this screen, so please try again.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getClubAdminUser();
  if (!user) return Response.json({ error: 'Sign in is required.' }, { status: 401 });
  const section = new URL(request.url).searchParams.get('section') as keyof SiteContent | null;
  if (!section || !sections.has(section)) return Response.json({ error: 'Choose a valid draft to discard.' }, { status: 400 });
  try {
    await deleteSiteContentDraft(section);
    return Response.json({ ok: true, section });
  } catch {
    return Response.json({ error: 'The saved draft could not be discarded. Please try again.' }, { status: 500 });
  }
}
