import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from './ProductCard.tsx';
import { Search, SlidersHorizontal, X, RotateCcw, ArrowLeft, Layers } from 'lucide-react';
import { formatPKR } from '../utils/formatters.ts';

export const ShopPage: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    navigateTo,
  } = useStore();

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category
    if (selectedCategory && selectedCategory !== 'all') {
      const catLower = selectedCategory.toLowerCase();
      list = list.filter((p) => p.category.toLowerCase() === catLower);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // Price range
    list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    // In-stock
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'bestseller') {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else {
      // newest
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(50000);
    setInStockOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    minPrice > 0 ||
    maxPrice < 50000 ||
    inStockOnly;

  return (
    <div className="py-10 bg-[#0b0f17] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title & Breadcrumb */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c5a880]">
            The Store Collection
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-1">
            {selectedCategory !== 'all' ? selectedCategory : 'Shop Luxury Essentials'}
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Showing {filteredProducts.length} authentic curated products {selectedCategory !== 'all' ? `in "${selectedCategory}"` : 'available in Pakistan'}.
          </p>
        </div>

        {/* Active Category Filter Banner */}
        {selectedCategory !== 'all' && (
          <div className="mb-6 p-4 rounded-2xl bg-[#121929] border border-[#c5a880]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#c5a880]/15 text-[#c5a880]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Category Selected
                </span>
                <span className="text-sm font-bold text-white">
                  Browsing: {selectedCategory} ({filteredProducts.length} products)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('categories')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>All Categories</span>
              </button>
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-3 py-1.5 rounded-lg bg-[#c5a880]/20 hover:bg-[#c5a880]/30 text-[#c5a880] text-xs font-semibold transition-colors"
              >
                Show All Products
              </button>
            </div>
          </div>
        )}

        {/* Top Control Bar: Search + Category Tabs + Sort + Filter Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          {/* Search Field */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-[#121824] text-white border border-slate-700/80 rounded-lg focus:outline-none focus:border-[#c5a880] transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Interactive Category Tabs / Segmented Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#c5a880] text-[#0b0f17] font-semibold'
                  : 'bg-[#121824] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              All Departments
            </button>
            {categories
              .filter((c) => c.isVisible)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#c5a880] text-[#0b0f17] font-semibold'
                      : 'bg-[#121824] text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>

          {/* Right Controls: Sort Dropdown & Mobile Filter Button */}
          <div className="flex items-center gap-3 self-end lg:self-auto shrink-0">
            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#121824] text-white border border-slate-700/80 rounded-lg text-xs py-2 px-3 focus:outline-none focus:border-[#c5a880]"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="bestseller">Best Selling</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Mobile Filter Drawer Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#121824] border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#c5a880]" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Content: Sidebar Filters (Desktop) + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Filter Header with Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#c5a880]" />
                <span>Refine Search</span>
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#c5a880] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Category Radios */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Department
              </h4>
              <div className="flex flex-col gap-1.5 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="radio"
                    name="cat_filter"
                    checked={selectedCategory === 'all'}
                    onChange={() => setSelectedCategory('all')}
                    className="accent-[#c5a880]"
                  />
                  <span>All Categories</span>
                  <span className="ml-auto text-slate-500 tabular-nums">({products.length})</span>
                </label>
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 cursor-pointer hover:text-white"
                  >
                    <input
                      type="radio"
                      name="cat_filter"
                      checked={selectedCategory.toLowerCase() === c.name.toLowerCase()}
                      onChange={() => setSelectedCategory(c.name)}
                      className="accent-[#c5a880]"
                    />
                    <span>{c.name}</span>
                    <span className="ml-auto text-slate-500 tabular-nums">
                      ({c.productCount ?? 0})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-400">
                  Price Limit (Rs.)
                </span>
                <span className="font-semibold text-white tabular-nums">
                  Up to {formatPKR(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#c5a880] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Rs. 0</span>
                <span>Rs. 50,000+</span>
              </div>
            </div>

            {/* Stock Availability Filter */}
            <div className="pt-4 border-t border-slate-800">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded accent-[#c5a880]"
                />
                <span>In Stock Items Only</span>
              </label>
            </div>

            {/* Nationwide Trust Box */}
            <div className="p-4 rounded-xl bg-[#121824] border border-[#c5a880]/20 text-xs text-slate-400 space-y-2">
              <span className="text-white font-semibold block">Smart Connect Guarantee</span>
              <p className="leading-relaxed">
                All catalog items qualify for Cash on Delivery. Open parcel inspection permitted
                upon courier delivery.
              </p>
            </div>
          </aside>

          {/* Product Cards Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-[#121824] border border-slate-800 p-8 flex flex-col items-center">
                <p className="text-lg font-semibold text-white mb-2">No products matched your criteria</p>
                <p className="text-xs text-slate-400 max-w-md mb-6">
                  Try adjusting your price range, searching for another keyword, or resetting active filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold text-xs hover:bg-[#d6bc98] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-over Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="ml-auto w-full max-w-xs bg-[#0f1522] h-full p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="font-serif-luxury text-lg font-bold text-white">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Department
              </h4>
              <div className="flex flex-col gap-2 text-xs text-slate-300">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-left py-1.5 px-2 rounded ${
                    selectedCategory === 'all'
                      ? 'bg-[#c5a880] text-[#0b0f17] font-semibold'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.name)}
                    className={`text-left py-1.5 px-2 rounded flex justify-between ${
                      selectedCategory.toLowerCase() === c.name.toLowerCase()
                        ? 'bg-[#c5a880] text-[#0b0f17] font-semibold'
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-slate-500">({c.productCount ?? 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400 uppercase tracking-wider font-semibold">
                  Price Limit
                </span>
                <span className="text-white font-semibold">{formatPKR(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#c5a880]"
              />
            </div>

            {/* In stock */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded accent-[#c5a880]"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold text-xs text-center"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    resetFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white text-center"
                >
                  Reset All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
