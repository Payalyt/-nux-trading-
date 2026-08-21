import React, { useState } from 'react';
import { CandlestickChart } from 'lucide-react';

interface SiteLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  hideTextOnMobile?: boolean;
  showTagline?: boolean;
  textClassName?: string;
  className?: string;
}

export const SiteLogo: React.FC<SiteLogoProps> = ({
  size = 'md',
  showText = true,
  hideTextOnMobile = false,
  showTagline = false,
  textClassName = '',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { img: 'w-6 h-6 sm:w-7 sm:h-7', text: 'text-xs sm:text-sm', badge: 'text-[8px] px-1 py-0.2' },
    md: { img: 'w-7 h-7 sm:w-9 sm:h-9', text: 'text-sm sm:text-base', badge: 'text-[9px] px-1.5 py-0.5' },
    lg: { img: 'w-9 h-9 sm:w-11 sm:h-11', text: 'text-base sm:text-lg', badge: 'text-[10px] px-2 py-0.5' },
    xl: { img: 'w-12 h-12 sm:w-14 sm:h-14', text: 'text-xl sm:text-2xl', badge: 'text-xs px-2.5 py-1' },
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2 select-none shrink-0 ${className}`}>
      <div className={`relative ${selectedSize.img} rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 bg-[#0d121b]`}>
        {!imgError ? (
          <img
            src="/main-logo.png"
            alt="NUX Trading Logo"
            className="w-full h-full object-cover rounded-xl"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-black font-black">
            <CandlestickChart className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
        )}
      </div>

      {showText && (
        <div className={`flex-col ${hideTextOnMobile ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-white uppercase ${selectedSize.text} ${textClassName}`}>
              NUX
            </span>
            <span className={`font-black uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ${selectedSize.badge}`}>
              TRADING
            </span>
          </div>
          {showTagline && (
            <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-400 uppercase -mt-0.5">
              Financial Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
};
