import React, { useState } from 'react';
import GalleryPage from './pages/GalleryPage';
import ChessPage from './pages/ChessPage';
import SportsPage from './pages/SportsPage';
import MaxChessArenaPage from '../pages/MaxChessArenaPage';

type Tab = 'gallery' | 'chess' | 'sports';

const tabs: { id: Tab; label: string }[] = [
  { id: 'gallery', label: 'Art Showroom & Store' },
  { id: 'chess', label: '3D Chess Arena' },
  { id: 'sports', label: 'Sports & Telemetry HUD' },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('gallery');

  return (
    <div className="relative flex h-screen min-h-[480px] w-screen flex-col overflow-hidden bg-[#070709] font-sans text-[#f4f4f6]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-56 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-64 -right-24 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px]" />

      <header className="relative z-30 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0e0e12]/90 px-4 py-2 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
          <span className="text-xs font-bold tracking-widest text-zinc-200">MAX-SPACE // Portal-OS1</span>
          <span className="hidden rounded border border-indigo-500/20 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-indigo-300 sm:inline">DAT-JURREAUISM-v1</span>
        </div>

        <nav aria-label="MAX-SPACE sections" className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto sm:gap-2">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-current={currentTab === id ? 'page' : undefined}
              onClick={() => setCurrentTab(id)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:px-4 ${currentTab === id ? 'border-indigo-500/40 bg-indigo-600/30 text-white shadow-inner' : 'border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 font-mono text-[10px] text-zinc-400 md:flex">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>PORTAL READY</span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 items-stretch justify-center overflow-hidden p-2 sm:p-4 md:p-6">
        <div className="flex h-full w-full max-w-7xl flex-col overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0e0e12]/80 shadow-2xl backdrop-blur-2xl sm:rounded-2xl">
          {currentTab === 'gallery' && <GalleryPage />}
          {currentTab === 'chess' && (
            <>
              <ChessPage />
              <div className="border-t border-white/[0.08] p-2 sm:p-4">
                <MaxChessArenaPage />
              </div>
            </>
          )}
          {currentTab === 'sports' && <SportsPage />}
        </div>
      </main>
    </div>
  );
}
