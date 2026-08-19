import React, { useState } from 'react';
import { AccountType, NotificationItem, UserAccount } from '../types/trading';
import { soundManager } from '../utils/audio';
import { 
  Plus, 
  ArrowDownToLine, 
  Bell, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  ChevronDown, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  User, 
  ExternalLink,
  Gift,
  CheckCircle,
  HelpCircle,
  LogIn,
  UserPlus,
  LogOut,
  Lock
} from 'lucide-react';

interface HeaderProps {
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
  demoBalance: number;
  liveBalance: number;
  onResetDemo: () => void;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onOpenProfile: () => void;
  onOpenSignals: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  user?: UserAccount | null;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
  onOpenAuthPage?: (mode: 'login' | 'register') => void;
  onLogout?: () => void;
  onGoToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  accountType,
  setAccountType,
  demoBalance,
  liveBalance,
  onResetDemo,
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenProfile,
  onOpenSignals,
  notifications,
  onMarkNotificationRead,
  user,
  onOpenAuthModal,
  onOpenAuthPage,
  onLogout,
  onGoToHome,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentBalance = accountType === 'DEMO' ? demoBalance : liveBalance;

  const handleToggleSound = () => {
    const newVal = soundManager.toggle();
    setSoundEnabled(newVal);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header 
      id="main-platform-header"
      className="h-16 bg-[#0d121b]/80 backdrop-blur-md border-b border-white/10 px-5 flex items-center justify-between shrink-0 select-none z-30"
    >
      {/* Left: Logo & Platform Identity */}
      <div className="flex items-center gap-8">
        <div 
          onClick={onGoToHome}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Quotex Home"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            Q
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">QUOTEX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Promotional Bonus Pill Banner */}
      <div 
        onClick={onOpenDeposit}
        className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-lg shadow-black/40"
      >
        <span className="text-sm">🚀</span>
        <span>Get a <strong className="text-white font-bold">50% bonus</strong> on your deposit!</span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold tracking-wide uppercase shadow-sm">
          50%
        </span>
      </div>

      {/* Right: Controls, Account Selector & Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Audio Sound Toggle */}
        <button
          id="btn-toggle-sound"
          onClick={handleToggleSound}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          id="btn-toggle-fullscreen"
          onClick={handleToggleFullscreen}
          className="hidden sm:flex p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowAccountDropdown(false);
            }}
            className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d121b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-slate-400 font-mono-nums">{notifications.length} total</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onMarkNotificationRead(n.id)}
                    className={`p-3 text-xs space-y-1 transition-colors cursor-pointer ${
                      n.read ? 'bg-transparent text-slate-400' : 'bg-emerald-500/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono-nums">{n.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Account Selector Pill & Dropdown */}
        <div className="relative">
          <button
            id="btn-account-dropdown"
            onClick={() => {
              if (user) {
                setShowAccountDropdown(!showAccountDropdown);
                setShowNotifications(false);
              } else if (onOpenAuthModal) {
                onOpenAuthModal('login');
              } else if (onOpenAuthPage) {
                onOpenAuthPage('login');
              }
            }}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                {accountType === 'LIVE' ? 'LIVE BALANCE' : 'DEMO PRACTICE'}
              </div>
              <div className="text-base font-mono-nums font-bold text-white">
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            {user ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Lock className="w-3 h-3 text-slate-500" />
            )}
          </button>

          {showAccountDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0d121b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1.5">
              {/* Live Account Option (Only if logged in) */}
              {user && (
                <div
                  onClick={() => {
                    setAccountType('LIVE');
                    setShowAccountDropdown(false);
                  }}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    accountType === 'LIVE' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-bold text-white">Live Account</span>
                    </div>
                    <div className="text-xs font-mono-nums font-semibold text-slate-400 mt-0.5">
                      ${liveBalance.toFixed(2)}
                    </div>
                  </div>
                  {accountType === 'LIVE' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
              )}

              {/* Demo Account Option */}
              <div
                onClick={() => {
                  setAccountType('DEMO');
                  setShowAccountDropdown(false);
                }}
                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  accountType === 'DEMO' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-xs font-bold text-white">Demo Practice</span>
                  </div>
                  <div className="text-xs font-mono-nums font-semibold text-slate-400 mt-0.5">
                    ${demoBalance.toFixed(2)}
                  </div>
                </div>
                {accountType === 'DEMO' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>

              {/* Reset Demo Balance Button */}
              {accountType === 'DEMO' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetDemo();
                    setShowAccountDropdown(false);
                  }}
                  className="w-full mt-1 py-2 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-300 flex items-center justify-center space-x-1.5 transition-colors border border-white/5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Refill Demo ($10,000.00)</span>
                </button>
              )}

              {/* Auth links inside dropdown */}
              <div className="pt-2 mt-1 border-t border-white/10 grid grid-cols-2 gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAccountDropdown(false);
                    if (onOpenAuthPage) onOpenAuthPage('login');
                    else if (onOpenAuthModal) onOpenAuthModal('login');
                  }}
                  className="py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-slate-300 flex items-center justify-center space-x-1 transition-colors"
                >
                  <LogIn className="w-3 h-3 text-emerald-400" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAccountDropdown(false);
                    if (onOpenAuthPage) onOpenAuthPage('register');
                    else if (onOpenAuthModal) onOpenAuthModal('register');
                  }}
                  className="py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Deposit Button (Emerald with black text & glowing shadow) */}
        <button
          id="btn-header-deposit"
          onClick={onOpenDeposit}
          className="flex items-center space-x-1.5 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>DEPOSIT</span>
        </button>

        {/* Withdrawal Button */}
        <button
          id="btn-header-withdrawal"
          onClick={onOpenWithdrawal}
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-slate-200 text-xs font-semibold rounded-lg transition-all"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-slate-400" />
          <span>Withdrawal</span>
        </button>

        {/* User Profile Avatar or Log In */}
        {user ? (
          <div
            id="btn-user-profile"
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-sm flex items-center justify-center hover:border-emerald-400 cursor-pointer transition-all shadow-md"
            title={`Profile: ${user.email}`}
          >
            {user.name[0].toUpperCase()}
          </div>
        ) : (
          <button
            onClick={() => onOpenAuthModal ? onOpenAuthModal('login') : onOpenAuthPage?.('login')}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-lg transition-all"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
};
