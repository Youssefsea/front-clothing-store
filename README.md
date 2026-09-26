# VANTA

VANTA is a greenfield Next.js clothing storefront rebuilt around the actual VANTA clothing backend contract.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Motion, Zustand, Lucide.

## Setup

1. Copy .env.example to .env.local.
2. Set NEXT_PUBLIC_API_URL to the backend base URL.
3. Run npm install.
4. Run npm run dev.

## Runtime model

The storefront uses the real backend as its source of truth. There is no silent mock fallback. A temporary API outage is shown as an explicit error state with retry.

Authentication relies on the backend HTTP-only token cookie. The frontend keeps only a versioned, non-secret session snapshot in sessionStorage for deterministic UI role rendering; the backend remains the authority for authorization.

## Backend capabilities used

Public product listing and filters, login, OTP signup, cart operations, order confirmation with Vodafone Cash or InstaPay payment screenshot, user orders, and supported admin operations.

The backend does not expose category CRUD or wishlist endpoints, so the new frontend does not fake those features. Categories are derived from products for storefront navigation and the admin category route is explicitly read-only.

## Media

The default hero image is an Unsplash-hosted editorial image. An optional video can be supplied through NEXT_PUBLIC_HERO_VIDEO_URL. Product imagery comes from the backend and is parsed defensively from its comma-separated image_url field.

See MEDIA_SOURCES.md for the source note.
