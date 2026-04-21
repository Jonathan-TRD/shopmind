import { forwardRef, type SelectHTMLAttributes } from 'react';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className = '', children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`
          w-full cursor-pointer appearance-none rounded-lg border border-shade-70
          bg-dark-forest px-4 py-3 text-base text-shopify-white
          transition-all duration-200
          focus-visible:outline-none focus-visible:border-accent
          focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-0
          disabled:cursor-not-allowed disabled:opacity-40
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </select>
    );
  }
);
