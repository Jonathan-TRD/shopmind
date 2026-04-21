'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  FormAlert,
  FormField,
  Pagination,
  ProductCard,
  Select,
} from '@/components/ui';
import {
  CATALOG_PAGE_SIZE,
  catalogHref,
  parseCatalogQuery,
} from '@/lib/catalog/url';
import { trpc } from '@/trpc/react';

import { CatalogUrlSearch } from './catalog-url-search';

function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border-card bg-deep-teal shadow-[var(--shadow-card-rest)]">
      <div className="aspect-[4/3] w-full animate-pulse bg-dark-forest" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="h-5 w-2/3 animate-pulse rounded bg-forest" />
          <div className="h-5 w-16 animate-pulse rounded bg-forest" />
        </div>
        <div className="h-4 w-full animate-pulse rounded bg-forest" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-forest" />
        <div className="mt-2 flex items-center justify-between border-t border-border-card pt-3">
          <div className="h-3.5 w-14 animate-pulse rounded bg-forest" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-forest" />
        </div>
      </div>
    </div>
  );
}

export function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paramsKey = searchParams.toString();
  const listInput = useMemo(
    () => parseCatalogQuery(new URLSearchParams(paramsKey)),
    [paramsKey]
  );

  const qFromUrl = searchParams.get('q') ?? '';
  const categoryValue = searchParams.get('category') ?? '';

  const { data, isPending, isError, error } = trpc.products.list.useQuery(
    listInput,
    { placeholderData: (prev) => prev }
  );

  const isEmpty = !isPending && data && data.items.length === 0;
  const showSkeletons = isPending && !data;

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-10 px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-5xl font-light leading-none tracking-tight text-shopify-white md:text-6xl">
          Catalog
        </h1>
        <p className="text-lg leading-relaxed text-muted">
          Browse and filter products. Filters stay in the URL so you can share
          exactly what you see.
        </p>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex-1">
          <FormField
            label="Category"
            htmlFor="catalog-category"
            hint="Filter by type"
          >
            <Select
              id="catalog-category"
              aria-label="Filter by category"
              value={categoryValue}
              onChange={(e) => {
                router.replace(
                  catalogHref(pathname, searchParams, {
                    category: e.target.value || null,
                    page: 1,
                  }),
                  { scroll: false }
                );
              }}
            >
              <option value="">All categories</option>
              <option value="apparel">Apparel</option>
              <option value="home">Home</option>
              <option value="outdoor">Outdoor</option>
              <option value="accessories">Accessories</option>
            </Select>
          </FormField>
        </div>
        <div className="flex-1">
          <CatalogUrlSearch
            key={qFromUrl}
            pathname={pathname}
            searchParams={searchParams}
            initialQ={qFromUrl}
          />
        </div>
      </div>
      {isError ? (
        <FormAlert politeness="assertive">
          {error.message || 'Something went wrong loading products.'}
        </FormAlert>
      ) : null}
      {showSkeletons ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <ProductSkeleton />
            </li>
          ))}
        </ul>
      ) : null}
      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border-card bg-deep-teal py-20 text-center shadow-(--shadow-card-rest)">
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
            <path
              d="M18 24h12M24 18v12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-lg text-muted">No products match your filters.</p>
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-sm text-shopify-white underline underline-offset-4 hover:text-muted"
          >
            Clear filters
          </button>
        </div>
      ) : null}
      {data && data.items.length > 0 ? (
        <>
          <p className="-mb-4 text-sm text-shade-50">
            {data.total} product{data.total !== 1 ? 's' : ''}
            {categoryValue ? ` in ${categoryValue}` : ''}
            {qFromUrl ? ` matching "${qFromUrl}"` : ''}
          </p>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          <Pagination
            page={listInput.page}
            pageSize={CATALOG_PAGE_SIZE}
            total={data.total}
            onPageChange={(p) => {
              router.replace(
                catalogHref(pathname, searchParams, {
                  page: p <= 1 ? null : p,
                }),
                { scroll: false }
              );
            }}
          />
        </>
      ) : null}
    </div>
  );
}
