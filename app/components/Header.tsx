import React, { useState, useRef, useEffect } from 'react';
import logo from '../assets/images/logo.png';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  LayoutGrid,
  Archive,
  BadgePercent,
  Sparkles,
  Store,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '~/hooks/useCart';
import { useWishlist } from '~/hooks/useWishlist';
import { Link } from 'react-router';
import { useUser } from '../hooks/useUser';
import ProfilePopover from './ProfilePopover';
import { useSearch } from '~/hooks/useSearch';

interface UserData {
  name: string;
}

type BreadcrumbProps = {
  [key: string]: string;
};

interface HeaderProps {
  breadcrumbs?: BreadcrumbProps;
}

const Header: React.FC<HeaderProps> = ({ breadcrumbs }) => {
  const { user } = useUser();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { searchResults, loading } = useSearch(searchQuery);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setPopoverOpen(false);
    }
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  return (
    <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Africa's Place" className="h-8 w-auto" />
        </div>

        <div
          className="relative flex w-[600px] h-[40px] items-center rounded border border-[var(--color-border)]"
          ref={searchRef}
        >
          <input
            type="text"
            placeholder="Search for products and stores..."
            className="w-full rounded-l bg-transparent px-4 py-2 outline-none"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length > 0 && setShowResults(true)}
          />
          <button className="rounded-r h-[40px] bg-[var(--color-primary)] w-20 justify-center flex items-center text-white hover:bg-[var(--color-primary-hover)]">
            <Search size={20} />
          </button>
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-10 max-h-96 overflow-y-auto">
              {loading && <div className="p-4 text-gray-500">Searching...</div>}
              {!loading && searchResults && (
                <>
                  {searchResults.stores.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase p-3 border-t border-gray-200">
                        Stores
                      </h3>
                      <ul>
                        {searchResults.stores.map((store) => (
                          <li key={`store-${store.id}`}>
                            <Link
                              to={`/store/${store.id}`}
                              className="flex items-center p-3 hover:bg-gray-100"
                              onClick={() => setShowResults(false)}
                            >
                              <img
                                src={store.logo_url}
                                alt={store.store_name}
                                className="w-10 h-10 object-cover rounded mr-3"
                              />
                              <span>{store.store_name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {searchResults.products.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase p-3">
                        Products
                      </h3>
                      <ul>
                        {searchResults.products.map((product) => (
                          <li key={`product-${product.id}`}>
                            <Link
                              to={`/product/${product.id}`}
                              className="flex items-center p-3 hover:bg-gray-100"
                              onClick={() => setShowResults(false)}
                            >
                              <img
                                src={product.image_urls?.[0]?.[0] ?? '/images/placeholder.png'}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded mr-3"
                              />
                              <span>{product.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {searchResults.products.length === 0 && searchResults.stores.length === 0 && (
                    <div className="p-4 text-gray-500">No results found.</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6 text-[var(--color-muted)]">
          <Link to="/wishlist" className="relative p-2">
            <Heart className="cursor-pointer" />
            {wishlistItems && wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-2">
            <ShoppingCart className="cursor-pointer" />
            {cartItems && cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cartItems.length}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setPopoverOpen(!isPopoverOpen)}
                className="flex items-center space-x-1 px-4 py-2 rounded hover:bg-gray-900/10 cursor-pointer"
              >
                <span className="text-sm font-medium capitalize">{user.name}</span>
              </button>
              <ProfilePopover isOpen={isPopoverOpen} onClose={() => setPopoverOpen(false)} />
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1 px-4 py-2 rounded hover:bg-gray-900/10 cursor-pointer"
            >
              <User />
              <span className="text-sm font-medium">My Account</span>
            </Link>
          )}
        </div>
      </div>

      <nav className="flex w-full items-center justify-between px-4 border-t border-[var(--color-border)] text-sm font-medium text-[var(--color-muted)]">
        <ul className="flex space-x-8 py-2">
          <li>
            <Link to="/shop" className="hover:text-[var(--color-primary)]">
              Shop
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-[var(--color-primary)]">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-[var(--color-primary)]">
              Contact Us
            </Link>
          </li>
          <li>
            <Link to="/support" className="hover:text-[var(--color-primary)]">
              Support
            </Link>
          </li>
          <li>
            <Link to="/terms" className="hover:text-[var(--color-primary)]">
              Terms of Service
            </Link>
          </li>
        </ul>

        <div className="flex items-center space-x-1 ml-8 cursor-pointer">
          <img src="https://flagcdn.com/w20/us.png" alt="Eng" className="h-4 w-6" />
          <span>Eng</span>
          <ChevronDown size={16} />
        </div>
      </nav>

      {breadcrumbs && (
        <nav className="w-full border-t border-[var(--color-border)] px-4 py-2 bg-gray-50">
          <div className="">
            <p className="text-sm text-gray-500">
              {Object.entries(breadcrumbs).map(([text, link], index, arr) => (
                <React.Fragment key={link}>
                  {index < arr.length - 1 ? (
                    <Link to={link} className="text-blue-600 hover:underline">
                      {text}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-700">{text}</span>
                  )}
                  {index < arr.length - 1 && <span className="mx-2">/</span>}
                </React.Fragment>
              ))}
            </p>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
