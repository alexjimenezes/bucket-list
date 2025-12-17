import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'soft';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-[--radius-lg] transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          'active:scale-[0.97]',
          {
            // Primary - solid indigo
            'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-soft shadow-soft-sm':
              variant === 'primary',
            // Secondary - soft gray
            'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-soft-sm':
              variant === 'secondary',
            // Outline - bordered
            'border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300':
              variant === 'outline',
            // Ghost - minimal
            'text-gray-600 hover:bg-gray-100 hover:text-gray-900':
              variant === 'ghost',
            // Danger - red
            'bg-danger-500 text-white hover:bg-danger-600 shadow-soft-sm':
              variant === 'danger',
            // Gradient - playful gradient
            'bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 text-white hover:shadow-glow-primary hover:scale-[1.02]':
              variant === 'gradient',
            // Soft - pastel background
            'bg-pastel-purple text-primary-700 hover:bg-pastel-purple-dark':
              variant === 'soft',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-7 py-3.5 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
