import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'gradient' | 'success';
  size?: 'sm' | 'md';
}

function ProgressBar({
  value,
  max,
  className,
  showLabel = true,
  variant = 'gradient',
  size = 'sm'
}: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const variantStyles = {
    default: 'bg-primary-500',
    gradient: 'bg-gradient-to-r from-pink-400 via-purple-400 to-primary-500',
    success: 'bg-gradient-to-r from-success-400 to-success-500',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        'flex-1 bg-gray-100 rounded-full overflow-hidden',
        size === 'sm' ? 'h-1.5' : 'h-2.5'
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-500 tabular-nums min-w-[3rem] text-right">
          {value}/{max}
        </span>
      )}
    </div>
  );
}

export { ProgressBar };
