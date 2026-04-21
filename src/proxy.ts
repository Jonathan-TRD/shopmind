import { type NextRequest, NextResponse } from 'next/server';

import { safeResolveNextUrl } from '@/lib/auth/safe-redirect';
import {
  copyCookiesToResponse,
  redirectWithSession,
  updateSession,
} from '@/lib/supabase/proxy';

const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_PREFIXES = ['/checkout', '/confirmation'];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nextParam = request.nextUrl.searchParams.get('next');

  const { response: sessionResponse, user } = await updateSession(request);

  if (!user && isProtectedRoute(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    loginUrl.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookiesToResponse(sessionResponse, redirectResponse);
    return redirectResponse;
  }

  if (user && isAuthRoute(pathname)) {
    const dest = safeResolveNextUrl(nextParam, '/catalog');
    return redirectWithSession(request, sessionResponse, dest, '');
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
