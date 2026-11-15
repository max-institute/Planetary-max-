import React, { useState } from 'react';
import { ParlayLeg } from '../../shared/types';
import { GlassCard } from '../../shared/GlassCard';
import { NeonButton } from '../../shared/NeonButton';

interface BettorHudSimulatorProps {
  legs: ParlayLeg[];
  onRemoveLeg: (eventId: string) => void;
  onClearSlip: () => void;
}

export const BettorHudSimulator: React.FC<BettorHudSimulatorProps> = ({
  legs,
  onRemoveLeg,
  onClearSlip,
}) => {
  const [stake, setStake] = useState<number>(250);
  const [zkProofHash, setZkProofHash] = useState<string | null>(null);

  const decimalMultiplier = legs.reduce((acc, leg) => {
    const dec = leg.odds > 0 ? leg.odds / 100 + 1 : 100 / Math.abs(leg.odds) + 1;
    return acc * dec;
  }, 1);

  const estimatedPayout = legs.length > 0 ? stake * decimalMultiplier : 0;

  const handleMintTicket = () => {
    const randomHex = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setZkProofHash(`zk_stake_0x${randomHex}`);
  };

  return (
    <GlassCard glowColor="emerald" className="p-4 flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
          <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
            STAKE_ZK PARLAY SLIP ({legs.length})
          </span>
          {legs.length > 0 && (
            <button
              onClick={onClearSlip}
              className="font-mono text-[10px] text-rose-400 hover:underline cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>

        {legs.length === 0 ? (
          <div className="py-8 text-center font-mono text-xs text-slate-500">
            SELECT KINEMATIC TELEMETRY LINES TO BUILD PARLAY
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-44 overflow-y-auto">
            {legs.map((leg) => (
              <div
                key={leg.eventId}
                className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="text-white font-semibold">{leg.selection}</div>
                  <div className="text-[10px] text-slate-400">{leg.matchup}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">
                    {leg.odds > 0 ? `+${leg.odds}` : leg.odds}
                  </span>
                  <button
                    onClick={() => onRemoveLeg(leg.eventId)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <label className="text-slate-400">WAGER STAKE ($):</label>
          <input
            type="number"
            min={10}
            step={10}
            value={stake}
            onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
            className="w-24 px-2 py-1 rounded bg-slate-900 border border-emerald-500/40 text-right text-white font-bold"
          />
        </div>

        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400">COMBINED MULTIPLIER:</span>
          <span className="text-cyan-300 font-bold">
            {legs.length > 0 ? `${decimalMultiplier.toFixed(2)}x` : '0.00x'}
          </span>
        </div>

        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-slate-300">PROJECTED PAYOUT:</span>
          <span className="text-emerald-400 font-bold">
            ${estimatedPayout.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <NeonButton
          variant="emerald"
          disabled={legs.length === 0 || stake <= 0}
          onClick={handleMintTicket}
          className="w-full"
        >
          EXECUTE STAKE_ZK TICKET
        </NeonButton>

        {zkProofHash && (
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-400/40 font-mono text-[10px] text-emerald-300 break-all">
            VERIFIED PROOF: {zkProofHash}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
