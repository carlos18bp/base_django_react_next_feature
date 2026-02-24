'use client';

import { create } from 'zustand';

import type { Product } from '@/lib/types';
import { api } from '@/lib/services/http';

type ProductState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProduct: (productId: number) => Promise<Product | null>;
  clearError: () => void;
};

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('products/');
      set({ products: Array.isArray(response.data) ? response.data : [], loading: false });
    } catch (e) {
      set({ error: 'Could not load products. Is the backend running?', loading: false });
    }
  },
  fetchProduct: async (productId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`products/${productId}/`);
      set({ loading: false });
      return response.data as Product;
    } catch (e) {
      set({ error: 'Could not load product. Is the backend running?', loading: false });
      return null;
    }
  },
  clearError: () => set({ error: null }),
}));

export const selectProducts = (state: ProductState) => state.products;
export const selectProductsLoading = (state: ProductState) => state.loading;
export const selectProductsError = (state: ProductState) => state.error;
