import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg bg-[#141b29]/95 text-white border border-[#c5a880]/30 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
        >
          {toast.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          {(toast.type === 'success' || !toast.type) && (
            <CheckCircle2 className="w-4 h-4 text-[#00f2d2] shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium leading-snug">{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
