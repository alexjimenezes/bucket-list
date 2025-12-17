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
  completedByName,
}: {
  item: BucketListItem;
  onToggle: () => void;
  onDelete: () => void;
  onImageClick?: (imageUrl: string) => void;
  completedByName?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-[--radius] p-4 transition-all hover:border-primary-300 group ${
        item.done ? 'bg-gray-50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            item.done
              ? 'bg-success-500 border-success-500 text-white'
              : 'border-gray-300 hover:border-primary-500'
          }`}
        >
          {item.done && <span className="text-sm">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`font-medium ${
              item.done ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {item.text}
          </p>
          {item.done && item.completedAt && (
            <p className="text-xs text-gray-400 mt-0.5">
              Completed {formatDate(item.completedAt)}
              {completedByName && ` by ${completedByName}`}
            </p>
          )}
        </div>

        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-all"
        >
          🗑️
        </button>
      </div>

      {/* Memory Image */}
      {item.imageUrl && (
        <div className="mt-3 ml-10">
          <button
            onClick={() => onImageClick?.(item.imageUrl!)}
            className="block rounded-[--radius] overflow-hidden border border-gray-200 hover:border-primary-300 transition-all"
          >
            <img
              src={item.imageUrl}
              alt="Memory"
              className="w-32 h-24 object-cover"
            />
          </button>
        </div>
      )}
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

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalHeader>
        <div className="text-6xl mb-4">🎉</div>
        <ModalTitle>Congratulations!</ModalTitle>
        <ModalDescription>You've achieved another dream!</ModalDescription>
      </ModalHeader>

      <div className="bg-gray-50 rounded-[--radius] p-4 text-center font-medium text-gray-700 mb-4">
        "{itemText}"
      </div>

      {/* Image Upload Section */}
      <div className="border-t border-gray-100 pt-4">
        {!preview ? (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">
              Want to capture this memory?
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
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto"
            >
              📷 Add a memory photo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-[--radius] overflow-hidden">
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
                className="absolute top-2 right-2 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-danger-500 text-center mt-2">{error}</p>
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
              onClick={handleUpload}
              className="flex-1"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Save Memory'}
            </Button>
          </div>
        ) : (
          <Button onClick={handleSkip} className="w-full">
            Continue
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
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
      >
        ✕
      </button>
      <img
        src={imageUrl}
        alt="Memory"
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
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
            <Button type="submit" className="flex-1" disabled={!email.trim() || isLoading}>
              {isLoading ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </ModalFooter>
      </form>
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
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">List not found</h2>
          <p className="text-gray-500 mb-6">
            This bucket list doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/')}>Go back home</Button>
        </div>
      </Layout>
    );
  }

  const bucketList = data.bucketList;
  const todoItems = bucketList.items?.filter((item) => !item.done) || [];
  const doneItems = bucketList.items?.filter((item) => item.done) || [];
  const isOwner = bucketList.members.some(
    (m) => m.userId === user?.id && m.role === 'owner'
  );

  const getMemberName = (userId: string | null) => {
    if (!userId) return undefined;
    const member = bucketList.members.find((m) => m.userId === userId);
    return member?.user.name;
  };

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
        className="inline-flex items-center gap-1 text-gray-500 hover:text-primary-600 text-sm mb-4"
      >
        ← Back to lists
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{bucketList.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                📍 {doneItems.length} of {(todoItems.length + doneItems.length)} completed
              </span>
              {bucketList.members.length > 1 && (
                <span className="flex items-center gap-1">
                  👥 Shared with {bucketList.members.length - 1} other
                  {bucketList.members.length > 2 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && bucketList.type === 'group' && (
              <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)}>
                Invite
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
            {bucketList.members.map((member) => (
              <Avatar
                key={member.id}
                name={member.user.name}
                src={member.user.avatarUrl}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="flex gap-3 mb-8">
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add a new dream..."
          className="flex-1"
        />
        <Button type="submit" disabled={!newItemText.trim() || addItemMutation.isPending}>
          Add
        </Button>
      </form>

      {/* Todo Items */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
          📌 To Do ({todoItems.length})
        </h2>
        {todoItems.length === 0 ? (
          <Card className="text-center py-8 text-gray-500">
            No items yet. Add your first dream above!
          </Card>
        ) : (
          <div className="space-y-2">
            {todoItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={() =>
                  toggleItemMutation.mutate({ itemId: item.id, done: true })
                }
                onDelete={() => deleteItemMutation.mutate(item.id)}
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
          <div className="space-y-2">
            {doneItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                completedByName={getMemberName(item.completedById)}
                onToggle={() =>
                  toggleItemMutation.mutate({ itemId: item.id, done: false })
                }
                onDelete={() => deleteItemMutation.mutate(item.id)}
                onImageClick={setLightboxImage}
              />
            ))}
          </div>
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

      {/* Invite Error Toast */}
      {inviteError && (
        <div className="fixed bottom-4 right-4 bg-danger-500 text-white px-4 py-3 rounded-[--radius] shadow-lg">
          {inviteError}
          <button onClick={() => setInviteError(null)} className="ml-3">
            ✕
          </button>
        </div>
      )}
    </Layout>
  );
}
