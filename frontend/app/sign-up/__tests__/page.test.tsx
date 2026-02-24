import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SignUpPage from '../page';
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

const setAuthStoreState = (state: any) => {
  mockUseAuthStore.mockImplementation((selector?: (store: any) => unknown) =>
    selector ? selector(state) : state
  );
};

describe('SignUpPage', () => {
  const originalGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGoogleCredential = 'token';
    mockGoogleError = false;
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client';
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
    setAuthStoreState({ signUp: jest.fn(), googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignUpPage />);

    expect(screen.getByText('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const signUp = jest.fn();
    setAuthStoreState({ signUp, googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    const signUp = jest.fn();
    setAuthStoreState({ signUp, googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('signs up successfully and redirects', async () => {
    const signUp = jest.fn().mockResolvedValue(undefined);
    setAuthStoreState({ signUp, googleLogin: jest.fn() });
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      });
    });

    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('shows error when Google registration fails with response error', async () => {
    const googleLogin = jest
      .fn()
      .mockRejectedValue({ response: { data: { error: 'Google auth error' } } });
    setAuthStoreState({ signUp: jest.fn(), googleLogin });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });
    mockJwtDecode.mockReturnValue({
      email: 'google@example.com',
      given_name: 'Google',
      family_name: 'User',
      picture: 'pic.png',
    });

    render(<SignUpPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Google Login' }));

    expect(await screen.findByText('Google auth error')).toBeInTheDocument();
  });

  it('shows default error when Google registration throws without response', async () => {
    const googleLogin = jest.fn().mockRejectedValue(new Error('boom'));
    setAuthStoreState({ signUp: jest.fn(), googleLogin });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });
    mockJwtDecode.mockReturnValue({
      email: 'google@example.com',
      given_name: 'Google',
      family_name: 'User',
      picture: 'pic.png',
    });

    render(<SignUpPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Google Login' }));

    expect(await screen.findByText('Google registration failed')).toBeInTheDocument();
  });

  it('shows an error when sign up fails', async () => {
    const signUp = jest.fn().mockRejectedValue({ response: { data: { error: 'Registration failed' } } });
    setAuthStoreState({ signUp, googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Registration failed')).toBeInTheDocument();
  });

  it('shows default error when sign up error payload is missing', async () => {
    const signUp = jest.fn().mockRejectedValue({ response: { data: null } });
    setAuthStoreState({ signUp, googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Registration failed')).toBeInTheDocument();
  });

  it('handles Google registration success', async () => {
    const googleLogin = jest.fn().mockResolvedValue(undefined);
    setAuthStoreState({ signUp: jest.fn(), googleLogin });
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockJwtDecode.mockReturnValue({
      email: 'google@example.com',
      given_name: 'Google',
      family_name: 'User',
      picture: 'pic.png',
    });

    render(<SignUpPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Google Login' }));

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
    setAuthStoreState({ signUp: jest.fn(), googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignUpPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Google Login' }));

    expect(await screen.findByText('Google registration failed')).toBeInTheDocument();
  });

  it('handles Google login error callback', async () => {
    mockGoogleError = true;
    setAuthStoreState({ signUp: jest.fn(), googleLogin: jest.fn() });
    mockUseRouter.mockReturnValue({ replace: jest.fn() });

    render(<SignUpPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Google Login' }));

    expect(await screen.findByText('Google registration failed')).toBeInTheDocument();
  });

  it('continues when jwt decode fails', async () => {
    const googleLogin = jest.fn().mockResolvedValue(undefined);
    setAuthStoreState({ signUp: jest.fn(), googleLogin });
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockJwtDecode.mockImplementation(() => {
      throw new Error('bad token');
    });

    render(<SignUpPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Google Login' }));

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
