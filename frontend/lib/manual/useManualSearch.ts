'use client';

import { useDeferredValue, useMemo } from 'react';
import Fuse from 'fuse.js';

import { MANUAL_SECTIONS } from './content';
import type { ManualLocale, ManualProcess, ManualSearchHit, ManualSection } from './types';

type IndexedProcess = {
  id: string;
  sectionId: string;
  title: string;
  summary: string;
  keywords: string[];
  steps: string;
  route: string;
  _process: ManualProcess;
  _section: ManualSection;
};

const MAX_RESULTS = 12;

const buildIndex = (
  locale: ManualLocale,
  sections: ManualSection[],
): IndexedProcess[] => {
  const rows: IndexedProcess[] = [];
  for (const section of sections) {
    for (const process of section.processes) {
      rows.push({
        id: process.id,
        sectionId: section.id,
        title: process.title[locale],
        summary: process.summary[locale],
        keywords: process.keywords,
        steps: process.steps[locale].join(' '),
        route: process.route ?? '',
        _process: process,
        _section: section,
      });
    }
  }
  return rows;
};

const FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'keywords', weight: 0.25 },
    { name: 'summary', weight: 0.15 },
    { name: 'steps', weight: 0.07 },
    { name: 'route', weight: 0.03 },
  ],
};

export function useManualSearch(
  query: string,
  locale: ManualLocale,
  sections: ManualSection[] = MANUAL_SECTIONS,
) {
  const deferredQuery = useDeferredValue(query.trim());

  const fuse = useMemo(
    () => new Fuse(buildIndex(locale, sections), FUSE_OPTIONS),
    [locale, sections],
  );

  const results = useMemo<ManualSearchHit[]>(() => {
    if (!deferredQuery) return [];
    return fuse.search(deferredQuery, { limit: MAX_RESULTS }).map((m) => ({
      process: m.item._process,
      section: m.item._section,
      score: m.score ?? 0,
    }));
  }, [fuse, deferredQuery]);

  return {
    results,
    isSearching: deferredQuery.length > 0,
    activeQuery: deferredQuery,
  };
}
