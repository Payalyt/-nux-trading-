import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Settings, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit3, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  Lock,
  Globe,
  Sliders,
  FileText
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { soundManager } from '../../utils/audio';

interface AdminDashboardProps {
  onBackToTrade: () => void;
  currentUser: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToTrade, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'gateways' | 'controls' | 'logs'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit user modal/state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editDemoBalance, setEditDemoBalance] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editStatus, setEditStatus] = useState('active');

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, txRes, gwRes, setRes, logsRes] = await Promise.all([
        apiClient.get('/api/admin/stats'),
        apiClient.get('/api/admin/users'),
        apiClient.get('/api/admin/transactions'),
        apiClient.get('/api/admin/gateways'),
        apiClient.get('/api/admin/settings'),
        apiClient.get('/api/admin/audit-logs'),
      ]);

      if (statsRes.ok) setStats(statsRes.data);
      if (usersRes.ok) setUsers(usersRes.data.users || []);
      if (txRes.ok) setTransactions(txRes.data.transactions || []);
      if (gwRes.ok) setGateways(gwRes.data.gateways || []);
      if (setRes.ok) setSettings(setRes.data.settings || {});
      if (logsRes.ok) setAuditLogs(logsRes.data.auditLogs || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin data. Ensure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await apiClient.put(`/api/admin/users/${editingUser.username}`, {
        balance: editBalance !== '' ? Number(editBalance) : editingUser.balance,
        demoBalance: editDemoBalance !== '' ? Number(editDemoBalance) : editingUser.demoBalance,
        role: editRole,
        accountStatus: editStatus,
      });

      if (!res.ok) throw new Error(res.error || 'Failed to update user');

      setSuccessMsg(`User ${editingUser.username} updated successfully!`);
      setEditingUser(null);
      soundManager.playWin();
      fetchAdminData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) return;
    try {
      const res = await apiClient.delete(`/api/admin/users/${username}`);
      if (!res.ok) throw new Error(res.error || 'Failed to delete user');
      setSuccessMsg(`User ${username} deleted.`);
      fetchAdminData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user');
    }
  };

  const handleTransactionStatus = async (id: string, status: 'approved' | 'rejected') => {
    const note = prompt(`Enter optional admin note for ${status} transaction #${id}:`, '');
    try {
      const res = await apiClient.post(`/api/admin/transactions/${id}/status`, {
        status,
        adminNote: note || ''
      });
      if (!res.ok) throw new Error(res.error || 'Failed to update transaction');
      setSuccessMsg(`Transaction #${id} marked as ${status}!`);
      soundManager.playWin();
      fetchAdminData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update transaction');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.put('/api/admin/settings', settings);
      if (!res.ok) throw new Error(res.error || 'Failed to update settings');
      setSuccessMsg('Platform settings saved successfully!');
      soundManager.playWin();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings');
    }
  };

  const handleSaveGateway = async (gw: any) => {
    try {
      const res = await apiClient.post('/api/admin/gateways', gw);
      if (!res.ok) throw new Error(res.error || 'Failed to save gateway');
      setSuccessMsg(`Gateway ${gw.name} updated!`);
      soundManager.playWin();
      fetchAdminData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save gateway');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#090d15] text-slate-100 flex flex-col h-screen overflow-hidden selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-[#0e131d] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToTrade}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors flex items-center space-x-1"
          >
            <span>← Back to Platform</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-black">
              🛡️
            </div>
            <div>
              <h1 className="text-base font-bold text-white">NUX Admin Control Center</h1>
              <p className="text-[10px] text-emerald-400 font-mono">Logged in as: {currentUser?.email || 'Admin'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all border border-emerald-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </header>

      {/* Sub Header Navigation Tabs */}
      <div className="bg-[#0b1019] px-6 flex items-center space-x-2 border-b border-white/10 shrink-0 overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Overview & Stats', icon: DollarSign },
          { id: 'users', label: '👥 User Control', icon: Users },
          { id: 'transactions', label: '💳 Deposits & Withdrawals', icon: CreditCard },
          { id: 'gateways', label: '🏦 Payment Gateways', icon: Settings },
          { id: 'controls', label: '⚙️ Frontend & Platform Controls', icon: Sliders },
          { id: 'logs', label: '📜 Audit Logs', icon: FileText },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification banners */}
      {(error || successMsg) && (
        <div className="px-6 py-2 shrink-0">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold">×</button>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="font-bold">×</button>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#121824] border border-white/10 shadow-lg">
                <div className="text-slate-400 text-xs font-semibold mb-1">Total Registered Users</div>
                <div className="text-2xl font-black text-white">{stats.totalUsers}</div>
                <div className="text-[10px] text-emerald-400 mt-2">Active platform members</div>
              </div>

              <div className="p-5 rounded-xl bg-[#121824] border border-white/10 shadow-lg">
                <div className="text-slate-400 text-xs font-semibold mb-1">Total User Balance</div>
                <div className="text-2xl font-black text-emerald-400">${stats.totalBalance?.toFixed(2) || '0.00'}</div>
                <div className="text-[10px] text-slate-400 mt-2">Combined live balances</div>
              </div>

              <div className="p-5 rounded-xl bg-[#121824] border border-white/10 shadow-lg">
                <div className="text-slate-400 text-xs font-semibold mb-1">Approved Deposits</div>
                <div className="text-2xl font-black text-emerald-400">${stats.totalDeposits?.toFixed(2) || '0.00'}</div>
                <div className="text-[10px] text-emerald-400 mt-2">Successful capital injections</div>
              </div>

              <div className="p-5 rounded-xl bg-[#121824] border border-white/10 shadow-lg">
                <div className="text-slate-400 text-xs font-semibold mb-1">Approved Withdrawals</div>
                <div className="text-2xl font-black text-amber-400">${stats.totalWithdrawals?.toFixed(2) || '0.00'}</div>
                <div className="text-[10px] text-amber-400 mt-2">Processed payouts</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Action Alerts */}
              <div className="p-6 rounded-xl bg-[#121824] border border-white/10">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Pending Requests Requiring Admin Attention</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-xs text-slate-300">Pending Deposit Requests</span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                      {stats.pendingDepositsCount} Pending
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-xs text-slate-300">Pending Withdrawal Requests</span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                      {stats.pendingWithdrawalsCount} Pending
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    Manage Pending Transactions
                  </button>
                </div>
              </div>

              {/* Quick Platform Controls Info */}
              <div className="p-6 rounded-xl bg-[#121824] border border-white/10">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Frontend Control Status</span>
                </h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Site Title</span>
                    <span className="font-semibold text-white">{settings?.platformControls?.siteTitle || 'NUX Trading'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Maintenance Mode</span>
                    <span className={`font-bold ${settings?.platformControls?.maintenanceMode ? 'text-red-400' : 'text-emerald-400'}`}>
                      {settings?.platformControls?.maintenanceMode ? 'ACTIVE (Locked)' : 'OFF (Normal)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Trading Payout</span>
                    <span className="font-semibold text-emerald-400">{settings?.platformControls?.tradingPayoutPercentage || 87}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Minimum Deposit</span>
                    <span className="font-semibold text-white">$100.00</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('controls')}
                    className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Edit Platform Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- USERS CONTROL TAB --- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white">Registered Users ({users.length})</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by username, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#121824] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#121824]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1a2333] text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">User / Email</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Live Balance</th>
                    <th className="p-3">Demo Balance</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.username} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-white">{u.username}</td>
                      <td className="p-3 text-slate-300">{u.fullName || '—'}</td>
                      <td className="p-3 text-slate-400 font-mono">{u.phone || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-400">${u.balance?.toFixed(2) || '0.00'}</td>
                      <td className="p-3 font-bold text-slate-400">${u.demoBalance?.toFixed(2) || '10000.00'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.accountStatus === 'blocked' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {u.accountStatus || 'active'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setEditBalance(String(u.balance || 0));
                            setEditDemoBalance(String(u.demoBalance || 10000));
                            setEditRole(u.role || 'user');
                            setEditStatus(u.accountStatus || 'active');
                          }}
                          className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        {u.username !== currentUser?.email && (
                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TRANSACTIONS TAB --- */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">Deposit & Withdrawal Requests ({transactions.length})</h3>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#121824]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1a2333] text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">ID / Date</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Gateway</th>
                    <th className="p-3">TrxID / Details</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{tx.id}</div>
                        <div className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">{tx.userId}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 font-black text-white">${tx.amount.toFixed(2)}</td>
                      <td className="p-3 text-slate-300">{tx.gateway}</td>
                      <td className="p-3 font-mono text-slate-300">
                        {tx.trxId || tx.receiverNumber || tx.senderNumber || '—'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'approved' || tx.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : tx.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {tx.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleTransactionStatus(tx.id, 'approved')}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleTransactionStatus(tx.id, 'rejected')}
                              className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {tx.status !== 'pending' && (
                          <span className="text-[10px] text-slate-500 font-semibold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500">No transactions recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- GATEWAYS TAB --- */}
        {activeTab === 'gateways' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">Payment Gateways Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gateways.map((gw) => (
                <div key={gw.id} className="p-5 rounded-xl bg-[#121824] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{gw.icon}</span>
                      <h4 className="font-bold text-white text-sm">{gw.name}</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gw.active !== false}
                        onChange={(e) => {
                          const updated = { ...gw, active: e.target.checked };
                          handleSaveGateway(updated);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>Min Deposit: <strong className="text-white">${gw.minDeposit}</strong> | Max: <strong className="text-white">${gw.maxDeposit}</strong></div>
                    {gw.sendMoneyNumber && <div>Send Money No: <strong className="font-mono text-emerald-400">{gw.sendMoneyNumber}</strong></div>}
                    {gw.cryptoDetails?.walletAddress && <div>Wallet: <strong className="font-mono text-amber-400 truncate block">{gw.cryptoDetails.walletAddress}</strong></div>}
                  </div>
                  <button
                    onClick={() => {
                      const newNo = prompt(`Update Send Money / Wallet address for ${gw.name}:`, gw.sendMoneyNumber || gw.cryptoDetails?.walletAddress || '');
                      if (newNo !== null) {
                        const updated = { ...gw };
                        if (updated.sendMoneyNumber !== undefined) updated.sendMoneyNumber = newNo;
                        if (updated.cryptoDetails) updated.cryptoDetails.walletAddress = newNo;
                        handleSaveGateway(updated);
                      }
                    }}
                    className="w-full py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                  >
                    Quick Edit Numbers / Wallet
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CONTROLS TAB --- */}
        {activeTab === 'controls' && settings && settings.platformControls && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
            <h3 className="text-sm font-bold text-white">Frontend & Platform Settings</h3>

            <div className="p-6 rounded-xl bg-[#121824] border border-white/15 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Site Title</label>
                  <input
                    type="text"
                    value={settings.platformControls.siteTitle || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      platformControls: { ...settings.platformControls, siteTitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-[#090d15] border border-white/10 text-xs text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Trading Payout Percentage (%)</label>
                  <input
                    type="number"
                    value={settings.platformControls.tradingPayoutPercentage || 87}
                    onChange={(e) => setSettings({
                      ...settings,
                      platformControls: { ...settings.platformControls, tradingPayoutPercentage: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-[#090d15] border border-white/10 text-xs text-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Banner Text (Top Ticker)</label>
                <input
                  type="text"
                  value={settings.platformControls.noticeBannerText || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    platformControls: { ...settings.platformControls, noticeBannerText: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d15] border border-white/10 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.platformControls.maintenanceMode || false}
                  onChange={(e) => setSettings({
                    ...settings,
                    platformControls: { ...settings.platformControls, maintenanceMode: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="maintenanceMode" className="text-xs font-bold text-red-400">
                  Enable Maintenance Mode (Locks platform and displays maintenance message to users)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Maintenance Message</label>
                <input
                  type="text"
                  value={settings.platformControls.maintenanceMessage || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    platformControls: { ...settings.platformControls, maintenanceMessage: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d15] border border-white/10 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Platform Settings</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* --- AUDIT LOGS TAB --- */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">System & Admin Audit Logs</h3>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#121824]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1a2333] text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Admin</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-semibold text-white">{log.adminId}</td>
                      <td className="p-3 font-bold text-emerald-400">{log.action}</td>
                      <td className="p-3 text-slate-300">{log.details}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">No audit logs recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-white/15 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-white">Edit User: {editingUser.username}</h3>
            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Live Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d15] border border-white/10 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Demo Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editDemoBalance}
                  onChange={(e) => setEditDemoBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d15] border border-white/10 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d15] border border-white/10 text-xs text-white focus:border-emerald-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d15] border border-white/10 text-xs text-white focus:border-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-black cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
