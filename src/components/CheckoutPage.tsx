import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { formatPKR } from '../utils/formatters.ts';
import type { Customer, CustomerShippingAddress, PaymentMethodType, PaymentDetails } from '../types/index.ts';
import { GoogleAuthModal, GoogleLogoIcon } from './GoogleAuthModal.tsx';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  Lock,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  FileText,
  CreditCard,
  Smartphone,
  Landmark,
  Copy,
  Check,
  Info,
  CheckCircle2,
} from 'lucide-react';

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad ICT',
  'Azad Kashmir',
  'Gilgit-Baltistan',
];

const POPULAR_PAKISTANI_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Other / Custom City',
];

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    placeOrder,
    navigateTo,
    customerUser,
    setCustomerUser,
    settings,
    showToast,
  } = useStore();

  const [fullName, setFullName] = useState(customerUser?.fullName || '');
  const [phone, setPhone] = useState(customerUser?.phone || '');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [address, setAddress] = useState(customerUser?.address || '');
  const [citySelect, setCitySelect] = useState(customerUser?.city || 'Lahore');
  const [customCity, setCustomCity] = useState('');
  const [province, setProvince] = useState(customerUser?.province || 'Punjab');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Google Authentication State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleGoogleSuccess = (cust: Customer) => {
    setCustomerUser(cust);
    if (cust.fullName && !fullName) setFullName(cust.fullName);
    if (cust.email) setEmail(cust.email);
    if (cust.phone && (!phone || phone === '0300-1234567')) setPhone(cust.phone);
    if (cust.address && !address) setAddress(cust.address);
    if (cust.city && !citySelect) setCitySelect(cust.city);
    showToast(`Signed in with Google! Details auto-filled for ${cust.fullName}.`, 'success');
  };

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Cash on Delivery (COD)');
  const [transactionId, setTransactionId] = useState('');
  const [senderAccountInfo, setSenderAccountInfo] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings configs
  const bankConfig = settings?.payments?.bankTransfer;
  const walletConfig = settings?.payments?.mobileWallets;
  const cardConfig = settings?.payments?.cardPayment;
  const codConfig = settings?.payments?.cod;

  const effectiveCity = citySelect === 'Other / Custom City' ? customCity : citySelect;

  const handleCopy = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showToast(`Copied ${fieldName} to clipboard`, 'success');
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart.length) {
      showToast('Your shopping cart is empty', 'error');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim() || !effectiveCity.trim()) {
      showToast('Please fill all required recipient and address fields', 'error');
      return;
    }

    // Validation for online payments
    if (
      (paymentMethod === 'Online Bank Transfer (IBFT / Raast)' ||
        paymentMethod === 'JazzCash / EasyPaisa') &&
      !transactionId.trim()
    ) {
      const confirmProceed = window.confirm(
        'You have not entered a Transaction ID (TID). Would you like to proceed and send your payment proof screenshot via WhatsApp after ordering?'
      );
      if (!confirmProceed) return;
    }

    if (paymentMethod === 'Credit / Debit Card') {
      if (!cardNumber.trim() || !cardHolder.trim() || !cardExpiry.trim()) {
        showToast('Please enter your card number, holder name, and expiry date', 'error');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const customerShipping: CustomerShippingAddress = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${phone.replace(/\D/g, '')}@smartconnect.pk`,
        address: address.trim(),
        city: effectiveCity.trim(),
        province,
        postalCode: postalCode.trim() || '54000',
        orderNotes: orderNotes.trim() || undefined,
      };

      const paymentDetails: PaymentDetails = {
        transactionId: transactionId.trim() || undefined,
        bankName:
          paymentMethod === 'Online Bank Transfer (IBFT / Raast)'
            ? bankConfig?.bankName || 'Meezan Bank'
            : undefined,
        senderAccountName: senderAccountInfo.trim() || undefined,
        cardLast4:
          paymentMethod === 'Credit / Debit Card'
            ? cardNumber.replace(/\s/g, '').slice(-4)
            : undefined,
        cardHolderName:
          paymentMethod === 'Credit / Debit Card' ? cardHolder.trim() : undefined,
        paidAt:
          paymentMethod !== 'Cash on Delivery (COD)' ? new Date().toISOString() : undefined,
        paymentStatus:
          paymentMethod === 'Cash on Delivery (COD)'
            ? 'unpaid'
            : transactionId
            ? 'pending_verification'
            : 'pending_verification',
      };

      await placeOrder(customerShipping, paymentMethod, paymentDetails);
    } catch (err: any) {
      showToast(err.message || 'Error processing order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If empty cart
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-[#121824] border border-slate-800 flex items-center justify-center mb-6 text-[#c5a880]">
          <Truck className="w-10 h-10" />
        </div>
        <h2 className="font-serif-luxury text-2xl font-bold text-white mb-2">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-slate-400 text-sm max-w-md mb-8">
          You need at least one luxury product in your shopping bag before proceeding to checkout.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="btn-luxury px-8 py-3 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-sm"
        >
          Explore Luxury Collection
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 bg-[#0b0f17] min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => navigateTo('shop')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#c5a880] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-[#c5a880] font-medium">Secure Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Form (Left Column, lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[11px] uppercase tracking-widest text-[#c5a880] font-semibold">
                Express Checkout
              </span>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
                Order Delivery &amp; Payment Details
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Cash on Delivery, Direct IBFT / Raast bank transfer, and mobile wallet options across Pakistan.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Customer Contact Information */}
              <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-[#c5a880]" />
                    <span>1. Contact &amp; Recipient Information</span>
                  </h2>
                  {customerUser?.authProvider === 'google' && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium inline-flex items-center gap-1">
                      <GoogleLogoIcon className="w-3.5 h-3.5" />
                      <span>Google Verified</span>
                    </span>
                  )}
                </div>

                {!customerUser && (
                  <div className="p-3.5 rounded-xl bg-[#0b0f17] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                        <GoogleLogoIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Have a Google Account?</div>
                        <p className="text-[11px] text-slate-400">Continue with Google to auto-fill recipient info in 1-click</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsGoogleModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shrink-0 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <GoogleLogoIcon className="w-3.5 h-3.5" />
                      <span>Continue with Google</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Tariq Mehmood"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Pakistani Mobile / WhatsApp Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Email Address (For Order Tracking Confirmation)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Shipping Delivery Address */}
              <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4">
                <h2 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#c5a880]" />
                  <span>2. Shipping Address in Pakistan</span>
                </h2>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Complete Street Address (House/Flat No, Street, Sector/Area) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. House 54, Block G, Phase 5 DHA"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      City *
                    </label>
                    <select
                      value={citySelect}
                      onChange={(e) => setCitySelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                    >
                      {POPULAR_PAKISTANI_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {citySelect === 'Other / Custom City' && (
                      <input
                        type="text"
                        required
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Enter your city name"
                        className="w-full mt-2 px-3 py-1.5 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Province / Region *
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                    >
                      {PAKISTAN_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 54000"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Special Courier Instructions / Order Notes (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Ring bell twice, deliver before 5 PM"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                    />
                    <FileText className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div className="p-6 rounded-2xl bg-[#121824] border border-[#c5a880]/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h2 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#c5a880]" />
                    <span>3. Select Payment Method</span>
                  </h2>
                  <span className="text-[11px] font-mono text-[#00f2d2] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secure Gateway</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Cash on Delivery (COD) */}
                  {codConfig?.enabled !== false && (
                    <label
                      className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        paymentMethod === 'Cash on Delivery (COD)'
                          ? 'bg-[#162032] border-[#c5a880] shadow-md ring-1 ring-[#c5a880]/50'
                          : 'bg-[#0b0f17] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Cash on Delivery (COD)'}
                        onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                        className="mt-1 accent-[#c5a880]"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <Truck className="w-4 h-4 text-[#c5a880]" />
                            <span>Cash on Delivery (COD)</span>
                          </div>
                          <span className="text-[10px] bg-[#c5a880]/20 text-[#c5a880] px-2 py-0.5 rounded font-semibold">
                            Nationwide Pakistan
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {codConfig?.instructions ||
                            `Pay with cash to the courier representative when the parcel arrives at your doorstep in ${effectiveCity}. Zero advance payment required.`}
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Option 2: Online Direct Bank Transfer (IBFT / Raast) */}
                  {bankConfig?.enabled !== false && (
                    <div
                      className={`rounded-xl border transition-all ${
                        paymentMethod === 'Online Bank Transfer (IBFT / Raast)'
                          ? 'bg-[#162032] border-blue-500/70 shadow-lg ring-1 ring-blue-500/40'
                          : 'bg-[#0b0f17] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <label className="p-4 flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'Online Bank Transfer (IBFT / Raast)'}
                          onChange={() =>
                            setPaymentMethod('Online Bank Transfer (IBFT / Raast)')
                          }
                          className="mt-1 accent-blue-500"
                        />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <Landmark className="w-4 h-4 text-blue-400" />
                              <span>Direct Bank Transfer (IBFT / Raast)</span>
                            </div>
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-semibold">
                              All Pakistani Banks
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Transfer directly to our official bank account via mobile banking app (HBL, Meezan, Alfalah, Standard Chartered, Raast, etc.).
                          </p>
                        </div>
                      </label>

                      {/* Bank Details Card (Shown when selected) */}
                      {paymentMethod === 'Online Bank Transfer (IBFT / Raast)' && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs animate-in fade-in duration-200">
                          <div className="p-4 rounded-xl bg-[#0e1422] border border-blue-500/30 space-y-2.5">
                            <div className="flex items-center justify-between text-blue-400 font-semibold text-[11px]">
                              <span>Store Official Bank Credentials</span>
                              <span>Instant Raast / IBFT</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Bank Name:</span>
                                <strong className="text-white">
                                  {bankConfig?.bankName || 'Meezan Bank Ltd'}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Account Title:</span>
                                <strong className="text-white">
                                  {bankConfig?.accountTitle || 'Smart Connect Retail'}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Account Number:</span>
                                <div className="flex items-center gap-2">
                                  <strong className="text-white font-mono">
                                    {bankConfig?.accountNumber || '02010108927182'}
                                  </strong>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(
                                        bankConfig?.accountNumber || '02010108927182',
                                        'Account Number'
                                      )
                                    }
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                    title="Copy Account Number"
                                  >
                                    {copiedField === 'Account Number' ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">IBAN:</span>
                                <div className="flex items-center gap-2">
                                  <strong className="text-white font-mono text-[11px] truncate max-w-[170px]">
                                    {bankConfig?.iban || 'PK45MEZN0002010108927182'}
                                  </strong>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(
                                        bankConfig?.iban || 'PK45MEZN0002010108927182',
                                        'IBAN'
                                      )
                                    }
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                    title="Copy IBAN"
                                  >
                                    {copiedField === 'IBAN' ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              {bankConfig?.raastId && (
                                <div className="sm:col-span-2 pt-1 border-t border-slate-800 flex items-center justify-between">
                                  <div>
                                    <span className="text-slate-400 text-[10px]">Raast ID:</span>
                                    <strong className="text-[#00f2d2] font-mono ml-2">
                                      {bankConfig.raastId}
                                    </strong>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(bankConfig.raastId!, 'Raast ID')}
                                    className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Raast ID</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                              {bankConfig?.instructions ||
                                'Transfer the exact order total via your mobile banking app. Enter your Transaction Reference ID below for immediate confirmation.'}
                            </p>
                          </div>

                          {/* Customer Transaction Reference Input */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                                Bank Transaction ID / Reference (TID) *
                              </label>
                              <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="e.g. FT260871928019 or Stanley reference"
                                className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-blue-500 font-mono"
                              />
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                Generated by your bank app upon completing the transfer. (You can also WhatsApp payment receipt).
                              </span>
                            </div>

                            <div>
                              <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                                Your Sending Bank / Account Title (Optional)
                              </label>
                              <input
                                type="text"
                                value={senderAccountInfo}
                                onChange={(e) => setSenderAccountInfo(e.target.value)}
                                placeholder="e.g. Paid from HBL - Tariq Mehmood"
                                className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Option 3: JazzCash / EasyPaisa Mobile Wallets */}
                  {walletConfig?.enabled !== false && (
                    <div
                      className={`rounded-xl border transition-all ${
                        paymentMethod === 'JazzCash / EasyPaisa'
                          ? 'bg-[#162032] border-amber-500/70 shadow-lg ring-1 ring-amber-500/40'
                          : 'bg-[#0b0f17] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <label className="p-4 flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'JazzCash / EasyPaisa'}
                          onChange={() => setPaymentMethod('JazzCash / EasyPaisa')}
                          className="mt-1 accent-amber-500"
                        />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-amber-400" />
                              <span>JazzCash / EasyPaisa Mobile Wallet</span>
                            </div>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">
                              Instant Wallet
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Pay directly from your JazzCash, EasyPaisa, or SadaPay/NayaPay account.
                          </p>
                        </div>
                      </label>

                      {/* Mobile Wallet Details Card */}
                      {paymentMethod === 'JazzCash / EasyPaisa' && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs animate-in fade-in duration-200">
                          <div className="p-4 rounded-xl bg-[#0e1422] border border-amber-500/30 space-y-2.5">
                            <div className="flex items-center justify-between text-amber-400 font-semibold text-[11px]">
                              <span>Official Mobile Wallet Account</span>
                              <span>JazzCash &amp; EasyPaisa</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Account Title:</span>
                                <strong className="text-white">
                                  {walletConfig?.accountTitle || 'Smart Connect Official'}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">
                                  Mobile Account Number:
                                </span>
                                <div className="flex items-center gap-2">
                                  <strong className="text-white font-mono text-sm text-amber-300">
                                    {walletConfig?.accountNumber || '0300-0762781'}
                                  </strong>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(
                                        walletConfig?.accountNumber || '0300-0762781',
                                        'Wallet Number'
                                      )
                                    }
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                    title="Copy Wallet Number"
                                  >
                                    {copiedField === 'Wallet Number' ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                              {walletConfig?.instructions ||
                                'Send payment from your JazzCash or EasyPaisa app to the mobile number above. Then enter the 11/12 digit Transaction ID (TID) received via SMS.'}
                            </p>
                          </div>

                          <div>
                            <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                              JazzCash / EasyPaisa Transaction ID (TID) *
                            </label>
                            <input
                              type="text"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              placeholder="e.g. 02938475928 or SMS TID"
                              className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-amber-500 font-mono"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              Found in the SMS confirmation from 8558 (JazzCash) or 3737 (EasyPaisa).
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Option 4: Credit / Debit Card (Visa / Mastercard) */}
                  {cardConfig?.enabled !== false && (
                    <div
                      className={`rounded-xl border transition-all ${
                        paymentMethod === 'Credit / Debit Card'
                          ? 'bg-[#162032] border-purple-500/70 shadow-lg ring-1 ring-purple-500/40'
                          : 'bg-[#0b0f17] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <label className="p-4 flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'Credit / Debit Card'}
                          onChange={() => setPaymentMethod('Credit / Debit Card')}
                          className="mt-1 accent-purple-500"
                        />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-purple-400" />
                              <span>Credit / Debit Card (Visa, Mastercard, PayPak)</span>
                            </div>
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-semibold">
                              256-bit Encrypted
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Pay with any local or international card. Safe and encrypted transactions.
                          </p>
                        </div>
                      </label>

                      {/* Card Details Card */}
                      {paymentMethod === 'Credit / Debit Card' && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs animate-in fade-in duration-200">
                          <div className="p-4 rounded-xl bg-[#0e1422] border border-purple-500/30 space-y-3">
                            <div>
                              <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                                Card Number *
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  maxLength={19}
                                  value={cardNumber}
                                  onChange={(e) => {
                                    const v = e.target.value
                                      .replace(/\D/g, '')
                                      .replace(/(\d{4})/g, '$1 ')
                                      .trim();
                                    setCardNumber(v);
                                  }}
                                  placeholder="0000 0000 0000 0000"
                                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-purple-500 font-mono tracking-wider"
                                />
                                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-1">
                                <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                                  Cardholder Name *
                                </label>
                                <input
                                  type="text"
                                  value={cardHolder}
                                  onChange={(e) => setCardHolder(e.target.value)}
                                  placeholder="Name on card"
                                  className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-purple-500"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                                  Expiry Date *
                                </label>
                                <input
                                  type="text"
                                  maxLength={5}
                                  value={cardExpiry}
                                  onChange={(e) => {
                                    let v = e.target.value.replace(/\D/g, '');
                                    if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                    setCardExpiry(v);
                                  }}
                                  placeholder="MM/YY"
                                  className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-purple-500 font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                                  CVV / CVC *
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                  placeholder="123"
                                  className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-purple-500 font-mono"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Secured with end-to-end payment gateway encryption</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-luxury w-full py-4 px-6 rounded-xl bg-[#c5a880] hover:bg-[#d6bc98] text-[#0b0f17] font-bold text-base flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 transition-transform active:scale-[0.99]"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Processing Your Order...'
                    : `Confirm Order — ${formatPKR(cartTotal)} (${
                        paymentMethod === 'Cash on Delivery (COD)' ? 'COD' : 'Online'
                      })`}
                </span>
              </button>
            </form>
          </div>

          {/* Order Summary (Right Column, lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-6 sticky top-28">
              <h3 className="font-serif-luxury text-base font-bold text-white pb-3 border-b border-slate-800">
                Order Summary ({cart.length} items)
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between text-xs py-2 border-b border-slate-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.mainImage}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-medium text-white line-clamp-1">
                          {item.product.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Qty: {item.quantity} × {formatPKR(item.product.price)}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold text-white ml-2">
                      {formatPKR(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Subtotal</span>
                  <span className="text-white font-medium">{formatPKR(cartSubtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>Doorstep Courier Delivery</span>
                    {deliveryFee === 0 && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                        FREE
                      </span>
                    )}
                  </div>
                  <span className="text-white font-medium">
                    {deliveryFee === 0 ? 'Rs. 0 (Free)' : formatPKR(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Selected Payment</span>
                  <span className="text-[#c5a880] font-semibold text-right max-w-[180px] truncate">
                    {paymentMethod}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Grand Total</span>
                  <div className="text-right">
                    <span className="font-serif-luxury text-xl font-bold text-[#c5a880]">
                      {formatPKR(cartTotal)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      All taxes &amp; logistics included
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>100% Authentic Curated Luxury Guaranteed</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Doorstep parcel inspection available upon delivery</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>7-Day Return &amp; Exchange Protection</span>
                </div>
              </div>
            </div>
          </div>
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
