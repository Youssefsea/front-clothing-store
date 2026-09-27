import { apiRequest } from "./api";
import type { Product } from "@/types";
type ProductsPayload = {message:string;allProducts?:Product[];products?:Product[];product?:Product[]};
export const productService = {
 all:async()=> (await apiRequest<ProductsPayload>("/products")).allProducts ?? [],
 byName:async(title:string)=>(await apiRequest<ProductsPayload>("/products/byName",{method:"POST",body:JSON.stringify({title})})).product?.[0] ?? null,
 byCategory:async(category_name:string)=>(await apiRequest<ProductsPayload>("/products/byCategory",{method:"POST",body:JSON.stringify({category_name})})).products ?? [],
 byRange:async(minPrice:number,maxPrice:number)=>(await apiRequest<ProductsPayload>("/products/inRange",{method:"POST",body:JSON.stringify({minPrice,maxPrice})})).products ?? [],
 byColor:async(color:string)=>(await apiRequest<ProductsPayload>("/products/byColor",{method:"POST",body:JSON.stringify({color})})).products ?? [],
 add:(body:FormData)=>apiRequest<{message:string}>("/products/add",{method:"POST",body}),
 update:(body:FormData)=>apiRequest<{message:string}>("/products/update",{method:"PUT",body}),
 toggle:(id:number)=>apiRequest<{message:string}>("/products/toggle",{method:"PUT",body:JSON.stringify({id})})
};
