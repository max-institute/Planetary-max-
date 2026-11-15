import React, { useState } from 'react';
import { ArtAsset } from '../../shared/types';
import { GlassCard } from '../../shared/GlassCard';
import { NeonButton } from '../../shared/NeonButton';

interface CanvasWorkstationProps {
  asset: ArtAsset;
}

export const CanvasWorkstation: React.FC<CanvasWorkstationProps> = ({ asset }) => {
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    'Base Substrate': true,
    'Geometric Distortion': true,
    'Vimarsha Luminance': true,
  });
  const [showWatermark, setShowWatermark] = useState(true);

  const toggleLayer = (layer: string) => {
    setVisibleLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <GlassCard glowColor="violet" className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400">
            MULTI-LAYER WORKSTATION // {asset.resolution}
          </span>
          <h3 className="text-base font-bold text-white">{asset.title}</h3>
        </div>
        <NeonButton
          size="sm"
          variant="cyan"
          onClick={() => setShowWatermark((prev) => !prev)}
        >
          {showWatermark ? 'PROVENANCE: ON' : 'PROVENANCE: OFF'}
        </NeonButton>
      </div>

      <div
        className="relative h-56 rounded-lg overflow-hidden border border-white/15 flex items-center justify-center"
        style={{ background: asset.previewGradient }}
      >
        {visibleLayers['Geometric Distortion'] && (
          <div className="w-40 h-40 border-2 border-cyan-300/60 rotate-45 animate-spin [animation-duration:28s] flex items-center justify-center">
            <div className="w-24 h-24 border border-violet-300/80 -rotate-45" />
          </div>
        )}

        {visibleLayers['Vimarsha Luminance'] && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_65%)] pointer-events-none" />
        )}

        {showWatermark && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded bg-slate-950/85 border border-violet-400/50 backdrop-blur-md text-right">
            <div className="font-mono text-xs font-bold text-violet-300 tracking-wider">
              Signed: {asset.signature}
            </div>
            <div className="font-mono text-[10px] text-cyan-300">
              {asset.watermarkTag} • DAT
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {asset.layers.map((layer) => {
          const active = visibleLayers[layer] ?? true;
          return (
            <button
              key={layer}
              onClick={() => toggleLayer(layer)}
              className={`px-2.5 py-1 rounded text-xs font-mono border cursor-pointer transition-colors ${
                active
                  ? 'bg-violet-500/20 border-violet-400/50 text-violet-200'
                  : 'bg-white/5 border-white/10 text-slate-500'
              }`}
            >
              {active ? '◉' : '○'} {layer}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};
