'use client';

import { useLocaleStore } from '@/lib/stores/localeStore';
import type { StagingBannerState } from '@/lib/services/staging-banner';

const COPY = {
  es: {
    daysRemainingOne: 'queda',
    daysRemainingMany: 'quedan',
    dayOne: 'día',
    dayMany: 'días',
    forReview: 'para tu revisión',
  },
  en: {
    daysRemainingOne: 'remains',
    daysRemainingMany: 'remain',
    dayOne: 'day',
    dayMany: 'days',
    forReview: 'for your review',
  },
} as const;

const PHASE_ICONS: Record<StagingBannerState['current_phase'], string> = {
  design: '🎨',
  development: '🛠️',
};

type Props = {
  state: StagingBannerState;
};

export default function StagingPhaseBanner({ state }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const copy = COPY[locale];
  const days = state.days_remaining ?? 0;
  const isUrgent = days <= 2;
  const phaseLabel = state.phase_labels[locale];
  const verb = days === 1 ? copy.daysRemainingOne : copy.daysRemainingMany;
  const noun = days === 1 ? copy.dayOne : copy.dayMany;

  return (
    <div
      role="status"
      data-testid="staging-phase-banner"
      className={
        'sticky top-0 z-50 w-full border-b text-sm font-medium ' +
        (isUrgent
          ? 'bg-warning text-warning-foreground border-warning/40'
          : 'bg-info text-info-foreground border-info/40')
      }
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
        <span aria-hidden>{PHASE_ICONS[state.current_phase]}</span>
        <span>
          <strong>{phaseLabel}</strong> — {verb} <strong>{days} {noun}</strong> {copy.forReview}
        </span>
      </div>
    </div>
  );
}
