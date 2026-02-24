export type Blog = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  image_url?: string | null;
};

export type Product = {
  id: number;
  title: string;
  category?: string;
  sub_category?: string;
  description?: string;
  price: number;
  gallery_urls?: string[];
};

export type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  gallery_urls?: string[];
};

export type SaleCreatePayload = {
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  sold_products: Array<{ product_id: number; quantity: number }>;
};

export type UserListItem = {
  id: number;
  email: string;
  role?: string;
  is_staff: boolean;
  is_active: boolean;
};

export type SaleListItem = {
  id: number;
  email: string;
  city: string;
  state: string;
  postal_code: string;
};
