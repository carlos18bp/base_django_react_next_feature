import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, waitFor } from '@testing-library/react';

import AdminLoginPage from '../page';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/services/tokens';
import { useAuthStore } from '@/lib/stores/authStore';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/lib/services/tokens', () => ({
  setTokens: jest.fn(),
}));

jest.mock('@/lib/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

const mockUseRouter = useRouter as unknown as jest.Mock;
const mockUseSearchParams = useSearchParams as unknown as jest.Mock;
const mockSetTokens = setTokens as jest.Mock;
const mockGetState = useAuthStore.getState as jest.Mock;

describe('AdminLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue({ restoreUser: jest.fn().mockResolvedValue(undefined) });
  });

  it('stores tokens, restores the user, and redirects to a safe target', async () => {
    const replace = jest.fn();
    const restoreUser = jest.fn().mockResolvedValue(undefined);
    mockUseRouter.mockReturnValue({ replace });
    mockUseSearchParams.mockReturnValue(new URLSearchParams('access=a&refresh=r&redirect=/dashboard'));
    mockGetState.mockReturnValue({ restoreUser });

    render(<AdminLoginPage />);

    await waitFor(() => expect(mockSetTokens).toHaveBeenCalledWith({ access: 'a', refresh: 'r' }));
    expect(restoreUser).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to sign-in when tokens are missing', async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockUseSearchParams.mockReturnValue(new URLSearchParams('redirect=/dashboard'));

    render(<AdminLoginPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/sign-in'));
    expect(mockSetTokens).not.toHaveBeenCalled();
  });

  it('falls back to home for unsafe absolute redirect', async () => {
    const replace = jest.fn();
    const restoreUser = jest.fn().mockResolvedValue(undefined);
    mockUseRouter.mockReturnValue({ replace });
    mockUseSearchParams.mockReturnValue(new URLSearchParams(`access=a&refresh=r&redirect=${encodeURIComponent('https://evil.example.com')}`));
    mockGetState.mockReturnValue({ restoreUser });

    render(<AdminLoginPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
  });

  it('falls back to home for unsafe protocol-relative redirect', async () => {
    const replace = jest.fn();
    const restoreUser = jest.fn().mockResolvedValue(undefined);
    mockUseRouter.mockReturnValue({ replace });
    mockUseSearchParams.mockReturnValue(new URLSearchParams(`access=a&refresh=r&redirect=${encodeURIComponent('//evil.example.com')}`));
    mockGetState.mockReturnValue({ restoreUser });

    render(<AdminLoginPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
  });
});
