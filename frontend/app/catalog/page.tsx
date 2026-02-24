'use client';

import { useEffect } from 'react';

import ProductCard from '@/components/product/ProductCard';
import { useProductStore } from '@/lib/stores/productStore';

export default function CatalogPage() {
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalog</h1>
          <p className="mt-2 text-gray-600">Explore products curated for your next purchase.</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
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
        <div className="mt-8 border border-gray-200 rounded-2xl bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Catalog unavailable</p>
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
      ) : null}

      {!loading && !error && !products.length ? (
        <div className="mt-10 border border-dashed rounded-2xl p-10 bg-white">
          <p className="text-gray-700 font-semibold">No products yet</p>
          <p className="text-gray-600 mt-1">Create some fake data from the backend or add products in admin.</p>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
