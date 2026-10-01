import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import type { Customer, Order } from '../types/index.ts';
import { formatPKR, formatDate } from '../utils/formatters.ts';
import { GoogleAuthModal, GoogleLogoIcon } from './GoogleAuthModal.tsx';
import { apiUrl } from '../utils/apiConfig.ts';
import {
  User,
  ShoppingCart,
  Heart,
  MapPin,
  LogOut,
  X,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CustomerAccountModal: React.FC = () => {
  const {
    customerUser,
    setCustomerUser,
    navigateTo,
    wishlist,
    products,
    settings,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'login' | 'register'>('orders');

  // Google Authentication State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Lahore');
  const [regAddress, setRegAddress] = useState('');
  const [trackInput, setTrackInput] = useState('');

  // Orders
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchCustomerOrders = async (queryText?: string) => {
    try {
      setLoadingOrders(true);

      // 1. Gather all local storage candidate orders from this device
      let localCandidates: Order[] = [];
      try {
        const localAll: Order[] = JSON.parse(localStorage.getItem('sc_orders') || '[]');
        const localCust: Order[] = JSON.parse(localStorage.getItem('sc_customer_orders') || '[]');
        const latest: Order | null = JSON.parse(localStorage.getItem('sc_latest_order') || 'null');
        localCandidates = [...localCust, ...localAll, ...(latest ? [latest] : [])];
      } catch {}

      const cleanQuery = (queryText !== undefined ? queryText : trackInput || customerUser?.email || customerUser?.phone || '').toLowerCase().trim();
      const phoneDigits = cleanQuery.replace(/\D/g, '');
      const userEmail = (customerUser?.email || '').toLowerCase().trim();
      const userPhoneDigits = (customerUser?.phone || '').replace(/\D/g, '');
      const userName = (customerUser?.fullName || '').toLowerCase().trim();

      const isMatchingOrder = (o: Order): boolean => {
        if (!o || !o.customer) return false;
        const oNum = (o.orderNumber || '').toLowerCase().trim();
        const oId = (o.id || '').toLowerCase().trim();
        const oEmail = (o.customer.email || '').toLowerCase().trim();
        const oPhone = (o.customer.phone || '').replace(/\D/g, '');
        const oName = (o.customer.fullName || '').toLowerCase().trim();

        // Exact or partial order number match
        if (cleanQuery && (oNum === cleanQuery || oNum.includes(cleanQuery) || oId === cleanQuery || oId.includes(cleanQuery))) return true;
        // Email match
        if (cleanQuery && (oEmail === cleanQuery || oEmail.includes(cleanQuery) || cleanQuery.includes(oEmail))) return true;
        if (userEmail && (oEmail === userEmail || oEmail.includes(userEmail) || userEmail.includes(oEmail))) return true;
        // Phone digits match
        if (phoneDigits && phoneDigits.length >= 7 && (oPhone.includes(phoneDigits) || phoneDigits.includes(oPhone))) return true;
        if (userPhoneDigits && userPhoneDigits.length >= 7 && (oPhone.includes(userPhoneDigits) || userPhoneDigits.includes(oPhone))) return true;
        // Name match
        if (cleanQuery && cleanQuery.length > 2 && oName.includes(cleanQuery)) return true;
        if (userName && userName.length > 2 && (oName === userName || oName.includes(userName) || userName.includes(oName))) return true;
        return false;
      };

      // If no query and not logged in, show all orders placed from this browser
      let matchedLocal: Order[] = [];
      if (!cleanQuery && !userEmail && !userPhoneDigits) {
        matchedLocal = localCandidates;
      } else {
        matchedLocal = localCandidates.filter(isMatchingOrder);
      }

      // 2. Query backend server
      let serverOrders: Order[] = [];
      const queryParam = cleanQuery || customerUser?.email || customerUser?.phone;
      if (queryParam) {
        try {
          const res = await fetch(apiUrl(`/api/orders/my-orders?query=${encodeURIComponent(queryParam)}`));
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            serverOrders = await res.json();
          }
        } catch (err) {
          console.warn('Server orders query notice:', err);
        }
      }

      // 3. Deduplicate
      const combined = [...serverOrders, ...matchedLocal];
      const seen = new Set<string>();
      const finalOrders: Order[] = [];
      for (const ord of combined) {
        const key = ord.orderNumber || ord.id;
        if (key && !seen.has(key)) {
          seen.add(key);
          finalOrders.push(ord);
        }
      }

      finalOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCustomerOrders(finalOrders);
    } catch (e) {
      console.warn('Customer orders fetch notice:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, [customerUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim();
    const cleanPhone = loginPhone.trim();
    if (!cleanEmail && !cleanPhone) {
      showToast('Please enter your email or phone number', 'error');
      return;
    }

    // Match against local orders to populate real details
    let existingName = '';
    let existingCity = 'Lahore';
    let existingAddress = '';
    try {
      const allLocal: Order[] = JSON.parse(localStorage.getItem('sc_orders') || '[]');
      const matched = allLocal.find((o) => {
        const oE = (o.customer?.email || '').toLowerCase().trim();
        const oP = (o.customer?.phone || '').replace(/\D/g, '');
        const qE = cleanEmail.toLowerCase();
        const qP = cleanPhone.replace(/\D/g, '');
        return (qE && oE === qE) || (qP && qP.length >= 7 && (oP.includes(qP) || qP.includes(oP)));
      });
      if (matched && matched.customer) {
        existingName = matched.customer.fullName;
        existingCity = matched.customer.city;
        existingAddress = matched.customer.address;
      }
    } catch {}

    const user: Customer = {
      id: `cust-${Date.now()}`,
      fullName: existingName || (cleanEmail ? cleanEmail.split('@')[0] : 'Valued Customer'),
      email: cleanEmail || '',
      phone: cleanPhone || '',
      city: existingCity,
      address: existingAddress,
      createdAt: new Date().toISOString(),
    };

    setCustomerUser(user);
    try {
      localStorage.setItem('sc_customer', JSON.stringify(user));
    } catch {}
    setActiveTab('orders');
    fetchCustomerOrders(cleanEmail || cleanPhone);
    showToast(`Welcome back, ${user.fullName}!`, 'success');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      showToast('Name and phone are required', 'error');
      return;
    }

    const user: Customer = {
      id: `cust-${Date.now()}`,
      fullName: regName.trim(),
      email: regEmail.trim() || `${regPhone.replace(/\D/g, '')}@smartconnect.pk`,
      phone: regPhone.trim(),
      city: regCity,
      address: regAddress.trim(),
      createdAt: new Date().toISOString(),
    };

    setCustomerUser(user);
    setActiveTab('orders');
    showToast('Account created successfully!', 'success');
  };

  const handleLogout = () => {
    setCustomerUser(null);
    setCustomerOrders([]);
    setActiveTab('login');
    showToast('Logged out', 'info');
  };

  const handleGoogleSuccess = (customer: Customer) => {
    setCustomerUser(customer);
    setActiveTab('orders');
    showToast(`Signed in with Google as ${customer.email}!`, 'success');
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="py-12 bg-[#0b0f17] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#121824] border border-slate-800 shadow-2xl p-6 sm:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#c5a880] font-semibold">
                Customer Concierge
              </span>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
                {customerUser ? `Hello, ${customerUser.fullName}` : 'Customer Portal'}
              </h1>
            </div>

            {customerUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 rounded-lg bg-rose-500/10 border border-rose-500/20 self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            ) : null}
          </div>

          {/* Navigation Tabs - Universally Accessible */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-8 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-[#c5a880] text-[#0b0f17]'
                  : 'text-slate-400 hover:text-white bg-[#0e1420]'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>My Orders ({customerOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'bg-[#c5a880] text-[#0b0f17]'
                  : 'text-slate-400 hover:text-white bg-[#0e1420]'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist ({wishlist.length})</span>
            </button>

            {customerUser ? (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-[#c5a880] text-[#0b0f17]'
                    : 'text-slate-400 hover:text-white bg-[#0e1420]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile &amp; Addresses</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'login'
                      ? 'bg-[#c5a880] text-[#0b0f17]'
                      : 'text-slate-400 hover:text-white bg-[#0e1420]'
                  }`}
                >
                  Customer Login
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'register'
                      ? 'bg-[#c5a880] text-[#0b0f17]'
                      : 'text-slate-400 hover:text-white bg-[#0e1420]'
                  }`}
                >
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && !customerUser && (
            <div className="max-w-md mx-auto space-y-4">
              {/* Google One-Click Login */}
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] border border-slate-200 cursor-pointer"
              >
                <GoogleLogoIcon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  Continue with Google
                </span>
                <span className="text-[10px] text-slate-500 font-medium ml-auto hidden sm:inline">
                  Instant Access
                </span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  or sign in with email &amp; phone
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. client@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Pakistani Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs hover:bg-[#d6bc98] transition-colors mt-2"
                >
                  Access Customer Dashboard
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-xs text-[#c5a880] hover:underline"
                  >
                    Need an account? Register here
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && !customerUser && (
            <div className="max-w-md mx-auto space-y-4">
              {/* Google One-Click Register */}
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] border border-slate-200 cursor-pointer"
              >
                <GoogleLogoIcon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  Continue with Google
                </span>
                <span className="text-[10px] text-slate-500 font-medium ml-auto hidden sm:inline">
                  1-Click Setup
                </span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  or register with email &amp; details
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Adnan Sheikh"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Pakistani Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0300-8451293"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="adnan@domain.com"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="House / Street / Sector"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs hover:bg-[#d6bc98] transition-colors mt-2"
                >
                  Create Account
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Tracking Lookup Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1420] border border-slate-800 space-y-2 text-left">
                <label className="block text-xs font-semibold text-[#c5a880] uppercase tracking-wider">
                  Track Any Order Across Pakistan
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={trackInput}
                      onChange={(e) => setTrackInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          fetchCustomerOrders(trackInput);
                        }
                      }}
                      placeholder="Enter Order # (e.g. SC-PK-8921) or Pakistani Phone (0300-1234567)..."
                      className="w-full px-3.5 py-2.5 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-[#c5a880]"
                    />
                    {trackInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setTrackInput('');
                          fetchCustomerOrders('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchCustomerOrders(trackInput)}
                    className="px-5 py-2.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs hover:bg-[#d6bc98] transition-colors whitespace-nowrap"
                  >
                    Track Order
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant live status, delivery timeline, and courier verification details.
                </p>
              </div>

              {loadingOrders ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading your orders...</div>
              ) : customerOrders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0e1420] text-center border border-slate-800">
                  <p className="text-sm font-semibold text-slate-300 mb-1">No Orders Found</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                    If you recently placed an order, please enter your Pakistani Phone Number or Order # above to look up your details, or browse our luxury collection.
                  </p>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs hover:bg-[#d6bc98] transition-colors"
                  >
                    Explore Luxury Store
                  </button>
                </div>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord.id || ord.orderNumber}
                    className="p-5 rounded-2xl bg-[#0e1420] border border-slate-800 space-y-3 text-left shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#c5a880]">
                          {ord.orderNumber}
                        </span>
                        <span className="text-slate-500 text-xs ml-2">
                          · {formatDate(ord.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : ord.status === 'Shipped'
                              ? 'bg-sky-950 text-sky-400 border border-sky-800'
                              : ord.status === 'Cancelled'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          Status: {ord.status}
                        </span>
                        <span className="text-xs font-bold text-white tabular-nums">
                          {formatPKR(ord.total)}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-slate-800/60">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={it.image}
                              alt={it.productName}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800"
                            />
                            <div>
                              <span className="text-slate-200 font-medium block">{it.productName}</span>
                              <span className="text-[11px] text-slate-500">Qty: {it.quantity}</span>
                            </div>
                          </div>
                          <span className="text-slate-300 font-medium tabular-nums">
                            {formatPKR(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
                      <div>
                        <span className="text-slate-500">Recipient: </span>
                        <span className="text-slate-200 font-medium">{ord.customer.fullName} ({ord.customer.phone})</span>
                        <div className="text-slate-400 truncate max-w-sm">
                          {ord.customer.address}, {ord.customer.city}
                        </div>
                      </div>

                      {settings?.contact?.whatsApp && (
                        <a
                          href={`https://wa.me/${settings.contact.whatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi Smart Connect! I want to check tracking updates for Order #${ord.orderNumber}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto font-medium"
                        >
                          <span>WhatsApp Support</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlistProducts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0e1420] text-center border border-slate-800">
                  <p className="text-sm text-slate-300 mb-1">Your wishlist is currently empty.</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Save pieces you love by tapping the heart icon on any product card.
                  </p>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="px-5 py-2 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold text-xs"
                  >
                    Explore Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-[#0e1420] border border-slate-800 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.mainImage}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-lg bg-slate-900"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                          <span className="text-xs text-[#c5a880] font-semibold tabular-nums">
                            {formatPKR(p.price)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigateTo('product-detail', p.id)}
                        className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE & ADDRESSES */}
          {customerUser && activeTab === 'profile' && (
            <div className="space-y-6 text-left text-xs">
              <div className="p-5 rounded-2xl bg-[#0e1420] border border-slate-800 space-y-3">
                <h3 className="font-serif-luxury text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#c5a880]" />
                  <span>Personal Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Full Name</span>
                    <span className="font-semibold text-white">{customerUser.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Phone</span>
                    <span className="font-semibold text-white">{customerUser.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Email</span>
                    <span className="font-semibold text-white">{customerUser.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Member Since</span>
                    <span className="font-semibold text-white">
                      {formatDate(customerUser.createdAt)}
                    </span>
                  </div>
                  {customerUser.authProvider === 'google' && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-[#141e30] border border-blue-500/30 flex items-center gap-2.5">
                      <GoogleLogoIcon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold text-white">
                        Authenticated with Google Account
                      </span>
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0e1420] border border-slate-800 space-y-3">
                <h3 className="font-serif-luxury text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#c5a880]" />
                  <span>Default Shipping Address</span>
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {customerUser.address
                    ? `${customerUser.address}, ${customerUser.city || 'Pakistan'}`
                    : 'No default address saved yet. Address will automatically update upon your next checkout.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Authentication Dialog Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
};
