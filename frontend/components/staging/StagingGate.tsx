'use client';

import { useEffect } from 'react';

import { useStagingBannerStore } from '@/lib/stores/stagingBannerStore';
import StagingPhaseBanner from './StagingPhaseBanner';
import StagingExpiredOverlay from './StagingExpiredOverlay';

const POLL_INTERVAL_MS = 60_000;

type Props = {
  children: React.ReactNode;
};

export default function StagingGate({ children }: Props) {
  const state = useStagingBannerStore((s) => s.state);
  const hasFetched = useStagingBannerStore((s) => s.hasFetched);
  const fetchState = useStagingBannerStore((s) => s.fetch);

  useEffect(() => {
    void fetchState();
    const interval = setInterval(() => {
      void fetchState();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchState]);

  if (!hasFetched || !state || !state.is_visible || !state.started_at) {
    return <>{children}</>;
  }

  if (state.is_expired) {
    return <StagingExpiredOverlay state={state} />;
  }

  return (
    <>
      <StagingPhaseBanner state={state} />
      {children}
    </>
  );
}
