'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthCard, Button, FormAlert, FormField, Input } from '@/components/ui';
import { signIn } from '@/lib/auth/actions';
import { signInSchema, type SignInInput } from '@/lib/auth/schemas';

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(values: SignInInput) {
    setServerError(null);

    const fd = new FormData();
    fd.append('email', values.email);
    fd.append('password', values.password);
    fd.append('next', nextPath);

    try {
      const result = await signIn(null, fd);
      if (result?.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof SignInInput, { message });
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
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </FormField>
        <Button type="submit" variant="primary" pending={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
