import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Badge,
  Avatar,
  ProgressBar,
  Input,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '../components/ui';
import { bucketLists, invitations } from '../lib/api';
import { timeAgo } from '../lib/utils';
import type { BucketList, Invitation } from '../types';

function InvitationCard({
  invitation,
  onAccept,
  onDecline,
}: {
  invitation: Invitation;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0 last:pb-0 first:pt-0">
      <Avatar name={invitation.invitedBy.name} src={invitation.invitedBy.avatarUrl} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{invitation.invitedBy.name}</span> invited you to{' '}
          <span className="font-semibold">{invitation.bucketList.name}</span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(invitation.createdAt)}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onAccept}>
          Accept
        </Button>
        <Button size="sm" variant="outline" onClick={onDecline}>
          Decline
        </Button>
      </div>
    </div>
  );
}

function BucketListCard({ bucketList }: { bucketList: BucketList }) {
  const navigate = useNavigate();

  return (
    <Card hover onClick={() => navigate(`/list/${bucketList.id}`)}>
      <CardHeader>
        <div>
          <CardTitle>{bucketList.name}</CardTitle>
          {bucketList.description && (
            <CardDescription>{bucketList.description}</CardDescription>
          )}
        </div>
        <Badge variant={bucketList.type === 'group' ? 'group' : 'default'}>
          {bucketList.type === 'group' ? 'Group' : 'Individual'}
        </Badge>
      </CardHeader>

      <CardFooter>
        <ProgressBar
          value={bucketList.completedCount || 0}
          max={bucketList.itemCount || 0}
          className="flex-1"
        />
        {bucketList.members.length > 1 && (
          <div className="flex ml-4 -space-x-2">
            {bucketList.members.slice(0, 3).map((member) => (
              <Avatar
                key={member.id}
                name={member.user.name}
                src={member.user.avatarUrl}
                size="sm"
                className="ring-2 ring-white"
              />
            ))}
            {bucketList.members.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                +{bucketList.members.length - 3}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function CreateListModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string; type: 'individual' | 'group' }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'individual' | 'group'>('individual');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim() || undefined, type });
    setName('');
    setDescription('');
    setType('individual');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Create New List</ModalTitle>
        <ModalDescription>Start tracking a new bucket list</ModalDescription>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Travel Adventures"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this list about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('individual')}
                className={`flex-1 p-3 rounded-[--radius] border-2 transition-colors ${
                  type === 'individual'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">👤</div>
                <div className="text-sm font-medium">Individual</div>
                <div className="text-xs text-gray-500">Just for you</div>
              </button>
              <button
                type="button"
                onClick={() => setType('group')}
                className={`flex-1 p-3 rounded-[--radius] border-2 transition-colors ${
                  type === 'group'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">👥</div>
                <div className="text-sm font-medium">Group</div>
                <div className="text-xs text-gray-500">Share with others</div>
              </button>
            </div>
          </div>
        </div>

        <ModalFooter>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!name.trim()}>
              Create List
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvitations, setShowInvitations] = useState(true);
  const queryClient = useQueryClient();

  const { data: listsData, isLoading: listsLoading } = useQuery({
    queryKey: ['bucket-lists'],
    queryFn: bucketLists.list,
  });

  const { data: invitationsData } = useQuery({
    queryKey: ['invitations'],
    queryFn: invitations.pending,
  });

  const createMutation = useMutation({
    mutationFn: bucketLists.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: invitations.accept,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: invitations.decline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });

  const pendingInvitations = invitationsData?.invitations || [];
  const lists = listsData?.bucketLists || [];

  return (
    <Layout
      pendingInvitationsCount={pendingInvitations.length}
      onNotificationClick={() => setShowInvitations(!showInvitations)}
    >
      {/* Invitations Panel */}
      {showInvitations && pendingInvitations.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Pending Invitations
            </h2>
            <button
              onClick={() => setShowInvitations(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          {pendingInvitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onAccept={() => acceptMutation.mutate(invitation.id)}
              onDecline={() => declineMutation.mutate(invitation.id)}
            />
          ))}
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          My Lists
        </h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <span>+</span> New List
        </Button>
      </div>

      {/* Lists Grid */}
      {listsLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : lists.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bucket lists yet</h3>
          <p className="text-gray-500 mb-6">Create your first list to start tracking your dreams</p>
          <Button onClick={() => setShowCreateModal(true)}>Create your first list</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lists.map((list) => (
            <BucketListCard key={list.id} bucketList={list} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(data) => createMutation.mutate(data)}
      />
    </Layout>
  );
}
