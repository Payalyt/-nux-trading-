import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Info, ExternalLink, Filter } from 'lucide-react';

export const AdminDeposits: React.FC = () => {
  // Mock data for deposits
  const [deposits] = useState([
    { id: 'DEP-781923', user: 'parvezhasan', method: 'bKash', amount: 500, currency: 'USD', converted: 65000, status: 'pending', date: '2026-08-18T10:23:00Z', proofUrl: '#' },
    { id: 'DEP-781924', user: 'johndoe', method: 'Binance Pay', amount: 1000, currency: 'USD', converted: 1000, status: 'approved', date: '2026-08-17T15:45:00Z', proofUrl: '#' },
    { id: 'DEP-781925', user: 'alimuddin', method: 'Nagad', amount: 100, currency: 'USD', converted: 13000, status: 'rejected', date: '2026-08-16T09:12:00Z', proofUrl: '#' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Deposit Management</h1>
          <p className="text-sm text-slate-400 mt-1">Review and approve user deposit requests.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search TXN ID..." 
            className="bg-transparent border-none outline-none text-sm text-white ml-2 w-full placeholder:text-slate-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Status: Pending
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Method & Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {deposits.map((dep) => (
                <tr key={dep.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{dep.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{dep.user}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-emerald-400">${dep.amount.toFixed(2)} {dep.currency}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{dep.method} • ~{dep.converted} BDT</div>
                  </td>
                  <td className="px-4 py-3">
                    {dep.status === 'pending' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">Pending</span>}
                    {dep.status === 'approved' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">Approved</span>}
                    {dep.status === 'rejected' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400">Rejected</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(dep.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-md transition-colors" title="View Proof">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      {dep.status === 'pending' && (
                        <>
                          <button className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-md transition-colors" title="Approve">
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
