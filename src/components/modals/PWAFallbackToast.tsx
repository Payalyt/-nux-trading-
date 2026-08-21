import React from 'react';
import { Download, ExternalLink, X, Smartphone, Globe, Info, Compass, MoreVertical } from 'lucide-react';
import { FallbackInfo } from '../../hooks/usePWA';

interface PWAFallbackToastProps {
  fallbackInfo: FallbackInfo;
  onDismiss: () => void;
  onOpenDefaultBrowser: () => void;
}

export const PWAFallbackToast: React.FC<PWAFallbackToastProps> = ({
  fallbackInfo,
  onDismiss,
  onOpenDefaultBrowser,
}) => {
  if (!fallbackInfo.show) return null;

  const isInApp = fallbackInfo.reason === 'inapp_android' || fallbackInfo.reason === 'inapp_ios';

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#101726]/95 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl shadow-black/90 backdrop-blur-xl text-white">
        {/* In-app guide visual tip */}
        {isInApp && (
          <div className="mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <MoreVertical className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>
              Tip: Tap <strong>⋯</strong> (top-right of {fallbackInfo.appName || 'screen'}) & select <strong>Open in Chrome / Browser</strong>
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
              {isInApp ? (
                <Compass className="w-5 h-5 text-emerald-400" />
              ) : fallbackInfo.reason === 'iframe' ? (
                <Globe className="w-5 h-5" />
              ) : fallbackInfo.reason === 'ios_safari' ? (
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
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
          {fallbackInfo.actionText && (
            <button
              onClick={() => {
                onOpenDefaultBrowser();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{fallbackInfo.actionText}</span>
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
