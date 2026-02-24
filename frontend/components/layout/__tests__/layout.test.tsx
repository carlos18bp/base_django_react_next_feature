import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Footer from '../Footer';
import Header from '../Header';

import { useAuthStore } from '../../../lib/stores/authStore';
import { useCartStore } from '../../../lib/stores/cartStore';

jest.mock('../../../lib/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../lib/stores/cartStore', () => ({
  useCartStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseCartStore = useCartStore as unknown as jest.Mock;

const renderHeader = (authState: { isAuthenticated: boolean; signOut: jest.Mock }, cartItems: Array<{ quantity: number }>) => {
  mockUseAuthStore.mockImplementation((selector: (state: typeof authState) => unknown) => selector(authState));
  mockUseCartStore.mockImplementation((selector: (state: { items: Array<{ quantity: number }> }) => unknown) =>
    selector({ items: cartItems })
  );

  return render(<Header />);
};

describe('layout components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders footer copy', () => {
    render(<Footer />);
    expect(screen.getByText(/Base Django \+ React \+ Next Feature Template/i)).toBeInTheDocument();
  });

  it('renders header for signed out users with cart count', () => {
    renderHeader({ isAuthenticated: false, signOut: jest.fn() }, [{ quantity: 1 }, { quantity: 3 }]);

    expect(screen.getByRole('link', { name: 'Catalog' })).toHaveAttribute('href', '/catalog');
    expect(screen.getByRole('link', { name: 'Blogs' })).toHaveAttribute('href', '/blogs');
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/sign-up');
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders header for authenticated users and signs out', async () => {
    const signOut = jest.fn();
    renderHeader({ isAuthenticated: true, signOut }, [{ quantity: 2 }]);

    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/dashboard');
    const signOutButton = screen.getByRole('button', { name: 'Sign out' });

    await userEvent.click(signOutButton);

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
  });
});
