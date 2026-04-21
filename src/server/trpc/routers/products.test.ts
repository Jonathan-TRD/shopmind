import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';

import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

import { escapeIlikePattern } from '@/lib/products/schemas';

import { appRouter } from '../root';

const sampleRow = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  sku: 'SKU-1',
  name: 'Sample',
  description: null,
  price: 29.99,
  category: 'apparel',
  image_url: null,
  stock: 5,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

type RangeCapture = { from: number; to: number };
type EqCapture = { column: string; value: string };
type IlikeCapture = { column: string; pattern: string };

function createChainableBuilder(opts: {
  data?: unknown[];
  error?: { message: string } | null;
  count?: number | null;
  onRange?: (range: RangeCapture) => void;
  onEq?: (eq: EqCapture) => void;
  onIlike?: (ilike: IlikeCapture) => void;
}) {
  const builder: {
    select: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    ilike: ReturnType<typeof vi.fn>;
    range: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    ilike: vi.fn(),
    range: vi.fn(),
  };

  builder.select.mockImplementation(() => builder);
  builder.order.mockImplementation(() => builder);
  builder.eq.mockImplementation((column: string, value: string) => {
    opts.onEq?.({ column, value });
    return builder;
  });
  builder.ilike.mockImplementation((column: string, pattern: string) => {
    opts.onIlike?.({ column, pattern });
    return builder;
  });
  builder.range.mockImplementation((from: number, to: number) => {
    opts.onRange?.({ from, to });
    return Promise.resolve({
      data: opts.data ?? [],
      error: opts.error ?? null,
      count: opts.count ?? 0,
    });
  });

  return builder;
}

function createMockSupabase(
  builder: ReturnType<typeof createChainableBuilder>
) {
  return {
    from: vi.fn(() => builder),
  } as unknown as SupabaseClient<Database>;
}

describe('products.list', () => {
  it('calls range for page 2 and pageSize 12', async () => {
    let captured: RangeCapture | undefined;
    const builder = createChainableBuilder({
      data: [sampleRow],
      count: 5,
      onRange: (r) => {
        captured = r;
      },
    });
    const supabase = createMockSupabase(builder);
    const caller = appRouter.createCaller({ supabase });

    const result = await caller.products.list({
      page: 2,
      pageSize: 12,
    });

    expect(captured).toEqual({ from: 12, to: 23 });
    expect(result.total).toBe(5);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe('Sample');
    expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('products');
    expect(builder.select).toHaveBeenCalledWith('*', { count: 'exact' });
    expect(builder.order).toHaveBeenCalledWith('name', { ascending: true });
  });

  it('applies category eq and escaped ilike for search', async () => {
    let eqCapture: EqCapture | undefined;
    let ilikeCapture: IlikeCapture | undefined;
    const search = '100%';
    const builder = createChainableBuilder({
      data: [sampleRow],
      count: 1,
      onEq: (e) => {
        eqCapture = e;
      },
      onIlike: (i) => {
        ilikeCapture = i;
      },
    });
    const caller = appRouter.createCaller({
      supabase: createMockSupabase(builder),
    });

    await caller.products.list({
      page: 1,
      pageSize: 12,
      category: 'home',
      search,
    });

    expect(eqCapture).toEqual({ column: 'category', value: 'home' });
    expect(ilikeCapture?.column).toBe('name');
    expect(ilikeCapture?.pattern).toBe(`%${escapeIlikePattern(search)}%`);
  });

  it('throws TRPCError when Supabase returns error', async () => {
    const builder = createChainableBuilder({
      error: { message: 'boom' },
      data: undefined,
      count: null,
    });
    const caller = appRouter.createCaller({
      supabase: createMockSupabase(builder),
    });

    await expect(
      caller.products.list({ page: 1, pageSize: 12 })
    ).rejects.toThrow(TRPCError);

    try {
      await caller.products.list({ page: 1, pageSize: 12 });
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect((e as TRPCError).code).toBe('INTERNAL_SERVER_ERROR');
      expect((e as TRPCError).message).toBe('Could not load products.');
    }
  });
});
