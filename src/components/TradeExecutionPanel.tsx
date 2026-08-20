import React, { useState } from 'react';
import { Asset, Trade, AccountType } from '../types/trading';
import { soundManager } from '../utils/audio';
import { 
  Minus, 
  Plus, 
  Clock, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface TradeExecutionPanelProps {
  asset: Asset;
  currentPrice: number;
  balance: number;
  accountType: AccountType;
  tradeDuration: number;
  setTradeDuration: React.Dispatch<React.SetStateAction<number>>;
  investment: number;
  setInvestment: React.Dispatch<React.SetStateAction<number>>;
  onPlaceTrade: (type: 'CALL' | 'PUT') => void;
  activeTrades: Trade[];
  completedTrades: Trade[];
  onSellEarly: (tradeId: string) => void;
}

export const TradeExecutionPanel: React.FC<TradeExecutionPanelProps> = ({
  asset,
  currentPrice,
  balance,
  accountType: _accountType,
  tradeDuration,
  setTradeDuration,
  investment,
  setInvestment,
  onPlaceTrade,
  activeTrades,
  completedTrades: _completedTrades,
  onSellEarly,
}) => {
  const [isPendingTrade, setIsPendingTrade] = useState(false);
  const [activeTab, setActiveTab] = useState<'trades' | 'orders' | 'leaderboard'>('trades');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  // Real-time updating unlimited Top Winners / Leaderboard
  const [topTraders, setTopTraders] = React.useState([
    { rank: 1, name: 'Shahadat_FX', country: '🇧🇩', profit: 18820.50, winRate: 94 },
    { rank: 2, name: 'Gabriel_Trader', country: '🇧🇷', profit: 15450.00, winRate: 91 },
    { rank: 3, name: 'Rahul_Quant', country: '🇮🇳', profit: 12840.20, winRate: 89 },
    { rank: 4, name: 'Tanvir_Pro', country: '🇧🇩', profit: 10210.00, winRate: 87 },
    { rank: 5, name: 'Bagus_Invest', country: '🇮🇩', profit: 8940.00, winRate: 85 },
    { rank: 6, name: 'Liam_Alpha', country: '🇬🇧', profit: 7850.50, winRate: 84 },
    { rank: 7, name: 'Arief_Master', country: '🇲🇾', profit: 6920.00, winRate: 82 },
    { rank: 8, name: 'Nguyen_Trader', country: '🇻🇳', profit: 5800.00, winRate: 80 },
    { rank: 9, name: 'Elena_Crypto', country: '🇩🇪', profit: 5120.30, winRate: 79 },
    { rank: 10, name: 'Tariq_Pro', country: '🇦🇪', profit: 4650.00, winRate: 78 },
    { rank: 11, name: 'David_USA', country: '🇺🇸', profit: 4100.00, winRate: 77 },
    { rank: 12, name: 'Hasan_BD', country: '🇧🇩', profit: 3890.00, winRate: 76 }
  ]);

  // Periodically update top winners profit in real time
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTopTraders((prev) =>
        prev.map((trader) => {
          const delta = (Math.random() - 0.2) * 45;
          return {
            ...trader,
            profit: Math.max(1000, trader.profit + delta)
          };
        }).sort((a, b) => b.profit - a.profit).map((t, idx) => ({ ...t, rank: idx + 1 }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Time format helper (00:01:00)
  const formatTimeDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    return `${String(hrs).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleTimeAdjust = (delta: number) => {
    soundManager.playClick();
    setTradeDuration((prev) => Math.max(5, Math.min(3600, prev + delta)));
  };

  const handleInvestmentAdjust = (delta: number) => {
    soundManager.playClick();
    setInvestment((prev) => Math.max(1, Math.min(balance > 0 ? balance : 10000, prev + delta)));
  };

  const handleExecute = (type: 'CALL' | 'PUT') => {
    if (isPendingTrade) {
      soundManager.playClick();
      const newOrder = {
        id: `ORD-${Date.now()}`,
        asset: asset.symbol,
        type,
        investment,
        targetPrice: (currentPrice * (type === 'CALL' ? 0.9995 : 1.0005)).toFixed(5),
        duration: tradeDuration,
        status: 'PENDING',
        createdAt: new Date().toLocaleTimeString()
      };
      setPendingOrders((prev) => [newOrder, ...prev]);
      setActiveTab('orders');
    } else {
      onPlaceTrade(type);
    }
  };

  // Expected payout calculation
  const payoutMultiplier = 1 + asset.payout / 100;
  const expectedReturn = investment * payoutMultiplier;
  const netProfit = investment * (asset.payout / 100);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (Visible on lg+ screens: standard sleek right sidebar) */}
      {/* ========================================================================= */}
      <aside 
        id="trade-execution-sidebar"
        className="hidden lg:flex w-80 h-full bg-[#0d121b]/90 backdrop-blur-md border-l border-white/10 flex-col justify-between shrink-0 select-none z-20"
      >
        {/* Top Section: Asset Overview & Order Form */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* Active Asset Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{asset.flag}</span>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-white tracking-wide">{asset.symbol}</span>
                  {asset.isOtc && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      OTC
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono-nums text-slate-400 font-medium">
                  {currentPrice.toFixed(asset.decimals)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-emerald-400 font-mono-nums">
                {asset.payout}%
              </span>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Payout</div>
            </div>
          </div>

          {/* Pending Trade Toggle */}
          <div className="flex items-center justify-between px-1">
            <label htmlFor="pending-trade-toggle" className="text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer">
              PENDING TRADE
            </label>
            <button
              id="pending-trade-toggle"
              onClick={() => setIsPendingTrade(!isPendingTrade)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                isPendingTrade ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                  isPendingTrade ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 1. Time Selector Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
              <span className="text-slate-300 font-semibold">Time</span>
            </div>

            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1.5 shadow-sm">
              <button
                id="btn-time-minus"
                onClick={() => handleTimeAdjust(-15)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="flex-1 text-center font-mono-nums font-bold text-lg text-white">
                {formatTimeDuration(tradeDuration)}
              </div>

              <button
                id="btn-time-plus"
                onClick={() => handleTimeAdjust(15)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* 2. Investment Amount Selector Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
              <span className="text-slate-300 font-semibold">Investment</span>
            </div>

            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1.5 shadow-sm">
              <button
                id="btn-investment-minus"
                onClick={() => handleInvestmentAdjust(-1)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="flex-1 text-center font-mono-nums font-bold text-xl text-white">
                {investment} $
              </div>

              <button
                id="btn-investment-plus"
                onClick={() => handleInvestmentAdjust(1)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* 3. Expected Payout Display */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Payout Return</div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold font-mono-nums text-white">
                {expectedReturn.toFixed(2)} $
              </span>
              <span className="text-xs text-emerald-400 font-mono-nums font-bold">
                (+{netProfit.toFixed(2)}$)
              </span>
            </div>
          </div>

          {/* 4. Action Buttons: Up (Green) & Down (Red) matching Quotex exact styling */}
          <div className="space-y-2 pt-1">
            {/* UP Button */}
            <button
              id="btn-trade-up"
              onClick={() => handleExecute('CALL')}
              className="w-full py-3 px-4 bg-[#00c076] hover:bg-[#00d684] active:scale-[0.98] transition-all duration-150 rounded-xl shadow-md flex items-center justify-between text-white font-extrabold group cursor-pointer"
            >
              <div className="text-left">
                <div className="text-base leading-tight font-black uppercase tracking-wider">
                  Up
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-4 h-4 text-white stroke-[3]" />
              </div>
            </button>

            {/* DOWN Button */}
            <button
              id="btn-trade-down"
              onClick={() => handleExecute('PUT')}
              className="w-full py-3 px-4 bg-[#ff4d4d] hover:bg-[#ff6666] active:scale-[0.98] transition-all duration-150 rounded-xl shadow-md flex items-center justify-between text-white font-extrabold group cursor-pointer"
            >
              <div className="text-left">
                <div className="text-base leading-tight font-black uppercase tracking-wider">
                  Down
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownRight className="w-4 h-4 text-white stroke-[3]" />
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Section: Active Trades / Trade History Panel */}
        <div className="border-t border-white/10 flex flex-col flex-1 max-h-64 bg-[#0b0e14]/60 backdrop-blur-md">
          {/* Tab Headers */}
          <div className="flex border-b border-white/10">
            <button
              id="tab-active-trades"
              onClick={() => setActiveTab('trades')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-1 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'trades'
                  ? 'text-white border-emerald-400 bg-white/5'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <span>Trades</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono-nums text-white">
                {activeTrades.length}
              </span>
            </button>

            <button
              id="tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-1 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'text-white border-emerald-400 bg-white/5'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <span>Orders</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono-nums text-white">
                0
              </span>
            </button>

            <button
              id="tab-leaderboard"
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-1 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'text-white border-emerald-400 bg-white/5'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>TOP</span>
            </button>
          </div>

          {/* Tab Content List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {activeTab === 'trades' ? (
              activeTrades.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">You don't have a trade history yet.</div>
                  <div className="text-[11px] text-slate-500">
                    You can open a trade using the form above.
                  </div>
                </div>
              ) : (
                activeTrades.map((trade) => {
                  const now = Date.now();
                  const timeLeftSec = Math.max(0, Math.ceil((trade.expiryTime - now) / 1000));
                  const progressPct = Math.min(
                    100,
                    Math.max(0, ((now - trade.openTime) / (trade.durationSeconds * 1000)) * 100)
                  );

                  const isProfitable =
                    (trade.type === 'CALL' && currentPrice > trade.openPrice) ||
                    (trade.type === 'PUT' && currentPrice < trade.openPrice);

                  return (
                    <div
                      key={trade.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                              trade.type === 'CALL' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {trade.type === 'CALL' ? '▲ UP' : '▼ DOWN'}
                          </span>
                          <span className="text-xs font-bold text-white">{trade.assetSymbol}</span>
                        </div>
                        <span className="text-xs font-mono-nums font-bold text-white">
                          ${trade.amount}
                        </span>
                      </div>

                      {/* Price Comparison */}
                      <div className="flex items-center justify-between text-[11px] font-mono-nums text-slate-400">
                        <div>
                          Entry: <span className="text-slate-200 font-semibold">{trade.openPrice.toFixed(asset.decimals)}</span>
                        </div>
                        <div>
                          Current:{' '}
                          <span className={isProfitable ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {currentPrice.toFixed(asset.decimals)}
                          </span>
                        </div>
                      </div>

                      {/* Progress & Countdown */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono-nums text-slate-400">
                          <span>Time Remaining</span>
                          <span className="text-emerald-400 font-bold">00:{String(timeLeftSec).padStart(2, '0')}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Early Sell button */}
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => onSellEarly(trade.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          Sell early ($
                          {isProfitable
                            ? (trade.amount * 0.9).toFixed(2)
                            : (trade.amount * 0.25).toFixed(2)}
                          )
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            ) : activeTab === 'orders' ? (
              pendingOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">Order list is empty</div>
                  <div className="text-[11px] text-slate-500">
                    Toggle "Pending Trade" ON and click UP/DOWN to create a pending order.
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-1 max-h-52 overflow-y-auto">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-1">
                    Pending Limit Orders ({pendingOrders.length})
                  </div>
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-white">{order.asset}</span>
                        <span className={order.type === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}>
                          {order.type} (${order.investment})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono-nums text-slate-400">
                        <span>Trigger: {order.targetPrice}</span>
                        <span className="text-amber-400 font-bold">{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Leaderboard / TOP Traders (Infinite scrollable real-time update) */
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-1 flex items-center justify-between">
                  <span>Top Global Traders</span>
                  <span className="text-emerald-400 animate-pulse text-[9px]">● Live Updating</span>
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs">
                  {topTraders.map((trader) => (
                    <div
                      key={`${trader.rank}-${trader.name}`}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between font-mono-nums transition-colors"
                    >
                      <div className="flex items-center space-x-2 font-sans">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          trader.rank === 1 ? 'bg-amber-400 text-black shadow-md' : trader.rank === 2 ? 'bg-slate-300 text-black' : trader.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-400'
                        }`}>
                          {trader.rank}
                        </span>
                        <span className="text-base">{trader.country}</span>
                        <span className="font-bold text-white text-[11px] truncate max-w-[85px]">{trader.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">+${trader.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[9px] text-slate-500 font-sans">{trader.winRate}% win rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW (Visible on <lg screens: modern ultra-sleek bottom dock) */}
      {/* ========================================================================= */}
      <div 
        id="trade-execution-mobile-dock"
        className="flex lg:hidden flex-col w-full max-w-full overflow-hidden bg-[#0a0d14]/95 backdrop-blur-2xl border-t border-white/10 p-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] select-none shrink-0 z-20 shadow-2xl"
      >
        {/* Active Trades Mini Alert Pill (if any active trades exist) */}
        {activeTrades.length > 0 && (
          <div 
            onClick={() => setIsMobileSheetOpen(true)}
            className="mb-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs cursor-pointer active:scale-98 transition-all shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-extrabold text-emerald-400 font-mono-nums">{activeTrades.length} Active Trade{activeTrades.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-300 text-[11px] font-semibold">
              <span>View details</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Row 1: Time Selector & Investment Stake Selector (Side-by-side) */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Time Selector */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-1.5 flex items-center justify-between shadow-inner">
            <button
              onClick={() => handleTimeAdjust(-15)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center text-xs font-bold active:scale-90 transition-all cursor-pointer"
              title="Decrease Time"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Time</span>
              <span className="text-xs sm:text-sm font-black font-mono-nums text-white">{formatTimeDuration(tradeDuration)}</span>
            </div>
            <button
              onClick={() => handleTimeAdjust(15)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center text-xs font-bold active:scale-90 transition-all cursor-pointer"
              title="Increase Time"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Investment Amount Selector */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-1.5 flex items-center justify-between shadow-inner">
            <button
              onClick={() => handleInvestmentAdjust(-1)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center text-xs font-bold active:scale-90 transition-all cursor-pointer"
              title="Decrease Investment"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Investment</span>
              <span className="text-xs sm:text-sm font-black font-mono-nums text-emerald-400">${investment}</span>
            </div>
            <button
              onClick={() => handleInvestmentAdjust(1)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center text-xs font-bold active:scale-90 transition-all cursor-pointer"
              title="Increase Investment"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Large Tactile UP and DOWN Execution Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* UP Button */}
          <button
            id="btn-mobile-trade-up"
            onClick={() => handleExecute('CALL')}
            className="py-3 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:from-emerald-300 active:to-teal-200 active:scale-95 text-black font-black rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-between cursor-pointer transition-all border border-emerald-300/30"
          >
            <div className="text-left">
              <div className="text-base sm:text-lg leading-none font-black uppercase tracking-wider flex items-center space-x-1">
                <span>UP</span>
              </div>
              <div className="text-[10px] font-black text-emerald-950 font-mono-nums mt-0.5">
                +${netProfit.toFixed(2)} ({asset.payout}%)
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center shadow-sm">
              <ArrowUpRight className="w-4 h-4 text-black stroke-[3]" />
            </div>
          </button>

          {/* DOWN Button */}
          <button
            id="btn-mobile-trade-down"
            onClick={() => handleExecute('PUT')}
            className="py-3 px-3.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 active:from-rose-300 active:to-red-400 active:scale-95 text-white font-black rounded-xl shadow-lg shadow-rose-500/25 flex items-center justify-between cursor-pointer transition-all border border-rose-300/30"
          >
            <div className="text-left">
              <div className="text-base sm:text-lg leading-none font-black uppercase tracking-wider flex items-center space-x-1">
                <span>DOWN</span>
              </div>
              <div className="text-[10px] font-black text-rose-100 font-mono-nums mt-0.5">
                +${netProfit.toFixed(2)} ({asset.payout}%)
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center shadow-sm">
              <ArrowDownRight className="w-4 h-4 text-white stroke-[3]" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Active Trades Bottom Sheet */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md lg:hidden">
          <div className="bg-[#12161f] border-t border-white/10 rounded-t-3xl max-h-[80vh] flex flex-col overflow-hidden animate-slide-up shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">Active Trades & Orders</span>
              </div>
              <button
                onClick={() => setIsMobileSheetOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {activeTrades.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                  <div className="text-xs font-semibold text-slate-400">No active trades running</div>
                  <div className="text-[11px] text-slate-500">Tap UP or DOWN to place a trade</div>
                </div>
              ) : (
                activeTrades.map((trade) => {
                  const now = Date.now();
                  const timeLeftSec = Math.max(0, Math.ceil((trade.expiryTime - now) / 1000));
                  const progressPct = Math.min(
                    100,
                    Math.max(0, ((now - trade.openTime) / (trade.durationSeconds * 1000)) * 100)
                  );

                  const isProfitable =
                    (trade.type === 'CALL' && currentPrice > trade.openPrice) ||
                    (trade.type === 'PUT' && currentPrice < trade.openPrice);

                  return (
                    <div
                      key={trade.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              trade.type === 'CALL' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {trade.type === 'CALL' ? '▲ UP' : '▼ DOWN'}
                          </span>
                          <span className="text-xs font-bold text-white">{trade.assetSymbol}</span>
                        </div>
                        <span className="text-xs font-mono-nums font-bold text-white">
                          ${trade.amount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono-nums text-slate-400">
                        <div>Entry: <span className="text-white">{trade.openPrice.toFixed(asset.decimals)}</span></div>
                        <div>Current: <span className={isProfitable ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{currentPrice.toFixed(asset.decimals)}</span></div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono-nums text-slate-400">
                          <span>Time Left</span>
                          <span className="text-emerald-400 font-bold">00:{String(timeLeftSec).padStart(2, '0')}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            onSellEarly(trade.id);
                            if (activeTrades.length <= 1) setIsMobileSheetOpen(false);
                          }}
                          className="px-3 py-1.5 bg-white/10 text-xs font-bold text-white rounded-xl active:bg-white/20"
                        >
                          Sell early (${isProfitable ? (trade.amount * 0.9).toFixed(2) : (trade.amount * 0.25).toFixed(2)})
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
