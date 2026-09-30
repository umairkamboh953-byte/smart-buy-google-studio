import React from 'react';
import type { Product } from '../types/index.ts';
import { useStore } from '../context/StoreContext.tsx';
import { formatPKR } from '../utils/formatters.ts';
import { sanitizeImagePath, handleImageError } from '../utils/imageUtils.ts';
import { Star, Heart, Eye, ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    navigateTo,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
  } = useStore();

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if click wasn't on an action button
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    navigateTo('product-detail', product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-xl bg-[#121824] border border-[#1e293b] hover:border-[#c5a880]/40 transition-all duration-300 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] cursor-pointer overflow-hidden"
    >
      {/* Visual Image Slot */}
      <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-[#0c121e]">
        <img
          src={sanitizeImagePath(product.mainImage || product.images?.[0])}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => handleImageError(e)}
        />

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121824]/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

        {/* Top Badges (Discount Tag & In-Stock) */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 items-start z-10">
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="text-[9px] sm:text-[11px] font-bold text-[#0b0f17] bg-[#c5a880] px-1.5 sm:px-2 py-0.5 rounded tracking-tight shadow-sm">
              -{product.discountPercentage}% OFF
            </span>
          ) : null}
          {product.isBestSeller && (
            <span className="text-[9px] sm:text-[10px] font-semibold text-white bg-slate-900/90 border border-slate-700/80 px-1.5 sm:px-2 py-0.5 rounded tracking-wide shadow-sm">
              Hot
            </span>
          )}
        </div>

        {/* Wishlist Heart Button (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-lg backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorited
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-[#0b0f17]/70 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
              isFavorited ? 'fill-rose-400 scale-110' : 'hover:scale-110'
            }`}
          />
        </button>

        {/* Quick View Button (Hover Action) */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-full py-2 px-3 rounded-lg bg-[#0b0f17]/90 hover:bg-[#0b0f17] text-xs font-semibold text-white border border-[#c5a880]/30 shadow-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-5">
        {/* Unboxed Metadata (Zero-Pill Rule) */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 mb-1 sm:mb-1.5 font-medium truncate">
          <span className="uppercase tracking-wider text-[9px] sm:text-[11px] text-[#c5a880] truncate max-w-[90px] sm:max-w-none">
            {product.category}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="truncate">
            {isOutOfStock ? (
              <span className="text-red-400 font-semibold">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-400 font-semibold">Only {product.stock} left</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> In Stock
              </span>
            )}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-serif-luxury text-xs sm:text-base font-bold text-white group-hover:text-[#c5a880] transition-colors line-clamp-1 mb-1 leading-snug">
          {product.name}
        </h3>

        {/* Short Description (Hidden on compact mobile 2-col to keep uniform heights) */}
        <p className="hidden sm:block text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 flex-1">
          {product.shortDescription}
        </p>

        {/* Rating Row */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 mb-2 sm:mb-3">
          <div className="flex items-center text-amber-400">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
          </div>
          <span className="font-semibold text-slate-200">{product.rating.toFixed(1)}</span>
          <span className="text-slate-500">({product.reviewCount})</span>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-800/80 mt-auto gap-1">
          {/* Prices */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <span className="font-semibold text-xs sm:text-lg text-white tabular-nums tracking-tight">
                {formatPKR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-500 line-through tabular-nums">
                  {formatPKR(product.originalPrice)}
                </span>
              )}
            </div>
            {product.discountPercentage ? (
              <span className="text-[9px] sm:text-[10px] text-[#00f2d2] font-medium hidden xs:block truncate">
                Save {formatPKR((product.originalPrice || product.price) - product.price)}
              </span>
            ) : null}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) {
                addToCart(product, 1);
              }
            }}
            disabled={isOutOfStock}
            className={`p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-[#c5a880] text-[#0b0f17] hover:bg-[#d6bc98] active:scale-95 shadow-sm'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
