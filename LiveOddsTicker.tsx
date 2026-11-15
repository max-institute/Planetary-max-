import React from 'react';
import { SportMarketEvent } from '../../shared/types';

interface LiveOddsTickerProps {
  events: SportMarketEvent[];
}

export const LiveOddsTicker: React.FC<LiveOddsTickerProps> = ({ events }) => {
  return (
    <div className="w-full bg-slate-900/90 border border-emerald-500/30 rounded-lg px-3 py-2 flex items-center gap-4 overflow-x-auto">
      <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/50 rounded font-mono text-[10px] font-bold text-emerald-300 shrink-0 animate-pulse">
        LIVE ODDS TAPE
      </span>
      <div className="flex items-center gap-5 shrink-0">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">[{ev.sport}]</span>
            <span className="text-white font-semibold">{ev.selection}</span>
            <span className="text-cyan-300 font-bold">
              {ev.odds > 0 ? `+${ev.odds}` : ev.odds}
            </span>
            <span
              className={`text-[10px] ${
                ev.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {ev.delta >= 0 ? `▲ +${ev.delta}` : `▼ ${ev.delta}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
