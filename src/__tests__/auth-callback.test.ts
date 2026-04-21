import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mock @supabase/ssr so we don't need a real DB connection
// ---------------------------------------------------------------------------
const mockExchangeCodeForSession = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}));

// Stub env helpers so the module loads without real env vars
vi.mock('@/lib/supabase/env', () => ({
  supabaseUrl: () => 'https://fake.supabase.co',
  supabaseAnonKey: () => 'fake-anon-key',
}));

// ---------------------------------------------------------------------------
// Import route handler after mocks are established
// ---------------------------------------------------------------------------
import { GET } from '@/app/auth/callback/route';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when no code is present', async () => {
    const req = makeRequest('http://localhost:3000/auth/callback');
    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/login');
    expect(location).not.toContain('error=');
  });

  it('redirects to /login?error=auth when exchangeCodeForSession fails', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      error: { message: 'invalid code' },
    });
    const req = makeRequest(
      'http://localhost:3000/auth/callback?code=bad-code'
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/login');
    expect(location).toContain('error=auth');
  });

  it('redirects to /catalog when exchange succeeds and next is absent', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const req = makeRequest(
      'http://localhost:3000/auth/callback?code=valid-code'
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/catalog');
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-code');
  });

  it('redirects to safe next when exchange succeeds', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const req = makeRequest(
      'http://localhost:3000/auth/callback?code=valid-code&next=/checkout'
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/checkout');
  });

  it('redirects to /catalog when next is disallowed', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const req = makeRequest(
      'http://localhost:3000/auth/callback?code=valid-code&next=/admin'
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/catalog');
    expect(location).not.toContain('/admin');
  });
});
