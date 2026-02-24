import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../cartStore';
import { mockProducts } from '../../__tests__/fixtures';

describe('cartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
  });

  describe('addToCart', () => {
    it('should add a new product to cart', () => {
      const { result } = renderHook(() => useCartStore());
      const product = mockProducts[0];

      act(() => {
        result.current.addToCart(product, 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toMatchObject({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
      });
    });

    it('should default quantity to 1 when omitted', () => {
      const { result } = renderHook(() => useCartStore());
      const product = mockProducts[0];

      act(() => {
        result.current.addToCart(product);
      });

      expect(result.current.items[0].quantity).toBe(1);
    });

    it('should increase quantity if product already exists', () => {
      const { result } = renderHook(() => useCartStore());
      const product = mockProducts[0];

      act(() => {
        result.current.addToCart(product, 2);
        result.current.addToCart(product, 3);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(5);
    });

    it('should keep other items when updating one quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProducts[0], 1);
        result.current.addToCart(mockProducts[1], 1);
        result.current.updateQuantity(mockProducts[0].id, 4);
      });

      const first = result.current.items.find((item) => item.id === mockProducts[0].id);
      const second = result.current.items.find((item) => item.id === mockProducts[1].id);
      expect(first?.quantity).toBe(4);
      expect(second?.quantity).toBe(1);
    });

    it('should add multiple different products', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProducts[0], 1);
        result.current.addToCart(mockProducts[1], 2);
      });

      expect(result.current.items).toHaveLength(2);
    });

    it('should keep other items when increasing quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProducts[0], 1);
        result.current.addToCart(mockProducts[1], 1);
        result.current.addToCart(mockProducts[0], 2);
      });

      expect(result.current.items).toHaveLength(2);
      const first = result.current.items.find((item) => item.id === mockProducts[0].id);
      const second = result.current.items.find((item) => item.id === mockProducts[1].id);
      expect(first?.quantity).toBe(3);
      expect(second?.quantity).toBe(1);
    });
  });

  describe('removeFromCart', () => {
    it('should remove a product from cart', () => {
      const { result } = renderHook(() => useCartStore());
      const product = mockProducts[0];

      act(() => {
        result.current.addToCart(product, 1);
        result.current.removeFromCart(product.id);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should only remove specified product', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProducts[0], 1);
        result.current.addToCart(mockProducts[1], 1);
        result.current.removeFromCart(mockProducts[0].id);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe(mockProducts[1].id);
    });
  });

  describe('updateQuantity', () => {
    it('should update product quantity', () => {
      const { result } = renderHook(() => useCartStore());
      const product = mockProducts[0];

      act(() => {
        result.current.addToCart(product, 1);
        result.current.updateQuantity(product.id, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it('should remove product if quantity is 0', () => {
      const { result } = renderHook(() => useCartStore());
      const product = mockProducts[0];

      act(() => {
        result.current.addToCart(product, 1);
        result.current.updateQuantity(product.id, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProducts[0], 1);
        result.current.addToCart(mockProducts[1], 2);
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('subtotal', () => {
    it('should calculate correct subtotal', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProducts[0], 2); // 150 * 2 = 300
        result.current.addToCart(mockProducts[1], 1); // 120 * 1 = 120
      });

      expect(result.current.subtotal()).toBe(420);
    });

    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.subtotal()).toBe(0);
    });
  });
});
