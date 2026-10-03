"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronRight, LayoutGrid, List, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/product-card';
import { cn } from '@/lib/utils';

async function fetchProducts(queryParams: URLSearchParams) {
  const res = await fetch(`/api/products?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilter('search', searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 on filter change
    if (key !== 'page') params.delete('page');
    
    router.push(`/products?${params.toString()}`);
  };

  const handleCheckboxFilter = (key: string, value: string) => {
    const current = searchParams.get(key);
    let values = current ? current.split(',') : [];
    if (values.includes(value)) {
      values = values.filter((v) => v !== value);
    } else {
      values.push(value);
    }
    updateFilter(key, values.length > 0 ? values.join(',') : null);
  };

  const clearAllFilters = () => {
    router.push('/products');
    setSearchInput('');
  };

  const currentCategory = searchParams.get('category');
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', searchParams.toString()],
    queryFn: () => fetchProducts(new URLSearchParams(searchParams.toString())),
    placeholderData: (prev: unknown) => prev,
  });

  const products = (data as { data?: unknown[] })?.data || [];
  const totalItems = (data as { pagination?: { total?: number } })?.pagination?.total || 0;

  const priceRanges = [
    { label: 'Under ₹500', min: '0', max: '500' },
    { label: '₹500 - ₹1000', min: '500', max: '1000' },
    { label: '₹1000 - ₹5000', min: '1000', max: '5000' },
    { label: '₹5000 - ₹10000', min: '5000', max: '10000' },
    { label: '₹10000 - ₹25000', min: '10000', max: '25000' },
    { label: 'Over ₹25000', min: '25000', max: '' },
  ];

  const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour', 'New Balance'];
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/products" className="hover:text-gray-900">Products</Link>
          {currentCategory && (
            <>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-gray-900 font-medium capitalize">{currentCategory}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm font-medium"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="text-sm text-gray-500">{totalItems} Results</div>
          </div>

          {/* Filter Sidebar Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <FilterSidebarContent 
              searchParams={searchParams}
              updateFilter={updateFilter}
              handleCheckboxFilter={handleCheckboxFilter}
              clearAllFilters={clearAllFilters}
              priceRanges={priceRanges}
              brands={brands}
              colors={colors}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
            />
          </aside>

          {/* Filter Drawer Mobile */}
          <AnimatePresence>
            {isMobileFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-50 overflow-y-auto shadow-xl lg:hidden flex flex-col"
                >
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold">Filters</h2>
                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-8 flex-1">
                    <FilterSidebarContent 
                      searchParams={searchParams}
                      updateFilter={updateFilter}
                      handleCheckboxFilter={handleCheckboxFilter}
                      clearAllFilters={clearAllFilters}
                      priceRanges={priceRanges}
                      brands={brands}
                      colors={colors}
                      searchInput={searchInput}
                      setSearchInput={setSearchInput}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="hidden lg:block text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{products.length}</span> of <span className="font-semibold text-gray-900">{totalItems}</span> results
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Sort Dropdown */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    className="w-full sm:w-auto appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer"
                    value={searchParams.get('sortBy') || 'featured'}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* View Toggles */}
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      viewMode === 'grid' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      viewMode === 'list' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              )}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={cn(
                    "bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 animate-pulse",
                    viewMode === 'grid' ? "flex-col h-[400px]" : "flex-row h-48"
                  )}>
                    <div className={cn("bg-gray-200 rounded-lg", viewMode === 'grid' ? "w-full aspect-square" : "w-40 h-full")} />
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-full mt-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="bg-red-50 text-red-500 p-6 rounded-xl text-center border border-red-100">
                Failed to load products. Please try again later.
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center border border-gray-100 shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  We couldn't find any products matching your current filters. Try adjusting your search or removing some filters.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <motion.div 
                className={cn(
                  "grid gap-6",
                  viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                )}
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
              >
                {products.map((product: any) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                  >
                    <ProductCard product={product} variant={viewMode} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Load More (Mocked) */}
            {!isLoading && products.length > 0 && products.length < totalItems && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => updateFilter('page', String(Number(searchParams.get('page') || 1) + 1))}
                  className="bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSidebarContent({ 
  searchParams, 
  updateFilter, 
  handleCheckboxFilter,
  clearAllFilters,
  priceRanges,
  brands,
  colors,
  searchInput,
  setSearchInput
}: any) {
  
  const currentBrands = searchParams.get('brands') ? searchParams.get('brands').split(',') : [];
  const currentColors = searchParams.get('colors') ? searchParams.get('colors').split(',') : [];
  const minRating = searchParams.get('minRating');
  
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Filters</h3>
        {(searchParams.toString().length > 0) && (
          <button onClick={clearAllFilters} className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline">
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">Search</label>
        <input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      <hr className="border-gray-100" />

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">Price Range</label>
        <div className="flex gap-2 mb-4">
          <input 
            type="number" 
            placeholder="Min" 
            value={searchParams.get('minPrice') || ''}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-md px-3 py-1.5 text-sm"
          />
          <input 
            type="number" 
            placeholder="Max" 
            value={searchParams.get('maxPrice') || ''}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-md px-3 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-2">
          {priceRanges.map((range: any, idx: number) => {
            const isActive = searchParams.get('minPrice') === range.min && searchParams.get('maxPrice') === range.max;
            return (
              <button
                key={idx}
                onClick={() => {
                  updateFilter('minPrice', range.min);
                  updateFilter('maxPrice', range.max);
                }}
                className={cn(
                  "block text-sm text-left w-full px-2 py-1.5 rounded-md transition-colors",
                  isActive ? "bg-gray-100 font-medium text-black" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Brands */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">Brands</label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {brands.map((brand: string) => {
            const isActive = currentBrands.includes(brand);
            return (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  isActive ? "bg-black border-black text-white" : "border-gray-300 bg-white group-hover:border-gray-400"
                )}>
                  {isActive && <Check className="w-3 h-3" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={isActive}
                  onChange={() => handleCheckboxFilter('brands', brand)}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">{brand}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">Rating</label>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="rating"
                className="hidden"
                checked={minRating === String(rating)}
                onChange={() => updateFilter('minRating', String(rating))}
              />
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                minRating === String(rating) ? "border-black" : "border-gray-300 group-hover:border-gray-400"
              )}>
                {minRating === String(rating) && <div className="w-2 h-2 rounded-full bg-black" />}
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={cn("w-4 h-4", i < rating ? "text-yellow-400" : "text-gray-200")} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Colors */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">Colors</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color: any) => {
            const isActive = currentColors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => handleCheckboxFilter('colors', color.name)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  isActive ? "border-black scale-110 shadow-sm" : "border-transparent hover:scale-110",
                  color.name === 'White' && !isActive ? "border-gray-200" : ""
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            )
          })}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Other toggles */}
      <div>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-gray-900">In Stock Only</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={searchParams.get('inStock') === 'true'}
              onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
          </div>
        </label>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
