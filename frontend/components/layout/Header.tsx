'use client';

import Link from 'next/link';

import { useAuthStore } from '@/lib/stores/authStore';
import { useCartStore } from '@/lib/stores/cartStore';

export default function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const cartCount = useCartStore((s) => s.items.reduce((acc, item) => acc + item.quantity, 0));

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link className="font-semibold tracking-tight" href="/">
          Shop
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4 text-sm">
          <Link className="px-2 py-1 rounded hover:bg-gray-100" href="/catalog">
            Catalog
          </Link>
          <Link className="px-2 py-1 rounded hover:bg-gray-100" href="/blogs">
            Blogs
          </Link>

          <Link className="px-2 py-1 rounded hover:bg-gray-100" href="/checkout">
            <span className="inline-flex items-center gap-2">
              Cart
              <span className="min-w-6 h-6 px-2 rounded-full bg-black text-white text-xs inline-flex items-center justify-center">
                {cartCount}
              </span>
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link className="px-2 py-1 rounded hover:bg-gray-100" href="/dashboard">
                Account
              </Link>
              <button
                className="border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50"
                onClick={signOut}
                type="button"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50" href="/sign-in">
                Sign in
              </Link>
              <Link className="bg-black text-white rounded-full px-4 py-2 hover:bg-gray-900" href="/sign-up">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
