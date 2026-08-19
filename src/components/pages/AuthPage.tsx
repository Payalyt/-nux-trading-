import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  ArrowLeft, 
  DollarSign, 
  HelpCircle,
  KeyRound,
  Zap,
  Globe,
  Users,
  Award
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { SocialAuthModal } from '../modals/SocialAuthModal';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (user: { email: string; name: string; id: string; currency: string }) => void;
  onBackToTrade: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  onBackToTrade,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialProvider, setSocialProvider] = useState<'Google' | 'Facebook' | 'VK' | null>(null);

  const currencies = [
    { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
    { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
    { code: 'BDT', symbol: '৳', label: 'BDT (৳) - Bangladeshi Taka' },
    { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
    { code: 'BRL', symbol: 'R$', label: 'BRL (R$) - Brazilian Real' },
    { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
    { code: 'IDR', symbol: 'Rp', label: 'IDR (Rp) - Indonesian Rupiah' },
    { code: 'VND', symbol: '₫', label: 'VND (₫) - Vietnamese Dong' },
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
      const username = email.includes('@') ? email.split('@')[0] : email;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Account not available or invalid credentials.');
      }

      soundManager.playWin();
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}

      const user = {
        email: email.trim(),
        name: data.user.username.charAt(0).toUpperCase() + data.user.username.slice(1),
        id: `#QX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        currency: 'USD',
        role: data.user.role,
      };
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Account not available or invalid credentials.');
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
      setError('You must confirm that you are at least 18 years old and accept the Service Agreement.');
      return;
    }

    setLoading(true);
    try {
      const username = email.includes('@') ? email.split('@')[0] : email;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, fullName: fullName.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      soundManager.playWin();
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {}

      const user = {
        email: email.trim(),
        name: data.user.fullName || (data.user.username.charAt(0).toUpperCase() + data.user.username.slice(1)),
        id: `#QX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        currency: currency,
        role: data.user.role,
      };
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'Google' | 'Facebook' | 'VK') => {
    setSocialProvider(provider);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) return;
    setForgotSubmitted(true);
    soundManager.playWin();
  };

  return (
    <div className="flex-1 bg-[#090d15] text-slate-100 flex flex-col min-h-screen overflow-y-auto relative selection:bg-emerald-500 selection:text-black">
      {/* Background glowing effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between z-10 bg-[#0e131d]/80 backdrop-blur-md">
        <div 
          onClick={onBackToTrade}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            Q
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white">QUOTEX</span>
            <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase -mt-1">
              INNOVATIVE TRADING
            </span>
          </div>
        </div>

        <button
          onClick={onBackToTrade}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trading Chart</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero / Perks Column (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block pr-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL BROKER PLATFORM</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Trade global markets with zero commission
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Join over 4,000,000+ traders worldwide. Instant execution on currencies, crypto, commodities, and OTC assets.
            </p>

            {/* Feature Badges */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0 font-bold">
                  $
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">$10,000 Free Demo Balance</h4>
                  <p className="text-[11px] text-slate-400">Practice risk-free with infinite free balance refills</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Payouts & 0% Fee</h4>
                  <p className="text-[11px] text-slate-400">Local payment methods: bKash, Nagad, Binance Pay & USDT</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Up to 98% Profit per Trade</h4>
                  <p className="text-[11px] text-slate-400">Ultra-fast 5s to 4h binary options contracts</p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-white/10">
              <div>
                <div className="text-lg font-black font-mono-nums text-emerald-400">4.2M+</div>
                <div className="text-[10px] text-slate-400 font-semibold">Active Traders</div>
              </div>
              <div>
                <div className="text-lg font-black font-mono-nums text-white">$10</div>
                <div className="text-[10px] text-slate-400 font-semibold">Min. Deposit</div>
              </div>
              <div>
                <div className="text-lg font-black font-mono-nums text-emerald-400">&lt; 10s</div>
                <div className="text-[10px] text-slate-400 font-semibold">Fast Execution</div>
              </div>
            </div>
          </div>

          {/* Right Authentication Card (7 cols on lg) */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            <div className="bg-[#121722] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
              
              {/* Login / Registration Tabs Header */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  id="tab-auth-login"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`py-3 rounded-xl transition-all cursor-pointer uppercase tracking-wider ${
                    mode === 'login'
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  id="tab-auth-register"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`py-3 rounded-xl transition-all cursor-pointer uppercase tracking-wider ${
                    mode === 'register'
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Registration
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                  <span>{error}</span>
                </div>
              )}

              {/* Forgot Password Drawer View */}
              {isForgotPassOpen ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassOpen(false);
                        setForgotSubmitted(false);
                      }}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      Back to Log In
                    </button>
                  </div>

                  {forgotSubmitted ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h4 className="text-sm font-bold text-white">Password Reset Link Sent</h4>
                      <p className="text-xs text-slate-300">
                        We have sent instructions and a recovery link to <strong className="text-white">{forgotEmail}</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassOpen(false);
                          setForgotSubmitted(false);
                        }}
                        className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl"
                      >
                        Return to Log In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                      <p className="text-xs text-slate-400">
                        Enter your registered email address and we'll send you a link to reset your password.
                      </p>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-semibold">Email</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        Send Reset Instructions
                      </button>
                    </form>
                  )}
                </div>
              ) : mode === 'login' ? (
                /* LOG IN FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Input */}
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

                  {/* Password Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-400 font-semibold">Password</label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassOpen(true)}
                        className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                      >
                        Forgot your password?
                      </button>
                    </div>
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

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="text-xs text-slate-300 cursor-pointer">
                      Remember this browser
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Logging In...' : 'Log In to Quotex'}
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Full Name Input */}
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

                  {/* Email Input */}
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

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-semibold">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create strong password (min. 6 chars)"
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

                  {/* Currency Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-semibold">Account Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#121722] text-white">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Terms & Age Verification Checkbox */}
                  <div className="flex items-start space-x-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer mt-0.5"
                    />
                    <label htmlFor="terms-checkbox" className="text-[11px] text-slate-300 leading-relaxed cursor-pointer">
                      I confirm that I am 18 years old or older and accept the{' '}
                      <span className="text-emerald-400 hover:underline">Service Agreement</span> and Privacy Policy.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Registration (Get $10,000 Demo)'}
                  </button>
                </form>
              )}

              {/* Social Login Options */}
              {!isForgotPassOpen && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="text-center text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Or continue with
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Google')}
                      className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <span className="font-bold text-red-400">G</span>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Practice Mode switch */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onBackToTrade}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  ⚡ Continue to Demo Practice Account without signing in
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 border-t border-white/5 text-center text-[11px] text-slate-500 z-10">
        © 2026 Quotex. Financial operations provided on this site involve high risks.
      </footer>

      <SocialAuthModal
        isOpen={!!socialProvider}
        provider={socialProvider}
        currency={currency}
        onClose={() => setSocialProvider(null)}
        onSuccess={(user) => {
          onAuthSuccess(user);
        }}
      />
    </div>
  );
};
