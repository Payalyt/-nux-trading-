import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2 } from 'lucide-react';
import { UserRecord } from '../../../../server/dbHelper';
import { apiClient } from '../../../utils/apiClient';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ users: UserRecord[] }>('/api/admin/users');
      if (res.ok && res.data) {
        setUsers(res.data.users || []);
      } else {
        setError(res.error || 'Failed to load users');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) return;
    try {
      const res = await apiClient.delete(`/api/admin/users/${encodeURIComponent(username)}`);
      if (res.ok) {
        setUsers(users.filter(u => u.username !== username));
      } else {
        alert(res.error || 'Failed to delete user');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error deleting user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and monitor platform users.</p>
        </div>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors">
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-transparent border-none outline-none text-sm text-white ml-2 w-full placeholder:text-slate-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filter Options
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">User / Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.username} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold uppercase">
                          {user.username.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{user.fullName || user.username}</div>
                          <div className="text-xs text-slate-500">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' || user.role === 'superadmin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.accountStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {user.accountStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-nums font-medium text-emerald-400">
                      ${(user.balance || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.username)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-md transition-colors" 
                          title="Delete"
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
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1 to {users.length} of {users.length} users</span>
          <div className="flex space-x-1">
            <button className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50">Prev</button>
            <button className="px-2 py-1 rounded bg-blue-500 text-white">1</button>
            <button className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
