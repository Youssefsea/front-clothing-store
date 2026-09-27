"use client";
import {create} from "zustand";
import type {CartItem} from "@/types";
type CartState={items:CartItem[];total:number;loading:boolean;error:string|null;set:(items:CartItem[],total:number)=>void;clear:()=>void;setLoading:(v:boolean)=>void;setError:(v:string|null)=>void};
export const useCartStore=create<CartState>(set=>({items:[],total:0,loading:false,error:null,set:(items,total)=>set({items,total,error:null}),clear:()=>set({items:[],total:0,error:null}),setLoading:v=>set({loading:v}),setError:v=>set({error:v,loading:false})}));
