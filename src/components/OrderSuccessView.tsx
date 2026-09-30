import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { formatPKR, formatDate } from '../utils/formatters.ts';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Phone,
  MessageCircle,
} from 'lucide-react';

export const OrderSuccessView: React.FC = () => {
  const { latestOrder, navigateTo, settings } = useStore();

  useEffect(() => {
    // Fire celebratory luxury confetti
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c5a880', '#00f2d2', '#ffffff', '#e2ceb4'],
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!latestOrder) {
    return (
      <div className="py-24 text-center bg-[#0b0f17] min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="font-serif-luxury text-2xl text-white mb-2">No Active Order Found</h2>
        <button
          onClick={() => navigateTo('shop')}
          className="mt-4 px-6 py-2.5 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold text-xs"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const order = latestOrder;
  const whatsAppNumber = settings?.contact?.whatsApp || '+923000762781';
  const storeName = settings?.storeName || 'Smart Buy';
  let cleanPhone = whatsAppNumber.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '92' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) {
    cleanPhone = '92' + cleanPhone;
  }
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${storeName}, I have an inquiry regarding my Order #${order.orderNumber}.`
  )}`;

  return (
    <div className="py-16 bg-[#0b0f17] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Animated Celebration Card */}
        <div className="rounded-3xl bg-[#121824] border border-[#c5a880]/30 shadow-2xl p-6 sm:p-10 text-center animate-in zoom-in-95 duration-300">
          {/* Success Check Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#00f2d2]/10 border-2 border-[#00f2d2] flex items-center justify-center mx-auto mb-6 text-[#00f2d2] shadow-[0_0_30px_rgba(0,242,210,0.3)]">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#c5a880] block mb-1">
            Order Confirmed
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Thank You, {order.customer.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-8">
            Your luxury order has been received and scheduled for dispatch via courier. A representative may call for confirmation.
          </p>

          {/* Key Reference Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#0b0f17] border border-slate-800 text-left text-xs mb-8">
            <div>
              <span className="text-slate-500 block text-[11px]">Order Reference</span>
              <span className="font-mono font-bold text-[#c5a880] text-sm">
                {order.orderNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Payment Mode</span>
              <span className="font-semibold text-white">Cash on Delivery</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Due (Rs.)</span>
              <span className="font-bold text-emerald-400 text-sm tabular-nums">
                {formatPKR(order.total)}
              </span>
            </div>
          </div>

          {/* Delivery Timeline Tracker */}
          <div className="p-6 rounded-2xl bg-[#0b0f17] border border-slate-800 text-left mb-8 space-y-4">
            <h3 className="font-serif-luxury text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#c5a880]" />
              <span>Estimated Delivery Timeline</span>
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#c5a880] text-[#0b0f17] font-bold flex items-center justify-center text-xs mb-1">
                  ✓
                </div>
                <span className="text-white font-medium text-[11px]">Received</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#1e293b] text-[#c5a880] border border-[#c5a880]/50 font-bold flex items-center justify-center text-xs mb-1">
                  2
                </div>
                <span className="text-slate-400 text-[11px]">Inspection</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#1e293b] text-slate-500 font-bold flex items-center justify-center text-xs mb-1">
                  3
                </div>
                <span className="text-slate-500 text-[11px]">Courier Transit</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#1e293b] text-slate-500 font-bold flex items-center justify-center text-xs mb-1">
                  4
                </div>
                <span className="text-slate-500 text-[11px]">Delivery (COD)</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between gap-1">
              <span>
                Shipping to: <strong>{order.customer.address}, {order.customer.city}</strong>
              </span>
              <span>Contact: {order.customer.phone}</span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="text-left mb-8">
            <h3 className="font-serif-luxury text-xs font-bold text-white uppercase tracking-wider mb-3">
              Order Receipt ({order.items.length} items)
            </h3>
            <div className="divide-y divide-slate-800 rounded-xl bg-[#0b0f17] border border-slate-800 p-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-10 h-10 object-cover rounded bg-slate-900 border border-slate-800"
                    />
                    <div>
                      <span className="font-medium text-white block">{item.productName}</span>
                      <span className="text-slate-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('shop')}
              className="btn-luxury w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1f2d44] hover:bg-[#283b59] text-white border border-[#2e4368] font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#00f2d2]" />
              <span>Track via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
