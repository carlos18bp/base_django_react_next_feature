'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_LOCALE, isValidLocale, type SupportedLocale } from '@/lib/i18n/config';

type LocaleState = {
  locale: SupportedLocale;
  setLocale: (locale: string) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => {
        if (isValidLocale(locale)) {
          set({ locale });
        }
      },
    }),
    {
      name: 'locale',
    }
  )
);
