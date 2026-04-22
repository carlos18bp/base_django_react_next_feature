'use client';

import { MANUAL_SECTIONS } from '@/lib/manual/content';
import type { ManualLocale } from '@/lib/manual/types';
import { useLocaleStore } from '@/lib/stores/localeStore';
import ManualSidebar from '@/components/manual/ManualSidebar';
import ManualSearch from '@/components/manual/ManualSearch';
import ProcessCard from '@/components/manual/ProcessCard';

const LABELS = {
  eyebrow: { es: 'Manual paso a paso', en: 'Step-by-step guide' },
  title: { es: 'Manual interactivo', en: 'Interactive manual' },
  subtitle: {
    es: 'Recorre los flujos principales.',
    en: 'Walk through the main flows.',
  },
};

export default function ManualPage() {
  const locale: ManualLocale =
    useLocaleStore((s) => s.locale) === 'es' ? 'es' : 'en';

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <ManualSidebar sections={MANUAL_SECTIONS} locale={locale} />

      <div className="min-w-0 flex-1">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {LABELS.eyebrow[locale]}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {LABELS.title[locale]}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            {LABELS.subtitle[locale]}
          </p>
        </header>

        <div className="sticky top-20 z-30 mb-8">
          <ManualSearch sections={MANUAL_SECTIONS} locale={locale} />
        </div>

        <div className="flex flex-col gap-10">
          {MANUAL_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-24"
              >
                <header className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {section.title[locale]}
                  </h2>
                </header>

                <div className="flex flex-col gap-4">
                  {section.processes.map((process) => (
                    <ProcessCard key={process.id} process={process} locale={locale} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
