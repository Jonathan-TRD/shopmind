'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button, FormAlert, FormField, Input } from '@/components/ui';
import { useCart } from '@/lib/cart/cart-provider';
import { checkoutShippingSchema } from '@/lib/checkout/schemas';
import { trpc } from '@/trpc/react';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

type FieldErrors = Partial<Record<'name' | 'email' | 'address', string>>;

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, itemCount, clearCart, isHydrated } = useCart();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = trpc.checkout.placeOrder.useMutation({
    onSuccess({ orderId }) {
      clearCart();
      router.push(`/confirmation/${orderId}`);
    },
    onError(err) {
      setSubmitError(err.message ?? 'Something went wrong. Please try again.');
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);

    const fd = new FormData(e.currentTarget);
    const raw = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      address: fd.get('address') as string,
    };

    const parsed = checkoutShippingSchema.safeParse(raw);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field) {
          errs[field] = issue.message;
        }
      }
      setFieldErrors(errs);
      return;
    }

    mutation.mutate({
      ...parsed.data,
      lines: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
    });
  }

  if (!isHydrated) {
    return <p className="text-muted">Loading…</p>;
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
    <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
      <div className="flex-1">
        <h2 className="mb-6 font-display text-xl font-light tracking-tight text-shopify-white">
          Shipping details
        </h2>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6"
        >
          {submitError ? (
            <FormAlert politeness="assertive">{submitError}</FormAlert>
          ) : null}

          <FormField
            label="Full name"
            htmlFor="checkout-name"
            error={fieldErrors.name}
          >
            <Input
              id="checkout-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={
                fieldErrors.name ? 'checkout-name-error' : undefined
              }
            />
          </FormField>

          <FormField
            label="Email address"
            htmlFor="checkout-email"
            error={fieldErrors.email}
          >
            <Input
              id="checkout-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={
                fieldErrors.email ? 'checkout-email-error' : undefined
              }
            />
          </FormField>

          <FormField
            label="Shipping address"
            htmlFor="checkout-address"
            error={fieldErrors.address}
          >
            <textarea
              id="checkout-address"
              name="address"
              rows={3}
              autoComplete="street-address"
              placeholder="123 Main St, City, Country"
              aria-invalid={!!fieldErrors.address}
              aria-describedby={
                fieldErrors.address ? 'checkout-address-error' : undefined
              }
              className="w-full resize-none rounded-lg border border-shade-70 bg-dark-forest px-4 py-3 text-base text-shopify-white placeholder-shade-50 transition-all duration-200 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            pending={mutation.isPending}
            disabled={mutation.isPending}
          >
            Place order
          </Button>
        </form>
      </div>
      <div className="w-full rounded-xl border border-border-card bg-dark-forest p-6 lg:w-80 lg:shrink-0">
        <h2 className="mb-4 font-display text-lg font-light tracking-tight text-shopify-white">
          Order summary
        </h2>
        <p className="mb-4 text-sm text-muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>

        <ul className="divide-y divide-border-card">
          {lines.map((line) => (
            <li key={line.productId} className="flex items-center gap-3 py-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-void">
                {line.imageUrl ? (
                  <Image
                    src={line.imageUrl}
                    alt={line.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-shopify-white">
                  {line.name}
                </p>
                <p className="text-xs text-muted">
                  {priceFormatter.format(line.unitPrice)} × {line.quantity}
                </p>
              </div>
              <span className="shrink-0 text-sm tabular-nums text-shopify-white">
                {priceFormatter.format(line.unitPrice * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-border-card pt-4">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium tabular-nums text-shopify-white">
            {priceFormatter.format(subtotal)}
          </span>
        </div>
        <p className="mt-2 text-xs text-shade-50">
          Taxes and shipping calculated at checkout.
        </p>
      </div>
    </div>
  );
}
