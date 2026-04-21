import type { ReactNode } from 'react';

export type FormAlertProps = {
  children: ReactNode;
  politeness?: 'polite' | 'assertive';
};

export function FormAlert({ children, politeness = 'polite' }: FormAlertProps) {
  return (
    <div
      role="alert"
      aria-live={politeness}
      className="flex items-start gap-3 rounded-lg border border-border-card bg-forest px-4 py-3 text-sm text-shopify-white ring-1 ring-inset ring-shopify-white/5"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="mt-px size-4 flex-shrink-0 text-muted"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}
