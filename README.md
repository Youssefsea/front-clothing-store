# VANTA

Greenfield Next.js clothing commerce frontend connected to the real backend contract.

Auth: POST /send-otp, POST /signup, POST /login, POST /logout, GET /isLoggedIn.
Products: GET /products, POST /products/byName, /byCategory, /inRange, /byColor; admin add/update/toggle.
Cart: POST /cart/add, DELETE /cart/delete with product_id, GET /cart, GET /cart/count, POST /cart/update.
Orders: POST /orders/confirm with payment_method, address and payment_screenshot; GET /orders/orderForUser.
Admin: GET /admin/orders, PUT /admin/orders/status, GET /admin/users, DELETE /admin/users/delete.

Real limitations intentionally preserved: only vodafone_cash and instapay payments; address is 10–300 chars; no wishlist endpoint; no shipping-price endpoint; no category CRUD; order_items do not expose size/color; /isLoggedIn does not return role. Admin role is kept as a non-sensitive sessionStorage hint and verified inside the admin area against backend authorization.

Setup: copy .env.example to .env.local, set NEXT_PUBLIC_API_URL, then npm install and npm run dev.
Quality: npm run typecheck, npm run lint, npm run build.
CI validation branch for full typecheck, lint, build and route smoke verification.
