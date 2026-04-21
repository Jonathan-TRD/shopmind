import type { HTMLAttributes, ReactNode } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
};

export function Card({
  children,
  className = '',
  interactive = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-border-card bg-deep-teal
        shadow-(--shadow-card-rest)
        transition-[box-shadow,transform] duration-300 ease-out
        ${interactive ? 'hover:-translate-y-0.5 hover:shadow-(--shadow-card-high)' : ''}
        ${className}
      `.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
