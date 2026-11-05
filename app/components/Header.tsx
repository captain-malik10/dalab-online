import React, { useState, useRef, useEffect, type FormEvent } from 'react';
import Logo from './Logo';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  Sparkles,
  Truck,
  Store,
  Package,
} from 'lucide-react';
import { useCart } from '~/hooks/useCart';
import { useWishlist } from '~/hooks/useWishlist';
import { Link, useNavigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import ProfilePopover from './ProfilePopover';
import { useSearch } from '~/hooks/useSearch';
import { openDalabChat } from './ChatAssistant';

type BreadcrumbProps = {
  [key: string]: string;
};

interface HeaderProps {
  breadcrumbs?: BreadcrumbProps;
}

export const STORE_CATEGORIES = [
  'Electronics',
  'Phones & Accessories',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Sports',
];

const categoryLink = (name: string) => `/shop?category=${encodeURIComponent(name)}`;

const firstImage = (urls: unknown): string | undefined => {
  const first = Array.isArray(urls) ? urls[0] : undefined;
  return Array.isArray(first) ? first[0] : (first as string | undefined);
};

const Header: React.FC<HeaderProps> = ({ breadcrumbs }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { searchResults, loading } = useSearch(searchQuery);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
      // The search box is rendered twice (desktop + mobile), so match either one
      if (!(event.target as Element).closest?.('[data-header-search]')) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowResults(false);
    const q = searchQuery.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  const badge = (count?: number) =>
    count && count > 0 ? (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFB020] px-1 text-[11px] font-bold text-[#0B1F3A]">
        {count}
      </span>
    ) : null;

  const searchBox = (
    <form
      data-header-search
      onSubmit={handleSearchSubmit}
      className="relative w-full"
      role="search"
    >
      <div className="flex h-11 items-center overflow-hidden rounded-xl border-2 border-[#4189DD] bg-white">
        <Search size={18} className="ml-3 shrink-0 text-[var(--color-muted)]" />
        <input
          type="text"
          placeholder="Search phones, fashion, beauty, stores…"
          className="h-full w-full min-w-0 bg-transparent px-3 text-sm outline-none"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchQuery.length > 0 && setShowResults(true)}
          aria-label="Search products and stores"
        />
        <button
          type="submit"
          className="h-full shrink-0 bg-[#4189DD] px-4 text-sm font-bold text-white hover:bg-[#2F74C8] sm:px-6"
        >
          Search
        </button>
      </div>
      {showResults && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-white shadow-xl">
          {loading && <div className="p-4 text-sm text-gray-500">Searching…</div>}
          {!loading && searchResults && (
            <>
              {searchResults.stores.length > 0 && (
                <div>
                  <h3 className="p-3 text-xs font-semibold uppercase text-gray-400">Stores</h3>
                  <ul>
                    {searchResults.stores.map((store) => (
                      <li key={`store-${store.id}`}>
                        <Link
                          to={`/store/${store.id}`}
                          className="flex items-center p-3 hover:bg-blue-50"
                          onClick={() => setShowResults(false)}
                        >
                          <img
                            src={store.logo_url || '/favicon.svg'}
                            alt={store.store_name}
                            className="mr-3 h-10 w-10 rounded-lg object-cover"
                          />
                          <span className="text-sm">{store.store_name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {searchResults.products.length > 0 && (
                <div>
                  <h3 className="p-3 text-xs font-semibold uppercase text-gray-400">Products</h3>
                  <ul>
                    {searchResults.products.map((product) => (
                      <li key={`product-${product.id}`}>
                        <Link
                          to={`/product/${product.id}`}
                          className="flex items-center p-3 hover:bg-blue-50"
                          onClick={() => setShowResults(false)}
                        >
                          <img
                            src={firstImage(product.image_urls) ?? '/favicon.svg'}
                            alt={product.name}
                            className="mr-3 h-10 w-10 rounded-lg object-cover"
                          />
                          <span className="text-sm">{product.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {searchResults.products.length === 0 && searchResults.stores.length === 0 && (
                <div className="p-4 text-sm text-gray-500">
                  No results. Try{' '}
                  <button
                    type="button"
                    className="font-semibold text-[#4189DD] underline"
                    onClick={() => openDalabChat(searchQuery)}
                  >
                    asking Dalab AI
                  </button>
                  .
                </div>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );

  return (
    <header className="sticky top-0 z-30 w-full bg-white shadow-sm">
      <div className="bg-[#0B1F3A] px-4 py-1.5 text-center text-xs font-medium text-white">
        <Truck size={14} className="mr-1.5 inline -mt-0.5 text-[#FFB020]" />
        Same-day delivery in Mogadishu · Pay with EVC Plus or eDahab
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6">
        <button
          type="button"
          className="-ml-1 flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-dark)] hover:bg-gray-100 md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Logo />

        <div className="hidden flex-1 md:block">{searchBox}</div>

        <div className="ml-auto flex items-center gap-1 text-[var(--color-dark)] sm:gap-2">
          <Link
            to="/wishlist"
            className="relative hidden rounded-lg p-2 hover:bg-gray-100 sm:block"
            aria-label="Wishlist"
          >
            <Heart size={22} />
            {badge(wishlistItems?.length)}
          </Link>
          <Link to="/cart" className="relative rounded-lg p-2 hover:bg-gray-100" aria-label="Cart">
            <ShoppingCart size={22} />
            {badge(cartItems?.length)}
          </Link>
          {user ? (
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setPopoverOpen(!isPopoverOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold uppercase text-[#255FA6]">
                  {user.name?.charAt(0)}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-semibold capitalize lg:inline">
                  {user.name}
                </span>
              </button>
              <ProfilePopover isOpen={isPopoverOpen} onClose={() => setPopoverOpen(false)} />
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-gray-100"
            >
              <User size={22} />
              <span className="hidden lg:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">{searchBox}</div>

      <nav
        className="hidden border-t border-[var(--color-border)] md:block"
        aria-label="Categories"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 text-sm font-semibold text-[var(--color-dark)]">
          <Link to="/shop" className="rounded-lg px-3 py-2.5 hover:text-[#4189DD]">
            All products
          </Link>
          {STORE_CATEGORIES.map((name) => (
            <Link
              key={name}
              to={categoryLink(name)}
              className="whitespace-nowrap rounded-lg px-3 py-2.5 hover:text-[#4189DD]"
            >
              {name}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => openDalabChat()}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[#255FA6] hover:bg-blue-50"
          >
            <Sparkles size={16} className="text-[#FFB020]" /> Ask Dalab AI
          </button>
        </div>
      </nav>

      {breadcrumbs && (
        <nav
          className="w-full border-t border-[var(--color-border)] bg-[var(--color-background)]"
          aria-label="Breadcrumb"
        >
          <p className="mx-auto max-w-7xl truncate px-4 py-2 text-sm text-gray-500">
            {Object.entries(breadcrumbs).map(([text, link], index, arr) => (
              <React.Fragment key={link}>
                {index < arr.length - 1 ? (
                  <Link to={link} className="text-[#255FA6] hover:underline">
                    {text}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-700">{text}</span>
                )}
                {index < arr.length - 1 && <span className="mx-2">/</span>}
              </React.Fragment>
            ))}
          </p>
        </nav>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-label="Menu">
          <div className="absolute inset-0 bg-[#0B1F3A]/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Categories
              </p>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/shop"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 font-semibold hover:bg-blue-50"
                  >
                    All products
                  </Link>
                </li>
                {STORE_CATEGORIES.map((name) => (
                  <li key={name}>
                    <Link
                      to={categoryLink(name)}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 hover:bg-blue-50"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                My Dalab
              </p>
              <ul className="space-y-1">
                {[
                  {
                    to: user ? '/orders' : '/login',
                    label: user ? 'My orders' : 'Sign in / Register',
                    icon: Package,
                  },
                  { to: '/wishlist', label: 'Wishlist', icon: Heart },
                  { to: '/cart', label: 'Cart', icon: ShoppingCart },
                  { to: '/store', label: 'Sell on Dalab', icon: Store },
                ].map(({ to, label, icon: Icon }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-blue-50"
                    >
                      <Icon size={18} className="text-[#4189DD]" /> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-[var(--color-border)] p-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openDalabChat();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4189DD] to-[#255FA6] px-4 py-3 font-bold text-white"
              >
                <Sparkles size={18} className="text-[#FFB020]" /> Ask Dalab AI
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
