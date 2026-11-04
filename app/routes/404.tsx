import React from 'react';
import { useNavigate } from 'react-router';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded shadow-lg">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">Page Not Found</p>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
          The page you're looking for doesn't exist or an other error occurred.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-5 py-2.5 rounded font-semibold bg-[var(--color-accent)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] transition-opacity duration-300"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
