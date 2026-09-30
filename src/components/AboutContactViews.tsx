import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import {
  Building2,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Shield,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const { settings, navigateTo } = useStore();

  const about = settings?.about || {
    title: 'Redefining E-Commerce Luxury in Pakistan',
    description:
      'Smart Connect was founded to bridge the gap between discerning Pakistani consumers and world-class craftsmanship.',
    story:
      'From precision Swiss-grade timepieces to pure oriental extrait fragrances and artisanal full-grain leather, Smart Connect curates only products that embody longevity, timeless aesthetics, and uncompromising utility.',
  };

  return (
    <div className="py-16 bg-[#0b0f17] min-h-screen text-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#c5a880]">
            Our Heritage
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
            {about.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {about.description}
          </p>
        </div>

        {/* Narrative Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#121824] border border-slate-800 space-y-6 text-left shadow-2xl">
          <h2 className="font-serif-luxury text-xl font-bold text-white">The Smart Connect Promise</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{about.story}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#c5a880]">Authentic Inspection</span>
              <p className="text-xs text-slate-400">
                Each product is physically unpacked and verified for build quality before sending out with couriers.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#00f2d2]">Nationwide Logistics</span>
              <p className="text-xs text-slate-400">
                Doorstep dispatch to Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, and all regional districts.
              </p>
            </div>
          </div>
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => navigateTo('shop')}
              className="btn-luxury px-8 py-3 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs"
            >
              Explore Our Catalog
            </button>
          </div>
        </div>

        {/* Store Policies & Guarantees */}
        {settings?.policies && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-[#c5a880] uppercase tracking-wider block">
                Shipping &amp; Delivery
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {settings.policies.shippingPolicy || 'Express courier delivery across all Pakistani cities. Standard transit is 2-4 business days.'}
              </p>
              {settings.shipping?.courierPartners && (
                <span className="text-[11px] text-slate-500 block pt-1">
                  Couriers: {settings.shipping.courierPartners}
                </span>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-[#00f2d2] uppercase tracking-wider block">
                Return &amp; Replacement
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {settings.policies.returnPolicy || '7-day hassle-free replacement policy on verified defective or mismatched parcels.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-[#c5a880] uppercase tracking-wider block">
                Doorstep COD
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {settings.policies.codTerms || 'Zero upfront payments. Pay cash to the courier representative at your doorstep.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const { settings, showToast } = useStore();

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const contact = settings?.contact || {
    phone: '+92 300 0762781',
    whatsApp: '+923000762781',
    email: 'concierge@smartconnect.pk',
    address: 'Smart Connect Tower, MM Alam Road, Gulberg III, Lahore, Pakistan',
  };

  const cleanPhone = contact.whatsApp.replace(/\D/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=Hello%20Smart%20Connect`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSenderName('');
      setSenderPhone('');
      setSenderMessage('');
      showToast('Inquiry submitted! Our concierge team will reach out via WhatsApp/Phone.', 'success');
    }, 800);
  };

  return (
    <div className="py-16 bg-[#0b0f17] min-h-screen text-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#c5a880]">
            Concierge Desk
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-2">
            Get In Touch
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Our customer relations team in Pakistan is available 7 days a week.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card (lg:col-span-5) */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-[#121824] border border-slate-800 space-y-6 text-left">
            <h2 className="font-serif-luxury text-lg font-bold text-white">Direct Channels</h2>

            <div className="space-y-4 text-xs">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#00f2d2]/10 border border-[#00f2d2]/30 text-white hover:bg-[#00f2d2]/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-[#00f2d2] shrink-0" />
                <div>
                  <span className="font-bold block text-sm">WhatsApp Concierge</span>
                  <span className="text-slate-300">{contact.whatsApp}</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0b0f17] border border-slate-800">
                <Phone className="w-5 h-5 text-[#c5a880] shrink-0" />
                <div>
                  <span className="font-bold block text-white">Direct Phone Call</span>
                  <span className="text-slate-400">{contact.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0b0f17] border border-slate-800">
                <Mail className="w-5 h-5 text-[#c5a880] shrink-0" />
                <div>
                  <span className="font-bold block text-white">Official Email</span>
                  <span className="text-slate-400">{contact.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0b0f17] border border-slate-800">
                <MapPin className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-white">Headquarters</span>
                  <span className="text-slate-400 leading-relaxed">{contact.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form (lg:col-span-7) */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-[#121824] border border-slate-800 text-left">
            <h2 className="font-serif-luxury text-lg font-bold text-white mb-4">
              Send Concierge Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Asim Raza"
                    className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Message / Product Inquiry *
                </label>
                <textarea
                  rows={4}
                  required
                  value={senderMessage}
                  onChange={(e) => setSenderMessage(e.target.value)}
                  placeholder="How can we assist you with our luxury collection?"
                  className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="btn-luxury px-6 py-3 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs hover:bg-[#d6bc98] transition-colors disabled:opacity-50"
              >
                {isSending ? 'Sending Message...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
