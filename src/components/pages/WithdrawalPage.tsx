import React, { useState, useEffect } from 'react';
import { 
  ArrowDownToLine, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Clock, 
  CreditCard, 
  DollarSign, 
  ExternalLink,
  History
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { apiClient, formatErrorMessage } from '../../utils/apiClient';
import { FirebaseService } from '../../utils/firebaseSync';

interface WithdrawalPageProps {
  liveBalance: number;
  onOpenDeposit: () => void;
  onWithdrawSuccess: (amount: number) => void;
  onBackToTrade: () => void;
  userEmail?: string;
  balanceLocked?: boolean;
}

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({
  liveBalance,
  onOpenDeposit,
  onWithdrawSuccess,
  onBackToTrade,
  userEmail,
  balanceLocked,
}) => {
  const [amount, setAmount] = useState<number>(Math.min(50, liveBalance > 0 ? liveBalance : 50));
  const [method, setMethod] = useState<string>('bkash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [withdrawalGateways, setWithdrawalGateways] = useState<any[]>([]);

  const defaultGateways = [
    { id: 'bkash', name: 'bKash', icon: 'https://i.postimg.cc/MZNd4Pjq/55.png', minWithdrawal: 10, maxWithdrawal: 1000 },
    { id: 'nagad', name: 'Nagad', icon: 'https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png', minWithdrawal: 10, maxWithdrawal: 1000 },
    { id: 'rocket', name: 'Rocket', icon: 'https://i.postimg.cc/ryRwMszC/unnamed.png', minWithdrawal: 10, maxWithdrawal: 1000 },
    { id: 'upay', name: 'Upay', icon: 'https://i.postimg.cc/pT3Y3yYr/upay.png', minWithdrawal: 10, maxWithdrawal: 1000 },
    { id: 'binance', name: 'Binance Pay', icon: '🟡', minWithdrawal: 20, maxWithdrawal: 5000 },
    { id: 'usdt', name: 'USDT (TRC20)', icon: '₮', minWithdrawal: 20, maxWithdrawal: 10000 },
  ];

  const fetchTransactionsAndGateways = async () => {
    if (userEmail) {
      try {
        const txs = await FirebaseService.fetchUserTransactions(userEmail);
        setUserTransactions(txs);
      } catch (err) {
        console.error('Error fetching transaction history:', err);
      }
    }

    try {
      const gws = await FirebaseService.fetchGateways();
      if (gws && gws.length > 0) {
        const validWithdrawalGws = gws.filter((g: any) => g.active !== false && (g.type === 'withdrawal' || g.type === 'both' || !g.type));
        if (validWithdrawalGws.length > 0) {
          setWithdrawalGateways(validWithdrawalGws);
          setMethod(validWithdrawalGws[0].id || validWithdrawalGws[0].name.toLowerCase());
          return;
        }
      }
      setWithdrawalGateways(defaultGateways);
    } catch (err) {
      console.error('Error loading gateways:', err);
      setWithdrawalGateways(defaultGateways);
    }
  };

  useEffect(() => {
    fetchTransactionsAndGateways();
  }, []);

  const activeGw = withdrawalGateways.find((g) => g.id === method || g.name?.toLowerCase() === method) || withdrawalGateways[0] || defaultGateways[0];
  const minLimit = activeGw?.minWithdrawal || activeGw?.minDeposit || 10;
  const maxLimit = activeGw?.maxWithdrawal || activeGw?.maxDeposit || 5000;

  const faqs = [
    {
      q: 'How to withdraw money from the account?',
      a: 'The procedure for withdrawing capital is extremely simple and is carried out through your individual account. The method you have chosen to deposit the account is also a method of withdrawing funds.'
    },
    {
      q: 'How long does it take to withdraw funds?',
      a: 'On average, the withdrawal procedure takes from 15 minutes to 3 hours during active business hours. The company always processes payments promptly.'
    },
    {
      q: 'What is the minimum withdrawal amount?',
      a: 'The minimum withdrawal amount starts from $10.00 USD for electronic payment systems and local payment methods like bKash, Nagad, and Rocket, or $50 for cryptocurrency.'
    },
    {
      q: 'Is there any fee for depositing or withdrawing funds from the account?',
      a: 'No. The company does not charge any fee for either deposit or withdrawal operations.'
    },
    {
      q: 'Do I need to provide any documents to make a withdrawal?',
      a: 'Usually, additional documents are not required to withdraw funds. But the Company, at its discretion, may ask you to confirm your personal data if requested by compliance.'
    },
  ];

  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (balanceLocked) {
      setStatusMessage({
        type: 'error',
        text: 'Your account balance is locked by administrator. Withdrawals are restricted.'
      });
      return;
    }

    if (amount > liveBalance) {
      setStatusMessage({
        type: 'error',
        text: 'Insufficient live account balance. Please adjust withdrawal amount.'
      });
      return;
    }
    if (amount < minLimit) {
      setStatusMessage({
        type: 'error',
        text: `Minimum withdrawal amount for ${activeGw?.name || method.toUpperCase()} is $${minLimit}.00 USD.`
      });
      return;
    }
    if (amount > maxLimit) {
      setStatusMessage({
        type: 'error',
        text: `Maximum withdrawal amount per transaction for ${activeGw?.name || method.toUpperCase()} is $${maxLimit}.00 USD.`
      });
      return;
    }
    if (!accountNumber.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your recipient account number or wallet address.'
      });
      return;
    }

    setIsProcessing(true);

    try {
      let txIdToUse = '';
      try {
        const res = await apiClient.post('/api/user/withdrawal', {
          amount,
          gateway: method.toUpperCase(),
          accountNumber: accountNumber.trim(),
          userNote: `Withdrawal to ${method.toUpperCase()} (${accountNumber.trim()})`
        });

        if (res.ok && res.data?.transaction?.id) {
          txIdToUse = res.data.transaction.id;
        }
      } catch (apiErr) {
        console.warn('[Withdrawal] API failed, using client-side Firestore fallback:', apiErr);
      }

      // If API failed or was not found (Vercel), generate fallback ID and save directly to Firebase
      if (!txIdToUse) {
        txIdToUse = `WITH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      }

      await FirebaseService.syncTransaction({
        id: txIdToUse,
        userId: userEmail || 'guest',
        type: 'withdrawal',
        amount: Number(amount),
        gateway: method.toUpperCase(),
        accountNumber: accountNumber.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setIsProcessing(false);
      soundManager.playWin();
      onWithdrawSuccess(amount);
      setStatusMessage({
        type: 'success',
        text: 'Withdrawal request submitted! It has been queued for administrator approval.'
      });
      fetchTransactionsAndGateways();
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage({
        type: 'error',
        text: formatErrorMessage(err)
      });
    }
  };

  return (
    <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-200">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
            <span>Withdraw Funds</span>
          </h2>
        </div>
        <button
          onClick={onBackToTrade}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold transition-all cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* Main Form Content */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left Card: Account Balance */}
        <div className="md:col-span-4 bg-[#121722] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Withdrawable Balance</span>
            <div className="text-3xl font-black font-mono-nums text-emerald-400 mt-1">
              ${liveBalance.toFixed(2)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
            0% transaction fee. Standard payout review completed within a short time.
          </div>
        </div>

        {/* Right Card: Withdrawal Form */}
        <div className="md:col-span-8 bg-[#121722] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
          <form onSubmit={handleExecuteWithdrawal} className="space-y-4">
            
            {/* Gateway Select */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {withdrawalGateways.map((m) => {
                  const mId = m.id || m.name.toLowerCase();
                  const isSelected = method === mId || method === m.name?.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={m.id || m.name}
                      onClick={() => {
                        setMethod(mId);
                        if (amount < (m.minWithdrawal || m.minDeposit || 10)) {
                          setAmount(m.minWithdrawal || m.minDeposit || 10);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="w-6 h-6 mb-1 flex items-center justify-center rounded bg-white/5 overflow-hidden">
                        {m.icon && m.icon.startsWith('http') ? (
                          <img src={m.icon} alt={m.name} className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-sm">{m.icon || '💳'}</span>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-white">{m.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono font-normal">
                        Min: ${m.minWithdrawal || m.minDeposit || 10}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Your {activeGw?.name || method.toUpperCase()} Account Number
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter wallet / mobile number or address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Withdrawal Amount ($)</span>
                <span className="text-slate-500 font-mono-nums">Limit: ${minLimit} - ${maxLimit}</span>
              </div>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={minLimit}
                  max={Math.min(maxLimit, Math.max(minLimit, liveBalance))}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold font-mono-nums text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  statusMessage.type === 'error'
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                }`}
              >
                {statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || liveBalance < 10}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Submitting request...' : `Confirm Withdrawal ($${amount.toFixed(2)})`}
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Section: Recent Requests History */}
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Recent Transactions</span>
          </h4>
          <button 
            onClick={fetchTransactionsAndGateways}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Refresh History
          </button>
        </div>

        <div className="bg-[#121722] border border-white/10 rounded-2xl p-4 shadow-xl overflow-x-auto">
          {userTransactions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No recent requests.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Gateway</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                {userTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-sans ${
                        tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-white">{tx.gateway}</td>
                    <td className="py-3 px-3 font-bold text-white">${tx.amount.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-sans ${
                        tx.status === 'completed' || tx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-amber-500/20 text-amber-400 animate-pulse'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[120px]">{tx.trxId || tx.senderNumber || tx.accountNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
