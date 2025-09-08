
import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose} className="w-auto">
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} className="w-auto">
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
