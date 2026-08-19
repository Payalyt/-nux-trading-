import React, { useState } from 'react';
import { MarketStoreItem } from '../../types/trading';
import { X, ShoppingBag, ShieldCheck, Sparkles, Gift, Percent, Zap, Check } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface MarketStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketStoreModal: React.FC<MarketStoreModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  const items: MarketStoreItem[] = [
    {
      id: 'store-1',
      title: 'Risk-Free Trade $50',
      description: 'Guaranteed refund on your next losing trade up to $50.',
      price: 15,
      category: 'risk-free',
      badge: 'Bestseller',
      iconName: 'shield',
    },
    {
      id: 'store-2',
      title: '100% Deposit Match Booster',
      description: 'Double your next deposit up to $500 with zero rollover restrictions.',
      price: 25,
      category: 'bonus',
      badge: 'Popular',
      iconName: 'gift',
    },
    {
      id: 'store-3',
      title: '10% Weekly Loss Cashback',
      description: 'Receive 10% cash back every Sunday for all net trade losses.',
      price: 40,
      category: 'cashback',
      badge: 'Pro Tier',
      iconName: 'percent',
    },
    {
      id: 'store-4',
      title: 'VIP Master Payout Upgrade (+4%)',
      description: 'Boost standard payouts on all currency pairs by +4% for 7 days.',
      price: 60,
      category: 'vip',
      badge: 'VIP Elite',
      iconName: 'zap',
    },
  ];

  if (!isOpen) return null;

  const handlePurchase = (id: string) => {
    soundManager.playWin();
    setPurchasedIds((prev) => [...prev, id]);
  };

  return (
    <div 
      id="market-store-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="market-store-modal-dialog"
        className="bg-[#0d121b]/95 backdrop-blur-2xl border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trading Market Store</h2>
              <p className="text-[11px] text-slate-400">Risk-free trades, payout boosters & promos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Store Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {items.map((item) => {
            const isOwned = purchasedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">
                      {item.category === 'risk-free' && '🛡️'}
                      {item.category === 'bonus' && '🎁'}
                      {item.category === 'cashback' && '💸'}
                      {item.category === 'vip' && '👑'}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-white mt-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm font-bold font-mono-nums text-white">
                    ${item.price}
                  </div>
                  <button
                    onClick={() => handlePurchase(item.id)}
                    disabled={isOwned}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                      isOwned
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black font-black shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {isOwned ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Activated</span>
                      </>
                    ) : (
                      <span>Buy Promo</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
