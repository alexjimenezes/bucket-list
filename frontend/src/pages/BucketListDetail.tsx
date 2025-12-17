import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import {
  Button,
  Card,
  Input,
  Avatar,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '../components/ui';
import { bucketLists, items } from '../lib/api';
import { formatDate } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import type { BucketListItem } from '../types';

function ItemCard({
  item,
  onToggle,
  onDelete,
  onImageClick,
  onAddPhoto,
  index = 0,
}: {
  item: BucketListItem;
  onToggle: () => void;
  onDelete: () => void;
  onImageClick?: (imageUrl: string) => void;
  onAddPhoto?: () => void;
  index?: number;
}) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-[--radius-lg] p-4 transition-all duration-300 shadow-soft-sm hover:shadow-soft hover:border-primary-200 animate-fade-in-up ${
        item.done ? 'bg-gray-50/80' : ''
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
            item.done
              ? 'bg-gradient-to-r from-success-400 to-success-500 border-success-500 text-white shadow-glow-success'
              : 'border-gray-300 hover:border-primary-400 hover:scale-110'
          }`}
        >
          {item.done && (
            <svg className="w-4 h-4 animate-check-pop" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`font-medium transition-all duration-300 ${
              item.done ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {item.text}
          </p>
          {item.done && item.completedAt && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <span>✨</span> Completed {formatDate(item.completedAt)}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Photo button for completed items */}
          {item.done && (
            item.imageUrl ? (
              <button
                onClick={() => onImageClick?.(item.imageUrl!)}
                className="p-2.5 text-purple-500 bg-purple-50 hover:bg-purple-100 rounded-[--radius] transition-all hover:scale-110"
                title="View memory"
              >
                ✨
              </button>
            ) : (
              <button
                onClick={onAddPhoto}
                className="p-2.5 text-gray-400 bg-gray-50 hover:bg-primary-50 hover:text-primary-500 rounded-[--radius] transition-all hover:scale-110"
                title="Add memory photo"
              >
                📷
              </button>
            )
          )}

          {/* Delete button */}
          <button
            onClick={onDelete}
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

function CelebrationModal({
  isOpen,
  onClose,
  itemId,
  itemText,
  bucketListId,
  onImageUploaded,
}: {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemText: string;
  bucketListId: string;
  onImageUploaded: () => void;
}) {
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

function ImageLightbox({
  isOpen,
  imageUrl,
  onClose,
}: {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}) {
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

function MemoriesCarousel({
  items,
  onImageClick,
}: {
  items: BucketListItem[];
  onImageClick: (imageUrl: string) => void;
}) {
  const memoriesWithImages = items.filter((item) => item.imageUrl);

  if (memoriesWithImages.length === 0) return null;

  return (
    <div className="mb-8 animate-fade-in">
      <h2 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
        <span className="animate-sparkle">📸</span>
        Memories ({memoriesWithImages.length})
      </h2>
      <div className="overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-4" style={{ width: 'max-content' }}>
          {memoriesWithImages.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onImageClick(item.imageUrl!)}
              className="flex-shrink-0 rounded-[--radius-lg] overflow-hidden border-2 border-transparent hover:border-primary-400 transition-all duration-300 group relative hover:scale-105 hover:shadow-soft-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={item.imageUrl!}
                alt={item.text}
                className="w-36 h-28 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-xs font-medium truncate w-full">
                  {item.text}
                </span>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-lg animate-sparkle">✨</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InviteModal({
  isOpen,
  onClose,
  onInvite,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onInvite(email.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="text-4xl mb-2">💌</div>
        <ModalTitle>Invite Someone</ModalTitle>
        <ModalDescription>Share this bucket list with a friend</ModalDescription>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@email.com"
          autoFocus
        />

        <ModalFooter>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1" disabled={!email.trim() || isLoading}>
              {isLoading ? 'Sending...' : 'Send Invite ✨'}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function DeleteConfirmModal({
  isOpen,
  itemText,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  itemText: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="text-4xl mb-2">🗑️</div>
        <ModalTitle>Delete Item</ModalTitle>
        <ModalDescription>Are you sure you want to delete this item?</ModalDescription>
      </ModalHeader>

      <div className="bg-gray-50 rounded-[--radius-lg] p-4 text-center font-medium text-gray-700 mb-4">
        "{itemText}"
      </div>

      <ModalFooter>
        <div className="flex gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export function BucketListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [newItemText, setNewItemText] = useState('');
  const [celebrationItem, setCelebrationItem] = useState<{ id: string; text: string } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; text: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bucket-list', id],
    queryFn: () => bucketLists.get(id!),
    enabled: !!id,
  });

  const addItemMutation = useMutation({
    mutationFn: (text: string) => items.create(id!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-list', id] });
      setNewItemText('');
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ itemId, done }: { itemId: string; done: boolean }) =>
      items.update(id!, itemId, { done }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bucket-list', id] });
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
      if (variables.done) {
        const item = bucketList?.items?.find((i) => i.id === variables.itemId);
        if (item) {
          setCelebrationItem({ id: item.id, text: item.text });
        }
      }
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => items.delete(id!, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-list', id] });
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => bucketLists.invite(id!, email),
    onSuccess: () => {
      setShowInviteModal(false);
      setInviteError(null);
    },
    onError: (error: Error) => {
      setInviteError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => bucketLists.delete(id!),
    onSuccess: () => {
      navigate('/');
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500 animate-pulse">Loading...</div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="text-center py-12 animate-fade-in">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">List not found</h2>
          <p className="text-gray-500 mb-6">
            This bucket list doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/')} variant="gradient">Go back home</Button>
        </div>
      </Layout>
    );
  }

  const bucketList = data.bucketList;
  const todoItems = bucketList.items?.filter((item) => !item.done) || [];
  const doneItems = bucketList.items?.filter((item) => item.done) || [];

  // Group done items by month, sorted most recent first
  const doneItemsByMonth = doneItems
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    })
    .reduce<Record<string, typeof doneItems>>((acc, item) => {
      const date = item.completedAt ? new Date(item.completedAt) : new Date();
      const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(item);
      return acc;
    }, {});

  const isOwner = bucketList.members.some(
    (m) => m.userId === user?.id && m.role === 'owner'
  );

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    addItemMutation.mutate(newItemText.trim());
  };

  return (
    <Layout>
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-primary-600 text-sm mb-4 transition-colors animate-fade-in"
      >
        ← Back to lists
      </Link>

      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{bucketList.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                📍 {doneItems.length} of {(todoItems.length + doneItems.length)} completed
              </span>
              {bucketList.members.length > 1 && (
                <span className="flex items-center gap-1">
                  👥 Shared with{' '}
                  {(() => {
                    const others = bucketList.members.filter((m) => m.userId !== user?.id);
                    const names = others.slice(0, 2).map((m) => m.user.name.split(' ')[0]);
                    const remaining = others.length - 2;
                    if (remaining <= 0) {
                      return names.join(' and ');
                    }
                    return `${names.join(', ')} and ${remaining} other${remaining > 1 ? 's' : ''}`;
                  })()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && bucketList.type === 'group' && (
              <Button variant="soft" size="sm" onClick={() => setShowInviteModal(true)}>
                💌 Invite
              </Button>
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this list?')) {
                    deleteMutation.mutate();
                  }
                }}
                className="text-danger-500 hover:bg-danger-50"
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Members */}
        {bucketList.members.length > 1 && (
          <div className="flex items-center gap-2 mt-4">
            {bucketList.members.map((member, idx) => (
              <Avatar
                key={member.id}
                name={member.user.name}
                src={member.user.avatarUrl}
                size="sm"
                className="ring-2 ring-white hover:scale-110 transition-transform"
                style={{ animationDelay: `${idx * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Memories Carousel */}
      <MemoriesCarousel
        items={bucketList.items || []}
        onImageClick={setLightboxImage}
      />

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="flex gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add a new dream... ✨"
          className="flex-1"
        />
        <Button type="submit" variant="gradient" disabled={!newItemText.trim() || addItemMutation.isPending}>
          Add
        </Button>
      </form>

      {/* Todo Items */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
          📌 To Do ({todoItems.length})
        </h2>
        {todoItems.length === 0 ? (
          <Card className="text-center py-10 animate-fade-in">
            <div className="text-4xl mb-3 animate-float">🌟</div>
            <p className="text-gray-500">No items yet. Add your first dream above!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {todoItems.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                onToggle={() =>
                  toggleItemMutation.mutate({ itemId: item.id, done: true })
                }
                onDelete={() => setItemToDelete({ id: item.id, text: item.text })}
                onImageClick={setLightboxImage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Done Items */}
      {doneItems.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            ✅ Completed ({doneItems.length})
          </h2>
          {Object.entries(doneItemsByMonth).map(([month, monthItems]) => (
            <div key={month} className="mb-6">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                {month}
              </h3>
              <div className="space-y-3">
                {monthItems.map((item, index) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    onToggle={() =>
                      toggleItemMutation.mutate({ itemId: item.id, done: false })
                    }
                    onDelete={() => setItemToDelete({ id: item.id, text: item.text })}
                    onImageClick={setLightboxImage}
                    onAddPhoto={() => setCelebrationItem({ id: item.id, text: item.text })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Celebration Modal */}
      {celebrationItem && (
        <CelebrationModal
          isOpen={!!celebrationItem}
          onClose={() => setCelebrationItem(null)}
          itemId={celebrationItem.id}
          itemText={celebrationItem.text}
          bucketListId={id!}
          onImageUploaded={() => {
            queryClient.invalidateQueries({ queryKey: ['bucket-list', id] });
          }}
        />
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={!!lightboxImage}
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteError(null);
        }}
        onInvite={(email) => inviteMutation.mutate(email)}
        isLoading={inviteMutation.isPending}
      />

      {/* Delete Confirm Modal */}
      {itemToDelete && (
        <DeleteConfirmModal
          isOpen={!!itemToDelete}
          itemText={itemToDelete.text}
          onClose={() => setItemToDelete(null)}
          onConfirm={() => {
            deleteItemMutation.mutate(itemToDelete.id, {
              onSuccess: () => setItemToDelete(null),
            });
          }}
          isLoading={deleteItemMutation.isPending}
        />
      )}

      {/* Invite Error Toast */}
      {inviteError && (
        <div className="fixed bottom-4 right-4 bg-danger-500 text-white px-5 py-3 rounded-[--radius-lg] shadow-soft-lg animate-slide-in-right">
          {inviteError}
          <button onClick={() => setInviteError(null)} className="ml-3 hover:opacity-80">
            ✕
          </button>
        </div>
      )}
    </Layout>
  );
}
