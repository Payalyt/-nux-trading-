import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Asset, 
  Candle, 
  Trade, 
  AccountType, 
  ChartType, 
  Timeframe, 
  IndicatorConfig, 
  NotificationItem,
  UserAccount 
} from './types/trading';
import { 
  INITIAL_ASSETS, 
  generateInitialCandles, 
  simulateNextTick 
} from './utils/marketData';
import { soundManager } from './utils/audio';
import confetti from 'canvas-confetti';
import { FirebaseService } from './utils/firebaseSync';

// Components
import { Header } from './components/Header';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { SentimentMeter } from './components/SentimentMeter';
import { AssetTabBar } from './components/AssetTabBar';
import { TradingChart } from './components/TradingChart';
import { TradeExecutionPanel } from './components/TradeExecutionPanel';
import { SettlementToast } from './components/SettlementToast';

// Modals
import { AssetSelectorModal } from './components/AssetSelectorModal';
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawalModal } from './components/modals/WithdrawalModal';
import { PairInfoModal } from './components/modals/PairInfoModal';
import { IndicatorSettingsModal } from './components/modals/IndicatorSettingsModal';
import { TournamentsModal } from './components/modals/TournamentsModal';
import { MarketStoreModal } from './components/modals/MarketStoreModal';
import { SignalsModal } from './components/modals/SignalsModal';
import { AccountProfileModal } from './components/modals/AccountProfileModal';
import { SupportModal } from './components/modals/SupportModal';
import { AuthModal } from './components/modals/AuthModal';

// Subpages
import { QuotexSubHeader, QuotexNavPage } from './components/pages/QuotexSubHeader';
import { WithdrawalPage } from './components/pages/WithdrawalPage';
import { MyAccountPage } from './components/pages/MyAccountPage';
import { MarketPage } from './components/pages/MarketPage';
import { TournamentsPage } from './components/pages/TournamentsPage';
import { PaymentsPage } from './components/pages/PaymentsPage';
import { TradesHistoryPage } from './components/pages/TradesHistoryPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { AuthPage } from './components/pages/AuthPage';
import { HomePage } from './components/pages/HomePage';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { usePWA } from './hooks/usePWA';
import { PWAFallbackToast } from './components/modals/PWAFallbackToast';
import { Download, X } from 'lucide-react';

export default function App() {
  const { promptInstall, isInstalled, fallbackInfo, dismissFallback, openInNewTab } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  // User Account Session (No auto-login without explicit register/login)
  const [user, setUser] = useState<UserAccount | null>(() => {
    localStorage.removeItem('qx_user_session');
    return null;
  });

  // 1. Assets State
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [openAssets, setOpenAssets] = useState<Asset[]>([
    INITIAL_ASSETS[0], // USD/JPY
    INITIAL_ASSETS[1], // EUR/USD
    INITIAL_ASSETS[3], // BTC/USD
    INITIAL_ASSETS[7], // APPLE (OTC)
  ]);
  const [activeAsset, setActiveAsset] = useState<Asset>(INITIAL_ASSETS[0]);

  // 2. Account & Balances State (persisted to localStorage)
  const [accountType, setAccountType] = useState<AccountType>(() => {
    return (localStorage.getItem('qx_account_type') as AccountType) || 'LIVE';
  });

  const [demoBalance, setDemoBalance] = useState<number>(() => {
    const saved = localStorage.getItem('qx_demo_balance');
    return saved !== null ? Number(saved) : 10000;
  });

  const [liveBalance, setLiveBalance] = useState<number>(() => {
    const saved = localStorage.getItem('qx_live_balance');
    return saved !== null ? Number(saved) : 0;
  });

  // Listen to Firebase User Profile for Real-time Balance Updates
  useEffect(() => {
    if (!user?.email) return;
    
    const unsubscribe = FirebaseService.listenToUser(user.email, (data) => {
      if (data) {
        if (typeof data.balance === 'number') {
          setLiveBalance(data.balance);
          localStorage.setItem('qx_live_balance', String(data.balance));
        }
        if (typeof data.demoBalance === 'number') {
          setDemoBalance(data.demoBalance);
          localStorage.setItem('qx_demo_balance', String(data.demoBalance));
        }
        
        // Also update user state if role, balanceLocked, or status changes
        setUser(prev => {
          if (!prev) return prev;
          const newLocked = data.balanceLocked !== undefined ? data.balanceLocked : prev.balanceLocked;
          const newRole = data.role || prev.role;
          const newStatus = data.accountStatus || prev.accountStatus;
          if (prev.balanceLocked !== newLocked || prev.role !== newRole || prev.accountStatus !== newStatus) {
            return {
              ...prev,
              balanceLocked: newLocked,
              role: newRole,
              accountStatus: newStatus
            };
          }
          return prev;
        });
        
        // Handle blocked status
        if (data.accountStatus === 'blocked') {
           setUser(null);
           localStorage.removeItem('qx_user_session');
           alert('Your account has been blocked by the administrator.');
           window.location.reload();
        }
      }
    });

    return () => unsubscribe();
  }, [user?.email]);

  useEffect(() => {
    localStorage.setItem('qx_account_type', accountType);
  }, [accountType]);

  useEffect(() => {
    localStorage.setItem('qx_demo_balance', String(demoBalance));
  }, [demoBalance]);

  useEffect(() => {
    localStorage.setItem('qx_live_balance', String(liveBalance));
  }, [liveBalance]);

  // 3. Trade Execution Parameters
  const [tradeDuration, setTradeDuration] = useState<number>(60); // 1 minute in seconds
  const [investment, setInvestment] = useState<number>(1); // $1 default stake
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [completedTrades, setCompletedTrades] = useState<Trade[]>([]);
  const [latestSettledTrade, setLatestSettledTrade] = useState<Trade | null>(null);

  // Global Platform Settings (Support, Banner, etc.)
  const [platformSettings, setPlatformSettings] = useState<any>(() => {
    const saved = localStorage.getItem('qx_support_settings');
    return saved ? JSON.parse(saved) : {
      platformName: 'NUX Trading Platform',
      noticeBanner: '🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad & Crypto!'
    };
  });

  // Listen to Global Settings from Firebase
  useEffect(() => {
    const unsubscribe = FirebaseService.listenToSettings((data) => {
      if (data) {
        setPlatformSettings(data);
        localStorage.setItem('qx_support_settings', JSON.stringify(data));
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Platform Name to Document Title
  useEffect(() => {
    document.title = platformSettings.platformName || 'NUX Trading Platform';
  }, [platformSettings.platformName]);

  // 4. Chart Settings
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [indicators, setIndicators] = useState<IndicatorConfig>({
    sma: { enabled: false, period: 20, color: '#f59e0b', lineWidth: 1.5 },
    ema: { enabled: false, period: 12, color: '#ec4899', lineWidth: 1.5 },
    bollinger: { enabled: false, period: 20, stdDev: 2, color: '#3b82f6' },
    rsi: { enabled: false, period: 14, color: '#a855f7', overbought: 70, oversold: 30 },
    macd: { enabled: false, fast: 12, slow: 26, signal: 9 },
  });

  // 5. Real-Time Candle Data Maps
  const [candlesMap, setCandlesMap] = useState<Record<string, Candle[]>>(() => {
    const initial: Record<string, Candle[]> = {};
    INITIAL_ASSETS.forEach((asset) => {
      initial[asset.id] = generateInitialCandles(asset, 120, 5000);
    });
    return initial;
  });

  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    INITIAL_ASSETS.forEach((asset) => {
      initial[asset.id] = asset.basePrice;
    });
    return initial;
  });

  const currentPricesRef = useRef(currentPrices);
  useEffect(() => {
    currentPricesRef.current = currentPrices;
  }, [currentPrices]);

  // Theme State (Dark vs Light)
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('qx_theme_mode') as 'dark' | 'light') || 'dark';
  });

  const handleToggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    localStorage.setItem('qx_theme_mode', nextTheme);
  };

  // 6. Navigation & Modals State
  const [currentView, setCurrentView] = useState<QuotexNavPage>('home');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('trade');
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isPairInfoOpen, setIsPairInfoOpen] = useState(false);
  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState(false);
  const [isTournamentsOpen, setIsTournamentsOpen] = useState(false);
  const [isMarketStoreOpen, setIsMarketStoreOpen] = useState(false);
  const [isSignalsOpen, setIsSignalsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleAuthSuccess = (userData: UserAccount) => {
    const isAdmin = userData.email?.toLowerCase() === 'rosul9552@gmail.com' || userData.role === 'admin';
    const finalUserData = {
      ...userData,
      role: isAdmin ? 'admin' : (userData.role || 'user')
    };

    setUser(finalUserData);
    localStorage.setItem('qx_user_session', JSON.stringify(finalUserData));

    // Save to local registered users store so admin panel sees all registered emails
    try {
      const existingRaw = localStorage.getItem('qx_registered_users');
      const existingUsers = existingRaw ? JSON.parse(existingRaw) : [];
      if (!existingUsers.some((u: any) => u.email?.toLowerCase() === finalUserData.email.toLowerCase())) {
        existingUsers.push(finalUserData);
        localStorage.setItem('qx_registered_users', JSON.stringify(existingUsers));
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    
    // If admin (rosul9552@gmail.com or role === 'admin'), route directly to the Admin Panel ('admin')
    // Otherwise route regular users to the trading account dashboard ('trade')
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('trade');
    }
    setIsAuthModalOpen(false);

    // Sync user data directly to Firebase Firestore
    FirebaseService.syncUser({
      username: finalUserData.email,
      email: finalUserData.email,
      fullName: finalUserData.name,
      phone: (finalUserData as any).phone || '',
      role: finalUserData.role,
      balance: liveBalance,
      demoBalance: demoBalance,
      accountStatus: 'active',
      verificationStatus: 'verified',
      createdAt: new Date().toISOString()
    });

    setNotifications((prev) => [
      {
        id: `auth-${Date.now()}`,
        title: 'Authentication Successful',
        message: `Welcome back, ${userData.name}! Logged in as ${userData.email}.`,
        time: 'Just now',
        type: 'success',
        read: false,
      },
      ...prev,
    ]);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qx_user_session');
    setCurrentView('home');
    soundManager.playClick();
    setNotifications((prev) => [
      {
        id: `logout-${Date.now()}`,
        title: 'Signed Out',
        message: 'You have logged out of your account. Continue with practice or log in again.',
        time: 'Just now',
        type: 'info',
        read: false,
      },
      ...prev,
    ]);
  };

  // 7. Notifications & Platform Controls
  const [platformControls, setPlatformControls] = useState<{
    siteTitle?: string;
    noticeBannerText?: string;
    showNoticeBanner?: boolean;
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
    tradingPayoutPercentage?: number;
    minTradeAmount?: number;
    maxTradeAmount?: number;
    defaultDemoBalance?: number;
  }>({
    siteTitle: 'Quotex Pro Web Trader',
    noticeBannerText: '🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad, USDT TRC-20 & Crypto!',
    showNoticeBanner: true,
    maintenanceMode: false,
    tradingPayoutPercentage: 87,
    minTradeAmount: 1,
    maxTradeAmount: 5000
  });

  useEffect(() => {
    // Fetch public settings from server
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data.platformControls) {
          setPlatformControls(prev => ({ ...prev, ...data.platformControls }));
        }
      })
      .catch(err => console.warn('Could not fetch public settings', err));
  }, []);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Welcome to Quotex',
      message: 'Your $10,000 demo practice account is active and ready for trading.',
      time: 'Just now',
      type: 'bonus',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Deposit Bonus 50%',
      message: 'Claim 50% extra on your first deposit with promo code PROMO50.',
      time: '1h ago',
      type: 'info',
      read: false,
    },
  ]);

  // Current active candles & price
  const activeCandles = useMemo(() => {
    return candlesMap[activeAsset.id] || [];
  }, [candlesMap, activeAsset.id]);

  const activeCurrentPrice = useMemo(() => {
    return currentPrices[activeAsset.id] || activeAsset.basePrice;
  }, [currentPrices, activeAsset.id, activeAsset.basePrice]);

  // Dynamic Market Sentiment Ratio Calculation
  const sentiment = useMemo(() => {
    const last10 = activeCandles.slice(-10);
    if (last10.length === 0) return { bull: 97, bear: 3 };
    const bullishCount = last10.filter((c) => c.close >= c.open).length;
    const baseBull = Math.round((bullishCount / last10.length) * 100);
    const clampedBull = Math.max(55, Math.min(97, baseBull + 30));
    return {
      bull: clampedBull,
      bear: 100 - clampedBull,
    };
  }, [activeCandles]);

  // Timeframe to milliseconds mapping
  const timeframeMs = useMemo(() => {
    switch (timeframe) {
      case '5s': return 5000;
      case '15s': return 15000;
      case '30s': return 30000;
      case '1m': return 60000;
      case '2m': return 120000;
      case '5m': return 300000;
      case '15m': return 900000;
      case '1h': return 3600000;
      default: return 5000;
    }
  }, [timeframe]);

  // 8. Live High-Frequency Price Tick Loop & Trade Expiration Settlement
  useEffect(() => {
    const tickInterval = setInterval(() => {
      const now = Date.now();

      // 8a. Update price ticks for all open assets
      setCandlesMap((prevMap) => {
        const nextMap = { ...prevMap };

        openAssets.forEach((asset) => {
          const assetCandles = prevMap[asset.id] || [];
          if (assetCandles.length > 0) {
            const last = assetCandles[assetCandles.length - 1];
            const { updatedCandles, currentPrice } = simulateNextTick(last, asset, timeframeMs);
            nextMap[asset.id] = updatedCandles(assetCandles);
            
            // update current price state
            setCurrentPrices((prevPrices) => ({
              ...prevPrices,
              [asset.id]: currentPrice,
            }));
          }
        });

        return nextMap;
      });

      // 8b. Check and Settle Active Trades
      setActiveTrades((prevActive) => {
        const remaining: Trade[] = [];
        const expiring: Trade[] = [];

        prevActive.forEach((trade) => {
          if (now >= trade.expiryTime) {
            expiring.push(trade);
          } else {
            remaining.push(trade);
          }
        });

        if (expiring.length > 0) {
          expiring.forEach((trade) => {
            const finalPrice = currentPricesRef.current[trade.assetId] || trade.openPrice;
            const isWon =
              (trade.type === 'CALL' && finalPrice > trade.openPrice) ||
              (trade.type === 'PUT' && finalPrice < trade.openPrice);

            const status = isWon ? 'WON' : 'LOST';
            const returnAmount = isWon ? trade.amount * (1 + trade.payoutRate) : 0;

            const settledTrade: Trade = {
              ...trade,
              closePrice: finalPrice,
              status,
              returnAmount,
            };

            // Play sound and add confetti on win
            if (isWon) {
              soundManager.playWin();
              soundManager.speak(`Trade won on ${trade.assetSymbol}. You earned ${(returnAmount).toFixed(0)} dollars.`);
              try {
                confetti({
                  particleCount: 75,
                  spread: 60,
                  origin: { y: 0.65 },
                });
              } catch {}

              // Credit account balance
              if (trade.accountType === 'DEMO') {
                setDemoBalance((b) => b + returnAmount);
              } else {
                setLiveBalance((b) => b + returnAmount);
              }
            } else {
              soundManager.playLoss();
              soundManager.speak(`Trade closed on ${trade.assetSymbol}.`);
            }

            // Record in completed trades and sync with Firebase Firestore
            setCompletedTrades((prev) => [settledTrade, ...prev]);
            setLatestSettledTrade(settledTrade);
            FirebaseService.syncTrade({
              ...settledTrade,
              userEmail: user?.email || 'guest@demo.trade',
              userName: user?.name || 'Trader',
              resolvedAt: new Date().toISOString()
            });
          });
        }

        return remaining;
      });
    }, 450);

    return () => clearInterval(tickInterval);
  }, [openAssets, timeframeMs]);

  // 9. Trade Execution Handler
  const handlePlaceTrade = (type: 'CALL' | 'PUT') => {
    if (user?.balanceLocked) {
      soundManager.playLoss();
      alert('Your account balance is locked by the administrator. Trading and withdrawals are restricted.');
      return;
    }

    const currentBalance = accountType === 'DEMO' ? demoBalance : liveBalance;

    if (currentBalance < investment) {
      soundManager.playLoss();
      if (accountType === 'DEMO') {
        alert('Insufficient practice balance! Click Refill Demo ($10,000) in the header.');
      } else {
        setIsDepositOpen(true);
      }
      return;
    }

    // Deduct stake amount immediately
    if (accountType === 'DEMO') {
      setDemoBalance((b) => Math.max(0, b - investment));
    } else {
      setLiveBalance((b) => Math.max(0, b - investment));
    }

    soundManager.playTradePlaced();
    soundManager.speak(`${type === 'CALL' ? 'Up' : 'Down'} trade placed on ${activeAsset.symbol} with ${investment} dollars.`);

    const now = Date.now();
    const newTrade: Trade = {
      id: 'trade-' + Math.random().toString(36).substring(2, 9),
      assetId: activeAsset.id,
      assetSymbol: activeAsset.symbol,
      type,
      amount: investment,
      openPrice: activeCurrentPrice,
      payoutRate: activeAsset.payout / 100,
      openTime: now,
      durationSeconds: tradeDuration,
      expiryTime: now + tradeDuration * 1000,
      status: 'ACTIVE',
      accountType,
    };

    setActiveTrades((prev) => [newTrade, ...prev]);
  };

  // Early Sell Handler
  const handleSellEarly = (tradeId: string) => {
    const trade = activeTrades.find((t) => t.id === tradeId);
    if (!trade) return;

    const isProfitable =
      (trade.type === 'CALL' && activeCurrentPrice > trade.openPrice) ||
      (trade.type === 'PUT' && activeCurrentPrice < trade.openPrice);

    const earlyReturn = isProfitable ? trade.amount * 0.9 : trade.amount * 0.25;

    soundManager.playClick();

    if (trade.accountType === 'DEMO') {
      setDemoBalance((b) => b + earlyReturn);
    } else {
      setLiveBalance((b) => b + earlyReturn);
    }

    const soldTrade: Trade = {
      ...trade,
      closePrice: activeCurrentPrice,
      status: isProfitable ? 'WON' : 'LOST',
      returnAmount: earlyReturn,
    };

    setActiveTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setCompletedTrades((prev) => [soldTrade, ...prev]);
    setLatestSettledTrade(soldTrade);
  };

  // Reset Demo Balance
  const handleResetDemo = () => {
    soundManager.playWin();
    setDemoBalance(10000);
  };

  const handleChangeDemoBalance = (amount: number) => {
    setDemoBalance(amount);
    if (user?.email) {
      FirebaseService.updateUserBalance(user.email, amount, 'demo');
    }
  };

  const handleChangeLiveBalance = (amount: number) => {
    setLiveBalance(amount);
    if (user?.email) {
      FirebaseService.updateUserBalance(user.email, amount, 'live');
    }
  };

  // Handle Deposit Success
  const handleDepositSuccess = (amount: number) => {
    setNotifications((prev) => [
      {
        id: 'dep-' + Date.now(),
        title: 'Deposit Request Pending',
        message: `Your deposit request for $${amount.toFixed(2)} has been submitted and is awaiting admin approval.`,
        time: 'Just now',
        type: 'info',
        read: false,
      },
      ...prev,
    ]);
  };

  // Handle Withdrawal Success
  const handleWithdrawSuccess = (amount: number) => {
    // Note: Deduct amount immediately, refund if rejected by admin
    const newBal = Math.max(0, liveBalance - amount);
    setLiveBalance(newBal);

    if (user?.email) {
      FirebaseService.updateUserBalance(user.email, newBal, 'live');
    }

    setNotifications((prev) => [
      {
        id: 'wth-' + Date.now(),
        title: 'Withdrawal Request Pending',
        message: `Your withdrawal request for $${amount.toFixed(2)} has been submitted and is awaiting admin approval.`,
        time: 'Just now',
        type: 'info',
        read: false,
      },
      ...prev,
    ]);
  };

  // Asset Tab Switching & Opening
  const handleSelectAsset = (asset: Asset) => {
    soundManager.playClick();
    if (!openAssets.some((a) => a.id === asset.id)) {
      setOpenAssets((prev) => [...prev, asset]);
    }
    setActiveAsset(asset);
  };

  const handleCloseAssetTab = (assetId: string) => {
    if (openAssets.length <= 1) return;
    const remaining = openAssets.filter((a) => a.id !== assetId);
    setOpenAssets(remaining);
    if (activeAsset.id === assetId) {
      setActiveAsset(remaining[0]);
    }
  };

  const handleToggleFavorite = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, isFavorite: !a.isFavorite } : a))
    );
  };

  // Handle AI Signal Execution
  const handleApplySignal = (asset: Asset, direction: 'CALL' | 'PUT', durationSeconds: number) => {
    handleSelectAsset(asset);
    setTradeDuration(durationSeconds);
    setTimeout(() => {
      handlePlaceTrade(direction);
    }, 200);
  };

  return (
    <div 
      id="quotex-trading-application"
      className={`flex flex-col h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] transition-colors duration-200 overflow-hidden font-sans select-none ${
        themeMode === 'light' ? 'bg-[#f4f6f9] text-slate-900 light-theme' : 'bg-[#0a0d14] text-slate-100 dark-theme'
      }`}
    >
      {/* Top Broadcast Notice Marquee Bar */}
      {platformSettings.showNoticeBanner !== false && platformSettings.noticeBanner && (
        <div className="bg-gradient-to-r from-emerald-600/90 via-cyan-600/90 to-blue-600/90 text-white text-[11px] font-bold py-1 px-4 flex items-center justify-between shadow-md z-40 border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2 truncate">
            <span className="px-1.5 py-0.2 rounded bg-black/40 text-[9px] font-black uppercase tracking-wider text-amber-300">ANNOUNCEMENT</span>
            <span className="truncate">{platformSettings.noticeBanner}</span>
          </div>
          <button 
            onClick={() => setPlatformSettings(prev => ({ ...prev, showNoticeBanner: false }))}
            className="text-white/80 hover:text-white text-xs ml-3 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && !isInstalled && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 flex items-center justify-between shadow-lg z-40 shrink-0 border-b border-emerald-500/20">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-1.5 bg-black/20 rounded-lg shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white">NUX Trading App is ready</span>
              <span className="text-[10px] text-emerald-100 font-medium hidden sm:block">Install it now for a faster experience & offline access!</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button 
              onClick={promptInstall}
              className="px-4 py-1.5 bg-white text-emerald-700 hover:bg-emerald-50 font-black rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              INSTALL APP
            </button>
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {currentView === 'home' ? (
        <HomePage
          onStartTrading={() => {
            if (!user) {
              setAuthModalMode('login');
              setCurrentView('auth');
            } else {
              setCurrentView('trade');
            }
          }}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setCurrentView('auth');
          }}
          onSelectAssetAndTrade={(assetId) => {
            if (!user) {
              setAuthModalMode('login');
              setCurrentView('auth');
              return;
            }
            const found = assets.find(
              (a) => a.id.toLowerCase() === assetId.toLowerCase() || a.symbol.toLowerCase().includes(assetId.toLowerCase())
            );
            if (found) {
              handleSelectAsset(found);
            }
            setCurrentView('trade');
          }}
          user={user}
          assets={assets}
        />
      ) : currentView === 'trade' && !user ? (
        <div className="flex flex-col h-full w-full bg-[#0a0d14]">
          <AuthPage
            initialMode="login"
            onAuthSuccess={handleAuthSuccess}
            onBackToTrade={() => setCurrentView('home')}
          />
        </div>
      ) : currentView === 'trade' ? (
        <>
          {/* 1. Top Navigation Bar */}
          <Header
            platformName={platformSettings.platformName}
            accountType={accountType}
            setAccountType={setAccountType}
            demoBalance={demoBalance}
            liveBalance={liveBalance}
            onResetDemo={handleResetDemo}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdrawal={() => setCurrentView('withdrawal')}
            onOpenProfile={() => setCurrentView('my_account')}
            onOpenSignals={() => setIsSignalsOpen(true)}
            notifications={notifications}
            onMarkNotificationRead={(id) =>
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
              )
            }
            user={user}
            onOpenAuthModal={(mode) => {
              setAuthModalMode(mode);
              setIsAuthModalOpen(true);
            }}
            onOpenAuthPage={(mode) => {
              setAuthModalMode(mode);
              setCurrentView('auth');
            }}
            onLogout={handleLogout}
            onGoToHome={() => setCurrentView('trade')}
            onNavigatePage={(page) => setCurrentView(page as any)}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
            onChangeDemoBalance={handleChangeDemoBalance}
            onChangeLiveBalance={handleChangeLiveBalance}
          />

          {/* 2. Main Middle Workspace: Sidebar + Sentiment + Chart Area + Execution Panel */}
          <div className="flex flex-col lg:flex-row flex-1 w-full overflow-hidden min-h-0">
            {/* Left Navigation Sidebar (Desktop only) */}
            <div className="hidden lg:flex shrink-0">
              <Sidebar
                activeTab={sidebarTab}
                setActiveTab={(tab) => {
                  setSidebarTab(tab);
                  if (tab === 'trade') setCurrentView('trade');
                }}
                onOpenSupport={() => setIsSupportOpen(true)}
                onOpenTournaments={() => setCurrentView('tournaments')}
                onOpenMarket={() => setCurrentView('market')}
                onOpenProfile={() => setCurrentView('my_account')}
                onOpenHelp={() => setIsSupportOpen(true)}
                onGoToHome={() => setCurrentView('trade')}
              />
            </div>

            {/* Vertical Sentiment Meter (Tablet & Desktop only) */}
            <div className="hidden md:flex shrink-0">
              <SentimentMeter
                bullishPercent={sentiment.bull}
                bearishPercent={sentiment.bear}
              />
            </div>

            {/* Center Workspace (Asset Tabs + Interactive Candlestick Chart) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#12161f] min-h-0">
              {/* Top Asset Tabs Bar */}
              <div className="shrink-0">
                <AssetTabBar
                  openAssets={openAssets}
                  activeAsset={activeAsset}
                  onSelectAsset={handleSelectAsset}
                  onCloseAssetTab={handleCloseAssetTab}
                  onOpenAssetSelector={() => setIsAssetSelectorOpen(true)}
                />
              </div>

              {/* Interactive Trading Chart Engine */}
              <div className="flex-1 min-h-0">
                <TradingChart
                  asset={activeAsset}
                  candles={activeCandles}
                  activeTrades={activeTrades}
                  currentPrice={activeCurrentPrice}
                  tradeDurationSeconds={tradeDuration}
                  chartType={chartType}
                  setChartType={setChartType}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                  indicators={indicators}
                  onOpenIndicatorsModal={() => setIsIndicatorsOpen(true)}
                  onOpenPairInfoModal={() => setIsPairInfoOpen(true)}
                  themeMode={themeMode}
                />
              </div>
            </div>

            {/* Right Trade Execution Panel (Responsive: Desktop right panel / Mobile bottom dock) */}
            <div className="shrink-0">
              <TradeExecutionPanel
                asset={activeAsset}
                currentPrice={activeCurrentPrice}
                balance={accountType === 'DEMO' ? demoBalance : liveBalance}
                accountType={accountType}
                tradeDuration={tradeDuration}
                setTradeDuration={setTradeDuration}
                investment={investment}
                setInvestment={setInvestment}
                onPlaceTrade={handlePlaceTrade}
                activeTrades={activeTrades}
                completedTrades={completedTrades}
                onSellEarly={handleSellEarly}
              />
            </div>
          </div>
        </>
      ) : (
        /* Subpages with Quotex SubHeader */
        <div className={`flex flex-col h-full w-full ${themeMode === 'light' ? 'bg-[#f4f6f9]' : 'bg-[#0a0d14]'}`}>
          {currentView !== 'auth' && currentView !== 'admin' && (
            <QuotexSubHeader
              platformName={platformSettings.platformName}
              currentPage={currentView}
              onSelectPage={(page) => setCurrentView(page)}
              accountType={accountType}
              demoBalance={demoBalance}
              liveBalance={liveBalance}
              onOpenDeposit={() => setIsDepositOpen(true)}
              onOpenWithdrawal={() => setCurrentView('withdrawal')}
              onBackToTrade={() => setCurrentView('trade')}
              user={user}
              onOpenAuth={() => setCurrentView('auth')}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
            />
          )}

          <div className="flex-1 flex overflow-hidden">
            {currentView === 'auth' && (
              <AuthPage
                initialMode={authModalMode}
                onAuthSuccess={handleAuthSuccess}
                onBackToTrade={() => setCurrentView('trade')}
              />
            )}
            {currentView === 'withdrawal' && (
              <WithdrawalPage
                liveBalance={liveBalance}
                onOpenDeposit={() => setIsDepositOpen(true)}
                onBackToTrade={() => setCurrentView('trade')}
                onWithdrawSuccess={handleWithdrawSuccess}
                userEmail={user?.email}
                balanceLocked={!!user?.balanceLocked}
              />
            )}
            {currentView === 'my_account' && (
              <MyAccountPage
                liveBalance={liveBalance}
                user={user}
                onLogout={handleLogout}
                onOpenAuth={() => setCurrentView('auth')}
              />
            )}
            {currentView === 'market' && (
              <MarketPage onBackToTrade={() => setCurrentView('trade')} />
            )}
            {currentView === 'tournaments' && (
              <TournamentsPage themeMode={themeMode} onBackToTrade={() => setCurrentView('trade')} />
            )}
            {currentView === 'payments' && (
              <PaymentsPage user={user} onBackToTrade={() => setCurrentView('trade')} />
            )}
            {currentView === 'trades' && (
              <TradesHistoryPage
                completedTrades={completedTrades}
                activeTrades={activeTrades}
                accountType={accountType}
              />
            )}
            {currentView === 'analytics' && (
              <AnalyticsPage
                completedTrades={completedTrades}
              />
            )}
            {currentView === 'admin' && (
              <AdminDashboard
                onBackToTrade={() => setCurrentView('trade')}
                currentUser={user}
              />
            )}
          </div>
        </div>
      )}

      {/* 3. Real-Time Trade Settlement Toast Notifications */}
      <SettlementToast
        trade={latestSettledTrade}
        onDismiss={() => setLatestSettledTrade(null)}
      />

      {/* 4. Modals & Drawers */}
      <AssetSelectorModal
        isOpen={isAssetSelectorOpen}
        onClose={() => setIsAssetSelectorOpen(false)}
        assets={assets}
        onSelectAsset={handleSelectAsset}
        onToggleFavorite={handleToggleFavorite}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDepositSuccess={handleDepositSuccess}
        userEmail={user?.email}
      />

      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        liveBalance={liveBalance}
        onWithdrawSuccess={handleWithdrawSuccess}
        userEmail={user?.email}
        balanceLocked={!!user?.balanceLocked}
      />

      <PairInfoModal
        isOpen={isPairInfoOpen}
        onClose={() => setIsPairInfoOpen(false)}
        asset={activeAsset}
      />

      <IndicatorSettingsModal
        isOpen={isIndicatorsOpen}
        onClose={() => setIsIndicatorsOpen(false)}
        indicators={indicators}
        setIndicators={setIndicators}
      />

      <TournamentsModal
        isOpen={isTournamentsOpen}
        onClose={() => setIsTournamentsOpen(false)}
      />

      <MarketStoreModal
        isOpen={isMarketStoreOpen}
        onClose={() => setIsMarketStoreOpen(false)}
      />

      <SignalsModal
        isOpen={isSignalsOpen}
        onClose={() => setIsSignalsOpen(false)}
        assets={assets}
        onApplySignal={handleApplySignal}
      />

      <AccountProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        accountType={accountType}
        demoBalance={demoBalance}
        liveBalance={liveBalance}
        completedTrades={completedTrades}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={(mode) => {
          setIsProfileOpen(false);
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <PWAFallbackToast
        fallbackInfo={fallbackInfo}
        onDismiss={dismissFallback}
        onOpenDefaultBrowser={openInNewTab}
      />
    </div>
  );
}
