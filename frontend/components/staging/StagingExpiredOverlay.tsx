'use client';

import { useLocaleStore } from '@/lib/stores/localeStore';
import type { StagingBannerState } from '@/lib/services/staging-banner';

const COPY = {
  es: {
    title: 'La etapa de {{phase}} ha finalizado',
    body: 'Gracias por revisar el avance del proyecto. El plazo de revisión ha terminado.',
    cta: 'Para continuar con la siguiente fase o coordinar ajustes, por favor contacta al equipo de ProjectApp:',
    whatsappLabel: 'WhatsApp',
    emailLabel: 'Email',
  },
  en: {
    title: 'The {{phase}} has ended',
    body: 'Thank you for reviewing the project. The review window has closed.',
    cta: 'To continue with the next phase or coordinate adjustments, please contact the ProjectApp team:',
    whatsappLabel: 'WhatsApp',
    emailLabel: 'Email',
  },
} as const;

function whatsappLink(phone: string): string {
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
}

type Props = {
  state: StagingBannerState;
};

export default function StagingExpiredOverlay({ state }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const copy = COPY[locale];
  const phaseLabel = state.phase_labels[locale].toLowerCase();
  const title = copy.title.replace('{{phase}}', phaseLabel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="staging-expired-overlay"
      className="fixed inset-0 z-[100] bg-background text-foreground overflow-auto"
    >
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full text-center space-y-6">
          <div className="text-5xl" aria-hidden>⏳</div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-lg text-muted-foreground">{copy.body}</p>
          <p className="text-base text-muted-foreground">{copy.cta}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href={whatsappLink(state.contact_whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="staging-expired-whatsapp"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-success text-success-foreground font-semibold hover:bg-success/90 transition-colors"
            >
              <span aria-hidden>📱</span>
              <span>{copy.whatsappLabel}: {state.contact_whatsapp}</span>
            </a>
            <a
              href={`mailto:${state.contact_email}`}
              data-testid="staging-expired-email"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-info text-info-foreground font-semibold hover:bg-info/90 transition-colors"
            >
              <span aria-hidden>✉️</span>
              <span>{copy.emailLabel}: {state.contact_email}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
