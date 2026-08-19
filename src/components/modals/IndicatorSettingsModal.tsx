import React from 'react';
import { IndicatorConfig } from '../../types/trading';
import { X, Sliders, Check, Eye, EyeOff } from 'lucide-react';

interface IndicatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicators: IndicatorConfig;
  setIndicators: React.Dispatch<React.SetStateAction<IndicatorConfig>>;
}

export const IndicatorSettingsModal: React.FC<IndicatorSettingsModalProps> = ({
  isOpen,
  onClose,
  indicators,
  setIndicators,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="indicator-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="indicator-settings-modal-dialog"
        className="bg-[#0d121b]/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Technical Indicators</h2>
              <p className="text-[11px] text-slate-400">Overlays & Oscillators configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Indicator Items */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* 1. SMA */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: indicators.sma.color }} />
                <span className="text-sm font-bold text-white">Simple Moving Average (SMA)</span>
              </div>
              <button
                onClick={() =>
                  setIndicators((prev) => ({
                    ...prev,
                    sma: { ...prev.sma, enabled: !prev.sma.enabled },
                  }))
                }
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  indicators.sma.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {indicators.sma.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{indicators.sma.enabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>

            {indicators.sma.enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Period</label>
                  <input
                    type="number"
                    min={2}
                    max={200}
                    value={indicators.sma.period}
                    onChange={(e) =>
                      setIndicators((prev) => ({
                        ...prev,
                        sma: { ...prev.sma, period: Number(e.target.value) || 20 },
                      }))
                    }
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Color</label>
                  <input
                    type="color"
                    value={indicators.sma.color}
                    onChange={(e) =>
                      setIndicators((prev) => ({
                        ...prev,
                        sma: { ...prev.sma, color: e.target.value },
                      }))
                    }
                    className="w-full mt-1 h-8 bg-transparent cursor-pointer rounded-lg border border-white/10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. EMA */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: indicators.ema.color }} />
                <span className="text-sm font-bold text-white">Exponential Moving Average (EMA)</span>
              </div>
              <button
                onClick={() =>
                  setIndicators((prev) => ({
                    ...prev,
                    ema: { ...prev.ema, enabled: !prev.ema.enabled },
                  }))
                }
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  indicators.ema.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {indicators.ema.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{indicators.ema.enabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>

            {indicators.ema.enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Period</label>
                  <input
                    type="number"
                    min={2}
                    max={200}
                    value={indicators.ema.period}
                    onChange={(e) =>
                      setIndicators((prev) => ({
                        ...prev,
                        ema: { ...prev.ema, period: Number(e.target.value) || 12 },
                      }))
                    }
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Color</label>
                  <input
                    type="color"
                    value={indicators.ema.color}
                    onChange={(e) =>
                      setIndicators((prev) => ({
                        ...prev,
                        ema: { ...prev.ema, color: e.target.value },
                      }))
                    }
                    className="w-full mt-1 h-8 bg-transparent cursor-pointer rounded-lg border border-white/10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Bollinger Bands */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: indicators.bollinger.color }} />
                <span className="text-sm font-bold text-white">Bollinger Bands (BB)</span>
              </div>
              <button
                onClick={() =>
                  setIndicators((prev) => ({
                    ...prev,
                    bollinger: { ...prev.bollinger, enabled: !prev.bollinger.enabled },
                  }))
                }
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  indicators.bollinger.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {indicators.bollinger.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{indicators.bollinger.enabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>

            {indicators.bollinger.enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Period</label>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    value={indicators.bollinger.period}
                    onChange={(e) =>
                      setIndicators((prev) => ({
                        ...prev,
                        bollinger: { ...prev.bollinger, period: Number(e.target.value) || 20 },
                      }))
                    }
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Std Dev</label>
                  <input
                    type="number"
                    step="0.5"
                    min={1}
                    max={5}
                    value={indicators.bollinger.stdDev}
                    onChange={(e) =>
                      setIndicators((prev) => ({
                        ...prev,
                        bollinger: { ...prev.bollinger, stdDev: Number(e.target.value) || 2 },
                      }))
                    }
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. RSI */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: indicators.rsi.color }} />
                <span className="text-sm font-bold text-white">Relative Strength Index (RSI)</span>
              </div>
              <button
                onClick={() =>
                  setIndicators((prev) => ({
                    ...prev,
                    rsi: { ...prev.rsi, enabled: !prev.rsi.enabled },
                  }))
                }
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  indicators.rsi.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {indicators.rsi.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{indicators.rsi.enabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>

            {indicators.rsi.enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Period</label>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={indicators.rsi.period}
                    onChange={(e) =>
                      setIndicators((prev) => ({
                        ...prev,
                        rsi: { ...prev.rsi, period: Number(e.target.value) || 14 },
                      }))
                    }
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Color</label>
                  <input
                    type="color"
                    value={indicators.rsi.color}
                    onChange={(e) =>
                      setIndicators((prev) => ({
                        ...prev,
                        rsi: { ...prev.rsi, color: e.target.value },
                      }))
                    }
                    className="w-full mt-1 h-8 bg-transparent cursor-pointer rounded-lg border border-white/10"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
