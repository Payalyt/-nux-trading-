import { Asset, Candle, IndicatorConfig } from '../types/trading';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'usdjpy',
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'currencies',
    basePrice: 159.703,
    decimals: 3,
    payout: 80,
    flag: '🇺🇸🇯🇵',
    volatility: 0.012,
    change24h: 0.42,
    high24h: 159.920,
    low24h: 159.410,
    isFavorite: true,
  },
  {
    id: 'eurusd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'currencies',
    basePrice: 1.0845,
    decimals: 5,
    payout: 85,
    flag: '🇪🇺🇺🇸',
    volatility: 0.00015,
    change24h: -0.18,
    high24h: 1.0872,
    low24h: 1.0820,
    isFavorite: true,
  },
  {
    id: 'gbpusd',
    symbol: 'GBP/USD',
    name: 'Great Britain Pound / US Dollar',
    category: 'currencies',
    basePrice: 1.2942,
    decimals: 5,
    payout: 82,
    flag: '🇬🇧🇺🇸',
    volatility: 0.00022,
    change24h: 0.31,
    high24h: 1.2980,
    low24h: 1.2915,
  },
  {
    id: 'btcusd',
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    category: 'crypto',
    basePrice: 67420.50,
    decimals: 2,
    payout: 92,
    flag: '₿🇺🇸',
    volatility: 45.0,
    change24h: 3.84,
    high24h: 68150.00,
    low24h: 65900.00,
    isFavorite: true,
  },
  {
    id: 'ethusd',
    symbol: 'ETH/USD',
    name: 'Ethereum / US Dollar',
    category: 'crypto',
    basePrice: 3512.40,
    decimals: 2,
    payout: 88,
    flag: 'Ξ🇺🇸',
    volatility: 3.5,
    change24h: 2.15,
    high24h: 3580.00,
    low24h: 3440.00,
  },
  {
    id: 'gold',
    symbol: 'GOLD (XAU/USD)',
    name: 'Gold Spot / US Dollar',
    category: 'commodities',
    basePrice: 2418.80,
    decimals: 2,
    payout: 78,
    flag: '🥇🇺🇸',
    volatility: 1.8,
    change24h: 0.65,
    high24h: 2432.00,
    low24h: 2405.00,
  },
  {
    id: 'oil',
    symbol: 'BRENT CRUDE',
    name: 'Brent Crude Oil',
    category: 'commodities',
    basePrice: 84.65,
    decimals: 2,
    payout: 75,
    flag: '🛢️',
    volatility: 0.12,
    change24h: -1.05,
    high24h: 85.90,
    low24h: 84.10,
  },
  {
    id: 'aapl_otc',
    symbol: 'APPLE (OTC)',
    name: 'Apple Inc. Over The Counter',
    category: 'otc',
    basePrice: 224.75,
    decimals: 2,
    payout: 94,
    flag: '🍎',
    isOtc: true,
    volatility: 0.28,
    change24h: 1.45,
    high24h: 226.50,
    low24h: 222.80,
    isFavorite: true,
  },
  {
    id: 'tsla_otc',
    symbol: 'TESLA (OTC)',
    name: 'Tesla Inc. Over The Counter',
    category: 'otc',
    basePrice: 254.30,
    decimals: 2,
    payout: 90,
    flag: '⚡',
    isOtc: true,
    volatility: 0.65,
    change24h: -2.30,
    high24h: 261.00,
    low24h: 251.20,
  },
  {
    id: 'nvda_otc',
    symbol: 'NVIDIA (OTC)',
    name: 'NVIDIA Corp. Over The Counter',
    category: 'otc',
    basePrice: 128.90,
    decimals: 2,
    payout: 91,
    flag: '🟢',
    isOtc: true,
    volatility: 0.45,
    change24h: 4.12,
    high24h: 131.20,
    low24h: 124.80,
  },
  {
    id: 'usdcad',
    symbol: 'USD/CAD (OTC)',
    name: 'US Dollar / Canadian Dollar',
    category: 'otc',
    basePrice: 1.3685,
    decimals: 5,
    payout: 87,
    flag: '🇺🇸🇨🇦',
    isOtc: true,
    volatility: 0.00018,
    change24h: 0.12,
    high24h: 1.3710,
    low24h: 1.3650,
  },
  {
    id: 'audusd',
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    category: 'currencies',
    basePrice: 0.6675,
    decimals: 5,
    payout: 81,
    flag: '🇦🇺🇺🇸',
    volatility: 0.00016,
    change24h: -0.25,
    high24h: 0.6705,
    low24h: 0.6650,
  },
];

// Helper to generate historical realistic candlestick charts
export function generateInitialCandles(asset: Asset, count = 120, timeframeMs = 5000): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  let currentPrice = asset.basePrice;
  const vol = asset.volatility;

  // Generate backwards in time
  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * timeframeMs;
    // Micro trend & noise
    const trendCycle = Math.sin((count - i) / 12) * 0.4 + Math.cos((count - i) / 25) * 0.6;
    const randomDelta = (Math.random() - 0.495 + trendCycle * 0.15) * vol * 2.2;
    
    const open = currentPrice;
    const close = Number((open + randomDelta).toFixed(asset.decimals));
    const high = Number((Math.max(open, close) + Math.random() * vol * 1.5).toFixed(asset.decimals));
    const low = Number((Math.min(open, close) - Math.random() * vol * 1.5).toFixed(asset.decimals));
    const volume = Math.floor(Math.random() * 500 + 50);

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

// Next tick simulator with momentum and micro volatility
export function simulateNextTick(
  lastCandle: Candle,
  asset: Asset,
  timeframeMs: number
): { updatedCandles: (prev: Candle[]) => Candle[]; currentPrice: number; isNewCandle: boolean } {
  const now = Date.now();
  const vol = asset.volatility;
  const tickDelta = (Math.random() - 0.49 + (Math.random() > 0.5 ? 0.02 : -0.02)) * vol * 0.7;
  const newPrice = Number((lastCandle.close + tickDelta).toFixed(asset.decimals));

  const shouldCreateNewCandle = now - lastCandle.time >= timeframeMs;

  return {
    currentPrice: newPrice,
    isNewCandle: shouldCreateNewCandle,
    updatedCandles: (prev: Candle[]) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];

      if (shouldCreateNewCandle) {
        // Start a brand new candle
        const newCandle: Candle = {
          time: now,
          open: last.close,
          high: Math.max(last.close, newPrice),
          low: Math.min(last.close, newPrice),
          close: newPrice,
          volume: 1,
        };
        return [...prev.slice(-160), newCandle];
      } else {
        // Update current active candle in real time
        const updatedLast: Candle = {
          ...last,
          high: Number(Math.max(last.high, newPrice).toFixed(asset.decimals)),
          low: Number(Math.min(last.low, newPrice).toFixed(asset.decimals)),
          close: newPrice,
          volume: last.volume + 1,
        };
        return [...prev.slice(0, -1), updatedLast];
      }
    },
  };
}

// Technical Indicators Calculation
export function calculateSMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[i - j].close;
      }
      result.push(sum / period);
    }
  }
  return result;
}

export function calculateEMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prevEMA: number | null = null;

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[i - j].close;
      }
      prevEMA = sum / period;
      result.push(prevEMA);
    } else {
      if (prevEMA !== null) {
        prevEMA = candles[i].close * k + prevEMA * (1 - k);
        result.push(prevEMA);
      } else {
        result.push(null);
      }
    }
  }
  return result;
}

export function calculateBollingerBands(
  candles: Candle[],
  period: number,
  stdDevMultiplier: number
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = calculateSMA(candles, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    const ma = middle[i];
    if (ma === null || i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      let varianceSum = 0;
      for (let j = 0; j < period; j++) {
        varianceSum += Math.pow(candles[i - j].close - ma, 2);
      }
      const stdDev = Math.sqrt(varianceSum / period);
      upper.push(ma + stdDev * stdDevMultiplier);
      lower.push(ma - stdDev * stdDevMultiplier);
    }
  }

  return { upper, middle, lower };
}

export function calculateRSI(candles: Candle[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (candles.length <= period) {
    return candles.map(() => null);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  result.push(...new Array(period).fill(null));
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - 100 / (1 + rs));

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  return result;
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);
  const macdLine: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    const f = fastEMA[i];
    const s = slowEMA[i];
    if (f !== null && s !== null) {
      macdLine.push(f - s);
    } else {
      macdLine.push(null);
    }
  }

  // Signal line is EMA of MACD line
  const validMacdValues = macdLine.filter((v): v is number => v !== null);
  const signalLine: (number | null)[] = [];
  const histogram: (number | null)[] = [];

  const macdNullCount = macdLine.findIndex((v) => v !== null);

  if (validMacdValues.length < signalPeriod) {
    return {
      macd: macdLine,
      signal: candles.map(() => null),
      histogram: candles.map(() => null),
    };
  }

  const dummyCandles: Candle[] = validMacdValues.map((v, idx) => ({
    time: idx,
    open: v,
    high: v,
    low: v,
    close: v,
    volume: 1,
  }));

  const calculatedSignal = calculateEMA(dummyCandles, signalPeriod);

  for (let i = 0; i < candles.length; i++) {
    if (i < macdNullCount) {
      signalLine.push(null);
      histogram.push(null);
    } else {
      const sigVal = calculatedSignal[i - macdNullCount];
      signalLine.push(sigVal);
      const macVal = macdLine[i];
      if (macVal !== null && sigVal !== null) {
        histogram.push(macVal - sigVal);
      } else {
        histogram.push(null);
      }
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

export function convertToHeikinAshi(candles: Candle[]): Candle[] {
  if (candles.length === 0) return [];
  const result: Candle[] = [];

  for (let i = 0; i < candles.length; i++) {
    const current = candles[i];
    const haClose = (current.open + current.high + current.low + current.close) / 4;
    let haOpen: number;

    if (i === 0) {
      haOpen = (current.open + current.close) / 2;
    } else {
      haOpen = (result[i - 1].open + result[i - 1].close) / 2;
    }

    const haHigh = Math.max(current.high, haOpen, haClose);
    const haLow = Math.min(current.low, haOpen, haClose);

    result.push({
      time: current.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: current.volume,
    });
  }

  return result;
}
