import React, { useState } from 'react';
import { BadgeCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useCategories } from '~/hooks/useCategories';
import { useVendors } from '~/hooks/useVendors';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b pb-3 mb-3">
      <button
        className="flex justify-between w-full text-left font-semibold text-gray-800"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && <div className="mt-2 text-sm text-gray-700">{children}</div>}
    </div>
  );
};

interface SearchFilterProps {
  onFiltersChange?: (filters: {
    categories: string;
    vendors: string[];
    minPrice: number | undefined;
    maxPrice: number | undefined;
    featured: boolean | undefined;
  }) => void;
  initialCategory?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onFiltersChange, initialCategory }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { vendors, loading: vendorsLoading } = useVendors();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);

  // Follow the URL when the category changes from outside (header, footer, back button)
  React.useEffect(() => {
    setSelectedCategory(initialCategory || '');
  }, [initialCategory]);

  // Notify parent component when filters change
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        categories: selectedCategory,
        vendors: selectedVendor ? [selectedVendor] : [],
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        featured: featuredOnly || undefined,
      });
    }
  }, [selectedCategory, selectedVendor, minPrice, maxPrice, featuredOnly, onFiltersChange]);

  return (
    <aside className="w-full bg-white md:w-64 md:rounded-2xl md:border md:border-[var(--color-border)] md:p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-900">Search Filters</h2>

      <Section title="Categories">
        {categoriesLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <>
            <ul className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className={`py-1 px-2 rounded cursor-pointer transition-colors w-fit ${selectedCategory === category.name ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === category.name ? '' : category.name);
                  }}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <Section title="Vendors">
        {vendorsLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {vendors.map((vendor) => {
                const isSelected = selectedVendor === vendor.store_name;
                return (
                  <div
                    key={vendor.id}
                    className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer transition-colors w-fit ${
                      isSelected
                        ? !!vendor.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedVendor((prev) =>
                        prev === vendor.store_name ? '' : vendor.store_name,
                      );
                    }}
                  >
                    {!!vendor.isVerified && (
                      <BadgeCheck
                        className={isSelected ? 'text-green-800' : 'text-[var(--color-success)]'}
                        size={20}
                      />
                    )}
                    <span className="flex-1">{vendor.store_name}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Section>

      <Section title="Price Range">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Max Price</label>
            <input
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Section>

      <Section title="Special Offers">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="featured" className="text-sm text-gray-700 cursor-pointer">
            Featured Products Only
          </label>
        </div>
      </Section>
    </aside>
  );
};
export default SearchFilter;
