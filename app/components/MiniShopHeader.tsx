import { LayoutGrid, Rows3 } from 'lucide-react';
import React, { useState } from 'react';

type MiniShopHeaderProps = {
  onLayoutChange: (layout: 'grid' | 'list') => void;
  onSortChange: (sort: string) => void;
  itemCount: number;
  category?: string;
  brand?: string;
  loading?: boolean;
};

const MiniShopHeader: React.FC<MiniShopHeaderProps> = ({
  onLayoutChange,
  onSortChange,
  itemCount,
  category,
  brand,
  loading = false,
}) => {
  const [currentLayout, setCurrentLayout] = useState<'grid' | 'list'>('grid');
  const [currentSort, setCurrentSort] = useState<string>('Characteristics');

  const handleLayoutChange = (layout: 'grid' | 'list') => {
    setCurrentLayout(layout);
    onLayoutChange(layout);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortValue = e.target.value;
    setCurrentSort(sortValue);
    onSortChange(sortValue);
  };

  const displayPath = [
    category && category !== 'All' ? category : null,
    brand && brand !== 'All' ? brand : null,
  ]
    .filter(Boolean)
    .join(' / ');

  return (
    <div className="mb-4 flex items-center justify-between rounded bg-white px-3 py-2 shadow-sm">
      <div className="text-sm text-gray-700">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
            Loading...
          </div>
        ) : (
          `${itemCount} items${displayPath ? ` in ${displayPath}` : ''}`
        )}
      </div>
      <div className="flex items-center gap-2">
        <select
          className="rounded bg-white p-2 text-sm shadow-sm"
          value={currentSort}
          onChange={handleSortChange}
        >
          <option>Characteristics</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest Arrivals</option>
        </select>
        <button
          onClick={() => handleLayoutChange('grid')}
          className={`flex h-8 w-8 items-center justify-center rounded shadow-sm ${currentLayout === 'grid' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        >
          <LayoutGrid />
        </button>
        <button
          onClick={() => handleLayoutChange('list')}
          className={`flex h-8 w-8 items-center justify-center rounded shadow-sm ${currentLayout === 'list' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        >
          <Rows3 />
        </button>
      </div>
    </div>
  );
};

export default MiniShopHeader;
