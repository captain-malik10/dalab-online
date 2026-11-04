import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { MoreVertical, Plus } from 'lucide-react';
import Table from '~/components/Table';
import { useVendorProducts } from '~/hooks/useVendorProducts';
import type { Product } from '~/types';
import ProductActionsPopover from '~/components/ProductActionsPopover';
import ProductModal from '~/components/ProductModal';
import { apiClient } from '~/api';

export default function ProductsPage() {
  const { products, loading, error, deleteProduct, refetch } = useVendorProducts();
  const [popoverOpen, setPopoverOpen] = useState<number | null>(null);
  const navigate = useNavigate();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit'>('new');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const handleOpenNewModal = () => {
    setModalMode('new');
    setSelectedProduct(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
    setPopoverOpen(null);
  };

  const handleDelete = (productId: number) => {
    deleteProduct(productId);
    setPopoverOpen(null);
  };

  const handleSaveProduct = async (formData: FormData, productId?: number) => {
    const url = productId ? `/vendors/products/${productId}` : '/vendors/products';
    const method = productId ? 'PUT' : 'POST';

    try {
      await apiClient(url, {
        method: method,
        body: formData,
      });
      await refetch();
    } catch (err: any) {
      // The apiClient will handle 401, but we can catch other errors.
      console.error('Failed to save product:', err);
      // Optionally, re-throw or set an error state to show in the UI
      throw err;
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Product },
    { header: 'Category', accessor: 'category_name' as keyof Product },
    {
      header: 'Price',
      accessor: 'price' as keyof Product,
      Cell: ({ row }: { row: Product }) => <span>{`$${row.price}`}</span>,
    },
    { header: 'Stock', accessor: 'stock' as keyof Product },
    {
      header: 'Actions',
      accessor: 'id' as keyof Product,
      Cell: ({ row }: { row: Product }) => (
        <div className="relative">
          <button onClick={() => setPopoverOpen(popoverOpen === row.id ? null : row.id)}>
            <MoreVertical size={20} />
          </button>
          <ProductActionsPopover
            isOpen={popoverOpen === row.id}
            onClose={() => setPopoverOpen(null)}
            onEdit={() => handleOpenEditModal(row)}
            onDelete={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-2 text-gray-600 mb-6">
            Manage your store's products here. You can add, edit, and delete products.
          </p>
        </div>
        <button
          onClick={handleOpenNewModal}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span>Add Product</span>
        </button>
      </div>

      <Table columns={columns} data={products || []} />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
