import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SignInPage from '../page';
import { useAuthStore } from '../../../lib/stores/authStore';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

let mockGoogleCredential: string | null = 'token';
let mockGoogleError = false;

jest.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }: any) => (
    <button
      type="button"
      onClick={() => {
        if (mockGoogleError) {
          onError?.();
          return;
        }
        onSuccess?.({ credential: mockGoogleCredential ?? undefined });
      }}
    >
      Google Login
    </button>
  ),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

jest.mock('../../../lib/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseRouter = useRouter as unknown as jest.Mock;
const mockJwtDecode = jwtDecode as unknown as jest.Mock;
let user: ReturnType<typeof userEvent.setup>;

const setAuthStoreState = (state: any) => {
  mockUseAuthStore.mockImplementation((selector?: (store: any) => unknown) =>
    selector ? selector(state) : state
  );
};

describe('SignInPage', () => {
  const originalGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGoogleCredential = 'token';
    mockGoogleError = false;
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client';
    user = userEvent.setup();
  });

  afterEach(() => {
    if (originalGoogleClientId === undefined) {
      delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    } else {
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = originalGoogleClientId;
    }
  });

  it('renders missing Google Client ID message when env var not set', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    setAuthStoreState({ signIn: jest.fn(), googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignInPage />);

    expect(screen.getByText('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID')).toBeInTheDocument();
  });

  it('signs in successfully and redirects', async () => {
    const signIn = jest.fn().mockResolvedValue(undefined);
    setAuthStoreState({ signIn, googleLogin: jest.fn() });
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });

    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password123' });
    });
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error when sign in fails', async () => {
    const signIn = jest.fn().mockRejectedValue({ response: { data: { error: 'Invalid' } } });
    setAuthStoreState({ signIn, googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid')).toBeInTheDocument();
  });

  it('shows default error when sign in fails without response', async () => {
    const signIn = jest.fn().mockRejectedValue(new Error('boom'));
    setAuthStoreState({ signIn, googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows default error when sign in error payload is missing', async () => {
    const signIn = jest.fn().mockRejectedValue({ response: { data: null } });
    setAuthStoreState({ signIn, googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('handles Google login success', async () => {
    const googleLogin = jest.fn().mockResolvedValue(undefined);
    setAuthStoreState({ signIn: jest.fn(), googleLogin });
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockJwtDecode.mockReturnValue({
      email: 'google@example.com',
      given_name: 'Google',
      family_name: 'User',
      picture: 'pic.png',
    });

    render(<SignInPage />);

    await user.click(screen.getByRole('button', { name: 'Google Login' }));

    await waitFor(() => {
      expect(googleLogin).toHaveBeenCalledWith({
        credential: 'token',
        email: 'google@example.com',
        given_name: 'Google',
        family_name: 'User',
        picture: 'pic.png',
      });
    });
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error when Google credential is missing', async () => {
    mockGoogleCredential = null;
    setAuthStoreState({ signIn: jest.fn(), googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignInPage />);

    await user.click(screen.getByRole('button', { name: 'Google Login' }));

    expect(await screen.findByText('Google login failed')).toBeInTheDocument();
  });

  it('shows error when Google login fails with response error', async () => {
    const googleLogin = jest
      .fn()
      .mockRejectedValue({ response: { data: { error: 'Google auth error' } } });
    setAuthStoreState({ signIn: jest.fn(), googleLogin });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });
    mockJwtDecode.mockReturnValue({
      email: 'google@example.com',
      given_name: 'Google',
      family_name: 'User',
      picture: 'pic.png',
    });

    render(<SignInPage />);

    await user.click(screen.getByRole('button', { name: 'Google Login' }));

    expect(await screen.findByText('Google auth error')).toBeInTheDocument();
  });

  it('shows default error when Google login throws without response', async () => {
    const googleLogin = jest.fn().mockRejectedValue(new Error('boom'));
    setAuthStoreState({ signIn: jest.fn(), googleLogin });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });
    mockJwtDecode.mockReturnValue({
      email: 'google@example.com',
      given_name: 'Google',
      family_name: 'User',
      picture: 'pic.png',
    });

    render(<SignInPage />);

    await user.click(screen.getByRole('button', { name: 'Google Login' }));

    expect(await screen.findByText('Google login failed')).toBeInTheDocument();
  });

  it('handles Google login error callback', async () => {
    mockGoogleError = true;
    setAuthStoreState({ signIn: jest.fn(), googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignInPage />);

    await user.click(screen.getByRole('button', { name: 'Google Login' }));

    expect(await screen.findByText('Google login failed')).toBeInTheDocument();
  });

  it('continues when jwt decode fails', async () => {
    const googleLogin = jest.fn().mockResolvedValue(undefined);
    setAuthStoreState({ signIn: jest.fn(), googleLogin });
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockJwtDecode.mockImplementation(() => {
      throw new Error('bad token');
    });

    render(<SignInPage />);

    await user.click(screen.getByRole('button', { name: 'Google Login' }));

    await waitFor(() => {
      expect(googleLogin).toHaveBeenCalledWith({
        credential: 'token',
        email: undefined,
        given_name: undefined,
        family_name: undefined,
        picture: undefined,
      });
    });
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });
});
