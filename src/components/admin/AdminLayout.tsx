import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserSquare2, Briefcase, Store, 
  ArrowDownToLine, ArrowUpFromLine, Send, Receipt, Wallet, 
  DollarSign, Link2, Bell, FileBarChart, ShieldAlert, 
  ClipboardList, Settings, LogOut, Menu, X, Search
} from 'lucide-react';
import { UserAccount } from '../../types/trading';

interface AdminLayoutProps {
  user: UserAccount | null;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Customers', path: '/admin/customers', icon: UserSquare2 },
    { name: 'Agents', path: '/admin/agents', icon: Briefcase },
    { name: 'Merchants', path: '/admin/merchants', icon: Store },
    { name: 'Deposits', path: '/admin/deposits', icon: ArrowDownToLine },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowUpFromLine },
    { name: 'Send Money', path: '/admin/send-money', icon: Send },
    { name: 'Transactions', path: '/admin/transactions', icon: Receipt },
    { name: 'Balances', path: '/admin/balances', icon: Wallet },
    { name: 'Currency Rates', path: '/admin/currency-rates', icon: DollarSign },
    { name: 'Contact Links', path: '/admin/contact-links', icon: Link2 },
    { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
    { name: 'Admins & Roles', path: '/admin/roles', icon: ShieldAlert },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#0a0d14] text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-0 sm:w-20'} 
        transition-all duration-300 ease-in-out bg-[#0d121b] border-r border-white/10 flex flex-col shrink-0 overflow-hidden z-20`}
      >
        <div className="h-16 flex items-center px-4 border-b border-white/10 shrink-0 whitespace-nowrap">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className={`ml-3 font-bold text-lg text-white transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 sm:hidden'}`}>
            Fontent Admin
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl transition-all group whitespace-nowrap ${
                    isActive 
                      ? 'bg-blue-500/20 text-blue-400 font-semibold' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={`ml-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 sm:hidden'}`}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2.5 w-full rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all whitespace-nowrap group"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`ml-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 sm:hidden'}`}>
              Log Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#0d121b] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="ml-4 hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-blue-500/50 transition-colors">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm text-white ml-2 w-48 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-[#0d121b]"></span>
            </button>
            
            <div className="flex items-center space-x-2 pl-3 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white leading-tight">{user?.name || 'Admin User'}</div>
                <div className="text-[10px] text-blue-400 font-medium">Super Admin</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#0a0d14] p-4 sm:p-6 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
