import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-150 w-225 rounded-full bg-forest opacity-30 blur-[160px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-1 flex-col justify-center px-4 py-24 md:px-16 md:py-32">
        <p className="mb-8 text-xs uppercase tracking-[0.72px] text-muted">
          Commerce on a dark canvas
        </p>
        <h1 className="font-display max-w-4xl text-6xl font-light leading-none tracking-tight text-shopify-white md:text-8xl">
          Everything you
          <br />
          need to shop.
        </h1>
        <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted md:text-xl">
          Browse the catalog, build your cart, and check out when you are ready.
          {!user ? ' Sign in to complete a purchase.' : null}
        </p>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/catalog"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-transparent bg-shopify-white py-3 pl-5 pr-[26px] text-base text-shopify-black transition-opacity hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
          >
            Shop catalog
          </Link>
          <Link
            href="/cart"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-shopify-white bg-transparent py-3 pl-5 pr-[26px] text-base text-shopify-white transition-colors hover:bg-shopify-white hover:text-shopify-black active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
          >
            {user ? 'Continue to cart' : 'View cart'}
          </Link>
        </div>
        <div className="mt-20 flex flex-wrap gap-12 border-t border-border-card pt-10 md:gap-20">
          {[
            { label: 'Products', value: '200+' },
            { label: 'Categories', value: '4' },
            { label: 'Fast checkout', value: '1-click' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-display text-4xl font-light text-shopify-white md:text-5xl">
                {value}
              </p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
