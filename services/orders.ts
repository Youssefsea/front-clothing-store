import { apiRequest } from "./api";
import type { Order } from "@/types";
export const orderService = {
 listMine:async()=> (await apiRequest<{success:boolean;count:number;orders:Order[]}>("/orders/orderForUser")).orders ?? [],
 confirm:async(input:{payment_method:"vodafone_cash"|"instapay";address:string;screenshot:File})=>{
  const body=new FormData(); body.append("payment_method",input.payment_method); body.append("address",input.address); body.append("payment_screenshot",input.screenshot);
  return apiRequest<{message:string;order_id:number|string;total:string;payment_screenshot:string;items_count:number}>("/orders/confirm",{method:"POST",body});
 }
};
