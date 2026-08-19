import React from 'react';
import { Users, UserSquare2, Briefcase, Store, ArrowDownToLine, ArrowUpFromLine, Wallet, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const stats = [
    { title: 'Total Users', value: '12,450', change: '+12%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Active Users', value: '3,210', change: '+5%', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Deposits', value: '$452,100', change: '+24%', icon: ArrowDownToLine, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Withdrawals', value: '$124,500', change: '+8%', icon: ArrowUpFromLine, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { title: 'Total Agents', value: '45', change: '0%', icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Total Merchants', value: '18', change: '+2', icon: Store, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Total Customers', value: '8,900', change: '+15%', icon: UserSquare2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Platform Balance', value: '$2,450,000', change: '+2.4%', icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Platform performance and statistics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className={`${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'}`}>
                {stat.change}
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Pending Approvals</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending Deposits', count: 12, color: 'bg-amber-500/20 text-amber-400' },
              { label: 'Pending Withdrawals', count: 8, color: 'bg-blue-500/20 text-blue-400' },
              { label: 'Pending KYC Verifications', count: 45, color: 'bg-purple-500/20 text-purple-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                <span className="text-sm font-medium text-slate-300">{item.label}</span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.color}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                <div>
                  <p className="text-sm text-slate-200">
                    <span className="font-bold text-white">User #492{i}</span> requested a withdrawal of <span className="text-emerald-400 font-mono-nums">$500.00</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{i * 15} minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
