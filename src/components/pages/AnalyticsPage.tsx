import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronDown, 
  DollarSign, 
  Activity, 
  Award, 
  CheckCircle2, 
  Clock, 
  Filter 
} from 'lucide-react';
import { Trade } from '../../types/trading';

interface AnalyticsPageProps {
  completedTrades: Trade[];
  liveBalance: number;
  demoBalance: number;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  completedTrades,
  liveBalance,
  demoBalance,
}) => {
  const [timeframeFilter, setTimeframeFilter] = useState<'Day' | 'Week' | 'Month' | 'All'>('Month');

  // Trade metrics
  const totalTrades = completedTrades.length;
  const wonTrades = completedTrades.filter((t) => t.status === 'WON').length;
  const lostTrades = completedTrades.filter((t) => t.status === 'LOST').length;
  const winRate = totalTrades > 0 ? Math.round((wonTrades / totalTrades) * 100) : 0;

  const totalProfit = completedTrades.reduce((acc, t) => {
    if (t.status === 'WON') {
      return acc + (t.returnAmount ? t.returnAmount - t.amount : 0);
    }
    return acc - t.amount;
  }, 0);

  const totalTurnover = completedTrades.reduce((acc, t) => acc + t.amount, 0);
  const avgProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;

  const topInstruments = [
    { symbol: 'USD/JPY (OTC)', payout: 87, trades: 14, profit: '+$142.50' },
    { symbol: 'EUR/USD (OTC)', payout: 87, trades: 9, profit: '+$84.20' },
    { symbol: 'BTC/USD (OTC)', payout: 85, trades: 6, profit: '+$52.00' },
    { symbol: 'GBP/USD (OTC)', payout: 86, trades: 4, profit: '+$31.80' },
    { symbol: 'GOLD (OTC)', payout: 89, trades: 2, profit: '+$18.90' },
  ];

  // Timeline dates for the analytics chart
  const dateLabels = [
    '20. Jul', '22. Jul', '24. Jul', '26. Jul', '28. Jul', '30. Jul', 
    '1. Aug', '3. Aug', '5. Aug', '7. Aug', '9. Aug', '11. Aug', '13. Aug', '15. Aug', '17. Aug'
  ];

  return (
    <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-6 md:p-8 space-y-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Profile Summary Bar */}
        <div className="bg-[#121722] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center border border-emerald-500/30">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">parvezhasanonline@gmail.com</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  VERIFIED
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono-nums">
                ID: #92316380
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs">
            <div>
              <div className="text-slate-400">Location</div>
              <div className="font-bold text-white flex items-center space-x-1">
                <span>🇧🇩</span>
                <span>Bangladesh</span>
              </div>
            </div>

            <div className="border-l border-white/10 pl-6">
              <div className="text-slate-400">In the account</div>
              <div className="font-black font-mono-nums text-white text-base">
                ${liveBalance.toFixed(2)}
              </div>
            </div>

            <div className="border-l border-white/10 pl-6">
              <div className="text-slate-400">In the demo</div>
              <div className="font-black font-mono-nums text-amber-400 text-base">
                ${demoBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left General Data (4 cols) | Right Charts (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: General Data */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#121722] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                General data
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-xs text-slate-400">Trades count</div>
                  <div className="text-lg font-black font-mono-nums text-white mt-1">
                    {totalTrades}
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-xs text-slate-400">Trades profit</div>
                  <div className={`text-lg font-black font-mono-nums mt-1 ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {totalProfit >= 0 ? `+${totalProfit.toFixed(2)} $` : `${totalProfit.toFixed(2)} $`}
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-xs text-slate-400">Profitable trades</div>
                  <div className="text-lg font-black font-mono-nums text-emerald-400 mt-1">
                    {wonTrades}
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-xs text-slate-400">Average profit</div>
                  <div className="text-lg font-black font-mono-nums text-white mt-1">
                    {avgProfit.toFixed(2)} $
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-xs text-slate-400">Net turnover</div>
                  <div className="text-lg font-black font-mono-nums text-white mt-1">
                    {totalTurnover.toFixed(2)} $
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-xs text-slate-400">Hedged trades</div>
                  <div className="text-lg font-black font-mono-nums text-white mt-1">
                    0
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-xs text-slate-400">Min trade</div>
                  <div className="text-lg font-black font-mono-nums text-white mt-1">
                    {totalTrades > 0 ? '$1.00' : '0 $'}
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-xs text-slate-400">Max trade</div>
                  <div className="text-lg font-black font-mono-nums text-white mt-1">
                    {totalTrades > 0 ? `$${Math.max(...completedTrades.map(t => t.amount), 1)}` : '0 $'}
                  </div>
                </div>
              </div>
            </div>

            {/* Top 5 Most Profitable Instruments */}
            <div className="bg-[#121722] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Top 5 most profitable instruments among traders
              </h3>
              <div className="space-y-2">
                {topInstruments.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white">{item.symbol}</span>
                    </div>
                    <div className="flex items-center space-x-3 font-mono-nums">
                      <span className="text-slate-400">{item.payout}% payout</span>
                      <span className="font-bold text-emerald-400">{item.profit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Statistics Charts */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Chart 1: Statistics of Profitable Trades */}
            <div className="bg-[#121722] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Statistics of profitable trades
                </h3>
                
                {/* Timeframe selector */}
                <div className="flex items-center space-x-1 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
                  {(['Day', 'Week', 'Month', 'All'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframeFilter(tf)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        timeframeFilter === tf
                          ? 'bg-emerald-500 text-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Visual Canvas / SVG */}
              <div className="h-64 relative flex flex-col justify-end pt-6">
                {/* Grid horizontal lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-white/20 w-full"></div>
                  <div className="border-b border-white/20 w-full"></div>
                  <div className="border-b border-white/20 w-full"></div>
                  <div className="border-b border-white/20 w-full"></div>
                </div>

                {/* SVG Curve Line */}
                <svg className="w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 120">
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d="M 0 100 Q 80 90, 150 70 T 300 45 T 450 30 L 500 20 L 500 120 L 0 120 Z"
                    fill="url(#profitGrad)"
                  />
                  <path
                    d="M 0 100 Q 80 90, 150 70 T 300 45 T 450 30 L 500 20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                  {/* Active dot */}
                  <circle cx="300" cy="45" r="5" fill="#10b981" className="animate-ping" />
                  <circle cx="300" cy="45" r="5" fill="#10b981" />
                </svg>

                {/* Tooltip Tag */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#0d121b] border border-emerald-500/50 rounded-xl px-3 py-1.5 shadow-2xl text-center">
                  <div className="text-[10px] text-slate-400 font-mono-nums">Wednesday, Jul 22, 2026</div>
                  <div className="text-xs font-bold font-mono-nums text-emerald-400">Profit: $24.80</div>
                </div>

                {/* Date Axis */}
                <div className="flex justify-between text-[10px] text-slate-500 font-mono-nums pt-3 border-t border-white/10">
                  {dateLabels.map((d, i) => (
                    <span key={i} className="hidden sm:inline">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 2: Percentage of Profitable Trades */}
            <div className="bg-[#121722] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Percentage of profitable trades
                </h3>
                <div className="text-sm font-black font-mono-nums text-emerald-400">
                  {winRate}% Win Rate
                </div>
              </div>

              {/* Progress Bar & Visual Gauge */}
              <div className="space-y-3">
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 flex">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(winRate, 68)}%` }}
                  />
                  <div 
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${100 - Math.max(winRate, 68)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-semibold">
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Profitable Trades ({wonTrades || 18})</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>Loss Trades ({lostTrades || 6})</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
