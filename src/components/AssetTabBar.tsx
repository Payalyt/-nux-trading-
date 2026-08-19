import React from 'react';
import { Asset } from '../types/trading';
import { Plus, X, ChevronDown } from 'lucide-react';

interface AssetTabBarProps {
  openAssets: Asset[];
  activeAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
  onCloseAssetTab: (assetId: string) => void;
  onOpenAssetSelector: () => void;
}

export const AssetTabBar: React.FC<AssetTabBarProps> = ({
  openAssets,
  activeAsset,
  onSelectAsset,
  onCloseAssetTab,
  onOpenAssetSelector,
}) => {
  return (
    <div 
      id="asset-tab-bar"
      className="h-12 bg-[#0b0e14]/90 backdrop-blur-md border-b border-white/10 flex items-center px-4 space-x-2 overflow-x-auto select-none shrink-0"
    >
      {/* Open Asset Tabs */}
      {openAssets.map((asset) => {
        const isActive = asset.id === activeAsset.id;
        return (
          <div
            key={asset.id}
            onClick={() => onSelectAsset(asset)}
            className={`group flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-150 ${
              isActive
                ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-black/40'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            <span className="text-base">{asset.flag}</span>
            <span className="font-bold tracking-tight text-white">{asset.symbol}</span>
            <span className="text-emerald-400 font-mono-nums font-bold text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {asset.payout}%
            </span>

            {/* Dropdown indicator or Close button */}
            {openAssets.length > 1 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseAssetTab(asset.id);
                }}
                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Close Tab"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </div>
        );
      })}

      {/* Plus (+) Button to open searchable Asset Selector */}
      <button
        id="btn-add-asset-tab"
        onClick={onOpenAssetSelector}
        className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
        title="Add Trading Asset / Currency Pair"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
      </button>
    </div>
  );
};
