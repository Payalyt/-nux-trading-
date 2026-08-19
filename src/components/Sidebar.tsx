import React from 'react';
import { 
  Home,
  BarChart2, 
  HelpCircle, 
  User, 
  Trophy, 
  ShoppingBag, 
  MoreHorizontal, 
  LifeBuoy, 
  Send, 
  Settings, 
  Layers, 
  Flame,
  Award
} from 'lucide-react';

export type SidebarTab = 'trade' | 'support' | 'account' | 'tournaments' | 'market' | 'more' | 'leaderboard';

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  onOpenSupport: () => void;
  onOpenTournaments: () => void;
  onOpenMarket: () => void;
  onOpenProfile: () => void;
  onOpenHelp: () => void;
  onGoToHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSupport,
  onOpenTournaments,
  onOpenMarket,
  onOpenProfile,
  onOpenHelp,
  onGoToHome,
}) => {
  return (
    <aside 
      id="left-sidebar-navigation"
      className="w-16 h-full bg-[#0d121b]/50 backdrop-blur-md border-r border-white/5 flex flex-col justify-between py-6 items-center shrink-0 select-none z-20"
    >
      {/* Top Menu Items */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Home Navigation Icon */}
        {onGoToHome && (
          <button
            id="nav-tab-home"
            onClick={onGoToHome}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-300 opacity-40 hover:opacity-100 hover:text-emerald-400 transition-all cursor-pointer"
            title="Quotex Homepage"
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold tracking-wider uppercase">HOME</span>
          </button>
        )}

        {/* Trade / Dashboard Icon */}
        <button
          id="nav-tab-trade"
          onClick={() => setActiveTab('trade')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'trade'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
              : 'opacity-40 hover:opacity-100 text-slate-300'
          }`}
          title="Trade Dashboard"
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold tracking-wider uppercase">TRADE</span>
        </button>

        {/* Account Management Icon */}
        <button
          id="nav-tab-account"
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-300 opacity-40 hover:opacity-100 transition-all cursor-pointer"
          title="Account Profile"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold tracking-wider uppercase">ACCOUNT</span>
        </button>

        {/* Tournaments Icon with Badge */}
        <button
          id="nav-tab-tournaments"
          onClick={onOpenTournaments}
          className="relative flex flex-col items-center justify-center p-2 rounded-xl text-slate-300 opacity-40 hover:opacity-100 transition-all cursor-pointer"
          title="Tournaments"
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-bold tracking-wider uppercase">CONTESTS</span>
          <span className="absolute top-1 right-1 px-1 py-0.2 rounded-full bg-emerald-500 text-black text-[8px] font-extrabold shadow-sm">
            3
          </span>
        </button>

        {/* Market / Store Icon with Badge */}
        <button
          id="nav-tab-market"
          onClick={onOpenMarket}
          className="relative flex flex-col items-center justify-center p-2 rounded-xl text-slate-300 opacity-40 hover:opacity-100 transition-all cursor-pointer"
          title="Promo Market"
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold tracking-wider uppercase">MARKET</span>
          <span className="absolute top-1 right-1 px-1 py-0.2 rounded-full bg-emerald-500 text-black text-[8px] font-extrabold shadow-sm">
            4
          </span>
        </button>

        {/* Support Icon (moved to last) */}
        <button
          id="nav-tab-support"
          onClick={onOpenSupport}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-300 opacity-40 hover:opacity-100 transition-all cursor-pointer"
          title="Support Help"
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold tracking-wider uppercase">HELP</span>
        </button>
      </div>

      {/* Bottom Action Utilities */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Telegram / Join */}
        <a
          href="https://t.me"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-400 opacity-40 hover:opacity-100 hover:text-sky-400 transition-all cursor-pointer"
          title="Join Us on Telegram"
        >
          <Send className="w-4 h-4 mb-0.5 text-sky-400" />
          <span className="text-[8px] font-bold uppercase">JOIN</span>
        </a>

        {/* Green Help Quick Action Button */}
        <button
          id="btn-sidebar-help"
          onClick={onOpenHelp}
          className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer font-bold"
          title="24/7 Live Support"
        >
          <LifeBuoy className="w-4 h-4" />
          <span className="text-[7px] font-black uppercase mt-0.5">24/7</span>
        </button>
      </div>
    </aside>
  );
};
