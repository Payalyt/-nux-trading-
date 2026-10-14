import { auth } from '../firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { FirebaseService } from './firebaseSync';
import { saveUserSession } from './cookies';
import { soundManager } from './audio';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types/trading';
import { generate8DigitId } from './userId';

export const triggerDirectGoogleLogin = async (
  onSuccess?: (user: UserAccount) => void,
  onError?: (errorMessage: string) => void
) => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    let firebaseUser: FirebaseUser | null = null;

    try {
      const result = await signInWithPopup(auth, provider);
      firebaseUser = result.user;
    } catch (popupErr: any) {
      console.warn('[Direct Google Login Popup Error]:', popupErr);
      
      // If we are in an iframe (like AI Studio preview) and popup fails, break out of the iframe
      if (window.self !== window.top) {
        console.warn('Iframe detected. Breaking out to a new tab for authentication.');
        const newTab = window.open(window.location.href, '_blank');
        if (newTab) {
          onError?.('Opening app in a new tab to complete Google Sign-In securely...');
          return;
        }
      }

      if (
        popupErr?.code === 'auth/popup-blocked' ||
        popupErr?.code === 'auth/cancelled-popup-request' ||
        popupErr?.code === 'auth/popup-closed-by-user' ||
        popupErr?.code === 'auth/network-request-failed'
      ) {
        // Fallback to redirect directly to Google account selector
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: any) {
          console.error('[Google Redirect Error]:', redirectErr);
          onError?.(redirectErr?.message || 'Google Sign-In failed.');
          return;
        }
      } else {
        throw popupErr;
      }
    }

    if (firebaseUser) {
      const email = (firebaseUser.email || '').trim().toLowerCase();
      const name = firebaseUser.displayName || email.split('@')[0];
      const isAdmin = email === 'rosul9552@gmail.com';

      const eightDigitId = generate8DigitId(email);
      const userAccount: UserAccount = {
        email: email,
        name: name,
        id: eightDigitId,
        numericId: eightDigitId,
        currency: 'USD',
        role: isAdmin ? 'admin' : 'user',
      };

      // 1. Fetch existing user data to preserve their balance and profit
      try {
        const existingDoc = await FirebaseService.getUser(email);
        const existingBal = typeof existingDoc?.balance === 'number' ? existingDoc.balance : undefined;
        const existingDemoBal = typeof existingDoc?.demoBalance === 'number' ? existingDoc.demoBalance : undefined;

        await FirebaseService.syncUser({
          username: email,
          email: email,
          fullName: name,
          role: userAccount.role,
          balance: existingBal,
          demoBalance: existingDemoBal,
          accountStatus: existingDoc?.accountStatus || 'active',
          verificationStatus: existingDoc?.verificationStatus || 'verified',
          createdAt: existingDoc?.createdAt || new Date().toISOString()
        });

        if (typeof existingBal === 'number') {
          userAccount.balance = existingBal;
        }
        if (typeof existingDemoBal === 'number') {
          userAccount.demoBalance = existingDemoBal;
        }
      } catch (syncErr) {
        console.warn('Firestore user sync notice:', syncErr);
      }

      // 2. Persistent cookie storage
      saveUserSession(userAccount, { rememberMe: true });

      // 3. Audio & Confetti
      try {
        soundManager.playWin();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      onSuccess?.(userAccount);
    }
  } catch (err: any) {
    console.error('[Trigger Google Login Failed]:', err);
    onError?.(err?.message || 'Failed to sign in with Google.');
  }
};
