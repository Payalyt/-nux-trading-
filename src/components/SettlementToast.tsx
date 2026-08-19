import React from 'react';
import { Trade } from '../types/trading';
import { CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

interface SettlementToastProps {
  trade: Trade | null;
  onDismiss: () => void;
}

export const SettlementToast: React.FC<SettlementToastProps> = ({ trade, onDismiss }) => {
  if (!trade) return null;

  const isWin = trade.status === 'WON';

  return (
    <div 
      id="trade-settlement-toast"
      className="fixed bottom-32 sm:bottom-6 right-4 sm:right-84 z-[100] animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto"
    >
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-2xl flex items-center space-x-4 w-full sm:min-w-[320px] bg-[#0d121b]/95 ${
          isWin
            ? 'border-emerald-500/40 shadow-emerald-500/10'
            : 'border-rose-500/40 shadow-rose-500/10'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
            isWin ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
          }`}
        >
          {isWin ? <CheckCircle2 className="w-6 h-6 stroke-[2.5]" /> : <XCircle className="w-6 h-6 stroke-[2.5]" />}
        </div>

        <div className="flex-1 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white">{trade.assetSymbol}</span>
            <span
              className={`text-sm font-black font-mono-nums ${
                isWin ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isWin ? `+$${(trade.returnAmount || 0).toFixed(2)}` : `-$${trade.amount.toFixed(2)}`}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono-nums flex items-center justify-between">
            <span>{trade.type === 'CALL' ? '▲ Call Trade' : '▼ Put Trade'}</span>
            <span className="font-bold tracking-wider uppercase text-[10px]">
              {isWin ? 'TRADE WON' : 'TRADE CLOSED'}
            </span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
