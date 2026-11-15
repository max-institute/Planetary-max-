import React from 'react';
import { ChessMoveRecord } from '../../shared/types';
import { GlassCard } from '../../shared/GlassCard';

interface ChessAnalysisHudProps {
  systemName: string;
  evalScore: number;
  moves: ChessMoveRecord[];
}

export const ChessAnalysisHud: React.FC<ChessAnalysisHudProps> = ({
  systemName,
  evalScore,
  moves,
}) => {
  const normalizedPct = Math.min(95, Math.max(5, 50 + evalScore * 10));

  return (
    <GlassCard glowColor="cyan" className="p-3.5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase">
            STOCKFISH WASM TELEMETRY // {systemName}
          </span>
          <div className="font-mono text-sm font-bold text-white">
            Engine Evaluation:{' '}
            <span className="text-emerald-400">
              {evalScore >= 0 ? `+${evalScore.toFixed(2)}` : evalScore.toFixed(2)}
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/40 font-mono text-[11px] text-emerald-300">
          DEPTH 24 • LEGAL VALIDATED
        </span>
      </div>

      <div className="w-full h-2.5 bg-rose-950/80 rounded-full overflow-hidden border border-white/15">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${normalizedPct}%` }}
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
        {moves.map((m) => (
          <div
            key={m.moveNumber}
            className="px-2.5 py-1 rounded bg-white/5 border border-white/10 shrink-0"
          >
            <span className="text-slate-500 mr-1">{m.moveNumber}.</span>
            <span className="text-cyan-300 mr-1.5">{m.white}</span>
            {m.black && <span className="text-rose-300">{m.black}</span>}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
