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
  {
    id: 4,
    title: 'Vanilla Bean Jar Candle',
    category: 'Aesthetic Candles',
    sub_category: 'Classic Scents',
    description: 'Warm vanilla bean fragrance in a reusable jar',
    price: 95,
    gallery_urls: ['http://example.com/image4.jpg'],
  },
  {
    id: 5,
    title: 'Ocean Breeze Soy Candle',
    category: 'Aesthetic Candles',
    sub_category: 'Fresh Scents',
    description: 'Crisp ocean-inspired fragrance',
    price: 110,
    gallery_urls: ['http://example.com/image5.jpg'],
  },
  {
    id: 6,
    title: 'Lavender Fields Candle',
    category: 'Aesthetic Candles',
    sub_category: 'Relaxation',
    description: 'Calming lavender for a peaceful evening',
    price: 130,
    gallery_urls: ['http://example.com/image6.jpg'],
  },
  {
    id: 7,
    title: 'Cedarwood & Amber Candle',
    category: 'Aesthetic Candles',
    sub_category: 'Woody Scents',
    description: 'Warm cedarwood layered with amber',
    price: 140,
    gallery_urls: ['http://example.com/image7.jpg'],
  },
  {
    id: 8,
    title: 'Citrus Grove Candle',
    category: 'Aesthetic Candles',
    sub_category: 'Fresh Scents',
    description: 'Zesty citrus blend for a bright room',
    price: 100,
    gallery_urls: ['http://example.com/image8.jpg'],
  },
  {
    id: 9,
    title: 'Midnight Jasmine Candle',
    category: 'Aesthetic Candles',
    sub_category: 'Floral Scents',
    description: 'Rich jasmine bloom for evening ambiance',
    price: 160,
    gallery_urls: ['http://example.com/image9.jpg'],
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
  {
    id: 4,
    title: 'Seasonal Candle Care Tips',
    description: 'Keep your candles burning longer with these seasonal tips',
    category: 'Tips & Tricks',
    image_url: 'http://example.com/blog4.jpg',
  },
  {
    id: 5,
    title: 'Soy vs Paraffin Wax Explained',
    description: 'A breakdown of wax types and how they affect burn quality',
    category: 'Education',
    image_url: 'http://example.com/blog5.jpg',
  },
  {
    id: 6,
    title: 'Layering Scents Like a Pro',
    description: 'Combine complementary fragrances for a signature scent',
    category: 'Trends',
    image_url: 'http://example.com/blog6.jpg',
  },
  {
    id: 7,
    title: 'Candle Safety at Home',
    description: 'Essential safety guidelines for burning candles indoors',
    category: 'Tips & Tricks',
    image_url: 'http://example.com/blog7.jpg',
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
