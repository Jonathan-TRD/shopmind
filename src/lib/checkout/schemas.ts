import { z } from 'zod';

import { MAX_QTY_PER_LINE } from '@/lib/cart/constants';

export const checkoutShippingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Enter a valid email address').max(254),
  address: z.string().min(1, 'Address is required').max(500),
});

export const checkoutLineSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(MAX_QTY_PER_LINE, `Quantity cannot exceed ${MAX_QTY_PER_LINE}`),
});

export const placeOrderInputSchema = checkoutShippingSchema.extend({
  lines: z.array(checkoutLineSchema).min(1, 'Cart cannot be empty'),
});

export const placeOrderOutputSchema = z.object({
  orderId: z.string().uuid(),
});

export type CheckoutShipping = z.infer<typeof checkoutShippingSchema>;
export type CheckoutLine = z.infer<typeof checkoutLineSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;
export type PlaceOrderOutput = z.infer<typeof placeOrderOutputSchema>;
