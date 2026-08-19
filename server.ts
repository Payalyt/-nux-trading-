import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { FileDatabase, UserRecord } from './server/dbHelper';

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
      passwordHash: adminHash,
      role: 'admin',
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
      passwordHash: payalHash,
      role: 'admin',
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
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
      }
      next();
    });
  };

  // --- API ROUTES ---

  // 1. Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, fullName } = req.body;
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
        return res.status(409).json({ error: 'User already exists' });
      }

      const userCount = FileDatabase.countUsers();
      const role: 'admin' | 'user' = userCount === 0 ? 'admin' : 'user';

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: UserRecord = {
        username: cleanUsername,
        fullName: fullName.trim(),
        passwordHash,
        role,
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
        user: { username: cleanUsername, fullName: newUser.fullName, role, createdAt: newUser.createdAt }
      });
    } catch (err: any) {
      console.error('[Register Error]', err);
      return res.status(500).json({ error: 'Internal server error during registration' });
    }
  });

  // 2. Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const user = FileDatabase.getUser(cleanUsername);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
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
        user: { username: user.username, fullName: user.fullName || user.username, role: user.role, createdAt: user.createdAt }
      });
    } catch (err: any) {
      console.error('[Login Error]', err);
      return res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  // 3. Social Auth (Google, Facebook, VK)
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
          passwordHash: dummyPasswordHash,
          role,
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
        user: { username: user.username, role: user.role, createdAt: user.createdAt, email: user.username, name: name || user.username }
      });
    } catch (err: any) {
      console.error('[Social Auth Error]', err);
      return res.status(500).json({ error: 'Failed to process social authentication' });
    }
  });

  // 4. Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('qx_token');
    return res.json({ message: 'Logged out successfully' });
  });

  // 4. Get Current Session User
  app.get('/api/auth/me', authenticateToken, (req: any, res: any) => {
    const user = FileDatabase.getUser(req.user.username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      user: { username: user.username, fullName: user.fullName || user.username, role: user.role, createdAt: user.createdAt }
    });
  });

  // 5. Admin: Get All Users
  app.get('/api/admin/users', requireAdmin, (req: any, res: any) => {
    try {
      const allUsers = FileDatabase.getAllUsers();
      // Omit passwordHash for safety
      const safeUsers = allUsers.map(({ passwordHash, ...u }) => u);
      return res.json({ users: safeUsers });
    } catch (err) {
      console.error('[Get Users Error]', err);
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
  });

  // 6. Admin: Delete User
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
        return res.json({ message: `Successfully deleted user file for ${targetUsername}` });
      } else {
        return res.status(500).json({ error: 'Failed to delete user file' });
      }
    } catch (err) {
      console.error('[Delete User Error]', err);
      return res.status(500).json({ error: 'Internal server error while deleting user' });
    }
  });

  // 7. Admin: Create User
  app.post('/api/admin/users', requireAdmin, async (req: any, res: any) => {
    try {
      const { username, password, role, phone, fullName } = req.body;
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
        phone: phone || '',
        fullName: fullName || '',
        createdAt: new Date().toISOString()
      };

      FileDatabase.saveUser(newUser);

      // Return the new user without password hash
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

  // 8. Admin: Update User (Phone, Full Name, Role, Password)
  app.put('/api/admin/users/:username', requireAdmin, async (req: any, res: any) => {
    try {
      const targetUsername = req.params.username.trim().toLowerCase();
      const { fullName, phone, role, password } = req.body;

      const user = FileDatabase.getUser(targetUsername);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (fullName !== undefined) user.fullName = fullName.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (role && (role === 'user' || role === 'admin')) user.role = role;
      if (password && password.trim().length >= 6) {
        user.passwordHash = await bcrypt.hash(password.trim(), 10);
      }

      FileDatabase.saveUser(user);

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

  // --- API 404 CATCH-ALL (Guarantees unmatched API requests return JSON rather than HTML) ---
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
    console.log(`[Server] Full-stack File-DB Authentication running on http://localhost:${PORT}`);
  });
}

startServer();
