import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SportsTelemetryForm } from '../components/SportsTelemetryForm';

const leagues = ['NFL', 'NBA', 'MLB', 'SOCCER', 'MMA'] as const;
type League = (typeof leagues)[number];

interface TelemetryItem {
  event_id: string;
  league: League;
  matchup: string;
  oracle_consensus: {
    predictedWinner?: string;
    confidenceScore?: number;
    dataSourcesCount?: number;
  };
  updated_at: string;
}

const panelStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(20,20,28,.96), rgba(11,11,15,.96))',
  border: '1px solid rgba(255,255,255,.09)',
  borderRadius: '14px',
};

export default function SportsPage() {
  const [activeLeague, setActiveLeague] = useState<League>('NFL');
  const [telemetry, setTelemetry] = useState<TelemetryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const loadTelemetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/v1/dat/sports/list');
      const data = await response.json() as { success?: boolean; telemetry?: TelemetryItem[]; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to load sports telemetry.');
      setTelemetry(Array.isArray(data.telemetry) ? data.telemetry : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load sports telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTelemetry(); }, [loadTelemetry]);

  const leagueTelemetry = useMemo(
    () => telemetry.filter((item) => item.league === activeLeague),
    [telemetry, activeLeague],
  );

  const toggleWatchlist = (eventId: string) => {
    setWatchlist((current) => current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [...current, eventId]);
  };

  return (
    <main style={{ minHeight: '100%', padding: 'clamp(1rem, 4vw, 2.5rem)', background: '#070709', color: '#f4f4f5', fontFamily: 'sans-serif' }}>
      <header style={{ ...panelStyle, padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ margin: 0, color: '#a5b4fc', font: '11px ui-monospace, monospace', letterSpacing: '.16em' }}>MAX-SPORTS // PREDICTIVE INTELLIGENCE</p>
          <h1 style={{ margin: '.5rem 0', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 600 }}>Telemetry &amp; Bettor HUD</h1>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '.85rem' }}>Review recorded predictions and follow matchups in your local watchlist.</p>
        </div>
        <button type="button" onClick={() => { void loadTelemetry(); }} disabled={loading} style={{ padding: '.65rem 1rem', borderRadius: '8px', border: '1px solid rgba(129,140,248,.4)', background: 'rgba(79,70,229,.18)', color: '#c7d2fe', cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'SYNCING…' : 'REFRESH TELEMETRY'}
        </button>
      </header>

      <section aria-label="Select league" style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {leagues.map((league) => (
          <button key={league} type="button" aria-pressed={activeLeague === league} onClick={() => setActiveLeague(league)} style={{ padding: '.55rem .9rem', borderRadius: '7px', border: `1px solid ${activeLeague === league ? '#6366f1' : 'rgba(255,255,255,.1)'}`, background: activeLeague === league ? 'rgba(79,70,229,.28)' : '#111116', color: activeLeague === league ? '#c7d2fe' : '#a1a1aa', cursor: 'pointer', font: '11px ui-monospace, monospace' }}>
            {league}
          </button>
        ))}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.25rem', alignItems: 'start' }}>
        <section aria-labelledby="matchups-heading">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
            <h2 id="matchups-heading" style={{ fontSize: '1rem', margin: 0 }}>Recorded matchups</h2>
            <span style={{ color: '#71717a', font: '11px ui-monospace, monospace' }}>{leagueTelemetry.length} RECORDS</span>
          </div>
          {loading ? <p role="status" style={{ color: '#a1a1aa', padding: '2rem 0' }}>Loading sports telemetry…</p> : error ? (
            <div role="alert" style={{ ...panelStyle, padding: '1.25rem', color: '#fca5a5' }}>
              <p>{error}</p>
              <button type="button" onClick={() => { void loadTelemetry(); }} style={{ color: '#c7d2fe', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>Try again</button>
            </div>
          ) : leagueTelemetry.length === 0 ? (
            <div style={{ ...panelStyle, padding: '1.5rem', color: '#a1a1aa', lineHeight: 1.6 }}>
              No {activeLeague} telemetry records are available. Create a record below to see it here. This view does not use a live sports feed.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '.85rem' }}>
              {leagueTelemetry.map((item) => {
                const tracked = watchlist.includes(item.event_id);
                return (
                  <article key={item.event_id} style={{ ...panelStyle, padding: '1.15rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', color: '#a5b4fc', font: '10px ui-monospace, monospace', letterSpacing: '.08em' }}>
                      <span>{item.league} · USER-RECORDED PREDICTION</span>
                      <time>{item.updated_at}</time>
                    </div>
                    <h3 style={{ margin: '.85rem 0', fontSize: '1.05rem' }}>{item.matchup}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem', padding: '.8rem', borderRadius: '8px', background: 'rgba(0,0,0,.3)' }}>
                      <div><small style={{ display: 'block', color: '#71717a' }}>PREDICTION</small><strong style={{ color: '#a5f3fc', fontSize: '.85rem' }}>{item.oracle_consensus?.predictedWinner ?? 'Not provided'}</strong></div>
                      <div><small style={{ display: 'block', color: '#71717a' }}>CONFIDENCE</small><strong>{item.oracle_consensus?.confidenceScore ?? '—'}{item.oracle_consensus?.confidenceScore == null ? '' : '%'}</strong></div>
                      <div><small style={{ display: 'block', color: '#71717a' }}>SOURCES</small><strong>{item.oracle_consensus?.dataSourcesCount ?? '—'}</strong></div>
                    </div>
                    <button type="button" aria-pressed={tracked} onClick={() => toggleWatchlist(item.event_id)} style={{ marginTop: '.85rem', padding: '.5rem .75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,.12)', background: tracked ? 'rgba(16,185,129,.12)' : 'rgba(255,255,255,.04)', color: tracked ? '#6ee7b7' : '#d4d4d8', cursor: 'pointer', fontSize: '.75rem' }}>
                      {tracked ? '✓ In watchlist' : 'Add to watchlist'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside style={{ ...panelStyle, padding: '1.25rem' }} aria-label="Bettor HUD">
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Bettor HUD</h2>
          <p style={{ color: '#a1a1aa', fontSize: '.82rem', lineHeight: 1.6 }}>Your watchlist is stored for this page session only. Predictions are user-entered records, not verified odds, live telemetry, or financial advice.</p>
          <div style={{ padding: '1rem', borderRadius: '9px', background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontSize: '.8rem' }}><span>Tracked matchups</span><strong style={{ color: '#c7d2fe' }}>{watchlist.length}</strong></div>
            <p style={{ margin: '.75rem 0 0', color: '#71717a', fontSize: '.75rem' }}>Wager placement, odds, deposits, and payouts are not connected.</p>
          </div>
          <SportsTelemetryForm onSuccess={() => { void loadTelemetry(); }} />
        </aside>
      </div>
    </main>
  );
}
