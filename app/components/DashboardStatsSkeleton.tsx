import React from 'react';

const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 mt-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="p-4 flex flex-col justify-between min-h-24 rounded border-l-4 bg-gray-200 animate-pulse"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-32 h-6 bg-gray-300 rounded"></div>
          </div>
          <div className="w-24 h-10 bg-gray-300 rounded self-end"></div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatsSkeleton;
