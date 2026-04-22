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
      className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6"
    >
      <header>
        <h3 className="text-lg font-semibold text-gray-900">{process.title[locale]}</h3>
        <p className="mt-1 text-sm text-gray-600">{process.summary[locale]}</p>
      </header>

      <section className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {LABELS.why[locale]}
        </h4>
        <p className="mt-1 text-sm text-gray-600">{process.why[locale]}</p>
      </section>

      <section className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {LABELS.steps[locale]}
        </h4>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-gray-600 marker:text-gray-900">
          {process.steps[locale].map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      {process.route && (
        <section className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {LABELS.route[locale]}
          </h4>
          <code className="mt-1 inline-block rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-900">
            {process.route}
          </code>
        </section>
      )}

      {process.tips && process.tips[locale].length > 0 && (
        <section className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {LABELS.tips[locale]}
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
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
