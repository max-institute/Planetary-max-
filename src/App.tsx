import React, { useEffect, useState } from 'react';
import { ApiClient, type InventoryItem } from './services/api';

type Tab = 'gallery' | 'chess' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('gallery');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    ApiClient.getInventory()
      .then((items) => {
        if (!cancelled) setInventory(items);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Unable to load inventory.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#070709] font-sans text-[#f4f4f6]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 right-0 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px]" />

      <header className="z-30 flex min-h-14 flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] bg-[#0e0e12]/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <span className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-200">MAX-SPACE // Portal-OS1</span>
          <span className="rounded border border-indigo-500/20 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-indigo-400">DAT-JURREAUISM-v1</span>
        </div>

        <nav aria-label="Main navigation" className="flex flex-wrap gap-2">
          {([
            ['gallery', 'Art & Storefront'],
            ['chess', '3D Chess Arena'],
            ['admin', 'Governor Control Plane'],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              aria-current={activeTab === tab ? 'page' : undefined}
              onClick={() => setActiveTab(tab)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === tab ? 'border border-white/10 bg-white/10 text-white shadow-inner' : 'text-zinc-400 hover:bg-white/[0.03] hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span>EDGE: ONLINE</span>
        </div>
      </header>

      <main className="z-10 flex flex-1 items-center justify-center overflow-y-auto p-4 sm:p-6">
        {activeTab === 'gallery' && (
          <section aria-labelledby="gallery-title" className="glass-panel flex h-[min(85vh,850px)] w-full max-w-6xl flex-col rounded-xl p-5 shadow-2xl sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div>
                <h1 id="gallery-title" className="text-lg font-semibold tracking-wide text-white">Sovereign Art Gallery & DAT Marketplace</h1>
                <p className="mt-1 font-mono text-xs text-zinc-400">Live D1 database ledger sync</p>
              </div>
              <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 font-mono text-xs text-indigo-300">{inventory.length} Assets Listed</span>
            </div>

            <div className="grid flex-1 auto-rows-max grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading && <p role="status" className="col-span-full py-12 text-center font-mono text-zinc-500">Synchronizing with edge ledger...</p>}
              {!loading && error && <p role="alert" className="col-span-full py-12 text-center font-mono text-rose-400">Error: {error}</p>}
              {!loading && !error && inventory.length === 0 && <p className="col-span-full py-12 text-center font-mono text-zinc-500">No inventory records found in the D1 ledger.</p>}
              {!loading && !error && inventory.map((item) => (
                <article key={item.id} className="flex flex-col justify-between space-y-3 rounded-lg border border-white/[0.06] bg-black/40 p-4">
                  <div className="flex h-40 items-center justify-center rounded border border-white/[0.04] bg-zinc-900/80 font-mono text-xs text-zinc-500">[{item.category.toUpperCase()}]</div>
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-200">{item.name}</h2>
                    <p className="mt-1 font-mono text-xs text-indigo-400">{item.price.toLocaleString()} ZK</p>
                    <p className="mt-1 font-mono text-[10px] uppercase text-zinc-500">{item.status}</p>
                  </div>
                  <button type="button" disabled={item.status !== 'active'} className="w-full rounded border border-indigo-500/40 bg-indigo-600/30 py-2 font-mono text-xs tracking-wider text-indigo-200 transition-colors hover:bg-indigo-600/50 disabled:cursor-not-allowed disabled:opacity-50">
                    {item.status === 'active' ? 'VIEW ASSET' : item.status.toUpperCase()}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'chess' && (
          <section aria-labelledby="chess-title" className="glass-panel flex h-[min(85vh,850px)] w-full max-w-6xl flex-col rounded-xl p-5 shadow-2xl sm:p-6">
            <div className="mb-6 border-b border-white/[0.06] pb-4">
              <h1 id="chess-title" className="text-lg font-semibold tracking-wide text-white">MAX Chess Arena // Asymmetric Distortion Engine</h1>
              <p className="mt-1 font-mono text-xs text-zinc-400">Stockfish edge telemetry & WebSocket link</p>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-white/[0.04] bg-black/40 font-mono text-xs text-zinc-400">3D spatial chessboard viewport</div>
          </section>
        )}

        {activeTab === 'admin' && (
          <section aria-labelledby="admin-title" className="glass-panel w-full max-w-6xl rounded-xl p-5 shadow-2xl sm:p-6">
            <div className="mb-6 border-b border-white/[0.06] pb-4">
              <h1 id="admin-title" className="text-lg font-semibold tracking-wide text-white">Governor Control Plane & D1 Ledger</h1>
              <p className="mt-1 font-mono text-xs text-zinc-400">Administrative API operations require the configured passkey.</p>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex flex-wrap justify-between gap-2 rounded border border-white/[0.06] bg-black/40 p-4">
                <span className="text-zinc-400">Database binding</span>
                <span className="text-emerald-400">D1 // configured by Worker</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 rounded border border-white/[0.06] bg-black/40 p-4">
                <span className="text-zinc-400">Inventory records loaded</span>
                <span className="text-indigo-400">{inventory.length}</span>
              </div>
              <p className="text-zinc-500">Inventory creation is not exposed here; the current Worker provides a public inventory read and a separate purchase route.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
