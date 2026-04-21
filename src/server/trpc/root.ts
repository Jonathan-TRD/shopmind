import { checkoutRouter } from './routers/checkout';
import { productsRouter } from './routers/products';
import { router } from './init';

export const appRouter = router({
  products: productsRouter,
  checkout: checkoutRouter,
});

export type AppRouter = typeof appRouter;
