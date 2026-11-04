import React, { type ReactNode } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  icon?: ReactNode;
  children?: ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClassName?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  icon,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonClassName = 'bg-red-600 hover:bg-red-700',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 text-center">
          {icon && <div className="flex justify-center mb-4">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-center gap-4">
            {cancelButtonText && (
              <button
                onClick={onClose}
                className="px-6 py-2 rounded text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium"
              >
                {cancelButtonText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`px-6 py-2.5 rounded-xl text-white font-semibold ${confirmButtonClassName}`}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
