'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ROUTES } from '@/lib/constants';
import { setTokens } from '@/lib/services/tokens';
import { useAuthStore } from '@/lib/stores/authStore';

function safeRedirectTarget(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return ROUTES.HOME;
  }
  return value;
}

function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const access = params.get('access');
    const refresh = params.get('refresh');

    if (!access || !refresh) {
      router.replace(ROUTES.SIGN_IN);
      return;
    }

    const redirect = safeRedirectTarget(params.get('redirect'));

    const completeLogin = async () => {
      setTokens({ access, refresh });
      await useAuthStore.getState().restoreUser();
      router.replace(redirect);
    };

    void completeLogin();
  }, [params, router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-gray-600">
      Signing in...
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <AdminLoginInner />
    </Suspense>
  );
}
