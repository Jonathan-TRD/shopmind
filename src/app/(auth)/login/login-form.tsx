'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { AuthCard, Button, FormAlert, FormField, Input } from '@/components/ui';
import { signIn, type AuthFormState } from '@/lib/auth/actions';

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signIn,
    null
  );

  return (
    <AuthCard
      title="Sign in"
      footer={
        <p className="text-center text-sm text-muted">
          No account?{' '}
          <Link
            href={`/signup?next=${encodeURIComponent(nextPath)}`}
            className="text-shopify-white underline underline-offset-4 hover:text-muted"
          >
            Create one
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
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={!!state?.fieldErrors?.password}
            aria-describedby={
              state?.fieldErrors?.password ? 'password-error' : undefined
            }
          />
        </FormField>
        <Button type="submit" variant="primary" pending={pending}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
