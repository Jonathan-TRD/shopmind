import Link from 'next/link';

import { Button } from '@/components/ui';
import { signOut } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-8 px-4 py-16 md:px-16">
      <h1 className="font-display text-4xl font-light text-shopify-white md:text-5xl">
        Cart
      </h1>
      <p className="max-w-xl text-lg text-muted">
        Cart placeholder. Signed-in shoppers can continue to checkout.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-shopify-white bg-transparent py-3 pl-4 pr-[26px] text-base text-shopify-white transition-all hover:bg-shopify-white hover:text-shopify-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        >
          Continue shopping
        </Link>
        <Link
          href="/checkout"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-transparent bg-shopify-white py-3 pl-4 pr-[26px] text-base font-normal text-shopify-black transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        >
          Checkout
        </Link>
      </div>
      {user ? (
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      ) : null}
    </div>
  );
}
