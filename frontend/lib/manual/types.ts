import type { LucideIcon } from 'lucide-react';

export type ManualLocale = 'es' | 'en';

export type LocalizedText = { es: string; en: string };
export type LocalizedList = { es: string[]; en: string[] };

export type ManualProcess = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  why: LocalizedText;
  steps: LocalizedList;
  route?: string;
  tips?: LocalizedList;
  keywords: string[];
};

export type ManualSection = {
  id: string;
  title: LocalizedText;
  icon: LucideIcon;
  processes: ManualProcess[];
};

export type ManualSearchHit = {
  process: ManualProcess;
  section: ManualSection;
  score: number;
};
