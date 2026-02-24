import { describe, it, expect, beforeEach } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutPage from '../page';
import { useCartStore } from '../../../lib/stores/cartStore';
import { api } from '../../../lib/services/http';

jest.mock('../../../lib/stores/cartStore', () => ({
  useCartStore: jest.fn(),
}));

jest.mock('../../../lib/services/http', () => ({
  api: {
    post: jest.fn(),
  },
}));

const mockUseCartStore = useCartStore as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

const setCartState = (state: any) => {
  mockUseCartStore.mockImplementation((selector: (store: any) => unknown) => selector(state));
};

describe('CheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty cart state', async () => {
    setCartState({
      items: [],
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    });

    render(<CheckoutPage />);

    expect(await screen.findByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Complete checkout' })).toBeDisabled();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('updates quantities and removes items', async () => {
    const updateQuantity = jest.fn();
    const removeFromCart = jest.fn();

    setCartState({
      items: [
        {
          id: 1,
          title: 'Candle One',
          price: 50,
          quantity: 1,
          gallery_urls: ['http://example.com/img.jpg'],
        },
        {
          id: 2,
          title: 'Candle Two',
          price: 30,
          quantity: 2,
          gallery_urls: [],
        },
      ],
      removeFromCart,
      updateQuantity,
      clearCart: jest.fn(),
    });

    render(<CheckoutPage />);

    const qtyInputs = screen.getAllByLabelText('Qty');
    fireEvent.change(qtyInputs[0], { target: { value: '3' } });

    expect(updateQuantity).toHaveBeenCalledWith(1, 3);

    await userEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    expect(removeFromCart).toHaveBeenCalledWith(1);

    expect(screen.getByText('Candle Two')).toBeInTheDocument();
  });

  it('submits checkout successfully', async () => {
    const clearCart = jest.fn();

    setCartState({
      items: [
        {
          id: 1,
          title: 'Candle One',
          price: 50,
          quantity: 2,
          gallery_urls: ['http://example.com/img.jpg'],
        },
      ],
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart,
    });

    mockApi.post.mockResolvedValueOnce({ data: {} });

    render(<CheckoutPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'buyer@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Address'), { target: { value: '123 Street' } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'Madrid' } });
    fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'MD' } });
    fireEvent.change(screen.getByPlaceholderText('Postal code'), { target: { value: '28001' } });

    fireEvent.click(screen.getByRole('button', { name: 'Complete checkout' }));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
      expect(clearCart).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Checkout completed.')).toBeInTheDocument();
  });

  it('shows an error on failed checkout', async () => {
    setCartState({
      items: [
        {
          id: 1,
          title: 'Candle One',
          price: 50,
          quantity: 1,
          gallery_urls: ['http://example.com/img.jpg'],
        },
      ],
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    });

    mockApi.post.mockRejectedValueOnce(new Error('fail'));

    render(<CheckoutPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'buyer@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Address'), { target: { value: '123 Street' } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'Madrid' } });
    fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'MD' } });
    fireEvent.change(screen.getByPlaceholderText('Postal code'), { target: { value: '28001' } });

    fireEvent.click(screen.getByRole('button', { name: 'Complete checkout' }));

    expect(await screen.findByText('Could not complete checkout.')).toBeInTheDocument();
  });
});
