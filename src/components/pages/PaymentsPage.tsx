import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

export const PaymentsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/user/transactions');
      if (res.ok && res.data?.transactions) {
        setTransactions(res.data.transactions);
      }
    } catch (e) {
      console.error('Error fetching transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    if (filterType === 'deposits') return t.type === 'deposit';
    if (filterType === 'withdrawals') return t.type === 'withdrawal';
    return true;
  });

  return (
    <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-6 md:p-8 space-y-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Payment & Transaction History</h2>
            <p className="text-xs text-slate-400">Complete statement of all balance deposits and withdrawal requests</p>
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
            <button
              onClick={fetchTransactions}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#121722] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Amount ($)</th>
                  <th className="py-3 px-4">Bonus ($)</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sender/Recipient Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 text-xs font-sans">
                      {loading ? 'Loading transaction history...' : 'No transaction records found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const isDeposit = t.type === 'deposit';
                    return (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white uppercase">{t.id}</td>
                        <td className="py-3.5 px-4 font-sans font-bold">
                          <div className="flex items-center space-x-1.5">
                            {isDeposit ? (
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span className={isDeposit ? 'text-emerald-400' : 'text-amber-400'}>
                              {isDeposit ? 'DEPOSIT' : 'WITHDRAWAL'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-white">{t.gateway}</td>
                        <td className="py-3.5 px-4 font-bold text-white">${Number(t.amount || 0).toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-emerald-400">
                          {t.bonusAmount ? `+$${Number(t.bonusAmount).toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 font-sans text-slate-400 text-[11px]">
                          {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center space-x-1 ${
                              t.status === 'completed' || t.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : t.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            <span>{t.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] truncate max-w-xs">
                          {t.trxId || t.senderNumber || t.accountNumber || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
