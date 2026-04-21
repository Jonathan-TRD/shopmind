import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/database';
import { safeResolveNextUrl } from '@/lib/auth/safe-redirect';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/env';

/**
 * Email confirmation / magic-link return URL (`signUp` uses `emailRedirectTo`).
 * If email confirmation is disabled locally, this route is rarely hit.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const nextRaw = searchParams.get('next');

  if (!code) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  const dest = safeResolveNextUrl(nextRaw, '/catalog');
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = dest;
  redirectUrl.search = '';
  redirectUrl.hash = '';

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient<Database>(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const failUrl = request.nextUrl.clone();
    failUrl.pathname = '/login';
    failUrl.search = '';
    failUrl.searchParams.set('error', 'auth');
    return NextResponse.redirect(failUrl);
  }

  return response;
}
