import type { Blog, Product, CartItem } from '../types';

export const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Greek Sculpture Candle',
    category: 'Aesthetic Candles',
    sub_category: 'Greek Sculptures',
    description: 'Beautiful Greek-inspired candle',
    price: 150,
    gallery_urls: ['http://example.com/image1.jpg'],
  },
  {
    id: 2,
    title: 'Minimalist Modern Candle',
    category: 'Aesthetic Candles',
    sub_category: 'Minimalist Modern',
    description: 'Clean and modern design',
    price: 120,
    gallery_urls: ['http://example.com/image2.jpg'],
  },
  {
    id: 3,
    title: 'Romantic Rose Candle',
    category: 'Aesthetic Candles',
    sub_category: 'Love & Romance',
    description: 'Perfect for romantic occasions',
    price: 180,
    gallery_urls: ['http://example.com/image3.jpg'],
  },
];

export const mockBlogs: Blog[] = [
  {
    id: 1,
    title: 'How to Choose the Perfect Candle',
    description: 'A comprehensive guide to selecting the right candle for your space',
    category: 'Tips & Tricks',
    image_url: 'http://example.com/blog1.jpg',
  },
  {
    id: 2,
    title: 'The Art of Candle Making',
    description: 'Learn about the traditional craft of candle making',
    category: 'Education',
    image_url: 'http://example.com/blog2.jpg',
  },
  {
    id: 3,
    title: 'Top 10 Candle Scents for 2026',
    description: 'Discover the trending scents for this year',
    category: 'Trends',
    image_url: 'http://example.com/blog3.jpg',
  },
];

export const mockCartItems: CartItem[] = [
  {
    id: 1,
    title: 'Greek Sculpture Candle',
    price: 150,
    quantity: 2,
    gallery_urls: ['http://example.com/image1.jpg'],
  },
  {
    id: 2,
    title: 'Minimalist Modern Candle',
    price: 120,
    quantity: 1,
    gallery_urls: ['http://example.com/image2.jpg'],
  },
];

export const mockProduct: Product = mockProducts[0];
export const mockBlog: Blog = mockBlogs[0];
