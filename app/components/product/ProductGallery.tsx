import { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  alt?: string;
}

export default function ProductGallery({ images, alt = 'Product' }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <div className="w-full aspect-square flex items-center justify-center border rounded overflow-hidden mb-4">
        <img
          src={selectedImage}
          alt={alt}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      <div className="flex gap-3 justify-center">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            className={`w-20 h-20 border-2 rounded overflow-hidden ${
              selectedImage === img ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400'
            } transition-all duration-200`}
          >
            <img
              src={img}
              alt={`${alt} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

ProductGallery.Skeleton = function ProductGallerySkeleton() {
  return (
    <div className="bg-white p-6 rounded shadow-sm animate-pulse">
      <div className="w-full aspect-square bg-gray-200 rounded mb-4"></div>
      <div className="flex gap-3 justify-center">
        <div className="w-20 h-20 bg-gray-200 rounded"></div>
        <div className="w-20 h-20 bg-gray-200 rounded"></div>
        <div className="w-20 h-20 bg-gray-200 rounded"></div>
        <div className="w-20 h-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
