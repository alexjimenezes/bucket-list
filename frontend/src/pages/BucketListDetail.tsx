import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import {
  Button,
  Card,
  Input,
  Avatar,
  ImageLightbox,
  ConfirmModal,
} from '../components/ui';
import {
  ItemCard,
  MemoriesCarousel,
  CelebrationModal,
  EditItemModal,
  EditBucketListModal,
  InviteModal,
} from '../components/bucket-list';
import { bucketLists, items } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { BucketListItem } from '../types';

export function BucketListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [newItemText, setNewItemText] = useState('');
  const [celebrationItem, setCelebrationItem] = useState<{ id: string; text: string } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; text: string } | null>(null);
  const [itemToEdit, setItemToEdit] = useState<BucketListItem | null>(null);
  const [showDeleteBucketModal, setShowDeleteBucketModal] = useState(false);

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

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      bucketLists.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-list', id] });
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
      setShowEditModal(false);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => bucketLists.removeMember(id!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-list', id] });
    },
  });

  const editItemMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: { text?: string; completedAt?: string } }) =>
      items.update(id!, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-list', id] });
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
      setItemToEdit(null);
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
        {/* Mobile: Avatars (left) + Action buttons (right) */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          {/* Avatars */}
          {bucketList.members.length > 1 ? (
            <div className="flex items-center gap-1">
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
          ) : (
            <div />
          )}

          {/* Action buttons */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-[--radius] transition-all"
                title="Edit bucket list"
              >
                ✏️
              </button>
              {bucketList.type === 'group' && (
                <Button variant="soft" size="sm" onClick={() => setShowInviteModal(true)}>
                  💌 Invite
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteBucketModal(true)}
                className="text-danger-500 hover:bg-danger-50"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{bucketList.name}</h1>
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                📍 {doneItems.length} of {(todoItems.length + doneItems.length)} completed
              </span>
              {bucketList.members.length > 1 && (
                <span className="flex items-center gap-1 text-right sm:text-left">
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

          {/* Desktop: Action buttons next to title */}
          <div className="hidden md:flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-[--radius] transition-all"
                title="Edit bucket list"
              >
                ✏️
              </button>
            )}
            {isOwner && bucketList.type === 'group' && (
              <Button variant="soft" size="sm" onClick={() => setShowInviteModal(true)}>
                💌 Invite
              </Button>
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteBucketModal(true)}
                className="text-danger-500 hover:bg-danger-50"
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Desktop: Members */}
        {bucketList.members.length > 1 && (
          <div className="hidden md:flex items-center gap-2 mt-4">
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
                onEdit={() => setItemToEdit(item)}
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
                    onEdit={() => setItemToEdit(item)}
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

      {/* Edit Bucket List Modal */}
      {showEditModal && (
        <EditBucketListModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          bucketList={bucketList}
          currentUserId={user?.id || ''}
          onUpdate={(data) => updateMutation.mutate(data)}
          onRemoveMember={(memberId) => removeMemberMutation.mutate(memberId)}
          isUpdating={updateMutation.isPending}
          isRemovingMember={removeMemberMutation.isPending}
        />
      )}

      {/* Delete Item Confirm Modal */}
      {itemToDelete && (
        <ConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={() => {
            deleteItemMutation.mutate(itemToDelete.id, {
              onSuccess: () => setItemToDelete(null),
            });
          }}
          isLoading={deleteItemMutation.isPending}
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          itemText={itemToDelete.text}
          icon="🗑️"
          confirmText="Delete"
          confirmLoadingText="Deleting..."
        />
      )}

      {/* Edit Item Modal */}
      {itemToEdit && (
        <EditItemModal
          key={itemToEdit.id}
          isOpen={!!itemToEdit}
          onClose={() => setItemToEdit(null)}
          item={itemToEdit}
          onUpdate={(data) => {
            editItemMutation.mutate({ itemId: itemToEdit.id, data });
          }}
          onImageUpload={async (file) => {
            await items.uploadImage(id!, itemToEdit.id, file);
            queryClient.invalidateQueries({ queryKey: ['bucket-list', id] });
          }}
          onImageDelete={async () => {
            await items.deleteImage(id!, itemToEdit.id);
            queryClient.invalidateQueries({ queryKey: ['bucket-list', id] });
          }}
          isUpdating={editItemMutation.isPending}
        />
      )}

      {/* Delete Bucket List Modal */}
      <ConfirmModal
        isOpen={showDeleteBucketModal}
        onClose={() => setShowDeleteBucketModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        title="Delete Bucket List"
        description="Are you sure you want to delete this bucket list? This action cannot be undone."
        itemText={bucketList.name}
        icon="🗑️"
        confirmText="Delete"
        confirmLoadingText="Deleting..."
      />

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
