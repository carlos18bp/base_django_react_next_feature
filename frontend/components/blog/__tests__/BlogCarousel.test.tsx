import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BlogCarousel from '../BlogCarousel';
import { useBlogStore } from '../../../lib/stores/blogStore';
import { mockBlogs } from '../../../lib/__tests__/fixtures';

jest.mock('../../../lib/stores/blogStore', () => ({
  useBlogStore: jest.fn(),
}));

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

const setBlogStoreState = (state: any) => {
  mockUseBlogStore.mockImplementation((selector: (store: any) => unknown) => selector(state));
};

describe('BlogCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', async () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: true, error: null, fetchBlogs });

    const { container } = render(<BlogCarousel />);

    await waitFor(() => {
      expect(fetchBlogs).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('Trending blogs')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders error state and retries', async () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: false, error: 'Network error', fetchBlogs });

    render(<BlogCarousel />);

    expect(screen.getByText('Blogs unavailable')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(fetchBlogs).toHaveBeenCalledTimes(2);
  });

  it('renders empty state', () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: false, error: null, fetchBlogs });

    render(<BlogCarousel />);

    expect(screen.getByText('No blogs yet')).toBeInTheDocument();
  });

  it('renders blog cards when available', () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: mockBlogs, loading: false, error: null, fetchBlogs });

    render(<BlogCarousel />);

    expect(screen.getByText(mockBlogs[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockBlogs[1].title)).toBeInTheDocument();
  });
});
