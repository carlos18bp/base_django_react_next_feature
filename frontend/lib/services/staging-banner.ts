import { api } from '@/lib/services/http';

export type StagingPhase = 'design' | 'development';

export type StagingBannerState = {
  is_visible: boolean;
  current_phase: StagingPhase;
  phase_labels: { es: string; en: string };
  started_at: string | null;
  expires_at: string | null;
  days_remaining: number | null;
  is_expired: boolean;
  contact_whatsapp: string;
  contact_email: string;
};

export async function fetchStagingBannerState(): Promise<StagingBannerState> {
  const response = await api.get<StagingBannerState>('staging-banner/');
  return response.data;
}
