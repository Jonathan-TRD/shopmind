'use client';

import { CartProvider } from '@/lib/cart/cart-provider';
import { TRPCProvider } from '@/trpc/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <CartProvider>{children}</CartProvider>
    </TRPCProvider>
  );
}
