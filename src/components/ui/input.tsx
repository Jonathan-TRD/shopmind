import { forwardRef, type InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`
        w-full rounded-lg border border-shade-70 bg-dark-forest
        px-4 py-3 text-base text-shopify-white
        placeholder:text-shade-50
        transition-all duration-200
        focus-visible:outline-none
        focus-visible:border-accent
        focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-0
        disabled:cursor-not-allowed disabled:opacity-40
        ${className}
      `.trim()}
      {...props}
    />
  );
});
