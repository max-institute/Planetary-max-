import React, { useState } from 'react';
import { ChessMoveRecord } from '../../shared/types';
import { ChessCanvas3D } from './ChessCanvas3D';
import { ChessAnalysisHud } from './ChessAnalysisHud';
import { NeonButton } from '../../shared/NeonButton';

const OPENING_SYSTEMS: Record<string, { eval: number; moves: ChessMoveRecord[] }> = {
  'Ruy Lopez Closed': {
    eval: 0.42,
    moves: [
      { moveNumber: 1, white: 'e4', black: 'e5', evalScore: 0.25 },
      { moveNumber: 2, white: 'Nf3', black: 'Nc6', evalScore: 0.31 },
      { moveNumber: 3, white: 'Bb5', black: 'a6', evalScore: 0.42 },
    ],
  },
  'Sicilian Alapin': {
    eval: 0.35,
    moves: [
      { moveNumber: 1, white: 'e4', black: 'c5', evalScore: 0.22 },
      { moveNumber: 2, white: 'c3', black: 'Nf6', evalScore: 0.35 },
    ],
  },
  'Asymmetric Distortion': {
    eval: 0.68,
    moves: [
      { moveNumber: 1, white: 'd4', black: 'Nf6', evalScore: 0.28 },
      { moveNumber: 2, white: 'c4', black: 'g6', evalScore: 0.49 },
      { moveNumber: 3, white: 'Nc3', black: 'Bg7', evalScore: 0.68 },
    ],
  },
};

export const ChessArenaView: React.FC = () => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>('e4');
  const [cameraPreset, setCameraPreset] = useState<'standard' | 'top' | 'asymmetric'>('standard');
  const [opening, setOpening] = useState<string>('Ruy Lopez Closed');

  const currentSystem = OPENING_SYSTEMS[opening];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {Object.keys(OPENING_SYSTEMS).map((sys) => (
            <button
              key={sys}
              onClick={() => setOpening(sys)}
              className={`px-2.5 py-1 rounded font-mono text-xs cursor-pointer border ${
                opening === sys
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {sys}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <NeonButton size="sm" variant="ghost" onClick={() => setCameraPreset('standard')}>
            3D ORBIT
          </NeonButton>
          <NeonButton size="sm" variant="ghost" onClick={() => setCameraPreset('top')}>
            2D TOP
          </NeonButton>
          <NeonButton size="sm" variant="cyan" onClick={() => setCameraPreset('asymmetric')}>
            DISTORTION CAM
          </NeonButton>
        </div>
      </div>

      <ChessCanvas3D
        selectedSquare={selectedSquare}
        onSelectSquare={setSelectedSquare}
        cameraPreset={cameraPreset}
      />

      <ChessAnalysisHud
        systemName={opening}
        evalScore={currentSystem.eval}
        moves={currentSystem.moves}
      />
    </div>
  );
};
