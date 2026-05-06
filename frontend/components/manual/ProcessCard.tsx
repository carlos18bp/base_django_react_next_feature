'use client';

import type { ManualLocale, ManualProcess } from '@/lib/manual/types';

type Props = {
  process: ManualProcess;
  locale: ManualLocale;
};

const LABELS = {
  why: { es: '¿Por qué importa?', en: 'Why it matters' },
  steps: { es: '¿Cómo funciona?', en: 'How it works' },
  route: { es: 'Dónde encontrarlo', en: 'Where to find it' },
  tips: { es: 'Tips útiles', en: 'Tips' },
};

export default function ProcessCard({ process, locale }: Props) {
  return (
    <article
      id={process.id}
      className="scroll-mt-24 rounded-2xl border border-border bg-card p-6"
    >
      <header>
        <h3 className="text-lg font-semibold text-foreground">{process.title[locale]}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{process.summary[locale]}</p>
      </header>

      <section className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {LABELS.why[locale]}
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">{process.why[locale]}</p>
      </section>

      <section className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {LABELS.steps[locale]}
        </h4>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground marker:text-foreground">
          {process.steps[locale].map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      {process.route && (
        <section className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {LABELS.route[locale]}
          </h4>
          <code className="mt-1 inline-block rounded-md bg-muted px-2 py-1 text-xs text-foreground">
            {process.route}
          </code>
        </section>
      )}

      {process.tips && process.tips[locale].length > 0 && (
        <section className="mt-4 rounded-xl border border-border bg-muted p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {LABELS.tips[locale]}
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {process.tips[locale].map((tip, idx) => (
              <li key={idx} className="flex gap-2">
                <span aria-hidden="true">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
