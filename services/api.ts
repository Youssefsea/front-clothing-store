import type {ApiErrorPayload} from "@/types";
import {joinPath} from "@/lib/utils";
export class ApiError extends Error{status:number;payload?:ApiErrorPayload;constructor(message:string,status=500,payload?:ApiErrorPayload){super(message);this.name="ApiError";this.status=status;this.payload=payload}}
const apiBase=process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/,"");
export async function apiRequest<T>(path:string,init:RequestInit={}):Promise<T>{
 if(!apiBase)throw new ApiError("NEXT_PUBLIC_API_URL is not configured",0);
 const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),20000);
 const headers=new Headers(init.headers);headers.set("Accept","application/json");
 if(init.body&&!(init.body instanceof FormData)&&!headers.has("Content-Type"))headers.set("Content-Type","application/json");
 try{const response=await fetch(joinPath(apiBase,path),{...init,headers,credentials:"include",cache:"no-store",signal:controller.signal});
  const raw=await response.text();let payload:ApiErrorPayload&T={} as ApiErrorPayload&T;
  try{payload=raw?JSON.parse(raw):payload}catch{}
  if(!response.ok)throw new ApiError(payload.message||"REQUEST_FAILED",response.status,payload);
  return payload;
 }catch(error){if(error instanceof ApiError)throw error;throw new ApiError(error instanceof DOMException&&error.name==="AbortError"?"REQUEST_TIMEOUT":"NETWORK_ERROR",0)}
 finally{window.clearTimeout(timer)}
}