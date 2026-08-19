import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  ShieldAlert, 
  Trash2, 
  Mail, 
  Calendar, 
  Plus, 
  Phone, 
  X, 
  Search, 
  Edit3, 
  Check, 
  Copy, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Smartphone,
  RefreshCw,
  Lock,
  ArrowUpDown
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { UserAccount } from '../../types/trading';

interface AdminPanelPageProps {
  user: UserAccount | null;
  onLogout?: () => void;
}

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ user }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Add User State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit User State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('qx_token='))
        ?.split('=')[1];

      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch users. Admin privileges required.');
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCopy = (text: string, label: string) => {
    soundManager.playClick();
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDelete = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action is irreversible.`)) return;
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('qx_token='))
        ?.split('=')[1];

      const res = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user.');
      }
      soundManager.playWin();
      setUsers(prev => prev.filter(u => u.username !== username));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('qx_token='))
        ?.split('=')[1];

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newEmail.trim().toLowerCase(),
          password: newPassword,
          fullName: newFullName.trim(),
          role: newRole,
          phone: newPhone.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      soundManager.playWin();
      setUsers(prev => [data.user, ...prev]);
      setIsAddModalOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      setNewPhone('');
      setNewRole('user');
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const openEditModal = (u: any) => {
    soundManager.playClick();
    setEditingUser(u);
    setEditFullName(u.fullName || '');
    setEditPhone(u.phone || '');
    setEditRole(u.role || 'user');
    setEditPassword('');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');
    setIsUpdating(true);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('qx_token='))
        ?.split('=')[1];

      const res = await fetch(`/api/admin/users/${encodeURIComponent(editingUser.username)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          phone: editPhone.trim(),
          role: editRole,
          password: editPassword ? editPassword : undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      soundManager.playWin();
      setUsers(prev => prev.map(u => u.username === editingUser.username ? data.user : u));
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesRole;

      const name = (u.fullName || '').toLowerCase();
      const email = (u.username || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();

      return matchesRole && (name.includes(q) || email.includes(q) || phone.includes(q));
    });
  }, [users, roleFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const traders = users.filter(u => u.role === 'user').length;
    const withPhone = users.filter(u => u.phone && u.phone.trim().length > 0).length;
    return { total, admins, traders, withPhone };
  }, [users]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0d14]">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">You must be logged in as an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0d14] p-4 sm:p-6 lg:p-8 relative select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Live Database & User Management Center for Quotex Platform.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchUsers}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title="Refresh User Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#12161f]/80 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-nums mt-1">{stats.total}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#12161f]/80 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Traders</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono-nums mt-1">{stats.traders}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#12161f]/80 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Admins</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono-nums mt-1">{stats.admins}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#12161f]/80 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phones Verified</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono-nums mt-1">{stats.withPhone}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#12161f]/60 p-3 rounded-2xl border border-white/10">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone number..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter Buttons */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5 shrink-0">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'all' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'user' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Traders ({stats.traders})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admins ({stats.admins})
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Users Table / Mobile Cards */}
        <div className="bg-[#12161f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-sm sm:text-base">
                User Records ({filteredUsers.length})
              </span>
            </div>
            {copiedText && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 animate-fade-in">
                ✓ Copied {copiedText}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-400 font-medium">Loading user database...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No users found matching your criteria.</p>
              <p className="text-xs text-slate-600">Try changing the search keyword or filter.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-black/40 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Full Name & Email</th>
                      <th className="px-6 py-3.5">Phone Number</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Registered</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.username} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                              {(u.fullName ? u.fullName[0] : u.username[0]).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white text-sm">{u.fullName || 'No Name'}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-xs text-slate-400 font-mono">{u.username}</span>
                                <button
                                  onClick={() => handleCopy(u.username, 'Email')}
                                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                  title="Copy Email"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {u.phone ? (
                            <div className="flex items-center space-x-2 text-slate-300 font-mono text-xs">
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{u.phone}</span>
                              <button
                                onClick={() => handleCopy(u.phone, 'Phone')}
                                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                title="Copy Phone Number"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600 italic">No Phone Added</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              TRADER
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono-nums">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit User Info"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {u.username !== user?.email && (
                              <button
                                onClick={() => handleDelete(u.username)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <div key={u.username} className="p-4 space-y-3 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                          {(u.fullName ? u.fullName[0] : u.username[0]).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{u.fullName || 'No Name'}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{u.username}</div>
                        </div>
                      </div>

                      {u.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          ADMIN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          TRADER
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-black/20 p-2.5 rounded-xl border border-white/5 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Phone</span>
                        <span className="text-slate-300">{u.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Created</span>
                        <span className="text-slate-300">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {u.username !== user?.email && (
                        <button
                          onClick={() => handleDelete(u.username)}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#12161f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Create New User Account</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              {addError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-medium">
                  {addError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email / Username *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  placeholder="trader@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  placeholder="+8801700000000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="user" className="bg-[#121722]">User (Trader)</option>
                  <option value="admin" className="bg-[#121722]">Admin (Full Access)</option>
                </select>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center cursor-pointer"
                >
                  {isAdding ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#12161f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <span>Edit User: {editingUser.username}</span>
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-5 space-y-4">
              {editError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-medium">
                  {editError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  placeholder="+8801700000000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="user" className="bg-[#121722]">User (Trader)</option>
                  <option value="admin" className="bg-[#121722]">Admin (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (Leave blank to keep unchanged)</label>
                <input
                  type="password"
                  minLength={6}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center cursor-pointer"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
