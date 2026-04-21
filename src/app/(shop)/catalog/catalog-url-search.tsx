'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input, Label } from '@/components/ui';
import { catalogHref } from '@/lib/catalog/url';

const DEBOUNCE_MS = 280;

type CatalogUrlSearchProps = {
  pathname: string;
  searchParams: URLSearchParams;
  initialQ: string;
};

export function CatalogUrlSearch({
  pathname,
  searchParams,
  initialQ,
}: CatalogUrlSearchProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(draft), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [draft]);

  useEffect(() => {
    if (debounced === initialQ) {
      return;
    }
    router.replace(
      catalogHref(pathname, searchParams, {
        q: debounced || null,
        page: 1,
      }),
      { scroll: false }
    );
  }, [debounced, initialQ, pathname, router, searchParams]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="catalog-search">Search by name</Label>
      <Input
        id="catalog-search"
        type="search"
        name="q"
        autoComplete="off"
        placeholder="Search products…"
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, 120))}
        aria-describedby="catalog-search-hint"
      />
      <p id="catalog-search-hint" className="text-sm text-muted">
        Results update shortly after you stop typing.
      </p>
    </div>
  );
}
