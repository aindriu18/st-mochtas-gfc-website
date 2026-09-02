'use client';

import { useEffect } from 'react';

export default function AdminAuthRedirectGuard() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const isSupabaseCallback = params.has('access_token') || params.has('error_description');
    if (isSupabaseCallback && window.location.pathname !== '/admin/complete') {
      window.location.replace(`/admin/complete${window.location.hash}`);
    }
  }, []);

  return null;
}
