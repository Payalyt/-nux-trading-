import React from 'react';
import { AccountType } from '../../types/trading';
import { Plus, ArrowDownToLine, ChevronLeft } from 'lucide-react';

export type QuotexNavPage = 
  | 'home'
  | 'trade' 
  | 'withdrawal' 
  | 'payments' 
  | 'trades' 
  | 'my_account' 
  | 'market' 
  | 'tournaments' 
  | 'analytics'
  | 'admin_panel'
  | 'auth';

interface QuotexSubHeaderProps {
  currentPage: QuotexNavPage;
  onSelectPage: (page: QuotexNavPage) => void;
  accountType: AccountType;
  demoBalance: number;
  liveBalance: number;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onBackToTrade: () => void;
  onOpenAuth?: () => void;
  user?: { email: string; name: string } | null;
}

export const QuotexSubHeader: React.FC<QuotexSubHeaderProps> = ({
  currentPage,
  onSelectPage,
  accountType,
  demoBalance,
  liveBalance,
  onOpenDeposit,
  onOpenWithdrawal,
  onBackToTrade,
  user,
}) => {
  const navTabs: { id: QuotexNavPage; label: string }[] = [
    { id: 'withdrawal', label: 'Withdrawal' },
    { id: 'payments', label: 'Payments' },
    { id: 'trades', label: 'Trades' },
    { id: 'my_account', label: 'My account' },
    { id: 'market', label: 'Market' },
    { id: 'tournaments', label: 'Tournaments' },
    { id: 'analytics', label: 'Analytics' },
  ];

  if (user && (user as any).role === 'admin') {
    navTabs.push({ id: 'admin_panel', label: 'Admin Panel' });
  }

  const currentBalance = (!user || accountType === 'DEMO') ? demoBalance : liveBalance;

  return (
    <header className="h-16 bg-[#0e131d] border-b border-white/10 px-6 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Logo & Nav Links */}
      <div className="flex items-center space-x-8">
        <div 
          onClick={onBackToTrade}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Back to Trading Chart"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            Q
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">QUOTEX</span>
              <span className="text-white/20">•</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                WEB TRADING PLATFORM
              </span>
            </div>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold">
          <button
            onClick={onBackToTrade}
            className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 transition-colors py-5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Chart</span>
          </button>

          {navTabs.map((tab) => {
            const isActive = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectPage(tab.id)}
                className={`py-5 border-b-2 font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'text-emerald-400 border-emerald-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center: Promo Banner */}
      <div 
        onClick={onOpenDeposit}
        className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 transition-all"
      >
        <span>🚀 Get a <strong className="text-white">50% bonus</strong> on your deposit!</span>
        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black">
          50%
        </span>
      </div>

      {/* Right: Balance & Buttons */}
      <div className="flex items-center space-x-4">
        {/* Balance Badge */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            {user ? (accountType === 'DEMO' ? 'Demo Account' : 'Live Account') : 'Demo Account'}
          </div>
          <div className="text-sm font-mono-nums font-extrabold text-white">
            ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Deposit Button */}
        <button
          onClick={onOpenDeposit}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Deposit</span>
        </button>

        {/* Withdrawal Button */}
        <button
          onClick={onOpenWithdrawal}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-slate-400" />
          <span>Withdrawal</span>
        </button>
      </div>
    </header>
  );
};
