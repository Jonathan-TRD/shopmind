import { productsRouter } from './routers/products';
import { router } from './init';

export const appRouter = router({
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
