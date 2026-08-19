import React, { useState } from 'react';
import { Lock, User, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

interface RegistrationFormProps {
  onRegisterSuccess: (user: { username: string; role: 'user' | 'admin' }) => void;
  onSwitchToLogin: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.post('/api/auth/register', {
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        password,
      });

      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Registration failed. Please try again.');
      }

      onRegisterSuccess(res.data.user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-[#0d121b]/90 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
        <p className="text-xs text-slate-400">New users get a secure text record in <code className="text-teal-400 font-mono">files/database/</code></p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username / Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex_trader or alex@gmail.com"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
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
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirm Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Creating Record...' : 'Register'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-white/10">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-teal-400 hover:text-teal-300 font-bold ml-1 cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
