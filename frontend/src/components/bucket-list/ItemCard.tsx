import type { BucketListItem } from '../../types';
import { formatDate } from '../../lib/utils';

interface ItemCardProps {
  item: BucketListItem;
  onToggle: () => void;
  onDelete: () => void;
  onImageClick?: (imageUrl: string) => void;
  onAddPhoto?: () => void;
  onEdit: () => void;
  index?: number;
}

export function ItemCard({
  item,
  onToggle,
  onDelete,
  onImageClick,
  onAddPhoto,
  onEdit,
  index = 0,
}: ItemCardProps) {
  const hasImage = !!item.imageUrl;

  return (
    <div
      className={`bg-white border border-gray-100 rounded-[--radius-lg] p-4 transition-all duration-300 shadow-soft-sm hover:shadow-soft hover:border-primary-200 animate-fade-in-up ${
        item.done ? 'bg-gray-50/80' : ''
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`group/check w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
            item.done
              ? 'bg-success-500 border-success-500 text-white shadow-glow-success hover:bg-danger-400 hover:border-danger-400 hover:shadow-none'
              : 'border-gray-300 hover:border-primary-400 hover:scale-110'
          }`}
        >
          {item.done && (
            <>
              {/* Checkmark - visible by default, hidden on hover */}
              <svg className="w-4 h-4 group-hover/check:hidden" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* X mark - hidden by default, visible on hover */}
              <svg className="w-4 h-4 hidden group-hover/check:block" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>

        {/* Clickable text area to edit */}
        <button
          onClick={onEdit}
          className="flex-1 min-w-0 text-left hover:bg-gray-50 -my-2 -ml-2 py-2 pl-2 pr-4 rounded-[--radius] transition-colors"
        >
          <p
            className={`font-medium transition-all duration-300 ${
              item.done ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {item.text}
          </p>
          {item.done && item.completedAt && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <span>✨</span> {formatDate(item.completedAt)}
            </p>
          )}
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Photo button - show sparkle for items with images (completed or uncompleted) */}
          {hasImage ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageClick?.(item.imageUrl!);
              }}
              className="p-2.5 text-purple-500 bg-purple-50 hover:bg-purple-100 rounded-[--radius] transition-all hover:scale-110"
              title="View memory"
            >
              ✨
            </button>
          ) : item.done ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddPhoto?.();
              }}
              className="p-2.5 text-gray-400 bg-gray-50 hover:bg-primary-50 hover:text-primary-500 rounded-[--radius] transition-all hover:scale-110"
              title="Add memory photo"
            >
              📷
            </button>
          ) : null}

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2.5 text-gray-400 bg-gray-50 hover:text-danger-500 hover:bg-danger-50 rounded-[--radius] transition-all hover:scale-110"
            title="Delete item"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
