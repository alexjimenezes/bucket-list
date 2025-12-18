import { useState } from 'react';
import { Button, Input, Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '../ui';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string) => void;
  isLoading: boolean;
}

export function InviteModal({ isOpen, onClose, onInvite, isLoading }: InviteModalProps) {
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
