import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Footer from '~/components/Footer';
import Header from '~/components/Header';
import SearchFilter from '../components/SearchFilter';
import ProductCard from '~/components/ProductCard';
import MiniShopHeader from '~/components/MiniShopHeader';
import MiniShopFooter from '~/components/MiniShopFooter';
import { useProducts } from '~/hooks/useProducts';
import type { Product } from '~/types';
import AuthMessage from '../components/AuthMessage';
import { SlidersHorizontal, X } from 'lucide-react';

export default function ShopPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  // The URL is the source of truth for the category, so header/footer links to
  // /shop?category=X update the page even though the shop route stays mounted.
  const initialCategory = searchParams.get('category') || '';
  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  // Below md the filters live in a drawer opened by the "Filters" button
  const [filtersOpen, setFiltersOpen] = useState(false);
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

    if (initialCategory) {
      apiFilters.categoryName = initialCategory;
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
  }, [filters, initialCategory]);

  const { products, loading, error } = useProducts(apiFilters);

  // Sort products based on sort order
  const sortedProducts = useMemo(() => {
    if (!products) return [];

    // Free-text search from the hero / ?q= links
    const sorted = searchQuery
      ? products.filter((p) =>
          [p.name, p.description, (p as any).vendor_name, (p as any).category_name]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(searchQuery)),
        )
      : [...products];

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
  }, [products, sortOrder, searchQuery]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setFiltersOpen(false);
  }, [initialCategory, searchQuery]);

  const handleLayoutChange = (layout: 'grid' | 'list') => {
    setViewLayout(layout);
  };

  const handleSortChange = (sort: string) => {
    setSortOrder(sort);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleFiltersChange = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams(window.location.search);
      if ((params.get('category') || '') !== (newFilters.categories || '')) {
        if (newFilters.categories) params.set('category', newFilters.categories);
        else params.delete('category');
        const qs = params.toString();
        navigate(qs ? `/shop?${qs}` : '/shop');
      }
      setFilters(newFilters);
      setCurrentPage(1); // Reset to first page when filters change
    },
    [navigate],
  );

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
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--color-dark)] md:hidden"
            >
              <SlidersHorizontal size={18} className="text-[#4189DD]" />
              Filters
              {initialCategory && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-[#255FA6]">
                  {initialCategory}
                </span>
              )}
            </button>

            {/* One SearchFilter instance: a drawer on phones, a sticky sidebar from md up */}
            <div
              className={`${filtersOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} md:z-auto md:block md:w-64 md:shrink-0 md:self-start md:sticky md:top-40`}
              role={filtersOpen ? 'dialog' : undefined}
              aria-label={filtersOpen ? 'Filters' : undefined}
            >
              <div
                className="absolute inset-0 bg-[#0B1F3A]/50 md:hidden"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="relative ml-auto flex h-full w-80 max-w-[85%] flex-col overflow-y-auto bg-white md:ml-0 md:h-auto md:w-auto md:max-w-none md:overflow-visible md:bg-transparent">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4 md:hidden">
                  <p className="text-lg font-bold">Filters</p>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-gray-100"
                    aria-label="Close filters"
                  >
                    <X size={22} />
                  </button>
                </div>
                <div className="p-4 md:p-0">
                  <SearchFilter
                    onFiltersChange={handleFiltersChange}
                    initialCategory={initialCategory}
                  />
                </div>
                <div className="sticky bottom-0 mt-auto border-t border-[var(--color-border)] bg-white p-4 md:hidden">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="w-full rounded-xl bg-[#4189DD] py-3 font-bold text-white hover:bg-[#2F74C8]"
                  >
                    Show {sortedProducts.length} products
                  </button>
                </div>
              </div>
            </div>

            <main className="flex-1">
              <MiniShopHeader
                onLayoutChange={handleLayoutChange}
                onSortChange={handleSortChange}
                itemCount={sortedProducts.length}
                category={initialCategory}
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
                        ? 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'
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
      <Footer />
    </div>
  );
}
