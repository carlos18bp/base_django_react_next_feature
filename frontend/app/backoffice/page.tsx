'use client';

import { useEffect, useState } from 'react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { api } from '@/lib/services/http';
import type { SaleListItem, UserListItem } from '@/lib/types';

export default function BackofficePage() {
  const { isAuthenticated } = useRequireAuth();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [sales, setSales] = useState<SaleListItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    void (async () => {
      setLoading(true);
      setError('');
      try {
        const [usersRes, salesRes] = await Promise.all([api.get('users/'), api.get('sales/')]);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
      } catch (e) {
        setError('Could not load backoffice data. Make sure you are signed in with a staff user.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Backoffice</h1>
      <p className="mt-2 text-gray-600">Protected view. Users and Sales require staff permissions.</p>

      {loading ? <p className="mt-4 text-gray-600">Loading...</p> : null}
      {error ? <p className="mt-4 text-red-600">{error}</p> : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="mt-4 overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Staff</th>
                <th className="text-left px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role || '-'}</td>
                  <td className="px-4 py-3">{u.is_staff ? 'yes' : 'no'}</td>
                  <td className="px-4 py-3">{u.is_active ? 'yes' : 'no'}</td>
                </tr>
              ))}
              {!users.length ? (
                <tr className="border-t">
                  <td className="px-4 py-3" colSpan={4}>
                    No data
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Sales</h2>
        <div className="mt-4 overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Id</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">City</th>
                <th className="text-left px-4 py-3">State</th>
                <th className="text-left px-4 py-3">Postal</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.city}</td>
                  <td className="px-4 py-3">{s.state}</td>
                  <td className="px-4 py-3">{s.postal_code}</td>
                </tr>
              ))}
              {!sales.length ? (
                <tr className="border-t">
                  <td className="px-4 py-3" colSpan={5}>
                    No data
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
