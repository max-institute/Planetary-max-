import React from 'react';
import { SportMarketEvent } from '../../shared/types';
import { GlassCard } from '../../shared/GlassCard';
import { NeonButton } from '../../shared/NeonButton';

interface KinematicMotionFeedProps {
  events: SportMarketEvent[];
  onAddLeg: (ev: SportMarketEvent) => void;
  selectedIds: string[];
}

export const KinematicMotionFeed: React.FC<KinematicMotionFeedProps> = ({
  events,
  onAddLeg,
  selectedIds,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      {events.map((ev) => {
        const isAdded = selectedIds.includes(ev.id);
        return (
          <GlassCard
            key={ev.id}
            glowColor={isAdded ? 'emerald' : 'none'}
            className="p-3.5 flex items-center justify-between gap-4"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[10px] font-bold">
                  {ev.sport}
                </span>
                <span className="font-mono text-xs text-slate-300">{ev.matchup}</span>
              </div>
              <div className="text-sm font-bold text-white">{ev.selection}</div>
              <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
                <span>
                  KINEMATIC VELOCITY:{' '}
                  <strong className="text-amber-300">{ev.kinematicVelocity}</strong>
                </span>
                <span>
                  AI WIN PROB:{' '}
                  <strong className="text-emerald-400">{ev.winProbability}%</strong>
                </span>
              </div>
            </div>

            <NeonButton
              size="sm"
              variant={isAdded ? 'emerald' : 'cyan'}
              onClick={() => onAddLeg(ev)}
            >
              {isAdded
                ? `✓ LOCKED (${ev.odds > 0 ? `+${ev.odds}` : ev.odds})`
                : `${ev.odds > 0 ? `+${ev.odds}` : ev.odds} // ADD SLIP`}
            </NeonButton>
          </GlassCard>
        );
      })}
    </div>
  );
};
