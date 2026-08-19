import React, { useState, useEffect } from 'react';
import { X, ArrowDownToLine, Check, ShieldCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { apiClient, formatErrorMessage } from '../../utils/apiClient';

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
  const [gateways, setGateways] = useState<any[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<any | null>(null);
  const [amount, setAmount] = useState<number>(Math.min(50, Math.max(10, liveBalance)));
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successTx, setSuccessTx] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessTx(null);
      apiClient.get('/api/public/settings').then((res) => {
        if (res.ok && res.data?.paymentGateways) {
          const activeGws = res.data.paymentGateways;
          setGateways(activeGws);
          if (activeGws.length > 0 && !selectedGateway) {
            setSelectedGateway(activeGws[0]);
          }
        }
      }).catch((err) => {
        console.error('Error fetching withdrawal gateways:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minWithdraw = selectedGateway?.minWithdraw || 10;
  const maxWithdraw = selectedGateway?.maxWithdraw || Math.max(10000, liveBalance);
  const conversionRate = selectedGateway?.conversionRate || 125;
  const payoutInLocal = Math.round(amount * conversionRate);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amount > liveBalance) {
      setErrorMsg(`Withdrawal amount (${amount}) exceeds available live balance (${liveBalance.toFixed(2)}).`);
      return;
    }
    if (amount < minWithdraw) {
      setErrorMsg(`Minimum withdrawal amount for ${selectedGateway?.name || 'this method'} is ${minWithdraw}.`);
      return;
    }
    if (amount > maxWithdraw) {
      setErrorMsg(`Maximum withdrawal amount per request is ${maxWithdraw}.`);
      return;
    }
    if (!accountNumber.trim()) {
      setErrorMsg('Please enter your recipient account/wallet number.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await apiClient.post('/api/user/withdrawal', {
        amount,
        gateway: selectedGateway?.name || 'Selected Gateway',
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim() || undefined,
        userNote: `Withdrawal to ${selectedGateway?.name} (${accountNumber.trim()})`
      });

      if (!res.ok) {
        throw new Error(formatErrorMessage(res.error || res.data?.error, 'Failed to submit withdrawal'));
      }

      setIsProcessing(false);
      setSuccessTx(res.data?.transaction);
      onWithdrawSuccess(amount);
      soundManager.playWin();

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(formatErrorMessage(err));
    }
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
              <p className="text-[11px] text-slate-400">Available: <span className="font-mono text-emerald-400 font-bold">${liveBalance.toFixed(2)}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successTx ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Withdrawal Request Submitted!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Your request of <span className="text-emerald-400 font-bold font-mono">${amount}</span> via {selectedGateway?.name} has been queued for processing.
              </p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Transaction ID:</span>
                <span className="text-white font-bold">{successTx.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-amber-400 font-bold uppercase flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Pending Admin Review</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Gateway Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Payout Gateway
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {(gateways.length > 0 ? gateways : [
                  { id: 'bkash', name: 'bKash (BD)', icon: '📱', conversionRate: 125 },
                  { id: 'nagad', name: 'Nagad (BD)', icon: '📱', conversionRate: 125 },
                  { id: 'usdt-trc20', name: 'USDT (TRC-20)', icon: '₮', conversionRate: 1 }
                ]).map((gw) => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedGateway(gw);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      selectedGateway?.id === gw.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-base shrink-0">
                      {gw.icon?.startsWith('http') ? (
                        <img src={gw.icon} alt={gw.name} className="w-5 h-5 object-contain rounded" />
                      ) : (
                        gw.icon || '💳'
                      )}
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{gw.name}</div>
                      <div className="text-[9px] text-emerald-400 font-mono">1$ = {gw.conversionRate || 125} BDT</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-bold uppercase tracking-wider">Amount ($ USD)</span>
                <button
                  type="button"
                  onClick={() => setAmount(Number(liveBalance.toFixed(2)))}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold cursor-pointer"
                >
                  Max (${liveBalance.toFixed(2)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                  $
                </span>
                <input
                  type="number"
                  min={minWithdraw}
                  max={Math.max(minWithdraw, liveBalance)}
                  value={amount}
                  onChange={(e) => {
                    setErrorMsg('');
                    setAmount(Number(e.target.value));
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              {selectedGateway?.conversionRate && selectedGateway.conversionRate > 1 && (
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>You will receive approx:</span>
                  <span className="font-mono font-bold text-white">৳ {payoutInLocal.toLocaleString()} BDT</span>
                </div>
              )}
            </div>

            {/* Recipient Account / Wallet Address field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {selectedGateway?.category === 'crypto' 
                  ? `${selectedGateway?.cryptoDetails?.network || 'Crypto'} Wallet Address` 
                  : selectedGateway?.category === 'bank'
                  ? 'Bank Account Number & Bank Name'
                  : `${selectedGateway?.name || 'Account'} Personal Number`}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={selectedGateway?.category === 'crypto' ? 'e.g. TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX' : 'e.g. 01712345678'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Account Holder Name (optional) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">
                Account Holder Name / Note (Optional)
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="e.g. Personal Account"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fast 24/7 automated payouts with 0% gateway fee deduction.</span>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/10 flex justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || liveBalance < minWithdraw}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Processing...' : `Submit Withdrawal (${amount})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
