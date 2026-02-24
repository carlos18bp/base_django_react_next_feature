import { describe, it, expect, beforeEach } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'next/navigation';

import ProductDetailPage from '../page';
import { useCartStore } from '../../../../lib/stores/cartStore';
import { useProductStore } from '../../../../lib/stores/productStore';

jest.mock('../../../../lib/stores/cartStore', () => ({
  useCartStore: jest.fn(),
}));

jest.mock('../../../../lib/stores/productStore', () => ({
  useProductStore: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

const mockUseCartStore = useCartStore as unknown as jest.Mock;
const mockUseProductStore = useProductStore as unknown as jest.Mock;
const mockUseParams = useParams as unknown as jest.Mock;

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ productId: '1' });
  });

  it('shows product not found when productId is invalid', async () => {
    const fetchProduct = jest.fn();
    mockUseProductStore.mockImplementation((selector: (state: any) => unknown) => selector({ fetchProduct }));
    mockUseCartStore.mockImplementation((selector: (state: any) => unknown) => selector({ addToCart: jest.fn() }));

    mockUseParams.mockReturnValue({ productId: 'nope' });

    render(<ProductDetailPage />);

    expect(await screen.findByText('Product not found.')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Back to catalog' })).toBeInTheDocument();
    expect(fetchProduct).not.toHaveBeenCalled();
  });

  it('shows loading state while fetching product', async () => {
    let resolveProduct: (value: any) => void;
    const fetchProduct = jest.fn().mockReturnValue(
      new Promise((resolve) => { resolveProduct = resolve; })
    );
    mockUseProductStore.mockImplementation((selector: (state: any) => unknown) => selector({ fetchProduct }));
    mockUseCartStore.mockImplementation((selector: (state: any) => unknown) => selector({ addToCart: jest.fn() }));

    render(<ProductDetailPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await act(async () => { resolveProduct!(null); });
  });

  it('shows product not found when fetchProduct returns null', async () => {
    const fetchProduct = jest.fn().mockResolvedValue(null);
    mockUseProductStore.mockImplementation((selector: (state: any) => unknown) => selector({ fetchProduct }));
    mockUseCartStore.mockImplementation((selector: (state: any) => unknown) => selector({ addToCart: jest.fn() }));

    render(<ProductDetailPage />);

    expect(await screen.findByText('Product not found.')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Back to catalog' })).toBeInTheDocument();
  });

  it('renders product details and adds to cart', async () => {
    const product = {
      id: 1,
      title: 'Test Product',
      category: 'Category',
      description: 'Product description',
      price: 99,
      gallery_urls: ['http://example.com/p1.jpg'],
    };
    const fetchProduct = jest.fn().mockResolvedValue(product);
    const addToCart = jest.fn();

    mockUseProductStore.mockImplementation((selector: (state: any) => unknown) => selector({ fetchProduct }));
    mockUseCartStore.mockImplementation((selector: (state: any) => unknown) => selector({ addToCart }));

    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith(1);
    });

    await act(async () => {
      await Promise.all(fetchProduct.mock.results.map((result) => result.value));
    });

    expect(await screen.findByRole('heading', { name: 'Test Product' })).toBeInTheDocument();
    expect(await screen.findByText('$99')).toBeInTheDocument();
    expect(await screen.findByText('Product description')).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'Test Product' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(addToCart).toHaveBeenCalledWith(product, 1);
  });

  it('handles products without gallery or description', async () => {
    const product = {
      id: 2,
      title: 'Minimal Product',
      category: '',
      description: '',
      price: 10,
    };
    const fetchProduct = jest.fn().mockResolvedValue(product);

    mockUseProductStore.mockImplementation((selector: (state: any) => unknown) => selector({ fetchProduct }));
    mockUseCartStore.mockImplementation((selector: (state: any) => unknown) => selector({ addToCart: jest.fn() }));

    mockUseParams.mockReturnValue({ productId: ['2'] });

    render(<ProductDetailPage />);

    await waitFor(() => {
      expect(fetchProduct).toHaveBeenCalledWith(2);
    });

    await act(async () => {
      await Promise.all(fetchProduct.mock.results.map((result) => result.value));
    });

    expect(await screen.findByRole('heading', { name: 'Minimal Product' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
  });
});
