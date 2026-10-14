import React, { useState, useEffect } from 'react';
import { UserAccount, CentralCandleControl, CandleDirection, CandleIntensity, UserCandleOverride } from '../../types/trading';
import { FirebaseService } from '../../utils/firebaseSync';
import { SiteLogo } from '../common/SiteLogo';
import { get8DigitId, isValid8DigitId, generate8DigitId } from '../../utils/userId';
import { 
  Users, 
  ArrowLeft, 
  Shield, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  Wallet,
  Search,
  Check,
  X,
  Lock,
  Unlock,
  Ban,
  UserCheck,
  PlusCircle,
  MinusCircle,
  Gift,
  Edit3,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Radio,
  Zap,
  Sparkles,
  Copy,
  CheckCircle2,
  Filter,
  Sliders,
  Flame,
  RotateCcw
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToTrade: () => void;
  currentUser?: UserAccount | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToTrade,
  currentUser: _currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'settings' | 'gateways' | 'kyc' | 'graph'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Telegram & Support Settings
  const [supportSettings, setSupportSettings] = useState<any>(() => {
    const saved = localStorage.getItem('qx_support_settings');
    return saved ? JSON.parse(saved) : {
      telegramUrl: 'https://t.me/Quotex_Support_BD',
      whatsappNumber: '+8801700000000',
      email: 'support@nux-trading.com',
      noticeBanner: '🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad & Crypto!',
      platformName: 'NUX Trading Platform',
      depositBonus: 50
    };
  });

  // Graph Control & Manipulation State
  const [graphControls, setGraphControls] = useState<any>(() => {
    const saved = localStorage.getItem('qx_graph_controls');
    return saved ? JSON.parse(saved) : {
      globalMode: 'normal', // 'normal' | 'force_win' | 'force_loss' | 'bull_trend' | 'bear_trend'
      winRatePercent: 70,
      userOverrides: {}, // email -> 'always_win' | 'always_lose' | 'normal'
      spikeSignal: null
    };
  });
  
  // Central Candle Movement Control (Admin Driven - Realtime Synced across All Devices)
  const [centralCandleControl, setCentralCandleControl] = useState<CentralCandleControl>(() => {
    const saved = localStorage.getItem('qx_central_candle_control');
    return saved ? JSON.parse(saved) : {
      direction: 'NORMAL',
      intensity: 'medium',
      targetAsset: 'all',
      updatedAt: Date.now()
    };
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Individual User Candlestick Manipulation & Search States
  const [candleUserSearch, setCandleUserSearch] = useState('');
  const [candleUserFilter, setCandleUserFilter] = useState<'all' | 'custom_candle' | 'up' | 'down' | 'win' | 'lose'>('all');
  const [candleUserLimit, setCandleUserLimit] = useState<'10' | '25' | '50' | 'all'>('all');
  const [editingUserCandle, setEditingUserCandle] = useState<any | null>(null);

  // User 8-Digit ID Management State
  const [customIdInput, setCustomIdInput] = useState('');
  const [customIdError, setCustomIdError] = useState('');
  const [editingUserIdUser, setEditingUserIdUser] = useState<any | null>(null);
  const [quickIdInput, setQuickIdInput] = useState('');
  const [quickIdError, setQuickIdError] = useState('');

  // Modal for advanced user balance/status management
  const [managingUser, setManagingUser] = useState<any | null>(null);
  const [customBalanceInput, setCustomBalanceInput] = useState('');
  const [bonusInput, setBonusInput] = useState('');

  // Gateway management state
  const [editingGatewayIndex, setEditingGatewayIndex] = useState<number | null>(null);
  const [gatewayForm, setGatewayForm] = useState<any>({});

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await FirebaseService.fetchUsers();
      const fetchedTx = await FirebaseService.fetchTransactions();
      const fetchedGateways = await FirebaseService.fetchGateways();
      
      // Merge Firestore users with local registered users
      let combinedUsers = [...fetchedUsers];
      try {
        const localRaw = localStorage.getItem('qx_registered_users');
        const localList = localRaw ? JSON.parse(localRaw) : [];
        localList.forEach((lu: any) => {
          const emailVal = (lu.email || '').toLowerCase();
          if (emailVal && !combinedUsers.some((u: any) => (u.email || u.username || '').toLowerCase() === emailVal)) {
            combinedUsers.push({
              id: emailVal.replace(/[^a-zA-Z0-9_-]/g, '_'),
              email: emailVal,
              username: emailVal,
              fullName: lu.name || emailVal.split('@')[0],
              role: lu.role || 'user',
              balance: 0,
              demoBalance: 10000,
              accountStatus: 'active',
              verificationStatus: 'verified',
              createdAt: new Date().toISOString()
            });
          }
        });
      } catch (e) {
        console.warn('Local users merge error:', e);
      }

      setUsers(combinedUsers);
      setTransactions(fetchedTx);
      
      if (fetchedGateways && fetchedGateways.length > 0) {
        setGateways(fetchedGateways);
      } else {
        // Fallback default gateways if empty
        setGateways([
          {
            id: 'bkash',
            name: 'bKash (BD)',
            category: 'mobile_banking',
            icon: 'https://i.postimg.cc/MZNd4Pjq/55.png',
            active: true,
            sendMoneyNumber: '01700000001',
            merchantNumber: '01700000002',
            cashOutNumber: '01700000003',
            instruction: 'Send money to the given bKash number and enter your TrxID.',
            minDeposit: 10,
            maxDeposit: 1000
          },
          {
            id: 'nagad',
            name: 'Nagad (BD)',
            category: 'mobile_banking',
            icon: 'https://i.postimg.cc/QtxT0K9p/images-2-removebg-preview.png',
            active: true,
            sendMoneyNumber: '01700000001',
            merchantNumber: '01700000002',
            cashOutNumber: '01700000003',
            instruction: 'Send money to the given Nagad number and enter your TrxID.',
            minDeposit: 10,
            maxDeposit: 1000
          },
          {
            id: 'rocket',
            name: 'DBBL Rocket (BD)',
            category: 'mobile_banking',
            icon: 'https://i.postimg.cc/85zP3G4c/rocket.png',
            active: true,
            sendMoneyNumber: '01700000004-9',
            merchantNumber: '01700000005-9',
            cashOutNumber: '',
            instruction: 'Send money to Rocket wallet and submit Transaction ID.',
            minDeposit: 10,
            maxDeposit: 1000
          },
          {
            id: 'upay',
            name: 'Upay (BD)',
            category: 'mobile_banking',
            icon: 'https://i.postimg.cc/bv2KjJ9g/upay.png',
            active: true,
            sendMoneyNumber: '01700000006',
            merchantNumber: '',
            cashOutNumber: '',
            instruction: 'Transfer to Upay number and enter TrxID.',
            minDeposit: 10,
            maxDeposit: 1000
          },
          {
            id: 'usdt',
            name: 'Tether USDT (TRC20)',
            category: 'crypto',
            icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
            active: true,
            sendMoneyNumber: 'T9xR2yZ...WalletAddressTRC20',
            merchantNumber: '',
            cashOutNumber: '',
            instruction: 'Send TRC20 USDT to wallet address and provide Hash/TxID.',
            minDeposit: 10,
            maxDeposit: 50000
          },
          {
            id: 'bank',
            name: 'Bank Transfer (BD/Global)',
            category: 'bank',
            icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
            active: true,
            sendMoneyNumber: 'A/C: 1234567890 (NUX Trading Ltd)',
            merchantNumber: '',
            cashOutNumber: '',
            instruction: 'Deposit to company bank account and upload reference receipt.',
            minDeposit: 50,
            maxDeposit: 100000
          },
          {
            id: 'perfect_money',
            name: 'Perfect Money',
            category: 'e_wallet',
            icon: 'https://perfectmoney.is/img/logo.png',
            active: true,
            sendMoneyNumber: 'U12345678',
            merchantNumber: '',
            cashOutNumber: '',
            instruction: 'Send USD to Perfect Money Account U12345678.',
            minDeposit: 10,
            maxDeposit: 10000
          }
        ]);
      }
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Realtime subscription to Central Candle Control from Firestore
  useEffect(() => {
    const unsubscribe = FirebaseService.listenToCandleControl((ctrl) => {
      if (ctrl) {
        setCentralCandleControl(ctrl);
        localStorage.setItem('qx_central_candle_control', JSON.stringify(ctrl));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveUserManagement = async () => {
    if (!managingUser) return;
    try {
      const email = managingUser.email;
      const newBal = customBalanceInput !== '' ? parseFloat(customBalanceInput) : Number(managingUser.balance || 0);
      const newBonus = bonusInput !== '' ? parseFloat(bonusInput) : Number(managingUser.bonus || 0);

      if (customIdInput && !isValid8DigitId(customIdInput.trim())) {
        setCustomIdError('User ID must be exactly 8 numeric digits (e.g. 84920153)');
        return;
      }
      setCustomIdError('');

      const assignedNumericId = (customIdInput && isValid8DigitId(customIdInput.trim()))
        ? customIdInput.trim()
        : get8DigitId(managingUser);

      const updatedData = {
        ...managingUser,
        id: assignedNumericId,
        numericId: assignedNumericId,
        balance: isNaN(newBal) ? Number(managingUser.balance || 0) : newBal,
        bonus: isNaN(newBonus) ? Number(managingUser.bonus || 0) : newBonus,
        balanceUpdatedAt: Date.now(),
        forceBalance: true,
        lastUpdated: new Date().toISOString()
      };

      await FirebaseService.syncUser(updatedData);
      if (customIdInput && isValid8DigitId(customIdInput.trim())) {
        await FirebaseService.updateUserNumericId(email, assignedNumericId);
      }

      setActionMessage(`Successfully updated profile & ID (${assignedNumericId}) for ${email}`);
      setManagingUser(null);
      setCustomBalanceInput('');
      setBonusInput('');
      setCustomIdInput('');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to update user profile');
    }
  };

  // Quick 8-Digit ID Update handler
  const handleQuickSave8DigitId = async (userToEdit: any, newId: string) => {
    const trimmed = newId.trim();
    if (!isValid8DigitId(trimmed)) {
      setQuickIdError('User ID must be exactly 8 numeric digits (e.g. 84920153)');
      return;
    }
    setQuickIdError('');
    const email = (userToEdit.email || userToEdit.username || '').toLowerCase();
    const ok = await FirebaseService.updateUserNumericId(email, trimmed);
    if (ok) {
      setUsers(prev => prev.map(u => {
        const uEmail = (u.email || u.username || '').toLowerCase();
        if (uEmail === email) {
          return { ...u, numericId: trimmed, id: trimmed };
        }
        return u;
      }));
      setActionMessage(`User ${email} 8-digit ID successfully updated to: ${trimmed}`);
      setTimeout(() => setActionMessage(''), 4000);
      setEditingUserIdUser(null);
    } else {
      alert('Failed to update 8-digit user ID in Firestore.');
    }
  };

  // Realtime Central Candle Control Broadcaster (Changes affect all user devices simultaneously)
  const handleBroadcastCandleDirection = async (
    direction: CandleDirection, 
    customIntensity?: CandleIntensity,
    customAsset?: string
  ) => {
    setIsBroadcasting(true);
    const updatedControl: CentralCandleControl = {
      ...centralCandleControl,
      direction,
      intensity: customIntensity || centralCandleControl.intensity || 'medium',
      targetAsset: customAsset || centralCandleControl.targetAsset || 'all',
      updatedAt: Date.now(),
      updatedBy: _currentUser?.email || 'Admin',
      spikeTimestamp: (direction === 'SPIKE_UP' || direction === 'SPIKE_DOWN') ? Date.now() : undefined
    };

    setCentralCandleControl(updatedControl);
    localStorage.setItem('qx_central_candle_control', JSON.stringify(updatedControl));
    const ok = await FirebaseService.updateCandleControl(updatedControl);
    setIsBroadcasting(false);

    if (ok) {
      if (direction === 'UP') {
        setActionMessage('🟢 FORCE UP Active: All connected users now see continuous bullish green candles!');
      } else if (direction === 'DOWN') {
        setActionMessage('🔴 FORCE DOWN Active: All connected users now see continuous bearish red candles!');
      } else if (direction === 'NORMAL') {
        setActionMessage('⚖️ NORMAL MARKET Active: Standard organic market algorithm restored across all screens.');
      } else if (direction === 'SPIKE_UP') {
        setActionMessage('🚀 Bullish Spike (+2.5%) broadcasted to all user screens in real time!');
      } else if (direction === 'SPIKE_DOWN') {
        setActionMessage('💥 Bearish Drop (-2.5%) broadcasted to all user screens in real time!');
      }
      setTimeout(() => setActionMessage(''), 5000);
    } else {
      alert('Failed to broadcast candle control to Firestore. Please check internet connection.');
    }
  };

  // Set candle direction, outcome, or reset individually for a single trader
  const handleSetUserCandleOverride = async (
    userToUpdate: any,
    overridePatch: {
      direction?: CandleDirection;
      outcome?: 'always_win' | 'always_lose' | 'normal';
      intensity?: CandleIntensity;
    } | null
  ) => {
    const emailKey = (userToUpdate.email || userToUpdate.username || '').toLowerCase();
    const idKey = userToUpdate.numericId || userToUpdate.id || get8DigitId(userToUpdate);
    const currentOverrides = { ...(centralCandleControl.userCandleOverrides || {}) };

    if (overridePatch === null) {
      delete currentOverrides[emailKey];
      if (idKey) delete currentOverrides[idKey];
    } else {
      const existing = currentOverrides[emailKey] || {};
      const updatedOverride: UserCandleOverride = {
        ...existing,
        ...overridePatch,
        updatedAt: Date.now()
      };
      currentOverrides[emailKey] = updatedOverride;
      if (idKey) {
        currentOverrides[idKey] = updatedOverride;
      }
    }

    const updatedControl: CentralCandleControl = {
      ...centralCandleControl,
      userCandleOverrides: currentOverrides,
      updatedAt: Date.now(),
      updatedBy: _currentUser?.email || 'Admin'
    };

    setCentralCandleControl(updatedControl);
    localStorage.setItem('qx_central_candle_control', JSON.stringify(updatedControl));

    // Also sync graphControls for win/loss
    if (overridePatch?.outcome) {
      const updatedGraphControls = {
        ...graphControls,
        userOverrides: {
          ...(graphControls.userOverrides || {}),
          [emailKey]: overridePatch.outcome
        }
      };
      setGraphControls(updatedGraphControls);
      localStorage.setItem('qx_graph_controls', JSON.stringify(updatedGraphControls));
    }

    const ok = await FirebaseService.updateCandleControl(updatedControl);
    if (ok) {
      if (overridePatch === null) {
        setActionMessage(`Reset: User ${emailKey} restored to global market candle.`);
      } else if (overridePatch.direction === 'UP') {
        setActionMessage(`🟢 User ${emailKey} set to FORCE UP (Bullish Green Candles)!`);
      } else if (overridePatch.direction === 'DOWN') {
        setActionMessage(`🔴 User ${emailKey} set to FORCE DOWN (Bearish Red Candles)!`);
      } else if (overridePatch.direction === 'NORMAL') {
        setActionMessage(`⚖️ User ${emailKey} set to NORMAL Candles.`);
      } else if (overridePatch.direction === 'SPIKE_UP') {
        setActionMessage(`🚀 Injected Bull Spike (+2.5%) for ${emailKey}!`);
      } else if (overridePatch.direction === 'SPIKE_DOWN') {
        setActionMessage(`💥 Injected Bear Dump (-2.5%) for ${emailKey}!`);
      } else if (overridePatch.outcome) {
        setActionMessage(`Trade outcome for ${emailKey} set to: ${overridePatch.outcome}`);
      }
      setTimeout(() => setActionMessage(''), 4500);
    } else {
      alert('Failed to sync user candle control to Firestore.');
    }
  };

  // Reset all individual user candle overrides back to global broadcast
  const handleResetAllUserCandles = async () => {
    if (!window.confirm('Are you sure you want to reset all user candle overrides back to global market control?')) {
      return;
    }
    const updatedControl: CentralCandleControl = {
      ...centralCandleControl,
      userCandleOverrides: {},
      updatedAt: Date.now(),
      updatedBy: _currentUser?.email || 'Admin'
    };
    setCentralCandleControl(updatedControl);
    localStorage.setItem('qx_central_candle_control', JSON.stringify(updatedControl));

    const updatedGraphControls = {
      ...graphControls,
      userOverrides: {}
    };
    setGraphControls(updatedGraphControls);
    localStorage.setItem('qx_graph_controls', JSON.stringify(updatedGraphControls));

    const ok = await FirebaseService.updateCandleControl(updatedControl);
    if (ok) {
      setActionMessage('All user candle overrides successfully reset to Global Broadcast!');
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const handleToggleBlockUser = async (user: any) => {
    try {
      const newStatus = user.accountStatus === 'blocked' ? 'active' : 'blocked';
      await FirebaseService.syncUser({
        ...user,
        accountStatus: newStatus,
        forceBalance: true
      });
      setActionMessage(`User ${user.email} is now ${newStatus}`);
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleToggleLockBalance = async (user: any) => {
    try {
      const newLockState = !user.balanceLocked;
      await FirebaseService.syncUser({
        ...user,
        balanceLocked: newLockState,
        forceBalance: true
      });
      setActionMessage(`Balance for ${user.email} is now ${newLockState ? 'LOCKED (Withdrawal & Trading restricted)' : 'UNLOCKED'}`);
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to toggle balance lock');
    }
  };

  const handleApproveTransaction = async (tx: any) => {
    try {
      tx.status = 'approved';
      await FirebaseService.syncTransaction(tx);

      // If deposit or bonus, add to user balance in Firestore
      if ((tx.type === 'deposit' || tx.type === 'bonus') && tx.userId) {
        // Try finding user first from state, then directly from Firestore for 100% accuracy
        let targetUser = users.find(u => 
          (u.email || '').toLowerCase() === (tx.userId || '').toLowerCase() || 
          (u.id || '').toLowerCase() === (tx.userId || '').toLowerCase()
        );

        // Fetch directly from Firestore to ensure we have the most accurate and fresh data
        const freshUser = await FirebaseService.getUser(tx.userId);
        if (freshUser) {
          targetUser = freshUser;
        }

        if (targetUser) {
          const currentBal = Number(targetUser.balance || 0);
          const addedAmt = Number(tx.amount || 0);
          const bonusAmt = Number(tx.bonus || 0);
          const totalAdd = addedAmt + bonusAmt;
          
          const success = await FirebaseService.updateUserBalance(targetUser.email || tx.userId, currentBal + totalAdd, 'live');
          if (success) {
            console.log(`[Admin] Balance of $${totalAdd} added successfully to ${targetUser.email}`);
          } else {
            // Fallback: directly sync user object if updateUserBalance fails
            await FirebaseService.syncUser({
              ...targetUser,
              balance: currentBal + totalAdd,
              lastUpdated: new Date().toISOString()
            });
          }
        } else {
          // If the user document was never created in Firestore, let's create it now with the deposit balance!
          await FirebaseService.syncUser({
            username: tx.userId,
            email: tx.userId,
            fullName: tx.userId.split('@')[0],
            role: 'user',
            balance: Number(tx.amount || 0) + Number(tx.bonus || 0),
            demoBalance: 10000,
            accountStatus: 'active',
            verificationStatus: 'verified',
            createdAt: new Date().toISOString()
          });
          console.log(`[Admin] Created new user document in Firestore with approved deposit balance for ${tx.userId}`);
        }
      }

      setActionMessage(`Transaction ${tx.id} approved successfully!`);
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (tx: any) => {
    try {
      tx.status = 'rejected';
      await FirebaseService.syncTransaction(tx);
      
      // If withdrawal is rejected, refund the user balance
      if (tx.type === 'withdrawal' && tx.userId) {
        let targetUser = users.find(u => 
          (u.email || '').toLowerCase() === (tx.userId || '').toLowerCase() || 
          (u.id || '').toLowerCase() === (tx.userId || '').toLowerCase()
        );

        const freshUser = await FirebaseService.getUser(tx.userId);
        if (freshUser) {
          targetUser = freshUser;
        }

        if (targetUser) {
          const currentBal = Number(targetUser.balance || 0);
          const refundedAmt = Number(tx.amount || 0);
          
          const success = await FirebaseService.updateUserBalance(targetUser.email || tx.userId, currentBal + refundedAmt, 'live');
          if (!success) {
            await FirebaseService.syncUser({
              ...targetUser,
              balance: currentBal + refundedAmt,
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }

      setActionMessage(`Transaction ${tx.id} rejected.`);
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to reject transaction');
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const id8 = get8DigitId(u);
    return (
      (u.email || '').toLowerCase().includes(term) ||
      (u.fullName || '').toLowerCase().includes(term) ||
      (u.username || '').toLowerCase().includes(term) ||
      id8.includes(term)
    );
  });

  const filteredCandleUsers = users.filter(u => {
    const term = candleUserSearch.toLowerCase().trim();
    const id8 = get8DigitId(u);
    const emailVal = (u.email || u.username || '').toLowerCase();
    const nameVal = (u.fullName || '').toLowerCase();
    const matchesSearch = !term || emailVal.includes(term) || nameVal.includes(term) || id8.includes(term);
    if (!matchesSearch) return false;

    const userOverride = centralCandleControl.userCandleOverrides?.[emailVal] || 
                         centralCandleControl.userCandleOverrides?.[id8];
    const outcomeOverride = graphControls.userOverrides?.[emailVal];

    if (candleUserFilter === 'custom_candle') {
      return !!userOverride?.direction && userOverride.direction !== 'NORMAL';
    }
    if (candleUserFilter === 'up') {
      return userOverride?.direction === 'UP' || (centralCandleControl.direction === 'UP' && !userOverride?.direction);
    }
    if (candleUserFilter === 'down') {
      return userOverride?.direction === 'DOWN' || (centralCandleControl.direction === 'DOWN' && !userOverride?.direction);
    }
    if (candleUserFilter === 'win') {
      return userOverride?.outcome === 'always_win' || outcomeOverride === 'always_win';
    }
    if (candleUserFilter === 'lose') {
      return userOverride?.outcome === 'always_lose' || outcomeOverride === 'always_lose';
    }
    return true;
  });

  const displayedCandleUsers = candleUserLimit === 'all' 
    ? filteredCandleUsers 
    : filteredCandleUsers.slice(0, Number(candleUserLimit));

  // Candle Statistics
  const customCandleCount = Object.keys(centralCandleControl.userCandleOverrides || {}).filter(k => {
    const ov = centralCandleControl.userCandleOverrides?.[k];
    return ov?.direction && ov.direction !== 'NORMAL';
  }).length;

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] text-slate-100 overflow-y-auto select-none">
      {/* Admin Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0d121b] border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToTrade}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trading</span>
          </button>
          <div className="flex items-center space-x-2.5">
            <SiteLogo size="sm" showText={false} />
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Admin Master Control Panel</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Firebase Live
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  centralCandleControl.direction === 'UP' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  centralCandleControl.direction === 'DOWN' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  'bg-white/10 text-slate-300 border-white/10'
                }`}>
                  Candle: {centralCandleControl.direction}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Complete control: Central Candlestick Movement, 8-Digit User IDs, Balances & Transactions</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAdminData}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Firestore</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 px-4 sm:px-6 pt-4 border-b border-white/10 bg-[#0d121b]/50 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'users' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'graph' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {centralCandleControl.direction === 'UP' ? (
            <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : centralCandleControl.direction === 'DOWN' ? (
            <TrendingDown className="w-4 h-4 text-rose-400 animate-pulse" />
          ) : (
            <Radio className="w-4 h-4 text-amber-400" />
          )}
          <span>Candle & Market Control</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-black ${
            centralCandleControl.direction === 'UP' ? 'bg-emerald-500/20 text-emerald-300' :
            centralCandleControl.direction === 'DOWN' ? 'bg-rose-500/20 text-rose-300' :
            'bg-white/10 text-slate-300'
          }`}>
            {centralCandleControl.direction}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'transactions' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Transactions ({transactions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('gateways')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'gateways' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Gateways</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'settings' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Support & Links</span>
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'kyc' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>KYC Verification</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6">
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by 8-digit ID, email, name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#121824] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Total Firestore Users: <strong className="text-white font-mono">{users.length}</strong>
              </div>
            </div>

            <div className="bg-[#121824] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="p-4">User Email</th>
                      <th className="p-4">8-Digit ID (ইউনিক আইডি)</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Status / Lock</th>
                      <th className="p-4">Candle Mode</th>
                      <th className="p-4">Live Balance</th>
                      <th className="p-4">Bonus</th>
                      <th className="p-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          Loading Firestore users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, i) => {
                        const user8DigitId = get8DigitId(u);
                        const emailVal = (u.email || u.username || '').toLowerCase();
                        const userCandleOverride = centralCandleControl.userCandleOverrides?.[emailVal] || 
                                                   centralCandleControl.userCandleOverrides?.[user8DigitId];

                        return (
                          <tr key={u.id || i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-mono font-bold text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                                {(u.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-white text-xs truncate max-w-[180px]">{u.email}</div>
                                <div className="text-[10px] text-slate-500 font-sans">{u.role === 'admin' ? 'Administrator' : 'Standard Trader'}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider">
                                  #{user8DigitId}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingUserIdUser(u);
                                    setQuickIdInput(user8DigitId);
                                    setQuickIdError('');
                                  }}
                                  className="p-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                                  title="Edit 8-digit Unique ID"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-slate-300 font-semibold">{u.fullName || u.username || 'N/A'}</td>
                            <td className="p-4 space-x-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.accountStatus === 'blocked' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {u.accountStatus === 'blocked' ? 'Blocked' : 'Active'}
                              </span>
                              {u.balanceLocked && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Locked
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                {userCandleOverride?.direction === 'UP' ? (
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    🟢 UP
                                  </span>
                                ) : userCandleOverride?.direction === 'DOWN' ? (
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                    🔴 DOWN
                                  </span>
                                ) : userCandleOverride?.direction === 'SPIKE_UP' ? (
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black bg-teal-500/20 text-teal-300 border border-teal-500/40">
                                    🚀 SPIKE
                                  </span>
                                ) : userCandleOverride?.direction === 'SPIKE_DOWN' ? (
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black bg-orange-500/20 text-orange-300 border border-orange-500/40">
                                    💥 DUMP
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/5 text-slate-400 border border-white/10">
                                    🌐 Global ({centralCandleControl.direction})
                                  </span>
                                )}
                                <button
                                  onClick={() => setEditingUserCandle(u)}
                                  className="p-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-white/10 transition-all cursor-pointer"
                                  title="Change Candle for this User"
                                >
                                  <Sliders className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-extrabold text-emerald-400">
                              ${Number(u.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 font-mono text-amber-400">
                              +${Number(u.bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <button
                                onClick={() => setEditingUserCandle(u)}
                                className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                                title="Change Candle Movement for this User"
                              >
                                <Flame className="w-3.5 h-3.5" />
                                <span>Candle</span>
                              </button>
                              <button
                                onClick={() => {
                                  setManagingUser(u);
                                  setCustomBalanceInput(String(u.balance || 0));
                                  setBonusInput(String(u.bonus || 0));
                                  setCustomIdInput(user8DigitId);
                                  setCustomIdError('');
                                }}
                                className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                                title="Edit Balance, Bonus & 8-Digit ID"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Profile</span>
                              </button>
                              <button
                                onClick={() => handleToggleLockBalance(u)}
                                className={`px-2.5 py-1.5 border font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 ${
                                  u.balanceLocked ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                                }`}
                                title="Lock/Unlock Balance (Prevent Withdrawal)"
                              >
                                {u.balanceLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                <span>{u.balanceLocked ? 'Unlock' : 'Lock'}</span>
                              </button>
                              <button
                                onClick={() => handleToggleBlockUser(u)}
                                className={`px-2.5 py-1.5 border font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 ${
                                  u.accountStatus === 'blocked' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                }`}
                                title="Block or Unblock User"
                              >
                                {u.accountStatus === 'blocked' ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                <span>{u.accountStatus === 'blocked' ? 'Unblock' : 'Block'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Deposit & Withdrawal Requests</h2>
              <div className="text-xs text-slate-400">Total Requests: <strong className="text-white font-mono">{transactions.length}</strong></div>
            </div>

            <div className="bg-[#121824] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="p-4">Tx ID / Gateway</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">TrxID / Details</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No deposit or withdrawal requests found in Firestore yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx, i) => (
                        <tr key={tx.id || i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-mono font-bold text-white">{tx.id}</div>
                            <div className="text-[10px] text-slate-400 uppercase">{tx.gateway}</div>
                          </td>
                          <td className="p-4 font-semibold text-slate-300">{tx.userId}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-extrabold text-white">
                            ${Number(tx.amount || 0).toFixed(2)}
                            {Number(tx.bonus || 0) > 0 && <span className="text-amber-400 text-[10px] ml-1">(+${tx.bonus} bonus)</span>}
                          </td>
                          <td className="p-4 font-mono text-slate-400">
                            {tx.trxId || 'N/A'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              tx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              tx.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            }`}>
                              {tx.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {tx.status !== 'approved' && (
                              <button
                                onClick={() => handleApproveTransaction(tx)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Approve</span>
                              </button>
                            )}
                            {tx.status !== 'rejected' && (
                              <button
                                onClick={() => handleRejectTransaction(tx)}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-[#121824] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Platform Controls & Support Configuration</span>
              </h2>
              <p className="text-xs text-slate-400">Configure global platform options, deposit bonuses, and official Telegram customer support channel.</p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={supportSettings.platformName || 'NUX Trading Platform'}
                    onChange={(e) => setSupportSettings({ ...supportSettings, platformName: e.target.value })}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Telegram Support Channel / Username Link</label>
                  <input
                    type="text"
                    value={supportSettings.telegramUrl || ''}
                    onChange={(e) => setSupportSettings({ ...supportSettings, telegramUrl: e.target.value })}
                    placeholder="https://t.me/Quotex_Support_BD or @Quotex_Support_BD"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This Telegram link will be opened when users click 24/7 Support in app.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Customer Support Number</label>
                  <input
                    type="text"
                    value={supportSettings.whatsappNumber || ''}
                    onChange={(e) => setSupportSettings({ ...supportSettings, whatsappNumber: e.target.value })}
                    placeholder="+8801700000000"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Default Deposit Bonus (%)</label>
                  <input
                    type="number"
                    value={supportSettings.depositBonus || 50}
                    onChange={(e) => setSupportSettings({ ...supportSettings, depositBonus: Number(e.target.value) })}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Notice Banner Announcement</label>
                  <input
                    type="text"
                    value={supportSettings.noticeBanner || '🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad & Crypto!'}
                    onChange={(e) => setSupportSettings({ ...supportSettings, noticeBanner: e.target.value })}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={async () => {
                    localStorage.setItem('qx_support_settings', JSON.stringify(supportSettings));
                    const success = await FirebaseService.syncSettings(supportSettings);
                    if (success) {
                      setActionMessage('Platform & Telegram Support settings updated successfully!');
                      setTimeout(() => setActionMessage(''), 4000);
                    } else {
                      alert('Sync failed. Settings saved locally only.');
                    }
                  }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Save Settings & Sync Telegram
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Candle Movement & Market Controls Tab */}
        {activeTab === 'graph' && (
          <div className="space-y-6 max-w-4xl">
            {/* 1. Live Central Candlestick Movement Broadcast Station */}
            <div className="bg-[#121824] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </span>
                    <h2 className="text-sm font-black text-white tracking-wide">
                      Central Candlestick Movement Control (সেন্ট্রাল ক্যান্ডেল কন্ট্রোল)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    সকল ইউজারের ডিভাইসে ক্যান্ডেলের মুভমেন্ট (আপ/ডাউন) সেন্ট্রালি কন্ট্রোল করুন। এখানে পরিবর্তন করলে সবার ডিভাইসে একই ক্যান্ডেল মুভমেন্ট লাইভ দেখাবে।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border flex items-center gap-1.5 shadow-lg ${
                    centralCandleControl.direction === 'UP' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' :
                    centralCandleControl.direction === 'DOWN' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' :
                    centralCandleControl.direction === 'SPIKE_UP' ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' :
                    centralCandleControl.direction === 'SPIKE_DOWN' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50' :
                    'bg-white/10 text-slate-300 border-white/15'
                  }`}>
                    <span className="w-2 h-2 rounded-full animate-ping bg-current" />
                    <span>BROADCAST: {centralCandleControl.direction}</span>
                  </span>
                </div>
              </div>

              {/* Main Direction Control Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. FORCE UP CARD */}
                <div 
                  onClick={() => handleBroadcastCandleDirection('UP')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    centralCandleControl.direction === 'UP'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/50'
                      : 'bg-[#0a0e17] border-white/10 hover:border-emerald-500/50 hover:bg-emerald-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    {centralCandleControl.direction === 'UP' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-black">
                        ACTIVE NOW
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                    FORCE UP (আপ / বুলিশ)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    মার্কেট একটানা উপরের দিকে উঠবে এবং সকল ইউজারের ডিভাইসে ১০০% গ্রিন/বুলিশ ক্যান্ডেল তৈরি করবে।
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>ক্লিক করে আপ করুন</span>
                    <span className="text-lg">↗</span>
                  </div>
                </div>

                {/* 2. FORCE DOWN CARD */}
                <div 
                  onClick={() => handleBroadcastCandleDirection('DOWN')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    centralCandleControl.direction === 'DOWN'
                      ? 'bg-rose-950/40 border-rose-500 shadow-xl shadow-rose-500/20 ring-2 ring-rose-500/50'
                      : 'bg-[#0a0e17] border-white/10 hover:border-rose-500/50 hover:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    {centralCandleControl.direction === 'DOWN' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                        ACTIVE NOW
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-white group-hover:text-rose-300 transition-colors">
                    FORCE DOWN (ডাউন / বেয়ারিশ)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    মার্কেট একটানা নিচের দিকে নামবে এবং সকল ইউজারের ডিভাইসে ১০০% রেড/বেয়ারিশ ক্যান্ডেল তৈরি করবে।
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-rose-400">
                    <span>ক্লিক করে ডাউন করুন</span>
                    <span className="text-lg">↘</span>
                  </div>
                </div>

                {/* 3. NORMAL MARKET CARD */}
                <div 
                  onClick={() => handleBroadcastCandleDirection('NORMAL')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    centralCandleControl.direction === 'NORMAL'
                      ? 'bg-blue-950/40 border-blue-500 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/50'
                      : 'bg-[#0a0e17] border-white/10 hover:border-blue-500/50 hover:bg-blue-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    {centralCandleControl.direction === 'NORMAL' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-black">
                        ACTIVE NOW
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                    NORMAL (স্বাভাবিক মার্কেট)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    স্বাভাবিক অর্গানিক মার্কেট মুভমেন্ট। স্বাভাবিক অ্যালগরিদম অনুযায়ী প্রাকৃতিক ওঠানামা করবে।
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>স্বাভাবিক গতিতে রাখুন</span>
                    <span className="text-lg">⚖</span>
                  </div>
                </div>
              </div>

              {/* Movement Intensity and Asset Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                {/* Movement Intensity / Speed */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Candle Movement Intensity / গতি ও তীব্রতা
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'ধীর (Low)', mult: '0.75x' },
                      { id: 'medium', label: 'স্বাভাবিক (Med)', mult: '1.5x' },
                      { id: 'high', label: 'তীব্র (High)', mult: '2.6x' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleBroadcastCandleDirection(centralCandleControl.direction, item.id as CandleIntensity)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                          (centralCandleControl.intensity || 'medium') === item.id
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                            : 'bg-[#0a0e17] text-slate-300 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div>{item.label}</div>
                        <div className="text-[9px] opacity-75">{item.mult}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Asset Pair */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Target Pair Scope / অ্যাসেট পেয়ার
                  </label>
                  <select
                    value={centralCandleControl.targetAsset || 'all'}
                    onChange={(e) => handleBroadcastCandleDirection(centralCandleControl.direction, centralCandleControl.intensity, e.target.value)}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="all">🌐 All Currency & Crypto Pairs (সকল পেয়ারে কার্যকর)</option>
                    <option value="usdjpy">USD/JPY (US Dollar / Japanese Yen)</option>
                    <option value="eurusd">EUR/USD (Euro / US Dollar)</option>
                    <option value="gbpusd">GBP/USD (Great Britain Pound / US Dollar)</option>
                    <option value="btcusd">BTC/USD (Bitcoin / US Dollar)</option>
                    <option value="ethusd">ETH/USD (Ethereum / US Dollar)</option>
                    <option value="gold">GOLD (XAU/USD Spot)</option>
                    <option value="aapl_otc">APPLE (OTC)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Select "All" so every trader on any pair sees the synchronized movement.</p>
                </div>
              </div>

              {/* Instant Realtime Chart Spikes */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant Price Spike & Drop Injector (তাৎক্ষণিক স্পাইক / জাম্প)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Triggers immediately on all screens</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleBroadcastCandleDirection('SPIKE_UP')}
                    className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>🚀 Inject Immediate Bull Spike (+2.5%)</span>
                  </button>
                  <button
                    onClick={() => handleBroadcastCandleDirection('SPIKE_DOWN')}
                    className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/40 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2"
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>💥 Inject Immediate Bear Dump (-2.5%)</span>
                  </button>
                </div>
              </div>

              {/* Realtime Sync Status Note */}
              <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Firestore Channel: <strong className="text-slate-200">platform_settings/candle_control</strong></span>
                </div>
                <span>Last Updated: {new Date(centralCandleControl.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* 2. Global Trade Win/Loss Engine & Targeted User Overrides */}
            <div className="bg-[#121824] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Trade Settlement Win Rate & User Overrides</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control global trade expiry win/loss ratio and individual user target trade outcomes.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
                  Engine Active
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Target Global Win Rate: <span className="font-mono text-emerald-400 font-black">{graphControls.winRatePercent}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={graphControls.winRatePercent || 70}
                  onChange={(e) => {
                    const updated = { ...graphControls, winRatePercent: Number(e.target.value) };
                    setGraphControls(updated);
                    localStorage.setItem('qx_graph_controls', JSON.stringify(updated));
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0% (100% Trader Loss)</span>
                  <span>50% (Fair Odds)</span>
                  <span>100% (100% Trader Win)</span>
                </div>
              </div>

              {/* Individual User Candlestick Movement & Trade Outcome Control */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-emerald-400" />
                      <span>নিচের সকল ইউজারদের ক্যান্ডেল ও ট্রেড কন্ট্রোল (Individual User Candle Control)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      নিচের তালিকায় সকল ট্রেডার দৃশ্যমান। নির্দিষ্ট ইউজারের জন্য ক্যান্ডেল আপ (🟢 UP) বা ডাউন (🔴 DOWN) করুন, স্পাইক দিন অথবা উইন/লস নির্ধারণ করুন।
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleResetAllUserCandles}
                      className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="Reset all individual user candle overrides back to global broadcast"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All to Global (সবার ক্যান্ডেল রিসেট)</span>
                    </button>
                  </div>
                </div>

                {/* Quick Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-[#0a0e17] border border-white/10 rounded-xl">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Traders</div>
                    <div className="text-base font-black text-white font-mono">{users.length}</div>
                  </div>
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold">Custom Candle Active</div>
                    <div className="text-base font-black text-emerald-300 font-mono">{customCandleCount}</div>
                  </div>
                  <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl">
                    <div className="text-[10px] text-blue-400 uppercase font-semibold">Following Global</div>
                    <div className="text-base font-black text-blue-300 font-mono">{users.length - customCandleCount}</div>
                  </div>
                  <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl">
                    <div className="text-[10px] text-purple-400 uppercase font-semibold">Global Broadcast</div>
                    <div className="text-base font-black text-purple-300 font-mono">{centralCandleControl.direction}</div>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0a0e17] border border-white/10 p-3 rounded-2xl">
                  {/* Search input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by 8-Digit ID (#84920153), email or name..."
                      value={candleUserSearch}
                      onChange={(e) => setCandleUserSearch(e.target.value)}
                      className="w-full bg-[#121824] border border-white/10 rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    {candleUserSearch && (
                      <button
                        onClick={() => setCandleUserSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    {[
                      { id: 'all', label: `All (${users.length})` },
                      { id: 'custom_candle', label: `Custom Candle (${customCandleCount})` },
                      { id: 'up', label: '🟢 Forced UP' },
                      { id: 'down', label: '🔴 Forced DOWN' },
                      { id: 'win', label: '🏆 Always Win' },
                      { id: 'lose', label: '📉 Always Lose' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setCandleUserFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                          candleUserFilter === f.id
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow-md font-black'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* View Limit Selector */}
                  <div className="flex items-center gap-1 shrink-0 text-xs text-slate-400">
                    <span className="text-[10px] uppercase font-bold mr-1">View:</span>
                    {[
                      { id: '10', label: '10' },
                      { id: '25', label: '25' },
                      { id: '50', label: '50' },
                      { id: 'all', label: `All (${users.length})` },
                    ].map((lim) => (
                      <button
                        key={lim.id}
                        onClick={() => setCandleUserLimit(lim.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer border ${
                          candleUserLimit === lim.id
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {lim.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Users Candle Table */}
                <div className="bg-[#0a0e17] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">Trader Email & Info</th>
                          <th className="p-3.5">8-Digit ID</th>
                          <th className="p-3.5">Live Balance</th>
                          <th className="p-3.5">Active Candle Mode</th>
                          <th className="p-3.5 text-center">1-Click Candle Change (ক্যান্ডেল চেঞ্জ)</th>
                          <th className="p-3.5">Trade Outcome</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              Loading users list...
                            </td>
                          </tr>
                        ) : displayedCandleUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              No users found matching your search or filter.
                            </td>
                          </tr>
                        ) : (
                          displayedCandleUsers.map((u) => {
                            const emailVal = (u.email || u.username || '').toLowerCase();
                            const id8 = get8DigitId(u);
                            const userOverride = centralCandleControl.userCandleOverrides?.[emailVal] || 
                                                 centralCandleControl.userCandleOverrides?.[id8];
                            const currentOutcome = userOverride?.outcome || graphControls.userOverrides?.[emailVal] || 'normal';
                            const hasCustomCandle = !!userOverride?.direction && userOverride.direction !== 'NORMAL';

                            return (
                              <tr key={u.email} className={`hover:bg-white/[0.03] transition-colors ${hasCustomCandle ? 'bg-emerald-950/10' : ''}`}>
                                {/* User Info */}
                                <td className="p-3.5 font-bold text-white font-mono">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                                      {(u.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-white text-xs truncate max-w-[180px]">{u.email}</div>
                                      <div className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-[180px]">
                                        {u.fullName || u.username || 'Standard Trader'}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* 8-Digit ID */}
                                <td className="p-3.5">
                                  <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider">
                                    #{id8}
                                  </span>
                                </td>

                                {/* Live Balance */}
                                <td className="p-3.5 font-mono font-extrabold text-emerald-400">
                                  ${Number(u.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>

                                {/* Active Candle Status */}
                                <td className="p-3.5">
                                  {userOverride?.direction === 'UP' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-black shadow-sm shadow-emerald-500/20">
                                      <TrendingUp className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>FORCED UP 🟢</span>
                                    </span>
                                  ) : userOverride?.direction === 'DOWN' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/50 text-xs font-mono font-black shadow-sm shadow-rose-500/20">
                                      <TrendingDown className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>FORCED DOWN 🔴</span>
                                    </span>
                                  ) : userOverride?.direction === 'SPIKE_UP' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/50 text-xs font-mono font-black">
                                      <Zap className="w-3.5 h-3.5 text-teal-400" />
                                      <span>SPIKE UP 🚀</span>
                                    </span>
                                  ) : userOverride?.direction === 'SPIKE_DOWN' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/50 text-xs font-mono font-black">
                                      <Zap className="w-3.5 h-3.5 text-orange-400" />
                                      <span>DUMP DOWN 💥</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 text-slate-400 border border-white/10 text-[11px] font-mono">
                                      <span>🌐 Global ({centralCandleControl.direction})</span>
                                    </span>
                                  )}
                                </td>

                                {/* 1-Click Candle Change Action Buttons */}
                                <td className="p-3.5">
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    {/* Force UP */}
                                    <button
                                      onClick={() => handleSetUserCandleOverride(u, { direction: 'UP' })}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 border ${
                                        userOverride?.direction === 'UP'
                                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30'
                                          : 'bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30'
                                      }`}
                                      title="Force continuous green/bullish candles for this trader"
                                    >
                                      <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                                      <span>UP 🟢</span>
                                    </button>

                                    {/* Force DOWN */}
                                    <button
                                      onClick={() => handleSetUserCandleOverride(u, { direction: 'DOWN' })}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 border ${
                                        userOverride?.direction === 'DOWN'
                                          ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                                          : 'bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border-rose-500/30'
                                      }`}
                                      title="Force continuous red/bearish candles for this trader"
                                    >
                                      <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                                      <span>DOWN 🔴</span>
                                    </button>

                                    {/* Spike Bull */}
                                    <button
                                      onClick={() => handleSetUserCandleOverride(u, { direction: 'SPIKE_UP' })}
                                      className="p-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/25 text-teal-400 border border-teal-500/30 transition-all cursor-pointer"
                                      title="Inject instant Bull Spike (+2.5%) for this trader"
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Dump Bear */}
                                    <button
                                      onClick={() => handleSetUserCandleOverride(u, { direction: 'SPIKE_DOWN' })}
                                      className="p-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 transition-all cursor-pointer"
                                      title="Inject instant Bear Dump (-2.5%) for this trader"
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Reset to Global */}
                                    {hasCustomCandle && (
                                      <button
                                        onClick={() => handleSetUserCandleOverride(u, null)}
                                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/20 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                        title="Reset this user back to Global Broadcast"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Reset</span>
                                      </button>
                                    )}
                                  </div>
                                </td>

                                {/* Trade Outcome Selector */}
                                <td className="p-3.5">
                                  <select
                                    value={currentOutcome}
                                    onChange={(e) => {
                                      handleSetUserCandleOverride(u, { 
                                        outcome: e.target.value as any 
                                      });
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                                      currentOutcome === 'always_win' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                                      currentOutcome === 'always_lose' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                                      'bg-[#121824] text-slate-300 border-white/10'
                                    }`}
                                  >
                                    <option value="normal">Default Market</option>
                                    <option value="always_win">Force Always Win 🟢</option>
                                    <option value="always_lose">Force Always Lose 🔴</option>
                                  </select>
                                </td>

                                {/* Actions */}
                                <td className="p-3.5 text-right">
                                  <button
                                    onClick={() => setEditingUserCandle(u)}
                                    className="px-2.5 py-1.5 bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Open Detailed Candle & Outcome Control"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                    <span>কন্ট্রোল</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer info */}
                  <div className="p-3.5 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                    <div>
                      Showing <strong className="text-white font-mono">{displayedCandleUsers.length}</strong> of <strong className="text-white font-mono">{users.length}</strong> total registered traders
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> UP = Bullish Green</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> DOWN = Bearish Red</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Global = Synchronized</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gateways' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Payment Gateway Configuration</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Manage accepted payment methods, logos, minimum deposits, and instruction texts.</p>
              </div>
              <button
                onClick={() => {
                  setEditingGatewayIndex(gateways.length);
                  setGatewayForm({
                    id: `gateway_${Date.now()}`,
                    name: 'New Gateway',
                    category: 'mobile_banking',
                    type: 'both', // 'deposit' | 'withdrawal' | 'both'
                    icon: '',
                    active: true,
                    sendMoneyNumber: '',
                    merchantNumber: '',
                    cashOutNumber: '',
                    instruction: '',
                    minDeposit: 10,
                    maxDeposit: 1000,
                    minWithdrawal: 10,
                    maxWithdrawal: 5000,
                    fee: 0
                  });
                }}
                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border border-emerald-500/30 hover:border-transparent"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Gateway</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gateways.map((gateway, index) => (
                <div key={gateway.id} className="bg-[#121824] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {gateway.icon ? (
                          <img src={gateway.icon} alt={gateway.name} className="w-10 h-10 object-contain rounded bg-white/5 p-1" />
                        ) : (
                          <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{gateway.name}</h3>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              gateway.type === 'withdrawal' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              gateway.type === 'both' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {gateway.type === 'withdrawal' ? 'Withdraw Only' : gateway.type === 'both' ? 'Deposit & Withdraw' : 'Deposit Only'}
                            </span>
                            {!gateway.active && (
                              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[9px] font-bold uppercase tracking-wider">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 capitalize">{gateway.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingGatewayIndex(index);
                            setGatewayForm({ ...gateway });
                          }}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this gateway?')) {
                              const newGateways = [...gateways];
                              newGateways.splice(index, 1);
                              setGateways(newGateways);
                              await FirebaseService.syncGateways(newGateways);
                            }
                          }}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Deposit Limits:</span>
                        <span className="font-mono">${gateway.minDeposit || 10} - ${gateway.maxDeposit || 1000}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Withdrawal Limits:</span>
                        <span className="font-mono text-amber-400">${gateway.minWithdrawal || 10} - ${gateway.maxWithdrawal || 5000}</span>
                      </div>
                      {gateway.sendMoneyNumber && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Send Money:</span>
                          <span className="font-mono text-emerald-400">{gateway.sendMoneyNumber}</span>
                        </div>
                      )}
                      {gateway.merchantNumber && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Merchant:</span>
                          <span className="font-mono text-emerald-400">{gateway.merchantNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gateway Management Modal */}
      {editingGatewayIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{editingGatewayIndex === gateways.length ? 'Add New Gateway' : 'Edit Payment Gateway'}</span>
              </h3>
              <button 
                onClick={() => setEditingGatewayIndex(null)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Gateway Name</label>
                  <input
                    type="text"
                    value={gatewayForm.name || ''}
                    onChange={(e) => setGatewayForm({...gatewayForm, name: e.target.value})}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. bKash (BD)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={gatewayForm.category || 'mobile_banking'}
                    onChange={(e) => setGatewayForm({...gatewayForm, category: e.target.value})}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="mobile_banking">Mobile Banking</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="wallet">E-Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Gateway Purpose</label>
                  <select
                    value={gatewayForm.type || 'both'}
                    onChange={(e) => setGatewayForm({...gatewayForm, type: e.target.value})}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="deposit">Deposit Only</option>
                    <option value="withdrawal">Withdrawal Only</option>
                    <option value="both">Both (Deposit & Withdrawal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Gateway Logo Image URL</label>
                <input
                  type="text"
                  value={gatewayForm.icon || ''}
                  onChange={(e) => setGatewayForm({...gatewayForm, icon: e.target.value})}
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="https://i.postimg.cc/..."
                />
              </div>

              {/* Deposit Limits */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-400">Deposit Limits</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Min Deposit ($)</label>
                    <input
                      type="number"
                      value={gatewayForm.minDeposit || 10}
                      onChange={(e) => setGatewayForm({...gatewayForm, minDeposit: Number(e.target.value)})}
                      className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Max Deposit ($)</label>
                    <input
                      type="number"
                      value={gatewayForm.maxDeposit || 1000}
                      onChange={(e) => setGatewayForm({...gatewayForm, maxDeposit: Number(e.target.value)})}
                      className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Withdrawal Limits */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-amber-400">Withdrawal Limits</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Min Withdrawal ($)</label>
                    <input
                      type="number"
                      value={gatewayForm.minWithdrawal || 10}
                      onChange={(e) => setGatewayForm({...gatewayForm, minWithdrawal: Number(e.target.value)})}
                      className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Max Withdrawal ($)</label>
                    <input
                      type="number"
                      value={gatewayForm.maxWithdrawal || 5000}
                      onChange={(e) => setGatewayForm({...gatewayForm, maxWithdrawal: Number(e.target.value)})}
                      className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-white">Payment Numbers</h4>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Send Money (Personal)</label>
                  <input
                    type="text"
                    value={gatewayForm.sendMoneyNumber || ''}
                    onChange={(e) => setGatewayForm({...gatewayForm, sendMoneyNumber: e.target.value})}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="Enter number (optional)"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Merchant (Payment)</label>
                  <input
                    type="text"
                    value={gatewayForm.merchantNumber || ''}
                    onChange={(e) => setGatewayForm({...gatewayForm, merchantNumber: e.target.value})}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="Enter number (optional)"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Cash Out (Agent)</label>
                  <input
                    type="text"
                    value={gatewayForm.cashOutNumber || ''}
                    onChange={(e) => setGatewayForm({...gatewayForm, cashOutNumber: e.target.value})}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="Enter number (optional)"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-bold text-slate-300 mb-1">Payment Instructions</label>
                <textarea
                  value={gatewayForm.instruction || ''}
                  onChange={(e) => setGatewayForm({...gatewayForm, instruction: e.target.value})}
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 min-h-[60px]"
                  placeholder="Enter instructions for users..."
                />
              </div>

              <label className="flex items-center space-x-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gatewayForm.active ?? true}
                  onChange={(e) => setGatewayForm({...gatewayForm, active: e.target.checked})}
                  className="w-4 h-4 rounded border-white/20 bg-[#0a0e17] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#121824]"
                />
                <span className="text-xs font-bold text-white">Gateway Active</span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 p-4 border-t border-white/10 shrink-0">
              <button
                onClick={() => setEditingGatewayIndex(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const newGateways = [...gateways];
                  if (editingGatewayIndex === gateways.length) {
                    newGateways.push(gatewayForm);
                  } else {
                    newGateways[editingGatewayIndex] = gatewayForm;
                  }
                  
                  setGateways(newGateways);
                  await FirebaseService.syncGateways(newGateways);
                  setEditingGatewayIndex(null);
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                Save Gateway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Documents Review Tab */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Identity Document (KYC) Verification Requests</h2>
              <p className="text-xs text-slate-400">Review uploaded National ID, Passport, and Driving License photos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.filter(u => u.kycStatus || u.kycFrontImg).length === 0 ? (
              <div className="col-span-2 p-12 text-center text-slate-500 bg-[#121824] border border-white/10 rounded-2xl">
                No pending KYC document submissions found in Firestore users.
              </div>
            ) : (
              users.filter(u => u.kycStatus || u.kycFrontImg).map((u, i) => (
                <div key={u.id || i} className="bg-[#121824] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <div className="font-bold text-white text-xs">{u.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Doc Type: <span className="uppercase text-emerald-400">{u.kycDocType || 'NID'}</span></div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.kycStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      u.kycStatus === 'rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {u.kycStatus || 'pending'}
                    </span>
                  </div>

                  {/* Images Display */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1">Front Photo</div>
                      {u.kycFrontImg ? (
                        <img src={u.kycFrontImg} alt="Front Document" className="w-full h-32 object-cover rounded-xl border border-white/10" />
                      ) : (
                        <div className="w-full h-32 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-xs text-slate-500">No Front Image</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1">Back Photo</div>
                      {u.kycBackImg ? (
                        <img src={u.kycBackImg} alt="Back Document" className="w-full h-32 object-cover rounded-xl border border-white/10" />
                      ) : (
                        <div className="w-full h-32 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-xs text-slate-500">N/A</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/5">
                    <button
                      onClick={async () => {
                        const updated = { ...u, kycStatus: 'rejected', verificationStatus: 'unverified' };
                        await FirebaseService.syncUser(updated);
                        loadAdminData();
                      }}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      Reject Document
                    </button>
                    <button
                      onClick={async () => {
                        const updated = { ...u, kycStatus: 'verified', verificationStatus: 'verified' };
                        await FirebaseService.syncUser(updated);
                        loadAdminData();
                      }}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                    >
                      Approve Verification
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Balance / Bonus Modal */}
      {managingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121824] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-black text-white">Manage User Account</h3>
                <p className="text-xs text-slate-400 font-mono">{managingUser.email}</p>
              </div>
              <button 
                onClick={() => setManagingUser(null)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 8-Digit Unique ID Edit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    8-Digit Unique User ID (৮ ডিজিটের ইউনিক আইডি)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = generate8DigitId();
                      setCustomIdInput(rand);
                      setCustomIdError('');
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    🎲 Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  value={customIdInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setCustomIdInput(clean);
                    if (clean.length === 8) setCustomIdError('');
                  }}
                  placeholder="8-digit numeric ID (e.g. 84920153)"
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-mono font-bold tracking-wider focus:outline-none focus:border-emerald-500"
                />
                {customIdError && <p className="text-[10px] text-rose-400 mt-1">{customIdError}</p>}
                <p className="text-[10px] text-slate-400 mt-1">Must be exactly 8 digits. Admin can change this unique identifier anytime.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Custom Live Balance ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="any"
                    value={customBalanceInput}
                    onChange={(e) => setCustomBalanceInput(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      const curr = parseFloat(customBalanceInput) || 0;
                      setCustomBalanceInput(String(curr + 50));
                    }}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    + $50
                  </button>
                  <button
                    onClick={() => {
                      const curr = parseFloat(customBalanceInput) || 0;
                      setCustomBalanceInput(String(curr + 100));
                    }}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    + $100
                  </button>
                  <button
                    onClick={() => {
                      const curr = parseFloat(customBalanceInput) || 0;
                      setCustomBalanceInput(String(Math.max(0, curr - 50)));
                    }}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    - $50
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bonus Amount ($)</label>
                <div className="relative">
                  <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <input
                    type="number"
                    step="any"
                    value={bonusInput}
                    onChange={(e) => setBonusInput(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setManagingUser(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUserManagement}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Quick 8-Digit ID Edit Modal */}
      {editingUserIdUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121824] border border-emerald-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span>Edit 8-Digit User ID</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[240px]">{editingUserIdUser.email}</p>
              </div>
              <button 
                onClick={() => setEditingUserIdUser(null)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">8-Digit Unique Number ID</label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = generate8DigitId();
                      setQuickIdInput(rand);
                      setQuickIdError('');
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    🎲 Random 8-Digit
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  value={quickIdInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setQuickIdInput(clean);
                    if (clean.length === 8) setQuickIdError('');
                  }}
                  placeholder="8-digit ID (e.g. 84920153)"
                  className="w-full bg-[#0a0e17] border border-emerald-500/30 rounded-xl px-4 py-2.5 text-base text-emerald-400 font-mono font-black tracking-widest text-center focus:outline-none focus:border-emerald-500"
                />
                {quickIdError && <p className="text-[10px] text-rose-400 mt-1 font-semibold">{quickIdError}</p>}
                <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                  <span>Digits count:</span>
                  <span className={`font-mono font-bold ${quickIdInput.length === 8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {quickIdInput.length} / 8 digits
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => setEditingUserIdUser(null)}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={quickIdInput.length !== 8}
                  onClick={() => handleQuickSave8DigitId(editingUserIdUser, quickIdInput)}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Save 8-Digit ID
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Individual User Candlestick & Trade Outcome Control Modal */}
      {editingUserCandle && (() => {
        const emailVal = (editingUserCandle.email || editingUserCandle.username || '').toLowerCase();
        const id8 = get8DigitId(editingUserCandle);
        const userOverride = centralCandleControl.userCandleOverrides?.[emailVal] || 
                             centralCandleControl.userCandleOverrides?.[id8];
        const currentOutcome = userOverride?.outcome || graphControls.userOverrides?.[emailVal] || 'normal';
        const currentDir = userOverride?.direction || 'NORMAL';
        const hasCustomCandle = !!userOverride?.direction && userOverride.direction !== 'NORMAL';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#121824] border border-emerald-500/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>User Candle & Trade Control</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        #{id8}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{editingUserCandle.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingUserCandle(null)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Status Banner */}
              <div className="p-3.5 bg-[#0a0e17] border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Candle Mode for this User:</div>
                  <div className="text-xs font-black text-white mt-0.5 flex items-center gap-1.5">
                    {currentDir === 'UP' ? (
                      <span className="text-emerald-400">🟢 FORCED UP (Continuous Green Bullish Candles)</span>
                    ) : currentDir === 'DOWN' ? (
                      <span className="text-rose-400">🔴 FORCED DOWN (Continuous Red Bearish Candles)</span>
                    ) : currentDir === 'SPIKE_UP' ? (
                      <span className="text-teal-400">🚀 BULL SPIKE INJECTED</span>
                    ) : currentDir === 'SPIKE_DOWN' ? (
                      <span className="text-orange-400">💥 BEAR DUMP INJECTED</span>
                    ) : (
                      <span className="text-slate-300">🌐 Following Global Broadcast ({centralCandleControl.direction})</span>
                    )}
                  </div>
                </div>

                {hasCustomCandle && (
                  <button
                    onClick={() => handleSetUserCandleOverride(editingUserCandle, null)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Global</span>
                  </button>
                )}
              </div>

              {/* 1. Primary Direction Control Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Select Candlestick Direction (ক্যান্ডেল মুভমেন্ট নির্বাচন করুন)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* FORCE UP */}
                  <button
                    onClick={() => handleSetUserCandleOverride(editingUserCandle, { direction: 'UP' })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                      currentDir === 'UP'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20'
                        : 'bg-[#0a0e17] border-white/10 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      {currentDir === 'UP' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-black">ACTIVE</span>
                      )}
                    </div>
                    <div className="text-xs font-black text-white group-hover:text-emerald-300">FORCE UP (সবুজ / বুলিশ)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">টানা গ্রিন ক্যান্ডেল তৈরি হবে</div>
                  </button>

                  {/* FORCE DOWN */}
                  <button
                    onClick={() => handleSetUserCandleOverride(editingUserCandle, { direction: 'DOWN' })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                      currentDir === 'DOWN'
                        ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/20'
                        : 'bg-[#0a0e17] border-white/10 hover:border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      {currentDir === 'DOWN' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500 text-white">ACTIVE</span>
                      )}
                    </div>
                    <div className="text-xs font-black text-white group-hover:text-rose-300">FORCE DOWN (লাল / বেয়ারিশ)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">টানা রেড ক্যান্ডেল তৈরি হবে</div>
                  </button>
                </div>
              </div>

              {/* 2. Instant Spikes and Normal Market */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSetUserCandleOverride(editingUserCandle, { direction: 'NORMAL' })}
                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                    currentDir === 'NORMAL' && hasCustomCandle
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-[#0a0e17] border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                  }`}
                >
                  ⚖️ Normal Speed
                </button>
                <button
                  onClick={() => handleSetUserCandleOverride(editingUserCandle, { direction: 'SPIKE_UP' })}
                  className="py-2 px-3 rounded-xl border bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/30 text-teal-300 text-center transition-all cursor-pointer text-xs font-bold"
                >
                  🚀 Spike (+2.5%)
                </button>
                <button
                  onClick={() => handleSetUserCandleOverride(editingUserCandle, { direction: 'SPIKE_DOWN' })}
                  className="py-2 px-3 rounded-xl border bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 text-orange-300 text-center transition-all cursor-pointer text-xs font-bold"
                >
                  💥 Dump (-2.5%)
                </button>
              </div>

              {/* 3. Trade Settlement Win/Loss Outcome */}
              <div className="p-4 bg-[#0a0e17] border border-white/10 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Trade Expiration Outcome (এই ইউজারের ট্রেড ফলাফল নির্ধারণ)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal', label: 'Default Market ⚖️' },
                    { id: 'always_win', label: 'Force Win 🟢' },
                    { id: 'always_lose', label: 'Force Lose 🔴' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSetUserCandleOverride(editingUserCandle, { outcome: item.id as any })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                        currentOutcome === item.id
                          ? item.id === 'always_win' ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                          : item.id === 'always_lose' ? 'bg-rose-500 text-white border-rose-400 font-black'
                          : 'bg-white/20 text-white border-white/40'
                          : 'bg-[#121824] text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <button
                  onClick={() => handleSetUserCandleOverride(editingUserCandle, null)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Reset User to Global
                </button>
                <button
                  onClick={() => setEditingUserCandle(null)}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Done / সম্পূর্ণ
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
