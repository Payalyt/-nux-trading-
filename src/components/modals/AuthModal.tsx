import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { SocialAuthModal } from './SocialAuthModal';
import { apiClient, formatErrorMessage } from '../../utils/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess: (user: { email: string; name: string; id: string; currency: string; role?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [socialProvider, setSocialProvider] = useState<'Google' | 'Facebook' | 'VK' | null>(null);

  if (!isOpen) return null;

  const currencies = [
    { code: 'USD', label: 'USD ($) - US Dollar' },
    { code: 'EUR', label: 'EUR (€) - Euro' },
    { code: 'BDT', label: 'BDT (৳) - Bangladeshi Taka' },
    { code: 'INR', label: 'INR (₹) - Indian Rupee' },
    { code: 'BRL', label: 'BRL (R$) - Brazilian Real' },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your username or email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const username = email.trim().toLowerCase();
      const res = await apiClient.post('/api/auth/login', { username, password });

      if (!res.ok || !res.data) {
        const errorMsg = formatErrorMessage(
          res.error || res.data?.message || res.data?.error || res.data,
          'Account not available or invalid credentials.'
        );
        throw new Error(errorMsg);
      }

      soundManager.playWin();
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}

      const user = {
        email: email.trim(),
        name: res.data.user.fullName || (res.data.user.username.charAt(0).toUpperCase() + res.data.user.username.slice(1)),
        id: `#QX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        currency: 'USD',
        role: res.data.user.role,
      };
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Account not available or invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email) {
      setError('Please enter a username or email.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept the terms to register.');
      return;
    }

    setLoading(true);
    try {
      const username = email.trim().toLowerCase();
      const res = await apiClient.post('/api/auth/register', {
        username,
        password,
        fullName: fullName.trim()
      });

      if (!res.ok || !res.data) {
        const errorMsg = formatErrorMessage(
          res.error || res.data?.message || res.data?.error || res.data,
          'Registration failed. Please check your details and try again.'
        );
        throw new Error(errorMsg);
      }

      soundManager.playWin();
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      const user = {
        email: email.trim(),
        name: res.data.user.fullName || (res.data.user.username.charAt(0).toUpperCase() + res.data.user.username.slice(1)),
        id: `#QX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        currency: currency,
        role: res.data.user.role,
      };
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'Google' | 'Facebook' | 'VK') => {
    setSocialProvider(provider);
  };

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="auth-modal-dialog"
        className="bg-[#121722] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-black text-lg shadow-md shadow-emerald-500/20">
              Q
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quotex Trading</h2>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                {mode === 'login' ? 'Sign In to Your Account' : 'Open Real or Demo Account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider ${
                mode === 'login'
                  ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider ${
                mode === 'register'
                  ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registration
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {typeof error === 'string' ? error : formatErrorMessage(error)}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Email or User ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. trader@example.com"
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-0.5">
                <input
                  type="checkbox"
                  id="remember-modal"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="remember-modal" className="text-xs text-slate-300 cursor-pointer">
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. trader@example.com"
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#121722]">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start space-x-2 pt-0.5">
                <input
                  type="checkbox"
                  id="agree-modal"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded cursor-pointer mt-0.5"
                />
                <label htmlFor="agree-modal" className="text-[11px] text-slate-300 cursor-pointer">
                  I confirm that I am 18+ years old and accept terms.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Sign Up (Free $10k Demo)'}
              </button>
            </form>
          )}

          {/* Social auth */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div>
              <button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <span className="font-bold text-red-400">G</span>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <SocialAuthModal
        isOpen={!!socialProvider}
        provider={socialProvider}
        currency={currency}
        onClose={() => setSocialProvider(null)}
        onSuccess={(user) => {
          onAuthSuccess(user);
          onClose();
        }}
      />
    </div>
  );
};
