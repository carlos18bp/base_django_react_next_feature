'use client';

/**
 * ThemeToggle — three-state theme switcher (Light / Dark / System).
 *
 * Uses `useTheme()` from next-themes. Renders a placeholder on first
 * paint to avoid hydration mismatch (the server cannot know the user's
 * stored preference). Implements WAI-ARIA menu keyboard contract:
 * ArrowUp/Down navigate, Home/End jump to ends, Escape closes.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) itemsRef.current[0]?.focus();
  }, [open]);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  const Current = OPTIONS.find((o) => o.value === theme)?.Icon ?? Monitor;

  function focusItem(index: number) {
    const items = itemsRef.current.filter(Boolean) as HTMLButtonElement[];
    const len = items.length;
    if (!len) return;
    const next = ((index % len) + len) % len;
    items[next]?.focus();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = itemsRef.current.filter(Boolean) as HTMLButtonElement[];
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(current + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusItem(items.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleButtonKeyDown}
        aria-label="Toggle theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
      >
        <Current className="h-5 w-5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            aria-label="Theme"
            onKeyDown={handleMenuKeyDown}
            className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
          >
            {OPTIONS.map(({ value, label, Icon }, i) => (
              <button
                key={value}
                ref={(el) => {
                  itemsRef.current[i] = el;
                }}
                role="menuitemradio"
                aria-checked={theme === value}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none ${
                  theme === value ? 'text-primary font-medium' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
