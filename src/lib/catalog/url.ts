import {
  listProductsInputSchema,
  productCategorySchema,
} from '@/lib/products/schemas';

export const CATALOG_PAGE_SIZE = 12;

export function parseCatalogQuery(sp: URLSearchParams) {
  const categoryRaw = sp.get('category');
  let category: string | undefined;
  if (categoryRaw) {
    const parsed = productCategorySchema.safeParse(categoryRaw);
    if (parsed.success) {
      category = parsed.data;
    }
  }

  const qRaw = sp.get('q')?.slice(0, 120) ?? '';

  const pageRaw = sp.get('page');
  const pageParsed = pageRaw ? Number.parseInt(pageRaw, 10) : 1;

  const searchTrim = qRaw.trim();
  return listProductsInputSchema.parse({
    category,
    search: searchTrim === '' ? undefined : searchTrim,
    page: Number.isFinite(pageParsed) ? pageParsed : 1,
    pageSize: CATALOG_PAGE_SIZE,
  });
}

export function catalogHref(
  pathname: string,
  current: URLSearchParams,
  patch: Partial<{
    category: string | null;
    q: string | null;
    page: number | null;
  }>
): string {
  const next = new URLSearchParams(current.toString());

  if ('category' in patch) {
    const v = patch.category;
    if (v) {
      next.set('category', v);
    } else {
      next.delete('category');
    }
  }
  if ('q' in patch) {
    const v = patch.q;
    if (v) {
      next.set('q', v);
    } else {
      next.delete('q');
    }
  }
  if ('page' in patch) {
    const v = patch.page;
    if (v !== null && v !== undefined && v > 1) {
      next.set('page', String(v));
    } else {
      next.delete('page');
    }
  }

  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
