import { describe, expect, it } from 'vitest';

import { CATALOG_PAGE_SIZE, catalogHref, parseCatalogQuery } from './url';

describe('parseCatalogQuery', () => {
  it('returns defaults when no params', () => {
    const sp = new URLSearchParams();
    const result = parseCatalogQuery(sp);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(CATALOG_PAGE_SIZE);
    expect(result.category).toBeUndefined();
    expect(result.search).toBeUndefined();
  });

  it('parses valid category', () => {
    const sp = new URLSearchParams('category=apparel');
    const result = parseCatalogQuery(sp);
    expect(result.category).toBe('apparel');
  });

  it('drops invalid category', () => {
    const sp = new URLSearchParams('category=not-a-category');
    const result = parseCatalogQuery(sp);
    expect(result.category).toBeUndefined();
  });

  it('trims q and omits empty search', () => {
    expect(
      parseCatalogQuery(new URLSearchParams('q=%20%20')).search
    ).toBeUndefined();
    expect(parseCatalogQuery(new URLSearchParams('q=++mug++')).search).toBe(
      'mug'
    );
  });

  it('truncates q to 120 characters before parse', () => {
    const long = 'x'.repeat(130);
    const sp = new URLSearchParams();
    sp.set('q', long);
    const result = parseCatalogQuery(sp);
    expect(result.search?.length).toBe(120);
  });

  it('parses page and normalizes invalid page via schema', () => {
    expect(parseCatalogQuery(new URLSearchParams('page=2')).page).toBe(2);
    expect(parseCatalogQuery(new URLSearchParams('page=0')).page).toBe(1);
    expect(parseCatalogQuery(new URLSearchParams('page=abc')).page).toBe(1);
  });
});

describe('catalogHref', () => {
  it('sets category, q, and page', () => {
    const href = catalogHref('/catalog', new URLSearchParams(), {
      category: 'home',
      q: 'lamp',
      page: 2,
    });
    expect(href).toBe('/catalog?category=home&q=lamp&page=2');
  });

  it('removes page when patch sets page to 1 or null', () => {
    const current = new URLSearchParams('category=apparel&page=3');
    expect(catalogHref('/catalog', current, { page: 1 })).toBe(
      '/catalog?category=apparel'
    );
    expect(catalogHref('/catalog', current, { page: null })).toBe(
      '/catalog?category=apparel'
    );
  });

  it('deletes category and q when patched to null', () => {
    const current = new URLSearchParams('category=apparel&q=tee');
    expect(catalogHref('/catalog', current, { category: null })).toBe(
      '/catalog?q=tee'
    );
    expect(catalogHref('/catalog', current, { q: null })).toBe(
      '/catalog?category=apparel'
    );
  });

  it('preserves unrelated params when patching one field', () => {
    const current = new URLSearchParams(
      'category=apparel&q=tee&page=2&foo=bar'
    );
    const href = catalogHref('/catalog', current, { page: 3 });
    const next = new URLSearchParams(href.split('?')[1] ?? '');
    expect(next.get('category')).toBe('apparel');
    expect(next.get('q')).toBe('tee');
    expect(next.get('page')).toBe('3');
    expect(next.get('foo')).toBe('bar');
  });

  it('returns pathname only when query is empty', () => {
    expect(catalogHref('/catalog', new URLSearchParams(), {})).toBe('/catalog');
  });
});
