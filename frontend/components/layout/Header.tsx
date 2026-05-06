'use client';

import Link from 'next/link';

import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const cartCount = useCartStore((s) => s.items.reduce((acc, item) => acc + item.quantity, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link className="font-semibold tracking-tight" href="/">
          Shop
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4 text-sm">
          <Link className="px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/catalog">
            Catalog
          </Link>
          <Link className="px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/blogs">
            Blogs
          </Link>
          <Link className="px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={ROUTES.MANUAL}>
            Manual
          </Link>

          <Link className="px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/checkout">
            <span className="inline-flex items-center gap-2">
              Cart
              <span className="min-w-6 h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs inline-flex items-center justify-center">
                {cartCount}
              </span>
            </span>
          </Link>

          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Link className="px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/dashboard">
                Account
              </Link>
              <button
                className="border border-border rounded-full px-4 py-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={signOut}
                type="button"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="border border-border rounded-full px-4 py-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/sign-in">
                Sign in
              </Link>
              <Link className="bg-primary text-primary-foreground rounded-full px-4 py-2 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/sign-up">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
