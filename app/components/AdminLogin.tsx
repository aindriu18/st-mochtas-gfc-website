'use client';

import { useState, type FormEvent } from 'react';

export default function AdminLogin({ independentEnabled }: { independentEnabled: boolean }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email }),
      });
      const data = await response.json() as { error?: string; reference?: string };
      if (!response.ok) {
        setMessage(`${data.error ?? 'The sign-in email could not be sent.'}${data.reference ? ` Reference: ${data.reference}.` : ''}`);
        return;
      }
      setMessage('Email sent. Open the newest St. Mochtas sign-in email in this same browser. The link is valid for one hour and can only be used once.');
    } catch {
      setMessage('The club login service could not be reached. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!independentEnabled) {
    return <div className="admin-login-panel">
      <span className="admin-login-lock" aria-hidden="true">●</span>
      <h2>Club login is being prepared.</h2>
      <p>The independent email-code service still needs to be connected. Until then, the existing secure sign-in remains available.</p>
      <a className="button button-blue" href="/signin-with-chatgpt?return_to=%2Fadmin">Temporary administrator sign-in <span>→</span></a>
    </div>;
  }

  return <div className="admin-login-panel">
    <span className="admin-login-lock" aria-hidden="true">●</span>
    <p className="eyebrow blue">Club administration</p>
    <h2>Sign in securely.</h2>
    <form onSubmit={requestCode}>
      <label htmlFor="admin-email">Approved administrator email</label>
      <input id="admin-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <button className="button button-yellow" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link'} <span>→</span></button>
    </form>
    {message && <p className="admin-login-message" role="status" aria-live="polite">{message}</p>}
    <small>Only addresses approved by St. Mochtas GFC can access this area.</small>
  </div>;
}
