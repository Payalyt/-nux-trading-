import React, { useState } from 'react';
import { Asset, AssetCategory } from '../types/trading';
import { Search, Star, TrendingUp, TrendingDown, X, Zap } from 'lucide-react';

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onToggleFavorite: (assetId: string) => void;
}

export const AssetSelectorModal: React.FC<AssetSelectorModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSelectAsset,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'payout' | 'change' | 'name'>('payout');

  if (!isOpen) return null;

  const categories: { id: AssetCategory | 'all' | 'favorites'; label: string }[] = [
    { id: 'all', label: 'All Assets' },
    { id: 'favorites', label: '★ Favorites' },
    { id: 'currencies', label: 'Currencies' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'otc', label: 'OTC Pairs' },
  ];

  const filteredAssets = assets
    .filter((asset) => {
      // Category filter
      if (activeCategory === 'favorites') {
        if (!asset.isFavorite) return false;
      } else if (activeCategory !== 'all') {
        if (asset.category !== activeCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          asset.symbol.toLowerCase().includes(q) ||
          asset.name.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'payout') return b.payout - a.payout;
      if (sortBy === 'change') return b.change24h - a.change24h;
      return a.symbol.localeCompare(b.symbol);
    });

  return (
    <div 
      id="asset-selector-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="asset-selector-modal-dialog"
        className="bg-[#0d121b]/95 backdrop-blur-2xl border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Select Trading Asset</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Category Pills */}
        <div className="p-4 space-y-3 bg-white/5 border-b border-white/10">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by pair or asset name (e.g. USD/JPY, BTC, Gold, Apple)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Table / List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <p className="text-sm">No assets found matching your criteria</p>
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => {
                  onSelectAsset(asset);
                  onClose();
                }}
                className="p-3.5 hover:bg-white/5 flex items-center justify-between cursor-pointer transition-colors group"
              >
                {/* Left: Star + Flag + Name */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(asset.id);
                    }}
                    className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        asset.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  <span className="text-2xl">{asset.flag}</span>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                        {asset.symbol}
                      </span>
                      {asset.isOtc && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          OTC
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{asset.name}</div>
                  </div>
                </div>

                {/* Right: 24h Change & Payout Rate */}
                <div className="flex items-center space-x-6">
                  {/* 24h Change */}
                  <div className="text-right hidden sm:block">
                    <div
                      className={`text-xs font-mono-nums font-bold flex items-center justify-end space-x-0.5 ${
                        asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {asset.change24h >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      <span>{asset.change24h >= 0 ? `+${asset.change24h}%` : `${asset.change24h}%`}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono-nums">
                      {asset.basePrice.toFixed(asset.decimals)}
                    </div>
                  </div>

                  {/* Payout % Badge */}
                  <div className="text-right min-w-[70px]">
                    <div className="text-base font-black font-mono-nums text-emerald-400">
                      {asset.payout}%
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Payout
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
