import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const { settings } = useStore();
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsAppNumber = settings?.contact?.whatsApp || '+923000762781';
  const storeName = settings?.storeName || 'Smart Buy';
  let cleanPhone = whatsAppNumber.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '92' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) {
    cleanPhone = '92' + cleanPhone;
  }
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${storeName}! I have an inquiry regarding products and orders.`
  )}`;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
      {/* Tooltip speech bubble */}
      <div
        className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121824]/95 border border-[#25D366]/40 text-white shadow-2xl backdrop-blur-md transition-all duration-300 ${
          showTooltip ? 'opacity-100 translate-x-0' : 'opacity-90'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
        <div className="text-left">
          <span className="text-[11px] font-bold block text-white leading-tight">
            Need Help? Chat with Us
          </span>
          <span className="text-[10px] text-slate-300 leading-none">
            WhatsApp Concierge Active
          </span>
        </div>
      </div>

      {/* Floating Button with ripple effect */}
      <a
        href={whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_35px_rgba(37,211,102,0.6)] transform hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Chat on WhatsApp"
        title="Chat with Smart Connect Concierge on WhatsApp"
      >
        {/* Radar Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping [animation-duration:2.5s]" />

        {/* WhatsApp Icon */}
        <svg
          className="w-7 h-7 relative z-10 fill-current drop-shadow"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.395-10.416c-5.437 0-9.845 4.409-9.845 9.845 0 1.956.574 3.78 1.564 5.312l-1.747 6.387 6.551-1.718c1.475.879 3.203 1.385 5.045 1.385 5.437 0 9.845-4.408 9.845-9.845 0-5.436-4.408-9.866-9.863-9.866z" />
        </svg>
      </a>
    </div>
  );
};
