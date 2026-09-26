export type Role = "user" | "admin";
export type Locale = "en" | "ar";

export type Product = {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  discount: number;
  stock: number;
  image_url?: string | null;
  category_name: string;
  sizes?: string | null;
  colors?: string | null;
  is_active: boolean;
};

export type CartItem = {
  cart_item_id: number;
  product_id: number;
  title: string;
  quantity: number;
  price: number;
  discount: number;
  final_price: number;
  subtotal: number;
  size: string;
  color: string;
  image: string;
  available: boolean;
};

export type CartStatePayload = { cart_id?: number; total?: number; items?: CartItem[] };

export type User = {
  id?: number;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
};

export type OrderItem = {
  product_id: number;
  quantity: number;
  price: number;
  title?: string;
  image_url?: string;
};

export type Order = {
  id: number | string;
  user_id?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  address?: string;
  payment_method?: string;
  payment_screenshot?: string;
  total: number | string;
  status: string;
  created_at?: string;
  items?: OrderItem[];
};

export type AdminUser = User;
