import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminBalances } from './pages/AdminBalances';
import { AdminDeposits } from './pages/AdminDeposits';
import { AdminWithdrawals } from './pages/AdminWithdrawals';
import { UserAccount } from '../../types/trading';

// Placeholder for unbuilt pages
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400">
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p>This module is currently under development.</p>
  </div>
);

const AdminApp: React.FC = () => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is an admin
    const stored = localStorage.getItem('qx_user_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role === 'admin' || parsed.role === 'superadmin') {
          setUser(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="h-screen w-screen bg-[#0a0d14] flex items-center justify-center text-white">Loading Admin...</div>;
  }

  if (!user) {
    // If not admin, redirect to main app
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout user={user} onLogout={() => localStorage.removeItem('qx_user_session')} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="customers" element={<Placeholder title="Customer Management" />} />
        <Route path="agents" element={<Placeholder title="Local Agents" />} />
        <Route path="merchants" element={<Placeholder title="Merchants" />} />
        <Route path="deposits" element={<AdminDeposits />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="send-money" element={<Placeholder title="Send Money" />} />
        <Route path="transactions" element={<Placeholder title="Transactions Ledger" />} />
        <Route path="balances" element={<AdminBalances />} />
        <Route path="currency-rates" element={<Placeholder title="Currency Exchange Rates" />} />
        <Route path="contact-links" element={<Placeholder title="Contact Links Configuration" />} />
        <Route path="reports" element={<Placeholder title="Analytics & Reports" />} />
        <Route path="roles" element={<Placeholder title="Admin Roles" />} />
        <Route path="audit-logs" element={<Placeholder title="System Audit Logs" />} />
        <Route path="settings" element={<Placeholder title="Platform Settings" />} />
      </Route>
    </Routes>
  );
};

export default AdminApp;
