import React from 'react';

const TopSellingProductsChartSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded border-l-4 bg-blue-100 border-blue-500 animate-pulse">
      <div className="w-48 h-6 bg-gray-300 rounded mb-4"></div>
      <div className="w-full h-80 bg-gray-300 rounded-full mx-auto"></div>
    </div>
  );
};

export default TopSellingProductsChartSkeleton;
