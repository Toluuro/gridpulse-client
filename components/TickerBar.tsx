'use client';

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

interface TickerMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface TickerPayload {
  timestamp: string;
  metrics: TickerMetric[];
}

export default function TickerBar(): React.JSX.Element {
  const [tickerData, setTickerData] = useState<TickerPayload | null>(null);

  useEffect(() => {
    const handleTickerUpdate = (data: TickerPayload) => setTickerData(data);
    socket.on('MARKET_TICKER_UPDATE', handleTickerUpdate);
    return () => { socket.off('MARKET_TICKER_UPDATE', handleTickerUpdate); };
  }, []);

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-slate-200 px-4 py-2 overflow-hidden shadow-inner shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold tracking-wider uppercase text-slate-400">Nigerian Macro Telemetry</span>
          {tickerData?.timestamp && <span className="text-slate-500 font-mono">[{tickerData.timestamp}]</span>}
        </div>

        <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto justify-start sm:justify-end font-mono">
          {tickerData?.metrics.map((metric) => (
            <div key={metric.id} className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400 font-sans font-medium">{metric.label}:</span>
              <span className="font-bold text-white">{metric.value}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${metric.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {metric.change}
              </span>
            </div>
          ))}
          {!tickerData && <span className="text-slate-500 animate-pulse">Connecting to CBN & Spot oil streams...</span>}
        </div>
      </div>
    </div>
  );
}