import type { LabelHTMLAttributes, ReactNode } from 'react';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

export function Label({ className = '', children, ...rest }: LabelProps) {
  return (
    <label
      className={`block text-xs font-normal uppercase tracking-[0.72px] text-muted ${className}`.trim()}
      {...rest}
    >
      {children}
    </label>
  );
}
