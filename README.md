# Goo Amrutham Milk — React + Supabase

A production-oriented customer ordering frontend for **Goo Amrutham Milk** with Supabase Auth, PostgreSQL, Row Level Security and Realtime order tracking.

## Stack

- React + Vite
- React Router
- Bootstrap / React Bootstrap
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security (RLS)
- Supabase Realtime
- WhatsApp order handoff

Supabase is used for real customer accounts, shared order history and server-side order totals. RLS keeps customer data isolated while allowing administrators to manage the business dashboard. Supabase Realtime is used to refresh order status changes without a page refresh.

## 1. Create Supabase project

Create a project in Supabase, then open **SQL Editor** and run:

`supabase/schema.sql`

The SQL creates:

- `profiles`
- `products`
- `orders`
- `order_items`
- `order_status_history`
- secure order-creation and status-update functions
- RLS policies
- auth profile trigger
- Realtime publication entries

## 2. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then add your project URL and publishable/anon key from **Supabase Dashboard → Project Settings → API**.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Never put a Supabase `service_role`/secret key in this React app.

## 3. Install and run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## 4. Create the admin account

1. Register an account from the website using the email you want to use as admin.
2. In Supabase SQL Editor, run:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL';
```

3. Sign out and sign back in. The **Admin** menu will appear.

Do not put an admin password or service key in frontend source code.

## 5. WhatsApp

The checkout currently opens WhatsApp for the configured business number after an order is successfully created. Change `WA_NUMBER` in `src/pages/Checkout.jsx` and `src/components/WhatsAppButton.jsx` if your business number changes.

## 6. Deployment

This is a Vite SPA. It can be deployed to Vercel, Netlify, Cloudflare Pages or any static host that supports SPA fallback. Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in the hosting dashboard.

## Security notes

- Customer passwords are handled by Supabase Auth; the app never stores passwords in the browser database.
- RLS limits profiles, orders, items and tracking history to the signed-in customer or an admin.
- Order totals and delivery fees are calculated in a Supabase database function instead of trusting prices sent by the browser.
- Admin status changes go through a protected database function.
- The browser only uses the Supabase publishable/anon key.

## Included brand assets

The uploaded Goo Amrutham logo, milk bottle images, field imagery, family imagery and posters are included under `src/assets/images/`.
