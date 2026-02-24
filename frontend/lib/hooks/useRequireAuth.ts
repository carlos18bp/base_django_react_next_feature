'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/lib/stores/authStore';

export const useRequireAuth = () => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const syncFromCookies = useAuthStore((s) => s.syncFromCookies);

  useEffect(() => {
    syncFromCookies();
  }, [syncFromCookies]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
};
