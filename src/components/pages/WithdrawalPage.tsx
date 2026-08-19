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

interface WithdrawalPageProps {
  liveBalance: number;
  onOpenDeposit: () => void;
  onWithdrawSuccess: (amount: number) => void;
  onBackToTrade: () => void;
}

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({
  liveBalance,
  onOpenDeposit,
  onWithdrawSuccess,
  onBackToTrade,
}) => {
  const [amount, setAmount] = useState<number>(Math.min(50, liveBalance > 0 ? liveBalance : 50));
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'binance' | 'usdt'>('bkash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);

  const fetchTransactions = () => {
    apiClient.get('/api/user/transactions').then((res) => {
      if (res.ok && res.data?.transactions) {
        setUserTransactions(res.data.transactions);
      }
    }).catch((err) => {
      console.error('Error fetching transaction history:', err);
    });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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

    if (amount > liveBalance) {
      setStatusMessage({
        type: 'error',
        text: 'Insufficient live account balance. Please adjust withdrawal amount.'
      });
      return;
    }
    if (amount < 10) {
      setStatusMessage({
        type: 'error',
        text: 'Minimum withdrawal amount is $10.00 USD.'
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
      const res = await apiClient.post('/api/user/withdrawal', {
        amount,
        gateway: method.toUpperCase(),
        accountNumber: accountNumber.trim(),
        userNote: `Withdrawal to ${method.toUpperCase()} (${accountNumber.trim()})`
      });

      if (!res.ok) {
        throw new Error(formatErrorMessage(res.error || res.data?.error, 'Withdrawal request failed'));
      }

      setIsProcessing(false);
      soundManager.playWin();
      onWithdrawSuccess(amount);
      setStatusMessage({
        type: 'success',
        text: 'Withdrawal request submitted! It has been queued for administrator approval.'
      });
      fetchTransactions();
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage({
        type: 'error',
        text: formatErrorMessage(err)
      });
    }
  };

  return (
    <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-6 md:p-8 space-y-8 text-slate-200">
      {/* Top Main Columns Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Account Balances Info (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#121722] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-300">Account:</h3>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">In the account:</div>
              <div className="text-2xl font-black font-mono-nums text-white">
                {liveBalance.toFixed(2)} $
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1">
              <div className="text-xs text-slate-400">Available for withdrawal:</div>
              <div className="text-2xl font-black font-mono-nums text-emerald-400">
                {liveBalance.toFixed(2)} $
              </div>
            </div>
          </div>

          {/* Quick Note Box */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Instant Payout Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Withdrawal requests are processed 24/7 without hidden broker fees.
            </p>
          </div>
        </div>

        {/* Center Column: Withdrawal Form / Notice (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#121722] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-300">Withdrawal Request:</h3>

            {/* Informational Notice */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                You can withdraw money from your balance to your bKash, Nagad, Rocket, or Crypto wallet. Requests are processed promptly.
              </p>
              <div>
                <button
                  type="button"
                  onClick={onOpenDeposit}
                  className="text-xs text-emerald-400 hover:underline font-bold transition-colors cursor-pointer"
                >
                  Make a deposit →
                </button>
              </div>
            </div>

            {/* Withdrawal Action Form */}
            <form onSubmit={handleExecuteWithdrawal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Payment System
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: 'bkash' as const, label: 'bKash', icon: 'https://i.postimg.cc/MZNd4Pjq/55.png' },
                    { id: 'nagad' as const, label: 'Nagad', icon: 'https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png' },
                    { id: 'rocket' as const, label: 'Rocket', icon: 'https://i.postimg.cc/ryRwMszC/unnamed.png' },
                    { id: 'binance' as const, label: 'Binance', icon: '🟡' },
                    { id: 'usdt' as const, label: 'USDT', icon: '₮' },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold flex flex-col items-center justify-center ${
                        method === m.id
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="w-7 h-7 mb-1 flex items-center justify-center rounded bg-white/5 overflow-hidden">
                        {m.icon.startsWith('http') ? (
                          <img src={m.icon} alt={m.label} className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-base">{m.icon}</span>
                        )}
                      </div>
                      <div className="text-[11px]">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Your {method.toUpperCase()} Account Number / Address
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 01712345678 or TRC20 address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Amount (USD)</span>
                  <span className="text-slate-400 font-mono-nums">Min: $10.00</span>
                </div>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={10}
                    max={Math.max(10, liveBalance)}
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

        {/* Right Column: FAQ Accordion (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#121722] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">FAQ:</h3>
              <span className="text-[11px] text-emerald-400">Withdrawal FAQ</span>
            </div>

            <div className="divide-y divide-white/5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer py-1"
                    >
                      <span className="pr-2">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-[11px] text-slate-400 leading-relaxed animate-in fade-in duration-150">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Requests History */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Your Recent Transactions</span>
          </h4>
          <button 
            onClick={fetchTransactions}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Refresh History
          </button>
        </div>

        <div className="bg-[#121722] border border-white/10 rounded-2xl p-4 shadow-xl overflow-x-auto">
          {userTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No recent transaction requests found.
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
                  <th className="pb-3 px-3">Reference / TrxID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                {userTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                        tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-white">{tx.gateway}</td>
                    <td className="py-3 px-3 font-bold text-white">${tx.amount.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans ${
                        tx.status === 'completed' || tx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-amber-500/20 text-amber-400 animate-pulse'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{tx.trxId || tx.senderNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Guarantees & Security Badges */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
          <div className="text-xs font-bold text-white">Minimum deposit: $10</div>
          <div className="text-[10px] text-slate-400">Low threshold access</div>
        </div>
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
          <div className="text-xs font-bold text-white">Minimum withdrawal: $10</div>
          <div className="text-[10px] text-slate-400">Fast processing</div>
        </div>
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
          <div className="text-xs font-bold text-white">Verified by VISA & 3D Secure</div>
          <div className="text-[10px] text-slate-400">Encrypted payment gateway</div>
        </div>
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
          <div className="text-xs font-bold text-emerald-400">0% Commission Fee</div>
          <div className="text-[10px] text-slate-400">100% Free withdrawals</div>
        </div>
      </div>
    </div>
  );
};
