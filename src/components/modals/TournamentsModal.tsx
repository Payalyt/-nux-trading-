import React, { useState } from 'react';
import { Tournament } from '../../types/trading';
import { X, Trophy, Users, Clock, Award, Sparkles, Check } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface TournamentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentsModal: React.FC<TournamentsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: 'tourn-1',
      title: 'Grand Binary Championship $50,000',
      prizePool: 50000,
      participants: 1420,
      entryFee: 0,
      timeLeft: '04d 12h 45m',
      status: 'ACTIVE',
      userRank: 42,
      isRegistered: true,
    },
    {
      id: 'tourn-2',
      title: 'Weekend OTC Sprint $15,000',
      prizePool: 15000,
      participants: 890,
      entryFee: 10,
      timeLeft: '01d 08h 12m',
      status: 'ACTIVE',
      isRegistered: false,
    },
    {
      id: 'tourn-3',
      title: 'Crypto Turbo Blitz $25,000',
      prizePool: 25000,
      participants: 2150,
      entryFee: 25,
      timeLeft: 'Starts in 2 days',
      status: 'UPCOMING',
      isRegistered: false,
    },
  ]);

  if (!isOpen) return null;

  const handleRegister = (id: string) => {
    soundManager.playWin();
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRegistered: true, userRank: t.participants + 1 } : t))
    );
  };

  return (
    <div 
      id="tournaments-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="tournaments-modal-dialog"
        className="bg-[#0d121b]/95 backdrop-blur-2xl border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Live Trading Tournaments</h2>
              <p className="text-[11px] text-slate-400">Compete with global traders for prize pools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tournaments List */}
        <div className="p-5 overflow-y-auto space-y-4">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{t.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                    <div className="flex items-center space-x-1 font-mono-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.timeLeft}</span>
                    </div>
                    <div className="flex items-center space-x-1 font-mono-nums">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.participants} traders</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Prize Pool</div>
                  <div className="text-lg font-black font-mono-nums text-amber-400">
                    ${t.prizePool.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action / Rank */}
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                <div>
                  {t.isRegistered ? (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
                      <Check className="w-4 h-4" />
                      <span>Registered • Current Rank #{t.userRank}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      Entry Fee:{' '}
                      <strong className="text-white">
                        {t.entryFee === 0 ? 'FREE' : `$${t.entryFee}`}
                      </strong>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRegister(t.id)}
                  disabled={t.isRegistered}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    t.isRegistered
                      ? 'bg-white/10 text-slate-400 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-black font-black shadow-md shadow-amber-500/20'
                  }`}
                >
                  {t.isRegistered ? 'In Tournament' : 'Register Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
