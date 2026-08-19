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

  // Initialize database
  FileDatabase.init();

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

  // ==========================================
  // 1. PUBLIC ENDPOINTS
  // ==========================================

  // Get Public Gateway Configurations, Support and Platform Settings
  app.get('/api/public/settings', (req, res) => {
    try {
      const settings = FileDatabase.getSettings();
      return res.json({
        support: settings.support,
        paymentGateways: settings.paymentGateways.filter(g => g.active !== false),
        currencyRates: settings.currencyRates || { USD: 1, BDT: 125 },
        platformControls: settings.platformControls
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve public settings' });
    }
  });

  // Get All Active Payment Gateways for Deposit/Withdrawal
  app.get(['/api/gateways', '/api/public/gateways'], (req, res) => {
    try {
      const activeGateways = FileDatabase.getActiveGateways();
      return res.json({
        gateways: activeGateways,
        count: activeGateways.length
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve payment gateways' });
    }
  });

  // Get Single Gateway Details
  app.get('/api/gateways/:id', (req, res) => {
    try {
      const gw = FileDatabase.getGatewayById(req.params.id);
      if (!gw) {
        return res.status(404).json({ error: 'Payment gateway not found' });
      }
      return res.json({ gateway: gw });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve gateway details' });
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

      if (!amount || amount < 100) {
        return res.status(400).json({ error: 'Minimum deposit amount is $100' });
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
