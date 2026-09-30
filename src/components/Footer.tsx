import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { SmartConnectLogo } from './SmartConnectLogo.tsx';
import { MessageCircle, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, navigateTo, categories, setSelectedCategory } = useStore();

  const storeName = settings?.storeName || 'Smart Connect';
  const footerText =
    settings?.footerText ||
    'Smart Connect Pakistan. Registered commercial entity in Pakistan. All prices listed in Pakistani Rupees (Rs.).';
  const whatsAppNumber = settings?.contact?.whatsApp || '+923000762781';
  const cleanPhone = whatsAppNumber.replace(/\D/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=Hi%20Smart%20Connect`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080c13] border-t border-[#1a2333] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Column (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <SmartConnectLogo
              customLogoUrl={settings?.logoUrl}
              storeName={settings?.storeName}
              tagline={settings?.tagline}
              size="md"
              showTagline={true}
            />
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm pt-2">
              Pakistan's premier destination for curated horology, acoustic masterpieces, royal
              fragrances, and luxury essentials with nationwide Cash on Delivery.
            </p>
            <div className="pt-2 flex flex-col gap-3">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#00f2d2]/10 border border-[#00f2d2]/30 text-white hover:bg-[#00f2d2]/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#00f2d2]" />
                <span className="font-semibold text-xs">Chat on WhatsApp: {whatsAppNumber}</span>
              </a>

              {/* Social Media Links */}
              {settings?.socials && (
                <div className="flex items-center gap-2.5 pt-1">
                  {settings.socials.instagram && (
                    <a
                      href={settings.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 hover:text-[#c5a880] border border-slate-800 hover:border-[#c5a880]/40 text-[11px] font-medium transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                  {settings.socials.facebook && (
                    <a
                      href={settings.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 hover:text-[#c5a880] border border-slate-800 hover:border-[#c5a880]/40 text-[11px] font-medium transition-colors"
                    >
                      Facebook
                    </a>
                  )}
                  {settings.socials.tiktok && (
                    <a
                      href={settings.socials.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 hover:text-[#c5a880] border border-slate-800 hover:border-[#c5a880]/40 text-[11px] font-medium transition-colors"
                    >
                      TikTok
                    </a>
                  )}
                  {settings.socials.youtube && (
                    <a
                      href={settings.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 hover:text-[#c5a880] border border-slate-800 hover:border-[#c5a880]/40 text-[11px] font-medium transition-colors"
                    >
                      YouTube
                    </a>
                  )}
                  {settings.socials.twitter && (
                    <a
                      href={settings.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 hover:text-[#c5a880] border border-slate-800 hover:border-[#c5a880]/40 text-[11px] font-medium transition-colors"
                    >
                      X
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Departments (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider">
              Departments
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      navigateTo('shop');
                    }}
                    className="hover:text-[#c5a880] transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigateTo('categories')}
                  className="text-[#c5a880] hover:underline flex items-center gap-1"
                >
                  <span>Browse All Categories →</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    navigateTo('shop');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  View Full Product Catalog →
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider">
              Client Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('account')}
                  className="hover:text-white transition-colors"
                >
                  My Account &amp; Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-white transition-colors"
                >
                  About Smart Connect
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact Concierge
                </button>
              </li>
              <li>
                <span className="text-slate-400">Cash on Delivery (COD)</span>
              </li>
              <li>
                <span className="text-slate-400">Doorstep Verification</span>
              </li>
            </ul>
          </div>

          {/* Contact Details (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider">
              Pakistan Concierge
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                <span>{settings?.contact.phone || '+92 300 0762781'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                <span>{settings?.contact.email || 'concierge@smartconnect.pk'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c5a880] shrink-0 mt-0.5" />
                <span className="leading-tight">
                  {settings?.contact.address ||
                    'Smart Connect Tower, MM Alam Road, Gulberg III, Lahore, Pakistan'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="text-center sm:text-left">{footerText}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('admin')}
              className="text-slate-400 hover:text-[#c5a880] transition-colors"
            >
              Admin Portal
            </button>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
