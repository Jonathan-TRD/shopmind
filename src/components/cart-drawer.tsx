'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useCart } from '@/lib/cart/cart-provider';
import { MAX_QTY_PER_LINE } from '@/lib/cart/constants';

import { Button } from './ui/button';
import { Drawer } from './ui/drawer';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { lines, subtotal, setQuantity, removeItem, clearCart } = useCart();

  return (
    <Drawer open={open} onClose={onClose} title="Your cart">
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-16 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-12 text-shade-70"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="text-muted">Your cart is empty.</p>
          <Button variant="secondary" onClick={onClose}>
            Continue shopping
          </Button>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-border-card px-5">
            {lines.map((line) => (
              <li key={line.productId} className="flex gap-3 py-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-dark-forest">
                  {line.imageUrl ? (
                    <Image
                      src={line.imageUrl}
                      alt={line.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-sm font-medium text-shopify-white">
                    {line.name}
                  </p>
                  <p className="text-xs text-muted">
                    {priceFormatter.format(line.unitPrice)} each
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={line.quantity <= 1}
                      onClick={() =>
                        setQuantity(line.productId, line.quantity - 1)
                      }
                      className="flex size-6 items-center justify-center rounded border border-shade-70 text-sm text-shopify-white transition-colors hover:border-shopify-white disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm tabular-nums text-shopify-white">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={line.quantity >= MAX_QTY_PER_LINE}
                      onClick={() =>
                        setQuantity(line.productId, line.quantity + 1)
                      }
                      className="flex size-6 items-center justify-center rounded border border-shade-70 text-sm text-shopify-white transition-colors hover:border-shopify-white disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between">
                  <span className="text-sm font-medium tabular-nums text-shopify-white">
                    {priceFormatter.format(line.unitPrice * line.quantity)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => removeItem(line.productId)}
                    className="text-xs text-red-400 underline underline-offset-2 transition-colors hover:text-shopify-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-border-card px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="font-medium tabular-nums text-shopify-white">
                {priceFormatter.format(subtotal)}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-transparent bg-shopify-white py-3 pl-4 pr-[26px] text-base font-normal text-shopify-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal"
              >
                View full cart
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="text-sm text-shade-50 underline underline-offset-2 transition-colors hover:text-shopify-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                Clear cart
              </button>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
