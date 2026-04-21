import type { ReactNode } from 'react';

import { Label } from './label';

export type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? (
          <p id={hintId} className="text-xs text-shade-50">
            {hint}
          </p>
        ) : null}
      </div>
      {children}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-shopify-white/75"
        >
          <span
            className="inline-block size-1 flex-shrink-0 rounded-full bg-shopify-white/50"
            aria-hidden="true"
          />
          {error}
        </p>
      ) : null}
    </div>
  );
}
