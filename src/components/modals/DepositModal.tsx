import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Zap,
  ChevronRight,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number) => void;
}

interface PaymentOption {
  id: string;
  name: string;
  category: 'popular' | 'epay' | 'crypto' | 'bank';
  icon: string;
  minDeposit: number;
  badge?: string;
  network?: string;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
}) => {
  const [activeCategory, setActiveCategory] = useState<'popular' | 'epay' | 'crypto' | 'bank'>('popular');
  const [selectedMethod, setSelectedMethod] = useState<PaymentOption | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [accountNumber, setAccountNumber] = useState<string>('017xxxxxxxx');
  const [promoCode, setPromoCode] = useState<string>('PROMO50');
  const [bonusApplied, setBonusApplied] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const paymentOptions: PaymentOption[] = [
    // Popular
    { id: 'binance-pay', name: 'Binance Pay', category: 'popular', icon: '🟡', minDeposit: 10, badge: 'Instant 0% Fee' },
    { id: 'nagad', name: 'Nagad', category: 'popular', icon: 'https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png', minDeposit: 10, badge: 'Recommended BD' },
    { id: 'bkash', name: 'bKash', category: 'popular', icon: 'https://i.postimg.cc/MZNd4Pjq/55.png', minDeposit: 10, badge: 'Instant 0% Fee' },
    { id: 'rocket', name: 'Rocket', category: 'popular', icon: 'https://i.postimg.cc/ryRwMszC/unnamed.png', minDeposit: 10 },
    { id: 'usdt-trc20', name: 'USDT (TRC 20)', category: 'popular', icon: '₮', minDeposit: 10, network: 'Tron Network' },
    { id: 'usdt-bep20', name: 'USDT (BEP 20)', category: 'popular', icon: '₮', minDeposit: 10, network: 'BNB Smart Chain' },
    { id: 'kucoin', name: 'KuCoin Pay', category: 'popular', icon: '🟢', minDeposit: 10 },
    { id: 'usdc-erc20', name: 'USDC (ERC 20)', category: 'popular', icon: '💲', minDeposit: 10 },
    { id: 'doge', name: 'Dogecoin', category: 'popular', icon: '🐕', minDeposit: 10 },
    { id: 'trx', name: 'Tron (TRX)', category: 'popular', icon: '🔴', minDeposit: 10 },

    // E-pay
    { id: 'epay-nagad', name: 'Nagad E-Pay', category: 'epay', icon: 'https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png', minDeposit: 10 },
    { id: 'epay-bkash', name: 'bKash E-Pay', category: 'epay', icon: 'https://i.postimg.cc/MZNd4Pjq/55.png', minDeposit: 10 },
    { id: 'epay-rocket', name: 'Rocket DBBL', category: 'epay', icon: 'https://i.postimg.cc/ryRwMszC/unnamed.png', minDeposit: 10 },
    { id: 'perfect-money', name: 'Perfect Money', category: 'epay', icon: '🌐', minDeposit: 10 },

    // Crypto
    { id: 'btc', name: 'Bitcoin (BTC)', category: 'crypto', icon: '₿', minDeposit: 10 },
    { id: 'eth', name: 'Ethereum (ETH)', category: 'crypto', icon: '🔷', minDeposit: 10 },
    { id: 'ltc', name: 'Litecoin (LTC)', category: 'crypto', icon: '🪙', minDeposit: 10 },
    { id: 'sol', name: 'Solana (SOL)', category: 'crypto', icon: '🟣', minDeposit: 10 },
    { id: 'xrp', name: 'Ripple (XRP)', category: 'crypto', icon: '💧', minDeposit: 10 },
    { id: 'shib', name: 'Shiba Inu (SHIB)', category: 'crypto', icon: '🐶', minDeposit: 10 },

    // Bank
    { id: 'visa-mastercard', name: 'Visa / Mastercard', category: 'bank', icon: '💳', minDeposit: 10 },
    { id: 'bank-transfer', name: 'Local Bank Transfer BD', category: 'bank', icon: '🏦', minDeposit: 20 },
  ];

  const filteredOptions = paymentOptions.filter((opt) => {
    if (activeCategory === 'popular') return opt.category === 'popular';
    if (activeCategory === 'epay') return opt.category === 'epay' || opt.id === 'nagad' || opt.id === 'bkash';
    if (activeCategory === 'crypto') return opt.category === 'crypto' || opt.category === 'popular';
    if (activeCategory === 'bank') return opt.category === 'bank';
    return true;
  });

  const presetAmounts = [10, 20, 50, 100, 250, 500, 1000];
  const bonusAmount = bonusApplied ? amount * 0.5 : 0;
  const totalCredited = amount + bonusAmount;

  const handleExecuteDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onDepositSuccess(totalCredited);
      soundManager.playWin();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
      onClose();
    }, 1200);
  };

  return (
    <div 
      id="deposit-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="deposit-modal-dialog"
        className="bg-[#0e131d] border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedMethod && (
              <button
                onClick={() => setSelectedMethod(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30">
                +
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {selectedMethod ? `Deposit via ${selectedMethod.name}` : 'Deposit'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {selectedMethod ? 'Instant payment processing' : 'Choose a payment system in Bangladesh'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        {!selectedMethod ? (
          /* Dual-Column Category + Method Grid (Matches Quotex design in Video) */
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Sidebar Category Tabs */}
            <div className="w-full md:w-56 bg-[#0a0d14] border-r border-white/10 p-3 space-y-1.5 shrink-0">
              <button
                onClick={() => setActiveCategory('popular')}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'popular'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span className="uppercase tracking-wider">POPULAR</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono-nums">4 methods</span>
              </button>

              <button
                onClick={() => setActiveCategory('epay')}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'epay'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="uppercase tracking-wider">E-PAY</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono-nums">4 methods</span>
              </button>

              <button
                onClick={() => setActiveCategory('crypto')}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'crypto'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono">₮</span>
                  <span className="uppercase tracking-wider">CRYPTO</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono-nums">21 methods</span>
              </button>

              <button
                onClick={() => setActiveCategory('bank')}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'bank'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="uppercase tracking-wider">BANK</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono-nums">2 methods</span>
              </button>

              {/* Bonus Tag Banner on sidebar */}
              <div className="pt-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>50% Bonus Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Get extra funds on any chosen payment method.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Method Cards Grid */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Popular in your region (Bangladesh)
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono-nums">0% Broker Commission</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedMethod(opt)}
                    className="p-3.5 rounded-xl bg-[#121722] hover:bg-white/5 border border-white/10 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer transition-all group shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                        {opt.icon.startsWith('http') ? (
                          <img src={opt.icon} alt={opt.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-xl">{opt.icon}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                            {opt.name}
                          </span>
                          {opt.badge && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono-nums mt-0.5">
                          Min. ${opt.minDeposit}.00
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* Method Deposit Amount & Checkout Form */
          <form onSubmit={handleExecuteDeposit} className="p-6 overflow-y-auto space-y-5">
            {/* Selected Method Details Banner */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedMethod.icon.startsWith('http') ? (
                    <img src={selectedMethod.icon} alt={selectedMethod.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-2xl">{selectedMethod.icon}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedMethod.name}</h4>
                  <p className="text-xs text-slate-400 font-mono-nums">Min deposit: ${selectedMethod.minDeposit}.00</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMethod(null)}
                className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Change method
              </button>
            </div>

            {/* Account / Phone Number for Local BD Gateways */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {selectedMethod.category === 'crypto' ? 'Your Crypto Refund Address' : `${selectedMethod.name} Account Number`}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Amount Selection */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Deposit Amount</span>
                <span className="text-emerald-400 font-bold font-mono-nums">Instant Credit</span>
              </div>

              {/* Amount Presets */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {presetAmounts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono-nums transition-all cursor-pointer ${
                      amount === p
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    ${p}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative pt-1">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={selectedMethod.minDeposit}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold font-mono-nums text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 50% Bonus Toggle */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="bonus-checkbox"
                  checked={bonusApplied}
                  onChange={(e) => setBonusApplied(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="bonus-checkbox" className="text-xs font-bold text-white cursor-pointer">
                  Apply 50% Welcome Bonus (+${(amount * 0.5).toFixed(2)})
                </label>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                PROMO50
              </span>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono-nums">
              <div className="flex justify-between text-slate-400">
                <span>Deposit Amount:</span>
                <span className="font-bold text-white">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Bonus Added (50%):</span>
                <span className="font-bold">+${bonusAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
                <span className="font-sans">Total Balance to Credit:</span>
                <span className="text-emerald-400">${totalCredited.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Processing Payment...' : `Deposit $${totalCredited.toFixed(2)} Now`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
