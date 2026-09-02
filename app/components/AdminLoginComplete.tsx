'use client';

import { useEffect, useState } from 'react';

export default function AdminLoginComplete() {
  const [message, setMessage] = useState('Checking your secure sign-in link…');
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = hashParams.get('access_token');
    const providerError = hashParams.get('error_description') ?? queryParams.get('error_description');
    window.history.replaceState({}, document.title, window.location.pathname);
    if (providerError) {
      setMessage('Supabase could not accept this sign-in link. It may have expired or already been used. Return to the admin page and request one new link.');
      return;
    }
    if (!accessToken) {
      setMessage('No secure sign-in token reached the website. Open the newest email link in the same browser, or return to the admin page and request one new link.');
      return;
    }
    void fetch('/api/admin/auth/exchange', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ accessToken }),
    }).then(async (response) => {
      if (!response.ok) {
        const data = await response.json() as { error?: string; reference?: string };
        setMessage(`${data.error ?? 'The sign-in link could not be verified.'}${data.reference ? ` Reference: ${data.reference}.` : ''}`);
        return;
      }
      const status = await fetch('/api/admin/auth/status', { cache: 'no-store', credentials: 'same-origin' });
      if (!status.ok) {
        setMessage('Your email was verified, but this browser did not save the administrator session. Allow cookies for this site and try again.');
        return;
      }
      window.location.replace('/admin?login=success');
    }).catch(() => setMessage('The sign-in service could not be reached. Check your connection and try the link again.'));
  }, []);
  return <section className="admin-login-panel admin-complete-panel"><span className="admin-login-lock" aria-hidden="true">●</span><p className="eyebrow blue">Club administration</p><h1>Signing you in.</h1><p role="status">{message}</p><a href="/admin">Return to club administration</a></section>;
}
