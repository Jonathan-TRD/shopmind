import type { ReactNode } from 'react';

export type AuthCardProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <div className="auth-card w-full max-w-md rounded-2xl border border-border-card bg-deep-teal px-8 py-10">
      <h1 className="font-display mb-8 text-4xl font-light leading-none tracking-tight text-shopify-white md:text-5xl">
        {title}
      </h1>
      <div className="flex flex-col gap-5">{children}</div>
      {footer ? (
        <div className="mt-8 border-t border-border-card pt-6 text-sm text-muted">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
