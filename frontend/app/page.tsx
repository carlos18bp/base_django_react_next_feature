'use client';

import Image from 'next/image';
import Link from 'next/link';

import BlogCarousel from '@/components/blog/BlogCarousel';
import ProductCarousel from '@/components/product/ProductCarousel';
import { useProductStore } from '@/lib/stores/productStore';
import { useEffect } from 'react';

export default function HomePage() {
  const products = useProductStore((s) => s.products);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    if (products.length === 0) void fetchProducts();
  }, [fetchProducts, products.length]);

  const featured = products.slice(0, 4);

  return (
    <main>
      <section className="border-b border-border bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-muted to-background">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center text-xs font-medium text-foreground bg-card border border-border rounded-full px-3 py-1">
                New arrivals every week
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-4">Everything you need, in one place</h1>
              <p className="mt-4 text-muted-foreground max-w-2xl">
                Browse products, read guides, and checkout in minutes.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="bg-primary text-primary-foreground rounded-full px-5 py-3 hover:bg-primary/90 shadow-sm" href="/catalog">
                  Shop now
                </Link>
                <Link className="border border-border rounded-full px-5 py-3 hover:bg-accent hover:text-accent-foreground shadow-sm" href="/blogs">
                  Read blogs
                </Link>
                <Link className="border border-border rounded-full px-5 py-3 hover:bg-accent hover:text-accent-foreground shadow-sm" href="/checkout">
                  Go to cart
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-card border border-border p-4">
                  <p className="text-xs text-muted-foreground">Shipping</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Fast delivery</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-4">
                  <p className="text-xs text-muted-foreground">Quality</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Curated picks</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-4">
                  <p className="text-xs text-muted-foreground">Support</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Secure checkout</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-muted p-6 shadow-sm">
                <p className="text-xs font-medium text-foreground">Featured</p>
                <p className="mt-2 text-lg font-semibold tracking-tight">Discover this week’s highlights</p>
                <p className="mt-2 text-sm text-muted-foreground">A quick selection of best sellers and fresh drops.</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {(featured.length > 0 ? featured : (Array.from({ length: 4 }) as (typeof featured[0] | null)[])).map((p, idx) => {
                    const cover = p?.gallery_urls?.[0];
                    return (
                      <div key={idx} className="relative aspect-square rounded-2xl bg-muted overflow-hidden">
                        {cover && (
                          <Image
                            src={cover}
                            alt={p?.title ?? ''}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 50vw, 20vw"
                          />
                        )}
                      </div>
                    );
                  })}
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
