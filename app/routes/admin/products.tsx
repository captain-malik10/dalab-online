import React, { useState, useEffect } from 'react';
import Table, { type Column } from '../../components/Table';
import { MoreVertical } from 'lucide-react';
import AdminProductActionsPopover from '../../components/AdminProductActionsPopover';
import ProductDetailsModal from '../../components/ProductDetailsModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import type { Product } from '~/types';

export default function ProductsPage() {
  const {
    products,
    selectedProduct,
    fetchProducts,
    fetchProductById,
    deleteProduct,
    loading,
    error,
  } = useAdminProducts();

  const [popoverOpen, setPopoverOpen] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setIsConfirmModalOpen(true);
    setPopoverOpen(null);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      const success = await deleteProduct(productToDelete);
      if (success) {
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
        setIsModalOpen(false);
      }
    }
  };

  const handleDetails = async (id: number) => {
    await fetchProductById(id);
    setIsModalOpen(true);
    setPopoverOpen(null);
  };

  const columns: Column<Product>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Store', accessor: 'store_name' },
    {
      header: 'Price',
      accessor: 'price',
      Cell: ({ value }: { value: string }) => `$${Number(value).toFixed(2)}`,
    },
    { header: 'Stock', accessor: 'stock' },
    {
      header: 'Actions',
      accessor: 'id',
      Cell: ({ row }: { row: Product }) => (
        <div className="relative">
          <button onClick={() => setPopoverOpen(popoverOpen === row.id ? null : row.id)}>
            <MoreVertical size={20} />
          </button>
          <AdminProductActionsPopover
            isOpen={popoverOpen === row.id}
            onClose={() => setPopoverOpen(null)}
            onDetails={() => handleDetails(row.id)}
            onDelete={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Products</h1>
      <p className="mt-2 text-gray-600 mb-6">
        Here you can manage all the products on the platform.
      </p>
      <Table
        columns={columns}
        data={products || []}
        itemsPerPage={10}
        noDataMessage="No products found"
      />
      <ProductDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={() => selectedProduct && handleDelete(selectedProduct.id)}
        product={selectedProduct}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
