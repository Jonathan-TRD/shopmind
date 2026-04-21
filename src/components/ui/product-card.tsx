import Image from 'next/image';

import type { ProductDTO } from '@/lib/products/schemas';

import { Badge } from './badge';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export type ProductCardProps = {
  product: ProductDTO;
};

export function ProductCard({ product }: ProductCardProps) {
  const { name, description, price, category, image_url, stock } = product;
  const outOfStock = stock === 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border-card bg-deep-teal shadow-(--shadow-card-rest) transition-all duration-300 ease-out hover:-translate-y-1 hover:border-shade-70 hover:shadow-(--shadow-card-high)">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-dark-forest">
        {image_url ? (
          <>
            <Image
              src={image_url}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-deep-teal/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              fill="none"
              className="size-12 text-shade-70"
              aria-hidden="true"
            >
              <rect
                x="6"
                y="10"
                width="36"
                height="28"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="17"
                cy="20"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M6 32l10-8 8 6 6-5 12 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-void/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-border-card bg-deep-teal/90 px-4 py-1.5 text-xs uppercase tracking-[0.72px] text-muted">
              Out of stock
            </span>
          </div>
        ) : null}
        <div className="absolute left-3 top-3">
          <Badge>{category}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-light leading-snug tracking-tight text-shopify-white md:text-xl">
            {name}
          </h2>
          <span className="shrink-0 font-medium tabular-nums text-shopify-white">
            {priceFormatter.format(price)}
          </span>
        </div>
        {description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between border-t border-border-card pt-3">
          {outOfStock ? (
            <Badge className="bg-white/10 text-shade-50">Unavailable</Badge>
          ) : stock <= 5 ? (
            <Badge className="border border-accent/40 bg-accent/15 text-accent">
              Only {stock} left
            </Badge>
          ) : (
            <Badge className="bg-white/10 text-muted">In stock</Badge>
          )}

          <button
            type="button"
            disabled={outOfStock}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-shopify-white/20 bg-shopify-white/5 px-3 text-xs text-shopify-white transition-all duration-200 hover:border-shopify-white/60 hover:bg-shopify-white hover:text-shopify-black disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-deep-teal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-3.5"
              aria-hidden="true"
            >
              <path d="M2.5 3.5a.5.5 0 0 1 1 0V12a.5.5 0 0 1-1 0V3.5ZM4 3.5A.5.5 0 0 1 4.5 3h8a.5.5 0 0 1 .354.854l-2 2a.5.5 0 0 1-.708 0L9.207 4.914 7.854 6.268a.5.5 0 0 1-.708 0L5.707 4.914 4.5 6.121V12a.5.5 0 0 1-1 0V3.5Z" />
              <path d="M2 13.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Z" />
            </svg>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
