import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface FirebaseSyncResult {
  success: boolean;
  message: string;
  syncedCount?: number;
  error?: any;
}

/**
 * Firebase Firestore Realtime & Batch Synchronizer
 * Connects directly to Firestore: obasi-115d8
 */
export const FirebaseService = {
  /**
   * Save / Sync Single User to Firestore
   */
  async syncUser(user: {
    username: string;
    email?: string;
    fullName?: string;
    phone?: string;
    role?: string;
    balance?: number;
    demoBalance?: number;
    bonus?: number;
    accountStatus?: string;
    balanceLocked?: boolean;
    verificationStatus?: string;
    createdAt?: string;
    forceBalance?: boolean;
    [key: string]: any;
  }): Promise<boolean> {
    try {
      const emailValue = (user.email || user.username || '').trim().toLowerCase();
      if (!emailValue) return false;
      const sanitizedId = emailValue.replace(/[^a-zA-Z0-9_-]/g, '_');
      const userRef = doc(db, 'users', sanitizedId);

      // Fetch existing user data first
      const snap = await getDoc(userRef);
      const existingData = snap.exists() ? snap.data() : null;

      let finalBalance = typeof user.balance === 'number' ? user.balance : 0;
      let finalDemoBalance = typeof user.demoBalance === 'number' ? user.demoBalance : 10000;

      if (existingData) {
        if (user.forceBalance) {
          // If forceBalance is true (admin action, deposit approval, balance edit), respect user.balance directly
          finalBalance = typeof user.balance === 'number' ? user.balance : (typeof existingData.balance === 'number' ? existingData.balance : 0);
          finalDemoBalance = typeof user.demoBalance === 'number' ? user.demoBalance : (typeof existingData.demoBalance === 'number' ? existingData.demoBalance : 10000);
        } else {
          // Standard login sync: prevent login default 0 from overwriting existing non-zero balance
          if (typeof existingData.balance === 'number') {
            if (user.balance === 0 && existingData.balance !== 0) {
              finalBalance = existingData.balance;
            } else if (user.balance !== undefined) {
              finalBalance = user.balance;
            } else {
              finalBalance = existingData.balance;
            }
          }
          
          if (typeof existingData.demoBalance === 'number') {
            if (user.demoBalance === 10000 && existingData.demoBalance !== 10000) {
              finalDemoBalance = existingData.demoBalance;
            } else if (user.demoBalance !== undefined) {
              finalDemoBalance = user.demoBalance;
            } else {
              finalDemoBalance = existingData.demoBalance;
            }
          }
        }
      }

      const userPayload = {
        ...existingData,
        ...user,
        email: emailValue,
        username: user.username || (existingData ? existingData.username : null) || emailValue,
        fullName: user.fullName || (existingData ? existingData.fullName : null) || emailValue.split('@')[0],
        phone: user.phone !== undefined ? user.phone : (existingData ? existingData.phone : ''),
        role: user.role || (existingData ? existingData.role : null) || 'user',
        balance: finalBalance,
        demoBalance: finalDemoBalance,
        bonus: user.bonus !== undefined ? user.bonus : (existingData && existingData.bonus !== undefined ? existingData.bonus : 0),
        accountStatus: user.accountStatus || (existingData ? existingData.accountStatus : null) || 'active',
        balanceLocked: user.balanceLocked !== undefined ? user.balanceLocked : (existingData && existingData.balanceLocked !== undefined ? existingData.balanceLocked : false),
        verificationStatus: user.verificationStatus || (existingData ? existingData.verificationStatus : null) || 'verified',
        createdAt: user.createdAt || (existingData ? existingData.createdAt : null) || new Date().toISOString(),
        syncedAt: serverTimestamp(),
        lastUpdated: new Date().toISOString()
      };

      // Remove internal helper property if present
      delete userPayload.forceBalance;

      await setDoc(userRef, userPayload, { merge: true });

      console.log(`[Firebase] User ${emailValue} synced/merged successfully. Final balance: ${finalBalance}, locked: ${userPayload.balanceLocked}, status: ${userPayload.accountStatus}`);
      return true;
    } catch (err) {
      console.warn('[Firebase] syncUser failed:', err);
      return false;
    }
  },

  /**
   * Get Single User directly from Firestore
   */
  async getUser(usernameOrEmail: string): Promise<any | null> {
    try {
      const emailValue = (usernameOrEmail || '').trim().toLowerCase();
      if (!emailValue) return null;
      const sanitizedId = emailValue.replace(/[^a-zA-Z0-9_-]/g, '_');
      const userRef = doc(db, 'users', sanitizedId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    } catch (err) {
      console.warn('[Firebase] getUser failed:', err);
      return null;
    }
  },

  /**
   * Fetch All Users directly from Firestore
   */
  async fetchUsers(): Promise<any[]> {
    try {
      const usersCol = collection(db, 'users');
      const snapshot = await getDocs(usersCol);
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (err) {
      console.warn('[Firebase] fetchUsers failed:', err);
      return [];
    }
  },

  /**
   * Update User Balance in Firestore
   */
  async updateUserBalance(username: string, newBalance: number, type: 'live' | 'demo' = 'live'): Promise<boolean> {
    try {
      const emailValue = (username || '').trim().toLowerCase();
      if (!emailValue) return false;
      const sanitizedId = emailValue.replace(/[^a-zA-Z0-9_-]/g, '_');
      const userRef = doc(db, 'users', sanitizedId);
      
      const payload: any = {
        lastUpdated: new Date().toISOString(),
        syncedAt: serverTimestamp()
      };
      if (type === 'live') {
        payload.balance = newBalance;
      } else {
        payload.demoBalance = newBalance;
      }

      await setDoc(userRef, payload, { merge: true });
      return true;
    } catch (err) {
      console.warn('[Firebase] updateUserBalance failed:', err);
      return false;
    }
  },

  /**
   * Sync Single Transaction to Firestore
   */
  async syncTransaction(tx: {
    id: string;
    userId: string;
    userName?: string;
    type: string;
    amount: number;
    amountBdt?: number;
    bonus?: number;
    currency?: string;
    gateway: string;
    senderNumber?: string;
    receiverNumber?: string;
    accountNumber?: string;
    trxId?: string;
    status: string;
    createdAt: string;
    adminNote?: string;
  }): Promise<boolean> {
    try {
      if (!tx.id) return false;
      const txRef = doc(db, 'transactions', String(tx.id));
      await setDoc(txRef, {
        ...tx,
        syncedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('[Firebase] syncTransaction failed:', err);
      return false;
    }
  },

  /**
   * Fetch All Transactions from Firestore
   */
  async fetchTransactions(): Promise<any[]> {
    try {
      const txCol = collection(db, 'transactions');
      const q = query(txCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (err) {
      console.warn('[Firebase] fetchTransactions failed:', err);
      return [];
    }
  },

  /**
   * Fetch Transactions for a specific User from Firestore
   */
  async fetchUserTransactions(email: string): Promise<any[]> {
    try {
      if (!email) return [];
      const txCol = collection(db, 'transactions');
      const q = query(txCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.userId === email) {
          list.push({ id: docSnap.id, ...data });
        }
      });
      return list;
    } catch (err) {
      console.warn('[Firebase] fetchUserTransactions failed:', err);
      return [];
    }
  },

  /**
   * Sync Payment Gateways to Firestore
   */
  async syncGateways(gateways: any[]): Promise<boolean> {
    try {
      const settingsRef = doc(db, 'platform_settings', 'payment_gateways');
      await setDoc(settingsRef, {
        gateways,
        count: gateways.length,
        updatedAt: new Date().toISOString(),
        syncedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('[Firebase] syncGateways failed:', err);
      return false;
    }
  },

  /**
   * Fetch Payment Gateways from Firestore
   */
  async fetchGateways(): Promise<any[]> {
    try {
      const settingsRef = doc(db, 'platform_settings', 'payment_gateways');
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists() && docSnap.data().gateways) {
        return docSnap.data().gateways;
      }
      return [];
    } catch (err) {
      console.warn('[Firebase] fetchGateways failed:', err);
      return [];
    }
  },

  /**
   * Sync System & Frontend Settings to Firestore
   */
  async syncSettings(settings: any): Promise<boolean> {
    try {
      const settingsRef = doc(db, 'platform_settings', 'frontend_control');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
        syncedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('[Firebase] syncSettings failed:', err);
      return false;
    }
  },

  /**
   * Perform Full Sync & Push all backend records to Firebase Firestore
   */
  async performFullSync(allData: {
    users?: any[];
    transactions?: any[];
    gateways?: any[];
    settings?: any;
  }): Promise<FirebaseSyncResult> {
    let syncedCount = 0;
    try {
      if (allData.users && allData.users.length > 0) {
        for (const u of allData.users) {
          await this.syncUser(u);
          syncedCount++;
        }
      }

      if (allData.transactions && allData.transactions.length > 0) {
        for (const tx of allData.transactions) {
          await this.syncTransaction(tx);
          syncedCount++;
        }
      }

      if (allData.gateways) {
        await this.syncGateways(allData.gateways);
        syncedCount++;
      }

      if (allData.settings) {
        await this.syncSettings(allData.settings);
        syncedCount++;
      }

      return {
        success: true,
        message: `Successfully synchronized ${syncedCount} records with Firebase Firestore (Project: obasi-115d8)!`,
        syncedCount
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Firebase Sync failed: ${err?.message || 'Check database security rules'}`,
        error: err
      };
    }
  },

  /**
   * Realtime Listener for Platform Settings
   */
  listenToSettings(callback: (data: any) => void): () => void {
    const docRef = doc(db, 'platform_settings', 'frontend_control');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    }, (err) => {
      console.warn('[Firebase] Settings listener warning:', err.message);
    });
  },

  /**
   * Realtime Listener for Gateways
   */
  listenToGateways(callback: (gateways: any[]) => void): () => void {
    const docRef = doc(db, 'platform_settings', 'payment_gateways');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().gateways) {
        callback(docSnap.data().gateways);
      }
    }, (err) => {
      console.warn('[Firebase] Gateways listener warning:', err.message);
    });
  },

  /**
   * Sync Completed Trade Order to Firestore
   */
  async syncTrade(trade: any): Promise<boolean> {
    try {
      if (!trade || !trade.id) return false;
      const tradeRef = doc(db, 'trades', String(trade.id));
      await setDoc(tradeRef, {
        ...trade,
        syncedAt: serverTimestamp(),
        timestamp: trade.timestamp || Date.now()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('[Firebase] syncTrade failed:', err);
      return false;
    }
  },

  /**
   * Realtime Listener for a specific User Profile & Balances
   */
  listenToUser(username: string, callback: (data: any) => void): () => void {
    if (!username) return () => {};
    const emailValue = (username || '').trim().toLowerCase();
    const sanitizedId = emailValue.replace(/[^a-zA-Z0-9_-]/g, '_');
    const userRef = doc(db, 'users', sanitizedId);
    return onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    }, (err) => {
      console.warn('[Firebase] User listener warning:', err.message);
    });
  }
};
