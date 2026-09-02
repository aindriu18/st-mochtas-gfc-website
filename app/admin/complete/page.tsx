import type { Metadata } from 'next';
import AdminLoginComplete from '../../components/AdminLoginComplete';

export const metadata: Metadata = { title: 'Completing sign in | St. Mochtas GFC', robots: { index: false, follow: false } };

export default function AdminCompletePage() {
  return <main className="admin-complete-page"><AdminLoginComplete /></main>;
}
