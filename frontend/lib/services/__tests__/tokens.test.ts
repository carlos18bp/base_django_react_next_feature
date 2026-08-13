import { describe, it, expect, beforeEach } from '@jest/globals';

import Cookies from 'js-cookie';

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../tokens';

jest.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('tokens service', () => {
  const mockCookies = Cookies as unknown as {
    get: jest.Mock;
    set: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads access and refresh tokens', () => {
    mockCookies.get.mockImplementation((key: string) => {
      if (key === 'access_token') return 'access';
      if (key === 'refresh_token') return 'refresh';
      return undefined;
    });

    expect(getAccessToken()).toBe('access');
    expect(getRefreshToken()).toBe('refresh');
  });

  it('returns null when tokens are missing', () => {
    mockCookies.get.mockReturnValue(undefined);

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    // Bug this catches: a typo'd cookie key in tokens.ts (e.g. renaming
    // ACCESS_TOKEN_KEY) would still read undefined and pass the toBeNull
    // checks above; pinning the queried keys catches that.
    expect(mockCookies.get).toHaveBeenCalledWith('access_token');
    expect(mockCookies.get).toHaveBeenCalledWith('refresh_token');
  });

  it('sets both token cookies', () => {
    setTokens({ access: 'token-a', refresh: 'token-r' });

    expect(mockCookies.set).toHaveBeenCalledWith('access_token', 'token-a', { sameSite: 'lax' });
    expect(mockCookies.set).toHaveBeenCalledWith('refresh_token', 'token-r', { sameSite: 'lax' });
  });

  it('clears both token cookies', () => {
    clearTokens();

    expect(mockCookies.remove).toHaveBeenCalledWith('access_token');
    expect(mockCookies.remove).toHaveBeenCalledWith('refresh_token');
  });
});
