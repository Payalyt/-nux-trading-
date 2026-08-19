import React, { useState } from 'react';
import { X, ArrowDownToLine, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveBalance: number;
  onWithdrawSuccess: (amount: number) => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  liveBalance,
  onWithdrawSuccess,
}) => {
  const [method, setMethod] = useState<'crypto' | 'card'>('crypto');
  const [amount, setAmount] = useState<number>(Math.min(50, liveBalance));
  const [address, setAddress] = useState<string>('TNR7oB6Vw4gK43a2yC8F...');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleWithdraw = () => {
    if (amount > liveBalance) {
      setErrorMsg('Withdrawal amount exceeds available live balance.');
      return;
    }
    if (amount < 10) {
      setErrorMsg('Minimum withdrawal amount is $10.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onWithdrawSuccess(amount);
      soundManager.playWin();
      onClose();
    }, 1200);
  };

  return (
    <div 
      id="withdrawal-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="withdrawal-modal-dialog"
        className="bg-[#0d121b]/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Withdraw Funds</h2>
              <p className="text-[11px] text-slate-400">Available: ${liveBalance.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Method selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Payout Method
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setMethod('crypto')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'crypto'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">USDT TRC20 / Crypto</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">0% Payout Fee</div>
                </div>
                {method === 'crypto' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => setMethod('card')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'card'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">Credit / Debit Card</div>
                  <div className="text-[10px] text-slate-400">Instant</div>
                </div>
                {method === 'card' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-bold uppercase tracking-wider">Amount ($ USD)</span>
              <button
                onClick={() => setAmount(liveBalance)}
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold cursor-pointer"
              >
                Max (${liveBalance.toFixed(2)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono-nums font-bold">
                $
              </span>
              <input
                type="number"
                min={10}
                max={liveBalance}
                value={amount}
                onChange={(e) => {
                  setErrorMsg('');
                  setAmount(Number(e.target.value));
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono-nums text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Wallet Address / Card field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {method === 'crypto' ? 'USDT (TRC20) Wallet Address' : 'Card Number / IBAN'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Withdrawals are processed instantly 24/7 with zero platform fees.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={isProcessing || liveBalance < 10}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? 'Submitting Request...' : `Withdraw $${amount}`}
          </button>
        </div>
      </div>
    </div>
  );
};
