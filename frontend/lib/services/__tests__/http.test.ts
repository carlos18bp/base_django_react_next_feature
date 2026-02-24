import { describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../tokens', () => ({
  clearTokens: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  setTokens: jest.fn(),
}));

let requestInterceptor: ((config: any) => any) | null = null;
let responseSuccessInterceptor: ((response: any) => any) | null = null;
let responseErrorInterceptor: ((error: any) => Promise<any>) | null = null;
let apiInstance: jest.Mock<Promise<any>, any> & { interceptors: any };
let mockAxios: any;
let mockGetAccessToken: jest.Mock;
let mockGetRefreshToken: jest.Mock;
let mockSetTokens: jest.Mock;
let mockClearTokens: jest.Mock;

describe('http service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    const axiosModule = await import('axios');
    mockAxios = axiosModule.default;

    const tokensModule = await import('../tokens');
    mockGetAccessToken = tokensModule.getAccessToken as unknown as jest.Mock;
    mockGetRefreshToken = tokensModule.getRefreshToken as unknown as jest.Mock;
    mockSetTokens = tokensModule.setTokens as unknown as jest.Mock;
    mockClearTokens = tokensModule.clearTokens as unknown as jest.Mock;

    requestInterceptor = null;
    responseSuccessInterceptor = null;
    responseErrorInterceptor = null;
    apiInstance = jest.fn() as jest.Mock<Promise<any>, any>;
    apiInstance.interceptors = {
      request: {
        use: jest.fn((handler) => {
          requestInterceptor = handler;
        }),
      },
      response: {
        use: jest.fn((success, handler) => {
          responseSuccessInterceptor = success;
          responseErrorInterceptor = handler;
        }),
      },
    };

    mockAxios.create.mockReturnValue(apiInstance);
    mockAxios.post.mockResolvedValue({ data: {} });
    mockGetAccessToken.mockReturnValue(null);
    mockGetRefreshToken.mockReturnValue(null);
  });

  it('adds Authorization header when access token exists', async () => {
    mockGetAccessToken.mockReturnValue('token');
    await import('../http');

    const config = {};
    const result = requestInterceptor?.(config);

    expect(result.headers.Authorization).toBe('Bearer token');
  });

  it('keeps request headers unchanged when no access token', async () => {
    await import('../http');

    const config = {};
    const result = requestInterceptor?.(config);

    expect(result.headers).toBeUndefined();
  });

  it('rejects non-401 errors', async () => {
    await import('../http');

    const error = { response: { status: 500 } };

    await expect(responseErrorInterceptor?.(error)).rejects.toBe(error);
  });

  it('rejects 401 errors without request config', async () => {
    await import('../http');

    const error = { response: { status: 401 } };

    await expect(responseErrorInterceptor?.(error)).rejects.toBe(error);
  });

  it('returns response from success interceptor', async () => {
    await import('../http');

    const response = { data: { ok: true } };
    const result = responseSuccessInterceptor?.(response);

    expect(result).toBe(response);
  });

  it('rejects 401 when no refresh token is available', async () => {
    await import('../http');

    const error = { response: { status: 401 }, config: {} };

    await expect(responseErrorInterceptor?.(error)).rejects.toBe(error);
  });

  it('refreshes token and retries the request', async () => {
    mockGetRefreshToken.mockReturnValue('refresh');
    mockAxios.post.mockResolvedValueOnce({ data: { access: 'new-access' } });
    apiInstance.mockResolvedValueOnce('retried');

    await import('../http');

    const error = { response: { status: 401 }, config: {} };

    const result = await responseErrorInterceptor?.(error);

    expect(mockSetTokens).toHaveBeenCalledWith({ access: 'new-access', refresh: 'refresh' });
    expect(apiInstance).toHaveBeenCalledWith(
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer new-access' }) })
    );
    expect(result).toBe('retried');
  });

  it('reuses refresh promise for concurrent 401 responses', async () => {
    mockGetRefreshToken.mockReturnValue('refresh');
    let resolvePost: (value: any) => void;
    const postPromise: Promise<any> = new Promise((resolve) => {
      resolvePost = resolve;
    });
    mockAxios.post.mockReturnValueOnce(postPromise);
    apiInstance.mockResolvedValue('retried');

    await import('../http');

    const errorOne = { response: { status: 401 }, config: { headers: {} } };
    const errorTwo = { response: { status: 401 }, config: { headers: {} } };

    const firstAttempt = responseErrorInterceptor?.(errorOne);
    const secondAttempt = responseErrorInterceptor?.(errorTwo);

    expect(mockAxios.post).toHaveBeenCalledTimes(1);

    resolvePost!({ data: { access: 'new-access' } });

    await expect(firstAttempt).resolves.toBe('retried');
    await expect(secondAttempt).resolves.toBe('retried');
    expect(apiInstance).toHaveBeenCalledTimes(2);
  });

  it('rejects when refresh token response is missing access', async () => {
    mockGetRefreshToken.mockReturnValue('refresh');
    mockAxios.post.mockResolvedValueOnce({ data: {} });

    await import('../http');

    const error = { response: { status: 401 }, config: { headers: {} } };

    await expect(responseErrorInterceptor?.(error)).rejects.toBe(error);
    expect(mockSetTokens).not.toHaveBeenCalled();
  });

  it('clears tokens when refresh fails', async () => {
    mockGetRefreshToken.mockReturnValue('refresh');
    mockAxios.post.mockRejectedValueOnce(new Error('refresh failed'));

    await import('../http');

    const error = { response: { status: 401 }, config: { headers: {} } };

    await expect(responseErrorInterceptor?.(error)).rejects.toBe(error);
    expect(mockClearTokens).toHaveBeenCalledTimes(1);
  });

  it('rejects when request already retried', async () => {
    mockGetRefreshToken.mockReturnValue('refresh');
    await import('../http');

    const error = { response: { status: 401 }, config: { _retry: true } };

    await expect(responseErrorInterceptor?.(error)).rejects.toBe(error);
    expect(mockAxios.post).not.toHaveBeenCalled();
  });
});
