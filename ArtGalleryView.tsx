import React, { useState } from 'react';
import { ArtAsset } from '../../shared/types';
import { CanvasWorkstation } from './CanvasWorkstation';
import { MarketplaceStorefront } from './MarketplaceStorefront';

const CATALOG: ArtAsset[] = [
  {
    id: 'art-01',
    title: 'Crown of Return // Manifold I',
    collection: 'Jurreauism',
    signature: 'MaxJ',
    watermarkTag: 'DAT-JURREAUISM-v1 #001',
    priceEth: 1.45,
    priceUsd: 4640,
    resolution: '8192 × 8192 RAW',
    layers: ['Base Substrate', 'Geometric Distortion', 'Vimarsha Luminance'],
    previewGradient: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #0e7490 100%)',
  },
  {
    id: 'art-02',
    title: 'The Distortion Principle IV',
    collection: 'Abyssal',
    signature: 'MaxJ',
    watermarkTag: 'DAT-JURREAUISM-v1 #004',
    priceEth: 2.1,
    priceUsd: 6720,
    resolution: '8192 × 8192 RAW',
    layers: ['Base Substrate', 'Geometric Distortion', 'Vimarsha Luminance'],
    previewGradient: 'linear-gradient(135deg, #090d16 0%, #311042 55%, #be185d 100%)',
  },
  {
    id: 'art-03',
    title: 'Light Like: Vimarsha',
    collection: 'Sovereign',
    signature: 'MaxJ',
    watermarkTag: 'DAT-JURREAUISM-v1 #009',
    priceEth: 1.85,
    priceUsd: 5920,
    resolution: '7680 × 4320 16-BIT',
    layers: ['Base Substrate', 'Geometric Distortion', 'Vimarsha Luminance'],
    previewGradient: 'linear-gradient(135deg, #042f2e 0%, #115e59 50%, #4338ca 100%)',
  },
];

export const ArtGalleryView: React.FC = () => {
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<ArtAsset>(CATALOG[0]);

  const filtered =
    filter === 'ALL'
      ? CATALOG
      : CATALOG.filter((item) => item.collection.toUpperCase() === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {['ALL', 'JURREAUISM', 'ABYSSAL', 'SOVEREIGN'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded font-mono text-xs cursor-pointer border transition-all ${
                filter === cat
                  ? 'bg-violet-500/25 border-violet-400 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-violet-300">
          ARTIST SIGNATURE: MaxJ
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedAsset(item)}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              selectedAsset.id === item.id
                ? 'bg-violet-950/50 border-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.25)]'
                : 'bg-slate-900/50 border-white/10 hover:border-white/25'
            }`}
          >
            <div
              className="h-12 rounded mb-2"
              style={{ background: item.previewGradient }}
            />
            <div className="font-mono text-xs font-semibold text-white truncate">
              {item.title}
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              {item.priceEth} ETH • {item.signature}
            </div>
          </button>
        ))}
      </div>

      <CanvasWorkstation asset={selectedAsset} />
      <MarketplaceStorefront asset={selectedAsset} />
    </div>
  );
};
