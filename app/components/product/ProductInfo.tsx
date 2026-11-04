import { Heart, ShoppingCart } from 'lucide-react';
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

  // Use real product data with fallback values
  const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const oldPrice = basePrice * 1.5; // Old price is 1.5x the current price
  const discount = oldPrice - basePrice; // Calculate discount amount
  const discountPercentage = Math.round((discount / oldPrice) * 100);

  // computed values
  const priceAfterDiscount = basePrice; // Current price is already discounted

  return (
    <div className="bg-white rounded shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">{product.name}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {'⭐'.repeat(Math.round(reviews.averageRating)) + ' '}
        {reviews.averageRating.toFixed(1)} average rating based on {reviews.totalReviews} reviews
      </p>

      <div className="flex items-center gap-3 mb-3">
        <p className="text-3xl font-bold text-blue-600">${priceAfterDiscount.toFixed(2)}</p>
        <p className="text-gray-500 line-through text-lg">${oldPrice.toFixed(2)}</p>
        <span className="bg-red-100 text-red-600 px-2 py-1 text-sm rounded">
          {discountPercentage}% off
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <p className="text-sm font-medium text-gray-700">Quantity:</p>
        <div className="flex items-center border rounded overflow-hidden">
          <button
            className="px-3 py-1 text-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="px-4 py-1 text-black">{quantity}</span>
          <button
            className="px-3 py-1 text-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        <p className="text-sm text-gray-500">({product.stock} in stock)</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold flex justify-center items-center gap-2 disabled:opacity-50"
        >
          <ShoppingCart /> {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
        <button
          onClick={handleToggleWishlist}
          disabled={isUpdatingWishlist}
          className={`border py-3 rounded flex items-center justify-center gap-4 font-medium disabled:opacity-50 ${
            isWishlisted
              ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-[#9A6400] hover:bg-[var(--color-accent)]/30'
              : 'border-gray-400 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isWishlisted ? (
            <>
              <Heart fill="#ef4444" strokeWidth={0} />
              <p>Saved</p>
            </>
          ) : (
            <>
              <Heart />
              <p>Save to Wishlist</p>
            </>
          )}
        </button>
      </div>
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
