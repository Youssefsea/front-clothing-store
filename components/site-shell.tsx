"use client";
import {useState} from "react";
import {Navbar} from "@/components/navbar";
import {Footer} from "@/components/footer";
import {SearchOverlay} from "@/components/search-overlay";
import {CartDrawer} from "@/components/cart-drawer";
export function SiteShell({children}:{children:React.ReactNode}){const[search,setSearch]=useState(false);const[cart,setCart]=useState(false);return <><Navbar onSearch={()=>setSearch(true)} onCart={()=>setCart(true)}/><main className="min-h-[calc(100vh-80px)]">{children}</main><Footer/><SearchOverlay open={search} onClose={()=>setSearch(false)}/><CartDrawer open={cart} onClose={()=>setCart(false)}/></>}
