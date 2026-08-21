import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Asset, 
  Candle, 
  Trade, 
  ChartType, 
  Timeframe, 
  IndicatorConfig, 
  DrawingToolType, 
  DrawingItem 
} from '../types/trading';
import { 
  calculateSMA, 
  calculateEMA, 
  calculateBollingerBands, 
  calculateRSI, 
  calculateMACD, 
  convertToHeikinAshi 
} from '../utils/marketData';
import { 
  TrendingUp, 
  TrendingDown, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Sliders, 
  Layers, 
  PenTool, 
  Clock, 
  RefreshCw,
  Info,
  ChevronDown
} from 'lucide-react';

interface TradingChartProps {
  asset: Asset;
  candles: Candle[];
  activeTrades: Trade[];
  currentPrice: number;
  tradeDurationSeconds: number;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  indicators: IndicatorConfig;
  onOpenIndicatorsModal: () => void;
  onOpenPairInfoModal: () => void;
  themeMode?: 'dark' | 'light';
}

export const TradingChart: React.FC<TradingChartProps> = ({
  asset,
  candles,
  activeTrades,
  currentPrice,
  tradeDurationSeconds,
  chartType,
  setChartType,
  timeframe,
  setTimeframe,
  indicators,
  onOpenIndicatorsModal,
  onOpenPairInfoModal,
  themeMode = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, >1 zoomed in, <1 zoomed out
  const [panOffset, setPanOffset] = useState(0); // Candles offset from right
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [touchDist, setTouchDist] = useState<number | null>(null);
  
  // Drawing tools state
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingToolType>('none');
  const [drawings, setDrawings] = useState<DrawingItem[]>([]);
  const [currentDrawingPoints, setCurrentDrawingPoints] = useState<{ time: number; price: number }[]>([]);

  // Sub-menus
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showTfMenu, setShowTfMenu] = useState(false);
  const [showDrawingMenu, setShowDrawingMenu] = useState(false);

  // Resize observer for responsive high-DPI canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Timeframe labels
  const timeframes: { key: Timeframe; label: string }[] = [
    { key: '5s', label: '5s' },
    { key: '15s', label: '15s' },
    { key: '30s', label: '30s' },
    { key: '1m', label: '1m' },
    { key: '2m', label: '2m' },
    { key: '5m', label: '5m' },
    { key: '15m', label: '15m' },
    { key: '1h', label: '1h' },
  ];

  // Primary High Performance Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width <= 0 || dimensions.height <= 0 || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const width = dimensions.width;
    const height = dimensions.height;

    // Layout configuration
    const rightMargin = 75; // Y-axis price label area
    const bottomMargin = 28; // X-axis time label area
    const subChartHeight = indicators.rsi.enabled || indicators.macd.enabled ? 110 : 0;
    const mainHeight = height - bottomMargin - subChartHeight;
    const chartWidth = width - rightMargin;

    // Clear background with radial gradient or light theme canvas
    if (themeMode === 'light') {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
    } else {
      const bgGradient = ctx.createRadialGradient(
        width / 2, height / 2, 10,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      bgGradient.addColorStop(0, '#161d2b');
      bgGradient.addColorStop(1, '#0b0e14');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
    }

    // Visible candles calculation based on zoom and pan
    const baseVisibleCandles = 60;
    const visibleCount = Math.max(15, Math.min(180, Math.floor(baseVisibleCandles / zoomLevel)));
    const candleWidth = (chartWidth / visibleCount) * 0.72;
    const candleSpacing = chartWidth / visibleCount;

    // Slicing visible window of candles
    const endIndex = Math.max(0, candles.length - 1 - panOffset);
    const startIndex = Math.max(0, endIndex - visibleCount + 1);
    
    // Convert to Heikin Ashi if chosen
    const displayCandles = chartType === 'heikin-ashi' ? convertToHeikinAshi(candles) : candles;
    const visibleCandles = displayCandles.slice(startIndex, endIndex + 1);

    if (visibleCandles.length === 0) return;

    // Compute Price Range for scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    visibleCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    // Also include active trades strike prices in range
    activeTrades.forEach((t) => {
      if (t.openPrice < minPrice) minPrice = t.openPrice;
      if (t.openPrice > maxPrice) maxPrice = t.openPrice;
    });

    // Also include current price
    if (currentPrice < minPrice) minPrice = currentPrice;
    if (currentPrice > maxPrice) maxPrice = currentPrice;

    // Add 12% padding to price bounds for breathing space
    const pricePadding = (maxPrice - minPrice) * 0.14 || asset.volatility * 4;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    // Coordinate Mapping Helpers
    const getX = (index: number) => {
      // index relative to visible window
      return index * candleSpacing + candleSpacing / 2;
    };

    const getY = (price: number) => {
      return mainHeight - ((price - minPrice) / priceRange) * mainHeight;
    };

    const getPriceFromY = (y: number) => {
      return maxPrice - (y / mainHeight) * priceRange;
    };

    // 1. Draw Grid Lines (Horizontal Prices & Vertical Timestamps)
    ctx.lineWidth = 1;
    ctx.strokeStyle = themeMode === 'light' ? 'rgba(203, 213, 225, 0.8)' : 'rgba(42, 50, 70, 0.45)';

    // Horizontal grid lines
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const y = (mainHeight / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      const priceVal = getPriceFromY(y);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceVal.toFixed(asset.decimals), chartWidth + 8, y + 3.5);
    }

    // Vertical grid lines and time markers
    const maxLabels = Math.max(3, Math.floor(chartWidth / 85));
    const timeStep = Math.max(1, Math.ceil(visibleCandles.length / maxLabels));
    for (let i = 0; i < visibleCandles.length; i += timeStep) {
      const x = getX(i);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mainHeight);
      ctx.stroke();

      const candle = visibleCandles[i];
      const d = new Date(candle.time);
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      ctx.fillStyle = themeMode === 'light' ? '#334155' : '#94a3b8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, mainHeight + 18);
    }

    // 2. Draw Technical Overlays (Bollinger Bands, SMA, EMA)
    if (indicators.bollinger.enabled) {
      const bb = calculateBollingerBands(candles, indicators.bollinger.period, indicators.bollinger.stdDev);
      const visibleUpper = bb.upper.slice(startIndex, endIndex + 1);
      const visibleLower = bb.lower.slice(startIndex, endIndex + 1);
      const visibleMid = bb.middle.slice(startIndex, endIndex + 1);

      // Draw Band Fill
      ctx.beginPath();
      let hasStarted = false;
      for (let i = 0; i < visibleUpper.length; i++) {
        const u = visibleUpper[i];
        if (u !== null) {
          const x = getX(i);
          const y = getY(u);
          if (!hasStarted) {
            ctx.moveTo(x, y);
            hasStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = visibleLower.length - 1; i >= 0; i--) {
        const l = visibleLower[i];
        if (l !== null) {
          const x = getX(i);
          const y = getY(l);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.07)';
      ctx.fill();

      // Middle Line
      ctx.beginPath();
      ctx.strokeStyle = indicators.bollinger.color || '#3b82f6';
      ctx.lineWidth = 1;
      let midStarted = false;
      for (let i = 0; i < visibleMid.length; i++) {
        const m = visibleMid[i];
        if (m !== null) {
          const x = getX(i);
          const y = getY(m);
          if (!midStarted) {
            ctx.moveTo(x, y);
            midStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    if (indicators.sma.enabled) {
      const smaValues = calculateSMA(candles, indicators.sma.period);
      const visibleSMA = smaValues.slice(startIndex, endIndex + 1);
      ctx.beginPath();
      ctx.strokeStyle = indicators.sma.color || '#f59e0b';
      ctx.lineWidth = indicators.sma.lineWidth || 1.5;
      let started = false;
      for (let i = 0; i < visibleSMA.length; i++) {
        const val = visibleSMA[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    if (indicators.ema.enabled) {
      const emaValues = calculateEMA(candles, indicators.ema.period);
      const visibleEMA = emaValues.slice(startIndex, endIndex + 1);
      ctx.beginPath();
      ctx.strokeStyle = indicators.ema.color || '#ec4899';
      ctx.lineWidth = indicators.ema.lineWidth || 1.5;
      let started = false;
      for (let i = 0; i < visibleEMA.length; i++) {
        const val = visibleEMA[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    // 3. Draw Main Price Chart (Candlesticks, Line/Area, Bars)
    if (chartType === 'candlestick' || chartType === 'heikin-ashi') {
      visibleCandles.forEach((candle, idx) => {
        const x = getX(idx);
        const isBullish = candle.close >= candle.open;
        const color = isBullish ? '#10b981' : '#ef4444';

        const openY = getY(candle.open);
        const closeY = getY(candle.close);
        const highY = getY(candle.high);
        const lowY = getY(candle.low);

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle Body
        const topY = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, topY, candleWidth, bodyHeight);
      });
    } else if (chartType === 'area') {
      // Area / Line Chart with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, mainHeight);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        const x = getX(idx);
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Close polygon for area fill
      const lastX = getX(visibleCandles.length - 1);
      const firstX = getX(0);
      ctx.lineTo(lastX, mainHeight);
      ctx.lineTo(firstX, mainHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Top glowing line
      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        const x = getX(idx);
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (chartType === 'bars') {
      visibleCandles.forEach((candle, idx) => {
        const x = getX(idx);
        const isBullish = candle.close >= candle.open;
        const color = isBullish ? '#10b981' : '#ef4444';

        const openY = getY(candle.open);
        const closeY = getY(candle.close);
        const highY = getY(candle.high);
        const lowY = getY(candle.low);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;

        // Main high-low line
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Left open tick
        ctx.beginPath();
        ctx.moveTo(x, openY);
        ctx.lineTo(x - candleWidth / 2, openY);
        ctx.stroke();

        // Right close tick
        ctx.beginPath();
        ctx.moveTo(x, closeY);
        ctx.lineTo(x + candleWidth / 2, closeY);
        ctx.stroke();
      });
    }

    // 4. Trade Execution Timelines: Beginning of trade & End of trade (Expiry)
    const latestCandleX = getX(visibleCandles.length - 1);
    
    // Future Expiration line projection (e.g. 10 candles forward)
    const expiryCandleSteps = Math.max(4, Math.round(tradeDurationSeconds / 10));
    const expiryX = Math.min(chartWidth - 20, latestCandleX + expiryCandleSteps * candleSpacing);

    // Dotted vertical line: Beginning of trade
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(latestCandleX, 0);
    ctx.lineTo(latestCandleX, mainHeight);
    ctx.stroke();

    // Dotted vertical line: End of trade / Expiration
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(expiryX, 0);
    ctx.lineTo(expiryX, mainHeight);
    ctx.stroke();
    ctx.restore();

    // Expiry labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Beginning of trade', latestCandleX - 8, 25);
    ctx.textAlign = 'left';
    ctx.fillText('End of trade', expiryX + 8, 25);

    // Remaining trade duration badge on expiry line
    const durMins = Math.floor(tradeDurationSeconds / 60);
    const durSecs = tradeDurationSeconds % 60;
    const durStr = `${String(durMins).padStart(2, '0')}:${String(durSecs).padStart(2, '0')}`;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    const badgeW = 46;
    const badgeH = 18;
    const badgeY = mainHeight / 2;
    ctx.fillRect(expiryX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);
    ctx.strokeRect(expiryX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(durStr, expiryX, badgeY + 3.5);

    // 5. Active Trades Markers on Chart
    activeTrades.forEach((trade) => {
      if (trade.assetId !== asset.id) return;
      const tradeY = getY(trade.openPrice);

      // Horizontal dashed entry strike line
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = trade.type === 'CALL' ? '#00b073' : '#ff4a4a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, tradeY);
      ctx.lineTo(chartWidth, tradeY);
      ctx.stroke();
      ctx.restore();

      // Entry badge on the right
      const isProfitable =
        (trade.type === 'CALL' && currentPrice > trade.openPrice) ||
        (trade.type === 'PUT' && currentPrice < trade.openPrice);

      const markerColor = isProfitable ? '#00b073' : '#ff4a4a';
      const arrowSymbol = trade.type === 'CALL' ? '▲' : '▼';

      ctx.fillStyle = markerColor;
      ctx.fillRect(latestCandleX - 40, tradeY - 11, 48, 22);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${arrowSymbol} $${trade.amount}`, latestCandleX - 16, tradeY + 3.5);
    });

    // 6. Real-time Live Price Line & Pulsing Badge
    const currentPriceY = getY(currentPrice);

    ctx.save();
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, currentPriceY);
    ctx.lineTo(chartWidth, currentPriceY);
    ctx.stroke();
    ctx.restore();

    // Right Y-axis live price pill (Emerald with black bold text)
    const pillW = 72;
    const pillH = 22;
    const pillX = chartWidth + 2;
    const pillY = currentPriceY - pillH / 2;

    ctx.fillStyle = '#10b981';
    // Rounded pill
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 4);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentPrice.toFixed(asset.decimals), pillX + pillW / 2, pillY + 14.5);

    // 7. Mouse Crosshair Tracking
    if (mousePos && mousePos.x >= 0 && mousePos.x <= chartWidth && mousePos.y >= 0 && mousePos.y <= mainHeight) {
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, mainHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.restore();

      // Mouse price badge on right Y-axis
      const hoverPrice = getPriceFromY(mousePos.y);
      ctx.fillStyle = '#334155';
      ctx.fillRect(chartWidth + 2, mousePos.y - 10, pillW, 20);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hoverPrice.toFixed(asset.decimals), chartWidth + 2 + pillW / 2, mousePos.y + 3.5);
    }

    // 8. Render Sub-Chart (RSI or MACD) if enabled
    if (subChartHeight > 0) {
      const subY = mainHeight + bottomMargin;

      // Divider line
      ctx.strokeStyle = '#2a3246';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, subY);
      ctx.lineTo(width, subY);
      ctx.stroke();

      if (indicators.rsi.enabled) {
        const rsiValues = calculateRSI(candles, indicators.rsi.period);
        const visibleRSI = rsiValues.slice(startIndex, endIndex + 1);

        // Sub chart label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`RSI (${indicators.rsi.period})`, 10, subY + 16);

        const getRsiY = (val: number) => {
          // val 0 to 100
          return subY + 24 + ((100 - val) / 100) * (subChartHeight - 34);
        };

        // Levels (70, 50, 30)
        [70, 50, 30].forEach((lvl) => {
          const ly = getRsiY(lvl);
          ctx.strokeStyle = lvl === 50 ? 'rgba(71, 85, 105, 0.4)' : 'rgba(148, 163, 184, 0.3)';
          ctx.beginPath();
          ctx.moveTo(0, ly);
          ctx.lineTo(chartWidth, ly);
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(String(lvl), chartWidth + 8, ly + 3);
        });

        // RSI Line
        ctx.beginPath();
        ctx.strokeStyle = indicators.rsi.color || '#a855f7';
        ctx.lineWidth = 1.5;
        let rsiStarted = false;
        for (let i = 0; i < visibleRSI.length; i++) {
          const r = visibleRSI[i];
          if (r !== null) {
            const rx = getX(i);
            const ry = getRsiY(r);
            if (!rsiStarted) {
              ctx.moveTo(rx, ry);
              rsiStarted = true;
            } else {
              ctx.lineTo(rx, ry);
            }
          }
        }
        ctx.stroke();
      }
    }
  }, [
    dimensions,
    candles,
    activeTrades,
    currentPrice,
    tradeDurationSeconds,
    chartType,
    zoomLevel,
    panOffset,
    indicators,
    mousePos,
    asset,
  ]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const candleShift = Math.round(deltaX / 8);
      if (candleShift !== 0) {
        setPanOffset((prev) => Math.max(0, Math.min(candles.length - 20, prev + candleShift)));
        setDragStartX(e.clientX);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStartX(e.touches[0].clientX);
      setTouchDist(null);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePos({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        });
      }
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePos({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        });
      }
      const deltaX = e.touches[0].clientX - dragStartX;
      const candleShift = Math.round(deltaX / 8);
      if (candleShift !== 0) {
        setPanOffset((prev) => Math.max(0, Math.min(candles.length - 20, prev + candleShift)));
        setDragStartX(e.touches[0].clientX);
      }
    } else if (e.touches.length === 2 && touchDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchDist;
      if (ratio > 1.03) {
        setZoomLevel((z) => Math.min(2.5, z * 1.05));
        setTouchDist(dist);
      } else if (ratio < 0.97) {
        setZoomLevel((z) => Math.max(0.4, z * 0.95));
        setTouchDist(dist);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDist(null);
    setMousePos(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((z) => Math.min(2.5, z * 1.1));
    } else {
      setZoomLevel((z) => Math.max(0.4, z * 0.9));
    }
  };

  return (
    <div 
      ref={containerRef} 
      id="main-trading-chart-container"
      className="relative flex-1 h-full w-full bg-[#12161f] overflow-hidden select-none"
    >
      {/* High-DPI HTML5 Canvas Chart */}
      <canvas
        ref={canvasRef}
        id="trading-chart-canvas"
        className="w-full h-full cursor-crosshair block touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setMousePos(null);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      />

      {/* Top Overlay Badges: UTC Live Clock, Pair Info button */}
      <div className="absolute top-3 left-4 flex items-center space-x-3 pointer-events-auto">
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-[#0d121b]/80 backdrop-blur-md rounded-lg border border-white/10 text-xs font-mono-nums text-slate-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{new Date().toISOString().substring(11, 19)} UTC</span>
        </div>

        <button
          id="btn-pair-info"
          onClick={onOpenPairInfoModal}
          className="flex items-center space-x-1.5 px-3 py-1 bg-[#0d121b]/80 hover:bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-xs text-emerald-400 hover:text-emerald-300 transition-colors shadow-lg cursor-pointer animate-pulse"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider text-[10px] text-emerald-400">PAIR INFORMATION</span>
        </button>
      </div>

      {/* Floating Bottom Toolbar (Quotex Frosted Glass Style) */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 z-10">
        {/* Drawing Tools Dropdown */}
        <div className="relative">
          <button
            id="btn-chart-drawings"
            onClick={() => {
              setShowDrawingMenu(!showDrawingMenu);
              setShowTypeMenu(false);
              setShowTfMenu(false);
            }}
            className={`p-2 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              activeDrawingTool !== 'none' || showDrawingMenu
                ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-[#0d121b]/80 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title="Drawing Tools"
          >
            <PenTool className="w-4 h-4" />
          </button>

          {showDrawingMenu && (
            <div className="absolute bottom-11 left-0 bg-[#0d121b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 w-48 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-white/5 pb-1 mb-1">
                Drawing & Zoom
              </div>
              <button
                onClick={() => {
                  setZoomLevel((z) => Math.min(2.5, z * 1.15));
                  setShowDrawingMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/5 flex items-center space-x-2 text-emerald-400"
              >
                <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Zoom In (Chart)</span>
              </button>
              <button
                onClick={() => {
                  setZoomLevel((z) => Math.max(0.4, z * 0.85));
                  setShowDrawingMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/5 flex items-center space-x-2 text-rose-400"
              >
                <ZoomOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-semibold">Zoom Out (Chart)</span>
              </button>
              <div className="border-t border-white/5 my-1 pt-1"></div>
              {(['none', 'trendline', 'horizontal', 'ray', 'fibonacci'] as DrawingToolType[]).map((tool) => (
                <button
                  key={tool}
                  onClick={() => {
                    setActiveDrawingTool(tool);
                    setShowDrawingMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                    activeDrawingTool === tool ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {tool === 'none' ? 'No Drawing' : tool}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeframe Selector Dropdown */}
        <div className="relative">
          <button
            id="btn-timeframe-dropdown"
            onClick={() => {
              setShowTfMenu(!showTfMenu);
              setShowTypeMenu(false);
              setShowDrawingMenu(false);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-[#0d121b]/80 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono-nums font-semibold text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
          >
            <span>{timeframe}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showTfMenu && (
            <div className="absolute bottom-11 left-0 bg-[#0d121b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 grid grid-cols-2 gap-1 w-36">
              {timeframes.map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => {
                    setTimeframe(tf.key);
                    setShowTfMenu(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono-nums text-center transition-colors ${
                    timeframe === tf.key ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart Type Selector Dropdown */}
        <div className="relative">
          <button
            id="btn-chart-type-dropdown"
            onClick={() => {
              setShowTypeMenu(!showTypeMenu);
              setShowTfMenu(false);
              setShowDrawingMenu(false);
            }}
            className="p-2 bg-[#0d121b]/80 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 backdrop-blur-md transition-all cursor-pointer shadow-lg"
            title="Chart Type"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showTypeMenu && (
            <div className="absolute bottom-11 left-0 bg-[#0d121b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 w-40 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Chart Type
              </div>
              {[
                { type: 'candlestick' as ChartType, label: 'Candlestick' },
                { type: 'area' as ChartType, label: 'Area / Line' },
                { type: 'bars' as ChartType, label: 'Bars' },
                { type: 'heikin-Ashi' as ChartType, label: 'Heikin-Ashi' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    setChartType(item.type);
                    setShowTypeMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    chartType === item.type ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Technical Indicators Configuration Modal Trigger */}
        <button
          id="btn-open-indicators"
          onClick={onOpenIndicatorsModal}
          className="p-2 bg-[#0d121b]/80 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          title="Indicators & Oscillators"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Zoom In & Out & Reset */}
        <div className="flex items-center space-x-1 bg-[#0d121b]/80 border border-white/10 rounded-lg p-1 backdrop-blur-md shadow-lg">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.4, z * 0.85))}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset(0);
            }}
            className="p-1 text-slate-400 hover:text-white transition-colors text-[10px] font-mono-nums cursor-pointer"
            title="Reset Zoom & Pan"
          >
            100%
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z * 1.15))}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
