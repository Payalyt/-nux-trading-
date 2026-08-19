import React, { useState } from 'react';
import { Asset, Trade, AccountType } from '../types/trading';
import { soundManager } from '../utils/audio';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Clock, 
  DollarSign, 
  History, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown as LossIcon,
  Zap
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
  accountType,
  tradeDuration,
  setTradeDuration,
  investment,
  setInvestment,
  onPlaceTrade,
  activeTrades,
  completedTrades,
  onSellEarly,
}) => {
  const [isPendingTrade, setIsPendingTrade] = useState(false);
  const [timeMode, setTimeMode] = useState<'duration' | 'clock'>('duration');
  const [activeTab, setActiveTab] = useState<'trades' | 'orders' | 'leaderboard'>('trades');
  const [isPercentMode, setIsPercentMode] = useState(false);

  const leaderboardTraders = [
    { rank: 1, name: 'Shahadat_FX', country: '🇧🇩', profit: 14820.50, winRate: 92 },
    { rank: 2, name: 'Gabriel_Trader', country: '🇧🇷', profit: 11450.00, winRate: 88 },
    { rank: 3, name: 'Rahul_Quant', country: '🇮🇳', profit: 9840.20, winRate: 86 },
    { rank: 4, name: 'Tanvir_Pro', country: '🇧🇩', profit: 8210.00, winRate: 85 },
    { rank: 5, name: 'Bagus_Invest', country: '🇮🇩', profit: 6940.00, winRate: 81 },
  ];

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

  const handleSetQuickInvestment = (amount: number) => {
    soundManager.playClick();
    setInvestment(Math.min(balance > 0 ? balance : 10000, amount));
  };

  const handleExecute = (type: 'CALL' | 'PUT') => {
    onPlaceTrade(type);
  };

  // Expected payout calculation
  const payoutMultiplier = 1 + asset.payout / 100;
  const expectedReturn = investment * payoutMultiplier;
  const netProfit = investment * (asset.payout / 100);

  return (
    <aside 
      id="trade-execution-sidebar"
      className="w-80 h-full bg-[#0d121b]/80 backdrop-blur-md border-l border-white/10 flex flex-col justify-between shrink-0 select-none z-20"
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
            <button
              onClick={() => setTimeMode(timeMode === 'duration' ? 'clock' : 'duration')}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors cursor-pointer font-bold"
            >
              SWITCH TIME
            </button>
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

          {/* Quick Time Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[
              { label: '5s', sec: 5 },
              { label: '15s', sec: 15 },
              { label: '1m', sec: 60 },
              { label: '5m', sec: 300 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  soundManager.playClick();
                  setTradeDuration(p.sec);
                }}
                className={`py-1 rounded-lg text-[11px] font-mono-nums transition-all cursor-pointer ${
                  tradeDuration === p.sec
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Investment Amount Selector Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span className="text-slate-300 font-semibold">Investment</span>
            <button
              onClick={() => setIsPercentMode(!isPercentMode)}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors cursor-pointer font-bold"
            >
              SWITCH
            </button>
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

          {/* Quick Amounts */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[1, 5, 10, 50].map((amt) => (
              <button
                key={amt}
                onClick={() => handleSetQuickInvestment(amt)}
                className={`py-1 rounded-lg text-[11px] font-mono-nums transition-all cursor-pointer ${
                  investment === amt
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                }`}
              >
                ${amt}
              </button>
            ))}
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

        {/* 4. Action Buttons: Up (Green) & Down (Red) */}
        <div className="space-y-2 pt-1">
          {/* UP Button */}
          <button
            id="btn-trade-up"
            onClick={() => handleExecute('CALL')}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all duration-150 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-between text-black font-extrabold group cursor-pointer"
          >
            <div className="text-left">
              <div className="text-lg leading-tight font-black flex items-center space-x-1 uppercase tracking-wider">
                <span>Up</span>
              </div>
              <div className="text-xs font-bold text-emerald-950 font-mono-nums">
                +{netProfit.toFixed(2)} $
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-y-[-2px] transition-transform">
              <ArrowUpRight className="w-5 h-5 text-black stroke-[3]" />
            </div>
          </button>

          {/* DOWN Button */}
          <button
            id="btn-trade-down"
            onClick={() => handleExecute('PUT')}
            className="w-full py-3.5 px-4 bg-red-500 hover:bg-red-400 active:scale-[0.98] transition-all duration-150 rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-between text-white font-extrabold group cursor-pointer"
          >
            <div className="text-left">
              <div className="text-lg leading-tight font-black flex items-center space-x-1 uppercase tracking-wider">
                <span>Down</span>
              </div>
              <div className="text-xs font-semibold text-red-100 font-mono-nums">
                +{netProfit.toFixed(2)} $
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-y-[2px] transition-transform">
              <ArrowDownRight className="w-5 h-5 text-white stroke-[3]" />
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
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-slate-400">Order list is empty</div>
              <div className="text-[11px] text-slate-500">
                Create a pending trade using the form above.
              </div>
            </div>
          ) : (
            /* Leaderboard / TOP Traders */
            <div className="space-y-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-1">
                Today's Top Traders
              </div>
              {leaderboardTraders.map((trader) => (
                <div
                  key={trader.rank}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono-nums"
                >
                  <div className="flex items-center space-x-2 font-sans">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      trader.rank === 1 ? 'bg-amber-400 text-black' : trader.rank === 2 ? 'bg-slate-300 text-black' : trader.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-400'
                    }`}>
                      {trader.rank}
                    </span>
                    <span className="text-base">{trader.country}</span>
                    <span className="font-bold text-white text-[11px] truncate max-w-[90px]">{trader.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">+${trader.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="text-[9px] text-slate-500 font-sans">{trader.winRate}% win rate</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
