import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBlogStore, selectBlogs, selectBlogsLoading, selectBlogsError } from '../blogStore';
import { api } from '../../services/http';
import { mockBlogs, mockBlog } from '../../__tests__/fixtures';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('blogStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useBlogStore.setState({ blogs: [], loading: false, error: null });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('fetchBlogs', () => {
    it('should fetch blogs successfully', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockBlogs });

      const { result } = renderHook(() => useBlogStore());

      await act(async () => {
        await result.current.fetchBlogs();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.blogs).toEqual(mockBlogs);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle non-array response', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { id: 1 } });

      const { result } = renderHook(() => useBlogStore());

      await act(async () => {
        await result.current.fetchBlogs();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.blogs).toEqual([]);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle fetch error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBlogStore());

      await act(async () => {
        await result.current.fetchBlogs();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Could not load blogs. Is the backend running?');
        expect(result.current.blogs).toEqual([]);
      });
    });

    it('should set loading state during fetch', async () => {
      // Create a promise that resolves after we check the loading state
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockApi.get.mockImplementation(() => promise);

      const { result } = renderHook(() => useBlogStore());

      act(() => {
        result.current.fetchBlogs();
      });

      expect(result.current.loading).toBe(true);
      
      // Resolve the promise to clean up
      await act(async () => {
        resolvePromise!({ data: [] });
        await promise;
      });
    });
  });

  describe('fetchBlog', () => {
    it('should fetch single blog successfully', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockBlog });

      const { result } = renderHook(() => useBlogStore());

      let blog;
      await act(async () => {
        blog = await result.current.fetchBlog(1);
      });

      expect(blog).toEqual(mockBlog);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Not found'));

      const { result } = renderHook(() => useBlogStore());

      let blog;
      await act(async () => {
        blog = await result.current.fetchBlog(999);
      });

      expect(blog).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Could not load blog. Is the backend running?');
    });
  });

  describe('clearError', () => {
    it('resets error to null when clearError is called', () => {
      useBlogStore.setState({ error: 'some error' });

      const { result } = renderHook(() => useBlogStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectBlogs returns the blogs array from state', () => {
      const state = { blogs: mockBlogs, loading: false, error: null } as Parameters<typeof selectBlogs>[0];
      expect(selectBlogs(state)).toBe(mockBlogs);
    });

    it('selectBlogsLoading returns the loading flag from state', () => {
      const state = { blogs: [], loading: true, error: null } as Parameters<typeof selectBlogsLoading>[0];
      expect(selectBlogsLoading(state)).toBe(true);
    });

    it('selectBlogsError returns the error string from state', () => {
      const state = { blogs: [], loading: false, error: 'oops' } as Parameters<typeof selectBlogsError>[0];
      expect(selectBlogsError(state)).toBe('oops');
    });
  });
});
