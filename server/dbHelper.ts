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
  balance?: number;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'send' | 'adjustment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt?: string;
  reference?: string;
  note?: string;
  reviewedBy?: string;
}

export interface AgentRecord {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  balance: number;
  commissionRate: number;
  createdAt: string;
}

export interface MerchantRecord {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  status: 'active' | 'suspended';
  balance: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  currencyRates: Record<string, number>;
  contactLinks: any[];
}

export class FileDatabase {
  /**
   * Automatically ensure files/database/ directory exists.
   * Also ensures a default admin user exists if no users are registered.
   */
  static init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
        console.log(`[FileDB] Created database directory at: ${DB_DIR}`);
      }
      // Initialize json array files
      const collections = ['transactions.json', 'agents.json', 'merchants.json', 'audit_logs.json'];
      for (const col of collections) {
        if (!fs.existsSync(path.join(DB_DIR, col))) {
          fs.writeFileSync(path.join(DB_DIR, col), '[]', 'utf-8');
        }
      }
      if (!fs.existsSync(path.join(DB_DIR, 'settings.json'))) {
        fs.writeFileSync(path.join(DB_DIR, 'settings.json'), JSON.stringify({ currencyRates: { USD: 1, BDT: 120 }, contactLinks: [] }), 'utf-8');
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
            if (!user.accountStatus) user.accountStatus = 'active';
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

  // --- Collection Helpers ---
  private static readCollection<T>(filename: string): T[] {
    this.init();
    try {
      const content = fs.readFileSync(path.join(DB_DIR, filename), 'utf-8');
      return JSON.parse(content) as T[];
    } catch { return []; }
  }
  
  private static writeCollection<T>(filename: string, data: T[]) {
    this.init();
    fs.writeFileSync(path.join(DB_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
  }

  static getTransactions(): TransactionRecord[] {
    return this.readCollection<TransactionRecord>('transactions.json').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  static saveTransaction(tx: TransactionRecord) {
    const txs = this.getTransactions();
    const idx = txs.findIndex(t => t.id === tx.id);
    if (idx >= 0) txs[idx] = tx;
    else txs.push(tx);
    this.writeCollection('transactions.json', txs);
  }

  static getAgents(): AgentRecord[] { return this.readCollection<AgentRecord>('agents.json'); }
  static saveAgent(agent: AgentRecord) {
    const agents = this.getAgents();
    const idx = agents.findIndex(a => a.id === agent.id);
    if (idx >= 0) agents[idx] = agent;
    else agents.push(agent);
    this.writeCollection('agents.json', agents);
  }
  
  static getMerchants(): MerchantRecord[] { return this.readCollection<MerchantRecord>('merchants.json'); }
  static saveMerchant(merch: MerchantRecord) {
    const merchants = this.getMerchants();
    const idx = merchants.findIndex(m => m.id === merch.id);
    if (idx >= 0) merchants[idx] = merch;
    else merchants.push(merch);
    this.writeCollection('merchants.json', merchants);
  }

  static getSettings(): SystemSettings {
    this.init();
    try {
      return JSON.parse(fs.readFileSync(path.join(DB_DIR, 'settings.json'), 'utf-8'));
    } catch { return { currencyRates: { USD: 1 }, contactLinks: [] }; }
  }
  static saveSettings(settings: SystemSettings) {
    this.init();
    fs.writeFileSync(path.join(DB_DIR, 'settings.json'), JSON.stringify(settings, null, 2), 'utf-8');
  }

  static getAuditLogs(): AuditLog[] { return this.readCollection<AuditLog>('audit_logs.json').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); }
  static addAuditLog(adminId: string, action: string, details: string) {
    const logs = this.getAuditLogs();
    logs.push({ id: Date.now().toString(), adminId, action, details, timestamp: new Date().toISOString() });
    this.writeCollection('audit_logs.json', logs);
  }
}
