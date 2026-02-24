import { describe, it, expect, beforeEach } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react';

import BlogDetailPage from '../page';
import { useBlogStore } from '../../../../lib/stores/blogStore';

jest.mock('../../../../lib/stores/blogStore', () => ({
  useBlogStore: jest.fn(),
}));

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

const setBlogStoreState = (state: any) => {
  mockUseBlogStore.mockImplementation((selector: (store: any) => unknown) => selector(state));
};

describe('BlogDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when blogId is invalid', async () => {
    const fetchBlog = jest.fn();
    setBlogStoreState({ fetchBlog });

    render(<BlogDetailPage params={{ blogId: 'abc' }} />);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(fetchBlog).not.toHaveBeenCalled();
  });

  it('renders blog content when available', async () => {
    const fetchBlog = jest.fn().mockResolvedValue({
      id: 1,
      title: 'Test Blog',
      category: 'Tips',
      description: 'Some blog description',
      image_url: 'http://example.com/blog.jpg',
    });
    setBlogStoreState({ fetchBlog });

    render(<BlogDetailPage params={{ blogId: '1' }} />);

    await waitFor(() => {
      expect(fetchBlog).toHaveBeenCalledWith(1);
    });

    await act(async () => {
      await Promise.all(fetchBlog.mock.results.map((result) => result.value));
    });

    expect(await screen.findByRole('heading', { name: 'Test Blog' })).toBeInTheDocument();
    expect(await screen.findByText('Some blog description')).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'Test Blog' })).toBeInTheDocument();
  });

  it('handles blogs without image or description', async () => {
    const fetchBlog = jest.fn().mockResolvedValue({
      id: 2,
      title: 'Text Only Blog',
      category: '',
      description: '',
      image_url: '',
    });
    setBlogStoreState({ fetchBlog });

    render(<BlogDetailPage params={{ blogId: '2' }} />);

    await waitFor(() => {
      expect(fetchBlog).toHaveBeenCalledWith(2);
    });

    await act(async () => {
      await Promise.all(fetchBlog.mock.results.map((result) => result.value));
    });

    expect(await screen.findByRole('heading', { name: 'Text Only Blog' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
