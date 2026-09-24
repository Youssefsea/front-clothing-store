# Frontend Audit Findings & Refactoring Plan

## Current State Assessment

### ✅ What's Working
- React 19 + Next.js 16 with Turbopack (modern stack)
- Tailwind CSS + Material-UI integration
- Basic page structure: home, login, signup, shop, product, cart, checkout, orders
- Axios instance configured for API calls
- Product filtering (category, price, color, size)
- Cart management (add, update, remove items)
- Checkout flow with payment screenshot upload
- OTP-based signup flow
- Mobile-responsive design with Drawer navigation

### ⚠️ Issues Found
1. **Wrong Backend URL** - Pointing to `https://backend-clothing-store2.obl.ee` instead of `http://localhost:6020`
2. **No Environment Configuration** - API URL hard-coded in axios.js
3. **Token Storage** - Using localStorage for tokens (spec requires HTTP-only cookies only)
4. **No Error Normalization** - Generic error messages, no centralized error handling
5. **Poor Loading States** - Basic loading spinners, inconsistent feedback
6. **No Empty States** - Missing UI for empty cart, no results, etc.
7. **Generic Design** - Brown/tan theme with Material-UI defaults, not premium fashion brand aesthetic
8. **No Motion System** - Minimal animations, no micro-interactions
9. **No Admin Dashboard** - Admin features mentioned in spec but not implemented
10. **No Order History** - Need to implement order tracking page
11. **Inconsistent Styling** - Mix of Material-UI components without cohesive design language
12. **No State Management** - Using React hooks only, no centralized state (could use Context or Redux)

### 📂 Files to Refactor/Create
- ✏️ Refactor: `src/app/axios.js` → `src/lib/api.js` (centralized API layer)
- ✏️ Refactor: `src/app/layout.js` → Premium navbar with better UX
- ✏️ Refactor: `src/app/Home.jsx` → Modern hero, featured products, editorial feel
- ✏️ Refactor: `src/app/shop/page.jsx` → Better filtering UX, modern grid
- ✏️ Refactor: `src/app/login/page.jsx` → Premium auth design
- ✏️ Refactor: `src/app/signup/page.jsx` → OTP flow with better UX
- ✏️ Refactor: `src/app/product/[title]/page.jsx` → Rich product detail page
- ✏️ Refactor: `src/app/cart/page.jsx` → Modern cart with smooth interactions
- ✏️ Refactor: `src/app/checkout/page.jsx` → Multi-step checkout, better UX
- 🆕 Create: `src/app/orders/page.jsx` → Order history with status tracking
- 🆕 Create: `src/app/admin/page.jsx` → Admin dashboard (protected)
- 🆕 Create: `src/app/admin/orders/page.jsx` → Manage orders
- 🆕 Create: `src/app/admin/users/page.jsx` → Manage users
- 🆕 Create: `src/app/admin/products/page.jsx` → Manage products
- 🆕 Create: `src/context/AuthContext.js` → Centralized auth state
- 🆕 Create: `src/context/CartContext.js` → Centralized cart state
- 🆕 Create: `src/lib/errorHandler.js` → Error normalization
- 🆕 Create: `src/lib/validation.js` → Input validation utilities
- 🆕 Create: `src/components/` folder with reusable UI components
- ✏️ Refactor: `src/app/globals.css` → Modern design system with CSS variables

## Refactoring Strategy

### Phase 1: Foundation (API & State)
1. Create centralized API layer with environment configuration
2. Set up error handling and validation utilities
3. Create Auth and Cart context providers
4. Update axios instance to use new structure

### Phase 2: Design System
1. Define modern fashion brand color palette and typography
2. Create CSS variable system for theming
3. Create reusable UI components (buttons, cards, modals, etc.)
4. Update layout with new design direction

### Phase 3: Authentication
1. Refactor login page with new design
2. Refactor signup with OTP flow improvement
3. Add auth context to manage user state
4. Add auth middleware for protected routes

### Phase 4: Product Pages
1. Redesign home page with editorial hero, featured products
2. Redesign shop page with modern filtering
3. Create rich product detail page
4. Improve product grid layouts

### Phase 5: Cart & Checkout
1. Redesign cart with modern interactions
2. Refactor checkout with better UX
3. Add form validation and error states
4. Improve payment screenshot upload

### Phase 6: Admin Dashboard
1. Create protected admin routes
2. Build admin dashboard layout
3. Implement order management
4. Implement user management
5. Implement product management (CRUD)

### Phase 7: Polish & Motion
1. Add subtle animations and transitions
2. Add micro-interactions (hover states, button feedback)
3. Add loading skeletons for products
4. Add empty states throughout
5. Implement smooth page transitions

### Phase 8: Verification & Testing
1. Test all API endpoints
2. Test auth flows (OTP, login, logout)
3. Test cart operations
4. Test checkout
5. Test admin features
6. Mobile responsiveness check
7. Performance verification

## Design Direction

**Visual Style:**
- Bold, editorial, premium fashion brand aesthetic
- Modern minimalism with strong typography
- Large imagery, generous whitespace
- Asymmetrical layouts where tasteful
- Strong CTA buttons with subtle animations
- Carefully chosen accent colors (not generic)
- Subtle borders and layered imagery

**Typography:**
- Modern, clean sans-serif (keep Poppins or similar)
- Large display headings (oversized)
- Clear hierarchy
- Generous spacing

**Color Palette:**
- Primary: Rich, sophisticated dark (charcoal or deep navy)
- Secondary: Bold accent color (refined gold, emerald, or similar)
- Neutrals: Clean whites, light grays for contrast
- Avoid: Neon, excessive gradients, generic browns

**Motion:**
- Subtle enter/exit animations
- Hover state transitions (button color, slight movement)
- Product image hover effects
- Page transition fade/slide
- NOT: Distracting, random, or everywhere

## Backend Contract (Verified Against Spec)
- Base URL: `http://localhost:6020`
- Auth: HTTP-only `token` cookie (credentials: "include")
- Product images: Cloudinary, may be comma-separated
- Checkout: Multipart form for file uploads
- OTP: 60-second expiry
- NO fake data, NO invented endpoints, NO invented fields
