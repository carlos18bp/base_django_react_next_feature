'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/services/http';
import { useCartStore } from '@/lib/stores/cartStore';
import type { SaleCreatePayload } from '@/lib/types';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload: SaleCreatePayload = {
        email,
        address,
        city,
        state,
        postal_code: postalCode,
        sold_products: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      };

      await api.post('create-sale/', payload);
      clearCart();
      setSuccess(true);
    } catch (err) {
      setError('Could not complete checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-2 text-muted-foreground">Review your cart and add shipping details.</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Cart</h2>

          <div className="mt-6 space-y-4">
            {items.map((item) => {
              const cover = item.gallery_urls?.[0];
              return (
                <div key={item.id} className="border border-border rounded-2xl p-4 flex gap-4">
                  <div className="relative size-24 bg-muted rounded overflow-hidden">
                    {cover ? (
                      <Image src={cover} alt={item.title} fill className="object-cover" sizes="96px" />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">${item.price}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm text-muted-foreground" htmlFor={`qty-${item.id}`}>
                        Qty
                      </label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min={1}
                        className="border border-border rounded px-2 py-1 w-20 bg-card"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                      />
                      <button
                        className="text-sm text-foreground underline"
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-semibold">${item.price * item.quantity}</div>
                </div>
              );
            })}

            {hydrated && !items.length ? <p className="text-muted-foreground">Your cart is empty.</p> : null}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="font-semibold">Subtotal</span>
            <span className="font-semibold">${subtotal}</span>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Shipping</h2>

          <form className="mt-6 space-y-3" onSubmit={onSubmit}>
            <input className="border border-border rounded-xl px-3 py-2 w-full bg-card" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="border border-border rounded-xl px-3 py-2 w-full bg-card" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="border border-border rounded-xl px-3 py-2 w-full bg-card" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <input className="border border-border rounded-xl px-3 py-2 w-full bg-card" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <input className="border border-border rounded-xl px-3 py-2 w-full bg-card" placeholder="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />

            <button
              className="bg-primary text-primary-foreground rounded-full px-5 py-3 w-full disabled:opacity-50 hover:bg-primary/90"
              type="submit"
              disabled={loading || !hydrated || !items.length}
            >
              {loading ? '...' : 'Complete checkout'}
            </button>

            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {success ? <p className="text-success text-sm">Checkout completed.</p> : null}
          </form>
        </section>
      </div>
    </main>
  );
}
