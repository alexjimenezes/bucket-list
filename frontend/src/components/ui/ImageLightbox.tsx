interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageLightbox({ isOpen, imageUrl, onClose }: ImageLightboxProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl hover:scale-110 transition-transform"
      >
        ✕
      </button>
      <img
        src={imageUrl}
        alt="Memory"
        className="max-w-full max-h-full object-contain rounded-[--radius-lg] shadow-soft-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
