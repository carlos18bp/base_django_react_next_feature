import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BlogsPage from '../page';
import { useBlogStore } from '../../../lib/stores/blogStore';
import { mockBlogs } from '../../../lib/__tests__/fixtures';

jest.mock('../../../lib/stores/blogStore', () => ({
  useBlogStore: jest.fn(),
}));

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

const setBlogStoreState = (state: any) => {
  mockUseBlogStore.mockImplementation((selector: (store: any) => unknown) => selector(state));
};

describe('BlogsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state and triggers fetch', async () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: true, error: null, fetchBlogs });

    const { container } = render(<BlogsPage />);

    await waitFor(() => {
      expect(fetchBlogs).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('Blogs')).toBeInTheDocument();
    // Bug this catches: shrinking the skeleton loop (Array.from({ length: 9 }))
    // to e.g. length 1 would still pass a bare toBeGreaterThan(0) check.
    // quality: allow-fragile-selector (skeleton has no testid/role hook; counting
    // .animate-pulse is the only observable — audit A1 2026-08-13)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(9 * 3);
  });

  it('renders error state and retries', async () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: false, error: 'Network error', fetchBlogs });

    render(<BlogsPage />);

    expect(screen.getByText('Blogs unavailable')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(fetchBlogs).toHaveBeenCalledTimes(2);
  });

  it('renders empty state', () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: false, error: null, fetchBlogs });

    render(<BlogsPage />);

    expect(screen.getByText('No blogs yet')).toBeInTheDocument();
  });

  it('renders blog cards when available', () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: mockBlogs, loading: false, error: null, fetchBlogs });

    render(<BlogsPage />);

    expect(screen.getByText(mockBlogs[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockBlogs[1].title)).toBeInTheDocument();
  });
});
