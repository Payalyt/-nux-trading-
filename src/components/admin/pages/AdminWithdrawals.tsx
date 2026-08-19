import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Filter, FileText } from 'lucide-react';

export const AdminWithdrawals: React.FC = () => {
  // Mock data for withdrawals
  const [withdrawals] = useState([
    { id: 'WTH-992123', user: 'parvezhasan', method: 'Binance Pay', address: '0x123...456', amount: 350, fee: 5, net: 345, status: 'pending', date: '2026-08-18T11:05:00Z' },
    { id: 'WTH-992124', user: 'janedoe', method: 'Nagad', address: '01711223344', amount: 100, fee: 2, net: 98, status: 'processing', date: '2026-08-18T08:30:00Z' },
    { id: 'WTH-992125', user: 'alimuddin', method: 'bKash', address: '01811223344', amount: 50, fee: 1, net: 49, status: 'completed', date: '2026-08-17T14:20:00Z' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
          <p className="text-sm text-slate-400 mt-1">Process user withdrawal requests.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search TXN ID or User..." 
            className="bg-transparent border-none outline-none text-sm text-white ml-2 w-full placeholder:text-slate-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Status: All
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Method & Details</th>
                <th className="px-4 py-3">Amount & Net</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {withdrawals.map((wth) => (
                <tr key={wth.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{wth.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{wth.user}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{wth.method}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{wth.address}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">${wth.amount.toFixed(2)}</div>
                    <div className="text-[10px] text-emerald-400 uppercase">Net: ${wth.net.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-3">
                    {wth.status === 'pending' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">Pending</span>}
                    {wth.status === 'processing' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400">Processing</span>}
                    {wth.status === 'completed' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">Completed</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="View Details">
                        <FileText className="w-4 h-4" />
                      </button>
                      {(wth.status === 'pending' || wth.status === 'processing') && (
                        <>
                          <button className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-md transition-colors" title="Complete Transfer">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-md transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
