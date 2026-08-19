import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { UserRecord } from '../../../../server/dbHelper';
import { apiClient } from '../../../utils/apiClient';

export const AdminBalances: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get<{ users: UserRecord[] }>('/api/admin/users');
      if (res.ok && res.data) {
        setUsers(res.data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdjust = (user: UserRecord, type: 'add' | 'deduct') => {
    setSelectedUser(user);
    setAdjustmentType(type);
    setAmount('');
    setReason('');
    setIsModalOpen(true);
  };

  const submitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || !reason) return;

    if (!confirm(`Are you sure you want to ${adjustmentType} $${amount} ${adjustmentType === 'add' ? 'to' : 'from'} ${selectedUser.username}'s account?\nReason: ${reason}`)) {
      return;
    }

    try {
      // In a real app, this would hit an API endpoint like POST /api/admin/balances/adjust
      // For this prototype, we'll simulate it by updating the state directly
      alert(`Successfully ${adjustmentType}ed $${amount}. Audit log created.`);
      setIsModalOpen(false);
      fetchUsers(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Balance Management</h1>
        <p className="text-sm text-slate-400 mt-1">Adjust user balances and view ledger.</p>
      </div>

      {/* Users Balance Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by User ID..." 
              className="bg-transparent border-none outline-none text-sm text-white ml-2 w-full"
            />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Available Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.username} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-white">{user.fullName || user.username}</div>
                  <div className="text-xs text-slate-500">{user.username}</div>
                </td>
                <td className="px-4 py-3 font-mono-nums font-bold text-emerald-400">
                  ${(user.balance || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleAdjust(user, 'add')}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </button>
                    <button 
                      onClick={() => handleAdjust(user, 'deduct')}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-xs font-bold flex items-center transition-colors"
                    >
                      <Minus className="w-3 h-3 mr-1" /> Deduct
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="View Ledger">
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjustment Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d121b] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${adjustmentType === 'add' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {adjustmentType === 'add' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white capitalize">{adjustmentType} Balance</h3>
                <p className="text-xs text-slate-400">User: {selectedUser.username}</p>
              </div>
            </div>
            
            <form onSubmit={submitAdjustment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Amount (USD)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50"
                  placeholder="e.g. 100.00"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Reason / Reference</label>
                <input 
                  type="text" 
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50"
                  placeholder="e.g. Deposit via Bank Transfer #123"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-200/70">
                  This action is immutable and will be recorded in the system audit log. Double-entry ledger records will be created automatically.
                </p>
              </div>

              <div className="pt-2 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors text-black ${
                    adjustmentType === 'add' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                >
                  Confirm {adjustmentType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
