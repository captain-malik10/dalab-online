import { ShoppingCart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useCart } from '~/hooks/useCart';
import { useGuestCart } from '~/hooks/useGuestCart';
import { useGuestWishlist } from '~/hooks/useGuestWishlist';
import { useWishlist } from '~/hooks/useWishlist';
import { Link } from 'react-router'; // Import Link

import type { Product, SimilarProduct } from '../types';

type ProductCardProps = {
  product: Product | SimilarProduct;
  // Removed 'to' and 'href' props as the entire card will be a Link
  currency?: string;
  className?: string;
  type?: 'grid' | 'list';
  isFeatured?: boolean;
};

export default function ProductCard({
  product,
  currency = '$',
  className = '',
  type = 'grid',
  isFeatured = false,
}: ProductCardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle authentication check after hydration
  useEffect(() => {
    setIsHydrated(true);
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  const authenticatedCart = useCart();
  const guestCart = useGuestCart();

  const { addItem: addAuthItem, isUpdating: isUpdatingAuthCart } = authenticatedCart;
  const { addItem: addGuestItem, isUpdating: isUpdatingGuestCart } = guestCart;
  const isAddingToCart = isUpdatingAuthCart || isUpdatingGuestCart;

  const authenticatedWishlist = useWishlist();
  const guestWishlist = useGuestWishlist();

  const {
    wishlistItems: authWishlistItems,
    addItem: addToAuthWishlist,
    removeItem: removeFromAuthWishlist,
    isUpdating: isUpdatingAuthWishlist,
  } = authenticatedWishlist;

  const {
    wishlistItems: guestWishlistItems,
    addItem: addToGuestWishlist,
    removeItem: removeFromGuestWishlist,
    isUpdating: isUpdatingGuestWishlist,
  } = guestWishlist;

  const wishlistItems = isAuthenticated ? authWishlistItems : guestWishlistItems;
  const isUpdatingWishlist = isUpdatingAuthWishlist || isUpdatingGuestWishlist;

  const {
    id: productId,
    name,
    price: rawPrice,
    image_url,
    image_urls,
    discount: productDiscount,
    vendor_name,
    category_name,
    averageRating,
    totalReviews,
  } = product as Product & { vendor_name?: string; category_name?: string };

  const isFavorite = Array.isArray(wishlistItems)
    ? wishlistItems.some((item) => item.productId === productId)
    : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click from propagating to the Link
    if (!productId || !isHydrated) return;

    if (isAuthenticated) {
      addAuthItem(productId, 1);
    } else {
      const productData = {
        name,
        price: safePrice.toString(),
        image_urls: parsedImageUrls,
        category_name,
        vendor_name,
      };
      addGuestItem(productId, 1, productData);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click from propagating to the Link
    if (!productId || !isHydrated) return;

    if (isFavorite) {
      if (isAuthenticated) {
        const wishlistItem = authWishlistItems.find((item) => item.productId === productId);
        if (wishlistItem) {
          removeFromAuthWishlist(wishlistItem.id);
        }
      } else {
        removeFromGuestWishlist(productId);
      }
    } else {
      if (isAuthenticated) {
        addToAuthWishlist(productId);
      } else {
        const productData = {
          id: productId,
          name,
          price: safePrice.toString(),
          image_urls: parsedImageUrls,
          description: product.description || '',
          category_name: category_name || '',
          vendor_name: vendor_name || '',
          averageRating: averageRating || null,
          totalReviews: totalReviews || 0,
        };
        addToGuestWishlist(productData);
      }
    }
  };

  // Convert price to number (API returns string)
  const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice || 0;
  const discount = productDiscount ?? 0;

  // Ensure price is a valid number
  const safePrice = isNaN(price) ? 0 : price;
  const fallbackImage =
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=2596&auto=format&fit=crop&ixlib=rb-4.0.3';

  // Parse image_urls JSON array from database
  let parsedImageUrls: string[] = [];
  if (image_urls) {
    try {
      if (Array.isArray(image_urls)) {
        if (image_urls.length > 0 && Array.isArray(image_urls[0])) {
          parsedImageUrls = image_urls[0];
        } else {
          parsedImageUrls = image_urls;
        }
      } else if (typeof image_urls === 'string') {
        const parsed = JSON.parse(image_urls);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          parsedImageUrls = parsed[0];
        } else {
          parsedImageUrls = parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to parse image_urls:', error);
      parsedImageUrls = [];
    }
  }

  const productImage =
    image_url ||
    (parsedImageUrls && parsedImageUrls.length > 0 ? parsedImageUrls[0] : fallbackImage);

  const discountedPrice = safePrice - discount;
  const hasDiscount = discount > 0;
  const discountPercentage = hasDiscount ? Math.round((discount / safePrice) * 100) : 0;

  const ImageElement = (
    <img
      src={productImage}
      alt={name}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
    />
  );

  // Removed 'imageSection' as the entire card will be a Link
  // Removed 'href || to' from h3 as the entire card will be a Link

  const commonContent = (
    <>
      <h3
        className={`mb-1 truncate font-semibold text-gray-900 ${type === 'list' ? 'text-lg' : 'text-sm'}`}
      >
        {name}
      </h3>
      <p className={`mb-2 text-gray-500 line-clamp-2 ${type === 'list' ? 'text-sm' : 'text-xs'}`}>
        {product.description}
      </p>

      {(vendor_name || category_name) && (
        <div className={`mb-2 text-gray-400 ${type === 'list' ? 'text-xs' : 'text-xs'}`}>
          {vendor_name && <span className="mr-2">by {vendor_name}</span>}
          {category_name && <span>in {category_name}</span>}
        </div>
      )}

      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            const avgRating = averageRating ?? 0;

            return (
              <span key={i}>
                {ratingValue <= avgRating ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-yellow-400"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-gray-300"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </span>
            );
          })}
          <span className="ml-2 text-sm text-gray-600">({totalReviews ?? 0})</span>
        </div>
        <div className="text-right">
          {hasDiscount ? (
            <>
              <p className={`font-bold text-red-500 ${type === 'list' ? 'text-lg' : 'text-sm'}`}>
                {currency}
                {discountedPrice.toFixed(2)}
              </p>
              <p
                className={`text-gray-400 line-through ${type === 'list' ? 'text-sm' : 'text-xs'}`}
              >
                {currency}
                {safePrice.toFixed(2)}
              </p>
            </>
          ) : (
            <p className={`font-bold text-red-500 ${type === 'list' ? 'text-lg' : 'text-sm'}`}>
              {currency}
              {safePrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <button
          aria-label="Add to cart"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="inline-flex items-center justify-center rounded bg-blue-500 px-4 py-2 w-full text-white shadow transition-colors hover:bg-blue-600 text-sm disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAddingToCart ? 'Adding...' : 'Add to cart'}
        </button>
      </div>
    </>
  );

  if (type === 'list') {
    return (
      <Link
        to={`/product/${productId}`}
        className={`relative flex h-[200px] w-full overflow-hidden rounded bg-white shadow-sm ${className}`}
      >
        {isFeatured && hasDiscount && (
          <div className="absolute top-2 left-2 z-20 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
            -{discountPercentage}%
          </div>
        )}

        <div className="h-full w-[200px] flex-shrink-0 overflow-hidden">{ImageElement}</div>

        <div className="flex flex-col flex-1 p-3 justify-between">{commonContent}</div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${productId}`}
      className={`relative flex h-[350px] w-full flex-col overflow-hidden rounded bg-white shadow-sm ${className}`}
    >
      {isFeatured && hasDiscount && (
        <div className="absolute top-2 left-2 z-20 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
          -{discountPercentage}%
        </div>
      )}

      <button
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        onClick={handleToggleFavorite}
        disabled={isUpdatingWishlist}
        className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded bg-white/90 text-red-500 shadow-sm disabled:opacity-50"
      >
        {isFavorite ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.682 4.318 12.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
        )}
      </button>

      <div className="h-[180px] w-full overflow-hidden">{ImageElement}</div>

      <div className="flex flex-col flex-1 px-2 py-1 justify-between">{commonContent}</div>
    </Link>
  );
}
