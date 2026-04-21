// 'use server' in the source file is fine — Vitest strips directive-like
// comments before module evaluation, so this import works without extra config.
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { signIn, signUp, signOut } from './actions';

// ---------------------------------------------------------------------------
// Sentinel class so we can assert redirect() calls in the same control flow
// as the real next/navigation redirect (which also throws internally).
// ---------------------------------------------------------------------------
class RedirectError extends Error {
  constructor(public readonly url: string) {
    super(`Redirect to: ${url}`);
    this.name = 'RedirectError';
  }
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new RedirectError(url);
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockAuth = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: mockAuth })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    fd.append(k, v);
  }
  return fd;
}

import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// signIn
// ---------------------------------------------------------------------------
describe('signIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fieldErrors when email is invalid', async () => {
    const fd = makeFormData({ email: 'not-an-email', password: 'secret123' });
    const result = await signIn(null, fd);
    expect(result?.fieldErrors?.email).toBeDefined();
    expect(mockAuth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('returns fieldErrors when password is empty', async () => {
    const fd = makeFormData({ email: 'user@example.com', password: '' });
    const result = await signIn(null, fd);
    expect(result?.fieldErrors?.password).toBeDefined();
    expect(mockAuth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('returns mapped error when Supabase rejects credentials', async () => {
    mockAuth.signInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'wrongpass',
    });
    const result = await signIn(null, fd);
    expect(result?.error).toBe('Invalid email or password.');
  });

  it('redirects to /catalog when next is missing', async () => {
    mockAuth.signInWithPassword.mockResolvedValueOnce({ error: null });
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'secret123',
    });
    let caught: unknown;
    try {
      await signIn(null, fd);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(RedirectError);
    expect((caught as RedirectError).url).toBe('/catalog');
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('redirects to safe next when provided', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({ error: null });
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'secret123',
      next: '/checkout',
    });
    try {
      await signIn(null, fd);
    } catch (e) {
      expect((e as RedirectError).url).toBe('/checkout');
    }
  });

  it('redirects to /catalog when next is disallowed', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({ error: null });
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'secret123',
      next: '/admin',
    });
    try {
      await signIn(null, fd);
    } catch (e) {
      expect((e as RedirectError).url).toBe('/catalog');
    }
  });
});

// ---------------------------------------------------------------------------
// signUp
// ---------------------------------------------------------------------------
describe('signUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fieldErrors when email is invalid', async () => {
    const fd = makeFormData({
      email: 'bad-email',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    const result = await signUp(null, fd);
    expect(result?.fieldErrors?.email).toBeDefined();
    expect(mockAuth.signUp).not.toHaveBeenCalled();
  });

  it('returns fieldErrors when passwords do not match', async () => {
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'different',
    });
    const result = await signUp(null, fd);
    expect(result?.fieldErrors?.confirmPassword).toBe('Passwords do not match');
  });

  it('returns mapped error when Supabase rejects', async () => {
    mockAuth.signUp.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'User already registered' },
    });
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    const result = await signUp(null, fd);
    expect(result?.error).toBe('An account with this email already exists.');
  });

  it('returns email_confirmation when session is null (confirmation required)', async () => {
    mockAuth.signUp.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    const result = await signUp(null, fd);
    expect(result?.success).toBe('email_confirmation');
  });

  it('redirects to /catalog when session is present and next is missing', async () => {
    mockAuth.signUp.mockResolvedValue({
      data: { session: { access_token: 'tok' } },
      error: null,
    });
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    try {
      await signUp(null, fd);
    } catch (e) {
      expect((e as RedirectError).url).toBe('/catalog');
    }
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('uses NEXT_PUBLIC_SITE_URL for emailRedirectTo when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    mockAuth.signUp.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    await signUp(null, fd);
    expect(mockAuth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: 'https://example.com/auth/callback',
        }),
      })
    );
    vi.unstubAllEnvs();
  });

  it('falls back to localhost for emailRedirectTo when env is unset', async () => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    mockAuth.signUp.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    const fd = makeFormData({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    await signUp(null, fd);
    expect(mockAuth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        }),
      })
    );
  });
});

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------
describe('signOut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls signOut, revalidates, and redirects to /login', async () => {
    mockAuth.signOut.mockResolvedValueOnce({});
    try {
      await signOut();
    } catch (e) {
      expect((e as RedirectError).url).toBe('/login');
    }
    expect(mockAuth.signOut).toHaveBeenCalled();
    expect(revalidatePath as Mock).toHaveBeenCalledWith('/', 'layout');
  });
});
