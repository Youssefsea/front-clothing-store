"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { isAdmin } = useAuth();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <span className="footer__brand">VANTA</span>
          <p className="footer__about">
            Modern essentials for the everyday. Built around bold silhouettes,
            honest materials and considered design.
          </p>
        </div>

        <div>
          <h4 className="footer__heading">Shop</h4>
          <div className="footer__links">
            <Link href="/shop">All products</Link>
            <Link href="/cart">Your bag</Link>
            <Link href="/checkout">Checkout</Link>
          </div>
        </div>

        <div>
          <h4 className="footer__heading">Account</h4>
          <div className="footer__links">
            <Link href="/orders">My orders</Link>
            <Link href="/account">Account</Link>
            <Link href="/signup">Create account</Link>
            <Link href="/login">Sign in</Link>
          </div>
        </div>

        <div>
          <h4 className="footer__heading">Store</h4>
          <div className="footer__links">
            {isAdmin && <Link href="/admin">Admin area</Link>}
            <span>Support@vanta.store</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} VANTA. All rights reserved.</span>
        <span>Designed for the modern wardrobe.</span>
      </div>
    </footer>
  );
}