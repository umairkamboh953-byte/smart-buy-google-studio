import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { sanitizeImagePath, handleImageError, FALLBACK_IMAGE } from '../utils/imageUtils.ts';
import {
  Layers,
  ArrowRight,
  Search,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, products, setSelectedCategory, navigateTo } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const visibleCategories = useMemo(() => {
    return categories.filter((c) => c.isVisible);
  }, [categories]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return visibleCategories;
    const q = searchQuery.toLowerCase().trim();
    return visibleCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [visibleCategories, searchQuery]);

  const handleBrowseCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    navigateTo('shop');
  };

  return (
    <div className="py-10 bg-[#0b0f17] min-h-screen text-[#f1f5f9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
          <button
            onClick={() => navigateTo('home')}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[#c5a880] font-semibold">Product Categories</span>
        </div>

        {/* Header Hero Section */}
        <div className="relative rounded-3xl p-6 sm:p-10 mb-10 overflow-hidden bg-gradient-to-br from-[#121929] via-[#0e1420] to-[#121824] border border-[#1e293b] shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00f2d2]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#c5a880] text-xs font-semibold mb-3 border border-[#c5a880]/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Product Departments</span>
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              All Categories
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              Select any category below to browse all available products in that collection.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-slate-800 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c5a880]" />
                <span>
                  <strong className="text-white font-bold">{visibleCategories.length}</strong> Categories Available
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  <strong className="text-white font-bold">{products.length}</strong> Total Products
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-[#121824] p-4 rounded-2xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category by name..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#0b0f17] text-white border border-slate-700/80 rounded-xl focus:outline-none focus:border-[#c5a880] transition-colors placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={() => {
              setSelectedCategory('all');
              navigateTo('shop');
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700 shrink-0"
          >
            <span>View All Products ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#c5a880]" />
          </button>
        </div>

        {/* Clean Category Cards Grid - ONLY CATEGORIES, NO PRODUCTS UNDERNEATH */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20 bg-[#121824] rounded-2xl border border-slate-800 p-8">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Category Found</h3>
            <p className="text-xs text-slate-400 mb-4">
              We couldn't find any category matching "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold text-xs"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              const count = products.filter(
                (p) => p.category.toLowerCase() === cat.name.toLowerCase()
              ).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleBrowseCategory(cat.name)}
                  className="group relative rounded-2xl bg-[#121824] border border-[#1e293b] hover:border-[#c5a880]/60 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Category Image Cover */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0c111a]">
                    <img
                      src={sanitizeImagePath(cat.image, FALLBACK_IMAGE)}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-[#121824]/40 to-transparent" />

                    {/* Count Badge on Top Right */}
                    <div className="absolute top-3 right-3 bg-[#0b0f17]/85 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#c5a880]">
                      {count} {count === 1 ? 'Product' : 'Products'}
                    </div>
                  </div>

                  {/* Category Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-white group-hover:text-[#c5a880] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {cat.description || `Explore our premium range of ${cat.name}.`}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#c5a880] group-hover:underline flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>View Products</span>
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-[#c5a880] text-slate-300 group-hover:text-[#0b0f17] flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-[#121929] via-[#162136] to-[#121929] border border-[#c5a880]/20 text-center space-y-3">
          <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-white">
            Looking for all items at once?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            You can visit our main shop to filter across all departments by price, ratings, and newest arrivals.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedCategory('all');
                navigateTo('shop');
              }}
              className="px-6 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#d6bc98] text-[#0b0f17] font-semibold text-xs transition-colors"
            >
              Go to Full Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
