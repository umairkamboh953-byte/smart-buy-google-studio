import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import {
  Home,
  ShoppingCart,
  Heart,
  MessageCircle,
  Compass,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    navigateTo,
    cartCount,
    wishlist,
    setIsCartOpen,
    settings,
  } = useStore();

  const whatsAppNumber = settings?.contact?.whatsApp || '+923000762781';
  const storeName = settings?.storeName || 'Smart Buy';
  let cleanWhatsApp = whatsAppNumber.replace(/\D/g, '');
  if (cleanWhatsApp.startsWith('0')) {
    cleanWhatsApp = '92' + cleanWhatsApp.slice(1);
  } else if (!cleanWhatsApp.startsWith('92') && cleanWhatsApp.length === 10) {
    cleanWhatsApp = '92' + cleanWhatsApp;
  }
  const whatsAppUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${storeName}, I need assistance with an order.`
  )}`;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f17]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_25px_rgba(0,0,0,0.7)] px-2 py-1.5 safe-area-bottom"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {/* Home */}
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
            currentView === 'home'
              ? 'text-[#c5a880]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Home</span>
        </button>

        {/* Shop / Explore */}
        <button
          onClick={() => navigateTo('shop')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
            currentView === 'shop'
              ? 'text-[#c5a880]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Catalog</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={() => navigateTo('shop')}
          className="relative flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all duration-200"
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Wishlist</span>
        </button>

        {/* Cart Drawer Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all duration-200"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#c5a880] text-[#0b0f17] font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Cart</span>
        </button>

        {/* WhatsApp Concierge */}
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all duration-200"
        >
          <MessageCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
};
