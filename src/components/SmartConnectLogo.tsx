import React, { useState } from 'react';

interface LogoProps {
  customLogoUrl?: string;
  storeName?: string;
  tagline?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const SmartConnectLogo: React.FC<LogoProps> = ({
  customLogoUrl,
  storeName = 'Smart Buy',
  tagline = 'Pakistan · Luxury Store',
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const iconSizes = {
    sm: { w: 26, h: 26 },
    md: { w: 34, h: 34 },
    lg: { w: 44, h: 44 },
    xl: { w: 56, h: 56 },
  }[size];

  const imgHeightClass = {
    sm: 'h-7 max-h-7 max-w-[55px]',
    md: 'h-8 sm:h-10 max-h-10 max-w-[65px] sm:max-w-[110px]',
    lg: 'h-11 sm:h-13 max-h-13 max-w-[100px] sm:max-w-[140px]',
    xl: 'h-14 max-h-14 max-w-[150px]',
  }[size];

  const fontSizes = {
    sm: { title: 'text-xs sm:text-sm tracking-wider', tag: 'text-[9px]' },
    md: { title: 'text-sm sm:text-base md:text-lg tracking-wider', tag: 'text-[10px]' },
    lg: { title: 'text-lg sm:text-xl md:text-2xl tracking-wider', tag: 'text-xs' },
    xl: { title: 'text-xl sm:text-2xl md:text-3xl tracking-wider', tag: 'text-xs' },
  }[size];

  // Gracefully clean and split store name into first word (white) and remaining words (gold accent)
  const cleanStoreName = (storeName || 'Smart Buy').trim().replace(/\s+/g, ' ');
  const words = cleanStoreName.split(' ');
  const firstWord = words[0] || 'Smart';
  const remainingWords = words.slice(1).join(' ');

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`}>
      {/* Brand Emblem / Custom Logo Image */}
      <div className="relative shrink-0 flex items-center justify-center">
        {customLogoUrl && !imgFailed ? (
          <img
            src={customLogoUrl}
            alt={cleanStoreName}
            referrerPolicy="no-referrer"
            className={`${imgHeightClass} w-auto object-contain rounded-lg shadow-sm border border-slate-700/50 bg-[#0f1622]/40 p-0.5 shrink-0`}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <svg
            width={iconSizes.w}
            height={iconSizes.h}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_2px_12px_rgba(197,168,128,0.35)] shrink-0"
          >
            <defs>
              <linearGradient id="scGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5e6cc" />
                <stop offset="50%" stopColor="#c5a880" />
                <stop offset="100%" stopColor="#8d6e40" />
              </linearGradient>
              <linearGradient id="scCyanGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00f2d2" />
                <stop offset="60%" stopColor="#00b4a4" />
                <stop offset="100%" stopColor="#056b66" />
              </linearGradient>
              <filter id="scGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Shield / Geometric Contour */}
            <rect
              x="6"
              y="6"
              width="88"
              height="88"
              rx="20"
              fill="#0f1622"
              stroke="url(#scGoldGrad)"
              strokeWidth="2.5"
              strokeOpacity="0.8"
            />

            {/* Interlocking 'S' & 'B'/'C' Dynamic Loop */}
            <path
              d="M 68 32 C 68 24 58 20 48 20 C 34 20 28 30 28 38 C 28 50 44 50 54 55 C 66 61 68 67 68 74 C 68 84 56 86 46 86 C 32 86 26 76 26 72"
              stroke="url(#scGoldGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 74 38 C 74 38 66 52 50 52 C 38 52 38 40 48 34"
              stroke="url(#scCyanGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Connected Neural Node Points */}
            <circle cx="48" cy="20" r="4.5" fill="#f5e6cc" filter="url(#scGlow)" />
            <circle cx="54" cy="55" r="4.5" fill="#00f2d2" filter="url(#scGlow)" />
            <circle cx="26" cy="72" r="4.5" fill="#c5a880" />
          </svg>
        )}
      </div>

      {/* Typography Wordmark: Website Name Always Displayed With Logo */}
      <div className="flex flex-col text-left shrink-0">
        <span
          className={`font-serif-luxury font-bold text-white uppercase ${fontSizes.title} leading-none whitespace-nowrap`}
        >
          {firstWord}{' '}
          {remainingWords && (
            <span className="text-[#c5a880]">{remainingWords}</span>
          )}
        </span>
        {showTagline && tagline && (
          <span
            className={`hidden sm:block font-sans tracking-[0.22em] text-[#94a3b8] uppercase font-medium mt-1 ${fontSizes.tag} leading-none whitespace-nowrap`}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};
