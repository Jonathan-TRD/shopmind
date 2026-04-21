import { z } from 'zod';

export const productCategorySchema = z.enum([
  'apparel',
  'home',
  'outdoor',
  'accessories',
]);

export type ProductCategoryInput = z.infer<typeof productCategorySchema>;

export function escapeIlikePattern(raw: string): string {
  return raw.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export const productSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.coerce.number(),
  category: z.string(),
  image_url: z.string().nullable(),
  stock: z.coerce.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const listProductsOutputSchema = z.object({
  items: z.array(productSchema),
  total: z.number().int().min(0),
});

function parsePositiveInt(
  val: unknown,
  fallback: number,
  opts: { max?: number } = {}
): number {
  if (val === undefined || val === null || val === '') {
    return fallback;
  }
  const n = typeof val === 'number' ? val : Number.parseInt(String(val), 10);
  if (!Number.isFinite(n) || n < 1) {
    return fallback;
  }
  if (opts.max !== undefined) {
    return Math.min(opts.max, n);
  }
  return n;
}

export const listProductsInputSchema = z.object({
  category: productCategorySchema.optional(),
  search: z.string().max(120).optional(),
  page: z.preprocess(
    (val) => parsePositiveInt(val, 1),
    z.number().int().min(1)
  ),
  pageSize: z.preprocess(
    (val) => parsePositiveInt(val, 12, { max: 48 }),
    z.number().int().min(1).max(48)
  ),
});

export type ListProductsInput = z.infer<typeof listProductsInputSchema>;
export type ListProductsOutput = z.infer<typeof listProductsOutputSchema>;
export type ProductDTO = z.infer<typeof productSchema>;
