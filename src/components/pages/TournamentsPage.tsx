import React, { useState } from 'react';
import { 
  Trophy, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const TournamentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const activeTournaments = [
    {
      id: 'tour-1',
      title: 'Crazy Wednesday',
      startsIn: '16:04:30',
      entryFee: 10,
      duration: '1 day',
      prizePool: 7500,
      participants: 412,
    },
    {
      id: 'tour-2',
      title: 'Free Friday',
      startsIn: '2 DAYS',
      entryFee: 0,
      duration: '1 day',
      prizePool: 1000,
      participants: 1289,
    },
    {
      id: 'tour-3',
      title: 'Weekend Battle',
      startsIn: '3 DAYS',
      entryFee: 1,
      duration: '2 days',
      prizePool: 5000,
      participants: 840,
    },
  ];

  const completedTournaments = [
    {
      id: 'comp-1',
      title: 'Weekend Battle',
      entryFee: 1,
      duration: '2 days',
      prizePool: 5000,
      winner: 'AlexTrader_BD ($1,850)',
    },
    {
      id: 'comp-2',
      title: 'Free Friday',
      entryFee: 0,
      duration: '1 day',
      prizePool: 1000,
      winner: 'CryptoKing_99 ($400)',
    },
    {
      id: 'comp-3',
      title: 'Crazy Wednesday',
      entryFee: 10,
      duration: '1 day',
      prizePool: 7500,
      winner: 'EaglePro ($2,750)',
    },
  ];

  const handleRegister = (id: string) => {
    soundManager.playWin();
    setRegisteredIds((prev) => [...prev, id]);
  };

  return (
    <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-6 md:p-8 space-y-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Featured High-Impact Tournament Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Background Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Monthly Major Tournament</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              🏆 GLOBAL TRADING CHAMPIONSHIP 2026
            </h1>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Trade active OTC forex pairs, accumulate highest profit percentage points, and rank in the top 50 global leaderboard to win direct cash prizes sent to your account!
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Prize Pool</div>
                <div className="text-xl font-black font-mono-nums text-emerald-400">$50,000.00 USD</div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Registration Starts In</div>
                <div className="text-xl font-black font-mono-nums text-amber-300 flex items-center space-x-1">
                  <Clock className="w-4 h-4 mr-1 text-amber-400" />
                  <span>04h : 18m : 32s</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center md:items-end space-y-4 shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/30 to-emerald-500/30 border border-amber-400/50 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/20">
              🏆
            </div>
            <button
              onClick={() => {
                soundManager.playWin();
                alert('Congratulations! You are pre-registered for the $50,000 World Trading Championship!');
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Enter $50,000 Championship Free
            </button>
          </div>
        </div>

        {/* Header & Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Trading Tournaments</h2>
            <p className="text-xs text-slate-400">Compete with global traders and win real cash prize pools</p>
          </div>

          <div className="flex items-center space-x-1 bg-[#121722] border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ACTIVE (3)
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              COMPLETED
            </button>
          </div>
        </div>

        {/* Section Title */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {activeTab === 'active' ? 'Available for participation (3)' : 'Archive of finished tournaments'}
        </h3>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'active' ? (
            activeTournaments.map((t) => {
              const isJoined = registeredIds.includes(t.id);
              return (
                <div
                  key={t.id}
                  className="bg-[#121722] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl hover:border-emerald-500/30 transition-all relative overflow-hidden"
                >
                  {/* Countdown Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono-nums font-bold flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>UNTIL START: {t.startsIn}</span>
                    </span>
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>

                  {/* Title & Prize */}
                  <div className="space-y-4">
                    <h4 className="text-base font-extrabold text-white">{t.title}</h4>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                        <div className="text-[11px] text-slate-400">Entry fee</div>
                        <div className="text-sm font-bold font-mono-nums text-white mt-0.5">
                          {t.entryFee === 0 ? 'FREE' : `${t.entryFee} $`}
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                        <div className="text-[11px] text-slate-400">Duration</div>
                        <div className="text-sm font-bold text-white mt-0.5">{t.duration}</div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        Prize Pool
                      </div>
                      <div className="text-2xl font-black font-mono-nums text-emerald-400">
                        {t.prizePool.toLocaleString()} $
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => alert(`Details for ${t.title}: Top 20 traders share the $${t.prizePool} pool.`)}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Details ℹ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegister(t.id)}
                      disabled={isJoined}
                      className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isJoined
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                      }`}
                    >
                      {isJoined ? 'Registered ✓' : 'Register Now'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            completedTournaments.map((t) => (
              <div
                key={t.id}
                className="bg-[#121722] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl opacity-90"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-slate-400 text-[10px] font-bold uppercase">
                    FINISHED
                  </span>
                  <Trophy className="w-4 h-4 text-slate-500" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">{t.title}</h4>
                  <div className="text-xs text-slate-400">
                    Prize Pool: <strong className="text-emerald-400 font-mono-nums">{t.prizePool} $</strong>
                  </div>
                  <div className="text-xs text-slate-400">
                    Winner: <strong className="text-amber-300">{t.winner}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Leaderboard results for ${t.title} archive.`)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl"
                >
                  View Final Standings
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
