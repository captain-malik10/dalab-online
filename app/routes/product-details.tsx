import { useParams } from 'react-router';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import ProductGallery from '~/components/product/ProductGallery';
import ProductInfo from '~/components/product/ProductInfo';
import ProductDetailsTabs from '~/components/product/ProductDetailsTabs';
import StoreCard from '~/components/StoreCard';
import SimilarProducts from '~/components/product/SimilarProducts';
import { useProductDetails, type ProductDetailsResponse } from '~/hooks/useProductDetails';
import type { Product } from '~/types';

import ReviewSummary from '~/components/product/ReviewSummary';
import { openDalabChat } from '~/components/ChatAssistant';
import { Sparkles } from 'lucide-react';

function ProductDetailContent({ productDetails }: { productDetails: ProductDetailsResponse }) {
  const { id } = useParams<{ id: string }>();
  // Neutral brand placeholder when a product has no images
  const fallbackImages = ['/favicon.svg'];

  // Use API data or fallback to hardcoded data
  // Handle nested array structure from API
  let productImages = fallbackImages;
  if (productDetails.product.image_urls?.length > 0) {
    const imageUrls = productDetails.product.image_urls;
    if (Array.isArray(imageUrls[0])) {
      // If it's a nested array, take the first array
      productImages = imageUrls[0];
    } else {
      // If it's a direct array, use it as is
      productImages = imageUrls;
    }
  }

  const similarProducts =
    productDetails.relatedProducts?.length > 0
      ? productDetails.relatedProducts.map((product: any) => {
          // Handle nested image array structure
          let productImage = ''; // Default to empty string if no image
          if (product.image_urls?.length > 0) {
            if (Array.isArray(product.image_urls[0])) {
              productImage = product.image_urls[0][0] || '';
            } else {
              productImage = product.image_urls[0] || '';
            }
          }

          return {
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
            image_url: productImage,
            averageRating: product.averageRating ?? 0, // Use actual rating or default to 0
            totalReviews: product.totalReviews ?? 0, // Use actual reviews or default to 0
          };
        })
      : []; // Assign empty array if no related products

  const breadcrumbs = {
    Home: '/',
    Shop: '/shop',
    [productDetails.product.name]: `/product/${id}`,
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <Header breadcrumbs={breadcrumbs} />

      <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-6 sm:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <section className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-3 sm:p-4">
              <ProductGallery images={productImages} alt={productDetails.product.name} />
            </div>
            <div className="hidden lg:block">
              <ProductDetailsTabs
                product={productDetails.product}
                reviews={productDetails.reviews}
              />
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="space-y-4 lg:sticky lg:top-40">
              <ProductInfo product={productDetails.product} reviews={productDetails.reviews} />
              <button
                type="button"
                onClick={() =>
                  openDalabChat(
                    `Tell me about "${productDetails.product.name}" (product #${productDetails.product.id}). Is it a good choice, and what are similar options?`,
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4189DD] to-[#255FA6] px-4 py-3 font-bold text-white shadow hover:opacity-95"
              >
                <Sparkles size={18} className="text-[#FFB020]" />
                Ask Dalab AI about this product
              </button>
              <ReviewSummary productId={productDetails.product.id} />
              <StoreCard
                id={productDetails.store.id}
                name={productDetails.store.name}
                country={productDetails.store.country}
                city={productDetails.store.city}
                verified={productDetails.store.isVerified}
                shipsWorldwide={true}
                logo={productDetails.store.logo_url}
                description={productDetails.store.description}
              />
            </div>
          </aside>

          <section className="lg:hidden">
            <ProductDetailsTabs product={productDetails.product} reviews={productDetails.reviews} />
          </section>
        </div>

        {similarProducts.length > 0 && (
          <section>
            <SimilarProducts products={similarProducts} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { productDetails, loading, error, refetch } = useProductDetails(id || '');

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
        <Header breadcrumbs={{ Home: '/', Shop: '/shop' }} />
        <main className="max-w-7xl w-full mx-auto px-6 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No product found
  if (!loading && !productDetails) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
        <Header breadcrumbs={{ Home: '/', Shop: '/shop' }} />
        <main className="max-w-7xl w-full mx-auto px-6 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
              <p className="text-gray-600">The product you're looking for doesn't exist.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
        <Header breadcrumbs={{ Home: '/', Shop: '/shop' }} />
        <main className="max-w-7xl w-full mx-auto px-6 py-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8">
              <div className="bg-white rounded shadow p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-6 flex">
                    <div className="flex-grow">
                      <ProductGallery.Skeleton />
                    </div>
                  </div>
                  <div className="lg:col-span-6 flex">
                    <div className="flex-grow">
                      <ProductInfo.Skeleton />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <ProductDetailsTabs.Skeleton />
              </div>
            </section>
            <aside className="lg:col-span-4">
              <div className="sticky top-6">
                <StoreCard.Skeleton />
              </div>
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!productDetails) {
    return null; // This should not happen due to the checks above, but TypeScript needs it
  }

  return <ProductDetailContent productDetails={productDetails} />;
}
