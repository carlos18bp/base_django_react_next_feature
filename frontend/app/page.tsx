'use client';

import Link from 'next/link';

import BlogCarousel from '@/components/blog/BlogCarousel';
import ProductCarousel from '@/components/product/ProductCarousel';

export default function HomePage() {
  return (
    <main>
      <section className="border-b bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full px-3 py-1">
                New arrivals every week
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-4">Everything you need, in one place</h1>
              <p className="mt-4 text-gray-600 max-w-2xl">
                Browse products, read guides, and checkout in minutes.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="bg-black text-white rounded-full px-5 py-3 hover:bg-gray-900 shadow-sm" href="/catalog">
                  Shop now
                </Link>
                <Link className="border border-gray-300 rounded-full px-5 py-3 hover:bg-white shadow-sm" href="/blogs">
                  Read blogs
                </Link>
                <Link className="border border-gray-300 rounded-full px-5 py-3 hover:bg-white shadow-sm" href="/checkout">
                  Go to cart
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Shipping</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">Fast delivery</p>
                </div>
                <div className="rounded-2xl bg-white border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Quality</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">Curated picks</p>
                </div>
                <div className="rounded-2xl bg-white border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Support</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">Secure checkout</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
                <p className="text-xs font-medium text-gray-700">Featured</p>
                <p className="mt-2 text-lg font-semibold tracking-tight">Discover this week’s highlights</p>
                <p className="mt-2 text-sm text-gray-600">A quick selection of best sellers and fresh drops.</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="aspect-square rounded-2xl bg-gray-100" />
                  <div className="aspect-square rounded-2xl bg-gray-100" />
                  <div className="aspect-square rounded-2xl bg-gray-100" />
                  <div className="aspect-square rounded-2xl bg-gray-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductCarousel />
      <BlogCarousel />
    </main>
  );
}
