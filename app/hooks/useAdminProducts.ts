import { useState, useCallback } from 'react';

interface Product {
  id: number;
  vendor_id: number;
  category_id: number;
  name: string;
  price: number;
  description: string;
  image_urls: string[];
  isFeatured: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
  store_name: string;
  store_description?: string;
  country?: string;
  city?: string;
  district?: string;
  logo_url?: string;
  isVerified?: boolean;
  vendor_status?: string;
  category_name?: string;
}

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch product details');
      const product: Product = await res.json();
      setSelectedProduct(product);
      return product;
    } catch (err: any) {
      setError(err.message || 'Error fetching product details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3001/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete product');
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (selectedProduct?.id === id) setSelectedProduct(null);
        return true;
      } catch (err: any) {
        setError(err.message || 'Error deleting product');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedProduct],
  );

  return {
    products,
    selectedProduct,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    deleteProduct,
  };
}
