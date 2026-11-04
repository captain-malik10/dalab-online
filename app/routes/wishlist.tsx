import React, { useState, useEffect, useMemo } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import ProductCard from '~/components/ProductCard';
import { useWishlist } from '~/hooks/useWishlist';
import { useGuestWishlist } from '~/hooks/useGuestWishlist';
import { Link } from 'react-router';
import type { Product } from '~/types';
import { useProducts } from '~/hooks/useProducts';
import LoginReminderModal from '~/components/LoginReminderModal';

const RecommendedProducts = () => {
  const { wishlistItems } = useWishlist();

  const filter = useMemo(() => {
    if (!wishlistItems || wishlistItems.length === 0) {
      return null;
    }
    // Recommend based on the category of the first item
    return {
      categoryName: wishlistItems[0].category_name,
    };
  }, [wishlistItems]);

  const { products, loading, error } = useProducts(filter ?? undefined);

  const recommended = useMemo(() => {
    if (!products || !Array.isArray(wishlistItems)) return [];
    const wishlistedProductIds = new Set(wishlistItems.map((item) => item.productId));
    return products.filter((p) => !wishlistedProductIds.has(p.id)).slice(0, 5);
  }, [products, wishlistItems]);

  if (!filter || recommended.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded shadow mt-10">
      <h2 className="text-lg font-semibold mb-5 text-gray-900">You might also like</h2>
      {loading && <p>Loading recommendations...</p>}
      {error && <p className="text-red-500">Could not load recommendations.</p>}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {recommended.map((product) => (
            <ProductCard key={product.id} product={product} type="grid" />
          ))}
        </div>
      )}
    </div>
  );
};

export default function WishlistPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showLoginReminder, setShowLoginReminder] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  const authenticatedWishlist = useWishlist();
  const guestWishlist = useGuestWishlist();

  const { wishlistItems, loading, error } = isAuthenticated ? authenticatedWishlist : guestWishlist;

  useEffect(() => {
    if (isHydrated && !isAuthenticated && wishlistItems && wishlistItems.length > 0) {
      setShowLoginReminder(true);
    }
  }, [isHydrated, isAuthenticated, wishlistItems]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={{ Home: '/', Wishlist: '/wishlist' }} />
      <main className="container mx-auto px-4 py-8 min-h-screen">
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[350px] animate-pulse rounded bg-gray-200"></div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500">Error loading wishlist: {error.message}</p>}

        {!loading && !error && (
          <>
            {Array.isArray(wishlistItems) && wishlistItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {wishlistItems.map((item) => {
                  // Adapt WishlistItem to the full Product type for ProductCard
                  const product: Product = {
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    image_urls: item.image_urls,
                    description: item.description,
                    vendor_name: item.vendor_name,
                    category_name: item.category_name,
                    averageRating: item.averageRating ?? undefined,
                    totalReviews: item.totalReviews,
                    // Placeholders for fields not in wishlist data
                    vendor_id: 0,
                    category_id: 0,
                    stock: 1, // Assume in stock
                    isFeatured: false,
                    created_at: '',
                    updated_at: '',
                  };
                  return (
                    <div key={item.id} className="h-full">
                      <ProductCard product={product} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">Your wishlist is empty.</p>
                <Link to="/shop" className="text-blue-600 hover:underline mt-2 inline-block">
                  Discover products
                </Link>
              </div>
            )}
          </>
        )}
        <section>
          <RecommendedProducts />
        </section>
      </main>
      <Footer />
      <LoginReminderModal
        isOpen={showLoginReminder}
        onClose={() => setShowLoginReminder(false)}
        itemCount={wishlistItems?.length || 0}
        listType="wishlist"
      />
    </div>
  );
}
