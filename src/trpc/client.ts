import { createTRPCClient, httpBatchLink } from '@trpc/client';

import type { AppRouter } from '@/server/trpc/root';

export function createTrpcClient(opts: { url: string }) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: opts.url,
      }),
    ],
  });
}
