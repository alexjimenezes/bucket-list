import { useState } from 'react';
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
  completedByName,
}: {
  item: BucketListItem;
  onToggle: () => void;
  onDelete: () => void;
  completedByName?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-[--radius] p-4 flex items-center gap-4 transition-all hover:border-primary-300 group ${
        item.done ? 'bg-gray-50' : ''
      }`}
    >
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
  );
}

function CelebrationModal({
  isOpen,
  onClose,
  itemText,
}: {
  isOpen: boolean;
  onClose: () => void;
  itemText: string;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="text-6xl mb-4">🎉</div>
        <ModalTitle>Congratulations!</ModalTitle>
        <ModalDescription>You've achieved another dream!</ModalDescription>
      </ModalHeader>

      <div className="bg-gray-50 rounded-[--radius] p-4 text-center font-medium text-gray-700">
        "{itemText}"
      </div>

      <ModalFooter>
        <Button onClick={onClose} className="w-full">
          Continue
        </Button>
      </ModalFooter>
    </Modal>
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
  const [celebrationItem, setCelebrationItem] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

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
          setCelebrationItem(item.text);
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
              />
            ))}
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={!!celebrationItem}
        onClose={() => setCelebrationItem(null)}
        itemText={celebrationItem || ''}
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
