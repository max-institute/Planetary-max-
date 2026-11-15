import React, { useState } from 'react';
import { WindowId, WindowState } from '../shared/types';
import { SystemTelemetryBar } from './SystemTelemetryBar';
import { WindowFrame } from './WindowFrame';
import { ArtGalleryView } from '../modules/art/ArtGalleryView';
import { ChessArenaView } from '../modules/chess/ChessArenaView';
import { SportsPredictiveView } from '../modules/sports/SportsPredictiveView';

const INITIAL_WINDOWS: Record<WindowId, WindowState> = {
  art: {
    id: 'art',
    title: 'MAX-ART // CREATORS STUDIO & JURREAUISM',
    isOpen: true,
    isMinimized: false,
    zIndex: 10,
    position: { x: 24, y: 64 },
    size: { width: 640, height: 540 },
  },
  chess: {
    id: 'chess',
    title: 'MAX CHESS 3D // 64-SQUARE SOVEREIGN ARENA',
    isOpen: true,
    isMinimized: false,
    zIndex: 12,
    position: { x: 684, y: 64 },
    size: { width: 660, height: 540 },
  },
  sports: {
    id: 'sports',
    title: 'MAX-SPORTS // PREDICTIVE KINEMATIC HUD',
    isOpen: false,
    isMinimized: false,
    zIndex: 11,
    position: { x: 180, y: 110 },
    size: { width: 880, height: 560 },
  },
  telemetry: {
    id: 'telemetry',
    title: 'BEMAX MESH // EDGE TELEMETRY',
    isOpen: false,
    isMinimized: false,
    zIndex: 9,
    position: { x: 240, y: 140 },
    size: { width: 600, height: 420 },
  },
};

export const PortalOS1Layout: React.FC = () => {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(INITIAL_WINDOWS);
  const [topZ, setTopZ] = useState<number>(20);

  const focusWindow = (id: WindowId) => {
    setTopZ((prev) => prev + 1);
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], zIndex: topZ + 1, isMinimized: false, isOpen: true },
    }));
  };

  const toggleWindow = (id: WindowId) => {
    setWindows((prev) => {
      const target = prev[id];
      if (!target.isOpen || target.isMinimized) {
        setTopZ((z) => z + 1);
        return {
          ...prev,
          [id]: { ...target, isOpen: true, isMinimized: false, zIndex: topZ + 1 },
        };
      }
      return {
        ...prev,
        [id]: { ...target, isMinimized: true },
      };
    });
  };

  const closeWindow = (id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  };

  const minimizeWindow = (id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true },
    }));
  };

  const moveWindow = (id: WindowId, x: number, y: number) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], position: { x, y } },
    }));
  };

  const resizeWindow = (id: WindowId, width: number, height: number) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], size: { width, height } },
    }));
  };

  const activeMap: Record<WindowId, boolean> = {
    art: windows.art.isOpen && !windows.art.isMinimized,
    chess: windows.chess.isOpen && !windows.chess.isMinimized,
    sports: windows.sports.isOpen && !windows.sports.isMinimized,
    telemetry: windows.telemetry.isOpen && !windows.telemetry.isMinimized,
  };

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-[#04070f] text-slate-100 relative flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.18), transparent 55%), linear-gradient(to right, rgba(30, 41, 59, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.4) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 44px 44px, 44px 44px',
        }}
      />

      <SystemTelemetryBar onToggleWindow={toggleWindow} activeWindows={activeMap} />

      <main className="flex-1 relative">
        <WindowFrame
          windowState={windows.art}
          onFocus={() => focusWindow('art')}
          onClose={() => closeWindow('art')}
          onMinimize={() => minimizeWindow('art')}
          onMove={(x, y) => moveWindow('art', x, y)}
          onResize={(w, h) => resizeWindow('art', w, h)}
        >
          <ArtGalleryView />
        </WindowFrame>

        <WindowFrame
          windowState={windows.chess}
          onFocus={() => focusWindow('chess')}
          onClose={() => closeWindow('chess')}
          onMinimize={() => minimizeWindow('chess')}
          onMove={(x, y) => moveWindow('chess', x, y)}
          onResize={(w, h) => resizeWindow('chess', w, h)}
        >
          <ChessArenaView />
        </WindowFrame>

        <WindowFrame
          windowState={windows.sports}
          onFocus={() => focusWindow('sports')}
          onClose={() => closeWindow('sports')}
          onMinimize={() => minimizeWindow('sports')}
          onMove={(x, y) => moveWindow('sports', x, y)}
          onResize={(w, h) => resizeWindow('sports', w, h)}
        >
          <SportsPredictiveView />
        </WindowFrame>
      </main>
    </div>
  );
};
