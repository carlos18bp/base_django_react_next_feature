'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const cover = product.gallery_urls?.[0];

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : null}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500">{product.category || 'Product'}</p>
        <h3 className="font-semibold mt-1 leading-tight">{product.title}</h3>
        <p className="mt-2 font-semibold">${product.price}</p>
      </div>
    </Link>
  );
}
