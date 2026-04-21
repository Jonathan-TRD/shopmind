'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthCard, Button, FormAlert, FormField, Input } from '@/components/ui';
import { signUp } from '@/lib/auth/actions';
import { signUpSchema, type SignUpInput } from '@/lib/auth/schemas';

type SignupFormProps = {
  nextPath: string;
};

export function SignupForm({ nextPath }: SignupFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailConfirmation, setEmailConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(values: SignUpInput) {
    setServerError(null);

    const fd = new FormData();
    fd.append('email', values.email);
    fd.append('password', values.password);
    fd.append('confirmPassword', values.confirmPassword);
    fd.append('next', nextPath);

    try {
      const result = await signUp(null, fd);
      if (result?.success === 'email_confirmation') {
        setEmailConfirmation(true);
        return;
      }
      if (result?.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof SignUpInput, { message });
        }
      }
      if (result?.error) {
        setServerError(result.error);
      }
    } catch (e) {
      if (isRedirectError(e)) {
        throw e;
      }
      setServerError('Something went wrong. Please try again.');
    }
  }

  if (emailConfirmation) {
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
      {serverError ? (
        <FormAlert politeness="assertive">{serverError}</FormAlert>
      ) : null}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-6"
      >
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </FormField>
        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 6 characters (match your Supabase project policy)."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </FormField>
        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? 'confirmPassword-error' : undefined
            }
            {...register('confirmPassword')}
          />
        </FormField>
        <Button type="submit" variant="primary" pending={isSubmitting}>
          Sign up
        </Button>
      </form>
    </AuthCard>
  );
}
