'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import ProductCard from '@/components/product/ProductCard';
import { useProductStore } from '@/lib/stores/productStore';

export default function ProductCarousel() {
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const items = products.slice(0, 8);

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500">Picked for you</p>
          <h2 className="text-2xl font-semibold tracking-tight mt-1">Trending products</h2>
        </div>
        <Link href="/catalog" className="text-sm text-gray-700 hover:underline">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="w-full aspect-square bg-gray-100 animate-pulse" />
              <div className="p-4">
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="mt-2 h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                <div className="mt-4 h-4 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 border border-gray-200 rounded-2xl bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Products unavailable</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-black text-white px-5 py-2.5 hover:bg-gray-900"
            onClick={() => void fetchProducts()}
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 border border-gray-200 rounded-2xl bg-white p-5">
          <p className="text-sm font-medium text-gray-900">No products yet</p>
          <p className="text-sm text-gray-600 mt-1">Add products in the admin/backoffice and they’ll show up here.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
