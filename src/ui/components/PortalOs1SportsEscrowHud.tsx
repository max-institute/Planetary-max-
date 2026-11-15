import React, { useEffect, useRef, useState } from 'react';

type Tab = 'sports' | 'escrow' | 'chess';
type EscrowStatus = 'SECURED' | 'PENDING_DAT' | 'SETTLED';
type Wager = { match: string; selection: string; stake: number; status: 'LOCKED' };
type EscrowAsset = { id: string; name: string; amount: number; status: EscrowStatus };

export function PortalOs1SportsEscrowHud() {
  const [activeTab, setActiveTab] = useState<Tab>('sports');
  const [stakeAmount, setStakeAmount] = useState('250');
  const [escrowAssets, setEscrowAssets] = useState<EscrowAsset[]>([
    { id: 'esc-1', name: 'Descent to Abyss Quantum Canvas', amount: 1250, status: 'SECURED' },
    { id: 'esc-2', name: 'Titanium Sovereign Artifact #01', amount: 2400, status: 'PENDING_DAT' },
  ]);
  const [wagers, setWagers] = useState<Wager[]>([
    { match: 'Apex Titans vs Sovereign Strikers', selection: 'Apex Titans (-145)', stake: 250, status: 'LOCKED' },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const placeWager = (team: string, odds: string) => {
    const stake = Number(stakeAmount);
    if (!Number.isFinite(stake) || stake <= 0) {
      showToast('Enter a wager stake greater than $0 USD.');
      return;
    }

    setWagers((current) => [
      ...current,
      {
        match: 'Cyber-Grid Arena: Vipers vs Knights',
        selection: `${team} (${odds})`,
        stake,
        status: 'LOCKED',
      },
    ]);
    showToast(`Sovereign wager successfully locked on ${team} for $${stake} USD.`);
  };

  const settleEscrow = (id: string, name: string) => {
    setEscrowAssets((current) => current.map((item) =>
      item.id === id ? { ...item, status: 'SETTLED' } : item,
    ));
    showToast(`DAT atomic escrow settled for ${name}. Ledger updated.`);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col space-y-6 overflow-y-auto bg-[#070709] p-4 text-white sm:p-6 font-sans">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/[0.08] pb-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-wide">Portal-OS1 // Sports Stakes &amp; Escrow HUD</h2>
          <p className="mt-1 font-mono text-xs text-zinc-400">MAX-SOVEREIGN Native Economic Ledger &amp; Predictive Telemetry</p>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="HUD sections">
          {([
            { id: 'sports', label: 'Sports & Stakes' },
            { id: 'escrow', label: 'Art Escrow' },
            { id: 'chess', label: 'Chess Stakes' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg border px-4 py-1.5 font-mono text-xs transition-all ${activeTab === tab.id
                ? 'border-indigo-500/50 bg-indigo-600/30 text-white shadow-lg'
                : 'border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div role="status" className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 font-mono text-xs text-indigo-300 shadow-xl">
          <span>{toast}</span>
          <span className="ml-4 shrink-0 text-[10px] opacity-60">DAT-JURREAUISM-v1</span>
        </div>
      )}

      {activeTab === 'sports' && (
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Live Kinematic Matchups &amp; Betting Matrix</span>
            <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#0e0e12]/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-indigo-400">CYBER-GRID ARENA LEAGUE</span>
                <span className="animate-pulse rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">LIVE</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-semibold text-white">Neohaven Vipers</span>
                <span className="font-mono text-xs text-zinc-500">VS</span>
                <span className="text-sm font-semibold text-white">Titanium Knights</span>
              </div>
              <div className="grid grid-cols-1 gap-3 border-t border-white/[0.06] pt-2 sm:grid-cols-2">
                {[
                  { team: 'Neohaven Vipers', odds: '-110' },
                  { team: 'Titanium Knights', odds: '-110' },
                ].map(({ team, odds }) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => placeWager(team, odds)}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/50 p-3 font-mono text-xs transition-all hover:border-indigo-500/40 hover:bg-indigo-600/20"
                  >
                    <span className="text-zinc-300">{team}</span>
                    <span className="font-bold text-emerald-400">{odds}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#0e0e12]/90 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white">Sovereign Bettor Slip</h3>
            <div className="space-y-2">
              <label htmlFor="wager-stake" className="font-mono text-[11px] text-zinc-400">Wager Stake (USD)</label>
              <input
                id="wager-stake"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={stakeAmount}
                onChange={(event) => setStakeAmount(event.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-black/60 px-3 py-2 font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="max-h-56 space-y-3 overflow-y-auto border-t border-white/[0.06] pt-4">
              {wagers.map((wager, index) => (
                <div key={`${wager.match}-${wager.selection}-${index}`} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/50 p-3 font-mono text-xs">
                  <div>
                    <div className="font-bold text-zinc-200">{wager.selection}</div>
                    <div className="text-[10px] text-zinc-400">${wager.stake.toLocaleString()} • {wager.match}</div>
                  </div>
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{wager.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'escrow' && (
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">DAT Escrow &amp; Art Ownership Ledger</span>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {escrowAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0e0e12]/90 p-5 shadow-2xl backdrop-blur-xl">
                <div>
                  <h4 className="text-sm font-semibold text-white">{asset.name}</h4>
                  <p className="mt-1 font-mono text-xs font-bold text-indigo-400">${asset.amount.toLocaleString()} USD</p>
                  <span className={`mt-2 inline-block rounded px-2 py-0.5 font-mono text-[10px] ${asset.status === 'SETTLED'
                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    : 'border border-amber-500/20 bg-amber-500/10 text-amber-400'}`}>
                    {asset.status}
                  </span>
                </div>
                {asset.status !== 'SETTLED' && (
                  <button
                    type="button"
                    onClick={() => settleEscrow(asset.id, asset.name)}
                    className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 font-mono text-xs tracking-wider text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500"
                  >
                    SETTLE ESCROW
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chess' && (
        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-white/[0.08] bg-[#0e0e12]/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">MAX Chess Arena // Sovereign Stake Pool</h3>
            <p className="font-mono text-xs text-zinc-400">Active Match Staked Pool: <span className="font-bold text-emerald-400">$1,000 USD</span></p>
          </div>
          <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-xl border border-indigo-500/40 bg-black/80 font-mono text-xs text-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            [Stockfish 17 Engine &amp; Move Stake Locked]
          </div>
        </div>
      )}
    </div>
  );
}

export default PortalOs1SportsEscrowHud;
