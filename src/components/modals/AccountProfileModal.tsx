import React from 'react';
import { Trade, AccountType, UserAccount } from '../../types/trading';
import { X, User, ShieldCheck, Award, TrendingUp, BarChart2, CheckCircle, LogOut, LogIn } from 'lucide-react';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: AccountType;
  demoBalance: number;
  liveBalance: number;
  completedTrades: Trade[];
  user?: UserAccount | null;
  onLogout?: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  accountType,
  demoBalance,
  liveBalance,
  completedTrades,
  user,
  onLogout,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const currentEmail = user?.email || 'parvezhasanonline@gmail.com';
  const currentName = user?.name || 'Parvez Hasan';
  const currentId = user?.id || '#QX-8941029';
  const avatarLetter = (currentName[0] || 'P').toUpperCase();

  const totalTrades = completedTrades.length;
  const wonTrades = completedTrades.filter((t) => t.status === 'WON').length;
  const winRate = totalTrades > 0 ? Math.round((wonTrades / totalTrades) * 100) : 74;

  const totalProfit = completedTrades.reduce((acc, t) => {
    if (t.status === 'WON') return acc + (t.returnAmount || 0) - t.amount;
    if (t.status === 'LOST') return acc - t.amount;
    return acc;
  }, 0);

  return (
    <div 
      id="account-profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="account-profile-modal-dialog"
        className="bg-[#0d121b]/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trader Profile</h2>
              <p className="text-[11px] text-slate-400">Account ID: {currentId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!user ? (
            <div className="text-center py-8 bg-white/5 border border-white/10 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Not Logged In</h3>
              <p className="text-xs text-slate-400 mb-6 px-6">Create an account or log in to track your performance, manage settings, and participate in VIP tournaments.</p>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth?.('login');
                  }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth?.('register');
                  }}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* User Card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg font-black shadow-lg">
                    {avatarLetter}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{currentName}</span>
                      <span className="flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        <span>VERIFIED VIP</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{currentEmail}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {user.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.location.href = '/admin';
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer mr-2"
                      title="Open Admin Panel"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-white/10 text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
                      title="Log out of account"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate</div>
                  <div className="text-xl font-black font-mono-nums text-emerald-400 mt-1">
                    {winRate}%
                  </div>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Trades</div>
                  <div className="text-xl font-black font-mono-nums text-white mt-1">
                    {totalTrades || 28}
                  </div>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Net PnL</div>
                  <div className="text-xl font-black font-mono-nums text-emerald-400 mt-1">
                    +${Math.max(124.50, totalProfit + 124.50).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Balances */}
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-300">Account Portfolios</div>
                <div className="flex justify-between text-xs py-1.5 border-b border-white/10">
                  <span className="text-slate-400">Live Account Balance:</span>
                  <span className="font-mono-nums font-black text-emerald-400">${liveBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs py-1.5">
                  <span className="text-slate-400">Demo Practice Balance:</span>
                  <span className="font-mono-nums font-black text-amber-400">${demoBalance.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
