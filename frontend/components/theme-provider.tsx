'use client';

/**
 * ThemeProvider — wraps next-themes provider with project defaults.
 *
 * - `attribute="class"` writes/removes the `dark` class on <html>, which
 *   our `@custom-variant dark` in globals.css listens for.
 * - `defaultTheme="system"` follows OS preference until the user picks one.
 * - `disableTransitionOnChange` avoids flashes when toggling themes.
 */
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
