import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';
import { mockProducts } from '../../../lib/__tests__/fixtures';

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

describe('ProductCard', () => {
  const product = mockProducts[0];

  it('should render product title', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText(product.title)).toBeInTheDocument();
  });

  it('should render product price', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText(`$${product.price}`)).toBeInTheDocument();
  });

  it('should render product category', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText(product.category!)).toBeInTheDocument();
  });

  it('should render product image when gallery_urls exists', () => {
    render(<ProductCard product={product} />);
    const image = screen.getByAltText(product.title);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', product.gallery_urls![0]);
  });

  it('should not render image when gallery_urls is empty', () => {
    const productWithoutImage = { ...product, gallery_urls: [] };
    render(<ProductCard product={productWithoutImage} />);
    expect(screen.queryByAltText(product.title)).not.toBeInTheDocument();
  });

  it('should link to product detail page', () => {
    render(<ProductCard product={product} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/products/${product.id}`);
  });

  it('should render fallback category text when category is not provided', () => {
    const productWithoutCategory = { ...product, category: undefined };
    render(<ProductCard product={productWithoutCategory} />);
    expect(screen.getByText('Product')).toBeInTheDocument();
  });
});
