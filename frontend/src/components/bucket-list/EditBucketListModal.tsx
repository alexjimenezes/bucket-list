import { useState } from 'react';
import { Button, Input, Avatar, Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '../ui';

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

interface EditBucketListModalProps {
  isOpen: boolean;
  onClose: () => void;
  bucketList: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    members: Member[];
  };
  currentUserId: string;
  onUpdate: (data: { name: string; description?: string }) => void;
  onRemoveMember: (memberId: string) => void;
  isUpdating: boolean;
  isRemovingMember: boolean;
}

export function EditBucketListModal({
  isOpen,
  onClose,
  bucketList,
  currentUserId,
  onUpdate,
  onRemoveMember,
  isUpdating,
  isRemovingMember,
}: EditBucketListModalProps) {
  const [name, setName] = useState(bucketList.name);
  const [description, setDescription] = useState(bucketList.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdate({ name: name.trim(), description: description.trim() || undefined });
  };

  const otherMembers = bucketList.members.filter(
    (m) => m.userId !== currentUserId && m.role !== 'owner'
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="text-4xl mb-2">✏️</div>
        <ModalTitle>Edit Bucket List</ModalTitle>
        <ModalDescription>Update your bucket list details</ModalDescription>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bucket list name"
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

          {otherMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
              <div className="space-y-2">
                {otherMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-[--radius-lg]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={member.user.name} src={member.user.avatarUrl} size="sm" />
                      <span className="text-sm font-medium text-gray-700">{member.user.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.userId)}
                      disabled={isRemovingMember}
                      className="text-xs text-gray-400 hover:text-danger-500 transition-colors px-2 py-1 hover:bg-danger-50 rounded-[--radius]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={!name.trim() || isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
