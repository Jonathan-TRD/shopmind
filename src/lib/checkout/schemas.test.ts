import { describe, expect, it } from 'vitest';

import { MAX_QTY_PER_LINE } from '@/lib/cart/constants';

import {
  checkoutLineSchema,
  checkoutShippingSchema,
  placeOrderInputSchema,
  placeOrderOutputSchema,
} from './schemas';

const validShipping = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  address: '123 Main St, Springfield, US 12345',
};

const validLine = {
  productId: '123e4567-e89b-12d3-a456-426614174000',
  quantity: 2,
};

describe('checkoutShippingSchema', () => {
  it('accepts valid shipping details', () => {
    const result = checkoutShippingSchema.safeParse(validShipping);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = checkoutShippingSchema.safeParse({
      ...validShipping,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = checkoutShippingSchema.safeParse({
      ...validShipping,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty address', () => {
    const result = checkoutShippingSchema.safeParse({
      ...validShipping,
      address: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('checkoutLineSchema', () => {
  it('accepts valid line', () => {
    expect(checkoutLineSchema.safeParse(validLine).success).toBe(true);
  });

  it('rejects non-uuid productId', () => {
    expect(
      checkoutLineSchema.safeParse({ ...validLine, productId: 'not-a-uuid' })
        .success
    ).toBe(false);
  });

  it('rejects quantity 0', () => {
    expect(
      checkoutLineSchema.safeParse({ ...validLine, quantity: 0 }).success
    ).toBe(false);
  });

  it(`rejects quantity above ${MAX_QTY_PER_LINE}`, () => {
    expect(
      checkoutLineSchema.safeParse({
        ...validLine,
        quantity: MAX_QTY_PER_LINE + 1,
      }).success
    ).toBe(false);
  });

  it(`accepts quantity equal to ${MAX_QTY_PER_LINE}`, () => {
    expect(
      checkoutLineSchema.safeParse({ ...validLine, quantity: MAX_QTY_PER_LINE })
        .success
    ).toBe(true);
  });
});

describe('placeOrderInputSchema', () => {
  it('accepts valid full input', () => {
    const result = placeOrderInputSchema.safeParse({
      ...validShipping,
      lines: [validLine],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty lines array', () => {
    const result = placeOrderInputSchema.safeParse({
      ...validShipping,
      lines: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects when lines are missing', () => {
    const result = placeOrderInputSchema.safeParse({ ...validShipping });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email with multiple lines', () => {
    const result = placeOrderInputSchema.safeParse({
      ...validShipping,
      email: 'bad',
      lines: [
        validLine,
        { ...validLine, productId: '00000000-0000-0000-0000-000000000001' },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('placeOrderOutputSchema', () => {
  it('accepts valid uuid', () => {
    const result = placeOrderOutputSchema.safeParse({
      orderId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-uuid orderId', () => {
    const result = placeOrderOutputSchema.safeParse({ orderId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});
