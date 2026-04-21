import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full py-3 pl-4 pr-[26px] text-base font-normal transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:pointer-events-none disabled:opacity-40';

const variants: Record<Variant, string> = {
  primary:
    'border-2 border-transparent bg-shopify-white text-shopify-black hover:opacity-90 active:scale-[0.98]',
  secondary:
    'border-2 border-shopify-white bg-transparent text-shopify-white hover:bg-shopify-white hover:text-shopify-black active:scale-[0.98]',
};

const spinnerColors: Record<Variant, string> = {
  primary: 'text-shopify-black',
  secondary: 'text-shopify-white',
};

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  pending?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  pending = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? pending}
      aria-busy={pending}
      className={`${base} ${variants[variant]} ${pending ? spinnerColors[variant] : ''} ${className}`.trim()}
      {...rest}
    >
      {pending ? (
        <>
          <Spinner />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
