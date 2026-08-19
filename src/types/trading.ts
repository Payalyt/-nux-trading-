export type AssetCategory = 'currencies' | 'crypto' | 'commodities' | 'stocks' | 'otc';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  basePrice: number;
  decimals: number;
  payout: number; // e.g. 80 means 80%
  flag: string; // emoji or code
  isOtc?: boolean;
  volatility: number; // price movement magnitude
  change24h: number; // % change
  high24h: number;
  low24h: number;
  isFavorite?: boolean;
}

export interface Candle {
  time: number; // timestamp in ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TradeType = 'CALL' | 'PUT';
export type TradeStatus = 'ACTIVE' | 'WON' | 'LOST' | 'DRAW';
export type AccountType = 'DEMO' | 'LIVE';

export interface Trade {
  id: string;
  assetId: string;
  assetSymbol: string;
  type: TradeType;
  amount: number;
  openPrice: number;
  closePrice?: number;
  payoutRate: number; // e.g. 0.80
  openTime: number;
  durationSeconds: number;
  expiryTime: number;
  status: TradeStatus;
  accountType: AccountType;
  returnAmount?: number;
}

export type ChartType = 'candlestick' | 'area' | 'bars' | 'heikin-ashi';
export type Timeframe = '5s' | '15s' | '30s' | '1m' | '2m' | '5m' | '15m' | '1h';

export interface IndicatorConfig {
  sma: {
    enabled: boolean;
    period: number;
    color: string;
    lineWidth: number;
  };
  ema: {
    enabled: boolean;
    period: number;
    color: string;
    lineWidth: number;
  };
  bollinger: {
    enabled: boolean;
    period: number;
    stdDev: number;
    color: string;
  };
  rsi: {
    enabled: boolean;
    period: number;
    color: string;
    overbought: number;
    oversold: number;
  };
  macd: {
    enabled: boolean;
    fast: number;
    slow: number;
    signal: number;
  };
}

export type DrawingToolType = 'none' | 'trendline' | 'horizontal' | 'ray' | 'fibonacci';

export interface DrawingItem {
  id: string;
  type: DrawingToolType;
  points: { time: number; price: number }[];
  color: string;
}

export interface Tournament {
  id: string;
  title: string;
  prizePool: number;
  participants: number;
  entryFee: number;
  timeLeft: string;
  status: 'ACTIVE' | 'UPCOMING' | 'FINISHED';
  userRank?: number;
  isRegistered?: boolean;
}

export interface MarketStoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'risk-free' | 'bonus' | 'cashback' | 'vip';
  badge?: string;
  iconName: string;
}

export interface TradingSignal {
  id: string;
  assetId: string;
  assetSymbol: string;
  direction: 'CALL' | 'PUT';
  accuracy: number; // e.g. 88%
  timeframe: string;
  generatedAt: number;
  expiresInSeconds: number;
  strength: 'Strong' | 'Moderate' | 'High';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'bonus';
  read: boolean;
}

export interface UserAccount {
  email: string;
  name: string;
  id: string;
  currency: string;
  isVerified?: boolean;
  role?: string;
}
