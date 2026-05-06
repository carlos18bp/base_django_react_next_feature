'use client';

import { create } from 'zustand';

import { fetchStagingBannerState, type StagingBannerState } from '@/lib/services/staging-banner';

type StagingBannerStore = {
  state: StagingBannerState | null;
  isLoading: boolean;
  hasFetched: boolean;
  fetch: () => Promise<void>;
};

function isSameState(a: StagingBannerState | null, b: StagingBannerState | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.is_visible === b.is_visible &&
    a.current_phase === b.current_phase &&
    a.started_at === b.started_at &&
    a.expires_at === b.expires_at &&
    a.days_remaining === b.days_remaining &&
    a.is_expired === b.is_expired &&
    a.contact_whatsapp === b.contact_whatsapp &&
    a.contact_email === b.contact_email
  );
}

export const useStagingBannerStore = create<StagingBannerStore>((set, get) => ({
  state: null,
  isLoading: false,
  hasFetched: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const fresh = await fetchStagingBannerState();
      const current = get().state;
      // Skip the state mutation if nothing changed — otherwise every consumer
      // (Header, page, footer) would re-render on every 60s polling tick.
      if (isSameState(current, fresh)) {
        set({ isLoading: false, hasFetched: true });
      } else {
        set({ state: fresh, isLoading: false, hasFetched: true });
      }
    } catch {
      set({ isLoading: false, hasFetched: true });
    }
  },
}));
