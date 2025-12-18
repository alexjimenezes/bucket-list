import { useState, useRef } from 'react';
import { Button, Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '../ui';
import { items } from '../../lib/api';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemText: string;
  bucketListId: string;
  onImageUploaded: () => void;
}

export function CelebrationModal({
  isOpen,
  onClose,
  itemId,
  itemText,
  bucketListId,
  onImageUploaded,
}: CelebrationModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a JPEG, PNG, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      await items.uploadImage(bucketListId, itemId, selectedFile);
      onImageUploaded();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  const handleSkip = () => {
    handleClose();
  };

  // Confetti colors
  const confettiColors = ['#f9a8d4', '#c4b5fd', '#93c5fd', '#6ee7b7', '#fcd34d'];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} variant="celebration">
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              backgroundColor: confettiColors[i % confettiColors.length],
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animation: `confetti ${1 + Math.random()}s ease-out forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      <ModalHeader>
        <div className="text-7xl mb-4 animate-celebration">🎉</div>
        <ModalTitle className="text-2xl text-gradient-primary">
          Amazing Achievement!
        </ModalTitle>
        <ModalDescription className="text-lg">
          You just made a dream come true! ✨
        </ModalDescription>
      </ModalHeader>

      <div className="bg-gradient-to-r from-pastel-pink/50 to-pastel-purple/50 rounded-[--radius-lg] p-5 text-center font-medium text-gray-700 mb-6 border border-purple-100">
        "{itemText}"
      </div>

      {/* Image Upload Section */}
      <div className="border-t border-gray-100 pt-5">
        {!preview ? (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Want to capture this memory? 📸
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="soft"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto"
            >
              📷 Add a memory photo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-[--radius-lg] overflow-hidden shadow-soft">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 bg-black/50 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-danger-500 text-center mt-3">{error}</p>
        )}
      </div>

      <ModalFooter>
        {preview ? (
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
              disabled={isUploading}
            >
              Skip
            </Button>
            <Button
              type="button"
              variant="gradient"
              onClick={handleUpload}
              className="flex-1"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Save Memory ✨'}
            </Button>
          </div>
        ) : (
          <Button onClick={handleSkip} variant="gradient" className="w-full">
            Continue 🚀
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
