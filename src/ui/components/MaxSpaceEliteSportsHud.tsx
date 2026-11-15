import React, { useEffect, useRef, useState } from 'react';

interface EliteMatch {
  id: string;
  tournament: string;
  teamHome: string;
  teamAway: string;
  oddsHome: number;
  oddsAway: number;
  momentum: string;
  liveTime: string;
}

type HudTab = 'staking' | 'escrow' | 'telemetry';
type EscrowStatus = 'SECURED_DAT' | 'PENDING_SETTLEMENT' | 'SETTLED_ATOMIC';
type ActiveBet = { match: string; selection: string; stake: number; odds: number };
type EscrowVault = { id: string; asset: string; valuation: number; status: EscrowStatus };

const ELITE_MATCHES: EliteMatch[] = [
  {
    id: 'em1',
    tournament: 'MAX-SPACE CHAMPIONS LEAGUE',
    teamHome: 'Apex Titans',
    teamAway: 'Sovereign Strikers',
    oddsHome: -145,
    oddsAway: 125,
    momentum: 'Home Pressing (84% Possession)',
    liveTime: "68' // 2nd Half",
  },
  {
    id: 'em2',
    tournament: 'CYBER-GRID ELITE SERIES',
    teamHome: 'Neohaven Vipers',
    teamAway: 'Titanium Knights',
    oddsHome: -110,
    oddsAway: -110,
    momentum: 'Deadlock Formation (Balanced)',
    liveTime: "34' // 1st Half",
  },
  {
    id: 'em3',
    tournament: 'QUANTUM HOOPS INVITATIONAL',
    teamHome: 'Matrix Ballers',
    teamAway: 'Quantum Surge',
    oddsHome: 180,
    oddsAway: -210,
    momentum: 'Tip-off Countdown Active',
    liveTime: 'UPCOMING',
  },
];

const INITIAL_BETS: ActiveBet[] = [
  { match: 'Apex Titans vs Sovereign Strikers', selection: 'Apex Titans (-145)', stake: 500, odds: -145 },
];

const INITIAL_VAULTS: EscrowVault[] = [
  { id: 'v1', asset: 'Quantum Sovereign Canvas #07', valuation: 12500, status: 'SECURED_DAT' },
  { id: 'v2', asset: 'Titanium Chess Arena Stakes', valuation: 8400, status: 'PENDING_SETTLEMENT' },
];

const formatOdds = (odds: number) => (odds > 0 ? `+${odds}` : `${odds}`);

export function MaxSpaceEliteSportsHud() {
  const [activeTab, setActiveTab] = useState<HudTab>('staking');
  const [stakeAmount, setStakeAmount] = useState('500');
  const [activeBets, setActiveBets] = useState<ActiveBet[]>(INITIAL_BETS);
  const [escrowVaults, setEscrowVaults] = useState<EscrowVault[]>(INITIAL_VAULTS);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 4000);
  };

  const placeEliteWager = (match: EliteMatch, team: string, odds: number) => {
    const stake = Number(stakeAmount);
    if (!Number.isFinite(stake) || stake <= 0) {
      showToast('Enter a wager stake greater than $0 USD.');
      return;
    }

    setActiveBets((current) => [
      ...current,
      {
        match: `${match.teamHome} vs ${match.teamAway}`,
        selection: `${team} (${formatOdds(odds)})`,
        stake,
        odds,
      },
    ]);
    showToast(`Elite wager locked: $${stake.toLocaleString()} USD on ${team}.`);
  };

  const settleVault = (id: string, asset: string) => {
    setEscrowVaults((current) => current.map((vault) =>
      vault.id === id ? { ...vault, status: 'SETTLED_ATOMIC' } : vault,
    ));
    showToast(`DAT Escrow settled atomically for ${asset}. Ledger updated.`);
  };

  const tabs: { id: HudTab; label: string }[] = [
    { id: 'staking', label: 'Elite Staking' },
    { id: 'escrow', label: 'DAT Escrow Vault' },
    { id: 'telemetry', label: 'Kinematic Stream' },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col space-y-6 overflow-y-auto bg-[#070709] p-4 font-sans text-white sm:p-6 lg:p-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/[0.08] pb-5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
            <h2 className="text-xl font-bold tracking-wide text-zinc-100">MAX-SPACE // Elite Sports &amp; Escrow HUD</h2>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-400">High-Frequency Kinematic Telemetry, Sovereign Staking &amp; DAT Settlement</p>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Elite sports HUD sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`elite-hud-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`elite-hud-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl border px-4 py-2 font-mono text-xs transition-all ${activeTab === tab.id
                ? 'border-indigo-500/50 bg-indigo-600/30 text-white shadow-lg'
                : 'border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-3.5 font-mono text-xs text-indigo-300 shadow-2xl backdrop-blur-xl">
          <span>{toast}</span>
          <span className="ml-4 shrink-0 text-[10px] font-bold opacity-75">DAT-SOVEREIGN SECURED</span>
        </div>
      )}

      {activeTab === 'staking' && (
        <div id="elite-hud-panel-staking" role="tabpanel" aria-labelledby="elite-hud-tab-staking" className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Active Elite Matchups ({ELITE_MATCHES.length})</span>
              <span className="animate-pulse font-mono text-xs text-emerald-400">● Live Telemetry Synced</span>
            </div>

            <div className="space-y-4">
              {ELITE_MATCHES.map((match) => (
                <article key={match.id} className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#0e0e12]/90 p-5 shadow-2xl backdrop-blur-xl transition-all hover:border-indigo-500/40 sm:p-6">
                  <div className="flex items-center justify-between gap-3 font-mono text-xs">
                    <span className="font-bold text-indigo-400">{match.tournament}</span>
                    <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400">{match.liveTime}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-2">
                    <div className="text-sm font-semibold text-white sm:text-base">{match.teamHome}</div>
                    <div className="font-mono text-xs font-bold text-zinc-500">VS</div>
                    <div className="text-right text-sm font-semibold text-white sm:text-base">{match.teamAway}</div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.04] bg-black/40 px-4 py-2.5 font-mono text-xs">
                    <span className="text-zinc-400">Kinematic Momentum:</span>
                    <span className="font-bold text-cyan-400">{match.momentum}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t border-white/[0.06] pt-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => placeEliteWager(match, match.teamHome, match.oddsHome)}
                      className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/50 p-3.5 font-mono text-xs transition-all hover:border-indigo-500/40 hover:bg-indigo-600/20"
                    >
                      <span className="text-zinc-300 group-hover:text-white">{match.teamHome}</span>
                      <span className="font-bold text-emerald-400">{formatOdds(match.oddsHome)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => placeEliteWager(match, match.teamAway, match.oddsAway)}
                      className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/50 p-3.5 font-mono text-xs transition-all hover:border-indigo-500/40 hover:bg-indigo-600/20"
                    >
                      <span className="text-zinc-300 group-hover:text-white">{match.teamAway}</span>
                      <span className="font-bold text-emerald-400">{formatOdds(match.oddsAway)}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0e0e12]/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <h3 className="text-sm font-semibold text-white">Elite Sovereign Bettor Slip</h3>
            <div className="space-y-2">
              <label htmlFor="elite-stake-amount" className="font-mono text-[11px] uppercase text-zinc-400">Default Stake (USD)</label>
              <input
                id="elite-stake-amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={stakeAmount}
                onChange={(event) => setStakeAmount(event.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-black/60 px-3.5 py-3 font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto border-t border-white/[0.06] pt-4">
              {activeBets.length === 0 ? (
                <p className="py-8 text-center font-mono text-xs text-zinc-500">[No active elite wagers]</p>
              ) : activeBets.map((bet, index) => (
                <div key={`${bet.match}-${bet.selection}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/50 p-3.5 font-mono text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-200">{bet.selection}</div>
                    <div className="mt-0.5 text-[10px] text-zinc-400">${bet.stake.toLocaleString()} • {bet.match}</div>
                  </div>
                  <span className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">LOCKED</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'escrow' && (
        <section id="elite-hud-panel-escrow" role="tabpanel" aria-labelledby="elite-hud-tab-escrow" className="space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">DAT Atomic Escrow Vaults &amp; Asset Provenance</span>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {escrowVaults.map((vault) => (
              <article key={vault.id} className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/[0.08] bg-[#0e0e12]/90 p-5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:p-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">{vault.asset}</h4>
                  <p className="font-mono text-xs font-bold text-indigo-400">${vault.valuation.toLocaleString()} USD</p>
                  <span className={`inline-block rounded-lg px-2.5 py-1 font-mono text-[10px] ${vault.status === 'SETTLED_ATOMIC'
                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    : 'border border-amber-500/20 bg-amber-500/10 text-amber-400'}`}>
                    {vault.status}
                  </span>
                </div>
                {vault.status !== 'SETTLED_ATOMIC' && (
                  <button
                    type="button"
                    onClick={() => settleVault(vault.id, vault.asset)}
                    className="rounded-xl bg-indigo-600 px-5 py-3 font-mono text-xs tracking-wider text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500"
                  >
                    SETTLE ESCROW
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'telemetry' && (
        <section id="elite-hud-panel-telemetry" role="tabpanel" aria-labelledby="elite-hud-tab-telemetry" className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-white/[0.08] bg-[#0e0e12]/90 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">MAX-SPACE // Real-Time Kinematic Telemetry Engine</h3>
            <p className="font-mono text-xs text-zinc-400">Active Edge Mesh Latency: <span className="font-bold text-emerald-400">0.4ms</span></p>
          </div>
          <div className="flex w-full max-w-md flex-col items-center justify-center space-y-3 rounded-2xl border border-indigo-500/40 bg-black/80 p-6 font-mono text-xs text-indigo-300 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
            <span className="animate-pulse">● Cognitive Node Stream Synchronized</span>
            <span className="text-[11px] text-zinc-400">All wagering slips and escrow transactions secured by D1 atomic ledgers.</span>
          </div>
        </section>
      )}
    </div>
  );
}

export default MaxSpaceEliteSportsHud;
