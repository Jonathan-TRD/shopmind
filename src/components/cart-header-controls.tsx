'use client';

import { useState } from 'react';

import { useCart } from '@/lib/cart/cart-provider';

import { CartDrawer } from './cart-drawer';

export function CartHeaderControls() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <button
        type="button"
        aria-label={
          itemCount > 0 ? `Shopping cart, ${itemCount} items` : 'Shopping cart'
        }
        onClick={() => setOpen(true)}
        className="relative flex size-10 items-center justify-center rounded-full text-shopify-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>

        {itemCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-medium leading-none text-shopify-black"
          >
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        ) : null}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
