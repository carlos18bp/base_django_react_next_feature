import { describe, it, expect, beforeEach } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react';

import BlogDetailPage from '../page';
import { useBlogStore } from '../../../../lib/stores/blogStore';

jest.mock('../../../../lib/stores/blogStore', () => ({
  useBlogStore: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

import { useParams } from 'next/navigation';
const mockUseParams = useParams as jest.Mock;

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

const setBlogStoreState = (state: any) => {
  mockUseBlogStore.mockImplementation((selector: (store: any) => unknown) => selector(state));
};

describe('BlogDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when blogId is invalid', async () => {
    // quality: allow-mock-only (the guard's only observable effect is the absent fetch; the
    // UI is identical either way — pending the BlogDetailPage not-found branch, see
    // tasks/tasks_plan.md backlog)
    const fetchBlog = jest.fn();
    setBlogStoreState({ fetchBlog });
    mockUseParams.mockReturnValue({ blogId: 'abc' });

    render(<BlogDetailPage />);

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

    mockUseParams.mockReturnValue({ blogId: '1' });
    render(<BlogDetailPage />);

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
    mockUseParams.mockReturnValue({ blogId: '2' });

    render(<BlogDetailPage />);

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
