import { TRPCError } from '@trpc/server';

import {
  escapeIlikePattern,
  listProductsInputSchema,
  listProductsOutputSchema,
  productSchema,
} from '@/lib/products/schemas';

import { publicProcedure, router } from '../init';

export const productsRouter = router({
  list: publicProcedure
    .input(listProductsInputSchema)
    .output(listProductsOutputSchema)
    .query(async ({ ctx, input }) => {
      const search =
        input.search === undefined || input.search === ''
          ? undefined
          : input.search.trim() || undefined;

      let query = ctx.supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true });

      if (input.category) {
        query = query.eq('category', input.category);
      }
      if (search) {
        query = query.ilike('name', `%${escapeIlikePattern(search)}%`);
      }

      const from = (input.page - 1) * input.pageSize;
      const to = from + input.pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not load products.',
        });
      }

      const rows = data ?? [];
      const items = rows.map((row) => productSchema.parse(row));

      return {
        items,
        total: count ?? 0,
      };
    }),
});
