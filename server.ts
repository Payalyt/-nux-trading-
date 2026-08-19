import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { FileDatabase, UserRecord, TransactionRecord, PaymentGatewayConfig, SupportSettings, SystemSettings } from './server/dbHelper';

const JWT_SECRET = process.env.JWT_SECRET || 'qx_file_auth_secret_key_2026_secure';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize file-based database & ensure default admin
  FileDatabase.init();
  if (FileDatabase.countUsers() === 0) {
    const adminHash = bcrypt.hashSync('Admin123!', 10);
    const defaultAdmin: UserRecord = {
      username: 'admin',
      fullName: 'Chief System Administrator',
      passwordHash: adminHash,
      role: 'admin',
      balance: 10000,
      demoBalance: 10000,
      createdAt: new Date().toISOString()
    };
    FileDatabase.saveUser(defaultAdmin);
    console.log('[Server] Initialized default admin user: admin / Admin123!');
  }

  // Ensure payalyt52@gmail.com is an admin
  if (!FileDatabase.userExists('payalyt52@gmail.com')) {
    const payalHash = bcrypt.hashSync('11111111', 10);
    const payalAdmin: UserRecord = {
      username: 'payalyt52@gmail.com',
      fullName: 'Payal Admin',
      phone: '+8801700000000',
      passwordHash: payalHash,
      role: 'admin',
      balance: 5000,
      demoBalance: 10000,
      createdAt: new Date().toISOString()
    };
    FileDatabase.saveUser(payalAdmin);
    console.log('[Server] Initialized admin user: payalyt52@gmail.com / 11111111');
  }

  app.use(express.json());
  app.use(cookieParser());

  // Handle invalid JSON body payload errors gracefully with a JSON response
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: 'Invalid JSON payload provided.' });
    }
    next(err);
  });

  // Ensure all API responses default to Content-Type: application/json
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies?.qx_token || req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired session' });
      }
      req.user = user;
      next();
    });
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
        return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
      }
      next();
    });
  };

  // ==========================================
  // 1. PUBLIC ENDPOINTS
  // ==========================================

  // Get Public Gateway Configurations and Support Settings
  app.get('/api/public/settings', (req, res) => {
    try {
      const settings = FileDatabase.getSettings();
      return res.json({
        support: settings.support,
        paymentGateways: settings.paymentGateways.filter(g => g.active),
        currencyRates: settings.currencyRates || { USD: 1, BDT: 125 }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve public settings' });
    }
  });

  // ==========================================
  // 2. AUTHENTICATION ENDPOINTS
  // ==========================================

  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, fullName, phone } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      if (!fullName || !fullName.trim()) {
        return res.status(400).json({ error: 'Full name is required for registration' });
      }

      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long' });
      }

      if (FileDatabase.userExists(cleanUsername)) {
        return res.status(409).json({ error: 'User account already exists' });
      }

      const userCount = FileDatabase.countUsers();
      const role: 'admin' | 'user' = userCount === 0 ? 'admin' : 'user';

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: UserRecord = {
        username: cleanUsername,
        fullName: fullName.trim(),
        phone: phone || '',
        passwordHash,
        role,
        balance: 0,
        demoBalance: 10000,
        accountStatus: 'active',
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString()
      };

      FileDatabase.saveUser(newUser);

      // Issue token on registration
      const token = jwt.sign({ username: cleanUsername, role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('qx_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          username: cleanUsername,
          fullName: newUser.fullName,
          phone: newUser.phone,
          role,
          balance: newUser.balance,
          demoBalance: newUser.demoBalance,
          createdAt: newUser.createdAt
        }
      });
    } catch (err: any) {
      console.error('[Register Error]', err);
      return res.status(500).json({ error: 'Internal server error during registration' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const user = FileDatabase.getUser(cleanUsername);
      if (!user) {
        return res.status(404).json({ error: 'Account not found with this username/email' });
      }

      if (user.accountStatus === 'blocked') {
        return res.status(403).json({ error: 'This account has been suspended by administration.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password. Please verify credentials.' });
      }

      const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('qx_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        message: 'Logged in successfully',
        user: {
          username: user.username,
          fullName: user.fullName || user.username,
          phone: user.phone || '',
          role: user.role,
          balance: user.balance || 0,
          demoBalance: user.demoBalance || 10000,
          verificationStatus: user.verificationStatus || 'unverified',
          createdAt: user.createdAt
        }
      });
    } catch (err: any) {
      console.error('[Login Error]', err);
      return res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  // Social Auth
  app.post('/api/auth/social', async (req, res) => {
    try {
      const { provider, email, name } = req.body;
      if (!provider || !email) {
        return res.status(400).json({ error: 'Provider and email are required for social login' });
      }

      const cleanUsername = email.trim().toLowerCase();
      let user = FileDatabase.getUser(cleanUsername);

      if (!user) {
        const userCount = FileDatabase.countUsers();
        const role: 'admin' | 'user' = userCount === 0 ? 'admin' : 'user';
        const dummyPasswordHash = await bcrypt.hash(`social_${provider}_${Date.now()}_${Math.random()}`, 10);
        user = {
          username: cleanUsername,
          fullName: name || cleanUsername.split('@')[0],
          passwordHash: dummyPasswordHash,
          role,
          balance: 0,
          demoBalance: 10000,
          accountStatus: 'active',
          verificationStatus: 'unverified',
          createdAt: new Date().toISOString()
        };
        FileDatabase.saveUser(user);
      }

      const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('qx_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        message: `${provider} login successful`,
        user: {
          username: user.username,
          email: user.username,
          fullName: user.fullName || name,
          role: user.role,
          balance: user.balance || 0,
          demoBalance: user.demoBalance || 10000,
          verificationStatus: user.verificationStatus || 'unverified',
          createdAt: user.createdAt
        }
      });
    } catch (err: any) {
      console.error('[Social Auth Error]', err);
      return res.status(500).json({ error: 'Failed to process social authentication' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('qx_token');
    return res.json({ message: 'Logged out successfully' });
  });

  // Get Current Session User & Balances
  app.get('/api/auth/me', authenticateToken, (req: any, res: any) => {
    const user = FileDatabase.getUser(req.user.username);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    return res.json({
      user: {
        username: user.username,
        fullName: user.fullName || user.username,
        phone: user.phone || '',
        role: user.role,
        balance: user.balance || 0,
        demoBalance: user.demoBalance || 10000,
        accountStatus: user.accountStatus || 'active',
        verificationStatus: user.verificationStatus || 'unverified',
        createdAt: user.createdAt
      }
    });
  });

  // ==========================================
  // 3. USER TRANSACTIONS & DEPOSIT/WITHDRAWAL
  // ==========================================

  // Get logged-in user transactions
  app.get('/api/user/transactions', authenticateToken, (req: any, res: any) => {
    try {
      const username = req.user.username;
      const allTx = FileDatabase.getTransactions();
      const userTx = allTx.filter(t => t.userId.toLowerCase() === username.toLowerCase());
      return res.json({ transactions: userTx });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch user transactions' });
    }
  });

  // User submits a deposit request
  app.post('/api/user/deposit', authenticateToken, (req: any, res: any) => {
    try {
      const username = req.user.username;
      const { amount, gateway, paymentType, senderNumber, trxId, userNote, bonusAmount } = req.body;

      if (!amount || amount < 5) {
        return res.status(400).json({ error: 'Minimum deposit amount is $5' });
      }

      if (!gateway) {
        return res.status(400).json({ error: 'Payment gateway method is required' });
      }

      if (!trxId && !senderNumber) {
        return res.status(400).json({ error: 'Transaction ID or Sender Account number is required' });
      }

      const user = FileDatabase.getUser(username);
      const settings = FileDatabase.getSettings();
      const gwConfig = settings.paymentGateways.find(g => g.id.toLowerCase() === gateway.toLowerCase() || g.name.toLowerCase().includes(gateway.toLowerCase()));
      const rate = gwConfig ? gwConfig.conversionRate : 125;
      const amountBdt = Math.round(Number(amount) * rate);

      const newTx: TransactionRecord = {
        id: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: username,
        userName: user?.fullName || username,
        userPhone: user?.phone || senderNumber || '',
        type: 'deposit',
        amount: Number(amount),
        amountBdt,
        bonus: Number(bonusAmount) || 0,
        currency: 'USD',
        gateway: gwConfig?.name || gateway,
        paymentType: paymentType || 'send_money',
        senderNumber: senderNumber || '',
        trxId: trxId || '',
        status: 'pending',
        userNote: userNote || '',
        createdAt: new Date().toISOString()
      };

      FileDatabase.saveTransaction(newTx);

      return res.status(201).json({
        message: 'Deposit request submitted successfully! Awaiting administrator approval.',
        transaction: newTx
      });
    } catch (err: any) {
      console.error('[Deposit Error]', err);
      return res.status(500).json({ error: 'Internal server error while processing deposit' });
    }
  });

  // User submits a withdrawal request
  app.post('/api/user/withdrawal', authenticateToken, (req: any, res: any) => {
    try {
      const username = req.user.username;
      const { amount, gateway, receiverNumber, paymentType, userNote } = req.body;

      if (!amount || amount < 10) {
        return res.status(400).json({ error: 'Minimum withdrawal amount is $10' });
      }

      if (!receiverNumber) {
        return res.status(400).json({ error: 'Receiver account or wallet number is required' });
      }

      const user = FileDatabase.getUser(username);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const currentBalance = user.balance || 0;
      if (currentBalance < Number(amount)) {
        return res.status(400).json({ error: `Insufficient live balance. Available: $${currentBalance.toFixed(2)}` });
      }

      // Deduct balance upfront upon withdrawal submission
      const updatedUser = FileDatabase.updateUserBalance(username, -Number(amount));

      const settings = FileDatabase.getSettings();
      const gwConfig = settings.paymentGateways.find(g => g.id.toLowerCase() === (gateway || '').toLowerCase() || g.name.toLowerCase().includes((gateway || '').toLowerCase()));
      const rate = gwConfig ? gwConfig.conversionRate : 125;
      const amountBdt = Math.round(Number(amount) * rate);

      const newTx: TransactionRecord = {
        id: `WTH-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: username,
        userName: user.fullName || username,
        userPhone: user.phone || receiverNumber || '',
        type: 'withdrawal',
        amount: Number(amount),
        amountBdt,
        bonus: 0,
        currency: 'USD',
        gateway: gwConfig?.name || gateway || 'Mobile Banking',
        paymentType: paymentType || 'cash_out',
        receiverNumber: receiverNumber || '',
        status: 'pending',
        userNote: userNote || '',
        createdAt: new Date().toISOString()
      };

      FileDatabase.saveTransaction(newTx);

      return res.status(201).json({
        message: 'Withdrawal request submitted! It will be reviewed and sent to your account.',
        transaction: newTx,
        newBalance: updatedUser?.balance || 0
      });
    } catch (err: any) {
      console.error('[Withdrawal Error]', err);
      return res.status(500).json({ error: 'Internal server error while processing withdrawal' });
    }
  });

  // Reset Demo Balance
  app.post('/api/user/reset-demo', authenticateToken, (req: any, res: any) => {
    try {
      const username = req.user.username;
      const user = FileDatabase.updateUserBalance(username, 0, 10000, true);
      return res.json({ message: 'Demo practice balance reset to $10,000.00', demoBalance: user?.demoBalance || 10000 });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to reset demo balance' });
    }
  });

  // ==========================================
  // 4. ADMIN USER MANAGEMENT ENDPOINTS
  // ==========================================

  // Admin: Get All Users
  app.get('/api/admin/users', requireAdmin, (req: any, res: any) => {
    try {
      const allUsers = FileDatabase.getAllUsers();
      const safeUsers = allUsers.map(({ passwordHash, ...u }) => u);
      return res.json({ users: safeUsers });
    } catch (err) {
      console.error('[Get Users Error]', err);
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
  });

  // Admin: Create User
  app.post('/api/admin/users', requireAdmin, async (req: any, res: any) => {
    try {
      const { username, password, role, phone, fullName, balance, demoBalance } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const cleanUsername = username.trim().toLowerCase();
      if (FileDatabase.userExists(cleanUsername)) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: UserRecord = {
        username: cleanUsername,
        passwordHash,
        role: role === 'admin' ? 'admin' : 'user',
        phone: phone ? phone.trim() : '',
        fullName: fullName ? fullName.trim() : cleanUsername,
        balance: Number(balance) || 0,
        demoBalance: Number(demoBalance) || 10000,
        accountStatus: 'active',
        verificationStatus: 'verified',
        createdAt: new Date().toISOString()
      };

      FileDatabase.saveUser(newUser);
      FileDatabase.addAuditLog(req.user.username, 'CREATE_USER', `Created user ${cleanUsername} with initial balance $${newUser.balance}`);

      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(201).json({
        message: 'User created successfully',
        user: safeUser
      });
    } catch (err: any) {
      console.error('[Create User Error]', err);
      return res.status(500).json({ error: 'Internal server error while creating user' });
    }
  });

  // Admin: Update User (Details, Role, Password, Verification)
  app.put('/api/admin/users/:username', requireAdmin, async (req: any, res: any) => {
    try {
      const targetUsername = req.params.username.trim().toLowerCase();
      const { fullName, phone, role, password, accountStatus, verificationStatus } = req.body;

      const user = FileDatabase.getUser(targetUsername);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (fullName !== undefined) user.fullName = fullName.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (role && (role === 'user' || role === 'admin')) user.role = role;
      if (accountStatus) user.accountStatus = accountStatus;
      if (verificationStatus) user.verificationStatus = verificationStatus;
      if (password && password.trim().length >= 6) {
        user.passwordHash = await bcrypt.hash(password.trim(), 10);
      }

      FileDatabase.saveUser(user);
      FileDatabase.addAuditLog(req.user.username, 'UPDATE_USER', `Updated details for ${targetUsername}`);

      const { passwordHash: _, ...safeUser } = user;
      return res.json({
        message: 'User updated successfully',
        user: safeUser
      });
    } catch (err: any) {
      console.error('[Update User Error]', err);
      return res.status(500).json({ error: 'Internal server error while updating user' });
    }
  });

  // Admin: Direct Balance Adjustment
  app.put('/api/admin/users/:username/balance', requireAdmin, (req: any, res: any) => {
    try {
      const targetUsername = req.params.username.trim().toLowerCase();
      const { liveBalance, demoBalance, adjustmentAmount, adjustmentType, reason } = req.body;

      const user = FileDatabase.getUser(targetUsername);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let updatedUser: UserRecord | null = null;

      if (liveBalance !== undefined) {
        updatedUser = FileDatabase.updateUserBalance(targetUsername, Number(liveBalance), demoBalance !== undefined ? Number(demoBalance) : undefined, true);
        FileDatabase.addAuditLog(req.user.username, 'SET_BALANCE', `Set ${targetUsername} live balance to $${liveBalance}. Note: ${reason || 'Admin adjustment'}`);
      } else if (adjustmentAmount !== undefined) {
        const delta = adjustmentType === 'debit' ? -Math.abs(Number(adjustmentAmount)) : Math.abs(Number(adjustmentAmount));
        updatedUser = FileDatabase.updateUserBalance(targetUsername, delta, undefined, false);
        FileDatabase.addAuditLog(req.user.username, 'ADJUST_BALANCE', `${adjustmentType === 'debit' ? 'Debited' : 'Credited'} $${adjustmentAmount} to ${targetUsername}. Note: ${reason || 'Admin balance adjustment'}`);
      }

      if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to update balance' });
      }

      const { passwordHash: _, ...safeUser } = updatedUser;
      return res.json({
        message: `Balance updated for ${targetUsername}`,
        user: safeUser
      });
    } catch (err: any) {
      console.error('[Balance Adjustment Error]', err);
      return res.status(500).json({ error: 'Internal server error during balance adjustment' });
    }
  });

  // Admin: Delete User
  app.delete('/api/admin/users/:username', requireAdmin, (req: any, res: any) => {
    try {
      const targetUsername = req.params.username.trim().toLowerCase();
      const requesterUsername = req.user.username;

      if (targetUsername === requesterUsername) {
        return res.status(400).json({ error: 'Action denied: An admin cannot delete their own account file.' });
      }

      if (!FileDatabase.userExists(targetUsername)) {
        return res.status(404).json({ error: 'User file not found' });
      }

      const success = FileDatabase.deleteUser(targetUsername);
      if (success) {
        FileDatabase.addAuditLog(req.user.username, 'DELETE_USER', `Deleted user account file for ${targetUsername}`);
        return res.json({ message: `Successfully deleted user file for ${targetUsername}` });
      } else {
        return res.status(500).json({ error: 'Failed to delete user file' });
      }
    } catch (err) {
      console.error('[Delete User Error]', err);
      return res.status(500).json({ error: 'Internal server error while deleting user' });
    }
  });

  // ==========================================
  // 5. ADMIN DEPOSIT & WITHDRAWAL TRANSACTIONS
  // ==========================================

  // Admin: Get All Transactions
  app.get('/api/admin/transactions', requireAdmin, (req: any, res: any) => {
    try {
      const { status, type, search } = req.query;
      let txs = FileDatabase.getTransactions();

      if (status && status !== 'all') {
        txs = txs.filter(t => t.status === status);
      }
      if (type && type !== 'all') {
        txs = txs.filter(t => t.type === type);
      }
      if (search) {
        const q = String(search).toLowerCase().trim();
        txs = txs.filter(t => 
          t.id.toLowerCase().includes(q) || 
          t.userId.toLowerCase().includes(q) || 
          (t.senderNumber && t.senderNumber.toLowerCase().includes(q)) || 
          (t.receiverNumber && t.receiverNumber.toLowerCase().includes(q)) || 
          (t.trxId && t.trxId.toLowerCase().includes(q)) || 
          (t.userName && t.userName.toLowerCase().includes(q))
        );
      }

      return res.json({ transactions: txs });
    } catch (err: any) {
      console.error('[Admin Transactions Error]', err);
      return res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
  });

  // Admin: Approve or Reject a Deposit/Withdrawal Request
  app.put('/api/admin/transactions/:id/status', requireAdmin, (req: any, res: any) => {
    try {
      const txId = req.params.id;
      const { status, adminNote } = req.body;

      if (!status || !['approved', 'rejected', 'completed', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid transaction status provided' });
      }

      const result = FileDatabase.updateTransactionStatus(txId, status, req.user.username, adminNote);

      if (result.error || !result.transaction) {
        return res.status(404).json({ error: result.error || 'Transaction not found' });
      }

      FileDatabase.addAuditLog(
        req.user.username,
        `TRANSACTION_${status.toUpperCase()}`,
        `${status.toUpperCase()} ${result.transaction.type} #${result.transaction.id} for user ${result.transaction.userId} ($${result.transaction.amount}). Note: ${adminNote || 'Processed'}`
      );

      return res.json({
        message: `Transaction ${txId} successfully marked as ${status}`,
        transaction: result.transaction,
        updatedUserBalance: result.user?.balance
      });
    } catch (err: any) {
      console.error('[Admin Transaction Status Error]', err);
      return res.status(500).json({ error: 'Internal server error while updating transaction status' });
    }
  });

  // ==========================================
  // 6. ADMIN PAYMENT GATEWAYS & SETTINGS
  // ==========================================

  // Admin: Get All System Settings
  app.get('/api/admin/settings', requireAdmin, (req: any, res: any) => {
    try {
      const settings = FileDatabase.getSettings();
      return res.json({ settings });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get system settings' });
    }
  });

  // Admin: Save System Settings (Payment Gateways, Numbers, Support Links)
  app.put('/api/admin/settings', requireAdmin, (req: any, res: any) => {
    try {
      const { support, paymentGateways, currencyRates } = req.body;
      const current = FileDatabase.getSettings();

      if (support) {
        current.support = {
          ...current.support,
          ...support
        };
      }

      if (paymentGateways && Array.isArray(paymentGateways)) {
        current.paymentGateways = paymentGateways;
      }

      if (currencyRates) {
        current.currencyRates = {
          ...current.currencyRates,
          ...currencyRates
        };
      }

      const saved = FileDatabase.saveSettings(current);
      FileDatabase.addAuditLog(req.user.username, 'UPDATE_SETTINGS', 'Updated payment gateway numbers, credentials and support links');

      return res.json({
        message: 'System & payment settings updated successfully!',
        settings: saved
      });
    } catch (err: any) {
      console.error('[Save Settings Error]', err);
      return res.status(500).json({ error: 'Failed to update system settings' });
    }
  });

  // Admin: Audit Logs
  app.get('/api/admin/audit-logs', requireAdmin, (req: any, res: any) => {
    try {
      const logs = FileDatabase.getAuditLogs();
      return res.json({ auditLogs: logs });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // --- API 404 CATCH-ALL ---
  app.all('/api/*', (req, res) => {
    return res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
  });

  // --- GLOBAL API ERROR HANDLER ---
  app.use((err: any, req: any, res: any, next: any) => {
    if (req.path.startsWith('/api')) {
      console.error('[Unhandled API Server Error]', err);
      return res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
      });
    }
    next(err);
  });

  // --- VITE / STATIC MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Quotex Full-Stack Admin Engine running on http://localhost:${PORT}`);
  });
}

startServer();
