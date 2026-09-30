import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { formatPKR } from '../utils/formatters.ts';
import {
  X,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    navigateTo,
    settings,
  } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = settings?.shipping.freeDeliveryThreshold ?? 3500;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigateTo('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0f1522] border-l border-[#c5a880]/20 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#c5a880]" />
              <h2 className="font-serif-luxury text-lg font-bold text-white">
                Your Shopping Cart ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-[#131b2c] border-b border-slate-800/80 text-xs">
            {amountNeededForFreeDelivery > 0 ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>
                    Add <strong className="text-[#c5a880]">{formatPKR(amountNeededForFreeDelivery)}</strong> for FREE Express Delivery
                  </span>
                  <span className="text-slate-500 font-medium">Goal: {formatPKR(freeDeliveryThreshold)}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#c5a880] h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Truck className="w-4 h-4" />
                <span>You qualify for FREE Nationwide Delivery!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-800">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Your cart is empty</h3>
                  <p className="text-xs text-slate-400">
                    Discover our collection of watches, electronics, perfumes, and leather essentials.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold text-xs hover:bg-[#d6bc98] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-18 h-18 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-[#c5a880] uppercase tracking-wider block">
                        {item.product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded border border-slate-700 bg-slate-800/60">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.quantity - 1)
                          }
                          className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-white min-w-6 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="px-2 py-1 text-slate-400 hover:text-white text-xs disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs font-semibold text-white tabular-nums">
                        {formatPKR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#0b0f17] border-t border-slate-800 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-200 tabular-nums">{formatPKR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Nationwide Delivery</span>
                  <span className="tabular-nums">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      formatPKR(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Amount (Rs.)</span>
                  <span className="text-base text-[#c5a880] tabular-nums">
                    {formatPKR(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Cash on Delivery Note */}
              <div className="p-2.5 rounded-lg bg-[#141b2b] border border-[#c5a880]/20 flex items-center gap-2 text-[11px] text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#00f2d2] shrink-0" />
                <span>Cash on Delivery (COD) · Zero advance payment required</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="btn-luxury w-full py-3.5 px-4 rounded-xl bg-[#c5a880] hover:bg-[#d6bc98] text-[#0b0f17] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-white hover:underline"
              >
                Continue Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
