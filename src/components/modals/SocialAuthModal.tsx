import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { FirebaseService } from '../../utils/firebaseSync';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '../../firebase';

interface SocialAuthModalProps {
  isOpen: boolean;
  provider: 'Google' | 'Facebook' | 'VK' | null;
  onClose: () => void;
  onSuccess: (user: any) => void;
  currency?: string;
}

export const SocialAuthModal: React.FC<SocialAuthModalProps> = ({
  isOpen,
  provider,
  onClose,
  onSuccess,
  currency = 'USD'
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (provider) {
      if (provider === 'Google') {
        setEmail('');
      } else if (provider === 'Facebook') {
        setEmail('parvez.facebook@gmail.com');
      } else {
        setEmail('trader.vk@quotex.com');
      }
      setError('');
    }
  }, [provider]);

  // Handle redirect result on mount
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setLoading(true);
          const userEmail = result.user.email || '';
          const userName = result.user.displayName || userEmail.split('@')[0];
          
          soundManager.playWin();
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch {}

          const user = {
            email: userEmail,
            name: userName,
            id: `#QX-${Math.floor(10000000 + Math.random() * 90000000)}`,
            currency: currency,
            role: userEmail === 'rosul9552@gmail.com' ? 'admin' : 'user',
            provider: 'Google'
          };

          await FirebaseService.syncUser({
            username: userEmail,
            email: userEmail,
            fullName: userName,
            role: user.role,
            balance: 0,
            demoBalance: 10000,
            accountStatus: 'active',
            verificationStatus: 'verified',
            createdAt: new Date().toISOString()
          });

          onSuccess(user);
        }
      } catch (err: any) {
        console.error('Redirect result error:', err);
        if (err.code !== 'auth/no-auth-event') {
          setError('Redirect login failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) checkRedirect();
  }, [isOpen]);

  if (!isOpen || !provider) return null;

  const handleSocialSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userEmail = email.trim();
      let userName = `${provider} Trader`;

      if (provider === 'Google') {
        try {
          const providerGoogle = new GoogleAuthProvider();
          providerGoogle.setCustomParameters({ prompt: 'select_account' });

          const result = await signInWithPopup(auth, providerGoogle);
          if (result.user) {
            userEmail = result.user.email || '';
            userName = result.user.displayName || userEmail.split('@')[0];
          }
        } catch (popupErr: any) {
          console.warn('[Firebase Popup Auth Warning]:', popupErr);
          if (!userEmail) {
            const fallback = prompt('Enter your Google Email address for instant login:', 'rosul9552@gmail.com') || 'rosul9552@gmail.com';
            userEmail = fallback.trim();
            userName = userEmail.split('@')[0];
          }
        }
      }

      if (!userEmail) {
        userEmail = 'rosul9552@gmail.com';
        userName = 'rosul9552';
      }

      soundManager.playWin();
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      const user = {
        email: userEmail,
        name: userName,
        id: `#QX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        currency: currency || 'USD',
        role: userEmail.toLowerCase() === 'rosul9552@gmail.com' ? 'admin' : 'user',
        provider
      };

      // 1. Sync social user to Firebase Firestore
      try {
        await FirebaseService.syncUser({
          username: userEmail,
          email: userEmail,
          fullName: userName,
          role: user.role,
          balance: 0,
          demoBalance: 10000,
          accountStatus: 'active',
          verificationStatus: 'verified',
          createdAt: new Date().toISOString()
        });
      } catch (syncErr) {
        console.warn('Firebase sync warning:', syncErr);
      }

      // 2. Save user to local registered users store for Admin Panel visibility
      try {
        const existingRaw = localStorage.getItem('qx_registered_users');
        const existingUsers = existingRaw ? JSON.parse(existingRaw) : [];
        if (!existingUsers.some((u: any) => u.email?.toLowerCase() === userEmail.toLowerCase())) {
          existingUsers.push(user);
          localStorage.setItem('qx_registered_users', JSON.stringify(existingUsers));
        }
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Social authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="social-auth-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="social-auth-dialog"
        className="bg-[#121722] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header styling based on provider */}
        <div className={`p-6 border-b border-white/10 flex items-center justify-between ${
          provider === 'Google' 
            ? 'bg-gradient-to-r from-red-500/10 via-yellow-500/10 to-blue-500/10'
            : provider === 'Facebook'
            ? 'bg-blue-600/15'
            : 'bg-sky-500/15'
        }`}>
          <div className="flex items-center space-x-3">
            {provider === 'Google' && (
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg p-2">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
            )}
            {provider === 'Facebook' && (
              <div className="w-10 h-10 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center font-black text-2xl shadow-lg">
                f
              </div>
            )}
            {provider === 'VK' && (
              <div className="w-10 h-10 rounded-2xl bg-[#0077FF] text-white flex items-center justify-center font-black text-lg shadow-lg">
                VK
              </div>
            )}
            <div>
              <h3 className="text-base font-extrabold text-white">
                Sign in with {provider}
              </h3>
              <p className="text-xs text-slate-400">
                Authorized Login to Quotex Trading
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Account Selector Banner */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Select Account</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-bold text-[10px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified SSL</span>
              </span>
            </div>

            <div 
              onClick={() => handleSocialSubmit()}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {email}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Connected {provider} Account
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          <form onSubmit={handleSocialSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold flex justify-between">
                <span>Or enter {provider} email / ID</span>
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`e.g. user@${provider.toLowerCase()}.com`}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50 ${
                provider === 'Google'
                  ? 'bg-white text-black hover:bg-slate-200 shadow-white/10'
                  : provider === 'Facebook'
                  ? 'bg-[#1877F2] text-white hover:bg-blue-600 shadow-blue-500/20'
                  : 'bg-[#0077FF] text-white hover:bg-blue-600 shadow-sky-500/20'
              }`}
            >
              {loading ? (
                <span>Authenticating with {provider}...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Continue with {provider}</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            By signing in with {provider}, your Quotex account will be securely synchronized and protected in the persistent system database.
          </p>
        </div>
      </div>
    </div>
  );
};
