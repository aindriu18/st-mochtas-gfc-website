'use client';

import { useEffect, useState } from 'react';

type AdminSessionBannerProps = {
  email: string;
  signOutUrl: string;
};

const editTargets: Array<{ match: (location: string) => boolean; href: string; label: string }> = [
  { match: (location) => location === '/#fixtures', href: '/admin?section=fixtures#website-editor', label: 'Edit fixtures' },
  { match: (location) => location === '/#results', href: '/admin?section=results#website-editor', label: 'Edit results' },
  { match: (location) => location === '/#community', href: '/admin?section=notices#website-editor', label: 'Edit club noticeboard' },
  { match: (location) => location === '/#sponsors', href: '/admin?section=sponsors#website-editor', label: 'Edit sponsors' },
  { match: (location) => location === '/#gallery', href: '/admin?section=gallery#website-editor', label: 'Edit photographs' },
  { match: (location) => location === '/', href: '/admin?section=notices#website-editor', label: 'Edit club noticeboard' },
  { match: (location) => location === '/news', href: '/admin?section=updates#website-editor', label: 'Edit club news' },
  { match: (location) => location === '/contact', href: '/admin?section=contact#website-editor', label: 'Edit contact page' },
  { match: (location) => location === '/sponsorship', href: '/admin?section=sponsors#website-editor', label: 'Edit sponsors' },
  { match: (location) => location === '/shop', href: '/admin?section=shops#website-editor', label: 'Edit club shops' },
  { match: (location) => location === '/membership', href: '/admin?section=links#website-editor', label: 'Edit membership link' },
  { match: (location) => location === '/history', href: '/admin?section=history#website-editor', label: 'Edit club history' },
  { match: (location) => location === '/honours', href: '/admin?section=honours#website-editor', label: 'Edit honours' },
  { match: (location) => location === '/#social', href: '/admin?section=links#website-editor', label: 'Edit social accounts' },
  { match: (location) => location === '/archive', href: '/admin#archive-manager', label: 'Manage archive' },
];

export default function AdminSessionBanner({ email, signOutUrl }: AdminSessionBannerProps) {
  const [location, setLocation] = useState('/');

  useEffect(() => {
    const updateLocation = () => setLocation(`${window.location.pathname}${window.location.hash}`);
    updateLocation();
    window.addEventListener('hashchange', updateLocation);
    return () => window.removeEventListener('hashchange', updateLocation);
  }, []);

  const target = editTargets.find((item) => item.match(location));
  const onAdminPage = location.startsWith('/admin');

  return (
    <aside className="admin-session-banner" aria-label="Administrator session">
      <div className="admin-session-inner">
        <div className="admin-session-status">
          <span aria-hidden="true" />
          <strong>Administrator signed in</strong>
          <small>Signed in as {email}</small>
        </div>
        <nav aria-label="Administrator shortcuts">
          {!onAdminPage && target && <a className="admin-context-edit" href={target.href}>{target.label}</a>}
          {!onAdminPage && !target && <a href="/admin#website-editor">Website editor</a>}
          {onAdminPage && <a href="/">View website</a>}
          <a href={signOutUrl}>Sign out</a>
        </nav>
      </div>
    </aside>
  );
}
