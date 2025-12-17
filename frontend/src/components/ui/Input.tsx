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
          'w-full px-4 py-3 text-base border-2 rounded-[--radius] bg-white transition-colors',
          'placeholder:text-gray-400',
          'focus:outline-none focus:border-primary-500',
          error ? 'border-danger-500' : 'border-gray-200 hover:border-gray-300',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
