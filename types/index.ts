export type Locale = "en" | "ar";
export type ThemeMode = "light" | "dark";
export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";
export type Role = "admin" | "user";

export interface User { id?: number|string; name:string; email:string; phone?:string; role?:Role; }
export interface Product {
  id:number; title:string; description?:string|null; price:number; discount:number; stock:number;
  image_url?:string|null; category_name:string; sizes?:string|null; colors?:string|null; is_active?:boolean;
  [key:string]: unknown;
}
export interface CartItem { cart_item_id:number; product_id:number; title:string; quantity:number; price:number; discount:number; final_price:number; subtotal:number; size:string; color:string; image:string; available:boolean; }
export interface OrderItem { product_id:number; quantity:number; price:number; title?:string; image_url?:string; }
export interface Order { id:number|string; user_id?:number|string; customer_name?:string; customer_email?:string; customer_phone?:string; address?:string; payment_method?:string; payment_screenshot?:string; total:number|string; status:string; created_at?:string; items?:OrderItem[]; [key:string]:unknown; }
export interface AdminUser { id?:number|string; name?:string; email?:string; phone?:string; role?:string; created_at?:string; [key:string]:unknown; }
export interface ApiErrorPayload { message?:string; success?:boolean; error?:string; }
