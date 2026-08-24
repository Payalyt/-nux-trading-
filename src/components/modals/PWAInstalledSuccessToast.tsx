import React from 'react';
import { CheckCircle2, X, Sparkles, Smartphone } from 'lucide-react';
import { SiteLogo } from '../common/SiteLogo';

interface PWAInstalledSuccessToastProps {
  show: boolean;
  onDismiss: () => void;
}

export const PWAInstalledSuccessToast: React.FC<PWAInstalledSuccessToastProps> = ({
  show,
  onDismiss,
}) => {
  if (!show) return null;

  return (
    <div
      id="toast-pwa-install-done"
      className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] bg-[#0d1422]/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-4 shadow-2xl shadow-emerald-500/25 text-white animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5 relative">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-sm text-white flex items-center gap-1">
                <span>Installation Done!</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h4>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              <strong>NUX Trading</strong> has been successfully installed on your device. You can now launch it directly from your home screen or app drawer.
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Ready for Fast Native Trading</span>
        </div>
        <button
          onClick={onDismiss}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/40 active:scale-95 transition-all cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
