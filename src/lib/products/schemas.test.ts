import { describe, expect, it } from 'vitest';

import {
  escapeIlikePattern,
  listProductsInputSchema,
  listProductsOutputSchema,
  productSchema,
} from './schemas';

describe('escapeIlikePattern', () => {
  it('escapes percent, underscore, and backslash', () => {
    expect(escapeIlikePattern('100%')).toBe('100\\%');
    expect(escapeIlikePattern('a_b')).toBe('a\\_b');
    expect(escapeIlikePattern('a\\b')).toBe('a\\\\b');
  });

  it('handles combined special characters', () => {
    expect(escapeIlikePattern('%_%\\')).toBe('\\%\\_\\%\\\\');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeIlikePattern('hello')).toBe('hello');
    expect(escapeIlikePattern('')).toBe('');
  });
});

describe('listProductsInputSchema', () => {
  it('applies default page and pageSize when omitted', () => {
    const result = listProductsInputSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(12);
  });

  it('normalizes invalid page to 1', () => {
    expect(listProductsInputSchema.parse({ page: 0 }).page).toBe(1);
    expect(listProductsInputSchema.parse({ page: -3 }).page).toBe(1);
    expect(listProductsInputSchema.parse({ page: Number.NaN }).page).toBe(1);
    expect(listProductsInputSchema.parse({ page: '0' }).page).toBe(1);
  });

  it('accepts valid page from string coercion', () => {
    expect(listProductsInputSchema.parse({ page: '3' }).page).toBe(3);
  });

  it('caps pageSize at 48', () => {
    expect(listProductsInputSchema.parse({ pageSize: 999 }).pageSize).toBe(48);
  });

  it('accepts optional category and search', () => {
    const result = listProductsInputSchema.parse({
      category: 'home',
      search: 'mug',
      page: 2,
      pageSize: 24,
    });
    expect(result).toMatchObject({
      category: 'home',
      search: 'mug',
      page: 2,
      pageSize: 24,
    });
  });

  it('rejects invalid category', () => {
    const result = listProductsInputSchema.safeParse({
      category: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects search longer than 120 characters', () => {
    const result = listProductsInputSchema.safeParse({
      search: 'x'.repeat(121),
    });
    expect(result.success).toBe(false);
  });
});

describe('productSchema', () => {
  const validRow = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sku: 'SKU-1',
    name: 'Test Product',
    description: 'A product',
    price: 29.99,
    category: 'apparel',
    image_url: null,
    stock: 10,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
  };

  it('parses a valid row', () => {
    const parsed = productSchema.parse(validRow);
    expect(parsed.name).toBe('Test Product');
    expect(parsed.price).toBe(29.99);
    expect(parsed.description).toBe('A product');
  });

  it('coerces price from string', () => {
    const parsed = productSchema.parse({
      ...validRow,
      price: '19.5',
    });
    expect(parsed.price).toBe(19.5);
  });

  it('rejects invalid uuid', () => {
    const result = productSchema.safeParse({
      ...validRow,
      id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('listProductsOutputSchema', () => {
  it('accepts empty items', () => {
    const parsed = listProductsOutputSchema.parse({ items: [], total: 0 });
    expect(parsed.items).toEqual([]);
    expect(parsed.total).toBe(0);
  });

  it('accepts non-empty items', () => {
    const item = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sku: 'SKU-1',
      name: 'X',
      description: null,
      price: 1,
      category: 'home',
      image_url: null,
      stock: 1,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    const parsed = listProductsOutputSchema.parse({ items: [item], total: 1 });
    expect(parsed.items).toHaveLength(1);
    expect(parsed.total).toBe(1);
  });
});
