import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { formatPKR } from '../utils/formatters.ts';
import { X, Star, ShoppingCart, Heart, Shield, Truck, Check } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    navigateTo,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isOutOfStock = product.stock <= 0;
  const isFav = isInWishlist(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-[#0f1522] border border-[#c5a880]/30 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20"
          aria-label="Close Quick View"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 relative bg-[#090d14] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden">
            <img
              src={product.mainImage || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {product.discountPercentage ? (
              <span className="absolute top-2 left-2 text-xs font-bold text-[#0b0f17] bg-[#c5a880] px-2.5 py-1 rounded">
                -{product.discountPercentage}% OFF
              </span>
            ) : null}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto">
          <div className="text-xs uppercase tracking-widest text-[#c5a880] font-semibold mb-1">
            {product.category}
          </div>

          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
            {product.name}
          </h2>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4 text-xs text-slate-300">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="font-semibold text-white">{product.rating.toFixed(1)}</span>
            <span className="text-slate-500">({product.reviewCount} customer reviews)</span>
          </div>

          {/* Pricing (First, Prominent with Save Badge) */}
          <div className="pt-1 pb-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-300">Rs.</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {product.price.toLocaleString('en-PK')}
                </span>
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium">Rs.</span>
                  <span className="text-base text-slate-500 line-through tabular-nums font-semibold">
                    {product.originalPrice.toLocaleString('en-PK')}
                  </span>
                </div>
              )}
              {product.discountPercentage && product.discountPercentage > 0 ? (
                <div className="self-end mb-1">
                  <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/80 text-rose-300 text-[11px] font-bold tracking-wide shadow-sm">
                    Save {product.discountPercentage}%
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Stock state */}
          <div className="text-xs mb-3">
            {isOutOfStock ? (
              <span className="text-red-400 font-semibold">✕ Currently Out of Stock</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5 font-semibold text-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>In Stock ({product.stock} available)</span>
              </span>
            )}
          </div>

          {/* Short Description / Details (Directly Below Price) */}
          <p className="text-xs text-slate-300 leading-relaxed mb-4 border-t border-slate-800/80 pt-2.5">
            {product.shortDescription || product.description}
          </p>

          {/* Quantity & CTA */}
          <div className="flex items-center gap-3 mb-6 mt-auto">
            {/* Quantity Stepper */}
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800/50">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-slate-300 hover:text-white disabled:opacity-40"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-2 text-xs font-semibold text-white min-w-8 text-center tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-2 text-slate-300 hover:text-white disabled:opacity-40"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            {/* Add To Cart */}
            <button
              onClick={() => {
                addToCart(product, quantity);
                setQuickViewProduct(null);
              }}
              disabled={isOutOfStock}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#c5a880] hover:bg-[#d6bc98] text-[#0b0f17] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-2.5 rounded-lg border transition-colors ${
                isFav
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
            </button>
          </div>

          {/* View Full Product Details Link */}
          <button
            onClick={() => {
              setQuickViewProduct(null);
              navigateTo('product-detail', product.id);
            }}
            className="text-xs text-[#c5a880] hover:underline text-center"
          >
            View Full Product Specifications &amp; Reviews →
          </button>
        </div>
      </div>
    </div>
  );
};
