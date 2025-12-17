import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 text-base border-2 rounded-[--radius-lg] bg-white/80',
          'transition-all duration-200',
          'placeholder:text-gray-400',
          'focus:outline-none focus:border-primary-400 focus:bg-white focus:shadow-glow-primary',
          error
            ? 'border-danger-300 bg-danger-50/50'
            : 'border-gray-200 hover:border-gray-300',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
