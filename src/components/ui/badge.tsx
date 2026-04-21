import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Badge({ children, className = '', ...rest }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded px-2.5 py-1 text-xs font-normal uppercase tracking-[0.72px]
        bg-white/15 text-shopify-white backdrop-blur-sm
        ${className}
      `.trim()}
      {...rest}
    >
      {children}
    </span>
  );
}
