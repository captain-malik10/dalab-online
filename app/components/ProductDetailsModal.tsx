import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Product {
  id: number;
  vendor_id: number;
  category_id: number;
  category_name?: string;
  name: string;
  price: number;
  description: string;
  image_urls: string[];
  isFeatured: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
  store_name: string;
  isVerified?: boolean;
  country?: string;
  city?: string;
  district?: string;
}

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  product: Product | null;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  product,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  let images: string[] = [];
  if (product.image_urls) {
    try {
      images = Array.isArray(product.image_urls)
        ? product.image_urls
        : JSON.parse(product.image_urls as any);
    } catch {
      images = [];
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded shadow-xl w-4/5 md:w-[600px] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>

              <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-gray-800">
                <div className="font-semibold">Price:</div>
                <div className="col-span-2">${Number(product.price).toFixed(2)}</div>

                <div className="font-semibold">Stock:</div>
                <div className="col-span-2">{product.stock}</div>

                <div className="font-semibold">Category:</div>
                <div className="col-span-2">{product.category_name || product.category_id}</div>

                <div className="font-semibold">Featured:</div>
                <div className="col-span-2">{product.isFeatured ? 'Yes' : 'No'}</div>

                <div className="font-semibold">Created At:</div>
                <div className="col-span-2">{new Date(product.created_at).toLocaleString()}</div>

                <div className="font-semibold">Last Updated:</div>
                <div className="col-span-2">{new Date(product.updated_at).toLocaleString()}</div>

                <div className="font-semibold">Store Name:</div>
                <div className="col-span-2">{product.store_name}</div>

                <div className="font-semibold">Vendor Verified:</div>
                <div className="col-span-2">{product.isVerified ? 'Yes' : 'No'}</div>

                <div className="font-semibold">Location:</div>
                <div className="col-span-2">{`${product.city || ''}, ${product.district || ''}, ${product.country || ''}`}</div>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-2 hide-scrollbar">
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name}-${idx}`}
                    className="w-12 h-12 object-cover rounded cursor-pointer border hover:border-gray-400 flex-shrink-0"
                    onClick={() => setSelectedImage(img)}
                  />
                ))
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <p className="text-xs text-gray-500">No Image</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end p-4 border-t gap-3">
            <button
              onClick={onClose}
              className="text-gray-600 bg-gray-100 hover:bg-gray-200 rounded px-5 py-2.5 text-sm font-medium"
            >
              Close
            </button>
            <button
              onClick={onDelete}
              className="text-white bg-red-600 hover:bg-red-700 rounded px-5 py-2.5 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Selected"
            className="max-w-[90%] max-h-[90%] rounded shadow-lg"
          />
        </div>
      )}
    </>
  );
};

export default ProductDetailsModal;
