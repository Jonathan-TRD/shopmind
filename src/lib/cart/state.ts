import { MAX_QTY_PER_LINE } from './constants';
import { cartLinesSchema } from './schema';
import type { CartLine, CartPayload } from './types';

export function clampQty(qty: number, stock?: number): number {
  const max =
    stock !== undefined ? Math.min(MAX_QTY_PER_LINE, stock) : MAX_QTY_PER_LINE;
  return Math.max(1, Math.min(qty, Math.max(1, max)));
}

export function normalizeLines(lines: CartLine[]): CartLine[] {
  return lines
    .filter((l) => l.quantity >= 1)
    .map((l) => ({ ...l, quantity: clampQty(l.quantity) }));
}

export function addOrIncrementLine(
  lines: CartLine[],
  payload: CartPayload,
  stock?: number
): CartLine[] {
  if (stock !== undefined && stock <= 0) {
    return lines;
  }
  const max =
    stock !== undefined ? Math.min(MAX_QTY_PER_LINE, stock) : MAX_QTY_PER_LINE;
  const idx = lines.findIndex((l) => l.productId === payload.productId);

  if (idx === -1) {
    return [...lines, { ...payload, quantity: 1 }];
  }

  const current = lines[idx]!;
  const next = Math.min(current.quantity + 1, max);
  if (next === current.quantity) {
    return lines;
  }

  return lines.map((l, i) => (i === idx ? { ...l, quantity: next } : l));
}

export function setLineQuantity(
  lines: CartLine[],
  productId: string,
  qty: number,
  stock?: number
): CartLine[] {
  return lines.map((l) =>
    l.productId === productId ? { ...l, quantity: clampQty(qty, stock) } : l
  );
}

export function removeLine(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((l) => l.productId !== productId);
}

export function clearLines(): CartLine[] {
  return [];
}

export function parseCartLines(raw: unknown): CartLine[] {
  const parsed = cartLinesSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export function serializeCartLines(lines: CartLine[]): string {
  return JSON.stringify(lines);
}

export function deserializeCartLines(json: string): CartLine[] {
  try {
    return parseCartLines(JSON.parse(json) as unknown);
  } catch {
    return [];
  }
}
