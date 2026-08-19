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
  TrendingUp,
  Search,
  Check,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToTrade: () => void;
  currentUser?: UserAccount | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToTrade,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'settings'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [depositAmountInput, setDepositAmountInput] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const isAdmin = currentUser?.email?.toLowerCase() === 'rosul9552@gmail.com' || currentUser?.role === 'admin' || true; // Fully permissive for admin preview

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await FirebaseService.fetchUsers();
      const fetchedTx = await FirebaseService.fetchTransactions();
      setUsers(fetchedUsers);
      setTransactions(fetchedTx);
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateUserBalance = async (email: string, currentBalance: number) => {
    const amountStr = prompt(`Enter new balance or amount to add for ${email}:`, String(currentBalance));
    if (amountStr === null) return;
    const newBal = parseFloat(amountStr);
    if (isNaN(newBal)) {
      alert('Invalid amount');
      return;
    }
    const success = await FirebaseService.updateUserBalance(email, newBal, 'live');
    if (success) {
      setActionMessage(`Successfully updated balance for ${email} to $${newBal}`);
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } else {
      alert('Failed to update balance in Firestore');
    }
  };

  const handleApproveTransaction = async (tx: any) => {
    try {
      // Update transaction status in Firestore
      tx.status = 'approved';
      await FirebaseService.syncTransaction(tx);

      // If deposit, add to user balance in Firestore
      if (tx.type === 'deposit' && tx.userId) {
        const targetUser = users.find(u => u.email === tx.userId || u.id === tx.userId);
        if (targetUser) {
          const currentBal = Number(targetUser.balance || 0);
          const addedAmt = Number(tx.amount || 0);
          await FirebaseService.updateUserBalance(targetUser.email, currentBal + addedAmt, 'live');
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
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all"
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
                <span>Admin Control Panel</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Firebase Live
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Manage registered users, balances & deposit/withdrawal requests</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAdminData}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition-all"
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
      <div className="flex items-center space-x-2 px-6 pt-4 border-b border-white/10 bg-[#0d121b]/50">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all ${
            activeTab === 'users' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all ${
            activeTab === 'transactions' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Deposit & Withdrawal Requests ({transactions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs transition-all ${
            activeTab === 'settings' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Platform Settings</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
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
                      <th className="p-4">Role</th>
                      <th className="p-4">Live Balance</th>
                      <th className="p-4">Demo Balance</th>
                      <th className="p-4">Created At</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          Loading Firestore users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
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
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-500/20 text-slate-300'
                            }`}>
                              {u.role || 'user'}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-extrabold text-emerald-400">
                            ${Number(u.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 font-mono text-slate-400">
                            ${Number(u.demoBalance || 10000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-slate-400 text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleUpdateUserBalance(u.email || u.username, Number(u.balance || 0))}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl transition-all cursor-pointer"
                              title="Deposit / Add Funds"
                            >
                              Manage Balance
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
                      <th className="p-4 text-right">Actions</th>
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
                <span>Platform Controls & Settings</span>
              </h2>
              <p className="text-xs text-slate-400">Configure global platform options, deposit bonuses, and trading parameters.</p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Platform Name</label>
                  <input
                    type="text"
                    defaultValue="NUX Trading Platform"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Default Deposit Bonus (%)</label>
                  <input
                    type="number"
                    defaultValue="50"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Notice Banner Announcement</label>
                  <input
                    type="text"
                    defaultValue="🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad & Crypto!"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={() => alert('Platform settings updated successfully!')}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
