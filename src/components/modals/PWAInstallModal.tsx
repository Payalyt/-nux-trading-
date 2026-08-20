import React from 'react';
import { Share, PlusSquare, X, MoreVertical } from 'lucide-react';
import { DeviceType } from '../../hooks/usePWA';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceType?: DeviceType;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose, deviceType = 'desktop' }) => {
  if (!isOpen) return null;

  const isIOS = deviceType === 'ios';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-[#0f1522] border border-blue-500/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200"
      >
        <div className="absolute top-3 right-3">
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 mx-auto flex items-center justify-center mb-4">
            <PlusSquare className="w-8 h-8 text-blue-400" />
          </div>
          
          <h2 className="text-xl font-black text-white mb-2 tracking-tight">Install NUX Trading</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Install our application on your home screen for quick and easy access when you're on the go.
          </p>

          <div className="bg-black/30 rounded-xl p-4 text-left border border-white/5 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 pt-0.5">
                {isIOS ? <Share className="w-5 h-5 text-blue-400" /> : <MoreVertical className="w-5 h-5 text-blue-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white mb-0.5">
                  1. Tap the {isIOS ? 'Share' : 'Browser Menu (3 dots)'} button
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Locate the {isIOS ? 'share icon' : 'menu icon'} in your browser menu.
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="shrink-0 pt-0.5">
                <PlusSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white mb-0.5">
                  2. Tap {isIOS ? "'Add to Home Screen'" : "'Install app'"}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Scroll down the menu and select "{isIOS ? 'Add to Home Screen' : 'Install app'}".
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

