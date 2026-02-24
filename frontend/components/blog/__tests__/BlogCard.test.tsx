import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import BlogCard from '../BlogCard';
import { mockBlogs } from '../../../lib/__tests__/fixtures';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill: _fill, ...otherProps } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...otherProps} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('BlogCard', () => {
  const blog = mockBlogs[0];

  it('should render blog title', () => {
    render(<BlogCard blog={blog} />);
    expect(screen.getByText(blog.title)).toBeInTheDocument();
  });

  it('should render blog category', () => {
    render(<BlogCard blog={blog} />);
    expect(screen.getByText(blog.category!)).toBeInTheDocument();
  });

  it('should render blog image when image_url exists', () => {
    render(<BlogCard blog={blog} />);
    const image = screen.getByAltText(blog.title);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', blog.image_url!);
  });

  it('should not render image when image_url is not provided', () => {
    const blogWithoutImage = { ...blog, image_url: undefined };
    render(<BlogCard blog={blogWithoutImage} />);
    expect(screen.queryByAltText(blog.title)).not.toBeInTheDocument();
  });

  it('should link to blog detail page', () => {
    render(<BlogCard blog={blog} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/blogs/${blog.id}`);
  });

  it('should render fallback category text when category is not provided', () => {
    const blogWithoutCategory = { ...blog, category: undefined };
    render(<BlogCard blog={blogWithoutCategory} />);
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });
});
