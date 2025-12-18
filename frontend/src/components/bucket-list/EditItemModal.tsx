import { useState, useRef } from 'react';
import { Button, Input, Modal, ModalFooter } from '../ui';
import type { BucketListItem } from '../../types';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BucketListItem;
  onUpdate: (data: { text?: string; completedAt?: string }) => void;
  onImageUpload: (file: File) => Promise<void>;
  onImageDelete: () => Promise<void>;
  isUpdating: boolean;
}

export function EditItemModal({
  isOpen,
  onClose,
  item,
  onUpdate,
  onImageUpload,
  onImageDelete,
  isUpdating,
}: EditItemModalProps) {
  const [text, setText] = useState(item.text);
  const [completedAt, setCompletedAt] = useState(
    item.completedAt ? new Date(item.completedAt).toISOString().split('T')[0] : ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

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

  const handleSave = async () => {
    setError(null);

    // Upload new image if selected
    if (selectedFile) {
      setIsUploadingImage(true);
      try {
        await onImageUpload(selectedFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image');
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    // Update text and/or completedAt
    const updates: { text?: string; completedAt?: string } = {};
    if (text.trim() !== item.text) {
      updates.text = text.trim();
    }
    if (item.done && completedAt) {
      const newCompletedAt = new Date(completedAt).toISOString();
      if (newCompletedAt !== item.completedAt) {
        updates.completedAt = newCompletedAt;
      }
    }

    if (Object.keys(updates).length > 0 || selectedFile) {
      onUpdate(updates);
    } else {
      onClose();
    }
  };

  const handleDeleteImage = async () => {
    setIsDeletingImage(true);
    try {
      await onImageDelete();
      setPreview(null);
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
    setIsDeletingImage(false);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col items-center">
        {/* Instax-style frame */}
        <div className={`bg-white rounded-sm p-3 pb-14 relative mb-4 w-full max-w-[280px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15),0_8px_40px_-8px_rgba(0,0,0,0.1)] transform hover:rotate-0 transition-transform duration-300 ${showImageOverlay ? 'rotate-0' : 'rotate-1'}`}>
          {/* Photo area */}
          <div className="aspect-square bg-gray-100 rounded-sm overflow-hidden relative">
            {preview || item.imageUrl ? (
              <>
                <img
                  src={preview || item.imageUrl!}
                  alt={item.text}
                  className="w-full h-full object-cover"
                  onClick={() => item.done && setShowImageOverlay(!showImageOverlay)}
                />
                {/* Image overlay actions for completed items */}
                {item.done && (
                  <div
                    className={`absolute inset-0 transition-all flex items-center justify-center md:bg-black/0 md:opacity-0 md:hover:bg-black/40 md:hover:opacity-100 ${
                      showImageOverlay ? 'bg-black/40 opacity-100' : 'bg-black/0 opacity-0 pointer-events-none md:pointer-events-auto'
                    }`}
                    onClick={() => setShowImageOverlay(false)}
                  >
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
                        title="Change image"
                      >
                        📷
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        disabled={isDeletingImage}
                        className="p-2 bg-white/90 rounded-full text-danger-500 hover:bg-white transition-colors"
                        title="Remove image"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                {item.done ? (
                  <>
                    <span className="text-4xl mb-2">📷</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      Add a memory
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-4xl mb-2">🎯</span>
                    <span className="text-sm">Complete to add photo</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Instax bottom caption area */}
          <div className="absolute bottom-3 left-3 right-3 text-center">
            <p className="text-xs text-gray-400 font-medium truncate">
              {item.done && item.completedAt
                ? `✨ ${new Date(completedAt || item.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : '🎯 Dream in progress'}
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        {item.done && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        )}

        {/* Edit form */}
        <div className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dream</label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's your dream?"
            />
          </div>

          {item.done && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completed on</label>
              <Input
                type="date"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                max={today}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-danger-500 text-center">{error}</p>
          )}
        </div>

        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="button"
              variant="gradient"
              onClick={handleSave}
              className="flex-1"
              disabled={!text.trim() || isUpdating || isUploadingImage}
            >
              {isUpdating || isUploadingImage ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </ModalFooter>
      </div>
    </Modal>
  );
}
