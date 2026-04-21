import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { CartHeaderControls } from './cart-header-controls';
import { UserMenu } from './user-menu';

function getInitials(email: string): string {
  const local = email.split('@')[0] ?? email;
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border-card bg-forest/80 px-4 py-4 md:px-16">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-wide text-shopify-white hover:opacity-80"
        >
          Shopmind
        </Link>
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <Link
            href="/catalog"
            className="text-base font-medium tracking-wide text-shopify-white hover:text-muted"
          >
            Catalog
          </Link>
          <CartHeaderControls />
          {user ? (
            <>
              <Link
                href="/checkout"
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-transparent bg-shopify-white px-5 py-2 text-sm font-normal text-shopify-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
              >
                Checkout
              </Link>
              <UserMenu
                initials={getInitials(user.email ?? 'U')}
                email={user.email ?? ''}
              />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-base font-medium tracking-wide text-shopify-white hover:text-muted"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-shopify-white bg-transparent px-5 py-2 text-sm font-normal text-shopify-white transition-colors hover:bg-shopify-white hover:text-shopify-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
