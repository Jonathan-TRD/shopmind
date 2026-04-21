# Shopmind architecture

Shopmind is a Next.js 16 App Router application. Every inbound request passes through an auth/session proxy layer (`src/proxy.ts`) before reaching route handlers or pages. In Next.js 16, data fetching uses tRPC over HTTP, backed by a Supabase Postgres database; the client-side cart is persisted in `localStorage` only.

```mermaid
flowchart TB

  subgraph Client_Browser [Client — Browser]
    direction TB
    UI[React pages\nApp Router client components]
    Providers[TRPCProvider + CartProvider]
    Hooks["trpc.* hooks / useCart"]
    LS[(localStorage\ncart state)]

    UI --> Providers
    Providers --> Hooks
    UI --> LS
  end

  subgraph NextJS_Layer [Next.js 16 — Server]
    direction TB
    ProxyAuth["proxy.ts\n(Next.js 16 Proxy — replaces middleware.ts)\nupdateSession · route protection\n/checkout /confirmation → /login\n/login /signup → /catalog if authed"]
    AppRoutes[App Router\nRSC pages + client pages]
    TRPCRoute["API route\n/api/trpc"]
    AuthCallback["Auth callback\n/auth/callback/route.ts"]
    ServerActions["Server actions\nauth/actions.ts\nsignIn · signUp · signOut"]

    ProxyAuth --> AppRoutes
    AppRoutes --> TRPCRoute
    AppRoutes --> AuthCallback
    AppRoutes --> ServerActions
  end

  subgraph TRPC_Routers [tRPC Routers]
    direction TB
    Context["createTRPCContext\nSupabase server client"]
    Products["products.list\n(publicProcedure)"]
    Checkout["checkout.placeOrder\n(protectedProcedure)"]

    Context --> Products
    Context --> Checkout
  end

  subgraph Adapters [Adapters]
    direction TB
    PayAdapter["getPaymentAdapter()\nMockPaymentAdapter\n— swap point for real PSP —"]
  end

  subgraph SupabaseCloud [Supabase]
    direction TB
    SupaAuth[Auth\nauth.users · cookies]
    Postgres[(Postgres\nproducts · orders)]
    RPC["RPC create_order\nSECURITY DEFINER"]

    Postgres --> RPC
  end

  %% External edges
  Client_Browser -->|"HTTP (cookies)"| ProxyAuth
  ProxyAuth -->|"session cookies"| SupaAuth
  TRPCRoute --> Context
  TRPC_Routers -->|"select · in()"| Postgres
  Checkout -->|"authorizePayment"| PayAdapter
  Checkout -->|"rpc create_order"| RPC
  ServerActions -->|"signIn · signUp · signOut"| SupaAuth
  AuthCallback -->|"exchangeCodeForSession"| SupaAuth
```

## Notes

- **Cart state** lives entirely in the browser (`localStorage` key `shopmind-cart-v1`). It is never sent to the server except as part of a `checkout.placeOrder` mutation.
- **Order creation** goes exclusively through the `create_order` Postgres function (security definer). Direct `INSERT` on `orders` is revoked for all client roles.
- **Prices and stock** are re-validated server-side inside `checkout.placeOrder` — cart line prices are snapshotted at add-time and may differ from current catalog values.
- **`MockPaymentAdapter`** always authorizes. Replace `getPaymentAdapter()` in [`src/lib/payments/index.ts`](src/lib/payments/index.ts) to wire a real payment provider.
- **`proxy.ts`** — is the network boundary entry point picked up automatically by the framework on every request. It refreshes the Supabase session cookie (keeps JWTs alive), guards `/checkout` and `/confirmation` behind auth, and redirects already-signed-in users away from `/login` and `/signup`.
