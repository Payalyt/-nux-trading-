import React, { useState } from 'react';
import { Trade, AccountType } from '../../types/trading';
import { 
  Calendar, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Filter 
} from 'lucide-react';

interface TradesHistoryPageProps {
  completedTrades: Trade[];
  activeTrades: Trade[];
  accountType: AccountType;
}

export const TradesHistoryPage: React.FC<TradesHistoryPageProps> = ({
  completedTrades,
  activeTrades,
  accountType,
}) => {
  const [subTab, setSubTab] = useState<'history' | 'pending'>('history');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [dateRange, setDateRange] = useState('18.08.2026 - 18.08.2026');

  return (
    <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-6 md:p-8 space-y-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Sub-tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSubTab('history')}
              className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                subTab === 'history'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              Trade history
            </button>
            <button
              onClick={() => setSubTab('pending')}
              className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                subTab === 'pending'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              Pending trades
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker */}
            <div className="flex items-center space-x-2 bg-[#121722] border border-white/10 px-3.5 py-1.5 rounded-xl text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-mono-nums">{dateRange}</span>
            </div>

            {/* Account Selector */}
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="bg-[#121722] border border-white/10 px-3.5 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Accounts</option>
              <option value="live">Live Account</option>
              <option value="demo">Demo Account</option>
            </select>
          </div>
        </div>

        {/* Trades Content */}
        {subTab === 'history' ? (
          completedTrades.length === 0 ? (
            <div className="bg-[#121722] border border-white/10 rounded-2xl p-12 text-center text-slate-500 space-y-2 shadow-xl">
              <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <div className="text-sm font-bold text-slate-400">No data to display</div>
              <p className="text-xs text-slate-500">
                You don't have a trade history yet. Place a trade on the trading chart to view records here.
              </p>
            </div>
          ) : (
            <div className="bg-[#121722] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Asset</th>
                      <th className="p-4">Direction</th>
                      <th className="p-4">Opening Price</th>
                      <th className="p-4">Closing Price</th>
                      <th className="p-4">Investment</th>
                      <th className="p-4">Profit / Payout</th>
                      <th className="p-4 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono-nums">
                    {completedTrades.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white font-sans">{t.assetSymbol}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            t.type === 'CALL' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                          }`}>
                            {t.type === 'CALL' ? '▲ UP' : '▼ DOWN'}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-300">{t.openPrice.toFixed(4)}</td>
                        <td className="p-4 font-medium text-slate-300">{(t.closePrice || t.openPrice).toFixed(4)}</td>
                        <td className="p-4 font-bold text-white">${t.amount.toFixed(2)}</td>
                        <td className="p-4 font-bold">
                          {t.status === 'WON' ? (
                            <span className="text-emerald-400">+{((t.returnAmount || 0) - t.amount).toFixed(2)} $</span>
                          ) : (
                            <span className="text-rose-400">-{t.amount.toFixed(2)} $</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            t.status === 'WON' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="bg-[#121722] border border-white/10 rounded-2xl p-12 text-center text-slate-500 space-y-2 shadow-xl">
            <div className="text-sm font-bold text-slate-400">Order list is empty</div>
            <p className="text-xs text-slate-500">
              Create a pending trade on the chart panel to execute automatically at target price.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
