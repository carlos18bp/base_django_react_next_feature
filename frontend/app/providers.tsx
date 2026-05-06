'use client';

import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { useAuthStore } from '@/lib/stores/authStore';
import { getAccessToken } from '@/lib/services/tokens';
import { ThemeProvider } from '@/components/theme-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

function AuthInitializer() {
  const restoreUser = useAuthStore((s) => s.restoreUser);

  useEffect(() => {
    if (getAccessToken()) {
      void restoreUser();
    }
  }, [restoreUser]);

  return null;
}

export default function Providers({ children }: ProvidersProps) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const inner = (
    <>
      <AuthInitializer />
      {children}
    </>
  );

  const withGoogle = googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{inner}</GoogleOAuthProvider>
  ) : (
    inner
  );

  return <ThemeProvider>{withGoogle}</ThemeProvider>;
}
