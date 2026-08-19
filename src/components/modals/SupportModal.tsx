import React from 'react';
import { X, MessageSquare, ExternalLink, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const whatsappNumber = '+8801700000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=Hello%20Quotex%20Support%2C%20I%20need%20help%20with%20my%20account.`;

  return (
    <div 
      id="support-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="support-modal-dialog"
        className="bg-[#0e131d] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">WhatsApp Support</h2>
              <p className="text-[11px] text-slate-400">Official 24/7 Client Assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* WhatsApp Dedicated Support Content */}
        <div className="p-6 space-y-6 text-center">
          {/* WhatsApp Logo & Online Status */}
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center mx-auto shadow-lg shadow-[#25D366]/10 text-3xl">
              💬
            </div>
            <h3 className="text-lg font-bold text-white">Direct WhatsApp Assistance</h3>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Agents Online • Replies in &lt;1 min</span>
            </div>
          </div>

          {/* Quick Details Card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-left text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Channel:</span>
              <strong className="text-white">Official Verified Business</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Languages:</span>
              <strong className="text-white">Bangla, English, Hindi</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Support Topics:</span>
              <strong className="text-emerald-400">Deposit, Withdrawal, Verification</strong>
            </div>
          </div>

          {/* Direct WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#25D366]/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 stroke-[2.5]" />
            <span>Chat on WhatsApp Now</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>

          <p className="text-[11px] text-slate-500">
            Clicking above will open WhatsApp on your phone or WhatsApp Web in a new tab.
          </p>
        </div>
      </div>
    </div>
  );
};
