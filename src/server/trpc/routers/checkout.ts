import { TRPCError } from '@trpc/server';

import {
  placeOrderInputSchema,
  placeOrderOutputSchema,
} from '@/lib/checkout/schemas';
import { getPaymentAdapter } from '@/lib/payments';
import type { Json } from '@/types/database';
import type { OrderLineItem } from '@/types/domain';

import { protectedProcedure, router } from '../init';

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export const checkoutRouter = router({
  placeOrder: protectedProcedure
    .input(placeOrderInputSchema)
    .output(placeOrderOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      const mergedMap = new Map<string, number>();
      for (const line of input.lines) {
        mergedMap.set(
          line.productId,
          (mergedMap.get(line.productId) ?? 0) + line.quantity
        );
      }
      const mergedLines = Array.from(mergedMap.entries()).map(
        ([productId, quantity]) => ({ productId, quantity })
      );

      const productIds = mergedLines.map((l) => l.productId);
      const { data: products, error: productError } = await ctx.supabase
        .from('products')
        .select('id, sku, name, price, stock')
        .in('id', productIds);

      if (productError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not load product details.',
        });
      }

      const productMap = new Map((products ?? []).map((p) => [p.id, p]));

      const orderItems: OrderLineItem[] = [];
      for (const line of mergedLines) {
        const product = productMap.get(line.productId);
        if (!product) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Product not found: ${line.productId}`,
          });
        }
        if (product.stock < line.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient stock for "${product.name}" (requested ${line.quantity}, available ${product.stock}).`,
          });
        }
        orderItems.push({
          product_id: product.id,
          sku: product.sku,
          name: product.name,
          quantity: line.quantity,
          unit_price: product.price,
        });
      }

      const total = roundMoney(
        orderItems.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0
        )
      );

      const idempotencyKey = `${user.id}:${productIds.sort().join(',')}`;
      await getPaymentAdapter().authorizePayment({
        amount: total,
        currency: 'USD',
        idempotencyKey,
      });

      const { data: orderId, error: rpcError } = await ctx.supabase.rpc(
        'create_order',
        {
          p_items: orderItems as unknown as Json,
          p_total: total,
          p_name: input.name,
          p_email: input.email,
          p_address: input.address,
        }
      );

      if (rpcError) {
        const message = rpcError.message ?? '';
        if (/not authenticated/i.test(message)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Not authenticated.',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not place order. Please try again.',
        });
      }

      if (!orderId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Order was not created.',
        });
      }

      return { orderId };
    }),
});
