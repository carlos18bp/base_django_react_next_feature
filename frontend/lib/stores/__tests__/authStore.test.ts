import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useAuthStore } from '../authStore';
import { api } from '../../services/http';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../../services/tokens';

jest.mock('../../services/http', () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock('../../services/tokens', () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockGetAccessToken = getAccessToken as jest.Mock;
const mockGetRefreshToken = getRefreshToken as jest.Mock;
const mockSetTokens = setTokens as jest.Mock;
const mockClearTokens = clearTokens as jest.Mock;

const resetAuthState = () => {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
};

describe('authStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAuthState();
    mockGetAccessToken.mockReturnValue(null);
    mockGetRefreshToken.mockReturnValue(null);
  });

  it('syncs tokens from cookies', () => {
    mockGetAccessToken.mockReturnValue('access');
    mockGetRefreshToken.mockReturnValue('refresh');

    act(() => {
      useAuthStore.getState().syncFromCookies();
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access');
    expect(state.refreshToken).toBe('refresh');
    expect(state.isAuthenticated).toBe(true);
  });

  it('signs in successfully', async () => {
    mockGetAccessToken.mockReturnValue('access');
    mockGetRefreshToken.mockReturnValue('refresh');
    mockApi.post.mockResolvedValueOnce({
      data: {
        access: 'access',
        refresh: 'refresh',
        user: {
          id: 1,
          email: 'user@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'customer',
          is_staff: false,
        },
      },
    });

    await act(async () => {
      await useAuthStore.getState().signIn({ email: 'user@example.com', password: 'password' });
    });

    expect(mockSetTokens).toHaveBeenCalledWith({ access: 'access', refresh: 'refresh' });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('user@example.com');
  });

  it('throws when sign in response is missing tokens', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { access: null, refresh: null } });

    await expect(useAuthStore.getState().signIn({ email: 'user@example.com', password: 'password' })).rejects.toThrow(
      'Invalid token response'
    );
  });

  it('signs up successfully', async () => {
    mockGetAccessToken.mockReturnValue('access');
    mockGetRefreshToken.mockReturnValue('refresh');
    mockApi.post.mockResolvedValueOnce({
      data: {
        access: 'access',
        refresh: 'refresh',
        user: {
          id: 2,
          email: 'new@example.com',
          first_name: 'New',
          last_name: 'User',
          role: 'customer',
          is_staff: false,
        },
      },
    });

    await act(async () => {
      await useAuthStore.getState().signUp({ email: 'new@example.com', password: 'password' });
    });

    expect(mockSetTokens).toHaveBeenCalledWith({ access: 'access', refresh: 'refresh' });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('throws when sign up response is missing tokens', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { access: null, refresh: null } });

    await expect(
      useAuthStore.getState().signUp({ email: 'new@example.com', password: 'password' })
    ).rejects.toThrow('Invalid token response');
  });

  it('logs in with google credentials', async () => {
    mockGetAccessToken.mockReturnValue('access');
    mockGetRefreshToken.mockReturnValue('refresh');
    mockApi.post.mockResolvedValueOnce({
      data: {
        access: 'access',
        refresh: 'refresh',
        user: {
          id: 3,
          email: 'google@example.com',
          first_name: 'Google',
          last_name: 'User',
          role: 'customer',
          is_staff: false,
        },
      },
    });

    await act(async () => {
      await useAuthStore.getState().googleLogin({ credential: 'token', email: 'google@example.com' });
    });

    expect(mockSetTokens).toHaveBeenCalledWith({ access: 'access', refresh: 'refresh' });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('throws when google login response is missing tokens', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { access: null, refresh: null } });

    await expect(useAuthStore.getState().googleLogin({ credential: 'token' })).rejects.toThrow('Invalid token response');
  });

  it('signs out and clears tokens', () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: 'access', refreshToken: 'refresh' });

    act(() => {
      useAuthStore.getState().signOut();
    });

    expect(mockClearTokens).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('sends a password reset code', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });

    await act(async () => {
      await useAuthStore.getState().sendPasswordResetCode('user@example.com');
    });

    expect(mockApi.post).toHaveBeenCalledWith('send_passcode/', { email: 'user@example.com' });
  });

  it('resets password', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });

    await act(async () => {
      await useAuthStore
        .getState()
        .resetPassword({ email: 'user@example.com', code: '123456', new_password: 'password123' });
    });

    expect(mockApi.post).toHaveBeenCalledWith('verify_passcode_and_reset_password/', {
      email: 'user@example.com',
      code: '123456',
      new_password: 'password123',
    });
  });
});
