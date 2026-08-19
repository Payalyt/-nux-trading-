import React, { useState } from 'react';
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
  ExternalLink 
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

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
  const [method, setMethod] = useState<'nagad' | 'bkash' | 'rocket' | 'binance' | 'usdt'>('bkash');
  const [accountNumber, setAccountNumber] = useState<string>('01700000000');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How to withdraw money from the account?',
      a: 'The procedure for withdrawing capital is extremely simple and is carried out through your individual account. The method you have chosen to deposit the account is also a method of withdrawing funds.'
    },
    {
      q: 'How long does it take to withdraw funds?',
      a: 'On average, the withdrawal procedure takes from 1 to 5 days from the date of receipt of the corresponding request of the Client and depends only on the volume of simultaneously processed requests. The company always tries to make payments directly on the day the request is received from the Client.'
    },
    {
      q: 'What is the minimum withdrawal amount?',
      a: 'The minimum withdrawal amount starts from $10.00 USD for electronic payment systems and local payment methods like Bkash, Nagad, and Rocket, or $50 for cryptocurrency.'
    },
    {
      q: 'Is there any fee for depositing or withdrawing funds from the account?',
      a: 'No. The company does not charge any fee for either the deposit or for the withdrawal operations. However, payment systems can charge their fee and use internal currency conversion rate.'
    },
    {
      q: 'Do I need to provide any documents to make a withdrawal?',
      a: 'Usually, additional documents are not required to withdraw funds. But the Company, at its discretion, may ask you to confirm your personal data by requesting certain documents (Passport, ID card, or Driver license).'
    },
    {
      q: 'What is account verification?',
      a: 'Verification is confirmation of the client\'s personal data by providing the company with additional documents to ensure safety and regulatory compliance.'
    },
  ];

  const handleExecuteWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > liveBalance) {
      setStatusMessage('Error: Insufficient live account balance. Please top up or reduce amount.');
      return;
    }
    if (amount < 10) {
      setStatusMessage('Error: Minimum withdrawal amount is $10.00.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('');

    setTimeout(() => {
      setIsProcessing(false);
      onWithdrawSuccess(amount);
      soundManager.playWin();
      setStatusMessage('Withdrawal request submitted successfully! Funds will be processed within 1-3 business days.');
    }, 1200);
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
            <h3 className="text-sm font-bold text-slate-300">Withdrawal:</h3>

            {/* Informational Notice */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                You can withdraw money from your balance to your bank card or electronic purse you used for depositing. You can request withdrawal any time.
              </p>
              <p className="text-slate-400">
                Your withdrawal requests are processed in 3 business days.
              </p>
              <div>
                <button
                  type="button"
                  onClick={onOpenDeposit}
                  className="text-xs text-red-400 hover:text-red-300 font-bold underline transition-colors cursor-pointer"
                >
                  Make a deposit
                </button>
              </div>
            </div>

            {/* Withdrawal Action Form */}
            <form onSubmit={handleExecuteWithdrawal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Payment System
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'bkash' as const, label: 'bKash', icon: 'https://i.postimg.cc/MZNd4Pjq/55.png' },
                    { id: 'nagad' as const, label: 'Nagad', icon: 'https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png' },
                    { id: 'rocket' as const, label: 'Rocket', icon: 'https://i.postimg.cc/ryRwMszC/unnamed.png' },
                    { id: 'binance' as const, label: 'Binance Pay', icon: '🟡' },
                    { id: 'usdt' as const, label: 'USDT (TRC20)', icon: '₮' },
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
                      <div className="w-8 h-8 mb-1 flex items-center justify-center rounded bg-white/5 overflow-hidden">
                        {m.icon.startsWith('http') ? (
                          <img src={m.icon} alt={m.label} className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-base">{m.icon}</span>
                        )}
                      </div>
                      <div>{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Account Number / Wallet Address
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 017xxxxxxxx or Wallet address..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono-nums focus:outline-none focus:border-emerald-500"
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
                    statusMessage.startsWith('Error')
                      ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {statusMessage.startsWith('Error') ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{statusMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Processing request...' : 'Confirm Withdrawal'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: FAQ Accordion (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#121722] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">FAQ:</h3>
              <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                Check out full FAQ
              </span>
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

      {/* Bottom Section: Some of your latest requests */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Some of your latest requests:
          </h4>
          <span className="text-xs text-emerald-400 hover:underline cursor-pointer">
            All financial history →
          </span>
        </div>

        <div className="bg-[#121722] border border-white/10 rounded-2xl p-8 text-center text-slate-500 text-xs shadow-xl">
          <p>No recent withdrawal requests found for this period.</p>
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
