import React from 'react';
import { AccountType } from '../../types/trading';
import { Plus, ArrowDownToLine, ChevronLeft, Shield, Sun, Moon } from 'lucide-react';

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
  | 'admin'
  | 'auth';

interface QuotexSubHeaderProps {
  platformName?: string;
  currentPage: QuotexNavPage;
  onSelectPage: (page: QuotexNavPage) => void;
  accountType: AccountType;
  demoBalance: number;
  liveBalance: number;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onBackToTrade: () => void;
  onOpenAuth?: () => void;
  user?: { email: string; name: string; role?: string } | null;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const QuotexSubHeader: React.FC<QuotexSubHeaderProps> = ({
  platformName = 'NUX',
  currentPage,
  onSelectPage,
  accountType,
  demoBalance,
  liveBalance,
  onOpenDeposit,
  onOpenWithdrawal,
  onBackToTrade,
  user: _user,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const isAdmin = _user?.role === 'admin' || _user?.email?.toLowerCase() === 'rosul9552@gmail.com';
  const navTabs: { id: QuotexNavPage; label: string }[] = [
    { id: 'withdrawal', label: 'Withdrawal' },
    { id: 'payments', label: 'Payments' },
    { id: 'trades', label: 'Trades' },
    { id: 'my_account', label: 'My account' },
    { id: 'market', label: 'Market' },
    { id: 'tournaments', label: 'Tournaments' },
    { id: 'analytics', label: 'Analytics' }
  ];

  const currentBalance = (!_user || accountType === 'DEMO') ? demoBalance : liveBalance;

  return (
    <div className="flex flex-col bg-[#0e131d] border-b border-white/10 shrink-0 select-none z-30">
      <header className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between">
        {/* Left: Logo & Nav Links */}
        <div className="flex items-center space-x-4 sm:space-x-8">
          <div 
            onClick={onBackToTrade}
            className="flex items-center space-x-2.5 cursor-pointer group"
            title="Back to Trading Chart"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-base sm:text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              {platformName[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">{platformName}</span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="hidden sm:inline text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  TRADING PLATFORM
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold">
            <button
              onClick={onBackToTrade}
              className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 transition-colors py-4 cursor-pointer"
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
                  className={`py-4 border-b-2 font-bold transition-all cursor-pointer ${
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

        {/* Center: Promo Banner (Desktop) */}
        <div 
          onClick={onOpenDeposit}
          className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 transition-all"
        >
          <span>🚀 Get a <strong className="text-white">50% bonus</strong> on your deposit!</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black">
            50%
          </span>
        </div>

        {/* Right: Balance & Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Balance Badge */}
          <div className="text-right">
            <div className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              {_user ? (accountType === 'DEMO' ? 'Demo' : 'Live') : 'Demo'}
            </div>
            <div className="text-xs sm:text-sm font-mono-nums font-extrabold text-white">
              ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
              title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          )}

          {/* Deposit Button */}
          <button
            onClick={onOpenDeposit}
            className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Deposit</span>
            <span className="sm:hidden">Dep</span>
          </button>

          {/* Withdrawal Button */}
          <button
            onClick={onOpenWithdrawal}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-slate-400" />
            <span>Withdrawal</span>
          </button>
          
          {/* Hidden Admin Button (Double Click balance or somewhere) */}
          {isAdmin && (
            <button
              onClick={() => onSelectPage('admin')}
              className="w-1 h-1 opacity-0 absolute top-0 left-0"
              aria-label="Admin Panel"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Horizontal Scrollable Tab Bar */}
      <div className="flex md:hidden items-center space-x-4 px-3 py-2 overflow-x-auto scrollbar-none border-t border-white/5 bg-[#090d14]">
        <button
          onClick={onBackToTrade}
          className="flex items-center space-x-1 text-xs font-bold text-emerald-400 shrink-0 py-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Chart</span>
        </button>

        {navTabs.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectPage(tab.id)}
              className={`text-xs font-bold shrink-0 py-1 px-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
