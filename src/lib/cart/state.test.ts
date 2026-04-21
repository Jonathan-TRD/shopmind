import { describe, expect, it } from 'vitest';

import { MAX_QTY_PER_LINE } from './constants';
import {
  addOrIncrementLine,
  clearLines,
  deserializeCartLines,
  normalizeLines,
  parseCartLines,
  removeLine,
  setLineQuantity,
} from './state';
import type { CartLine, CartPayload } from './types';

const base: CartPayload = {
  productId: '123e4567-e89b-12d3-a456-426614174000',
  sku: 'SKU-1',
  name: 'Test Product',
  unitPrice: 29.99,
  imageUrl: null,
};

const line = (qty: number): CartLine => ({ ...base, quantity: qty });

describe('addOrIncrementLine', () => {
  it('appends a new line with quantity 1', () => {
    const result = addOrIncrementLine([], base);
    expect(result).toHaveLength(1);
    expect(result[0]?.quantity).toBe(1);
  });

  it('increments an existing line', () => {
    const result = addOrIncrementLine([line(2)], base);
    expect(result[0]?.quantity).toBe(3);
  });

  it('caps at MAX_QTY_PER_LINE', () => {
    const result = addOrIncrementLine([line(MAX_QTY_PER_LINE)], base);
    expect(result[0]?.quantity).toBe(MAX_QTY_PER_LINE);
  });

  it('respects stock when provided', () => {
    const result = addOrIncrementLine([line(2)], base, 2);
    expect(result[0]?.quantity).toBe(2);
  });

  it('caps new line at 1 even when stock is tight', () => {
    const result = addOrIncrementLine([], base, 3);
    expect(result[0]?.quantity).toBe(1);
  });

  it('does not add line when stock is 0', () => {
    const result = addOrIncrementLine([], base, 0);
    expect(result).toHaveLength(0);
  });
});

describe('setLineQuantity', () => {
  it('sets quantity within bounds', () => {
    const result = setLineQuantity([line(1)], base.productId, 3);
    expect(result[0]?.quantity).toBe(3);
  });

  it('clamps to 1 minimum', () => {
    const result = setLineQuantity([line(3)], base.productId, 0);
    expect(result[0]?.quantity).toBe(1);
  });

  it('clamps to MAX_QTY_PER_LINE', () => {
    const result = setLineQuantity([line(1)], base.productId, 99);
    expect(result[0]?.quantity).toBe(MAX_QTY_PER_LINE);
  });

  it('respects stock cap', () => {
    const result = setLineQuantity([line(1)], base.productId, 5, 2);
    expect(result[0]?.quantity).toBe(2);
  });
});

describe('removeLine', () => {
  it('removes the matching line', () => {
    const result = removeLine([line(1)], base.productId);
    expect(result).toHaveLength(0);
  });

  it('leaves other lines untouched', () => {
    const other: CartLine = {
      productId: '00000000-0000-0000-0000-000000000001',
      sku: 'SKU-2',
      name: 'Other',
      unitPrice: 10,
      imageUrl: null,
      quantity: 1,
    };
    const result = removeLine([line(1), other], base.productId);
    expect(result).toHaveLength(1);
    expect(result[0]?.productId).toBe(other.productId);
  });
});

describe('clearLines', () => {
  it('returns an empty array', () => {
    expect(clearLines()).toEqual([]);
  });
});

describe('normalizeLines', () => {
  it('drops lines with quantity < 1', () => {
    const invalid = { ...base, quantity: 0 };
    expect(normalizeLines([invalid])).toHaveLength(0);
  });

  it('clamps quantity to MAX_QTY_PER_LINE', () => {
    const over = { ...base, quantity: 99 };
    const result = normalizeLines([over]);
    expect(result[0]?.quantity).toBe(MAX_QTY_PER_LINE);
  });
});

describe('parseCartLines', () => {
  it('accepts valid array', () => {
    const valid = [{ ...base, quantity: 1 }];
    expect(parseCartLines(valid)).toHaveLength(1);
  });

  it('returns [] for invalid shape', () => {
    expect(parseCartLines([{ foo: 'bar' }])).toEqual([]);
    expect(parseCartLines(null)).toEqual([]);
    expect(parseCartLines(undefined)).toEqual([]);
    expect(parseCartLines('not-json')).toEqual([]);
  });
});

describe('deserializeCartLines', () => {
  it('parses valid JSON string', () => {
    const json = JSON.stringify([{ ...base, quantity: 2 }]);
    const result = deserializeCartLines(json);
    expect(result[0]?.quantity).toBe(2);
  });

  it('returns [] for invalid JSON', () => {
    expect(deserializeCartLines('{{invalid')).toEqual([]);
  });

  it('returns [] for JSON with wrong shape', () => {
    expect(deserializeCartLines(JSON.stringify([{ bad: true }]))).toEqual([]);
  });
});
