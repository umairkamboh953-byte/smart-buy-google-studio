import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { sanitizeImagePath, handleImageError, FALLBACK_IMAGE } from '../utils/imageUtils.ts';
import type { Product, ProductReview } from '../types/index.ts';
import { formatPKR, formatDate } from '../utils/formatters.ts';
import { ProductCard } from './ProductCard.tsx';
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  MessageSquare,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProductId,
    products,
    addToCart,
    navigateTo,
    toggleWishlist,
    isInWishlist,
    showToast,
    settings,
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Review submission form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Color options resolution
  const colorSpec = product?.specifications?.find(
    (s) =>
      s.key.toLowerCase().includes('color') ||
      s.key.toLowerCase().includes('colour') ||
      s.key.toLowerCase().includes('shade')
  );
  const parsedColors = colorSpec
    ? colorSpec.value.split(/[,/|]+/).map((c) => c.trim()).filter(Boolean)
    : [];
  const availableColors =
    parsedColors.length > 0
      ? parsedColors
      : ['Black', 'Beige', 'Maroon'];
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || 'Black');

  useEffect(() => {
    if (availableColors.length > 0) {
      setSelectedColor(availableColors[0]);
    }
  }, [product?.id]);

  const fetchReviews = async (pId: string) => {
    try {
      setIsLoadingReviews(true);
      const res = await fetch(`/api/reviews?productId=${pId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      setActiveImageIndex(0);
      setQuantity(1);
      fetchReviews(selectedProductId);
    }
  }, [selectedProductId]);

  if (!product) {
    return (
      <div className="py-24 text-center bg-[#0b0f17] min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="font-serif-luxury text-2xl text-white mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          The requested luxury product may have been moved or is no longer listed.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold text-xs"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const imageList = product.images.length > 0 ? product.images : [product.mainImage];
  const activeImage = imageList[activeImageIndex] || product.mainImage;

  // Related products from the same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigateTo('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) {
      showToast('Please provide your name and review remarks', 'error');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewAuthor.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      const newReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setReviewAuthor('');
      setReviewComment('');
      setReviewRating(5);
      showToast('Thank you! Your verified review has been published.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error submitting review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="py-10 bg-[#0b0f17] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
          <button onClick={() => navigateTo('home')} className="hover:text-white">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button onClick={() => navigateTo('shop')} className="hover:text-white">
            Shop
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-[#c5a880]">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-slate-300 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* Contiguous Purchase Layout: Left Gallery, Right Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Gallery Column (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Featured Image Frame */}
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-[#121824] border border-[#1e293b] shadow-2xl flex items-center justify-center group">
              <img
                src={sanitizeImagePath(activeImage, FALLBACK_IMAGE)}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
                onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
              />

              {product.discountPercentage ? (
                <span className="absolute top-4 left-4 text-xs font-bold text-[#0b0f17] bg-[#c5a880] px-3 py-1 rounded-md shadow-md">
                  -{product.discountPercentage}% OFF
                </span>
              ) : null}

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-xl backdrop-blur-md transition-all shadow-md ${
                  isFavorited
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-[#0b0f17]/70 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
                title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorited ? 'fill-rose-400' : ''}`}
                />
              </button>
            </div>

            {/* Thumbnail Carousel */}
            {imageList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#c5a880] shadow-md scale-102'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={sanitizeImagePath(img, FALLBACK_IMAGE)}
                      alt={`${product.name} view ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contiguous Purchase Module (lg:col-span-5) */}
          <div className="lg:col-span-5 sticky top-28 bg-[#121824] rounded-2xl p-6 sm:p-8 border border-[#1e293b] shadow-xl">
            {/* Category */}
            <div className="text-[11px] uppercase tracking-widest font-semibold text-[#c5a880] mb-2">
              {product.category}
            </div>

            {/* Product Title */}
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white leading-snug mb-2">
              {product.name}
            </h1>

            {/* Rating & SKU Line */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 pb-3 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
              <a href="#reviews-section" className="text-slate-400 hover:text-[#c5a880] transition-colors">
                ({reviews.length || product.reviewCount})
              </a>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono text-[11px]">SKU: {product.sku}</span>
            </div>

            {/* 1. PRICE MODULE (FIRST BEFORE DETAILS - MATCHING SCREENSHOT) */}
            <div className="pt-2 pb-3">
              <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap">
                {/* Main Prominent Price */}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-300">Rs.</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                    {product.price.toLocaleString('en-PK')}
                  </span>
                </div>

                {/* Strikethrough Original Price */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium">Rs.</span>
                    <span className="text-xl sm:text-2xl text-slate-500 line-through tabular-nums font-semibold">
                      {product.originalPrice.toLocaleString('en-PK')}
                    </span>
                  </div>
                )}

                {/* Red Save Badge */}
                {product.discountPercentage && product.discountPercentage > 0 ? (
                  <div className="self-end mb-1">
                    <div className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-bold tracking-wide shadow-sm flex flex-col items-center">
                      <span className="text-[10px] uppercase font-semibold text-rose-400">Save</span>
                      <span className="text-sm font-extrabold">{product.discountPercentage}%</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* 2. Stock Availability */}
            <div className="pb-3">
              {isOutOfStock ? (
                <span className="text-red-400 font-semibold text-xs sm:text-sm">
                  ✕ Out of Stock
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>In Stock ({product.stock} available)</span>
                </span>
              )}
            </div>

            {/* 3. PRODUCT DETAILS / SHORT DESCRIPTION (DIRECTLY AFTER PRICE) */}
            <div className="py-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
              <p>{product.shortDescription || product.description}</p>
            </div>

            {/* 4. Color / Variation Options */}
            {availableColors.length > 0 && (
              <div className="pt-3 pb-2 space-y-2">
                <div className="text-xs font-semibold text-white">
                  Color: <span className="text-slate-300 font-normal">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {availableColors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedColor === col
                          ? 'bg-[#1b2537] border-[#c5a880] text-white shadow-md ring-1 ring-[#c5a880]/50'
                          : 'bg-[#0b0f17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Quantity Stepper */}
            <div className="pt-3 pb-4 space-y-2">
              <div className="text-xs font-semibold text-white">Quantity</div>
              <div className="inline-flex items-center rounded-xl border border-slate-800 bg-[#0b0f17] p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/70 disabled:opacity-30 transition-colors text-lg font-bold"
                >
                  -
                </button>
                <span className="px-5 text-sm font-bold text-white min-w-12 text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/70 disabled:opacity-30 transition-colors text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* 6. Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => addToCart(product, quantity)}
                  disabled={isOutOfStock}
                  className="btn-luxury flex-1 py-3.5 px-4 rounded-xl bg-[#c5a880] hover:bg-[#d6bc98] text-[#0b0f17] font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#1a2336] hover:bg-[#222f48] text-white border border-[#c5a880]/50 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 active:scale-[0.99]"
                >
                  <span>Buy Now (COD)</span>
                </button>
              </div>

              {/* Direct WhatsApp Order CTA Button */}
              {(() => {
                const whatsAppNumber = settings?.contact?.whatsApp || '+923000762781';
                const storeName = settings?.storeName || 'Smart Buy';
                let cleanWhatsApp = whatsAppNumber.replace(/\D/g, '');
                if (cleanWhatsApp.startsWith('0')) {
                  cleanWhatsApp = '92' + cleanWhatsApp.slice(1);
                } else if (!cleanWhatsApp.startsWith('92') && cleanWhatsApp.length === 10) {
                  cleanWhatsApp = '92' + cleanWhatsApp;
                }
                const whatsAppProductUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum ${storeName}, I would like to order "${product.name}" (SKU: ${product.sku}) in ${selectedColor}, Quantity: ${quantity}. Total: Rs. ${(product.price * quantity).toLocaleString('en-PK')}. Please deliver via Cash on Delivery.`
                )}`;

                return (
                  <a
                    href={whatsAppProductUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-semibold text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Order on WhatsApp (Instant Response)</span>
                  </a>
                );
              })()}

              {/* Quality & Nationwide Delivery Assurances (Placed below the Price & Order buttons) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800 flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#c5a880] shrink-0" />
                  <div className="flex flex-col text-[11px] leading-tight">
                    <span className="font-semibold text-white">Cash on Delivery</span>
                    <span className="text-slate-400 text-[10px]">All Pakistan cities</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#00f2d2] shrink-0" />
                  <div className="flex flex-col text-[11px] leading-tight">
                    <span className="font-semibold text-white">Verified Authentic</span>
                    <span className="text-slate-400 text-[10px]">Inspected before dispatch</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800 flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[#c5a880] shrink-0" />
                  <div className="flex flex-col text-[11px] leading-tight">
                    <span className="font-semibold text-white">7-Day Exchange</span>
                    <span className="text-slate-400 text-[10px]">Hassle-free replacement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Craftsmanship & Long Overview */}
            <div className="space-y-3 pt-6 border-t border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed mt-6">
              <h3 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider">
                Craftsmanship &amp; Details
              </h3>
              <p>{product.description}</p>
            </div>

            {/* 8. Technical Specifications Table */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h3 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Technical Specifications
                </h3>
                <div className="divide-y divide-slate-800/80 rounded-lg overflow-hidden border border-slate-800">
                  {product.specifications.map((spec, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2 px-3 text-xs bg-[#0f1522] even:bg-[#121926]"
                    >
                      <span className="text-slate-400 font-medium">{spec.key}</span>
                      <span className="text-slate-200 text-right font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section id="reviews-section" className="mt-20 pt-12 border-t border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Reviews Summary & Form */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#c5a880] font-semibold">
                  Customer Feedback
                </span>
                <h2 className="font-serif-luxury text-2xl font-bold text-white mt-1">
                  Verified Reviews
                </h2>
              </div>

              {/* Scorecard */}
              <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 flex items-center gap-6">
                <div className="text-center">
                  <span className="text-4xl font-bold text-white font-serif-luxury">
                    {product.rating.toFixed(1)}
                  </span>
                  <div className="flex items-center text-amber-400 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Based on {reviews.length || product.reviewCount} ratings
                  </span>
                </div>
                <div className="border-l border-slate-800 pl-6 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>100% Verified Purchases</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    All reviews come from confirmed deliveries throughout Pakistan.
                  </p>
                </div>
              </div>

              {/* Submit a Review Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="p-6 rounded-2xl bg-[#121824] border border-[#c5a880]/30 space-y-4"
              >
                <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#c5a880]" />
                  <span>Write a Review</span>
                </h3>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Your Name &amp; City
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Omar Khan (Karachi)"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Star Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewRating(num)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            num <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-slate-400 ml-2 font-medium">
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience regarding craftsmanship, delivery, and satisfaction..."
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold text-xs hover:bg-[#d6bc98] transition-colors disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Customer Review'}
                </button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {isLoadingReviews ? (
                <div className="text-slate-400 text-xs py-8">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#121824] border border-slate-800 text-center">
                  <p className="text-sm text-slate-300">No reviews yet for this item.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Be the first Pakistani customer to submit your feedback!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-xl bg-[#121824] border border-slate-800 text-left space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">
                            {rev.customerName}
                          </span>
                          {rev.verifiedPurchase && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                              Verified Order
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-slate-800">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-[#c5a880] font-semibold">
                You May Also Appreciate
              </span>
              <h2 className="font-serif-luxury text-2xl font-bold text-white mt-1">
                Complementary Pieces
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
