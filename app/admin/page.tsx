import type { Metadata } from 'next';
import SiteNavigation from '../components/SiteNavigation';
import AdminLogin from '../components/AdminLogin';
import AdminWorkspace from '../components/AdminWorkspace';
import { getClubAdminUser, independentAdminLoginConfigured } from '../admin-auth';
import { getClubNews } from '../../lib/club-news';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Club Administration | St. Mochtas GFC',
  description: 'Private administration area for authorised St. Mochtas GFC website editors.',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getClubAdminUser();
  if (!user) return <main className="archive-page admin-page">
    <SiteNavigation variant="sub" />
    <section className="admin-login-shell shell">
      <div className="admin-login-copy">
        <p className="eyebrow blue">Club administration</p>
        <h1>Manage the club website.</h1>
        <p>This private area is for approved St. Mochtas GFC officers and website administrators. Sign in to update club notices, fixtures, news, photographs, sponsors, committee details and the archive.</p>
      </div>
      <AdminLogin independentEnabled={independentAdminLoginConfigured()} />
    </section>
  </main>;

  const signOutUrl = user.method === 'club'
    ? '/api/admin/auth/logout'
    : '/signout-with-chatgpt?return_to=%2F';
  const latestNews = (await getClubNews()).map(({ title, url, date, source, summary, format, matchLabel }) => ({ title, url, date, source, summary, format, matchLabel }));

  return <main className="archive-page admin-page">
    <SiteNavigation variant="sub" />
    <section className="page-hero admin-hero"><div className="shell"><div><p className="eyebrow">Club administration</p><h1>Welcome back,<br /><em>{user.name ?? user.email.split('@')[0]}.</em></h1><p>Update the club website from one place. Choose a section below, make the change and publish when it is ready.</p></div><div className="admin-hero-actions"><a href="/">View public website</a><a href={signOutUrl}>Sign out</a></div></div></section>
    <div className="shell admin-workspace">
      <AdminWorkspace latestNews={latestNews} />
    </div>
    <section className="admin-handover shell"><div><p className="eyebrow blue">Handover-ready</p><h2>One club system.<br />Individual accounts.</h2></div><ol><li><span>01</span><p><strong>Named access</strong>Each administrator uses their own approved account. Passwords are never shared.</p></li><li><span>02</span><p><strong>Review before publication</strong>Uploads remain private until an authorised administrator approves them.</p></li><li><span>03</span><p><strong>Simple role changes</strong>When officers change, access can be removed or granted without changing the website.</p></li></ol></section>
  </main>;
}
