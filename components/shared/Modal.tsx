import React, { PropsWithChildren } from 'react';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-md m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-text-secondary hover:text-text-primary"
            aria-label="Close modal"
          >
            <Icon name="X" size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// FIX: Removed the block that attempted to modify Icon.defaultProps.
// This pattern is deprecated and caused TypeScript errors. The 'X' icon is already
// defined in the central `icons` object in `Icon.tsx`, making this redundant.

export default Modal;