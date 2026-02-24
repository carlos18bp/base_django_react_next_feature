import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductStore, selectProducts, selectProductsLoading, selectProductsError } from '../productStore';
import { api } from '../../services/http';
import { mockProducts, mockProduct } from '../../__tests__/fixtures';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('productStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useProductStore.setState({ products: [], loading: false, error: null });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('fetchProducts', () => {
    it('should fetch products successfully', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockProducts });

      const { result } = renderHook(() => useProductStore());

      await act(async () => {
        await result.current.fetchProducts();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.products).toEqual(mockProducts);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle non-array response', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { id: 1 } });

      const { result } = renderHook(() => useProductStore());

      await act(async () => {
        await result.current.fetchProducts();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.products).toEqual([]);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle fetch error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProductStore());

      await act(async () => {
        await result.current.fetchProducts();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Could not load products. Is the backend running?');
        expect(result.current.products).toEqual([]);
      });
    });

    it('should set loading state during fetch', async () => {
      // Create a promise that resolves after we check the loading state
      let resolvePromise: (value: any) => void;
      const promise: Promise<any> = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockApi.get.mockImplementation(() => promise);

      const { result } = renderHook(() => useProductStore());

      act(() => {
        result.current.fetchProducts();
      });

      expect(result.current.loading).toBe(true);
      
      // Resolve the promise to clean up
      await act(async () => {
        resolvePromise!({ data: [] });
        await promise;
      });
    });
  });

  describe('fetchProduct', () => {
    it('should fetch single product successfully', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockProduct });

      const { result } = renderHook(() => useProductStore());

      let product;
      await act(async () => {
        product = await result.current.fetchProduct(1);
      });

      expect(product).toEqual(mockProduct);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Not found'));

      const { result } = renderHook(() => useProductStore());

      let product;
      await act(async () => {
        product = await result.current.fetchProduct(999);
      });

      expect(product).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Could not load product. Is the backend running?');
    });
  });

  describe('clearError', () => {
    it('resets error to null when clearError is called', () => {
      useProductStore.setState({ error: 'some error' });

      const { result } = renderHook(() => useProductStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectProducts returns the products array from state', () => {
      const state = { products: mockProducts, loading: false, error: null } as Parameters<typeof selectProducts>[0];
      expect(selectProducts(state)).toBe(mockProducts);
    });

    it('selectProductsLoading returns the loading flag from state', () => {
      const state = { products: [], loading: true, error: null } as Parameters<typeof selectProductsLoading>[0];
      expect(selectProductsLoading(state)).toBe(true);
    });

    it('selectProductsError returns the error string from state', () => {
      const state = { products: [], loading: false, error: 'oops' } as Parameters<typeof selectProductsError>[0];
      expect(selectProductsError(state)).toBe('oops');
    });
  });
});
