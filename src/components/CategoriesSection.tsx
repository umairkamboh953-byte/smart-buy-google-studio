import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { sanitizeImagePath, handleImageError, FALLBACK_IMAGE } from '../utils/imageUtils.ts';
import { ArrowUpRight } from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const { categories, setSelectedCategory, navigateTo } = useStore();

  const visibleCategories = categories.filter((c) => c.isVisible);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    navigateTo('shop');
  };

  if (!visibleCategories.length) return null;

  return (
    <section className="py-16 bg-[#0b0f17] border-t border-[#1a2333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c5a880]">
              Curated Departments
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1">
              Explore Collections
            </h2>
          </div>
          <button
            onClick={() => navigateTo('categories')}
            className="text-xs sm:text-sm font-semibold text-[#c5a880] hover:text-[#e2ceb4] inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View All Departments</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="group relative rounded-xl overflow-hidden bg-[#121824] border border-[#1e293b] hover:border-[#c5a880]/50 transition-all duration-300 flex flex-col text-left aspect-[4/5] p-4 justify-end shadow-md hover:-translate-y-1"
            >
              {/* Category Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={sanitizeImagePath(cat.image, FALLBACK_IMAGE)}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                  onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/70 to-transparent" />
              </div>

              {/* Category Content */}
              <div className="relative z-10">
                <span className="text-[11px] text-slate-400 font-medium block">
                  {cat.productCount ?? 0} Products
                </span>
                <h3 className="font-serif-luxury text-sm sm:text-base font-bold text-white group-hover:text-[#c5a880] transition-colors leading-tight mt-0.5">
                  {cat.name}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
