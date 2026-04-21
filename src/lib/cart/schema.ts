import { z } from 'zod';

import { MAX_QTY_PER_LINE } from './constants';

export const cartLineSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().finite().nonnegative(),
  imageUrl: z.string().nullable(),
  quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
});

export const cartLinesSchema = z.array(cartLineSchema);
