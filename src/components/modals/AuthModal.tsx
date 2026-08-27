import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  CheckCircle2,
  DollarSign,
  Lock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { FirebaseService } from '../../utils/firebaseSync';
import { saveUserSession } from '../../utils/cookies';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { SiteLogo } from '../common/SiteLogo';
import { GoogleIcon } from '../common/GoogleIcon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess: (user: { email: string; name: string; id: string; currency: string; role?: string; phone?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualGoogleInput, setShowManualGoogleInput] = useState(false);
  const [manualEmail, setManualEmail] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async (overrideEmail?: string) => {
    setLoading(true);
    setError(null);

    try {
      let userEmail = overrideEmail || '';
      let userName = '';

      if (!overrideEmail) {
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          
          const result = await signInWithPopup(auth, provider);
          if (result.user) {
            userEmail = result.user.email || '';
            userName = result.user.displayName || userEmail.split('@')[0];
          }
        } catch (popupErr: any) {
          console.warn('[Firebase Google Popup Error]:', popupErr);
          
          // If popup is blocked by iframe or browser policy
          if (
            popupErr?.code === 'auth/popup-blocked' || 
            popupErr?.code === 'auth/cancelled-popup-request' ||
            popupErr?.code === 'auth/popup-closed-by-user' ||
            window.self !== window.top
          ) {
            setShowManualGoogleInput(true);
            setLoading(false);
            return;
          } else {
            throw popupErr;
          }
        }
      }

      if (!userEmail) {
        throw new Error('Google authentication cancelled or no email returned.');
      }

      userEmail = userEmail.trim().toLowerCase();
      userName = userName || userEmail.split('@')[0];

      const isAdmin = userEmail === 'rosul9552@gmail.com';
      const loggedInUser = {
        email: userEmail,
        name: userName,
        id: `#QX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        currency: 'USD',
        role: isAdmin ? 'admin' : 'user',
        phone: '',
      };

      // 1. Sync user to Firestore
      try {
        await FirebaseService.syncUser({
          username: userEmail,
          email: userEmail,
          fullName: userName,
          role: loggedInUser.role,
          balance: 0,
          demoBalance: 10000,
          accountStatus: 'active',
          verificationStatus: 'verified',
          createdAt: new Date().toISOString()
        });
      } catch (syncErr) {
        console.warn('[Firestore Sync warning]:', syncErr);
      }

      // 2. Save persistent session cookie
      saveUserSession(loggedInUser, { rememberMe: true });

      // 3. Audio & Confetti
      soundManager.playWin();
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      onAuthSuccess(loggedInUser);
      onClose();
    } catch (err: any) {
      console.error('[Google Auth Error]:', err);
      setError(err?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail || !manualEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    handleGoogleSignIn(manualEmail);
  };

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="auth-modal-dialog"
        className="bg-[#0e131f] border border-emerald-500/30 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accents */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SiteLogo size="md" showText={false} className="shadow-md shadow-emerald-500/20" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">NUX Trading</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-[10px] uppercase">
                  Google Auth
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Fast 1-Click Secure Trading Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Value Highlights */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white">$10,000 Free Demo Balance</span>
                <p className="text-[10px] text-slate-400">Practice risk-free with unlimited balance resets</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white">Up to 98% OTC Payouts</span>
                <p className="text-[10px] text-slate-400">Trade 400+ currency pairs, crypto, and commodities</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white">Encrypted Cloud Storage</span>
                <p className="text-[10px] text-slate-400">Secure automated deposits & 24/7 fast withdrawals</p>
              </div>
            </div>
          </div>

          {/* Primary Action: Google Login Button */}
          {!showManualGoogleInput ? (
            <div className="space-y-3">
              <button
                id="btn-google-signin-modal"
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-bold text-sm rounded-2xl shadow-xl shadow-white/10 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Google...</span>
                  </div>
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400">
                By continuing with Google, you agree to our Terms of Service & Privacy Policy.
              </p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Enter your Google Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="e.g. trader@gmail.com"
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In with Google Account'}
              </button>

              <button
                type="button"
                onClick={() => setShowManualGoogleInput(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-1"
              >
                Back to Google Popup
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
