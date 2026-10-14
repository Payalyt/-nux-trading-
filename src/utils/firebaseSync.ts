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
import { CentralCandleControl } from '../types/trading';
import { get8DigitId, isValid8DigitId } from './userId';

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
      let finalBalanceUpdatedAt = user.balanceUpdatedAt || Date.now();
      let finalDemoBalanceUpdatedAt = user.demoBalanceUpdatedAt || Date.now();

      if (existingData) {
        if (user.forceBalance) {
          // If forceBalance is true (admin action, deposit approval, balance edit), respect user.balance directly
          finalBalance = typeof user.balance === 'number' ? user.balance : (typeof existingData.balance === 'number' ? existingData.balance : 0);
          finalDemoBalance = typeof user.demoBalance === 'number' ? user.demoBalance : (typeof existingData.demoBalance === 'number' ? existingData.demoBalance : 10000);
          finalBalanceUpdatedAt = Date.now();
          finalDemoBalanceUpdatedAt = Date.now();
        } else {
          // Standard login / session sync: PRESERVE PROFIT AND DO NOT OVERWRITE WITH 0 OR DEFAULT!
          const userBalTime = Number(user.balanceUpdatedAt || 0);
          const existBalTime = Number(existingData.balanceUpdatedAt || 0);

          if (typeof existingData.balance === 'number') {
            if (user.balance === undefined) {
              finalBalance = existingData.balance;
              finalBalanceUpdatedAt = existBalTime || Date.now();
            } else if (user.balance === 0 && existingData.balance > 0) {
              // User has uninitialized 0 balance, preserve existing profit/deposit balance
              finalBalance = existingData.balance;
              finalBalanceUpdatedAt = existBalTime || Date.now();
            } else if (userBalTime > 0 && existBalTime > 0) {
              // Compare timestamps: newer update wins
              if (userBalTime >= existBalTime) {
                finalBalance = user.balance;
                finalBalanceUpdatedAt = userBalTime;
              } else {
                finalBalance = existingData.balance;
                finalBalanceUpdatedAt = existBalTime;
              }
            } else {
              // Default to user's current session balance if available
              finalBalance = user.balance;
              finalBalanceUpdatedAt = userBalTime || Date.now();
            }
          } else if (typeof user.balance === 'number') {
            finalBalance = user.balance;
            finalBalanceUpdatedAt = userBalTime || Date.now();
          }
          
          const userDemoBalTime = Number(user.demoBalanceUpdatedAt || 0);
          const existDemoBalTime = Number(existingData.demoBalanceUpdatedAt || 0);

          if (typeof existingData.demoBalance === 'number') {
            if (user.demoBalance === undefined) {
              finalDemoBalance = existingData.demoBalance;
              finalDemoBalanceUpdatedAt = existDemoBalTime || Date.now();
            } else if (user.demoBalance === 10000 && existingData.demoBalance !== 10000) {
              // User passed default 10,000 but existing has trade profit/loss, preserve existing!
              finalDemoBalance = existingData.demoBalance;
              finalDemoBalanceUpdatedAt = existDemoBalTime || Date.now();
            } else if (userDemoBalTime > 0 && existDemoBalTime > 0) {
              if (userDemoBalTime >= existDemoBalTime) {
                finalDemoBalance = user.demoBalance;
                finalDemoBalanceUpdatedAt = userDemoBalTime;
              } else {
                finalDemoBalance = existingData.demoBalance;
                finalDemoBalanceUpdatedAt = existDemoBalTime;
              }
            } else {
              finalDemoBalance = user.demoBalance;
              finalDemoBalanceUpdatedAt = userDemoBalTime || Date.now();
            }
          } else if (typeof user.demoBalance === 'number') {
            finalDemoBalance = user.demoBalance;
            finalDemoBalanceUpdatedAt = userDemoBalTime || Date.now();
          }
        }
      }

      const existingNumericId = existingData?.numericId || existingData?.id;
      const assigned8DigitId = (user.numericId && isValid8DigitId(user.numericId))
        ? user.numericId
        : (user.id && isValid8DigitId(user.id))
        ? user.id
        : (existingNumericId && isValid8DigitId(existingNumericId))
        ? existingNumericId
        : get8DigitId(user);

      const userPayload = {
        ...existingData,
        ...user,
        email: emailValue,
        id: assigned8DigitId,
        numericId: assigned8DigitId,
        username: user.username || (existingData ? existingData.username : null) || emailValue,
        fullName: user.fullName || (existingData ? existingData.fullName : null) || emailValue.split('@')[0],
        phone: user.phone !== undefined ? user.phone : (existingData ? existingData.phone : ''),
        role: user.role || (existingData ? existingData.role : null) || 'user',
        balance: finalBalance,
        demoBalance: finalDemoBalance,
        balanceUpdatedAt: finalBalanceUpdatedAt,
        demoBalanceUpdatedAt: finalDemoBalanceUpdatedAt,
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
  async updateUserBalance(username: string, newBalance: number, type: 'live' | 'demo' = 'live', timestamp?: number): Promise<boolean> {
    try {
      const emailValue = (username || '').trim().toLowerCase();
      if (!emailValue) return false;
      const sanitizedId = emailValue.replace(/[^a-zA-Z0-9_-]/g, '_');
      const userRef = doc(db, 'users', sanitizedId);
      const updateTime = timestamp || Date.now();
      
      const payload: any = {
        lastUpdated: new Date().toISOString(),
        syncedAt: serverTimestamp()
      };
      if (type === 'live') {
        payload.balance = newBalance;
        payload.balanceUpdatedAt = updateTime;
      } else {
        payload.demoBalance = newBalance;
        payload.demoBalanceUpdatedAt = updateTime;
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
  },

  /**
   * Update 8-Digit User ID in Firestore
   */
  async updateUserNumericId(usernameOrEmail: string, new8DigitId: string): Promise<boolean> {
    try {
      const emailValue = (usernameOrEmail || '').trim().toLowerCase();
      if (!emailValue || !isValid8DigitId(new8DigitId)) return false;
      const sanitizedId = emailValue.replace(/[^a-zA-Z0-9_-]/g, '_');
      const userRef = doc(db, 'users', sanitizedId);
      
      await setDoc(userRef, {
        id: new8DigitId,
        numericId: new8DigitId,
        lastUpdated: new Date().toISOString(),
        syncedAt: serverTimestamp()
      }, { merge: true });

      console.log(`[Firebase] User ${emailValue} 8-digit ID updated to ${new8DigitId}`);
      return true;
    } catch (err) {
      console.warn('[Firebase] updateUserNumericId failed:', err);
      return false;
    }
  },

  /**
   * Sync/Broadcast Central Candle Movement Control to Firestore
   * Synchronizes candle movement (UP / DOWN / NORMAL / SPIKE) centrally across all connected devices
   */
  async updateCandleControl(control: CentralCandleControl): Promise<boolean> {
    try {
      const controlRef = doc(db, 'platform_settings', 'candle_control');
      await setDoc(controlRef, {
        ...control,
        updatedAt: control.updatedAt || Date.now(),
        lastUpdated: new Date().toISOString(),
        syncedAt: serverTimestamp()
      }, { merge: true });
      console.log(`[Firebase] Central Candle Control synced to Firestore:`, control);
      return true;
    } catch (err) {
      console.warn('[Firebase] updateCandleControl failed:', err);
      return false;
    }
  },

  /**
   * Realtime Listener for Central Candle Movement Control
   * When admin toggles UP / DOWN / SPIKE, all user devices receive the event in real time!
   */
  listenToCandleControl(callback: (control: CentralCandleControl) => void): () => void {
    const controlRef = doc(db, 'platform_settings', 'candle_control');
    return onSnapshot(controlRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as CentralCandleControl);
      }
    }, (err) => {
      console.warn('[Firebase] CandleControl listener warning:', err.message);
    });
  },

  /**
   * Fetch current Central Candle Control snapshot from Firestore
   */
  async fetchCandleControl(): Promise<CentralCandleControl | null> {
    try {
      const controlRef = doc(db, 'platform_settings', 'candle_control');
      const snap = await getDoc(controlRef);
      if (snap.exists()) {
        return snap.data() as CentralCandleControl;
      }
      return null;
    } catch (err) {
      console.warn('[Firebase] fetchCandleControl failed:', err);
      return null;
    }
  }
};

