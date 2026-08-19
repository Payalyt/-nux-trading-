import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User,
  Smartphone,
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
import { apiClient, formatErrorMessage } from '../../utils/apiClient';
import { FirebaseService } from '../../utils/firebaseSync';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (user: { email: string; name: string; id: string; currency: string; role?: string; phone?: string }) => void;
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
  const [phone, setPhone] = useState('');
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
      setError('Please enter your username or email address.');
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
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      const user = {
        email: email.trim(),
        name: res.data.user.fullName || (res.data.user.username.charAt(0).toUpperCase() + res.data.user.username.slice(1)),
        id: `#QX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        currency: 'USD',
        role: res.data.user.role,
        phone: res.data.user.phone,
      };

      // Persist directly to Firebase Firestore
      FirebaseService.syncUser({
        username: user.email,
        email: user.email,
        fullName: user.name,
        phone: user.phone || '',
        role: user.role || 'user',
        balance: res.data.user.balance || 0,
        demoBalance: res.data.user.demoBalance || 10000,
        accountStatus: 'active',
        verificationStatus: 'verified',
        createdAt: res.data.user.createdAt || new Date().toISOString()
      });

      onAuthSuccess(user);
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
      setError('Please enter your email address.');
      return;
    }
    if (!phone || !phone.trim()) {
      setError('Please enter your phone number.');
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
      const username = email.trim().toLowerCase();
      const res = await apiClient.post('/api/auth/register', {
        username,
        password,
        fullName: fullName.trim(),
        phone: phone.trim()
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
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {}

      const user = {
        email: email.trim(),
        name: res.data.user.fullName || (res.data.user.username.charAt(0).toUpperCase() + res.data.user.username.slice(1)),
        id: `#QX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        currency: currency,
        role: res.data.user.role || 'user',
        phone: phone.trim(),
      };

      // Persist registered email and profile directly to Firebase Firestore
      FirebaseService.syncUser({
        username: user.email,
        email: user.email,
        fullName: user.name,
        phone: user.phone || '',
        role: user.role || 'user',
        balance: 0,
        demoBalance: 10000,
        accountStatus: 'active',
        verificationStatus: 'verified',
        createdAt: new Date().toISOString()
      });

      onAuthSuccess(user);
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Registration failed.'));
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
            N
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white">NUX</span>
            <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase -mt-1">
              INNOVATIVE TRADING
            </span>
          </div>
        </div>

        <button
          onClick={onBackToTrade}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Terminal</span>
        </button>
      </header>

      {/* Main Content Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-12 items-center justify-center gap-8 lg:gap-16 z-10">
        
        {/* Left Side: Brand Value Proposition & Trust Badges */}
        <div className="flex-1 space-y-6 max-w-lg hidden md:block">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Regulated Next-Gen Digital Platform</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Start Trading with <span className="text-emerald-400">$10,000</span> Free Practice Balance
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Trade 40+ global assets including Forex, Crypto, Indices and Commodities with zero delay execution and up to 95% payout per minute.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">$100 Min Deposit</div>
                <div className="text-[11px] text-slate-400">Trade from $1 minimum stake</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">Instant Withdrawals</div>
                <div className="text-[11px] text-slate-400">bKash, Nagad, Crypto & Cards</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">100,000+ Traders</div>
                <div className="text-[11px] text-slate-400">Active community worldwide</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">256-Bit SSL Security</div>
                <div className="text-[11px] text-slate-400">Strict encrypted data storage</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="w-full max-w-md">
          <div className="bg-[#111622] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-xl">
            
            {/* Top decorative gradient glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative">

              {/* Login / Register Toggle Tabs */}
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
                  <span>{typeof error === 'string' ? error : formatErrorMessage(error)}</span>
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
                    {loading ? 'Logging In...' : 'Log In to NUX'}
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                        placeholder="e.g. Mohammad Rahim"
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-semibold">Email Address *</label>
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

                  {/* Phone Number Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-semibold">Phone Number *</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 01712345678 or +88017..."
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-semibold">Password *</label>
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

      <SocialAuthModal
        isOpen={socialProvider !== null}
        onClose={() => setSocialProvider(null)}
        provider={socialProvider || 'Google'}
        onAuthSuccess={(u) => {
          onAuthSuccess(u);
        }}
      />
    </div>
  );
};
