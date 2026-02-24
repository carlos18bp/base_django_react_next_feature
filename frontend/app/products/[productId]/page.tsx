'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import type { Product } from '@/lib/types';
import { useCartStore } from '@/lib/stores/cartStore';
import { useProductStore } from '@/lib/stores/productStore';

export default function ProductDetailPage() {
  const fetchProduct = useProductStore((s) => s.fetchProduct);
  const addToCart = useCartStore((s) => s.addToCart);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams<{ productId: string | string[] }>();
  const productIdParam = params?.productId;
  const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;

  useEffect(() => {
    const id = Number(productId);
    if (!Number.isFinite(id)) {
      setLoading(false);
      return;
    }
    void (async () => {
      const data = await fetchProduct(id);
      setProduct(data);
      setLoading(false);
    })();
  }, [fetchProduct, productId]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-gray-600">Product not found.</p>
        <Link href="/catalog" className="mt-4 inline-block text-sm text-gray-900 hover:underline">
          Back to catalog
        </Link>
      </main>
    );
  }

  const gallery = product.gallery_urls || [];

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <div className="grid grid-cols-2 gap-4">
            {gallery.length ? (
              gallery.slice(0, 4).map((url) => (
                <div key={url} className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                  <Image src={url} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              ))
            ) : (
              <div className="w-full aspect-square bg-gray-100 rounded-2xl" />
            )}
          </div>
        </section>

        <aside className="bg-white border border-gray-200 rounded-2xl p-6 h-fit">
          <p className="text-sm text-gray-500">{product.category || 'Product'}</p>
          <h1 className="text-3xl font-bold mt-2 tracking-tight">{product.title}</h1>
          <p className="mt-3 text-2xl font-semibold">${product.price}</p>

          {product.description ? (
            <p className="mt-6 text-gray-700 whitespace-pre-line leading-relaxed">{product.description}</p>
          ) : null}

          <button
            className="mt-8 bg-black text-white rounded-full px-5 py-3 w-full hover:bg-gray-900"
            type="button"
            onClick={() => addToCart(product, 1)}
          >
            Add to cart
          </button>

          <p className="mt-3 text-xs text-gray-500">Secure checkout. Fast delivery.</p>
        </aside>
      </div>
    </main>
  );
}
