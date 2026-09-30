/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { CategoriesSection } from './components/CategoriesSection.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { QuickViewModal } from './components/QuickViewModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { ShopPage } from './components/ShopPage.tsx';
import { CategoriesPage } from './components/CategoriesPage.tsx';
import { ProductDetailPage } from './components/ProductDetailPage.tsx';
import { CheckoutPage } from './components/CheckoutPage.tsx';
import { OrderSuccessView } from './components/OrderSuccessView.tsx';
import { CustomerAccountModal } from './components/CustomerAccountModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { TrustSection } from './components/TrustSection.tsx';
import { AboutView, ContactView } from './components/AboutContactViews.tsx';
import { Footer } from './components/Footer.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, products, navigateTo, isLoading, settings, setSelectedCategory } = useStore();

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  const activePromoBanner = (settings?.banners || []).find(
    (b) => b.type === 'promo' && b.isActive
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-[#f1f5f9]">
      <Navbar />

      <main className="flex-1 pb-16 lg:pb-0">
        {currentView === 'home' && (
          <>
            <HeroSection />

            <CategoriesSection />

            {/* Featured Luxury Showcase Section */}
            <section className="py-12 sm:py-16 bg-[#0b0f17]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c5a880]">
                      Handpicked Excellence
                    </span>
                    <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
                      Featured Collection
                    </h2>
                  </div>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="text-xs sm:text-sm font-semibold text-[#c5a880] hover:text-[#e2ceb4] inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
                  >
                    <span>View All ({products.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {featuredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </section>

            {/* Campaign Banner: Nationwide Cash on Delivery Assurance or Admin Promo Strip */}
            <section className="py-12 bg-gradient-to-r from-[#121928] via-[#162136] to-[#121928] border-y border-[#c5a880]/20">
              <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#c5a880] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activePromoBanner?.badgeText || 'The Smart Connect Commitment'}</span>
                </div>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
                  {activePromoBanner?.title || 'Doorstep Verification with Cash on Delivery'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  {activePromoBanner?.subtitle ||
                    'We believe luxury shopping should inspire absolute confidence. Open your parcel in front of the courier before handing over payment anywhere across Pakistan.'}
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      if (activePromoBanner?.linkType === 'category') {
                        setSelectedCategory(activePromoBanner.linkValue || 'all');
                        navigateTo('shop');
                      } else if (activePromoBanner?.linkType === 'categories') {
                        navigateTo('categories');
                      } else {
                        setSelectedCategory('all');
                        navigateTo('shop');
                      }
                    }}
                    className="btn-luxury px-6 py-3 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs hover:bg-[#d6bc98] transition-colors"
                  >
                    {activePromoBanner?.ctaText || 'Start Shopping Now'}
                  </button>
                </div>
              </div>
            </section>

            {/* Best Sellers Section */}
            <section className="py-12 sm:py-16 bg-[#0b0f17]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#00f2d2]">
                      Pakistani Customer Favorites
                    </span>
                    <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
                      Best Sellers
                    </h2>
                  </div>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="text-xs sm:text-sm font-semibold text-[#c5a880] hover:text-[#e2ceb4] inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
                  >
                    <span>View More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {bestSellers.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </section>

            <TrustSection />
          </>
        )}

        {currentView === 'shop' && <ShopPage />}
        {currentView === 'categories' && <CategoriesPage />}
        {currentView === 'product-detail' && <ProductDetailPage />}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'order-success' && <OrderSuccessView />}
        {currentView === 'account' && <CustomerAccountModal />}
        {currentView === 'admin' && <AdminPanel />}
        {currentView === 'about' && <AboutView />}
        {currentView === 'contact' && <ContactView />}
      </main>

      <Footer />

      {/* Slide-over Cart & Modals */}
      <CartDrawer />
      <QuickViewModal />
      <FloatingWhatsAppButton />
      <ToastContainer />
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
