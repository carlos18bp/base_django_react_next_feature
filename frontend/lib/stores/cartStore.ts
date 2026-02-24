'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CartItem, Product } from '@/lib/types';

type CartState = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  updateQuantity: (productId: number, quantity: number) => void;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: product.id,
                title: product.title,
                price: product.price,
                quantity,
                gallery_urls: product.gallery_urls,
              },
            ],
          };
        });
      },
      removeFromCart: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) }));
      },
      clearCart: () => set({ items: [] }),
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items
            .map((i) => (i.id === productId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        }));
      },
      subtotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
