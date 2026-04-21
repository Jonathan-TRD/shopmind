import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export async function createTRPCContext(): Promise<{
  supabase: SupabaseClient<Database>;
}> {
  const supabase = await createClient();
  return { supabase };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
