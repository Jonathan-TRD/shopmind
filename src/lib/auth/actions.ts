'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

import { mapSupabaseAuthMessage } from './map-auth-message';
import { safeResolveNextUrl } from './safe-redirect';
import { signInSchema, signUpSchema } from './schemas';

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: 'email_confirmation';
} | null;

function publicOrigin(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    return site.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

function flattenZodFieldErrors(
  issues: { path: PropertyKey[]; message: string }[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = signInSchema.safeParse({
    email: typeof raw.email === 'string' ? raw.email : '',
    password: typeof raw.password === 'string' ? raw.password : '',
  });

  if (!parsed.success) {
    return {
      fieldErrors: flattenZodFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapSupabaseAuthMessage(error.message) };
  }

  revalidatePath('/', 'layout');
  const nextRaw = formData.get('next');
  const dest = safeResolveNextUrl(
    typeof nextRaw === 'string' ? nextRaw : null,
    '/catalog'
  );
  redirect(dest);
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const parsed = signUpSchema.safeParse({
    email: typeof raw.email === 'string' ? raw.email : '',
    password: typeof raw.password === 'string' ? raw.password : '',
    confirmPassword:
      typeof raw.confirmPassword === 'string' ? raw.confirmPassword : '',
  });

  if (!parsed.success) {
    return {
      fieldErrors: flattenZodFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createClient();
  const origin = publicOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: mapSupabaseAuthMessage(error.message) };
  }

  if (data.session) {
    revalidatePath('/', 'layout');
    const nextRaw = formData.get('next');
    const dest = safeResolveNextUrl(
      typeof nextRaw === 'string' ? nextRaw : null,
      '/catalog'
    );
    redirect(dest);
  }

  return { success: 'email_confirmation' };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
