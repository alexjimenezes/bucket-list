import type { BucketListItem } from '../../types';

interface MemoriesCarouselProps {
  items: BucketListItem[];
  onImageClick: (imageUrl: string) => void;
}

export function MemoriesCarousel({ items, onImageClick }: MemoriesCarouselProps) {
  // Only show completed items with images, sorted by completedAt (most recent first)
  const memoriesWithImages = items
    .filter((item) => item.done && item.imageUrl)
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA; // Most recent first (left to right)
    });

  if (memoriesWithImages.length === 0) return null;

  return (
    <div className="mb-8 animate-fade-in">
      <h2 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
        <span className="animate-sparkle">📸</span>
        Memories ({memoriesWithImages.length})
      </h2>
      <div className="overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-3 md:gap-6" style={{ width: 'max-content' }}>
          {memoriesWithImages.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onImageClick(item.imageUrl!)}
              className="flex-shrink-0 transition-all duration-300 hover:scale-105 animate-fade-in-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Instax-style frame */}
              <div className="bg-white rounded-sm shadow-soft p-2 pb-10 relative hover:shadow-soft-lg transition-shadow">
                {/* Photo area */}
                <div className="w-32 h-32 bg-gray-100 rounded-sm overflow-hidden relative">
                  <img
                    src={item.imageUrl!}
                    alt={item.text}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
                  </div>
                </div>
                {/* Instax bottom caption */}
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <p className="text-[10px] text-gray-500 font-medium truncate px-1">
                    {item.text}
                  </p>
                  {item.completedAt && (
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
