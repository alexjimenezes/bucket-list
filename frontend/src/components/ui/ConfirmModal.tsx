import { Button } from './Button';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  description: string;
  confirmText?: string;
  confirmLoadingText?: string;
  itemText?: string;
  icon?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmText = 'Confirm',
  confirmLoadingText = 'Processing...',
  itemText,
  icon = '⚠️',
  variant = 'danger',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="text-4xl mb-2">{icon}</div>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription>{description}</ModalDescription>
      </ModalHeader>

      {itemText && (
        <div className="bg-gray-50 rounded-[--radius-lg] p-4 text-center font-medium text-gray-700 mb-4">
          "{itemText}"
        </div>
      )}

      <ModalFooter>
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={onConfirm}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? confirmLoadingText : confirmText}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
