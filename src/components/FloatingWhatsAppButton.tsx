import React from 'react';
import { useStore } from '../context/StoreContext.tsx';

export const FloatingWhatsAppButton: React.FC = () => {
  const { settings, currentView, selectedProductId, products } = useStore();

  const whatsAppNumber = settings?.contact?.whatsApp || '+923000762781';
  const storeName = settings?.storeName || 'Smart Buy';

  // Format clean phone number with Pakistan country code normalization
  let cleanPhone = whatsAppNumber.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '92' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) {
    cleanPhone = '92' + cleanPhone;
  }

  // Pre-fill message context if on a product detail page
  const currentProduct =
    currentView === 'product-detail' && selectedProductId
      ? products.find((p) => p.id === selectedProductId)
      : null;

  const defaultMessage = currentProduct
    ? `Assalam-o-Alaikum ${storeName}, I am interested in "${currentProduct.name}" (Price: Rs. ${currentProduct.price.toLocaleString()}). Is this available for Cash on Delivery?`
    : `Assalam-o-Alaikum ${storeName}! I have an inquiry about your products and delivery across Pakistan.`;

  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center select-none">
      <div className="relative group">
        {/* Tooltip on Hover for Desktop */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3.5 py-2 rounded-xl bg-[#0e1420]/95 border border-[#25D366]/40 text-xs text-white font-medium shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-white">Chat on WhatsApp</span>
            <span className="text-[10px] text-emerald-400">Direct WhatsApp Concierge</span>
          </div>
        </div>

        {/* Direct WhatsApp Anchor Link: Immediately opens WhatsApp on click */}
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Direct WhatsApp Chat"
          title={`Chat with ${storeName} on WhatsApp`}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#4eed87] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none"
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping [animation-duration:3s]" />

          {/* Official WhatsApp Emblem */}
          <svg
            className="w-7 h-7 fill-current relative z-10 drop-shadow-sm"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>

          {/* Online green indicator badge */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0b0f17] shadow-sm" />
        </a>
      </div>
    </div>
  );
};
