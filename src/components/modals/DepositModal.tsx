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
import { FirebaseService } from '../../utils/firebaseSync';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number) => void;
  userEmail?: string;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
  userEmail,
}) => {
  const [gateways, setGateways] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<'popular' | 'epay' | 'crypto' | 'bank'>('popular');
  const [selectedMethod, setSelectedMethod] = useState<any | null>(null);
  
  // Payment Form States
  const [paymentType, setPaymentType] = useState<'send_money' | 'merchant' | 'cash_out'>('send_money');
  const [amount, setAmount] = useState<number>(100);
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
      FirebaseService.fetchGateways().then((fetchedGateways) => {
        if (fetchedGateways && fetchedGateways.length > 0) {
           const activeGateways = fetchedGateways.filter(g => g.active !== false);
           setGateways(activeGateways.map((g: any) => ({
             ...g,
             minDeposit: Math.max(10, g.minDeposit || 10)
           })));
        } else {
           // Fetch from fallback API if Firebase is empty
           apiClient.get('/api/public/settings').then((res) => {
             if (res.ok && res.data?.paymentGateways) {
               setGateways(res.data.paymentGateways.map((g: any) => ({
                 ...g,
                 minDeposit: Math.max(10, g.minDeposit || 10)
               })));
             }
           }).catch((err) => {
             console.error('Error loading dynamic gateway settings:', err);
           });
        }
      }).catch((err) => {
        console.error('Error fetching Firebase gateways:', err);
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
      minDeposit: 100,
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
      minDeposit: 100,
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
      minDeposit: 100,
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
      minDeposit: 100,
      maxDeposit: 50000,
      bonusPercent: 50,
      conversionRate: 1,
      cryptoDetails: { walletAddress: 'TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX', network: 'Tron (TRC20)' }
    }
  ];

  const filteredOptions = displayGateways.filter((opt) => {
    if (activeCategory === 'popular') return opt.category === 'popular' || opt.category === 'mobile_banking';
    if (activeCategory === 'epay') return opt.category === 'epay' || opt.category === 'card';
    if (activeCategory === 'crypto') return opt.category === 'crypto';
    if (activeCategory === 'bank') return opt.category === 'bank';
    return true;
  });

  const presetAmounts = [100, 250, 500, 1000, 2500, 5000];
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

    const minDeposit = selectedMethod?.minDeposit || 10;
    if (amount < minDeposit) {
      setErrorMessage(`Minimum deposit amount is $${minDeposit.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);

    try {
      let txIdToUse = '';
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

        if (res.ok && res.data?.transaction?.id) {
          txIdToUse = res.data.transaction.id;
        }
      } catch (apiErr) {
        console.warn('[Deposit] API failed, using client-side Firestore fallback:', apiErr);
      }

      // If API failed or was not found (Vercel), generate fallback ID and save directly to Firebase
      if (!txIdToUse) {
        txIdToUse = `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      }

      await FirebaseService.syncTransaction({
        id: txIdToUse,
        userId: userEmail || 'guest',
        type: 'deposit',
        amount: Number(amount),
        bonus: Number(bonusAmount || 0),
        gateway: selectedMethod?.name || 'Mobile Banking',
        senderNumber: senderNumber.trim(),
        trxId: trxId.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });

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
                  {selectedMethod ? 'Fill in transaction details' : 'Select your payment method'}
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
            <h3 className="text-xl font-bold text-white">Request Submitted!</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Your deposit of <strong className="text-emerald-400 font-mono">${totalCredited.toFixed(2)}</strong> via <strong className="text-white">{selectedMethod?.name}</strong> has been submitted and will be credited to your account shortly.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending short review</span>
            </div>
          </div>
        ) : !selectedMethod ? (
          /* Method Selection Screen */
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Sidebar Category Tabs (Horizontal on mobile, vertical on desktop) */}
            <div className="w-full md:w-56 bg-[#0a0d14] border-b md:border-b-0 md:border-r border-white/10 p-2 sm:p-3 flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 shrink-0 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveCategory('popular')}
                className={`flex-1 md:w-full p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-[10px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeCategory === 'popular'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="uppercase tracking-wider">POPULAR</span>
                </div>
                <ChevronRight className="hidden md:block w-3 h-3 opacity-50" />
              </button>

              <button
                onClick={() => setActiveCategory('crypto')}
                className={`flex-1 md:w-full p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-[10px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeCategory === 'crypto'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="uppercase tracking-wider">CRYPTO</span>
                </div>
                <ChevronRight className="hidden md:block w-3 h-3 opacity-50" />
              </button>

              <button
                onClick={() => setActiveCategory('epay')}
                className={`flex-1 md:w-full p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-[10px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeCategory === 'epay'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="uppercase tracking-wider">E-PAY</span>
                </div>
                <ChevronRight className="hidden md:block w-3 h-3 opacity-50" />
              </button>

              <button
                onClick={() => setActiveCategory('bank')}
                className={`flex-1 md:w-full p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-[10px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeCategory === 'bank'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="uppercase tracking-wider">BANK</span>
                </div>
                <ChevronRight className="hidden md:block w-3 h-3 opacity-50" />
              </button>
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
          <form onSubmit={handleExecuteDeposit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Selected Method Details Banner */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedMethod.icon?.startsWith('http') ? (
                    <img src={selectedMethod.icon} alt={selectedMethod.name} className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-lg">{selectedMethod.icon || '💳'}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{selectedMethod.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono-nums">
                    Min: ${selectedMethod.minDeposit} • 1$ = {conversionRate}৳
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMethod(null)}
                className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Change Method
              </button>
            </div>

            {/* Dynamic Recipient Number / Wallet Address Box */}
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-300">
                  {selectedMethod.category === 'crypto'
                    ? 'Transfer to Wallet:'
                    : selectedMethod.category === 'bank'
                    ? 'Bank Account:'
                    : `Send payment to:`}
                </span>
                <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider">Official Verified</span>
              </div>

              {selectedMethod.category === 'crypto' ? (
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                  <div className="overflow-hidden mr-2">
                    <div className="text-[9px] text-slate-400 font-semibold">{selectedMethod.cryptoDetails?.network || 'TRC20'} Network</div>
                    <div className="text-xs font-mono font-bold text-white truncate">
                      {selectedMethod.cryptoDetails?.walletAddress || 'TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedMethod.cryptoDetails?.walletAddress || 'TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX')}
                    className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] rounded-lg flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ) : selectedMethod.category === 'bank' ? (
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1 text-[11px] font-mono">
                  <div className="text-white font-bold">{selectedMethod.bankDetails?.bankName || 'Islami Bank Bangladesh Ltd'}</div>
                  <div className="text-slate-300">A/C: {selectedMethod.bankDetails?.accountName || 'NUX TRADING GLOBAL LTD'}</div>
                  <div className="text-emerald-400 font-bold flex items-center justify-between">
                    <span>No: {selectedMethod.bankDetails?.accountNumber || '20501234567890'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedMethod.bankDetails?.accountNumber || '20501234567890')}
                      className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                  <div>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase">{paymentType.replace('_', ' ')} Number</div>
                    <div className="text-sm sm:text-base font-mono font-bold text-emerald-400 tracking-wider">
                      {activeRecipientNumber || '01700000001'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeRecipientNumber || '01700000001')}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] rounded-lg flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Deposit Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Amount ($ USD)</span>
                <span className="text-emerald-400 font-bold">
                  ≈ ৳{amountBdt.toLocaleString()} BDT
                </span>
              </div>

              {/* Amount Presets */}
              <div className="grid grid-cols-6 gap-1.5">
                {presetAmounts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-bold font-mono transition-all cursor-pointer ${
                      amount === p
                        ? 'bg-emerald-500 text-black font-black'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    ${p}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative pt-0.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={selectedMethod.minDeposit || 10}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* User Input: Sender Account & TrxID */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  Sender Number
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="e.g. 017xxxxxxxx"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  TrxID / Ref
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="Transaction ID"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 50% Welcome Bonus Toggle */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="bonus-checkbox"
                  checked={bonusApplied}
                  onChange={(e) => setBonusApplied(e.target.checked)}
                  className="accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                />
                <label htmlFor="bonus-checkbox" className="font-bold text-slate-200 cursor-pointer">
                  Get +{selectedMethod.bonusPercent || 50}% Bonus
                </label>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                +${bonusAmount.toFixed(2)} USD (৳{(bonusAmount * conversionRate).toLocaleString('en-IN')})
              </span>
            </div>

            {/* Compact Summary Box */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-center font-mono">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-sans">You Send</div>
                <div className="text-xs font-bold text-white">৳{amountBdt.toLocaleString('en-IN')} BDT</div>
              </div>
              <div className="border-x border-white/10">
                <div className="text-[9px] text-slate-400 uppercase font-sans">Bonus</div>
                <div className="text-xs font-bold text-emerald-400">+${bonusAmount.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-sans">You Get</div>
                <div className="text-xs font-bold text-emerald-400">${totalCredited.toFixed(2)}</div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              {isProcessing ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Confirm Deposit (${totalCredited.toFixed(2)})</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
