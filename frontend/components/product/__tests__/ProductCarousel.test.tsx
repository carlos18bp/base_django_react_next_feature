import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProductCarousel from '../ProductCarousel';
import { useProductStore } from '../../../lib/stores/productStore';
import { mockProducts } from '../../../lib/__tests__/fixtures';

jest.mock('../../../lib/stores/productStore', () => ({
  useProductStore: jest.fn(),
}));

const mockUseProductStore = useProductStore as unknown as jest.Mock;

const setProductStoreState = (state: any) => {
  mockUseProductStore.mockImplementation((selector: (store: any) => unknown) => selector(state));
};

describe('ProductCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('triggers fetch on mount', async () => {
    const fetchProducts = jest.fn();
    setProductStoreState({ products: [], loading: true, error: null, fetchProducts });

    render(<ProductCarousel />);

    // Bug this catches: removing the mount `useEffect(() => { void fetchProducts() })`
    // in ProductCarousel.tsx:15-17 would leave fetchProducts uncalled.
    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledTimes(1);
    });
  });

  it('renders loading state', () => {
    const fetchProducts = jest.fn();
    setProductStoreState({ products: [], loading: true, error: null, fetchProducts });

    const { container } = render(<ProductCarousel />);

    expect(screen.getByText('Trending products')).toBeInTheDocument();
    // Bug this catches: shrinking the skeleton loop (Array.from({ length: 8 }))
    // to e.g. length 1 would still pass a bare toBeGreaterThan(0) check.
    // quality: allow-fragile-selector (skeleton has no testid/role hook; counting .animate-pulse is the only observable — audit A1 2026-08-13)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(8 * 4);
  });

  it('renders error state', () => {
    const fetchProducts = jest.fn();
    setProductStoreState({ products: [], loading: false, error: 'Network error', fetchProducts });

    render(<ProductCarousel />);

    expect(screen.getByText('Products unavailable')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('refetches when Retry is clicked', async () => {
    const fetchProducts = jest.fn();
    setProductStoreState({ products: [], loading: false, error: 'Network error', fetchProducts });

    render(<ProductCarousel />);

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    // Bug this catches: a Retry button whose onClick stops calling fetchProducts
    // would leave the count at 1 (the mount effect) instead of 2.
    expect(fetchProducts).toHaveBeenCalledTimes(2);
  });

  it('renders empty state', () => {
    const fetchProducts = jest.fn();
    setProductStoreState({ products: [], loading: false, error: null, fetchProducts });

    render(<ProductCarousel />);

    expect(screen.getByText('No products yet')).toBeInTheDocument();
  });

  it('renders product cards when available', () => {
    const fetchProducts = jest.fn();
    setProductStoreState({ products: mockProducts, loading: false, error: null, fetchProducts });

    render(<ProductCarousel />);

    expect(screen.getByText(mockProducts[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockProducts[1].title)).toBeInTheDocument();
  });

  it('caps rendered product cards at 8 when more than 8 are available', () => {
    const fetchProducts = jest.fn();
    setProductStoreState({ products: mockProducts, loading: false, error: null, fetchProducts });

    render(<ProductCarousel />);

    // Bug this catches: deleting `products.slice(0, 8)` (ProductCarousel.tsx:19)
    // would render all 9 fixture products instead of stopping at the 8th.
    expect(screen.getByText(mockProducts[7].title)).toBeInTheDocument();
    expect(screen.queryByText(mockProducts[8].title)).not.toBeInTheDocument();
  });
});
