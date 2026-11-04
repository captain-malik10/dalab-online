import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ShoppingCart, Heart, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useVendorPublic } from '~/hooks/useVendorPublic';
import ProductCard from '~/components/ProductCard';
import ProductCardSkeleton from '~/components/ProductCardSkeleton';
import { useProducts } from '~/hooks/useProducts';
import { API_BASE } from '~/config/api';
import { useUser } from '~/hooks/useUser'; // Import useUser hook

export default function StoreDetails() {
  const { id } = useParams<{ id: string }>();
  const { vendor, loading, error } = useVendorPublic(id || '');
  const { user, loading: userLoading, error: userError } = useUser(); // Fetch logged-in user

  const [activeTab, setActiveTab] = useState('Details');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Form states for Contact tab
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // States for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  // Autofill form if user is logged in
  useEffect(() => {
    if (user && !userLoading) {
      setContactName(user.name || '');
      setContactEmail(user.email || '');
    }
  }, [user, userLoading]);

  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts({
    vendorName: vendor?.store_name,
  });

  if (loading || userLoading) {
    // Include userLoading in main loading check
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header breadcrumbs={{ Home: '/', Stores: '/stores', 'Loading...': '' }} />
        <main className="max-w-7xl w-full mx-auto px-6 py-10">
          <div>Loading store details...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || userError) {
    // Include userError in main error check
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header breadcrumbs={{ Home: '/', Stores: '/stores', Error: '' }} />
        <main className="max-w-7xl w-full mx-auto px-6 py-10">
          <div className="text-red-500">Error loading details: {error || userError}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header breadcrumbs={{ Home: '/', Stores: '/stores', 'Not Found': '' }} />
        <main className="max-w-7xl w-full mx-auto px-6 py-10">
          <div>Store not found.</div>
        </main>
        <Footer />
      </div>
    );
  }

  const initial = vendor.store_name ? vendor.store_name.charAt(0).toUpperCase() : '';

  const breadcrumbs = {
    Home: '/',
    Shop: '/shop',
    [vendor.store_name]: `/store/${id}`,
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_BASE}/contact/store-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: id,
          senderName: contactName,
          senderEmail: contactEmail,
          message: contactMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Success
      setSubmitStatus('success');
      // Clear form fields
      setContactName(user?.name || ''); // Re-autofill name if logged in
      setContactEmail(user?.email || ''); // Re-autofill email if logged in
      setContactMessage('');

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error: any) {
      console.error('Error sending contact message:', error);
      setSubmitStatus('error');

      // Clear error message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={breadcrumbs} />
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="bg-white p-6 rounded shadow flex items-center gap-6">
          <div className="w-32 h-32 flex-shrink-0 rounded overflow-hidden border border-gray-200">
            {vendor.logo_url ? (
              <img
                src={vendor.logo_url}
                alt={vendor.store_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold text-5xl">
                {initial}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{vendor.store_name}</h1>
            <p className="text-gray-600 text-lg mb-2">{vendor.email}</p>
            <div className="flex items-center text-gray-500 text-sm">
              <Star size={16} className="text-yellow-400 mr-1" fill="currentColor" />
              <span>
                {vendor.averageRating.toFixed(1)} ({vendor.totalReviews} reviews)
              </span>
              <span className="mx-2">•</span>
              <span>{vendor.product_count} products</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('Details')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'Details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('Products')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'Products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('Contact')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'Contact'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Contact
            </button>
          </div>

          <div>
            {activeTab === 'Details' && (
              <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                  <div className="font-semibold col-span-1">Description:</div>
                  <div className="col-span-2">{vendor.description || 'N/A'}</div>

                  <div className="font-semibold col-span-1">Location:</div>
                  <div className="col-span-2">
                    {vendor.city}, {vendor.country}
                  </div>

                  {vendor.district && (
                    <>
                      <div className="font-semibold col-span-1">District:</div>
                      <div className="col-span-2">{vendor.district}</div>
                    </>
                  )}

                  <div className="font-semibold col-span-1">Verification:</div>
                  <div className="col-span-2">
                    {vendor.isVerified ? 'Verified' : 'Not Verified'}
                  </div>

                  <div className="font-semibold col-span-1">Status:</div>
                  <div className="col-span-2">{vendor.status}</div>

                  <div className="font-semibold col-span-1">Member Since:</div>
                  <div className="col-span-2">
                    {new Date(vendor.created_at || '').toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Products' && (
              <div className="mt-4">
                {productsLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : productsError ? (
                  <div className="text-red-500">Error loading products: {productsError}</div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600">No products found for this store.</div>
                )}
              </div>
            )}

            {activeTab === 'Contact' && (
              <div className="mt-4 p-4 border rounded bg-gray-50">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Contact {vendor.store_name}
                </h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contactMessage"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="contactMessage"
                      name="contactMessage"
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>
                  {submitStatus === 'success' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                      ✓ Message sent successfully! The store owner will receive your message.
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                      ✗ Failed to send message. Please try again.
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
