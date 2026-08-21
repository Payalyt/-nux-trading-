import React from 'react';
import { Download, ExternalLink, X, Smartphone, Globe, Info } from 'lucide-react';
import { FallbackInfo } from '../../hooks/usePWA';

interface PWAFallbackToastProps {
  fallbackInfo: FallbackInfo;
  onDismiss: () => void;
  onOpenNewTab: () => void;
}

export const PWAFallbackToast: React.FC<PWAFallbackToastProps> = ({
  fallbackInfo,
  onDismiss,
  onOpenNewTab,
}) => {
  if (!fallbackInfo.show) return null;

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#121826] border border-emerald-500/40 rounded-2xl p-4 shadow-2xl shadow-black/80 backdrop-blur-xl text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              {fallbackInfo.reason === 'iframe' ? (
                <Globe className="w-5 h-5" />
              ) : fallbackInfo.reason === 'ios' ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                {fallbackInfo.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {fallbackInfo.message}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
          {fallbackInfo.canOpenNewTab && (
            <button
              onClick={onOpenNewTab}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </button>
          )}
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
