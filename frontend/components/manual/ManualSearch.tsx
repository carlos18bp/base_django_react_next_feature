'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import { useManualSearch } from '@/lib/manual/useManualSearch';
import type { ManualLocale, ManualSection } from '@/lib/manual/types';

type Props = {
  locale: ManualLocale;
  sections?: ManualSection[];
};

const HIGHLIGHT_MS = 1600;
const HIGHLIGHT_CLASSES = [
  'ring-2',
  'ring-gray-900',
  'ring-offset-2',
  'ring-offset-white',
];

const LABELS = {
  placeholder: { es: 'Buscar en el manual…', en: 'Search the manual…' },
  clear: { es: 'Limpiar', en: 'Clear' },
  noResults: { es: 'Sin resultados', en: 'No results' },
};

export default function ManualSearch({ locale, sections }: Props) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const highlightedElRef = useRef<HTMLElement | null>(null);
  const { results, isSearching } = useManualSearch(query, locale, sections);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      highlightedElRef.current?.classList.remove(...HIGHLIGHT_CLASSES);
    };
  }, []);

  const scrollToProcess = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }
    highlightedElRef.current?.classList.remove(...HIGHLIGHT_CLASSES);

    el.classList.add(...HIGHLIGHT_CLASSES);
    highlightedElRef.current = el;
    highlightTimerRef.current = window.setTimeout(() => {
      el.classList.remove(...HIGHLIGHT_CLASSES);
      if (highlightedElRef.current === el) highlightedElRef.current = null;
      highlightTimerRef.current = null;
    }, HIGHLIGHT_MS);
  };

  const handleSelect = (id: string) => {
    setQuery('');
    scrollToProcess(id);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearching) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && results[highlighted]) {
      e.preventDefault();
      handleSelect(results[highlighted].process.id);
    } else if (e.key === 'Escape') {
      setQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/10">
        <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label={LABELS.placeholder[locale]}
          placeholder={LABELS.placeholder[locale]}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label={LABELS.clear[locale]}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
          ⌘K
        </kbd>
      </label>

      {isSearching && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-xl"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              {LABELS.noResults[locale]}
            </p>
          ) : (
            <ul className="flex flex-col">
              {results.map((hit, idx) => (
                <li key={hit.process.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={idx === highlighted}
                    onMouseEnter={() => setHighlighted(idx)}
                    onClick={() => handleSelect(hit.process.id)}
                    className={`flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left transition-colors ${
                      idx === highlighted ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {hit.process.title[locale]}
                    </span>
                    <span className="text-xs text-gray-600 line-clamp-2">
                      {hit.process.summary[locale]}
                    </span>
                    {hit.process.route && (
                      <code className="inline-block w-fit rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                        {hit.process.route}
                      </code>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
