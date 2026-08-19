import React, { useState } from 'react';
import { TradingSignal, Asset } from '../../types/trading';
import { X, Sparkles, TrendingUp, TrendingDown, Clock, Zap, ArrowRight } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface SignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onApplySignal: (asset: Asset, direction: 'CALL' | 'PUT', durationSeconds: number) => void;
}

export const SignalsModal: React.FC<SignalsModalProps> = ({
  isOpen,
  onClose,
  assets,
  onApplySignal,
}) => {
  const [signals] = useState<TradingSignal[]>([
    {
      id: 'sig-1',
      assetId: 'usdjpy',
      assetSymbol: 'USD/JPY',
      direction: 'CALL',
      accuracy: 89,
      timeframe: '1m',
      generatedAt: Date.now() - 25000,
      expiresInSeconds: 35,
      strength: 'Strong',
    },
    {
      id: 'sig-2',
      assetId: 'btcusd',
      assetSymbol: 'BTC/USD',
      direction: 'CALL',
      accuracy: 94,
      timeframe: '1m',
      generatedAt: Date.now() - 10000,
      expiresInSeconds: 50,
      strength: 'Strong',
    },
    {
      id: 'sig-3',
      assetId: 'eurusd',
      assetSymbol: 'EUR/USD',
      direction: 'PUT',
      accuracy: 84,
      timeframe: '2m',
      generatedAt: Date.now() - 40000,
      expiresInSeconds: 80,
      strength: 'High',
    },
    {
      id: 'sig-4',
      assetId: 'aapl_otc',
      assetSymbol: 'APPLE (OTC)',
      direction: 'CALL',
      accuracy: 91,
      timeframe: '1m',
      generatedAt: Date.now() - 15000,
      expiresInSeconds: 45,
      strength: 'Strong',
    },
  ]);

  if (!isOpen) return null;

  const handleUseSignal = (sig: TradingSignal) => {
    const targetAsset = assets.find((a) => a.id === sig.assetId) || assets[0];
    soundManager.playClick();
    const duration = sig.timeframe === '2m' ? 120 : 60;
    onApplySignal(targetAsset, sig.direction, duration);
    onClose();
  };

  return (
    <div 
      id="signals-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="signals-modal-dialog"
        className="bg-[#0d121b]/95 backdrop-blur-2xl border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Live AI Trading Signals</h2>
              <p className="text-[11px] text-slate-400">Algorithmic trend momentum indicators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Signals list */}
        <div className="p-5 overflow-y-auto space-y-3">
          {signals.map((sig) => (
            <div
              key={sig.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-white">{sig.assetSymbol}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      sig.direction === 'CALL'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {sig.direction === 'CALL' ? '▲ BUY (CALL)' : '▼ SELL (PUT)'}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span>
                    Confidence: <strong className="text-emerald-400">{sig.accuracy}%</strong>
                  </span>
                  <span>•</span>
                  <span>Timeframe: <strong className="text-slate-200">{sig.timeframe}</strong></span>
                </div>
              </div>

              <button
                onClick={() => handleUseSignal(sig)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Trade</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
