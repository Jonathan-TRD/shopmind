import { TRPCError, initTRPC } from '@trpc/server';

import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const {
    data: { user },
  } = await ctx.supabase.auth.getUser();

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated.',
    });
  }

  return next({ ctx: { ...ctx, user } });
});
