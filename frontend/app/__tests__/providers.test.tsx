import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import Providers from '../providers';

jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="google-oauth-provider">{children}</div>
  ),
}));

describe('Providers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('renders children without GoogleOAuthProvider when client ID is not set', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    render(
      <Providers>
        <span data-testid="child">content</span>
      </Providers>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByTestId('google-oauth-provider')).not.toBeInTheDocument();
  });

  it('wraps children with GoogleOAuthProvider when client ID is present', () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id';

    render(
      <Providers>
        <span data-testid="child">content</span>
      </Providers>
    );

    expect(screen.getByTestId('google-oauth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
