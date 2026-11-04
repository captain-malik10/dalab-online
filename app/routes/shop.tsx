import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router';
import Header from '~/components/Header';
import SearchFilter from '../components/SearchFilter';
import ProductCard from '~/components/ProductCard';
import MiniShopHeader from '~/components/MiniShopHeader';
import MiniShopFooter from '~/components/MiniShopFooter';
import { useProducts } from '~/hooks/useProducts';
import type { Product } from '~/types';
import AuthMessage from '../components/AuthMessage';

export default function ShopPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || '';

  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<string>('Characteristics');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filters, setFilters] = useState({
    categories: initialCategory,
    vendors: [] as string[],
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    featured: undefined as boolean | undefined,
  });

  // Convert filters to API format
  const apiFilters = useMemo(() => {
    const apiFilters: any = {};

    if (filters.categories) {
      apiFilters.categoryName = filters.categories;
    }

    if (filters.vendors.length > 0) {
      apiFilters.vendorName = filters.vendors[0]; // API currently supports single vendor
    }

    if (filters.minPrice !== undefined) {
      apiFilters.minPrice = filters.minPrice;
    }

    if (filters.maxPrice !== undefined) {
      apiFilters.maxPrice = filters.maxPrice;
    }

    if (filters.featured !== undefined) {
      apiFilters.featured = filters.featured;
    }

    return apiFilters;
  }, [filters]);

  const { products, loading, error } = useProducts(apiFilters);

  // Sort products based on sort order
  const sortedProducts = useMemo(() => {
    if (!products) return [];

    const sorted = [...products];

    switch (sortOrder) {
      case 'Price: Low to High':
        return sorted.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceA - priceB;
        });
      case 'Price: High to Low':
        return sorted.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceB - priceA;
        });
      case 'Newest Arrivals':
        return sorted.sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
        );
      default:
        return sorted;
    }
  }, [products, sortOrder]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleLayoutChange = (layout: 'grid' | 'list') => {
    setViewLayout(layout);
  };

  const handleSortChange = (sort: string) => {
    setSortOrder(sort);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  return (
    <div className="min-h-screen">
      <Header breadcrumbs={{ Home: '/', Shop: '/shop' }} />
      <div className="p-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <aside className="md:w-64 md:sticky md:top-0 md:self-start">
              <SearchFilter
                onFiltersChange={handleFiltersChange}
                initialCategory={initialCategory}
              />
            </aside>

            <main className="flex-1">
              <MiniShopHeader
                onLayoutChange={handleLayoutChange}
                onSortChange={handleSortChange}
                itemCount={sortedProducts.length}
                category={filters.categories}
                brand={filters.vendors[0]}
                loading={loading}
              />

              {error && (
                // <div className="mb-4 rounded bg-red-50 p-4">
                //   <div className="text-sm text-red-700">Error loading products: {error}</div>
                // </div>
                <AuthMessage message={error} type="error" />
              )}

              {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-[350px] animate-pulse rounded bg-gray-200"></div>
                  ))}
                </div>
              ) : paginatedProducts.length > 0 ? (
                <>
                  <div
                    className={
                      viewLayout === 'grid'
                        ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'flex flex-col gap-4'
                    }
                  >
                    {paginatedProducts.map((product) => (
                      <div key={product.id} className="h-full">
                        <ProductCard
                          product={product}
                          type={viewLayout}
                          isFeatured={product.isFeatured || false}
                        />
                      </div>
                    ))}
                  </div>

                  <MiniShopFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-500 text-lg mb-2">No products found</div>
                  <div className="text-gray-400 text-sm">
                    Try adjusting your filters or search criteria
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
