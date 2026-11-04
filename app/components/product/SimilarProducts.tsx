import React from 'react';
import ProductCard from '../ProductCard';
import type { SimilarProduct } from '~/types';

interface SimilarProductsProps {
  products: SimilarProduct[];
}

export default function SimilarProducts({ products }: SimilarProductsProps) {
  return (
    <div className="bg-white p-6 rounded shadow mt-10">
      <h2 className="text-lg font-semibold mb-5 text-gray-900">Similar Products</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} type="grid" />
        ))}
      </div>
    </div>
  );
}
