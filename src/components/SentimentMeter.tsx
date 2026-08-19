import React from 'react';

interface SentimentMeterProps {
  bullishPercent: number; // e.g. 97
  bearishPercent: number; // e.g. 3
}

export const SentimentMeter: React.FC<SentimentMeterProps> = ({
  bullishPercent,
  bearishPercent,
}) => {
  return (
    <div 
      id="market-sentiment-meter"
      className="w-8 h-full bg-[#0d121b]/50 backdrop-blur-md border-r border-white/5 flex flex-col items-center justify-between py-5 select-none shrink-0"
      title={`Market Sentiment: ${bullishPercent}% Buyers / ${bearishPercent}% Sellers`}
    >
      {/* Top Bullish % */}
      <span className="text-[10px] font-mono-nums font-extrabold text-emerald-400">
        {bullishPercent}%
      </span>

      {/* Vertical Split Bar */}
      <div className="w-1.5 flex-1 my-3 bg-white/5 rounded-full overflow-hidden flex flex-col justify-between p-0.5 border border-white/5">
        <div
          className="w-full bg-emerald-500 rounded-t-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
          style={{ height: `${bullishPercent}%` }}
        />
        <div
          className="w-full bg-red-500 rounded-b-full transition-all duration-500 shadow-sm shadow-red-500/50"
          style={{ height: `${bearishPercent}%` }}
        />
      </div>

      {/* Bottom Bearish % */}
      <span className="text-[10px] font-mono-nums font-extrabold text-red-400">
        {bearishPercent}%
      </span>
    </div>
  );
};
