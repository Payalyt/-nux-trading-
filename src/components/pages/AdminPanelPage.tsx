import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CreditCard, 
  Settings, 
  ShieldCheck, 
  Search, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  MessageSquare, 
  Send, 
  ExternalLink, 
  Smartphone, 
  Building, 
  Globe, 
  Sliders, 
  FileText, 
  AlertCircle, 
  ShieldAlert, 
  Save, 
  Lock,
  Eye,
  CheckCheck,
  TrendingUp,
  Ban,
  BadgeCheck
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { UserAccount } from '../../types/trading';
import { apiClient, formatErrorMessage } from '../../utils/apiClient';

interface AdminPanelPageProps {
  user: UserAccount | null;
  onLogout?: () => void;
}

type AdminTab = 'users' | 'transactions' | 'gateways' | 'support' | 'audit';

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [loading, setLoading] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Users State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  
  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    username: '',
    password: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    balance: 0,
    demoBalance: 10000
  });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    password: '',
    accountStatus: 'active' as 'active' | 'blocked',
    verificationStatus: 'verified' as 'unverified' | 'verified'
  });

  // Balance Adjustment Modal State
  const [balanceUser, setBalanceUser] = useState<any | null>(null);
  const [balanceAdjustType, setBalanceAdjustType] = useState<'set' | 'credit' | 'debit'>('credit');
  const [balanceAmount, setBalanceAmount] = useState<number>(100);
  const [balanceReason, setBalanceReason] = useState('Manual balance adjustment by admin');

  // 2. Transactions State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txFilterStatus, setTxFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [txFilterType, setTxFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [txSearch, setTxSearch] = useState('');
  const [selectedTxForAction, setSelectedTxForAction] = useState<any | null>(null);
  const [actionModalType, setActionModalType] = useState<'approve' | 'reject' | null>(null);
  const [adminActionNote, setAdminActionNote] = useState('');

  // 3. Payment Gateway Settings State
  const [gateways, setGateways] = useState<any[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('bkash');
  const [isSavingGateways, setIsSavingGateways] = useState(false);

  // 4. Support Settings State
  const [supportSettings, setSupportSettings] = useState({
    telegramLink: 'https://t.me/QuotexOfficialSupport',
    telegramChannel: 'https://t.me/QuotexSignalsVIP',
    whatsappNumber: '+8801700000000',
    whatsappUrl: 'https://wa.me/8801700000000',
    supportEmail: 'support@nux-trading.com',
    liveChatUrl: 'https://tawk.to',
    noticeBanner: '🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad & Crypto!',
    showNoticeBanner: true
  });
  const [currencyRates, setCurrencyRates] = useState<Record<string, number>>({ USD: 1, BDT: 125 });
  const [isSavingSupport, setIsSavingSupport] = useState(false);

  // 5. Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    soundManager.playClick();
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/admin/users');
      if (res.ok && res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err: any) {
      showToast(formatErrorMessage(err, 'Failed to fetch users'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/admin/transactions');
      if (res.ok && res.data?.transactions) {
        setTransactions(res.data.transactions);
      }
    } catch (err: any) {
      showToast(formatErrorMessage(err, 'Failed to fetch transactions'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/api/admin/settings');
      if (res.ok && res.data?.settings) {
        const s = res.data.settings;
        if (s.paymentGateways) setGateways(s.paymentGateways);
        if (s.support) setSupportSettings(s.support);
        if (s.currencyRates) setCurrencyRates(s.currencyRates);
      }
    } catch (err: any) {
      console.error('Settings fetch error:', err);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      const res = await apiClient.get('/api/admin/audit-logs');
      if (res.ok && res.data?.auditLogs) {
        setAuditLogs(res.data.auditLogs);
      }
    } catch (err: any) {
      console.error('Audit logs error:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchTransactions();
      fetchSettings();
      fetchAuditLogs();
    }
  }, [user]);

  // Tab change handlers
  const handleTabChange = (tab: AdminTab) => {
    soundManager.playClick();
    setActiveTab(tab);
    if (tab === 'users') fetchUsers();
    if (tab === 'transactions') fetchTransactions();
    if (tab === 'gateways' || tab === 'support') fetchSettings();
    if (tab === 'audit') fetchAuditLogs();
  };

  // --- USER MANAGEMENT HANDLERS ---
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/api/admin/users', newUser);
      if (!res.ok || !res.data) {
        throw new Error(formatErrorMessage(res.error || res.data?.error, 'Failed to create user'));
      }
      soundManager.playWin();
      showToast(`User ${newUser.username} created successfully!`);
      setIsAddUserOpen(false);
      setNewUser({
        fullName: '',
        username: '',
        password: '',
        phone: '',
        role: 'user',
        balance: 0,
        demoBalance: 10000
      });
      fetchUsers();
    } catch (err: any) {
      showToast(formatErrorMessage(err), 'error');
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await apiClient.put(`/api/admin/users/${encodeURIComponent(editingUser.username)}`, editFormData);
      if (!res.ok) throw new Error(formatErrorMessage(res.error, 'Failed to update user'));
      soundManager.playWin();
      showToast(`User ${editingUser.username} updated successfully!`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(formatErrorMessage(err), 'error');
    }
  };

  const handleBalanceAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceUser) return;
    try {
      let payload: any = { reason: balanceReason };
      if (balanceAdjustType === 'set') {
        payload.liveBalance = balanceAmount;
      } else {
        payload.adjustmentAmount = balanceAmount;
        payload.adjustmentType = balanceAdjustType;
      }

      const res = await apiClient.put(`/api/admin/users/${encodeURIComponent(balanceUser.username)}/balance`, payload);
      if (!res.ok) throw new Error(formatErrorMessage(res.error, 'Failed to adjust balance'));
      soundManager.playWin();
      showToast(`Balance adjusted for ${balanceUser.username}!`);
      setBalanceUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(formatErrorMessage(err), 'error');
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${username}"?`)) return;
    try {
      const res = await apiClient.delete(`/api/admin/users/${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error(formatErrorMessage(res.error, 'Failed to delete user'));
      soundManager.playWin();
      showToast(`User ${username} deleted successfully`);
      fetchUsers();
    } catch (err: any) {
      showToast(formatErrorMessage(err), 'error');
    }
  };

  // --- TRANSACTION APPROVAL HANDLERS ---
  const handleProcessTransaction = async () => {
    if (!selectedTxForAction || !actionModalType) return;
    const status = actionModalType === 'approve' ? 'approved' : 'rejected';
    try {
      const res = await apiClient.put(`/api/admin/transactions/${selectedTxForAction.id}/status`, {
        status,
        adminNote: adminActionNote.trim() || `Processed by admin (${status})`
      });

      if (!res.ok) throw new Error(formatErrorMessage(res.error, `Failed to ${status} transaction`));
      
      soundManager.playWin();
      showToast(`Transaction #${selectedTxForAction.id} marked as ${status.toUpperCase()}!`);
      setSelectedTxForAction(null);
      setActionModalType(null);
      setAdminActionNote('');
      fetchTransactions();
      fetchUsers(); // Refresh users in case balance was credited/refunded
    } catch (err: any) {
      showToast(formatErrorMessage(err), 'error');
    }
  };

  // --- GATEWAY SETTINGS HANDLERS ---
  const handleGatewayChange = (gwId: string, field: string, value: any) => {
    setGateways(prev => prev.map(g => {
      if (g.id === gwId) {
        return { ...g, [field]: value };
      }
      return g;
    }));
  };

  const handleBankDetailChange = (gwId: string, field: string, value: string) => {
    setGateways(prev => prev.map(g => {
      if (g.id === gwId) {
        return {
          ...g,
          bankDetails: {
            ...(g.bankDetails || {}),
            [field]: value
          }
        };
      }
      return g;
    }));
  };

  const handleCryptoDetailChange = (gwId: string, field: string, value: string) => {
    setGateways(prev => prev.map(g => {
      if (g.id === gwId) {
        return {
          ...g,
          cryptoDetails: {
            ...(g.cryptoDetails || {}),
            [field]: value
          }
        };
      }
      return g;
    }));
  };

  const handleSaveAllGateways = async () => {
    setIsSavingGateways(true);
    try {
      const res = await apiClient.put('/api/admin/settings', {
        paymentGateways: gateways,
        currencyRates
      });
      if (!res.ok) throw new Error(formatErrorMessage(res.error, 'Failed to save gateway settings'));
      soundManager.playWin();
      showToast('Payment gateway numbers and settings saved successfully!');
    } catch (err: any) {
      showToast(formatErrorMessage(err), 'error');
    } finally {
      setIsSavingGateways(false);
    }
  };

  // --- SUPPORT SETTINGS HANDLER ---
  const handleSaveSupportSettings = async () => {
    setIsSavingSupport(true);
    try {
      const res = await apiClient.put('/api/admin/settings', {
        support: supportSettings,
        currencyRates
      });
      if (!res.ok) throw new Error(formatErrorMessage(res.error, 'Failed to save support settings'));
      soundManager.playWin();
      showToast('Support links and platform settings saved successfully!');
    } catch (err: any) {
      showToast(formatErrorMessage(err), 'error');
    } finally {
      setIsSavingSupport(false);
    }
  };

  // Computed Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const q = userSearch.toLowerCase().trim();
      if (!q) return matchesRole;
      const name = (u.fullName || '').toLowerCase();
      const email = (u.username || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      return matchesRole && (name.includes(q) || email.includes(q) || phone.includes(q));
    });
  }, [users, userRoleFilter, userSearch]);

  // Computed Transactions List
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesStatus = txFilterStatus === 'all' || t.status === txFilterStatus;
      const matchesType = txFilterType === 'all' || t.type === txFilterType;
      const q = txSearch.toLowerCase().trim();
      if (!q) return matchesStatus && matchesType;
      const id = (t.id || '').toLowerCase();
      const user = (t.userId || '').toLowerCase();
      const sender = (t.senderNumber || '').toLowerCase();
      const receiver = (t.receiverNumber || '').toLowerCase();
      const trx = (t.trxId || '').toLowerCase();
      const gw = (t.gateway || '').toLowerCase();
      return matchesStatus && matchesType && (id.includes(q) || user.includes(q) || sender.includes(q) || receiver.includes(q) || trx.includes(q) || gw.includes(q));
    });
  }, [transactions, txFilterStatus, txFilterType, txSearch]);

  // Metrics
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const totalLiveFunds = users.reduce((acc, u) => acc + (u.balance || 0), 0);
    const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length;
    const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length;
    const totalDepositedApproved = transactions
      .filter(t => t.type === 'deposit' && (t.status === 'approved' || t.status === 'completed'))
      .reduce((acc, t) => acc + (t.amount || 0), 0);
    return { totalUsers, totalLiveFunds, pendingDeposits, pendingWithdrawals, totalDepositedApproved };
  }, [users, transactions]);

  const activeGateway = gateways.find(g => g.id === selectedGatewayId) || gateways[0];

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0d14]">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">You must be logged in as an administrator to access the Control Center.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#090d16] p-4 sm:p-6 lg:p-8 relative select-none text-slate-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-4 duration-200 ${
          toastMessage.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-black font-extrabold' : 'bg-rose-500/90 border-rose-400 text-white font-bold'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs sm:text-sm">{toastMessage.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Control Panel</h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/30">
                    Live Engine
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Complete user management, instant deposit/withdraw approvals & payment gateway controller.
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchUsers();
                fetchTransactions();
                fetchSettings();
                fetchAuditLogs();
                showToast('All administrator data refreshed!');
              }}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title="Refresh All Server Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create User</span>
            </button>
          </div>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-[#101522] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono-nums mt-0.5">{metrics.totalUsers}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#101522] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Client Funds</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-nums mt-0.5">
                ${metrics.totalLiveFunds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#101522] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Deposits</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono-nums mt-0.5">{metrics.pendingDeposits}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#101522] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Withdrawals</div>
              <div className="text-xl sm:text-2xl font-black text-pink-400 font-mono-nums mt-0.5">{metrics.pendingWithdrawals}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center border border-pink-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#101522] border border-white/10 rounded-2xl p-4 flex items-center justify-between col-span-2 lg:col-span-1">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approved Volume</div>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono-nums mt-0.5">
                ${metrics.totalDepositedApproved.toFixed(0)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#101522] p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
          <button
            onClick={() => handleTabChange('users')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({users.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('transactions')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === 'transactions' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Deposits & Withdrawals</span>
            {(metrics.pendingDeposits + metrics.pendingWithdrawals) > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'transactions' ? 'bg-black text-emerald-400' : 'bg-amber-500 text-black'}`}>
                {metrics.pendingDeposits + metrics.pendingWithdrawals}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('gateways')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gateways' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Payment Gateways & Numbers</span>
          </button>

          <button
            onClick={() => handleTabChange('support')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'support' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support & Platform Links</span>
          </button>

          <button
            onClick={() => handleTabChange('audit')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Logs</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: USER MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101522] p-3 rounded-2xl border border-white/10">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by User ID, Name, Email, or Phone number..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Traders Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#101522] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">User Details</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Live Balance</th>
                      <th className="p-4">Demo Balance</th>
                      <th className="p-4">Status & Role</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono-nums">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.username} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-sans">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black flex items-center justify-center text-xs shrink-0">
                                {u.fullName ? u.fullName[0].toUpperCase() : (u.username[0] || 'U').toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <div className="font-bold text-white flex items-center space-x-1.5">
                                  <span>{u.fullName || u.username}</span>
                                  {u.verificationStatus === 'verified' && (
                                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" title="Verified Trader" />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                                  <span>{u.username}</span>
                                  <button
                                    onClick={() => handleCopy(u.username, `u-${u.username}`)}
                                    className="text-slate-500 hover:text-white"
                                  >
                                    {copiedLabel === `u-${u.username}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-sans">
                            {u.phone ? (
                              <div className="text-white font-mono text-xs flex items-center space-x-1">
                                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{u.phone}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px] italic">No phone set</span>
                            )}
                          </td>

                          <td className="p-4">
                            <span className="font-extrabold text-emerald-400 text-sm font-mono">
                              ${(u.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="text-slate-300 text-xs font-mono">
                              ${(u.demoBalance || 10000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          <td className="p-4 font-sans">
                            <div className="flex flex-col space-y-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-max ${
                                u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {u.role === 'admin' ? 'ADMINISTRATOR' : 'TRADER'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-max ${
                                u.accountStatus === 'blocked' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {u.accountStatus === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-[11px] text-slate-400 font-sans">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>

                          <td className="p-4 text-right font-sans">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Adjust Balance */}
                              <button
                                onClick={() => {
                                  soundManager.playClick();
                                  setBalanceUser(u);
                                  setBalanceAmount(100);
                                  setBalanceAdjustType('credit');
                                }}
                                className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                title="Credit/Debit Balance"
                              >
                                Balance
                              </button>

                              {/* Edit Details */}
                              <button
                                onClick={() => {
                                  soundManager.playClick();
                                  setEditingUser(u);
                                  setEditFormData({
                                    fullName: u.fullName || '',
                                    phone: u.phone || '',
                                    role: u.role || 'user',
                                    password: '',
                                    accountStatus: u.accountStatus || 'active',
                                    verificationStatus: u.verificationStatus || 'verified'
                                  });
                                }}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                                title="Edit User Details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUser(u.username)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all cursor-pointer"
                                title="Delete Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

        {/* ======================================================== */}
        {/* TAB 2: DEPOSIT & WITHDRAWAL TRANSACTIONS */}
        {/* ======================================================== */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101522] p-3 rounded-2xl border border-white/10">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Search by Transaction ID, User, TrxID, Sender/Receiver Number..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={txFilterType}
                  onChange={(e) => setTxFilterType(e.target.value as any)}
                  className="bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                </select>

                <select
                  value={txFilterStatus}
                  onChange={(e) => setTxFilterStatus(e.target.value as any)}
                  className="bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-[#101522] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">ID & Type</th>
                      <th className="p-4">User Account</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Sender / TrxID / Number</th>
                      <th className="p-4">Amount ($ / BDT)</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Approval Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono-nums">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-white font-mono">{tx.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black w-max mt-1 ${
                                tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                              }`}>
                                {tx.type.toUpperCase()}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 font-sans">
                            <div className="font-bold text-white text-xs">{tx.userName || tx.userId}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{tx.userId}</div>
                          </td>

                          <td className="p-4 font-sans">
                            <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                              <span>{tx.gateway}</span>
                              {tx.paymentType && (
                                <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] text-slate-300 font-mono">
                                  {tx.paymentType.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4 font-sans">
                            {tx.type === 'deposit' ? (
                              <div className="space-y-0.5">
                                {tx.senderNumber && (
                                  <div className="text-white font-mono text-xs flex items-center space-x-1">
                                    <span className="text-slate-400 text-[10px]">Sender:</span>
                                    <span>{tx.senderNumber}</span>
                                  </div>
                                )}
                                {tx.trxId && (
                                  <div className="text-emerald-400 font-mono font-bold text-xs flex items-center space-x-1">
                                    <span className="text-slate-400 text-[10px]">TrxID:</span>
                                    <span>{tx.trxId}</span>
                                    <button 
                                      onClick={() => handleCopy(tx.trxId, `trx-${tx.id}`)}
                                      className="text-slate-500 hover:text-white"
                                    >
                                      {copiedLabel === `trx-${tx.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <div className="text-white font-mono text-xs">
                                  <span className="text-slate-400 text-[10px]">Payout To: </span>
                                  <strong className="text-cyan-400">{tx.receiverNumber || 'N/A'}</strong>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="font-extrabold text-white text-sm">
                              ${tx.amount.toFixed(2)}
                            </div>
                            {tx.amountBdt && (
                              <div className="text-[11px] text-emerald-400 font-semibold font-mono">
                                ৳{tx.amountBdt.toLocaleString()} BDT
                              </div>
                            )}
                            {tx.bonus > 0 && (
                              <div className="text-[10px] text-amber-400 font-bold">
                                +${tx.bonus} Bonus
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-[11px] text-slate-400 font-sans">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>

                          <td className="p-4 font-sans">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center space-x-1 ${
                              tx.status === 'approved' || tx.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : tx.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            }`}>
                              {tx.status === 'approved' && <Check className="w-3 h-3" />}
                              {tx.status === 'rejected' && <XCircle className="w-3 h-3" />}
                              {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                              <span>{tx.status}</span>
                            </span>
                          </td>

                          <td className="p-4 text-right font-sans">
                            {tx.status === 'pending' ? (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    soundManager.playClick();
                                    setSelectedTxForAction(tx);
                                    setActionModalType('approve');
                                    setAdminActionNote(`Approved by Admin (${tx.type})`);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs flex items-center space-x-1 shadow-md shadow-emerald-500/20 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Approve</span>
                                </button>

                                <button
                                  onClick={() => {
                                    soundManager.playClick();
                                    setSelectedTxForAction(tx);
                                    setActionModalType('reject');
                                    setAdminActionNote('Rejected due to invalid transaction details');
                                  }}
                                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">
                                {tx.adminNote || 'Completed'}
                              </span>
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

        {/* ======================================================== */}
        {/* TAB 3: PAYMENT GATEWAY & NUMBER SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'gateways' && (
          <div className="space-y-6">
            <div className="bg-[#101522] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span>Payment Gateway & Number Settings</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update Send Money, Merchant, and Cash Out numbers. These reflect instantly on the user deposit page.
                  </p>
                </div>

                <button
                  onClick={handleSaveAllGateways}
                  disabled={isSavingGateways}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingGateways ? 'Saving...' : 'Save All Gateway Settings'}</span>
                </button>
              </div>

              {/* Gateway Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {gateways.map((gw) => (
                  <button
                    key={gw.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedGatewayId(gw.id);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedGatewayId === gw.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">
                        {gw.icon?.startsWith('http') ? (
                          <img src={gw.icon} alt={gw.name} className="w-6 h-6 object-contain rounded" />
                        ) : (
                          gw.icon || '💳'
                        )}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${gw.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                    </div>
                    <div className="font-bold text-xs truncate">{gw.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{gw.category}</div>
                  </button>
                ))}
              </div>

              {/* Active Gateway Detailed Configuration Editor */}
              {activeGateway && (
                <div className="bg-black/30 rounded-2xl p-5 border border-white/10 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {activeGateway.icon?.startsWith('http') ? (
                          <img src={activeGateway.icon} alt={activeGateway.name} className="w-8 h-8 object-contain rounded" />
                        ) : (
                          activeGateway.icon || '💳'
                        )}
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-white">{activeGateway.name}</h3>
                        <p className="text-xs text-slate-400">Configure recipient numbers, limits & bonus</p>
                      </div>
                    </div>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeGateway.active}
                        onChange={(e) => handleGatewayChange(activeGateway.id, 'active', e.target.checked)}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <span className="text-xs font-bold text-white">Active on User Deposit Page</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Send Money Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Send Money (Personal) Number</span>
                        <input
                          type="checkbox"
                          checked={activeGateway.allowSendMoney ?? true}
                          onChange={(e) => handleGatewayChange(activeGateway.id, 'allowSendMoney', e.target.checked)}
                          className="accent-emerald-500"
                        />
                      </label>
                      <input
                        type="text"
                        value={activeGateway.sendMoneyNumber || ''}
                        onChange={(e) => handleGatewayChange(activeGateway.id, 'sendMoneyNumber', e.target.value)}
                        placeholder="e.g. 01711223344"
                        className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Merchant Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Merchant (Payment) Number</span>
                        <input
                          type="checkbox"
                          checked={activeGateway.allowMerchant ?? true}
                          onChange={(e) => handleGatewayChange(activeGateway.id, 'allowMerchant', e.target.checked)}
                          className="accent-emerald-500"
                        />
                      </label>
                      <input
                        type="text"
                        value={activeGateway.merchantNumber || ''}
                        onChange={(e) => handleGatewayChange(activeGateway.id, 'merchantNumber', e.target.value)}
                        placeholder="e.g. 01811223344"
                        className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Cash Out Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Cash Out (Agent) Number</span>
                        <input
                          type="checkbox"
                          checked={activeGateway.allowCashOut ?? true}
                          onChange={(e) => handleGatewayChange(activeGateway.id, 'allowCashOut', e.target.checked)}
                          className="accent-emerald-500"
                        />
                      </label>
                      <input
                        type="text"
                        value={activeGateway.cashOutNumber || ''}
                        onChange={(e) => handleGatewayChange(activeGateway.id, 'cashOutNumber', e.target.value)}
                        placeholder="e.g. 01911223344"
                        className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Bank Details (if applicable) */}
                  {activeGateway.category === 'bank' && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                      <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <Building className="w-4 h-4 text-cyan-400" />
                        <span>Bank Account Credentials</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold">Bank Name</label>
                          <input
                            type="text"
                            value={activeGateway.bankDetails?.bankName || ''}
                            onChange={(e) => handleBankDetailChange(activeGateway.id, 'bankName', e.target.value)}
                            placeholder="Islami Bank / City Bank"
                            className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold">Account Name</label>
                          <input
                            type="text"
                            value={activeGateway.bankDetails?.accountName || ''}
                            onChange={(e) => handleBankDetailChange(activeGateway.id, 'accountName', e.target.value)}
                            placeholder="NUX TRADING LTD"
                            className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold">Account Number</label>
                          <input
                            type="text"
                            value={activeGateway.bankDetails?.accountNumber || ''}
                            onChange={(e) => handleBankDetailChange(activeGateway.id, 'accountNumber', e.target.value)}
                            placeholder="2050123456789"
                            className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold">Branch & Routing</label>
                          <input
                            type="text"
                            value={activeGateway.bankDetails?.branch || ''}
                            onChange={(e) => handleBankDetailChange(activeGateway.id, 'branch', e.target.value)}
                            placeholder="Gulshan Branch (125272641)"
                            className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Crypto Details (if applicable) */}
                  {activeGateway.category === 'crypto' && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                      <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span>Crypto Wallet Details</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold">Wallet Address</label>
                          <input
                            type="text"
                            value={activeGateway.cryptoDetails?.walletAddress || ''}
                            onChange={(e) => handleCryptoDetailChange(activeGateway.id, 'walletAddress', e.target.value)}
                            placeholder="TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX"
                            className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold">Network Name</label>
                          <input
                            type="text"
                            value={activeGateway.cryptoDetails?.network || ''}
                            onChange={(e) => handleCryptoDetailChange(activeGateway.id, 'network', e.target.value)}
                            placeholder="Tron (TRC20) / BSC (BEP20)"
                            className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conversion, Limits, Bonus, and Instructions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Exchange Rate (1 USD in BDT)</label>
                      <input
                        type="number"
                        value={activeGateway.conversionRate || 125}
                        onChange={(e) => handleGatewayChange(activeGateway.id, 'conversionRate', Number(e.target.value))}
                        className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Deposit Bonus (%)</label>
                      <input
                        type="number"
                        value={activeGateway.bonusPercent || 50}
                        onChange={(e) => handleGatewayChange(activeGateway.id, 'bonusPercent', Number(e.target.value))}
                        className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Min Deposit ($)</label>
                      <input
                        type="number"
                        value={activeGateway.minDeposit || 10}
                        onChange={(e) => handleGatewayChange(activeGateway.id, 'minDeposit', Number(e.target.value))}
                        className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Max Deposit ($)</label>
                      <input
                        type="number"
                        value={activeGateway.maxDeposit || 5000}
                        onChange={(e) => handleGatewayChange(activeGateway.id, 'maxDeposit', Number(e.target.value))}
                        className="w-full bg-[#121722] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* Instruction text */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-semibold">User Instructions & Payment Note</label>
                    <textarea
                      rows={2}
                      value={activeGateway.instruction || ''}
                      onChange={(e) => handleGatewayChange(activeGateway.id, 'instruction', e.target.value)}
                      placeholder="Enter instruction for users during deposit..."
                      className="w-full bg-[#121722] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SUPPORT & PLATFORM SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-[#101522] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <span>Support Links & Platform Announcement Control</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update Telegram, WhatsApp and Live Support links across all buttons in the platform.
                  </p>
                </div>

                <button
                  onClick={handleSaveSupportSettings}
                  disabled={isSavingSupport}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSupport ? 'Saving...' : 'Save Support Links'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Telegram Links */}
                <div className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                    <Send className="w-4 h-4" />
                    <span>Telegram Configuration</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">Official Support Telegram Link</label>
                    <input
                      type="text"
                      value={supportSettings.telegramLink}
                      onChange={(e) => setSupportSettings({ ...supportSettings, telegramLink: e.target.value })}
                      placeholder="https://t.me/QuotexOfficialSupport"
                      className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">Telegram Signals Channel Link</label>
                    <input
                      type="text"
                      value={supportSettings.telegramChannel}
                      onChange={(e) => setSupportSettings({ ...supportSettings, telegramChannel: e.target.value })}
                      placeholder="https://t.me/QuotexSignalsVIP"
                      className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* WhatsApp Links */}
                <div className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Support</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">WhatsApp Number</label>
                    <input
                      type="text"
                      value={supportSettings.whatsappNumber}
                      onChange={(e) => setSupportSettings({ ...supportSettings, whatsappNumber: e.target.value })}
                      placeholder="+8801700000000"
                      className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">Direct WhatsApp Chat URL</label>
                    <input
                      type="text"
                      value={supportSettings.whatsappUrl}
                      onChange={(e) => setSupportSettings({ ...supportSettings, whatsappUrl: e.target.value })}
                      placeholder="https://wa.me/8801700000000"
                      className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Banner & Email */}
              <div className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Platform Broadcast Notice Banner</span>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supportSettings.showNoticeBanner}
                      onChange={(e) => setSupportSettings({ ...supportSettings, showNoticeBanner: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className="text-xs font-bold text-white">Show Notice on Top Bar</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={supportSettings.noticeBanner}
                    onChange={(e) => setSupportSettings({ ...supportSettings, noticeBanner: e.target.value })}
                    placeholder="e.g. 🚀 50% Deposit Bonus Active! Instant automated deposits via bKash & Nagad."
                    className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">Official Support Email</label>
                    <input
                      type="email"
                      value={supportSettings.supportEmail}
                      onChange={(e) => setSupportSettings({ ...supportSettings, supportEmail: e.target.value })}
                      placeholder="support@nux-trading.com"
                      className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold">Global USD to BDT Currency Rate</label>
                    <input
                      type="number"
                      value={currencyRates['BDT'] || 125}
                      onChange={(e) => setCurrencyRates({ ...currencyRates, BDT: Number(e.target.value) })}
                      className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: AUDIT LOGS */}
        {/* ======================================================== */}
        {activeTab === 'audit' && (
          <div className="bg-[#101522] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Security & Admin Action Logs</span>
              </h2>
              <button
                onClick={fetchAuditLogs}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 font-mono">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-sans">No audit events recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                          {log.action}
                        </span>
                        <span className="text-slate-400 text-[11px]">by {log.adminId}</span>
                      </div>
                      <div className="text-slate-200 text-xs font-sans">{log.details}</div>
                    </div>
                    <div className="text-slate-500 text-[10px] shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD USER */}
      {/* ======================================================== */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e131d] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Create New User Account</span>
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="e.g. Parvez Hasan"
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Email / Username</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+8801700000000"
                    className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="user">Trader (User)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Initial Live Balance ($)</label>
                  <input
                    type="number"
                    value={newUser.balance}
                    onChange={(e) => setNewUser({ ...newUser, balance: Number(e.target.value) })}
                    className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Demo Balance ($)</label>
                  <input
                    type="number"
                    value={newUser.demoBalance}
                    onChange={(e) => setNewUser({ ...newUser, demoBalance: Number(e.target.value) })}
                    className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT USER */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e131d] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Edit User: {editingUser.username}</h3>
                <p className="text-[11px] text-slate-400">Update account credentials, role & status</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                    className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="user">Trader (User)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Account Status</label>
                  <select
                    value={editFormData.accountStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, accountStatus: e.target.value as any })}
                    className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked / Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Verification Status</label>
                <select
                  value={editFormData.verificationStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, verificationStatus: e.target.value as any })}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="verified">Verified (Green Badge)</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Change Password (leave empty to keep current)</label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="New password"
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BALANCE ADJUSTMENT */}
      {/* ======================================================== */}
      {balanceUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e131d] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Adjust User Balance</h3>
                <p className="text-[11px] text-slate-400">Target: {balanceUser.fullName || balanceUser.username}</p>
              </div>
              <button onClick={() => setBalanceUser(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Live Balance:</span>
              <strong className="text-emerald-400 font-mono text-base font-black">
                ${(balanceUser.balance || 0).toFixed(2)}
              </strong>
            </div>

            <form onSubmit={handleBalanceAdjustSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceAdjustType('credit')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      balanceAdjustType === 'credit' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    + Credit
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAdjustType('debit')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      balanceAdjustType === 'debit' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    - Debit
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAdjustType('set')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      balanceAdjustType === 'set' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    = Set Exact
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">
                  {balanceAdjustType === 'set' ? 'New Exact Balance ($)' : 'Amount to Credit / Debit ($)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(Number(e.target.value))}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white text-lg font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Reason / Audit Note</label>
                <input
                  type="text"
                  required
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="e.g. Deposit correction / Manual promotional reward"
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBalanceUser(null)}
                  className="px-4 py-2 bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20"
                >
                  Apply Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TRANSACTION APPROVE / REJECT */}
      {/* ======================================================== */}
      {selectedTxForAction && actionModalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e131d] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                {actionModalType === 'approve' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span>
                  {actionModalType === 'approve' ? 'Approve' : 'Reject'} Transaction #{selectedTxForAction.id}
                </span>
              </h3>
              <button onClick={() => setSelectedTxForAction(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <strong className="text-white">{selectedTxForAction.userId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="font-bold text-white uppercase">{selectedTxForAction.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="font-bold text-emerald-400">{selectedTxForAction.gateway}</span>
              </div>
              {selectedTxForAction.trxId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">TrxID:</span>
                  <span className="font-mono font-bold text-amber-400">{selectedTxForAction.trxId}</span>
                </div>
              )}
              {selectedTxForAction.senderNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender Number:</span>
                  <span className="font-mono text-white">{selectedTxForAction.senderNumber}</span>
                </div>
              )}
              {selectedTxForAction.receiverNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Receiver Account:</span>
                  <span className="font-mono text-cyan-400">{selectedTxForAction.receiverNumber}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-black">
                <span className="text-slate-300">Total Amount:</span>
                <span className="text-emerald-400">${selectedTxForAction.amount.toFixed(2)} USD</span>
              </div>
            </div>

            {actionModalType === 'approve' && selectedTxForAction.type === 'deposit' && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Approving will instantly credit <strong>${(selectedTxForAction.amount + (selectedTxForAction.bonus || 0)).toFixed(2)}</strong> to user's live balance.</span>
              </div>
            )}

            {actionModalType === 'reject' && selectedTxForAction.type === 'withdrawal' && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Rejecting will automatically refund <strong>${selectedTxForAction.amount.toFixed(2)}</strong> back to user's balance.</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold">Admin Note / Reason</label>
              <input
                type="text"
                value={adminActionNote}
                onChange={(e) => setAdminActionNote(e.target.value)}
                placeholder="Optional processing note"
                className="w-full bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedTxForAction(null)}
                className="px-4 py-2 bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessTransaction}
                className={`px-5 py-2 font-black rounded-xl text-xs shadow-lg ${
                  actionModalType === 'approve' ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                }`}
              >
                Confirm {actionModalType === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
