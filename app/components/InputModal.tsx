import React, { type ReactNode } from 'react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClassName?: string;
  inputType?: string;
}

const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  inputValue,
  onInputChange,
  placeholder = '',
  error = null,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonClassName = 'bg-blue-600 hover:bg-blue-700',
  inputType = 'text',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-md">
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          <input
            type={inputType}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className="border p-2 rounded w-full mb-4"
            placeholder={placeholder}
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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
              className={`px-6 py-2 rounded text-white font-medium ${confirmButtonClassName}`}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
