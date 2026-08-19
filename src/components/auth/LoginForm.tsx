import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

interface LoginFormProps {
  onLoginSuccess: (user: { username: string; role: 'user' | 'admin' }) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await apiClient.post('/api/auth/login', {
        username: username.trim(),
        password
      });

      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Login failed. Please check your credentials.');
      }

      onLoginSuccess(res.data.user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-[#0d121b]/90 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-400">Log in to access your file-secured account & admin dashboard</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or john_doe"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-white/10">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
          >
            Register Now
          </button>
        </p>
      </div>

      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 text-center">
        💡 Default Admin Account: <code className="text-emerald-400 font-mono">admin</code> / <code className="text-emerald-400 font-mono">Admin123!</code>
      </div>
    </div>
  );
};
