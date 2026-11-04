import React from 'react';

const TopPerformingVendorsChartSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded border-l-4 bg-green-100 border-green-500 animate-pulse">
      <div className="w-48 h-6 bg-gray-300 rounded mb-4"></div>
      <div className="w-full h-80 bg-gray-300 rounded-full mx-auto"></div>
    </div>
  );
};

export default TopPerformingVendorsChartSkeleton;
