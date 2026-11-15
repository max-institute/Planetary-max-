export type WindowId = 'art' | 'chess' | 'sports' | 'telemetry';

export interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface TelemetrySnapshot {
  protocol: string;
  nodeCount: number;
  latencyMs: number;
  wasmBufferKb: number;
  netSurplusUsd: number;
  computeLoadPct: number;
}

export interface ArtAsset {
  id: string;
  title: string;
  collection: 'Jurreauism' | 'Abyssal' | 'Sovereign' | 'Vector-Void';
  signature: 'MaxJ';
  watermarkTag: string;
  priceEth: number;
  priceUsd: number;
  resolution: string;
  layers: string[];
  previewGradient: string;
}

export interface ChessMoveRecord {
  moveNumber: number;
  white: string;
  black?: string;
  evalScore: number;
}

export interface SportMarketEvent {
  id: string;
  sport: 'NBA' | 'UFC' | 'NFL' | 'F1';
  matchup: string;
  selection: string;
  odds: number;
  delta: number;
  kinematicVelocity: string;
  winProbability: number;
}

export interface ParlayLeg {
  eventId: string;
  matchup: string;
  selection: string;
  odds: number;
}
