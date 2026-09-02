import type { Metadata } from 'next';
import './globals.css';
import SiteFooter from './components/SiteFooter';
import AdminAuthRedirectGuard from './components/AdminAuthRedirectGuard';
import AdminSessionBanner from './components/AdminSessionBanner';
import { getClubAdminUser } from './admin-auth';

const siteUrl = 'https://st-mochtas-gfc-louth.lively-teal-9910.chatgpt.site';
const description = 'The home of St. Mochtas GFC, with fixtures, club news and community updates from Louth Village.';

export const metadata: Metadata = {
  title: 'St. Mochtas GFC | Louth Village',
  description,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'St. Mochtas GFC | Louth Village',
    description,
    url: siteUrl,
    siteName: 'St. Mochtas GFC',
    type: 'website',
    images: [{
      url: `${siteUrl}/og.png`,
      width: 1730,
      height: 909,
      alt: 'St. Mochtas GFC, Louth Village, blue and yellow since 1934',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'St. Mochtas GFC | Louth Village',
    description,
    images: [`${siteUrl}/og.png`],
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getClubAdminUser();
  const signOutUrl = admin?.method === 'club'
    ? '/api/admin/auth/logout'
    : '/signout-with-chatgpt?return_to=%2F';

  return (
    <html lang="en">
      <body>
        <AdminAuthRedirectGuard />
        {admin && <AdminSessionBanner email={admin.email} signOutUrl={signOutUrl} />}
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
