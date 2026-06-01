import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

export function Button({ className, variant = 'primary', icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-teal-500 text-teal-900 hover:bg-teal-100',
        variant === 'secondary' && 'border border-teal-500 text-teal-700 hover:bg-teal-50 dark:text-teal-100 dark:hover:bg-teal-900/30',
        variant === 'ghost' && 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
        variant === 'danger' && 'bg-alert text-white hover:bg-red-800',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
