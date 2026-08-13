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

  it('triggers fetch on mount', async () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: true, error: null, fetchBlogs });

    render(<BlogsPage />);

    // Bug this catches: removing the mount `useEffect(() => { void fetchBlogs() })`
    // in blogs/page.tsx:14-16 would leave fetchBlogs uncalled.
    await waitFor(() => {
      expect(fetchBlogs).toHaveBeenCalledTimes(1);
    });
  });

  it('renders loading state', () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: true, error: null, fetchBlogs });

    const { container } = render(<BlogsPage />);

    expect(screen.getByText('Blogs')).toBeInTheDocument();
    // Bug this catches: shrinking the skeleton loop (Array.from({ length: 9 }))
    // to e.g. length 1 would still pass a bare toBeGreaterThan(0) check.
    // quality: allow-fragile-selector (skeleton has no testid/role hook; counting .animate-pulse is the only observable — audit A1 2026-08-13)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(9 * 3);
  });

  it('renders error state', () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: false, error: 'Network error', fetchBlogs });

    render(<BlogsPage />);

    expect(screen.getByText('Blogs unavailable')).toBeInTheDocument();
    // Bug this catches: deleting the `{error}` interpolation (blogs/page.tsx:41)
    // would drop the store's error message from the DOM while this stayed green.
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('refetches when Retry is clicked', async () => {
    const fetchBlogs = jest.fn();
    setBlogStoreState({ blogs: [], loading: false, error: 'Network error', fetchBlogs });

    render(<BlogsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    // Bug this catches: a Retry button whose onClick stops calling fetchBlogs
    // would leave the count at 1 (the mount effect) instead of 2.
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
