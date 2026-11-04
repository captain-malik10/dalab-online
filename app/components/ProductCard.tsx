import { Heart, ShoppingCart, Star, Store } from 'lucide-react';
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
  const fallbackImage = '/favicon.svg';

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
  const stock = (product as Product).stock;
  const rating = Number(averageRating ?? 0);

  const heartButton = (
    <button
      aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={handleToggleFavorite}
      disabled={isUpdatingWishlist}
      className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110 disabled:opacity-50"
    >
      <Heart
        size={18}
        className={isFavorite ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[var(--color-dark)]'}
      />
    </button>
  );

  const badges = (
    <div className="absolute left-2 top-2 z-20 flex flex-col items-start gap-1">
      {isFeatured && hasDiscount && (
        <span className="rounded-full bg-[#DC2626] px-2 py-0.5 text-xs font-bold text-white">
          -{discountPercentage}%
        </span>
      )}
      {typeof stock === 'number' && stock > 0 && stock <= 8 && (
        <span className="rounded-full bg-[#FFB020] px-2 py-0.5 text-[11px] font-bold text-[#0B1F3A]">
          Only {stock} left
        </span>
      )}
    </div>
  );

  const priceBlock = (
    <div className="leading-tight">
      <p
        className={`font-extrabold text-[var(--color-dark)] ${type === 'list' ? 'text-xl' : 'text-lg'}`}
      >
        {currency}
        {(hasDiscount ? discountedPrice : safePrice).toFixed(2)}
      </p>
      {hasDiscount && (
        <p className="text-xs text-gray-400 line-through">
          {currency}
          {safePrice.toFixed(2)}
        </p>
      )}
    </div>
  );

  const addButton = (
    <button
      aria-label="Add to cart"
      onClick={handleAddToCart}
      disabled={isAddingToCart || stock === 0}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#FFB020] px-3 py-2 text-sm font-bold text-[#0B1F3A] transition hover:bg-amber-400 disabled:opacity-50"
    >
      <ShoppingCart className="h-4 w-4" />
      {stock === 0 ? 'Sold out' : isAddingToCart ? 'Adding…' : 'Add'}
    </button>
  );

  const details = (
    <>
      {vendor_name && (
        <p className="mb-1 flex items-center gap-1 truncate text-xs font-semibold text-[#255FA6]">
          <Store size={12} className="shrink-0" /> {vendor_name}
        </p>
      )}
      <h3
        className={`line-clamp-2 font-semibold leading-snug text-[var(--color-dark)] ${type === 'list' ? 'text-lg' : 'min-h-[2.5rem] text-sm'}`}
      >
        {name}
      </h3>
      {type === 'list' && (
        <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">{product.description}</p>
      )}
      <div className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-muted)]">
        <Star
          size={14}
          className={rating > 0 ? 'fill-[#FFB020] text-[#FFB020]' : 'text-gray-300'}
        />
        {rating > 0 ? (
          <span>
            <span className="font-semibold text-[var(--color-dark)]">{rating.toFixed(1)}</span> (
            {totalReviews ?? 0})
          </span>
        ) : (
          <span>No reviews yet</span>
        )}
        {category_name && type === 'list' && <span className="ml-2">· {category_name}</span>}
      </div>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
        {priceBlock}
        {addButton}
      </div>
    </>
  );

  if (type === 'list') {
    return (
      <Link
        to={`/product/${productId}`}
        className={`group relative flex w-full gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-3 transition hover:shadow-lg ${className}`}
      >
        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-[var(--color-light)] sm:h-44 sm:w-44">
          {badges}
          <img
            src={productImage}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col py-1">{details}</div>
        {heartButton}
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${productId}`}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-2 transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--color-light)]">
        {badges}
        {heartButton}
        <img
          src={productImage}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3">{details}</div>
    </Link>
  );
}
