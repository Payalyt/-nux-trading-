import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'deposits' | 'withdrawals'>('all');

  const transactions = [
    {
      id: 'tx-948192',
      type: 'DEPOSIT',
      method: 'bKash (BD)',
      amount: 100.0,
      bonus: 50.0,
      status: 'SUCCESSFUL',
      date: '18.08.2026, 12:45',
    },
    {
      id: 'tx-942110',
      type: 'DEPOSIT',
      method: 'Binance Pay',
      amount: 250.0,
      bonus: 125.0,
      status: 'SUCCESSFUL',
      date: '14.08.2026, 19:20',
    },
    {
      id: 'tx-931002',
      type: 'WITHDRAWAL',
      method: 'Nagad (BD)',
      amount: 75.0,
      bonus: 0,
      status: 'COMPLETED',
      date: '09.08.2026, 10:15',
    },
  ];

  const filtered = transactions.filter((t) => {
    if (filterType === 'deposits') return t.type === 'DEPOSIT';
    if (filterType === 'withdrawals') return t.type === 'WITHDRAWAL';
    return true;
  });

  return (
    <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-6 md:p-8 space-y-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Payment History</h2>
            <p className="text-xs text-slate-400">Statement of all balance deposits and withdrawal requests</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-[#121722] border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setFilterType('deposits')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'deposits'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-[#121722] border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setFilterType('withdrawals')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'withdrawals'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-[#121722] border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Withdrawals
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#121722] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Payment System</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Bonus</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono-nums">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{tx.id}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 font-sans font-semibold text-slate-200">{tx.method}</td>
                    <td className="p-4 font-bold text-white">${tx.amount.toFixed(2)}</td>
                    <td className="p-4 text-emerald-400">{tx.bonus > 0 ? `+$${tx.bonus.toFixed(2)}` : '—'}</td>
                    <td className="p-4 text-slate-400 font-sans text-[11px]">{tx.date}</td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{tx.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
