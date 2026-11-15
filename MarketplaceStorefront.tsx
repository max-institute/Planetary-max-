import React, { useState } from 'react';
import { ArtAsset } from '../../shared/types';
import { GlassCard } from '../../shared/GlassCard';
import { NeonButton } from '../../shared/NeonButton';

interface MarketplaceStorefrontProps {
  asset: ArtAsset;
}

export const MarketplaceStorefront: React.FC<MarketplaceStorefrontProps> = ({ asset }) => {
  const [acquiredIds, setAcquiredIds] = useState<string[]>([]);
  const isAcquired = acquiredIds.includes(asset.id);

  const handleAcquire = () => {
    if (!isAcquired) {
      setAcquiredIds((prev) => [...prev, asset.id]);
    }
  };

  return (
    <GlassCard className="p-3.5 flex items-center justify-between gap-4">
      <div>
        <div className="text-[11px] font-mono text-slate-400">
          SOVEREIGN PROVENANCE LEDGER • {asset.collection.toUpperCase()}
        </div>
        <div className="flex items-baseline gap-3 mt-0.5">
          <span className="text-lg font-mono font-bold text-emerald-400">
            {asset.priceEth} ETH
          </span>
          <span className="text-xs font-mono text-slate-400">
            (${asset.priceUsd.toLocaleString()} USD)
          </span>
        </div>
      </div>

      <NeonButton
        variant={isAcquired ? 'emerald' : 'cyan'}
        onClick={handleAcquire}
      >
        {isAcquired ? '✓ MINTED TO MAX-SPACE' : 'ACQUIRE SOVEREIGN LICENSE'}
      </NeonButton>
    </GlassCard>
  );
};
