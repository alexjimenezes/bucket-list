import { useEffect, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

function Modal({ isOpen, onClose, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-white rounded-[--radius-xl] p-8 max-w-md w-full animate-modal-in shadow-xl',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('text-center mb-6', className)}>{children}</div>;
}

function ModalTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h2 className={cn('text-2xl font-bold text-gray-900', className)}>{children}</h2>;
}

function ModalDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn('text-gray-500 mt-2', className)}>{children}</p>;
}

function ModalFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mt-6', className)}>{children}</div>;
}

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter };
