import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  ArrowLeft, 
  DollarSign, 
  Zap,
  Globe,
  Award,
  CandlestickChart,
  Lock
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { FirebaseService } from '../../utils/firebaseSync';
import { saveUserSession } from '../../utils/cookies';
import { auth } from '../../firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult 
} from 'firebase/auth';
import { SiteLogo } from '../common/SiteLogo';
import { GoogleIcon } from '../common/GoogleIcon';
import { triggerDirectGoogleLogin } from '../../utils/googleAuth';

interface AuthPageProps {
  platformName?: string;
  initialMode?: 'login' | 'register';
  onAuthSuccess: (user: { email: string; name: string; id: string; currency: string; role?: string; phone?: string }) => void;
  onBackToTrade: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  platformName = 'NUX',
  onAuthSuccess,
  onBackToTrade,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    await triggerDirectGoogleLogin(
      (userAccount) => {
        setLoading(false);
        onAuthSuccess(userAccount);
      },
      (err) => {
        setLoading(false);
        setError(err);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <SiteLogo size="lg" showTagline={true} />

        <button
          onClick={onBackToTrade}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Terminal</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        {/* Header/Branding section: Order 1 on mobile, Top-Left on desktop */}
        <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1 space-y-6 text-left order-1">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast 1-Click Google Authentication</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Start Trading on <span className="text-emerald-400">{platformName}</span> in Seconds
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Connect directly with your Google account. No lengthy registration forms, instant demo balance, and immediate access to global financial markets.
          </p>
        </div>

        {/* Auth Card section: Order 2 on mobile, Right column spanning 2 rows on desktop */}
        <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:row-span-2 flex justify-center order-2 lg:order-none">
          <div className="w-full max-w-md bg-[#101624] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-block p-3 rounded-2xl bg-white/5 border border-white/10 mb-1">
                <GoogleIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Sign In with Google</h3>
              <p className="text-xs text-slate-400">One-click seamless authentication to your trading terminal</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                id="btn-google-auth-main"
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading}
                className="w-full py-4 px-5 bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-black text-sm rounded-2xl shadow-xl shadow-white/10 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2 text-slate-800">
                    <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in with Google...</span>
                  </div>
                ) : (
                  <>
                    <GoogleIcon className="w-6 h-6" />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Protected by Google Identity & Cloud Security</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Your credentials and financial records remain safe and synchronized automatically.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={onBackToTrade}
                className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
              >
                Continue as Guest / Practice Terminal →
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards section: Order 3 on mobile, Bottom-Left on desktop */}
        <div className="lg:col-span-6 lg:col-start-1 lg:row-start-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 order-3 lg:order-none">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">$10,000 Demo Fund</h4>
            <p className="text-[11px] text-slate-400">Risk-free binary trading with instant refill capabilities.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">98% High Payouts</h4>
            <p className="text-[11px] text-slate-400">Industry-leading return rates across 400+ active assets.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Instant Execution</h4>
            <p className="text-[11px] text-slate-400">Ultra low-latency order matching without price slippage.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Secure Cloud Sync</h4>
            <p className="text-[11px] text-slate-400">256-bit encrypted data protection & 24/7 withdrawals.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-[11px] text-slate-500 border-t border-white/5 z-10">
        © 2026 {platformName} Trading. All rights reserved. Registered & Protected Financial Trading.
      </footer>
    </div>
  );
};
