# CozyPaws Outlet - MVP PRD

## Overview
Discount pet supplies e-commerce platform leveraging CJ Dropshipping US warehouse for fulfillment and AliExpress. Direct-to-consumer model targeting budget-conscious pet owners seeking quality products at competitive prices.

## Goals & Success Metrics
- **Conversion**: 3% checkout completion rate on mobile
- **Performance**: <1.5s Largest Contentful Paint (LCP)
- **Profitability**: 60% gross margin on all transactions
- **GTM**: Launch functional MVP within 4 weeks

## Non-Goals (V2 Scope)
- Multi-language support
- Multi-currency payments
- Customer returns portal
- Subscription/autoship features
- Mobile native apps
- Advanced inventory forecasting

## User Stories

### Buyer Persona
- Browse products by category (dog, cat, small pets, accessories)
- Search by keyword/filter (brand, price, rating)
- Add items to cart, apply promo codes
- Checkout with card/wallet, track shipment
- Leave product reviews post-delivery

### Admin Persona
- View orders, sync to CJ Dropshipping API nad AliExpress
- Monitor inventory levels, update pricing
- Manage product catalog (add/edit/hide items)
- Track margins, conversion analytics
- Handle customer service inquiries via dashboard

## Data Model

**Products**: `id`, `sku`, `name`, `description`, `category`, `price`, `cost`, `supplier_id`, `stock`, `images[]`, `rating`

**Orders**: `id`, `user_id`, `items[]`, `total`, `status`, `tracking_url`, `supplier_order_id`, `created_at`

**Users**: `id`, `email`, `name`, `shipping_address`, `stripe_customer_id`

**Reviews**: `id`, `product_id`, `user_id`, `rating`, `comment`, `created_at`

**Cart**: `id`, `user_id`, `items[]`, `session_id`

## API Surface

**Public**: `GET /api/products`, `GET /api/products/[id]`, `POST /api/cart`, `POST /api/checkout`

**Protected**: `POST /api/orders`, `GET /api/orders/[id]`, `POST /api/reviews`

**Admin**: `POST /api/admin/products`, `PUT /api/admin/orders/[id]/fulfill`, `GET /api/admin/analytics`

**Webhooks**: `POST /api/webhooks/stripe`, `POST /api/webhooks/cj-dropship`

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **Payments**: Stripe Checkout, Webhooks
- **Fulfillment**: CJ Dropshipping API integration
- **Hosting**: Vercel (Edge Functions, ISR)
- **Analytics**: Vercel Analytics, PostHog (optional)

## Risk List

**Supplier Reliability**: CJ stock-outs delay orders. *Mitigation*: Real-time inventory sync, buffer stock alerts.

**Payment Fraud**: Chargebacks erode margin. *Mitigation*: Stripe Radar, manual high-value review.

**Performance**: Image-heavy catalog slows LCP. *Mitigation*: Next/Image optimization, CDN, lazy loading.

**Margin Pressure**: Shipping costs exceed forecast. *Mitigation*: Dynamic pricing engine, minimum order value.

## Release Timeline (4 Weeks)

**Week 1**: Setup (Next.js scaffold, Supabase schema, Stripe test mode, CJ API sandbox)

**Week 2**: Catalog (product listing, search/filter, detail pages, cart logic)

**Week 3**: Checkout (Stripe integration, order creation, CJ fulfillment API, email notifications)

**Week 4**: Polish (reviews, tracking, admin dashboard, performance audit, staging QA, production deploy)
