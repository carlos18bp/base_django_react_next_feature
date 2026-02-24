'use client';

import Link from 'next/link';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';

export default function DashboardPage() {
  const { isAuthenticated } = useRequireAuth();
  const signOut = useAuthStore((s) => s.signOut);

  if (!isAuthenticated) return null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Protected route (JWT required).</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="border border-black rounded px-3 py-2" href="/backoffice">
          Backoffice
        </Link>
        <button className="bg-black text-white rounded px-3 py-2" type="button" onClick={signOut}>
          Sign out
        </button>
      </div>
    </main>
  );
}
