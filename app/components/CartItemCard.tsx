import React from 'react';
import type { CartItem } from '~/hooks/useCart';

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (itemId: number, currentQuantity: number, change: number) => void;
  onRemove: (itemId: number) => void;
  isUpdating: boolean;
}

export default function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
  isUpdating,
}: CartItemCardProps) {
  return (
    <div className="flex items-center justify-between border-b last:border-none py-6">
      <div className="flex items-center space-x-6">
        <img
          src={
            item.image_urls?.[0] ||
            'https://i.pinimg.com/736x/82/0b/ef/820befe5c511f23c0c896a7fd508b5e9.jpg'
          }
          alt={item.name}
          className="w-24 h-24 rounded object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
          <p className="text-red-500 font-bold text-md mt-1">
            ${parseFloat(item.price).toFixed(2)}
          </p>
          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="text-sm text-gray-500 mt-2 hover:text-red-500 hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onQuantityChange(item.id, item.quantity, -1)}
          disabled={isUpdating}
          className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100 shadow-sm disabled:opacity-50"
        >
          -
        </button>
        <span className="font-bold text-lg">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.id, item.quantity, 1)}
          disabled={isUpdating}
          className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100 shadow-sm disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
}
