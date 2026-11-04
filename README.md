# Dalab Online

**Order from Somalia's best local stores — delivered to your door, paid with EVC Plus or eDahab.**

_Dalab_ means "order" in Somali. Dalab Online is a multi-vendor marketplace where local Mogadishu
stores sell through one storefront, customers order and pay by mobile money, and an admin team
approves orders and manages deliveries.

**Live site:** https://dalab-online-production.up.railway.app

## Features

- Product listing with category/store/price filters, sorting, search and pagination
- Product details with gallery, reviews and similar products
- Cart for guests (browser) and signed-in customers (database), wishlist
- Checkout with shipping details and EVC Plus / eDahab payment instructions (demo, no real money)
- Order history, order details, cancel pending orders
- Seller center: store registration, product management, orders and sales dashboard
- Admin panel: approve/deny orders, deliveries, stores, financials (10% commission payouts)

## Tech stack

React 19 · React Router 7 (SPA mode) · Tailwind CSS 4 · Express 5 · MySQL 8 (`mysql2`) · JWT auth
with bcrypt · deployed on Railway.

## Run locally

```bash
npm install
cp .env.example .env        # then fill in DB_* (or DATABASE_URL) and JWT_SECRET
npm run db:setup            # creates tables and loads demo data (add -- --reset to reload)
npm run build
npm start                   # http://localhost:3001
```

For development with hot reload run `npm run server` and `npm run dev` (http://localhost:5173).

## Demo accounts

See the header of [database/seed.sql](database/seed.sql).
