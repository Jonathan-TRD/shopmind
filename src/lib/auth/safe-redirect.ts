const ALLOWED_PREFIXES = [
  '/catalog',
  '/cart',
  '/checkout',
  '/confirmation',
] as const;

function isAllowedPath(pathname: string): boolean {
  if (pathname === '/') {
    return true;
  }
  return ALLOWED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function safeResolveNextUrl(
  raw: string | null | undefined,
  fallback: string
): string {
  if (raw == null || raw === '') {
    return fallback;
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }
  if (trimmed.includes('\\') || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    return fallback;
  }
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
    return fallback;
  }

  let pathname = trimmed;
  const q = pathname.indexOf('?');
  const h = pathname.indexOf('#');
  if (q !== -1) {
    pathname = pathname.slice(0, q);
  }
  if (h !== -1 && (q === -1 || h < q)) {
    pathname = pathname.slice(0, h);
  }

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return fallback;
  }

  if (!pathname.startsWith('/') || pathname.startsWith('//')) {
    return fallback;
  }

  if (!isAllowedPath(pathname)) {
    return fallback;
  }

  return pathname;
}
