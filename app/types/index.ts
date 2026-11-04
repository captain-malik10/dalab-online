export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'admin' | 'vendor' | 'customer';
  created_at?: string;
  updated_at?: string;
}

export interface Vendor {
  id?: number;
  user_id?: number;
  email: string;
  password?: string;
  store_name: string;
  description?: string;
  isVerified?: boolean;
  country?: string;
  city?: string;
  district?: string;
  logo_url?: string;
  license_url?: string;
  status?: 'pending' | 'approved' | 'rejected';
  total_income?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id?: number;
  name: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  vendor_id: number;
  category_id: number;
  name: string;
  price: number | string; // API returns string, but we convert to number
  description?: string;
  image_urls?: string[] | string; // JSON array from database (can be string or parsed array)
  image_url?: string; // For backward compatibility
  discount?: number;
  isFeatured?: boolean;
  stock: number;
  vendor_name?: string; // From API join with vendors table
  category_name?: string; // From API join with categories table
  averageRating?: number;
  totalReviews?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SimilarProduct {
  id: number;
  name: string;
  price: number | string;
  image_urls?: string[] | string;
  isFeatured?: boolean;
  vendor_name?: string;
  averageRating?: number;
  totalReviews?: number;
  description?: string;
}

export interface Order {
  id?: number;
  customer_id: number;
  customer_name: string;
  total: number;
  store_cut?: string;
  status?: 'pending' | 'approved' | 'denied' | 'shipped' | 'processing' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed';
  shipping_address?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id?: number;
  product_id: number;
  customer_id: number;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id?: number;
  order_id: number;
  amount: number;
  method: 'EVC plus' | 'Edahab';
  status?: 'pending' | 'completed' | 'failed';
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Cart {
  id?: number;
  customer_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id?: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface Wishlist {
  id?: number;
  customer_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface WishlistItem {
  id?: number;
  wishlist_id: number;
  product_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductDetailsData {
  product: {
    id: number | string;
    name: string;
    image_urls?: string[] | string[][];
    price: number | string;
  };
  store: {
    name: string;
    country: string;
    city: string;
    isVerified: boolean;
    logo_url?: string;
    description?: string;
  };
  reviews: any[];
  relatedProducts?: any[];
}

export interface VendorDetails {
  store: Vendor;
  owner: User;
}
