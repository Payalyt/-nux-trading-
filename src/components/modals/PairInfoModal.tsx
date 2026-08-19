import React from 'react';
import { Asset } from '../../types/trading';
import { X, Info, TrendingUp, TrendingDown, Clock, ShieldCheck, Activity, BarChart2 } from 'lucide-react';

interface PairInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export const PairInfoModal: React.FC<PairInfoModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="pair-info-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="pair-info-modal-dialog"
        className="bg-[#0d121b]/95 backdrop-blur-2xl border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{asset.flag}</span>
            <div>
              <h2 className="text-base font-bold text-white">{asset.symbol}</h2>
              <p className="text-[11px] text-slate-400">{asset.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Specs */}
        <div className="p-5 space-y-4 text-xs">
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Standard Payout</div>
              <div className="text-lg font-black font-mono-nums text-emerald-400 mt-0.5">
                {asset.payout}%
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">24h Volatility</div>
              <div className="text-lg font-black font-mono-nums text-emerald-400 mt-0.5">
                {(asset.volatility * 100).toFixed(2)}%
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">24h High</div>
              <div className="text-sm font-bold font-mono-nums text-white mt-0.5">
                {asset.high24h.toFixed(asset.decimals)}
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">24h Low</div>
              <div className="text-sm font-bold font-mono-nums text-white mt-0.5">
                {asset.low24h.toFixed(asset.decimals)}
              </div>
            </div>
          </div>

          {/* Schedule & Payout Schedule */}
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-white text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trading Hours & Availability</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Open 24 hours / 7 days a week with OTC liquidity streaming. Quotes synchronized with high-frequency feeds.
            </div>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-white text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contract Specifications</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px] pt-1">
              <span>Minimum Trade:</span>
              <span className="text-white font-mono-nums font-bold">$1.00</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Maximum Trade:</span>
              <span className="text-white font-mono-nums font-bold">$10,000.00</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Execution Speed:</span>
              <span className="text-emerald-400 font-mono-nums font-bold">&lt; 15 ms</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
