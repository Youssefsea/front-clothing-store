import { apiRequest } from "./api";
import type { CartItem, CartResponse } from "@/types";
export type CartPayload = {message:string;cart_id?:number;total?:number;items?:CartItem[]};
export const cartService = {
 get:()=>apiRequest<CartResponse>("/cart"),
 count:()=>apiRequest<{count:number}>("/cart/count"),
 add:(body:{product_id:number;quantity:number;size:string;color:string})=>apiRequest<CartPayload>("/cart/add",{method:"POST",body:JSON.stringify(body)}),
 update:(body:{product_id:number;delta:number;size:string;color:string})=>apiRequest<CartPayload>("/cart/update",{method:"POST",body:JSON.stringify(body)}),
 remove:(product_id:number)=>apiRequest<CartPayload>("/cart/delete",{method:"DELETE",body:JSON.stringify({product_id})})
};
