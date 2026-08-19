import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'files', 'database');

export interface UserRecord {
  username: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
  fullName?: string;
  phone?: string;
  country?: string;
  accountStatus?: 'active' | 'blocked';
  verificationStatus?: 'unverified' | 'verified';
  balance?: number; // Live real balance in USD
  demoBalance?: number; // Demo balance in USD
}

export interface TransactionRecord {
  id: string;
  userId: string; // Email or username
  userName?: string;
  userPhone?: string;
  type: 'deposit' | 'withdrawal' | 'adjustment' | 'bonus' | 'refund';
  amount: number; // USD
  amountBdt?: number; // Equivalent in BDT
  bonus?: number;
  currency: string;
  gateway: string; // 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Bank' | 'USDT TRC20' etc.
  paymentType?: 'send_money' | 'merchant' | 'cash_out' | 'bank' | 'crypto';
  senderNumber?: string;
  receiverNumber?: string;
  trxId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  userNote?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
  reviewedBy?: string;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  category: 'mobile_banking' | 'bank' | 'crypto' | 'epay' | 'card';
  icon: string;
  active: boolean;
  sendMoneyNumber: string;
  merchantNumber: string;
  cashOutNumber: string;
  instruction: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  bonusPercent: number;
  conversionRate: number; // 1 USD = X Local Currency (BDT, etc)
  allowSendMoney: boolean;
  allowMerchant: boolean;
  allowCashOut: boolean;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    routingNumber?: string;
  };
  cryptoDetails?: {
    walletAddress: string;
    network: string;
    qrCodeUrl?: string;
  };
  cardDetails?: {
    publishableKey?: string;
    merchantId?: string;
    gatewayType?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformControls {
  siteTitle: string;
  noticeBannerText: string;
  showNoticeBanner: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowRegistration: boolean;
  requireKycForWithdrawal: boolean;
  tradingPayoutPercentage: number;
  minTradeAmount: number;
  maxTradeAmount: number;
  defaultDemoBalance: number;
  defaultSignupBonus: number;
  liveSignalsEnabled: boolean;
  signalAccuracyRate: number;
  vipTelegramUrl: string;
}

export interface SupportSettings {
  telegramLink: string;
  telegramChannel: string;
  whatsappNumber: string;
  whatsappUrl: string;
  supportEmail: string;
  liveChatUrl: string;
  noticeBanner: string;
  showNoticeBanner: boolean;
}

export interface SystemSettings {
  currencyRates: Record<string, number>;
  support: SupportSettings;
  paymentGateways: PaymentGatewayConfig[];
  platformControls?: PlatformControls;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  details: string;
  timestamp: string;
}

export class FileDatabase {
  /**
   * Automatically ensure files/database/ directory exists and bootstrap defaults.
   */
  static init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
        console.log(`[FileDB] Created database directory at: ${DB_DIR}`);
      }

      // Initialize json array files
      const collections = ['transactions.json', 'audit_logs.json'];
      for (const col of collections) {
        if (!fs.existsSync(path.join(DB_DIR, col))) {
          fs.writeFileSync(path.join(DB_DIR, col), '[]', 'utf-8');
        }
      }

      // Initialize default settings if not exists
      const settingsPath = path.join(DB_DIR, 'settings.json');
      if (!fs.existsSync(settingsPath)) {
        const defaultGateways: PaymentGatewayConfig[] = [
          {
            id: 'bkash',
            name: 'bKash (BD)',
            category: 'mobile_banking',
            icon: 'https://i.postimg.cc/MZNd4Pjq/55.png',
            active: true,
            sendMoneyNumber: '01700000001',
            merchantNumber: '01700000002',
            cashOutNumber: '01700000003',
            instruction: 'Send money / payment to the given bKash number and copy the TrxID here.',
            minDeposit: 10,
            maxDeposit: 5000,
            minWithdraw: 10,
            maxWithdraw: 2000,
            bonusPercent: 50,
            conversionRate: 125,
            allowSendMoney: true,
            allowMerchant: true,
            allowCashOut: true,
          },
          {
            id: 'nagad',
            name: 'Nagad (BD)',
            category: 'mobile_banking',
            icon: 'https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png',
            active: true,
            sendMoneyNumber: '01800000001',
            merchantNumber: '01800000002',
            cashOutNumber: '01800000003',
            instruction: 'Send money / payment to the given Nagad number and enter the 8-digit TrxID.',
            minDeposit: 10,
            maxDeposit: 5000,
            minWithdraw: 10,
            maxWithdraw: 2000,
            bonusPercent: 50,
            conversionRate: 125,
            allowSendMoney: true,
            allowMerchant: true,
            allowCashOut: true,
          },
          {
            id: 'rocket',
            name: 'Rocket DBBL',
            category: 'mobile_banking',
            icon: 'https://i.postimg.cc/ryRwMszC/unnamed.png',
            active: true,
            sendMoneyNumber: '01900000001',
            merchantNumber: '01900000002',
            cashOutNumber: '01900000003',
            instruction: 'Transfer from Rocket and input your 12-digit account number & TrxID.',
            minDeposit: 10,
            maxDeposit: 3000,
            minWithdraw: 10,
            maxWithdraw: 1500,
            bonusPercent: 40,
            conversionRate: 125,
            allowSendMoney: true,
            allowMerchant: false,
            allowCashOut: true,
          },
          {
            id: 'upay',
            name: 'Upay (UCB)',
            category: 'mobile_banking',
            icon: '📱',
            active: true,
            sendMoneyNumber: '01600000001',
            merchantNumber: '01600000002',
            cashOutNumber: '01600000003',
            instruction: 'Make payment/send money using Upay app and enter the Transaction ID.',
            minDeposit: 10,
            maxDeposit: 2000,
            minWithdraw: 10,
            maxWithdraw: 1000,
            bonusPercent: 30,
            conversionRate: 125,
            allowSendMoney: true,
            allowMerchant: true,
            allowCashOut: false,
          },
          {
            id: 'bank-transfer',
            name: 'Local Bank Transfer (BD)',
            category: 'bank',
            icon: '🏦',
            active: true,
            sendMoneyNumber: '',
            merchantNumber: '',
            cashOutNumber: '',
            instruction: 'Deposit directly to company bank account and submit deposit slip or reference.',
            minDeposit: 50,
            maxDeposit: 20000,
            minWithdraw: 50,
            maxWithdraw: 10000,
            bonusPercent: 20,
            conversionRate: 125,
            allowSendMoney: true,
            allowMerchant: false,
            allowCashOut: false,
            bankDetails: {
              bankName: 'Islami Bank Bangladesh Ltd / City Bank',
              accountName: 'NUX TRADING GLOBAL LTD',
              accountNumber: '20501234567890',
              branch: 'Gulshan Corporate Branch, Dhaka',
              routingNumber: '125272641',
            },
          },
          {
            id: 'usdt-trc20',
            name: 'USDT (TRC-20)',
            category: 'crypto',
            icon: '₮',
            active: true,
            sendMoneyNumber: '',
            merchantNumber: '',
            cashOutNumber: '',
            instruction: 'Transfer USDT TRC20 to the wallet address below. Processed in 1-5 mins.',
            minDeposit: 10,
            maxDeposit: 100000,
            minWithdraw: 10,
            maxWithdraw: 50000,
            bonusPercent: 50,
            conversionRate: 1,
            allowSendMoney: true,
            allowMerchant: false,
            allowCashOut: false,
            cryptoDetails: {
              walletAddress: 'TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX',
              network: 'Tron (TRC20)',
            },
          },
          {
            id: 'usdt-bep20',
            name: 'USDT (BEP-20)',
            category: 'crypto',
            icon: '₮',
            active: true,
            sendMoneyNumber: '',
            merchantNumber: '',
            cashOutNumber: '',
            instruction: 'Send USDT on BSC BEP20 network to the address below.',
            minDeposit: 10,
            maxDeposit: 50000,
            minWithdraw: 10,
            maxWithdraw: 25000,
            bonusPercent: 50,
            conversionRate: 1,
            allowSendMoney: true,
            allowMerchant: false,
            allowCashOut: false,
            cryptoDetails: {
              walletAddress: '0x71C8364437a90977A14bC9d3FeD40B326bB8e293',
              network: 'BNB Smart Chain (BEP20)',
            },
          },
          {
            id: 'bitcoin',
            name: 'Bitcoin (BTC)',
            category: 'crypto',
            icon: '₿',
            active: true,
            sendMoneyNumber: '',
            merchantNumber: '',
            cashOutNumber: '',
            instruction: 'Send BTC to the company Bitcoin wallet address below. Requires 1 network confirmation.',
            minDeposit: 20,
            maxDeposit: 100000,
            minWithdraw: 20,
            maxWithdraw: 50000,
            bonusPercent: 50,
            conversionRate: 1,
            allowSendMoney: true,
            allowMerchant: false,
            allowCashOut: false,
            cryptoDetails: {
              walletAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
              network: 'Bitcoin Mainnet',
            },
          },
          {
            id: 'binance-pay',
            name: 'Binance Pay',
            category: 'crypto',
            icon: '🟡',
            active: true,
            sendMoneyNumber: '89421095',
            merchantNumber: '89421095',
            cashOutNumber: '',
            instruction: 'Pay with Binance Pay ID / Pay QR. Enter your Binance Pay Order ID or Nickname.',
            minDeposit: 10,
            maxDeposit: 50000,
            minWithdraw: 10,
            maxWithdraw: 25000,
            bonusPercent: 50,
            conversionRate: 1,
            allowSendMoney: true,
            allowMerchant: true,
            allowCashOut: false,
            cryptoDetails: {
              walletAddress: '89421095',
              network: 'Binance Pay ID',
            },
          },
          {
            id: 'perfect-money',
            name: 'Perfect Money',
            category: 'epay',
            icon: '🅿️',
            active: true,
            sendMoneyNumber: 'U38914821',
            merchantNumber: 'U38914821',
            cashOutNumber: '',
            instruction: 'Transfer USD to our Perfect Money account U38914821 and enter batch number.',
            minDeposit: 10,
            maxDeposit: 10000,
            minWithdraw: 10,
            maxWithdraw: 5000,
            bonusPercent: 30,
            conversionRate: 1,
            allowSendMoney: true,
            allowMerchant: true,
            allowCashOut: false,
          },
          {
            id: 'stripe-card',
            name: 'Visa / MasterCard (Card)',
            category: 'card',
            icon: '💳',
            active: true,
            sendMoneyNumber: '',
            merchantNumber: '',
            cashOutNumber: '',
            instruction: 'Deposit using international Visa, MasterCard, or Amex card with instant 3D-Secure approval.',
            minDeposit: 15,
            maxDeposit: 10000,
            minWithdraw: 15,
            maxWithdraw: 5000,
            bonusPercent: 30,
            conversionRate: 1,
            allowSendMoney: false,
            allowMerchant: true,
            allowCashOut: false,
            cardDetails: {
              gatewayType: 'Stripe Global Card Processing',
            },
          },
        ];

        const defaultSupport: SupportSettings = {
          telegramLink: 'https://t.me/QuotexOfficialSupport',
          telegramChannel: 'https://t.me/QuotexSignalsVIP',
          whatsappNumber: '+8801700000000',
          whatsappUrl: 'https://wa.me/8801700000000?text=Hello%20Support%2C%20I%20need%20help%20with%20my%20trading%20account.',
          supportEmail: 'support@nux-trading.com',
          liveChatUrl: 'https://tawk.to',
          noticeBanner: '🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad & Crypto!',
          showNoticeBanner: true,
        };

        const defaultSettings: SystemSettings = {
          currencyRates: { USD: 1, BDT: 125, EUR: 0.92, INR: 86.5 },
          support: defaultSupport,
          paymentGateways: defaultGateways,
          updatedAt: new Date().toISOString(),
        };

        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[FileDB] Error initializing database directory:', err);
    }
  }

  static getUserFilePath(username: string): string {
    const sanitized = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(DB_DIR, `${sanitized}.txt`);
  }

  static userExists(username: string): boolean {
    return fs.existsSync(this.getUserFilePath(username));
  }

  static saveUser(user: UserRecord): void {
    this.init();
    const filePath = this.getUserFilePath(user.username);
    if (user.balance === undefined) user.balance = 0;
    if (user.demoBalance === undefined) user.demoBalance = 10000;
    if (!user.accountStatus) user.accountStatus = 'active';
    if (!user.verificationStatus) user.verificationStatus = 'unverified';
    fs.writeFileSync(filePath, JSON.stringify(user, null, 2), 'utf-8');
  }

  static getUser(username: string): UserRecord | null {
    const filePath = this.getUserFilePath(username);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content) as UserRecord;
      if (data.balance === undefined) data.balance = 0;
      if (data.demoBalance === undefined) data.demoBalance = 10000;
      if (!data.accountStatus) data.accountStatus = 'active';
      if (!data.verificationStatus) data.verificationStatus = 'unverified';
      return data;
    } catch (err) {
      console.error(`[FileDB] Error reading user ${username}:`, err);
      return null;
    }
  }

  static getAllUsers(): UserRecord[] {
    this.init();
    try {
      const files = fs.readdirSync(DB_DIR);
      const users: UserRecord[] = [];
      for (const file of files) {
        if (file.endsWith('.txt')) {
          const filePath = path.join(DB_DIR, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          try {
            const user = JSON.parse(content) as UserRecord;
            if (user.balance === undefined) user.balance = 0;
            if (user.demoBalance === undefined) user.demoBalance = 10000;
            if (!user.accountStatus) user.accountStatus = 'active';
            if (!user.verificationStatus) user.verificationStatus = 'unverified';
            users.push(user);
          } catch (e) {
            console.error(`[FileDB] Invalid JSON in ${file}`);
          }
        }
      }
      return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('[FileDB] Error reading users directory:', err);
      return [];
    }
  }

  static deleteUser(username: string): boolean {
    const filePath = this.getUserFilePath(username);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  static countUsers(): number {
    this.init();
    try {
      const files = fs.readdirSync(DB_DIR);
      return files.filter(f => f.endsWith('.txt')).length;
    } catch {
      return 0;
    }
  }

  static updateUserBalance(
    username: string, 
    realDelta: number, 
    demoDelta?: number, 
    isAbsolute = false
  ): UserRecord | null {
    const user = this.getUser(username);
    if (!user) return null;

    if (isAbsolute) {
      user.balance = Math.max(0, realDelta);
      if (demoDelta !== undefined) user.demoBalance = Math.max(0, demoDelta);
    } else {
      user.balance = Math.max(0, (user.balance || 0) + realDelta);
      if (demoDelta !== undefined) {
        user.demoBalance = Math.max(0, (user.demoBalance || 0) + demoDelta);
      }
    }

    this.saveUser(user);
    return user;
  }

  // --- Collection Helpers ---
  private static readCollection<T>(filename: string): T[] {
    this.init();
    try {
      const filePath = path.join(DB_DIR, filename);
      if (!fs.existsSync(filePath)) return [];
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T[];
    } catch { 
      return []; 
    }
  }
  
  private static writeCollection<T>(filename: string, data: T[]) {
    this.init();
    fs.writeFileSync(path.join(DB_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- Transactions Management ---
  static getTransactions(): TransactionRecord[] {
    return this.readCollection<TransactionRecord>('transactions.json').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static getTransactionById(id: string): TransactionRecord | null {
    const txs = this.getTransactions();
    return txs.find(t => t.id === id) || null;
  }

  static saveTransaction(tx: TransactionRecord): TransactionRecord {
    const txs = this.getTransactions();
    const idx = txs.findIndex(t => t.id === tx.id);
    tx.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      txs[idx] = tx;
    } else {
      txs.unshift(tx);
    }
    this.writeCollection('transactions.json', txs);
    return tx;
  }

  static updateTransactionStatus(
    id: string, 
    status: 'approved' | 'rejected' | 'completed' | 'pending', 
    adminId: string, 
    adminNote?: string
  ): { transaction: TransactionRecord | null; user: UserRecord | null; error?: string } {
    const tx = this.getTransactionById(id);
    if (!tx) return { transaction: null, user: null, error: 'Transaction not found' };

    const oldStatus = tx.status;
    tx.status = status;
    tx.reviewedBy = adminId;
    tx.adminNote = adminNote || tx.adminNote;
    tx.updatedAt = new Date().toISOString();

    const user = this.getUser(tx.userId);

    // If approving a deposit that was pending, credit user balance
    if (tx.type === 'deposit' && oldStatus === 'pending' && (status === 'approved' || status === 'completed')) {
      const creditAmount = tx.amount + (tx.bonus || 0);
      if (user) {
        this.updateUserBalance(user.username, creditAmount);
      }
    }

    // If rejecting a withdrawal that was pending, refund the deducted balance to user
    if (tx.type === 'withdrawal' && oldStatus === 'pending' && status === 'rejected') {
      if (user) {
        this.updateUserBalance(user.username, tx.amount);
      }
    }

    this.saveTransaction(tx);
    const updatedUser = user ? this.getUser(user.username) : null;
    return { transaction: tx, user: updatedUser };
  }

  // --- Settings Management ---
  static getSettings(): SystemSettings {
    this.init();
    const defaultControls: PlatformControls = {
      siteTitle: 'Quotex Pro Web Trader',
      noticeBannerText: '🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad, USDT TRC-20 & Crypto!',
      showNoticeBanner: true,
      maintenanceMode: false,
      maintenanceMessage: 'System is temporarily under scheduled maintenance. Please check back shortly.',
      allowRegistration: true,
      requireKycForWithdrawal: false,
      tradingPayoutPercentage: 87,
      minTradeAmount: 1,
      maxTradeAmount: 5000,
      defaultDemoBalance: 10000,
      defaultSignupBonus: 0,
      liveSignalsEnabled: true,
      signalAccuracyRate: 94.2,
      vipTelegramUrl: 'https://t.me/QuotexSignalsVIP'
    };

    try {
      const content = fs.readFileSync(path.join(DB_DIR, 'settings.json'), 'utf-8');
      const settings = JSON.parse(content) as SystemSettings;
      if (!settings.platformControls) {
        settings.platformControls = defaultControls;
      }
      return settings;
    } catch {
      return {
        currencyRates: { USD: 1, BDT: 125 },
        support: {
          telegramLink: 'https://t.me/QuotexOfficialSupport',
          telegramChannel: 'https://t.me/QuotexSignalsVIP',
          whatsappNumber: '+8801700000000',
          whatsappUrl: 'https://wa.me/8801700000000',
          supportEmail: 'support@nux-trading.com',
          liveChatUrl: 'https://tawk.to',
          noticeBanner: '🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad & Crypto!',
          showNoticeBanner: true,
        },
        platformControls: defaultControls,
        paymentGateways: [],
        updatedAt: new Date().toISOString(),
      };
    }
  }

  static saveSettings(settings: SystemSettings): SystemSettings {
    this.init();
    settings.updatedAt = new Date().toISOString();
    fs.writeFileSync(path.join(DB_DIR, 'settings.json'), JSON.stringify(settings, null, 2), 'utf-8');
    return settings;
  }

  // --- Payment Gateways CRUD ---
  static getAllGateways(): PaymentGatewayConfig[] {
    const settings = this.getSettings();
    return settings.paymentGateways || [];
  }

  static getActiveGateways(): PaymentGatewayConfig[] {
    const all = this.getAllGateways();
    return all.filter(g => g.active !== false);
  }

  static getGatewayById(id: string): PaymentGatewayConfig | null {
    const all = this.getAllGateways();
    return all.find(g => g.id.toLowerCase() === id.toLowerCase()) || null;
  }

  static saveGateway(gw: PaymentGatewayConfig): PaymentGatewayConfig {
    const settings = this.getSettings();
    const gateways = settings.paymentGateways || [];
    const index = gateways.findIndex(g => g.id.toLowerCase() === gw.id.toLowerCase());

    gw.updatedAt = new Date().toISOString();
    if (!gw.createdAt) {
      gw.createdAt = new Date().toISOString();
    }

    if (index >= 0) {
      gateways[index] = { ...gateways[index], ...gw };
    } else {
      gateways.push(gw);
    }

    settings.paymentGateways = gateways;
    this.saveSettings(settings);
    return gw;
  }

  static deleteGateway(id: string): boolean {
    const settings = this.getSettings();
    const gateways = settings.paymentGateways || [];
    const initialLen = gateways.length;
    settings.paymentGateways = gateways.filter(g => g.id.toLowerCase() !== id.toLowerCase());
    
    if (settings.paymentGateways.length < initialLen) {
      this.saveSettings(settings);
      return true;
    }
    return false;
  }

  static toggleGateway(id: string, active?: boolean): PaymentGatewayConfig | null {
    const settings = this.getSettings();
    const gateways = settings.paymentGateways || [];
    const target = gateways.find(g => g.id.toLowerCase() === id.toLowerCase());
    if (!target) return null;

    target.active = active !== undefined ? active : !target.active;
    target.updatedAt = new Date().toISOString();
    this.saveSettings(settings);
    return target;
  }

  // --- Audit Logs ---
  static getAuditLogs(): AuditLog[] {
    return this.readCollection<AuditLog>('audit_logs.json').sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static addAuditLog(adminId: string, action: string, details: string) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      adminId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    this.writeCollection('audit_logs.json', logs.slice(0, 500)); // Keep last 500 logs
  }
}
