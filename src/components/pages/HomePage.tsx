import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Play, 
  Globe, 
  DollarSign, 
  Lock, 
  BarChart3, 
  Users, 
  Clock, 
  CreditCard, 
  Smartphone, 
  HelpCircle, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  ExternalLink,
  Layers,
  Activity,
  UserCheck
} from 'lucide-react';
import { Asset, UserAccount } from '../../types/trading';
import { soundManager } from '../../utils/audio';

interface HomePageProps {
  onStartTrading: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectAssetAndTrade?: (assetId: string) => void;
  user?: UserAccount | null;
  assets?: Asset[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartTrading,
  onOpenAuth,
  onSelectAssetAndTrade,
  user,
  assets = [],
}) => {
  // Live ticking prices for the hero & asset tables
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; change: number; dir: 'up' | 'down' }>>({
    'EUR/USD': { price: 1.0845, change: +0.24, dir: 'up' },
    'BTC/USD': { price: 67450.0, change: +2.15, dir: 'up' },
    'USD/JPY': { price: 154.62, change: -0.18, dir: 'down' },
    'ETH/USD': { price: 3520.4, change: +1.42, dir: 'up' },
    'GOLD': { price: 2385.2, change: +0.85, dir: 'up' },
    'AAPL': { price: 189.45, change: -0.45, dir: 'down' },
  });

  const [activeMarketTab, setActiveMarketTab] = useState<'all' | 'currencies' | 'crypto' | 'commodities' | 'stocks'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Simulate subtle real-time market changes on the homepage
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const delta = (Math.random() - 0.49) * (next[key].price * 0.0008);
          const newPrice = Number((next[key].price + delta).toFixed(key.includes('USD') && !key.includes('BTC') && !key.includes('ETH') ? 4 : 2));
          next[key] = {
            price: newPrice,
            change: Number((next[key].change + (delta > 0 ? 0.02 : -0.02)).toFixed(2)),
            dir: delta >= 0 ? 'up' : 'down',
          };
        });
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const marketAssets = [
    { id: 'eurusd', symbol: 'EUR/USD (OTC)', category: 'currencies', payout: 92, price: livePrices['EUR/USD']?.price || 1.0845, change: '+0.24%', trend: 'up' },
    { id: 'btcusd', symbol: 'BTC/USD (Crypto)', category: 'crypto', payout: 95, price: livePrices['BTC/USD']?.price || 67450.0, change: '+2.15%', trend: 'up' },
    { id: 'usdjpy', symbol: 'USD/JPY (OTC)', category: 'currencies', payout: 88, price: livePrices['USD/JPY']?.price || 154.62, change: '-0.18%', trend: 'down' },
    { id: 'gold', symbol: 'Gold / USD (OTC)', category: 'commodities', payout: 90, price: livePrices['GOLD']?.price || 2385.2, change: '+0.85%', trend: 'up' },
    { id: 'ethusd', symbol: 'ETH/USD (Crypto)', category: 'crypto', payout: 93, price: livePrices['ETH/USD']?.price || 3520.4, change: '+1.42%', trend: 'up' },
    { id: 'aapl', symbol: 'Apple Inc. (OTC)', category: 'stocks', payout: 86, price: livePrices['AAPL']?.price || 189.45, change: '-0.45%', trend: 'down' },
  ];

  const filteredAssets = marketAssets.filter((item) => {
    if (activeMarketTab === 'all') return true;
    return item.category === activeMarketTab;
  });

  const faqs = [
    {
      q: 'What is the minimum deposit and minimum trade amount on Quotex?',
      a: 'The minimum deposit to start live trading on Quotex is only $10 (or equivalent in your local currency). The minimum investment amount per individual trade is just $1.',
    },
    {
      q: 'Is the $10,000 Demo Account really free?',
      a: 'Yes, 100% free! Every user receives an instant $10,000 reloadable practice balance upon registration or in 1-click preview mode. You can refill it back to $10,000 whenever needed without any fees.',
    },
    {
      q: 'How fast are withdrawal requests processed?',
      a: 'Withdrawal requests are processed promptly, typically within 15 minutes to 24 hours depending on the chosen payment method (crypto, e-wallets, or bank transfer), with 0% platform commission.',
    },
    {
      q: 'What assets and markets can I trade?',
      a: 'You can trade more than 400+ instruments including major currency pairs (EUR/USD, GBP/USD), cryptocurrencies (Bitcoin, Ethereum), commodities (Gold, Silver, Crude Oil), and top international stocks (Apple, Tesla, Google, Boeing).',
    },
    {
      q: 'How do Quotex Trading Signals work?',
      a: 'Quotex features integrated high-precision market signals powered by algorithmic analysis, giving you real-time recommendations on asset directions with historical accuracy rates up to 87%.',
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 w-full max-w-full bg-[#070a10] text-slate-100 overflow-y-auto overflow-x-hidden font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#0a0e17]/90 backdrop-blur-xl border-b border-white/10 px-3 sm:px-8 py-3 flex items-center justify-between w-full max-w-full">
        {/* Brand */}
        <div className="flex items-center space-x-3 sm:space-x-8">
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-white">QUOTEX</span>
                <span className="hidden xs:inline text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OFFICIAL
                </span>
              </div>
              <span className="hidden sm:block text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5">
                Innovation Trading Platform
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold text-slate-300">
            <button 
              onClick={() => scrollToSection('markets-section')} 
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Markets & Payouts
            </button>
            <button 
              onClick={() => scrollToSection('advantages-section')} 
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Advantages
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              How it Works
            </button>
            <button 
              onClick={() => scrollToSection('payments-section')} 
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Payment Methods
            </button>
            <button 
              onClick={() => scrollToSection('faq-section')} 
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {user ? (
            <button
              onClick={onStartTrading}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Go to Terminal</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenAuth('login');
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenAuth('register');
                }}
                className="flex items-center space-x-1 sm:space-x-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Hero Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Next-Gen High Frequency Binary Trading Platform</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-black uppercase">
              v3.8
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
            Innovative Platform for <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Smart Trading & Investments
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Trade more than 400+ assets with up to <strong className="text-white font-bold">98% payout rate</strong>. 
            Test your strategies with a complimentary <strong className="text-emerald-400 font-bold">$10,000 Demo account</strong> in 1 click.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenAuth('register');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onStartTrading();
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold text-sm rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Practice on $10,000 Demo</span>
            </button>
          </div>

          {/* Micro Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-4">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>$10 Minimum Deposit</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>$1 Minimum Trade</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>0% Commission</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Payouts</span>
            </div>
          </div>

          {/* Hero Interactive Terminal Mockup */}
          <div className="pt-6">
            <div 
              onClick={onStartTrading}
              className="relative mx-auto max-w-5xl rounded-2xl bg-[#0f1420]/90 border border-white/15 p-4 sm:p-6 shadow-2xl shadow-emerald-500/10 cursor-pointer group hover:border-emerald-500/40 transition-all"
            >
              <div className="absolute top-3 left-4 flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="text-center text-xs font-mono text-slate-400 pb-4">
                Quotex Live Terminal • EUR/USD OTC (92% Payout) • Live Trading Mode
              </div>

              {/* Chart Visual Simulation */}
              <div className="h-64 sm:h-80 w-full bg-[#0a0e17] rounded-xl border border-white/5 p-4 relative overflow-hidden flex flex-col justify-between">
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10 pointer-events-none">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="border border-slate-600"></div>
                  ))}
                </div>

                {/* Top Chart Stats */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-sm text-white">EUR/USD (OTC)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black">
                      92% Payout
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ${livePrices['EUR/USD']?.price.toFixed(4) || '1.0845'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-semibold">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">1M</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Candles</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-bold">Live Feed</span>
                  </div>
                </div>

                {/* Simulated Candlestick / Area SVG Graph */}
                <div className="relative w-full h-44 my-auto flex items-center">
                  <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,140 Q100,120 200,150 T400,90 T600,60 T800,40 L800,200 L0,200 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M0,140 Q100,120 200,150 T400,90 T600,60 T800,40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                    />
                  </svg>
                  
                  {/* Pulsing Target Point */}
                  <div className="absolute right-0 top-[18%] -translate-y-1/2 flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></div>
                    <div className="px-2 py-1 rounded-lg bg-emerald-500 text-black font-mono font-black text-xs shadow-lg">
                      ${livePrices['EUR/USD']?.price.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Bottom Chart Execution Overlay */}
                <div className="flex items-center justify-between z-10 pt-2 border-t border-white/5">
                  <div className="text-xs text-slate-400">
                    Estimated Profit: <span className="text-emerald-400 font-bold font-mono">+$92.00 on $100</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="px-4 py-1.5 bg-emerald-500 text-black text-xs font-black rounded-lg">
                      CALL (UP) +92%
                    </span>
                    <span className="px-4 py-1.5 bg-rose-500 text-white text-xs font-black rounded-lg">
                      PUT (DOWN) +92%
                    </span>
                  </div>
                </div>

                {/* Hover Click overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <div className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-black text-sm flex items-center space-x-2 shadow-2xl shadow-emerald-500/40">
                    <Play className="w-4 h-4 fill-black" />
                    <span>Launch Live Interactive Web Terminal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM STATS BAR */}
      <section className="bg-[#0b0f19] border-y border-white/10 py-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black font-mono-nums text-white">4,000,000+</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Traders Globally</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black font-mono-nums text-emerald-400">98% Max</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Highest Asset Payout</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black font-mono-nums text-cyan-400">&lt; 15 Mins</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average Withdrawal</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black font-mono-nums text-amber-400">$10,000</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Free Demo Practice</div>
          </div>
        </div>
      </section>

      {/* 4. MARKETS & PAYOUTS SECTION */}
      <section id="markets-section" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Over 400+ Live Assets</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Trade with the Industry&apos;s Highest Profitability
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Choose from currencies, crypto, commodities, and equities with instant trade execution and real-time quotes.
          </p>
        </div>

        {/* Market Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(['all', 'currencies', 'crypto', 'commodities', 'stocks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundManager.playClick();
                setActiveMarketTab(tab);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeMarketTab === tab
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {tab === 'all' ? 'All Markets' : tab}
            </button>
          ))}
        </div>

        {/* Asset Table */}
        <div className="bg-[#0f1422] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Asset / Symbol</th>
                  <th className="py-3.5 px-6">Live Price</th>
                  <th className="py-3.5 px-6">24h Movement</th>
                  <th className="py-3.5 px-6 text-center">Payout Rate</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          {asset.symbol.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{asset.symbol}</div>
                          <div className="text-[10px] text-slate-400 uppercase">{asset.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-sm text-slate-200">
                      ${asset.price.toFixed(asset.category === 'currencies' ? 4 : 2)}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold">
                      <span className={`inline-flex items-center space-x-1 ${asset.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {asset.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{asset.change}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs">
                        +{asset.payout}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          if (onSelectAssetAndTrade) {
                            onSelectAssetAndTrade(asset.id);
                          }
                          onStartTrading();
                        }}
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-lg shadow-md hover:shadow-emerald-500/30 transition-all cursor-pointer"
                      >
                        Trade Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. ADVANTAGES SECTION */}
      <section id="advantages-section" className="py-20 px-4 sm:px-8 bg-[#0b0f19] border-y border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Platform Advantages</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Engineered for Speed, Precision & Transparency
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Everything you need to trade successfully, wrapped in an ultra-responsive interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#101624] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Ultra-Fast 1-Click Execution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero slippage and instant sub-second order placements with durations from 5 seconds to 4 hours.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#101624] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Built-in AI Trading Signals</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive live automated recommendations with up to 87% accuracy directly within the trading chart.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#101624] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">0% Deposit & Withdrawal Fees</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keep 100% of your earnings. Quotex does not charge any fee on deposits or payouts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#101624] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Pro Charting & 20+ Indicators</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Equipped with RSI, MACD, Bollinger Bands, Moving Averages, and customizable timeframes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#101624] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Regulated & Isolated Balances</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All client funds are stored in segregated tier-1 accounts with multi-layer SSL and 2FA protection.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#101624] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">24/7 Multilingual Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated support team ready to assist you in English, Bengali, Hindi, Spanish, and 15+ languages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (3 EASY STEPS) */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase">
            <Play className="w-3.5 h-3.5" />
            <span>Quick Start</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            How to Start Trading in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From registration to your first profitable trade in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-8 space-y-4 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-black text-sm flex items-center justify-center shadow-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Register Account</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign up in 10 seconds with an email and password. No paperwork required to start immediately.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-8 space-y-4 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-black text-sm flex items-center justify-center shadow-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Practice on $10k Demo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test indicators and hone your strategy risk-free using your replenishable $10,000 demo portfolio.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0f1422] border border-white/10 rounded-2xl p-8 space-y-4 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-black text-sm flex items-center justify-center shadow-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Deposit & Profit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fund from just $10, place trades with up to 98% returns, and withdraw your earnings instantly.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAuth('register');
            }}
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Open Your Free Account Now
          </button>
        </div>
      </section>

      {/* 7. PAYMENT METHODS SECTION */}
      <section id="payments-section" className="py-20 px-4 sm:px-8 bg-[#0b0f19] border-y border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Instant Transactions</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Convenient & Secure Payment Systems
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Deposit and withdraw via cryptocurrencies, cards, e-wallets, and regional payment providers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: 'USDT (TRC20/ERC20)', tag: 'Instant', icon: '₮' },
              { name: 'Bitcoin (BTC)', tag: 'Crypto', icon: '₿' },
              { name: 'Binance Pay', tag: '0% Fee', icon: '⟁' },
              { name: 'Visa / Mastercard', tag: 'Cards', icon: '💳' },
              { name: 'Perfect Money', tag: 'E-Wallet', icon: 'PM' },
              { name: 'bKash / Nagad', tag: 'Mobile', icon: '৳' },
            ].map((method, i) => (
              <div key={i} className="bg-[#101624] border border-white/10 rounded-2xl p-4 text-center space-y-2 hover:border-emerald-500/40 transition-all">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 font-extrabold text-base">
                  {method.icon}
                </div>
                <div className="font-bold text-xs text-white">{method.name}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{method.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section id="faq-section" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions & Answers</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to know about trading on Quotex.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#0f1422] border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between space-x-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-sm text-white">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. BOTTOM CTA BANNER */}
      <section className="py-16 px-4 sm:px-8 bg-gradient-to-br from-emerald-950/40 via-[#0a0e17] to-teal-950/40 border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Ready to Start Earning with Quotex?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Join over 4,000,000 active traders today. Claim a 50% bonus on your first deposit or practice with $10,000 demo funds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenAuth('register');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all cursor-pointer"
            >
              Sign Up in 1 Click
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onStartTrading();
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl border border-white/10 transition-all cursor-pointer"
            >
              Open Web Terminal
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#05070c] border-t border-white/10 py-12 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-black">
                Q
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">QUOTEX TRADING</div>
                <div className="text-[10px] text-slate-500">Official High-Performance Broker</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[11px] font-semibold text-slate-400">
              <button onClick={onStartTrading} className="hover:text-emerald-400 transition-colors">Trade Terminal</button>
              <button onClick={() => scrollToSection('markets-section')} className="hover:text-emerald-400 transition-colors">Markets</button>
              <button onClick={() => scrollToSection('advantages-section')} className="hover:text-emerald-400 transition-colors">Advantages</button>
              <button onClick={() => onOpenAuth('login')} className="hover:text-emerald-400 transition-colors">Client Login</button>
              <button onClick={() => onOpenAuth('register')} className="hover:text-emerald-400 transition-colors">Registration</button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-3 text-[10px] text-slate-400 leading-relaxed">
            <p>
              <strong className="text-slate-300">Risk Warning:</strong> Trading financial instruments and binary options involves substantial risk and may lead to the loss of all invested capital. Before you begin trading, ensure you fully understand the risks involved and consider your investment objectives.
            </p>
            <p>© 2026 Quotex. All rights reserved. Registered & Protected Financial Platform.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
