import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'group';
}

function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-gray-100 text-gray-600': variant === 'default',
          'bg-primary-100 text-primary-700': variant === 'primary',
          'bg-success-100 text-success-700': variant === 'success',
          'bg-accent-100 text-accent-700': variant === 'warning',
          'bg-blue-100 text-blue-700': variant === 'group',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
