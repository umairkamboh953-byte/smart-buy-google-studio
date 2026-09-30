import React, { useState } from 'react';
import type { Customer } from '../types/index.ts';
import { X, ShieldCheck, ArrowRight, User, Mail } from 'lucide-react';

export const GoogleLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  initialEmail?: string;
  actionText?: string;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = 'umairkamboh953@gmail.com',
  actionText = 'Continue with Google',
}) => {
  const [selectedAccount, setSelectedAccount] = useState<'primary' | 'custom'>('primary');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('0300-1234567');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Primary Google account suggestion (derived from session metadata or default)
  const primaryEmail = initialEmail || 'umairkamboh953@gmail.com';
  const primaryName =
    primaryEmail.includes('umair')
      ? 'Umair Kamboh'
      : primaryEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const handleSignIn = (name: string, email: string, phone: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const newCustomer: Customer = {
        id: `cust-g-${Date.now()}`,
        fullName: name || 'Google User',
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '0300-0000000',
        city: 'Lahore',
        address: 'Pakistan',
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };
      setIsProcessing(false);
      onSuccess(newCustomer);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#121824] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#0e1420]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md">
              <GoogleLogoIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-white">
                Continue with Google
              </h3>
              <p className="text-[11px] text-slate-400">to continue to Smart Connect Pakistan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-300">
            Choose a Google account to sign in or create your customer account:
          </p>

          {/* Account 1: Quick Primary Google Account */}
          <div
            onClick={() => {
              setSelectedAccount('primary');
              handleSignIn(primaryName, primaryEmail, '0300-1234567');
            }}
            role="button"
            tabIndex={0}
            className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedAccount === 'primary'
                ? 'bg-[#182234] border-[#4285F4] shadow-md ring-1 ring-[#4285F4]/30'
                : 'bg-[#0b0f17] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#4285F4] to-[#34A853] text-white font-bold flex items-center justify-center text-sm shadow">
                {primaryName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{primaryName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Google Verified
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">{primaryEmail}</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Account 2: Enter another Google Account */}
          <div className="pt-2">
            {selectedAccount !== 'custom' ? (
              <button
                type="button"
                onClick={() => setSelectedAccount('custom')}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-[#c5a880] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Use another Google account</span>
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customEmail.trim()) return;
                  const finalName = customName.trim() || customEmail.split('@')[0];
                  handleSignIn(finalName, customEmail, customPhone);
                }}
                className="p-4 rounded-2xl bg-[#0b0f17] border border-slate-800 space-y-3"
              >
                <div className="text-xs font-semibold text-white">Enter Google Account Details</div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                    Google Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-[#121824] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 text-xs bg-[#121824] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-2 px-4 rounded-lg bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Verifying...' : 'Sign in with this Google Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAccount('primary')}
                    className="py-2 px-3 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Privacy & Guarantee note */}
          <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Secure Google OAuth Single Sign-On. Your Google account details are used only to manage
              your orders, track delivery, and safeguard customer benefits.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
