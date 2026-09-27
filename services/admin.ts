import { apiRequest } from "./api";
import type { AdminUser, Order } from "@/types";
export const adminService = {
 orders:()=>apiRequest<{orders?:Order[];allOrders?:Order[]}|Order[]>("/admin/orders"),
 users:()=>apiRequest<{users?:AdminUser[];allUsers?:AdminUser[]}|AdminUser[]>("/admin/users"),
 updateOrderStatus:(order_id:number,status:string)=>apiRequest<{message:string}>("/admin/orders/status",{method:"PUT",body:JSON.stringify({order_id,status})}),
 deleteUser:(user_id:number)=>apiRequest<{message:string}>("/admin/users/delete",{method:"DELETE",body:JSON.stringify({user_id})})
};
export function unwrapOrders(payload:{orders?:Order[];allOrders?:Order[]}|Order[]){return Array.isArray(payload)?payload:(payload.orders??payload.allOrders??[]);}
export function unwrapUsers(payload:{users?:AdminUser[];allUsers?:AdminUser[]}|AdminUser[]){return Array.isArray(payload)?payload:(payload.users??payload.allUsers??[]);}
