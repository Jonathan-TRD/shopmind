'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useCart } from '@/lib/cart/cart-provider';
import { MAX_QTY_PER_LINE } from '@/lib/cart/constants';
import { Badge } from '@/components/ui/badge';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function CartPageContent() {
  const {
    lines,
    subtotal,
    itemCount,
    setQuantity,
    removeItem,
    clearCart,
    isHydrated,
  } = useCart();

  if (!isHydrated) {
    return <p className="text-muted">Loading cart…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6">
        <p className="text-lg text-muted">Your cart is empty.</p>
        <Link
          href="/catalog"
          className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-shopify-white bg-transparent px-5 py-2 text-sm text-shopify-white transition-colors hover:bg-shopify-white hover:text-shopify-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        >
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
          <button
            type="button"
            onClick={clearCart}
            className="text-sm text-shade-50 underline underline-offset-2 transition-colors hover:text-shopify-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            Clear cart
          </button>
        </div>

        <ul className="divide-y divide-border-card">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-4 py-5">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-dark-forest">
                {line.imageUrl ? (
                  <Image
                    src={line.imageUrl}
                    alt={line.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : null}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="font-medium text-shopify-white">{line.name}</p>
                <p className="text-sm text-muted">
                  {priceFormatter.format(line.unitPrice)} each
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={line.quantity <= 1}
                    onClick={() =>
                      setQuantity(line.productId, line.quantity - 1)
                    }
                    className="flex size-7 items-center justify-center rounded-full border border-shade-70 text-shopify-white transition-colors hover:border-shopify-white disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    −
                  </button>
                  <span className="min-w-[1.5rem] text-center tabular-nums text-shopify-white">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={line.quantity >= MAX_QTY_PER_LINE}
                    onClick={() =>
                      setQuantity(line.productId, line.quantity + 1)
                    }
                    className="flex size-7 items-center justify-center rounded-full border border-shade-70 text-shopify-white transition-colors hover:border-shopify-white disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    +
                  </button>
                  {line.quantity >= MAX_QTY_PER_LINE ? (
                    <Badge className="bg-white/10 text-muted">Max qty</Badge>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end justify-between">
                <span className="font-medium tabular-nums text-shopify-white">
                  {priceFormatter.format(line.unitPrice * line.quantity)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${line.name}`}
                  onClick={() => removeItem(line.productId)}
                  className="text-sm text-shade-50 underline underline-offset-2 transition-colors hover:text-shopify-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full rounded-xl border border-border-card bg-dark-forest p-6 lg:w-80 lg:shrink-0">
        <h2 className="mb-4 font-display text-lg font-light tracking-tight text-shopify-white">
          Order summary
        </h2>
        <div className="flex items-center justify-between border-t border-border-card pt-4">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium tabular-nums text-shopify-white">
            {priceFormatter.format(subtotal)}
          </span>
        </div>
        <p className="mt-2 text-xs text-shade-50">
          Taxes and shipping calculated at checkout.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/checkout"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-transparent bg-shopify-white py-3 pl-4 pr-[26px] text-base font-normal text-shopify-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-forest"
          >
            Proceed to checkout
          </Link>
          <Link
            href="/catalog"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-shopify-white bg-transparent py-3 pl-4 pr-[26px] text-base text-shopify-white transition-colors hover:bg-shopify-white hover:text-shopify-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-forest"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
