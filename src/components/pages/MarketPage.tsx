import React, { useState } from 'react';
import { 
  Sparkles, 
  Gift, 
  ShieldCheck, 
  Percent, 
  RotateCcw, 
  Tag, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const MarketPage: React.FC<{ onBackToTrade?: () => void }> = ({ onBackToTrade }) => {
  const [activeCodeModal, setActiveCodeModal] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(false);

  const marketCards = [
    {
      id: 'risk-free',
      title: 'Risk Free',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      tag: '0 PROMO CODES AVAILABLE',
      desc: "You don't have a promo code history yet. You can add a promo code using the button below.",
    },
    {
      id: 'cashback',
      title: 'Cashback',
      icon: <RotateCcw className="w-5 h-5 text-blue-400" />,
      tag: '0 PROMO CODES AVAILABLE',
      desc: "You don't have a promo code history yet. You can add a promo code using the button below.",
    },
    {
      id: 'deposit-bonus',
      title: 'Deposit Bonus',
      icon: <Gift className="w-5 h-5 text-amber-400" />,
      tag: '3 BONUSES ACTIVE',
      bonuses: [
        { code: 'DEPOSIT50 (50%)', expiry: '26/10/2030', status: 'Unlimited' },
        { code: 'WELCOME30 (30%)', expiry: 'Unlimited', status: 'Unlimited' },
        { code: 'DEPOSIT40 (40%)', expiry: '26/10/2030', status: 'Unlimited' },
      ]
    },
    {
      id: 'turnover',
      title: 'Percentage of turnover',
      icon: <Percent className="w-5 h-5 text-purple-400" />,
      tag: '0 PROMO CODES AVAILABLE',
      desc: "You don't have a promo code history yet. You can add a promo code using the button below.",
    },
    {
      id: 'balance-bonus',
      title: 'Balance Bonus',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      tag: '0 PROMO CODES AVAILABLE',
      desc: "You don't have a promo code history yet. You can add a promo code using the button below.",
    },
    {
      id: 'cancel-x',
      title: 'Cancel X points',
      icon: <Tag className="w-5 h-5 text-rose-400" />,
      tag: '0 PROMO CODES AVAILABLE',
      desc: "You don't have a promo code history yet. You can add a promo code using the button below.",
    },
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playWin();
    setCodeSuccess(true);
    setTimeout(() => {
      setCodeSuccess(false);
      setPromoInput('');
      setActiveCodeModal(null);
    }, 1500);
  };

  return (
    <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-6 md:p-8 space-y-6 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Premium Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Market & Promo Store</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Activate risk-free trades, deposit bonuses, and booster codes</p>
          </div>
          {onBackToTrade && (
            <button
              onClick={onBackToTrade}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all cursor-pointer"
            >
              ← Back to Trading Chart
            </button>
          )}
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketCards.map((card) => (
            <div 
              key={card.id}
              className="bg-[#121722] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-emerald-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {card.icon}
                    </div>
                    <h3 className="text-sm font-bold text-white">{card.title}</h3>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono-nums uppercase px-2 py-0.5 rounded bg-white/5 border border-white/5">
                    {card.tag}
                  </span>
                </div>

                {card.bonuses ? (
                  <div className="space-y-2 pt-2">
                    {card.bonuses.map((b, i) => (
                      <div 
                        key={i}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono-nums"
                      >
                        <div>
                          <div className="font-bold text-emerald-400">{b.code}</div>
                          <div className="text-[10px] text-slate-400">Valid: {b.expiry}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Promo code ${b.code} copied! Apply on deposit.`)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Use it ›
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[60px]">
                    {card.desc}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => alert('Viewing promo history...')}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Show all
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeModal(card.title)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Enter promo code
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Enter Promo Code Modal Dialog */}
      {activeCodeModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveCodeModal(null)}
        >
          <div 
            className="bg-[#121722] border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-white">Enter {activeCodeModal} Code</h3>
            <form onSubmit={handleApply} className="space-y-3">
              <input
                type="text"
                required
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter promo code (e.g. PROMO50)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono-nums focus:outline-none focus:border-emerald-500"
              />

              {codeSuccess && (
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Promo code activated successfully!</span>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCodeModal(null)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl"
                >
                  Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
