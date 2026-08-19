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
  User, 
  CheckCircle, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Lock,
  Menu,
  X,
  TrendingUp,
  Trophy,
  ShoppingBag,
  History,
  BarChart3,
  CreditCard,
  LifeBuoy,
  ShieldCheck,
  Home
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
  onNavigatePage?: (page: string) => void;
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
  onOpenSignals: _onOpenSignals,
  notifications,
  onMarkNotificationRead,
  user,
  onOpenAuthModal,
  onOpenAuthPage,
  onLogout,
  onGoToHome,
  onNavigatePage,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const handleMobileNav = (page: string) => {
    soundManager.playClick();
    setShowMobileMenu(false);
    if (onNavigatePage) {
      onNavigatePage(page);
    }
  };

  return (
    <>
      <header 
        id="main-platform-header"
        className="h-14 sm:h-16 bg-[#0d121b]/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-5 flex items-center justify-between shrink-0 select-none z-30"
      >
        {/* Left: Mobile Menu Hamburger + Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 active:scale-95 transition-all"
            title="Open Mobile Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo & Brand Identity */}
          <div 
            onClick={onGoToHome}
            className="flex items-center gap-2 cursor-pointer group"
            title="NUX Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-base sm:text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">NUX</span>
            </div>
          </div>
        </div>

        {/* Center: Promotional Bonus Pill Banner (Desktop only) */}
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
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Audio Sound Toggle (Hidden on small mobile) */}
          <button
            id="btn-toggle-sound"
            onClick={handleToggleSound}
            className="hidden sm:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Fullscreen Toggle (Hidden on small mobile) */}
          <button
            id="btn-toggle-fullscreen"
            onClick={handleToggleFullscreen}
            className="hidden md:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
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
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0d121b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
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
              className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <div className="text-right">
                <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest font-semibold">
                  {accountType === 'LIVE' ? 'LIVE' : 'DEMO'}
                </div>
                <div className="text-xs sm:text-sm font-mono-nums font-bold text-white">
                  ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              {user ? (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              ) : (
                <Lock className="w-3 h-3 text-slate-500" />
              )}
            </button>

            {showAccountDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0d121b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1.5">
                {/* Live Account Option */}
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

          {/* Deposit Button (Emerald with black text) */}
          <button
            id="btn-header-deposit"
            onClick={onOpenDeposit}
            className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-5 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">DEPOSIT</span>
            <span className="sm:hidden">DEP</span>
          </button>

          {/* User Profile Avatar or Log In / Sign Up */}
          {user ? (
            <div
              id="btn-user-profile"
              onClick={onOpenProfile}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs sm:text-sm flex items-center justify-center hover:border-emerald-400 cursor-pointer transition-all shadow-md shrink-0"
              title={`Profile: ${user.email}`}
            >
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onOpenAuthModal ? onOpenAuthModal('login') : onOpenAuthPage?.('login')}
                className="hidden sm:inline-block px-2.5 sm:px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuthModal ? onOpenAuthModal('register') : onOpenAuthPage?.('register')}
                className="px-2.5 sm:px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-xl transition-all flex items-center space-x-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer Modal */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-72 max-w-[80vw] h-full bg-[#0d121b] border-r border-white/10 flex flex-col justify-between p-4 shadow-2xl animate-slide-right overflow-y-auto">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-lg shadow-md">
                    N
                  </div>
                  <span className="font-extrabold text-base text-white">NUX</span>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Identity Card */}
              {user && (
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-white text-xs truncate">{user.name || 'User'}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                  </div>
                </div>
              )}

              {/* Menu Links */}
              <div className="space-y-1 font-semibold text-xs text-slate-300">
                <button
                  onClick={() => handleMobileNav('trade')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Trading Terminal</span>
                </button>

                <button
                  onClick={() => handleMobileNav('tournaments')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Tournaments</span>
                </button>

                <button
                  onClick={() => handleMobileNav('market')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                  <span>Market & Bonuses</span>
                </button>

                <button
                  onClick={() => handleMobileNav('history')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <History className="w-4 h-4 text-blue-400" />
                  <span>Trade History</span>
                </button>

                <button
                  onClick={() => handleMobileNav('analytics')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => handleMobileNav('payments')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-pink-400" />
                  <span>Deposit & Payments</span>
                </button>

                <button
                  onClick={() => handleMobileNav('withdrawal')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <ArrowDownToLine className="w-4 h-4 text-cyan-400" />
                  <span>Withdrawal</span>
                </button>

                <button
                  onClick={() => handleMobileNav('my_account')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-slate-300" />
                  <span>My Account</span>
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleMobileNav('admin')}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  if (onGoToHome) onGoToHome();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold"
              >
                <Home className="w-4 h-4" />
                <span>Homepage</span>
              </button>

              {user && onLogout && (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
