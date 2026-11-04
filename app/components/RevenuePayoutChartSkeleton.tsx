import React from 'react';

const RevenuePayoutChartSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded border-l-4 bg-blue-100 border-blue-500 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-blue-200 rounded w-1/3"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-blue-200 rounded w-16"></div>
          <div className="h-8 bg-blue-200 rounded w-16"></div>
          <div className="h-8 bg-blue-200 rounded w-16"></div>
        </div>
      </div>
      <div className="h-40 bg-blue-200 rounded mb-4"></div>
      <div className="h-40 bg-blue-200 rounded"></div>
    </div>
  );
};

export default RevenuePayoutChartSkeleton;