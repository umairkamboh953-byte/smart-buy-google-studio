import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { CreditCard, ShieldCheck, Truck, MessageCircle, RotateCcw } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const { settings } = useStore();

  const whatsAppNumber = settings?.contact?.whatsApp || '+923000762781';
  const cleanPhone = whatsAppNumber.replace(/\D/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=Hi%20Smart%20Connect,%20I%20have%20an%20inquiry%20regarding%20products`;

  return (
    <section className="py-16 bg-[#0e1422] border-t border-[#1a2333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c5a880]">
            The Smart Connect Standard
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
            Built for Pakistani Luxury Shoppers
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Seamless shopping with zero advance payment risk and rapid doorstep delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 text-left space-y-3 hover:border-[#c5a880]/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 flex items-center justify-center text-[#c5a880]">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-base font-bold text-white">
              Cash on Delivery (COD)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay upon physical delivery at your doorstep anywhere in Pakistan. No advance bank
              deposits or credit card info required.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 text-left space-y-3 hover:border-[#c5a880]/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#00f2d2]/15 flex items-center justify-center text-[#00f2d2]">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-base font-bold text-white">
              Express Courier Logistics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dispatched via premium courier networks (TCS, Leopard, Call Courier) with real-time SMS tracking directly to your mobile phone.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 text-left space-y-3 hover:border-[#c5a880]/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 flex items-center justify-center text-[#c5a880]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-base font-bold text-white">
              Authenticity Verified
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every watch, fragrance flacon, acoustic device, and leather piece is rigorously
              inspected for craftsmanship before packing.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 text-left space-y-3 hover:border-[#c5a880]/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#00f2d2]/15 flex items-center justify-center text-[#00f2d2]">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-base font-bold text-white">
              Dedicated WhatsApp Support
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct assistance for order tracking, size consultations, and product inquiries.
            </p>
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00f2d2] hover:underline pt-1"
            >
              <span>Chat with Concierge →</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
