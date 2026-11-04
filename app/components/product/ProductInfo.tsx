import { Heart, ShieldCheck, ShoppingCart, Smartphone, Star, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '~/hooks/useCart';
import { useGuestCart } from '~/hooks/useGuestCart';
import { useGuestWishlist } from '~/hooks/useGuestWishlist';
import { useWishlist } from '~/hooks/useWishlist';

interface ProductInfoProps {
  product: {
    id: number;
    name: string;
    price: number | string;
    description?: string;
    stock: number;
    image_urls?: string[];
    category_name?: string;
    vendor_name?: string;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    reviews: Array<{
      id: number;
      rating: number;
      comment: string;
      created_at: string;
      customer_name: string;
      customer_id: number;
    }>;
  };
}

// Updated to accept product and reviews props
export default function ProductInfo({ product, reviews }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

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

  const isWishlisted = Array.isArray(wishlistItems)
    ? wishlistItems.some((item) => item.productId === product.id)
    : false;

  let parsedImageUrls: string[] = [];
  if (product.image_urls) {
    try {
      if (Array.isArray(product.image_urls)) {
        if (product.image_urls.length > 0 && Array.isArray(product.image_urls[0])) {
          parsedImageUrls = product.image_urls[0];
        } else {
          parsedImageUrls = product.image_urls as string[];
        }
      } else if (typeof product.image_urls === 'string') {
        const parsed = JSON.parse(product.image_urls);
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

  const handleAddToCart = () => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      addAuthItem(product.id, quantity);
    } else {
      const productData = {
        name: product.name,
        price: product.price.toString(),
        image_urls: parsedImageUrls,
        category_name: product.category_name || '',
        vendor_name: product.vendor_name || '',
      };
      addGuestItem(product.id, quantity, productData);
    }
  };

  const handleToggleWishlist = () => {
    if (!isHydrated) return;

    if (isWishlisted) {
      if (isAuthenticated) {
        const wishlistItem = authWishlistItems.find((item) => item.productId === product.id);
        if (wishlistItem) {
          removeFromAuthWishlist(wishlistItem.id);
        }
      } else {
        removeFromGuestWishlist(product.id);
      }
    } else {
      if (isAuthenticated) {
        addToAuthWishlist(product.id);
      } else {
        const productData = {
          id: product.id,
          name: product.name,
          price: product.price.toString(),
          image_urls: parsedImageUrls,
          description: product.description || '',
          category_name: product.category_name || '',
          vendor_name: product.vendor_name || '',
          averageRating: reviews.averageRating || null,
          totalReviews: reviews.totalReviews || 0,
          timesSold: (product as any).timesSold || 0,
        };
        addToGuestWishlist(productData);
      }
    }
  };

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const inStock = product.stock > 0;
  const rating = Number(reviews.averageRating || 0);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-6">
      <h1 className="text-xl font-extrabold leading-snug text-[var(--color-dark)] sm:text-2xl">
        {product.name}
      </h1>
      <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-muted)]">
        <span className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={16}
              className={
                i <= Math.round(rating) ? 'fill-[#FFB020] text-[#FFB020]' : 'text-gray-300'
              }
            />
          ))}
        </span>
        {reviews.totalReviews > 0 ? (
          <span>
            <span className="font-semibold text-[var(--color-dark)]">{rating.toFixed(1)}</span> ·{' '}
            {reviews.totalReviews} review{reviews.totalReviews === 1 ? '' : 's'}
          </span>
        ) : (
          <span>No reviews yet</span>
        )}
      </div>

      <p className="mt-4 text-3xl font-extrabold text-[var(--color-dark)]">${price.toFixed(2)}</p>
      <p
        className={`mt-1 text-sm font-semibold ${
          !inStock ? 'text-[#DC2626]' : product.stock <= 8 ? 'text-[#9A6400]' : 'text-[#16A34A]'
        }`}
      >
        {!inStock
          ? 'Out of stock'
          : product.stock <= 8
            ? `Only ${product.stock} left — order soon`
            : 'In stock'}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-xl border border-[var(--color-border)]">
          <button
            type="button"
            className="px-3.5 py-2 text-lg hover:bg-gray-100 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center font-semibold">{quantity}</span>
          <button
            type="button"
            className="px-3.5 py-2 text-lg hover:bg-gray-100 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
            disabled={quantity >= product.stock}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          onClick={handleToggleWishlist}
          disabled={isUpdatingWishlist}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] hover:bg-gray-50 disabled:opacity-50"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={20} className={isWishlisted ? 'fill-[#DC2626] text-[#DC2626]' : ''} />
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isAddingToCart || !inStock}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB020] py-3.5 text-base font-bold text-[#0B1F3A] hover:bg-amber-400 disabled:opacity-50"
      >
        <ShoppingCart size={20} />{' '}
        {!inStock ? 'Out of stock' : isAddingToCart ? 'Adding…' : 'Add to cart'}
      </button>

      <ul className="mt-5 space-y-2.5 border-t border-[var(--color-border)] pt-5 text-sm text-[var(--color-dark)]">
        <li className="flex items-center gap-3">
          <Truck size={18} className="text-[#4189DD]" /> Same-day delivery in Mogadishu (order
          before 2pm)
        </li>
        <li className="flex items-center gap-3">
          <Smartphone size={18} className="text-[#16A34A]" /> Pay with EVC Plus or eDahab
        </li>
        <li className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-[#4189DD]" /> Sold by a verified local store
        </li>
      </ul>
    </div>
  );
}

ProductInfo.Skeleton = function ProductInfoSkeleton() {
  return (
    <div className="bg-white rounded shadow-sm p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
