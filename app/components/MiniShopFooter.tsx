import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniShopFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

const MiniShopFooter: React.FC<MiniShopFooterProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="mt-6 flex items-center justify-between rounded bg-white px-4 py-3 shadow-sm">
        <div className="text-sm text-gray-700">
          Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </div>
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Items per page:</span>
            <select
              className="rounded border border-gray-300 px-2 py-1 text-sm"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 flex items-center justify-between rounded bg-white px-4 py-3 shadow-sm">
      <div className="text-sm text-gray-700">
        Showing {startItem}-{endItem} of {totalItems} items
      </div>

      <div className="flex items-center gap-2">
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-700">Items per page:</span>
            <select
              className="rounded border border-gray-300 px-2 py-1 text-sm"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`flex h-8 w-8 items-center justify-center rounded border ${
              currentPage === 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          {generatePageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageClick(page)}
              disabled={typeof page !== 'number'}
              className={`flex h-8 w-8 items-center justify-center rounded border text-sm ${
                page === currentPage
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : typeof page === 'number'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-transparent text-gray-400 cursor-default'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`flex h-8 w-8 items-center justify-center rounded border ${
              currentPage === totalPages
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniShopFooter;
