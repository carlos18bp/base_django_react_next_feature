'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import type { ManualLocale, ManualSection } from '@/lib/manual/types';

type Props = {
  sections: ManualSection[];
  locale: ManualLocale;
};

const SIDEBAR_TITLE = { es: 'Índice', en: 'Index' };

export default function ManualSidebar({ sections, locale }: Props) {
  const label = SIDEBAR_TITLE[locale];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const nav = (
    <nav aria-label={label} className="flex flex-col gap-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const isCollapsed = collapsed[section.id] ?? false;
        return (
          <div key={section.id} className="flex flex-col">
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              aria-expanded={!isCollapsed}
              aria-controls={`manual-section-${section.id}`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{section.title[locale]}</span>
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
              />
            </button>
            {!isCollapsed && (
              <ul
                id={`manual-section-${section.id}`}
                className="mt-1 flex flex-col gap-0.5 pl-6"
              >
                {section.processes.map((process) => (
                  <li key={process.id}>
                    <a
                      href={`#${process.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md border-l-2 border-transparent px-2 py-1.5 text-sm text-gray-600 transition-colors hover:border-gray-900 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {process.title[locale]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900"
          aria-expanded={mobileOpen}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          {label}
        </button>
        {mobileOpen && (
          <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
            {nav}
          </div>
        )}
      </div>

      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </h2>
          {nav}
        </div>
      </aside>
    </>
  );
}
