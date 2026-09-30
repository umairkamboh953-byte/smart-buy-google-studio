import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { sanitizeImagePath, handleImageError, FALLBACK_IMAGE } from '../utils/imageUtils.ts';
import {
  ArrowRight,
  Sparkles,
  Shield,
  Truck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { settings, navigateTo, setSelectedCategory } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Collect active hero slides from settings.banners
  const customHeroBanners = (settings?.banners || []).filter(
    (b) => b.type === 'hero' && b.isActive
  );

  // Fallback default slide from settings.hero
  const defaultSlide = {
    id: 'default-hero',
    title: settings?.hero?.heading || 'Connect With What You Love',
    subtitle:
      settings?.hero?.subheading ||
      'Discover premium products, amazing deals and a smarter way to shop across Pakistan with seamless Cash on Delivery.',
    badgeText: settings?.hero?.badgeText || 'Curated Luxury Collection 2026',
    image:
      settings?.hero?.bannerImage ||
      '/assets/images/hero_luxury_showcase_1790499579518.jpg',
    ctaText: settings?.hero?.ctaPrimaryText || 'Shop Collection',
    linkType: 'shop' as const,
    linkValue: 'shop',
  };

  const allSlides = customHeroBanners.length > 0 ? customHeroBanners : [defaultSlide];

  // In mobile view: only keep the first picture (slides[0]) as requested by user
  const slides = isMobile ? allSlides.slice(0, 1) : allSlides;

  // Auto-advance slider every 6 seconds if multiple slides
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Ensure currentSlide is within bounds if banners changed
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const activeBanner = slides[currentSlide] || slides[0] || defaultSlide;

  const handleCtaClick = () => {
    if (activeBanner.linkType === 'category') {
      setSelectedCategory(activeBanner.linkValue || 'all');
      navigateTo('shop');
    } else if (activeBanner.linkType === 'categories') {
      navigateTo('categories');
    } else {
      setSelectedCategory('all');
      navigateTo('shop');
    }
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#0b0f17] via-[#0d1422] to-[#0b0f17] select-none"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c5a880]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-[#00f2d2]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[460px]">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left transition-all duration-500 key={activeBanner.id}">
            {/* Editorial Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#162032] border border-[#c5a880]/30 text-xs font-medium text-[#c5a880] mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#00f2d2]" />
              <span>{activeBanner.badgeText || 'Curated Luxury Collection 2026'}</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] mb-6 max-w-2xl">
              {activeBanner.title}
            </h1>

            {/* Subtitle / Marketing Prose */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mb-8 line-clamp-3">
              {activeBanner.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={handleCtaClick}
                className="btn-luxury w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39162] text-[#0b0f17] font-semibold text-sm hover:shadow-[0_8px_25px_rgba(197,168,128,0.35)] transition-all transform active:scale-95"
              >
                <span>{activeBanner.ctaText || 'Shop Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateTo('categories')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#141b2b] hover:bg-[#1a2336] text-white border border-[#2a364f] hover:border-[#c5a880]/50 text-sm font-medium transition-all"
              >
                <span>Explore Categories</span>
              </button>
            </div>

            {/* Trust Markers Bar */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 w-full max-w-lg">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Truck className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>Free Ship &gt; Rs. 3,500</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CreditCard className="w-4 h-4 text-[#00f2d2] shrink-0" />
                <span>Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Shield className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>Verified Quality</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Showcase Image & Floating Depth Cards */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual Frame */}
            <div className="relative w-full max-w-md lg:max-w-none rounded-2xl overflow-hidden p-2 bg-gradient-to-tr from-[#1b2538] via-[#0f1725] to-[#25334d] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-[#c5a880]/25 group">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0c121e]">
                <img
                  key={activeBanner.id + activeBanner.image}
                  src={sanitizeImagePath(activeBanner.image, FALLBACK_IMAGE)}
                  alt={activeBanner.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                  onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-transparent to-transparent opacity-60" />
              </div>

              {/* Floating Depth Card 1: Horology Tag */}
              <div className="absolute -top-4 -left-4 sm:left-4 glass-panel px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 animate-bounce [animation-duration:4s]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00f2d2] animate-pulse" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Luxury &amp; Horology
                  </span>
                  <span className="text-xs font-bold text-white">Curated in Pakistan</span>
                </div>
              </div>

              {/* Floating Depth Card 2: Price Highlight */}
              <div className="absolute -bottom-4 right-4 glass-panel px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#c5a880]/20 flex items-center justify-center text-[#c5a880] font-bold text-xs">
                  COD
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400">Nationwide Delivery</span>
                  <span className="text-xs font-semibold text-[#00f2d2]">
                    Pay At Doorstep
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Slider Navigation Controls (Only if multiple hero slides exist and NOT on mobile) */}
        {!isMobile && slides.length > 1 && (
          <div className="mt-8 pt-4 hidden md:flex items-center justify-center gap-6">
            <button
              onClick={handlePrevSlide}
              aria-label="Previous Slide"
              className="p-2 rounded-full bg-slate-800/80 hover:bg-[#c5a880] text-slate-300 hover:text-[#0b0f17] border border-slate-700 transition-colors shadow-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Indicators */}
            <div className="flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx
                      ? 'w-8 bg-[#c5a880]'
                      : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextSlide}
              aria-label="Next Slide"
              className="p-2 rounded-full bg-slate-800/80 hover:bg-[#c5a880] text-slate-300 hover:text-[#0b0f17] border border-slate-700 transition-colors shadow-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
