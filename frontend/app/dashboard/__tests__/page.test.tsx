import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DashboardPage from '../page';
import { useRequireAuth } from '../../../lib/hooks/useRequireAuth';
import { useAuthStore } from '../../../lib/stores/authStore';

jest.mock('../../../lib/hooks/useRequireAuth', () => ({
  useRequireAuth: jest.fn(),
}));

jest.mock('../../../lib/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseRequireAuth = useRequireAuth as unknown as jest.Mock;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

const setAuthStoreState = (state: any) => {
  mockUseAuthStore.mockImplementation((selector?: (store: any) => unknown) =>
    selector ? selector(state) : state
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when unauthenticated', () => {
    mockUseRequireAuth.mockReturnValue({ isAuthenticated: false });
    setAuthStoreState({ signOut: jest.fn() });

    const { container } = render(<DashboardPage />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders dashboard and triggers sign out', async () => {
    const signOut = jest.fn();
    mockUseRequireAuth.mockReturnValue({ isAuthenticated: true });
    setAuthStoreState({ signOut });

    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Backoffice' })).toHaveAttribute('href', '/backoffice');

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
