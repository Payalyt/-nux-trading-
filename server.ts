import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Default public settings fallback for Firebase-powered architecture
  app.get('/api/public/settings', (req, res) => {
    res.json({
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
      paymentGateways: [
        {
          id: 'bkash',
          name: 'bKash (BD)',
          category: 'mobile_banking',
          icon: 'https://i.postimg.cc/MZNd4Pjq/55.png',
          active: true,
          sendMoneyNumber: '01700000001',
          merchantNumber: '01700000002',
          cashOutNumber: '01700000003',
          instruction: 'Send money to the given bKash number and enter your TrxID.',
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
          instruction: 'Send money to the given Nagad number and enter your TrxID.',
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
          id: 'usdt-trc20',
          name: 'USDT (TRC-20)',
          category: 'crypto',
          icon: '₮',
          active: true,
          minDeposit: 10,
          maxDeposit: 100000,
          minWithdraw: 10,
          maxWithdraw: 50000,
          bonusPercent: 50,
          conversionRate: 1,
          cryptoDetails: {
            walletAddress: 'TYDzsYUEpvnYmQx9zBqR1sF3N9G8Q2vVwX',
            network: 'Tron (TRC20)',
          }
        }
      ],
      currencyRates: { USD: 1, BDT: 125, EUR: 0.92, INR: 86.5 },
      platformControls: {
        siteTitle: 'NUX Trading Platform',
        noticeBannerText: '🚀 Instant Automated Deposits & 24/7 Fast Withdrawals via bKash, Nagad & Crypto!',
        showNoticeBanner: true,
        maintenanceMode: false,
        tradingPayoutPercentage: 87,
        minTradeAmount: 1,
        maxTradeAmount: 5000,
        defaultDemoBalance: 10000
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} (Firebase Pure Mode)`);
  });
}

startServer();
