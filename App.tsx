import React, { useState } from 'react';
import { MaxArtPage } from './pages/MaxArtPage';
import { MaxSpaceEliteSportsHud } from './src/ui/components/MaxSpaceEliteSportsHud';

export default function App() {
  const [currentView, setCurrentView] = useState<'art' | 'space'>('art');

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#070709] font-sans text-[#f4f4f6]">
      {/* Ambient Background Glows */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px]" />

      {/* Sovereign Header with View Switcher */}
      <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0e0e12]/90 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="h-3 w-3 animate-pulse rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
          <span className="text-xs font-bold tracking-widest text-zinc-200">MAX-SPACE // Portal-OS1</span>
          <span className="hidden rounded-lg border border-indigo-500/20 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] text-indigo-400 sm:inline">DAT-JURREAUISM-v1</span>
        </div>

        {/* Navigation View Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('art')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all border ${
              currentView === 'art'
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10'
                : 'bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
            }`}
          >
            MAX-ART
          </button>
          <button
            onClick={() => setCurrentView('space')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all border ${
              currentView === 'space'
                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10'
                : 'bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
            }`}
          >
            MAX-SPACE
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 font-mono text-xs text-zinc-400">
          <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span>MAX-SOVEREIGN: ONLINE</span>
        </div>
      </header>

      {/* Main Dynamic Viewport */}
      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2 sm:p-4 md:p-6">
        <div className="flex h-full max-h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0e12]/80 shadow-2xl backdrop-blur-2xl sm:rounded-2xl">
          {currentView === 'art' && <MaxArtPage />}
          {currentView === 'space' && <MaxSpaceEliteSportsHud />}
        </div>
      </main>
    </div>
  );
}
