import React, { useEffect, useState } from 'react';
import { TelemetrySnapshot, WindowId } from '../shared/types';

interface SystemTelemetryBarProps {
  onToggleWindow: (id: WindowId) => void;
  activeWindows: Record<WindowId, boolean>;
}

export const SystemTelemetryBar: React.FC<SystemTelemetryBarProps> = ({
  onToggleWindow,
  activeWindows,
}) => {
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>({
    protocol: 'DAT-JURREAUISM-v1',
    nodeCount: 4,
    latencyMs: 0.14,
    wasmBufferKb: 14.8,
    netSurplusUsd: 11400,
    computeLoadPct: 24.6,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        latencyMs: Number((0.11 + Math.random() * 0.08).toFixed(2)),
        computeLoadPct: Number((22 + Math.random() * 8).toFixed(1)),
      }));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: WindowId; label: string; accent: string }[] = [
    { id: 'art', label: 'MAX-ART STUDIO', accent: 'text-violet-400' },
    { id: 'chess', label: 'MAX CHESS 3D', accent: 'text-cyan-400' },
    { id: 'sports', label: 'MAX-SPORTS HUD', accent: 'text-emerald-400' },
  ];

  return (
    <header className="h-12 px-4 bg-slate-950/85 backdrop-blur-2xl border-b border-cyan-500/20 flex items-center justify-between select-none z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
          <span className="font-mono font-bold tracking-widest text-sm text-white">
            PORTAL-OS1
          </span>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 rounded">
          {telemetry.protocol}
        </span>
        <span className="hidden md:inline-block text-[11px] font-mono text-slate-400">
          DAT // Done All To That
        </span>
      </div>

      <nav className="flex items-center gap-2">
        {navItems.map((item) => {
          const active = activeWindows[item.id];
          return (
            <button
              key={item.id}
              onClick={() => onToggleWindow(item.id)}
              className={`px-3 py-1 rounded-md font-mono text-xs transition-all cursor-pointer border ${
                active
                  ? 'bg-white/10 border-cyan-400/50 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                  : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`mr-1.5 ${item.accent}`}>●</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="hidden lg:flex items-center gap-5 font-mono text-xs text-slate-300">
        <div>
          <span className="text-slate-500 mr-1">MESH:</span>
          <span className="text-emerald-400">{telemetry.nodeCount} NODES</span>
        </div>
        <div>
          <span className="text-slate-500 mr-1">LATENCY:</span>
          <span className="text-cyan-300">{telemetry.latencyMs}ms</span>
        </div>
        <div>
          <span className="text-slate-500 mr-1">WASM:</span>
          <span className="text-violet-300">{telemetry.wasmBufferKb}KB</span>
        </div>
        <div>
          <span className="text-slate-500 mr-1">SURPLUS:</span>
          <span className="text-emerald-400 font-semibold">
            ${telemetry.netSurplusUsd.toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
};
