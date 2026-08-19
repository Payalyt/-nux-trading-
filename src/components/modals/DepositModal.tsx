import React, { useState, useEffect } from 'react';
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
  DollarSign,
  Copy,
  Smartphone,
  Building,
  Globe,
  HelpCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { apiClient, formatErrorMessage } from '../../utils/apiClient';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
}) => {
  const [gateways, setGateways] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<'popular' | 'epay' | 'crypto' | 'bank'>('popular');
  const [selectedMethod, setSelectedMethod] = useState<any | null>(null);
  
  // Payment Form States
  const [paymentType, setPaymentType] = useState<'send_money' | 'merchant' | 'cash_out'>('send_money');
  const [amount, setAmount] = useState<number>(50);
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('PROMO50');
  const [bonusApplied, setBonusApplied] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch live gateway configurations & numbers from backend
  useEffect(() => {
    if (isOpen) {
      setSubmitSuccess(false);
      setErrorMessage(null);
      apiClient.get('/api/public/settings').then((res) => {
        if (res.ok && res.data?.paymentGateways) {
          setGateways(res.data.paymentGateways);
        }
      }).catch((err) => {
        console.error('Error loading dynamic gateway settings:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Fallback defaults if gateways haven't loaded yet
  const displayGateways = gateways.length > 0 ? gateways : [
    {
      id: 'bkash',
      name: 'bKash (BD)',
      category: 'popular',
      icon: 'https://i.postimg.cc/MZNd4Pjq/55.png',
      sendMoneyNumber: '01700000001',
      merchantNumber: '01700000002',
      cashOutNumber: '01700000003',
      minDeposit: 10,
      maxDeposit: 5000,
      bonusPercent: 50,
      conversionRate: 125,
      allowSendMoney: true,
      allowMerchant: true,
      allowCashOut: true,
      instruction: 'Send money to our bKash number and enter TrxID below.',
    },
    {
      id: 'nagad',
      name: 'Nagad (BD)',
      category: 'popular',
      icon: 'https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png',
      sendMoneyNumber: '01800000001',
      merchantNumber: '01800000002',
      cashOutNumber: '01800000003',
      minDeposit: 10,
      maxDeposit: 5000,
      bonusPercent: 50,
      conversionRate: 125,
      allowSendMoney: true,
      allowMerchant: true,
      allowCashOut: true,
      instruction: 'Send money to our Nagad number and enter 8-digit TrxID.',
    },
    {
      id: 'rocket',
      name: 'Rocket DBBL',
      category: 'popular',
      icon: 'https://i.postimg.cc/ryRwMszC/unnamed.png',
      sendMoneyNumber: '01900000001',
      minDeposit: 10,
      maxDeposit: 3000,
      bonusPercent: 40,
      conversionRate: 125,
      allowSendMoney: true,
      instruction: 'Transfer from Rocket and input account number & TrxID.',
    },
    {
      id: 'usdt-trc20',
      name: 'USDT (TRC-20)',
      category: 'crypto',
      icon: '₮',
      minDeposit: 10,
      maxDeposit: 50000,
      bonusPercent: 50,
      conversionRate: 1,
      cryptoDetails: { walletAddress: 'TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX', network: 'Tron (TRC20)' }
    }
  ];

  const filteredOptions = displayGateways.filter((opt) => {
    if (activeCategory === 'popular') return opt.category === 'popular' || opt.category === 'mobile_banking';
    if (activeCategory === 'epay') return opt.category === 'epay' || opt.category === 'mobile_banking';
    if (activeCategory === 'crypto') return opt.category === 'crypto';
    if (activeCategory === 'bank') return opt.category === 'bank';
    return true;
  });

  const presetAmounts = [10, 20, 50, 100, 250, 500, 1000];
  const bonusRate = selectedMethod ? (selectedMethod.bonusPercent || 50) / 100 : 0.5;
  const bonusAmount = bonusApplied ? amount * bonusRate : 0;
  const totalCredited = amount + bonusAmount;
  const conversionRate = selectedMethod?.conversionRate || 125;
  const amountBdt = Math.round(amount * conversionRate);

  // Active recipient number based on selected payment type
  const activeRecipientNumber = selectedMethod ? (
    paymentType === 'send_money' ? selectedMethod.sendMoneyNumber || selectedMethod.merchantNumber || selectedMethod.cashOutNumber :
    paymentType === 'merchant' ? selectedMethod.merchantNumber || selectedMethod.sendMoneyNumber :
    selectedMethod.cashOutNumber || selectedMethod.sendMoneyNumber
  ) : '';

  const handleCopy = (text: string) => {
    soundManager.playClick();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const res = await apiClient.post('/api/user/deposit', {
        amount,
        gateway: selectedMethod?.name || 'Mobile Banking',
        paymentType,
        senderNumber: senderNumber.trim(),
        trxId: trxId.trim(),
        bonusAmount,
        userNote: `Deposit via ${selectedMethod?.name} (${paymentType})`
      });

      if (!res.ok) {
        throw new Error(formatErrorMessage(res.error || res.data?.error, 'Failed to submit deposit'));
      }

      setIsProcessing(false);
      setSubmitSuccess(true);
      soundManager.playWin();
      onDepositSuccess(totalCredited);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      setTimeout(() => {
        onClose();
      }, 2500);

    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(formatErrorMessage(err));
    }
  };

  return (
    <div 
      id="deposit-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="deposit-modal-dialog"
        className="bg-[#0e131d] border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedMethod && !submitSuccess && (
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setErrorMessage(null);
                }}
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
                  {selectedMethod ? `Deposit via ${selectedMethod.name}` : 'Deposit Funds'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {selectedMethod ? 'Fast automated deposit verification' : 'Choose a payment system in Bangladesh'}
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

        {/* Success Confirmation View */}
        {submitSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Deposit Request Submitted!</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Your deposit of <strong className="text-emerald-400 font-mono">${totalCredited.toFixed(2)}</strong> via <strong className="text-white">{selectedMethod?.name}</strong> (TrxID: <span className="font-mono text-amber-400">{trxId}</span>) has been submitted to the administrator and will be verified within 1-3 minutes.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Administrator Verification</span>
            </div>
          </div>
        ) : !selectedMethod ? (
          /* Method Selection Screen */
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
                  <span className="uppercase tracking-wider">POPULAR (BD)</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono-nums">bKash / Nagad</span>
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
                  <Globe className="w-4 h-4" />
                  <span className="uppercase tracking-wider">CRYPTO</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono-nums">USDT / BTC</span>
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
                  <Building className="w-4 h-4" />
                  <span className="uppercase tracking-wider">BANK TRANSFER</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono-nums">Local BD</span>
              </button>

              <div className="pt-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>50% Bonus Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Get extra funds on any deposit with zero fees.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Method Cards Grid */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Deposit Method
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono-nums">0% Deposit Fee</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedMethod(opt);
                    }}
                    className="p-3.5 rounded-xl bg-[#121722] hover:bg-white/5 border border-white/10 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer transition-all group shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                        {opt.icon?.startsWith('http') ? (
                          <img src={opt.icon} alt={opt.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-xl">{opt.icon || '💳'}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                            {opt.name}
                          </span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Instant
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono-nums mt-0.5">
                          Min. ${opt.minDeposit || 10}.00 • Bonus +{opt.bonusPercent || 50}%
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
          /* Step 2: Method Payment Details & Form */
          <form onSubmit={handleExecuteDeposit} className="p-6 overflow-y-auto space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Selected Method Details Banner */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedMethod.icon?.startsWith('http') ? (
                    <img src={selectedMethod.icon} alt={selectedMethod.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-2xl">{selectedMethod.icon || '💳'}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedMethod.name}</h4>
                  <p className="text-xs text-slate-400 font-mono-nums">
                    Min deposit: ${selectedMethod.minDeposit || 10}.00 • Rate: 1 USD = {conversionRate} BDT
                  </p>
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

            {/* Payment Type Tabs for Mobile Banking (Send Money vs Merchant vs Cash Out) */}
            {selectedMethod.category !== 'crypto' && selectedMethod.category !== 'bank' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Payment Number Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(selectedMethod.allowSendMoney ?? true) && (
                    <button
                      type="button"
                      onClick={() => setPaymentType('send_money')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        paymentType === 'send_money' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      Send Money (Personal)
                    </button>
                  )}
                  {(selectedMethod.allowMerchant ?? false) && (
                    <button
                      type="button"
                      onClick={() => setPaymentType('merchant')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        paymentType === 'merchant' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      Merchant (Payment)
                    </button>
                  )}
                  {(selectedMethod.allowCashOut ?? false) && (
                    <button
                      type="button"
                      onClick={() => setPaymentType('cash_out')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        paymentType === 'cash_out' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      Cash Out (Agent)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Recipient Number / Wallet Address Box */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">
                  {selectedMethod.category === 'crypto'
                    ? 'Transfer to Crypto Wallet Address:'
                    : selectedMethod.category === 'bank'
                    ? 'Transfer to Bank Account Details:'
                    : `Please ${paymentType.replace('_', ' ')} to our official ${selectedMethod.name} number:`}
                </span>
                <span className="text-emerald-400 text-[10px] font-bold uppercase">Official Verified</span>
              </div>

              {selectedMethod.category === 'crypto' ? (
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/10">
                  <div className="overflow-hidden mr-2">
                    <div className="text-[10px] text-slate-400 font-semibold">{selectedMethod.cryptoDetails?.network || 'TRC20'} Network</div>
                    <div className="text-xs font-mono font-bold text-white truncate">
                      {selectedMethod.cryptoDetails?.walletAddress || 'TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedMethod.cryptoDetails?.walletAddress || 'TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX')}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-lg flex items-center space-x-1 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ) : selectedMethod.category === 'bank' ? (
                <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1 text-xs font-mono">
                  <div className="text-white font-bold">{selectedMethod.bankDetails?.bankName || 'Islami Bank Bangladesh Ltd'}</div>
                  <div className="text-slate-300">A/C Name: {selectedMethod.bankDetails?.accountName || 'NUX TRADING GLOBAL LTD'}</div>
                  <div className="text-emerald-400 font-bold flex items-center justify-between">
                    <span>A/C No: {selectedMethod.bankDetails?.accountNumber || '20501234567890'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedMethod.bankDetails?.accountNumber || '20501234567890')}
                      className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]"
                    >
                      Copy A/C
                    </button>
                  </div>
                  <div className="text-slate-400 text-[11px]">{selectedMethod.bankDetails?.branch || 'Corporate Branch, Dhaka'}</div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/10">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{paymentType.replace('_', ' ')} Number</div>
                    <div className="text-base sm:text-lg font-mono font-black text-emerald-400 tracking-wider">
                      {activeRecipientNumber || '01700000001'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeRecipientNumber || '01700000001')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shrink-0 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Number'}</span>
                  </button>
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                {selectedMethod.instruction || 'Send exact payment to the number above and enter your Transaction ID (TrxID) below.'}
              </p>
            </div>

            {/* Deposit Amount */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Deposit Amount ($ USD)</span>
                <span className="text-emerald-400 font-bold font-mono-nums">
                  ≈ ৳{amountBdt.toLocaleString()} BDT
                </span>
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
                  min={selectedMethod.minDeposit || 10}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold font-mono-nums text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* User Input: Sender Account & TrxID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Your Sender {selectedMethod.name} Number
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Transaction ID (TrxID / Reference)
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. 9J4K2L8M1N"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
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
                  Apply {selectedMethod.bonusPercent || 50}% Welcome Bonus (+${bonusAmount.toFixed(2)})
                </label>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                {promoCode}
              </span>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono-nums">
              <div className="flex justify-between text-slate-400">
                <span>Amount to Send in BDT:</span>
                <span className="font-bold text-white">৳{amountBdt.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Bonus Added ({selectedMethod.bonusPercent || 50}%):</span>
                <span className="font-bold">+${bonusAmount.toFixed(2)} USD</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
                <span className="font-sans">Total Credited to Live Balance:</span>
                <span className="text-emerald-400 font-mono">${totalCredited.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <span>Submitting Deposit Request...</span>
              ) : (
                <>
                  <span>Submit Deposit Verification (${totalCredited.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
