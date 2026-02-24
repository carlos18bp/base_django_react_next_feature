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

  it('renders loading state', async () => {
    const fetchProducts = jest.fn();
    setProductStoreState({ products: [], loading: true, error: null, fetchProducts });

    const { container } = render(<ProductCarousel />);

    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('Trending products')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders error state and retries', async () => {
    const fetchProducts = jest.fn();
    setProductStoreState({ products: [], loading: false, error: 'Network error', fetchProducts });

    render(<ProductCarousel />);

    expect(screen.getByText('Products unavailable')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

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
});
