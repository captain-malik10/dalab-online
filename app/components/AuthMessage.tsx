import React from 'react';

interface AuthMessageProps {
  message: string | null;
  type: 'error' | 'success';
}

const AuthMessage: React.FC<AuthMessageProps> = ({ message, type }) => {
  if (!message) return null;

  const typeStyles = {
    error: {
      container: 'bg-red-100 text-red-700',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-3 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    success: {
      container: 'bg-green-100 text-green-700',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-3 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const { container, icon } = typeStyles[type];

  return (
    <div className={`px-4 py-2 mt-2 rounded flex items-start ${container}`}>
      {icon}
      <span className="text-left">{message}</span>
    </div>
  );
};

export default AuthMessage;
