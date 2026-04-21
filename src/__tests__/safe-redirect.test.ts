import { describe, expect, it } from 'vitest';

import { safeResolveNextUrl } from '@/lib/auth/safe-redirect';

describe('safeResolveNextUrl', () => {
  it('returns fallback for empty', () => {
    expect(safeResolveNextUrl(null, '/catalog')).toBe('/catalog');
    expect(safeResolveNextUrl('', '/catalog')).toBe('/catalog');
    expect(safeResolveNextUrl(undefined, '/catalog')).toBe('/catalog');
  });

  it('allows all first-party paths', () => {
    expect(safeResolveNextUrl('/cart', '/catalog')).toBe('/cart');
    expect(safeResolveNextUrl('/catalog', '/')).toBe('/catalog');
    expect(safeResolveNextUrl('/checkout', '/catalog')).toBe('/checkout');
    expect(safeResolveNextUrl('/', '/catalog')).toBe('/');
  });

  it('allows /confirmation and dynamic /confirmation/[orderId] paths', () => {
    expect(safeResolveNextUrl('/confirmation', '/catalog')).toBe(
      '/confirmation'
    );
    expect(safeResolveNextUrl('/confirmation/order-abc-123', '/catalog')).toBe(
      '/confirmation/order-abc-123'
    );
    expect(safeResolveNextUrl('/confirmation/ORDER_42', '/catalog')).toBe(
      '/confirmation/ORDER_42'
    );
  });

  it('rejects open redirects', () => {
    expect(safeResolveNextUrl('//evil.com', '/catalog')).toBe('/catalog');
    expect(safeResolveNextUrl('https://evil.com', '/catalog')).toBe('/catalog');
    expect(safeResolveNextUrl('/\\evil', '/catalog')).toBe('/catalog');
    expect(safeResolveNextUrl('http://localhost/catalog', '/catalog')).toBe(
      '/catalog'
    );
  });

  it('rejects disallowed paths', () => {
    expect(safeResolveNextUrl('/admin', '/catalog')).toBe('/catalog');
    expect(safeResolveNextUrl('/api/secret', '/catalog')).toBe('/catalog');
  });

  it('strips query and hash before validating, preserving the pathname', () => {
    expect(safeResolveNextUrl('/checkout?coupon=abc', '/catalog')).toBe(
      '/checkout'
    );
    expect(safeResolveNextUrl('/catalog#section', '/catalog')).toBe('/catalog');
  });
});
