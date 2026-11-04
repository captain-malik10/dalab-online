# ANALYSIS REPORT — Ashal Online Market

_Read-only audit, 2026-11-04. No files were modified except this report._

## 1. PROJECT SUMMARY

**Ashal Online Market** ("Ashal Market"; the header logo's alt text says "Africa's Place") is a **multi-vendor marketplace** for Somalia, where many stores sell through one storefront. Judging by phone prefixes (+252) and payment methods (EVC Plus, eDahab), it targets the Somali market. It sells general goods across categories (electronics, fashion, home, sports, beauty, books). There are three roles. **Customers** browse, use a cart and wishlist, check out and review products. **Vendors** run their own store dashboard and products. **Admins** approve stores and orders, track deliveries and see financials. It is a React Router v7 (SSR) frontend with a separate Express + MySQL REST API.

## 2. TECH STACK

| Layer | Technology (locked version) |
|---|---|
| Frontend | React 19.1, React Router 7.9.3 (framework mode, `ssr: true`), TypeScript 5.9, Vite 7.1.7 |
| Styling | Tailwind CSS 4.1 (`@tailwindcss/vite`), custom CSS variables in `app/app.css`, Inter font |
| UI libs | lucide-react (icons), framer-motion 12, react-toastify 11, @mui/x-charts 8 (+ Emotion) for dashboards |
| Backend | Node.js (local: v22.17), Express 5.1.0, cors, multer 2.0.2 |
| Database | MySQL via `mysql2` 3.15.2 (promise pool) |
| Auth | JWT (`jsonwebtoken` 9.0.2) stored in `localStorage`; passwords hashed with `bcryptjs` 3 |
| Payments | No gateway. Manual mobile-money: the app shows a USSD code (`*712*<merchant>*<amount>#`) for EVC Plus/eDahab, and an admin approves the order by hand |
| File storage | ImageKit (`imagekit` 6.0.0) for product images, logos and licences |
| Email | Nodemailer 7.0.10 (Gmail/Outlook/Yahoo SMTP) for the contact forms |

## 3. FOLDER STRUCTURE

```
ashal-main/
├── server.js              # Express API entry (port 3001, hardcoded)
├── server/
│   ├── config/            # db.js (MySQL pool), imagekit.js
│   ├── middleware/        # auth.js (JWT verify), isAdmin.js
│   └── routes/            # 14 REST routers: auth, products, cart, orders, admin, vendors…
├── app/                   # React Router frontend
│   ├── routes/            # Pages: home, shop, product, Cart, checkout, orders, profile…
│   │   ├── admin/         # Admin panel pages
│   │   └── store/         # Vendor (store owner) dashboard pages
│   ├── components/        # ~60 UI components (cards, modals, charts, header…)
│   ├── hooks/             # ~30 data hooks (useCart, useOrders, useAdmin*, useVendor*…)
│   ├── database/          # scheme.md (SQL schema), API docs, requirements doc
│   ├── dummy-data/        # 10 .md files with SQL INSERT seed data (out of date)
│   ├── assets/            # Images + unused static products.json / categories.ts
│   ├── config/, middleware/  # Dead duplicates of server code (never imported)
│   └── welcome/           # Unused React Router template leftovers
├── Dockerfile, package.json, vite.config.ts
└── server.log             # Old run log, CONTAINS A SECRET (see §9)
```
Not present: `node_modules/` (not installed), `build/`, `.git/`, `.env`, `.env.example`.

## 4. FEATURES CHECKLIST

| Feature | Status | Files / notes |
|---|---|---|
| Product listing | ✅ Working | `routes/shop.tsx`, `components/SearchFilter.tsx`, `server/routes/products.js`. Filters: category, vendor (one only), min/max price, featured. Sort by price and newest (client-side). Pagination plus grid/list view. Live search in the header for products and stores (`server/routes/search.js`, `hooks/useSearch.ts`) |
| Product details | ✅ Working | `routes/product-details.tsx`, `components/product/*`. Gallery, info, store info, reviews, similar products |
| Shopping cart | ✅ Working | `routes/Cart.tsx`, `hooks/useCart.ts` (logged in, saved in the DB), `hooks/useGuestCart.ts` (guest, saved in localStorage and merged into the DB cart on login), `server/routes/cart.js`. Supports add, update quantity, remove and clear |
| Checkout form | ✅ Working | `routes/checkout.tsx`. Asks for name, phone, address, city and district (checks only that each is filled in). Login is required |
| Order creation & confirmation | ⚠️ Partial | `server/routes/orders.js` saves to MySQL `Orders` + `Order_Items` and a `Payments` row (pending), clears the cart, then shows `ConfirmationModal` and redirects to `/orders`. Three gaps: the transaction is broken (see §9), there is no stock check, and no confirmation email |
| User accounts / login | ✅ Working (insecure) | `routes/login.tsx`, `register.tsx`, `profile.tsx`, `server/routes/auth.js`, `users.js`. Vendors have a separate login (`routes/store/index.tsx`, `server/routes/vendors.js`) |
| Admin panel | ⚠️ Partial | `routes/admin/*`, `server/routes/admin.js`. Working: dashboard charts, orders (approve/deny, assign delivery), deliveries, stores (approve/reject/edit), financials, product **view/delete**. **Admins cannot add or edit products** (vendors do that in `routes/store/products.tsx`). There is a category API but no UI for it, and `admin/settings.tsx` is "Under Construction" |
| Payments | ⚠️ Partial | `components/PaymentModal.tsx`, `checkout.tsx`. It only shows a USSD code with a **placeholder merchant number** (`61000000`/`62000000`). Nothing is verified; an admin marks the order "paid" by hand. No Stripe/PayPal |
| AI features | ❌ Missing | None. The wishlist "Recommended Products" (`routes/wishlist.tsx`) is just a same-category filter |
| Responsive / mobile | ⚠️ Partial | Shop, product, checkout and profile pages use Tailwind breakpoints. But `components/Header.tsx` has a fixed `w-[600px]` search bar and no breakpoints or mobile menu, so it overflows on phones. The admin/vendor `Sidebar` is hidden below `md` with no replacement, so there is no navigation on mobile |

## 5. DATABASE

- **Type:** MySQL (database name `Ashal_online_market`).
- **Connection:** `server/config/db.js` reads `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. No port setting, so it always uses 3306.
- **Schema:** `app/database/scheme.md` contains raw SQL. There are no migrations, and the file's first two lines have no semicolons, so it will fail if pasted as-is.

| Table | Main fields |
|---|---|
| Users | id, name, email (unique), password, phone, role (admin/vendor/customer) |
| Vendors | id, user_id→Users, email, password, store_name, description, country/city/district, logo_url, license_url, isVerified, status (pending/approved/rejected) |
| Categories | id, name, image_url |
| Products | id, vendor_id, category_id, name, price, description, image_urls (JSON), isFeatured, stock |
| Orders | id, customer_id, total, status, payment_status, shipping_address |
| Order_Items | order_id, product_id, quantity, price |
| Payments | order_id, amount, method (EVC plus/Edahab), status, phone_number |
| Carts / Cart_Items | customer_id; cart_id, product_id, quantity |
| Wishlists / Wishlist_Items | customer_id; wishlist_id, product_id |
| Reviews | product_id, customer_id, rating, comment |
| Payouts | vendor_id, order_id, amount, status (10% commission is applied on approval) |
| Deliveries | order_id, delivery_address, status, tracking_number |
| contact_messages | Optional, defined in `EMAIL_SETUP.md` |

- **Seed data:** `app/dummy-data/*.md` has 3 vendors, ~24 products, users, orders and more, but **it does not match the schema**. Products use `image_url`/`discount` (the schema has `image_urls`, no discount). Vendors use `location` and leave out the required `email`/`password`. Every user password is the literal string `'hashed_password'`, so no seeded account can log in. Image URLs point to `example.com`, so the seed data needs rewriting.

## 6. ENVIRONMENT & SECRETS

**No `.env` and no `.env.example` exist.** Variables the code reads:

| Variable | Used in | Required? |
|---|---|---|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | `server/config/db.js` | Yes |
| `JWT_SECRET` | `server/middleware/auth.js`, `routes/auth.js`, `routes/vendors.js` | Yes |
| `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` | `server/config/imagekit.js` | Yes, for adding products and vendor registration |
| `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD` | `server/routes/contact.js` | Only for the contact forms |

**Secret found on disk:** `server.log` contains a full `JWT_SECRET` value, printed by an earlier debug statement. The value is not repeated here.

## 7. HOW TO RUN LOCALLY

Prerequisites: Node 20+, MySQL 8, a free ImageKit account.

```bash
cd "ashal-main"
npm install                                   # node_modules is currently missing

# 1. Create the DB: run app/database/scheme.md in MySQL
#    (first add ';' after the CREATE DATABASE and USE lines)
mysql -u root -p < schema.sql                 # after saving scheme.md as schema.sql

# 2. Create .env in ashal-main/ with:
#    DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET,
#    IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT,
#    (optional) EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD

# 3. Terminal 1 — API on http://localhost:3001
npm run server

# 4. Terminal 2 — frontend on http://localhost:5173
npm run dev
```

**Missing before it will run:** `node_modules`, `.env`, a running MySQL server with the schema loaded, and working seed data. Register through the UI to get a usable account. An admin account has to be made by registering and then setting `role='admin'` in SQL. (Because of a bug, the API also accepts `role` from the register form; see §9.) I did not run a build, so whether `npm run typecheck` and `npm run build` pass is **unclear**.

## 8. DEPLOYMENT READINESS

**It can't go live as-is, but it can within a few hours.** Blockers:

1. **29 hardcoded `http://localhost:3001` URLs in 17 frontend files** (`app/api.ts`, `hooks/useCart.ts`, `useOrders.ts`, `useAdminOrders.ts`, `contact.tsx`, and others). Every API call breaks once deployed. Replace them with one `import.meta.env.VITE_API_URL` base.
2. **Two processes.** `npm start` serves only the SSR frontend, and the Dockerfile never starts `server.js`. You need two services (or a merged server).
3. **MySQL hosting.** Free options: Aiven MySQL (free tier), Railway MySQL (trial credit), or TiDB Cloud Serverless (MySQL-compatible).
4. **Table-name case mismatch.** The code queries both `vendors`/`Vendors` and `products`/`Products`. Windows MySQL is case-insensitive, but **Linux MySQL is case-sensitive by default**, so vendor and admin product queries will fail on most hosts unless names are unified.
5. **Port is hardcoded** (`const port = 3001`). Most hosts expect `process.env.PORT`.

**Best free fit:** **Render** or **Railway**. Run two web services from the same repo: the API (`node server.js`) and the frontend (`npm run build && npm start`), plus a hosted MySQL (Railway's built-in MySQL is the simplest single-dashboard option). Vercel/Netlify suit the frontend only, and the Express API plus SSR setup makes them awkward.

## 9. PROBLEMS FOUND (by severity)

**Critical**
1. **Privilege escalation on register.** `server/routes/auth.js` takes `role` from the request body, so anyone can register as `admin`.
2. **Profile update lets users change their role and stores plain-text passwords.** `server/routes/users.js` `PUT /me` allows the `role` and `password` fields and writes the password **without bcrypt**. After such an update the user can no longer log in (bcrypt compare fails), and the password sits in plain text.
3. **JWT secret leaked.** `server.log` holds the secret, written by a debug `console.log` that no longer exists in the code. Delete the log and rotate the secret.
4. **Vendor and user tokens are interchangeable.** Vendor tokens carry `{id: vendor.id}`, and vendor routes (`server/routes/vendors.js`) never check `role === 'vendor'`. A customer whose user id is 3 can manage vendor 3's products, and a vendor token can act as the user with the same id on cart, orders and profile.
5. **Vulnerable dependencies.** `npm audit` reports 23 issues (4 critical, 13 high), including `@react-router/node`/`react-router` (SSR XSS, open redirect), `proxy-addr`, `multer`, `mysql2`, `nodemailer`, `jws`, `body-parser` and `path-to-regexp`. Most are fixable with `npm audit fix` (minor bumps).

**High**
6. **Broken order transaction.** `orders.js` runs `START TRANSACTION`/`COMMIT` through the *pool* (`db.query`), and each call can use a different connection, so a failure can leave half-written orders. Use `db.getConnection()` as `admin.js` does.
7. **No stock check at order time.** Stock is only decremented when the admin approves, and it can go negative.
8. **Unauthenticated upload.** `POST /api/upload` has no auth and no file type or size limit, so anyone can upload to your ImageKit account.
9. **`GET /api/users` and the `/users` page** show every user's email and phone to **any logged-in user**. Admin checks are not enforced.
10. **HTML injection in emails.** `contact.js` inserts `senderName` and `message` into the HTML unescaped.
11. **Fake payments.** Placeholder merchant numbers, with nothing actually verified.

**Medium**
12. Hardcoded localhost URLs and port, and inconsistent table-name case (see §8).
13. The seed data doesn't match the schema, and the schema SQL has syntax errors.
14. `admin-contact` inserts into `contact_messages` without `vendor_id`, which is `NOT NULL`, so the insert always fails silently.
15. JWT is kept in `localStorage` (exposed to XSS). Vendor tokens expire after 1h and user tokens after 8h, with no refresh.
16. There is little input validation: no email format check on register, no password rules, and no type checks on price, stock or quantity.

**Low / dead code**
17. Unused: `app/config/database.ts`, `app/middleware/auth.js`, `app/welcome/`, `app/assets/data/products.json`, `categories.ts`, `remove-jsx-comments.js`, and `express.static('dist')` in `server.js` (the build outputs to `build/`).
18. `README.md` is the unchanged template, and branding is inconsistent ("Ashal" vs "Africa's Place").

## 10. QUICK WINS FOR TONIGHT

1. **Centralize the API URL (≈30 min).** Make `const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'` and replace all 29 hardcoded URLs. This is the biggest deployment blocker.
2. **Patch the critical security holes (≈30 min).** Force `role='customer'` on register. Remove `role` from `PUT /users/me` and bcrypt-hash `password`. Add `authenticateToken` to `/api/upload`. Add `isAdmin` to `GET /api/users`. Delete `server.log` and set a new `JWT_SECRET`.
3. **Make the DB portable and seedable (≈45 min).** Unify table names to the schema's casing. Fix the semicolons in `scheme.md`. Write one `seed.sql` with bcrypt-hashed demo users (admin, vendor, customer), 3 stores and about 15 products with real image URLs.
4. **Deploy (≈1 h).** Push to GitHub. On Railway or Render, create MySQL plus the API service (use `process.env.PORT`) and the frontend service with `VITE_API_URL` set. Run `npm audit fix` first.
5. **AI product description generator (≈45 min).** Add a "✨ Generate with AI" button to the vendor product form (`routes/store/products.tsx`/`ProductModal.tsx`). It calls a new `POST /api/ai/description` that sends name, category and price to an LLM API and returns a description. This is the easiest AI feature to demo.
6. **AI shopping-assistant chatbot (≈1 h).** Add a floating chat widget on the storefront. A `POST /api/ai/chat` endpoint loads the product catalog (name, price, category) into the system prompt and answers questions like "gifts under $50". This is the most impressive AI feature.
7. **AI review summary (≈30 min, optional).** On the product page, summarize all reviews into "Pros / Cons" with one LLM call, cached per product.
8. **Mobile header fix (≈20 min).** Change `w-[600px]` to `w-full max-w-xl`, hide secondary icons below `md`, and add a hamburger menu.

## 11. KEY FILES

| # | Path | Purpose |
|---|---|---|
| 1 | `server.js` | Express API entry point; mounts all `/api/*` routers |
| 2 | `server/config/db.js` | MySQL connection pool (env-based) |
| 3 | `server/routes/orders.js` | Order creation from the cart, history, cancellation, payment record |
| 4 | `server/routes/admin.js` | All admin endpoints: approvals, payouts, deliveries, dashboard stats |
| 5 | `server/routes/vendors.js` | Vendor registration and login, product CRUD with ImageKit uploads |
| 6 | `server/routes/auth.js` | Customer register and login (JWT) |
| 7 | `app/routes.ts` | Frontend route map (storefront, `/admin/*`, `/store/*`) |
| 8 | `app/routes/checkout.tsx` | Checkout form, USSD payment flow, order submission |
| 9 | `app/hooks/useCart.ts` + `useGuestCart.ts` | Cart logic for logged-in and guest users |
| 10 | `app/database/scheme.md` | The full SQL schema (the only DB definition) |

---

## Overall verdict

**About 65% of the way to a live, working e-commerce site.** The feature set is large for a student project: a real multi-vendor marketplace with customer, vendor and admin roles, a database-backed cart and wishlist, orders, reviews, payouts with a commission, delivery tracking and chart dashboards, and the code is cleanly organized into hooks and components. What holds it back is not missing features but **operations and security**. It has never been set up to run anywhere except `localhost` (29 hardcoded URLs, a hardcoded port, case-sensitive table names, two processes, no hosted DB), it has no working seed data or `.env.example`, it has several critical auth holes (self-assigned admin role, plain-text password updates, a leaked JWT secret, interchangeable vendor and user tokens), and payments are simulated. Each of these is a small, mechanical fix. A few hours on the URL refactor, security patches, a seed script and a Railway/Render deploy, plus one or two AI features, would make this a strong, live, demo-ready submission.
