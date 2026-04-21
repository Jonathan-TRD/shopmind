# Shopmind

Shopmind is a small e-commerce demo built with **Next.js 16** (App Router), **React 19**, **Supabase** (Postgres + Auth), and **tRPC**. It includes a product catalog, a client-side cart persisted in `localStorage`, email/password auth, checkout with a pluggable payment adapter (mock by default), and order creation through a Supabase RPC.

## Stack

- **Framework:** Next.js 16, TypeScript, Tailwind CSS v4
- **Data & auth:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **API:** tRPC 11 + TanStack React Query
- **Validation:** Zod
- **Tests:** Vitest

## How to run the project

### Prerequisites

- **Node.js** 20+ (recommended)
- **npm** (or your preferred package manager)
- A **Supabase** project (cloud) or **Supabase CLI** for a local database

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy [.env.example](.env.example) to `.env.local` and set:

| Variable                        | Purpose                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key                                                |
| `NEXT_PUBLIC_SITE_URL`          | Site origin (e.g. `http://localhost:3000`) for server-side tRPC URL resolution |

### 3. Database (Supabase)

Apply the SQL in [supabase/migrations/20260421002155_init_schema.sql](supabase/migrations/20260421002155_init_schema.sql) to your Supabase database (SQL Editor, or local CLI workflow).

Optionally load sample products from [supabase/seed.sql](supabase/seed.sql).

If you use the **Supabase CLI** locally:

```bash
npx supabase start
npx supabase db reset   # applies migrations and runs seed when configured
```

Adjust your `.env.local` to match the local Supabase URL and anon key the CLI prints.

### 4. Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run build`         | Production build          |
| `npm run start`         | Start production server   |
| `npm run lint`          | ESLint (with `--fix`)     |
| `npm run format`        | Prettier                  |
| `npm test`              | Vitest (watch)            |
| `npm run test:coverage` | Vitest once with coverage |

## SQL schema

The canonical definition lives in:

**[supabase/migrations/20260421002155_init_schema.sql](supabase/migrations/20260421002155_init_schema.sql)**

### Overview

**`public.products`**

| Column                     | Type          | Notes                                    |
| -------------------------- | ------------- | ---------------------------------------- |
| `id`                       | `uuid`        | Primary key, default `gen_random_uuid()` |
| `sku`                      | `text`        | Unique                                   |
| `name`, `description`      | `text`        | `description` nullable                   |
| `price`                    | `numeric`     | `>= 0`                                   |
| `category`                 | `text`        | App categories (e.g. apparel, home)      |
| `image_url`                | `text`        | Nullable                                 |
| `stock`                    | `integer`     | `>= 0`, default 100                      |
| `created_at`, `updated_at` | `timestamptz` | Maintained; `updated_at` via trigger     |

**`public.orders`**

| Column                     | Type          | Notes                                                                   |
| -------------------------- | ------------- | ----------------------------------------------------------------------- |
| `id`                       | `uuid`        | Primary key                                                             |
| `user_id`                  | `uuid`        | FK → `auth.users(id)`                                                   |
| `name`, `email`, `address` | `text`        | Shipping / contact                                                      |
| `items`                    | `jsonb`       | Line items (e.g. `product_id`, `sku`, `name`, `quantity`, `unit_price`) |
| `total`                    | `numeric`     | `>= 0`                                                                  |
| `status`                   | `text`        | Default `'pending'`                                                     |
| `created_at`, `updated_at` | `timestamptz` | Same trigger pattern as products                                        |

**Row Level Security**

- `products`: `SELECT` allowed for `anon` and `authenticated`.
- `orders`: `SELECT` for `authenticated` where `auth.uid() = user_id`.
- **`INSERT` on `orders` is revoked** from clients; orders are created only through **`public.create_order(...)`** (security definer), granted `EXECUTE` to `authenticated`.

**`public.create_order(p_items jsonb, p_total numeric, p_name text, p_email text, p_address text)`**

- Uses `auth.uid()`; raises if unauthenticated.
- Inserts one row into `orders` and returns the new `id` (`uuid`).

**Triggers**

- `set_updated_at()` keeps `updated_at` current on `products` and `orders`.

For the full DDL (indexes, policies, grants, function body), open the migration file linked above.

## Architectural decisions

- **Design patterns** The payment layer uses the _Adapter pattern_, and the cart module uses the _Command pattern_.
- **Order creation** Orders are created through a PostgreSQL function rather than direct inserts, improving API security.
- **Cart lives in localStorage** Cart state is managed client-side using React Context, backed by localStorage.
  What would I do differently with more time

## What would I do differently with more time

- **Implement more design patterns** I would add patterns like the Repository pattern to wrap all Supabase queries.
- **E2E test with playwright** I’d test critical flows such as add to cart → login → checkout → confirmation.
- **Add AI coding guidelines** Create custom skills or Cursor rules to work more effectively with AI tools.
- **Sync cart to Supabase** Persist the cart across devices.
