'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { AuthCard, Button, FormAlert, FormField, Input } from '@/components/ui';
import { signUp, type AuthFormState } from '@/lib/auth/actions';

type SignupFormProps = {
  nextPath: string;
};

export function SignupForm({ nextPath }: SignupFormProps) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    null
  );

  if (state?.success === 'email_confirmation') {
    return (
      <AuthCard title="Check your email">
        <p className="text-base leading-relaxed text-muted">
          We sent a confirmation link. After you confirm, you can sign in and
          continue to checkout.
        </p>
        <Link
          href="/login"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-shopify-white bg-transparent py-3 pl-4 pr-[26px] text-base font-normal text-shopify-white transition-all duration-200 hover:bg-shopify-white hover:text-shopify-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        >
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create account"
      footer={
        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="text-shopify-white underline underline-offset-4 hover:text-muted"
          >
            Sign in
          </Link>
        </p>
      }
    >
      {state?.error ? (
        <FormAlert politeness="assertive">{state.error}</FormAlert>
      ) : null}
      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="next" value={nextPath} />
        <FormField
          label="Email"
          htmlFor="email"
          error={state?.fieldErrors?.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!state?.fieldErrors?.email}
            aria-describedby={
              state?.fieldErrors?.email ? 'email-error' : undefined
            }
          />
        </FormField>
        <FormField
          label="Password"
          htmlFor="password"
          error={state?.fieldErrors?.password}
          hint="At least 6 characters (match your Supabase project policy)."
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={!!state?.fieldErrors?.password}
            aria-describedby={
              state?.fieldErrors?.password ? 'password-error' : undefined
            }
          />
        </FormField>
        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={state?.fieldErrors?.confirmPassword}
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={!!state?.fieldErrors?.confirmPassword}
            aria-describedby={
              state?.fieldErrors?.confirmPassword
                ? 'confirmPassword-error'
                : undefined
            }
          />
        </FormField>
        <Button type="submit" variant="primary" pending={pending}>
          Sign up
        </Button>
      </form>
    </AuthCard>
  );
}
