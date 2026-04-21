import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import type { User } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

import { supabaseAnonKey, supabaseUrl } from './env';

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}

export function copyCookiesToResponse(
  from: NextResponse,
  to: NextResponse
): void {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value, c);
  });
}

export function redirectWithSession(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
  search = ''
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  if (search.startsWith('?')) {
    url.search = search;
  } else if (search) {
    url.search = `?${search}`;
  } else {
    url.search = '';
  }
  const redirectResponse = NextResponse.redirect(url);
  copyCookiesToResponse(sessionResponse, redirectResponse);
  return redirectResponse;
}
