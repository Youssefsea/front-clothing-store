export type Locale="en"|"ar";export type Theme="light"|"dark";export type Role="user"|"admin";export type AuthStatus="checking"|"authenticated"|"unauthenticated"|"error";
export interface User{id:number;name:string;email:string;phone?:string;role?:Role}
export interface Product{id:number;title:string;description?:string|null;price:number|string;discount?:number|string|null;stock:number|string;image_url?:string|null;category_name?:string|null;sizes?:string|null;colors?:string|null;is_active?:boolean}
export interface CartItem{cart_item_id:number;product_id:number;title:string;quantity:number;price:number;discount:number;final_price:number;subtotal:number;size:string;color:string;image?:string|null;available:boolean}
export interface CartResponse{message:string;cart_id:number;total:number;items:CartItem[]}
export interface OrderItem{product_id:number;quantity:number;price:number;title?:string;image_url?:string}
export interface Order{id:number;user_id:number;customer_name?:string;customer_email?:string;customer_phone?:string;address?:string;payment_method?:string;payment_screenshot?:string;total?:number|string;status?:string;created_at?:string;updated_at?:string;items?:OrderItem[]}
export interface ApiMessage{message:string}
export interface ProductListResponse{message:string;allProducts:Product[]}
export interface ProductsResponse{message:string;products:Product[]}
export interface ProductResponse{message:string;product:Product[]}
export interface LoginResponse{message:string;user:User;token:string}
export interface SessionResponse{message:string;name:string;email:string}
export interface OrdersResponse{success?:boolean;count?:number;orders:Order[]}
export interface AdminOrdersResponse{message:string;orders:Order[]}
export interface AdminUsersResponse{message:string;users:User[]}