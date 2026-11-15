import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SportsTelemetryForm } from '../components/SportsTelemetryForm';

const leagues = ['NFL', 'NBA', 'MLB', 'SOCCER', 'MMA'] as const;
type League = (typeof leagues)[number];

interface TelemetryItem {
  event_id: string;
  league: League;
  matchup: string;
  oracle_consensus?: {
    predictedWinner?: string;
    confidenceScore?: number;
    dataSourcesCount?: number;
  };
  updated_at: string;
}

const styles = `
  .sports-os { min-height: 100%; color: #e6f4ff; background: radial-gradient(circle at 85% 0%, #0b1d3a 0, #040812 48%); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .sports-os * { box-sizing: border-box; }
  .sports-hero { padding: 28px clamp(18px, 4vw, 42px) 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:18px; background:linear-gradient(180deg,rgba(11,29,58,.8),rgba(4,8,18,.72)); border-bottom:1px solid #18365d; }
  .sports-logo { margin:0; color:#25d9ff; font:900 clamp(34px,5vw,62px)/1 Arial,sans-serif; letter-spacing:.11em; text-shadow:0 0 14px rgba(37,217,255,.62); }
  .sports-kicker { margin:8px 0 0; color:#9fe7ff; font-size:11px; font-weight:800; letter-spacing:.22em; }
  .sports-badges { display:flex; flex-wrap:wrap; gap:9px; }
  .sports-pill { padding:8px 12px; border:1px solid #18365d; border-radius:999px; background:#0c1628; color:#a9c5e5; font-size:11px; font-weight:800; }
  .sports-nav { position:sticky; top:0; z-index:5; display:flex; align-items:center; flex-wrap:wrap; gap:14px; padding:13px clamp(18px,4vw,42px); background:rgba(8,16,28,.96); border-bottom:1px solid #18365d; backdrop-filter:blur(12px); }
  .sports-nav strong { color:#25d9ff; letter-spacing:.12em; white-space:nowrap; }
  .sports-search { flex:1 1 220px; max-width:380px; padding:10px 13px; border:1px solid #1f4272; border-radius:9px; outline:none; color:#e6f4ff; background:#101b2e; }
  .sports-search:focus { border-color:#25d9ff; box-shadow:0 0 12px #25d9ff30; }
  .sports-links { display:flex; flex-wrap:wrap; gap:15px; }
  .sports-links a { color:#cde6ff; text-decoration:none; text-transform:uppercase; font-size:10px; font-weight:800; letter-spacing:.08em; }
  .sports-links a:hover { color:#25d9ff; }
  .sports-content { width:100%; max-width:1540px; margin:auto; padding:22px clamp(14px,3vw,30px) 36px; display:grid; gap:20px; }
  .sports-ticker { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:11px; }
  .sports-ticker-item,.sports-panel,.sports-card,.sports-tier { border:1px solid #18365d; border-radius:12px; background:linear-gradient(145deg,#0e1a30,#091222); }
  .sports-ticker-item { min-height:72px; padding:13px 15px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .sports-muted { color:#7a9cc6; font-size:11px; line-height:1.55; }
  .sports-panel { padding:18px; box-shadow:0 10px 30px #0006; }
  .sports-grid { display:grid; grid-template-columns:minmax(0,2fr) minmax(270px,1fr); gap:18px; }
  .sports-panel-head { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-bottom:11px; margin-bottom:13px; border-bottom:1px solid #18365d; }
  .sports-heading { margin:0; color:#9fe7ff; font-size:13px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
  .sports-tabs { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:13px; }
  .sports-tab,.sports-action { border:1px solid #18365d; border-radius:7px; padding:7px 11px; color:#e6f4ff; background:#101b2e; font-weight:800; font-size:11px; cursor:pointer; }
  .sports-tab[aria-pressed="true"],.sports-action { color:#040812; background:#25d9ff; border-color:#25d9ff; }
  .sports-action:disabled { opacity:.55; cursor:wait; }
  .sports-record { padding:13px; border:1px solid #18365d; border-radius:10px; background:#08101c; }
  .sports-metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(145px,1fr)); gap:12px; }
  .sports-card { padding:15px; }
  .sports-card-title { margin:0 0 9px; font-size:12px; font-weight:800; }
  .sports-card-value { margin:0 0 6px; color:#25d9ff; font-size:22px; font-weight:900; overflow-wrap:anywhere; }
  .sports-card-desc { margin:0; color:#7a9cc6; font-size:11px; line-height:1.5; }
  .sports-tiers { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:15px; }
  .sports-tier { padding:18px; }
  .sports-tier h3 { margin:8px 0; font-size:15px; }
  .sports-tier ul { padding-left:18px; color:#cde6ff; font-size:12px; line-height:1.8; }
  .sports-os button:focus-visible,.sports-os a:focus-visible,.sports-os input:focus-visible { outline:2px solid #9fe7ff; outline-offset:2px; }
  @media(max-width:850px) { .sports-grid { grid-template-columns:1fr; } }
`;

export default function SportsPage() {
  const [activeLeague, setActiveLeague] = useState<League>('NFL');
  const [activeFeed, setActiveFeed] = useState('NBA');
  const [telemetry, setTelemetry] = useState<TelemetryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [search, setSearch] = useState('');

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

  const filteredTelemetry = useMemo(() => telemetry.filter((item) =>
    item.league === activeLeague && `${item.matchup} ${item.league} ${item.oracle_consensus?.predictedWinner ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()),
  ), [telemetry, activeLeague, search]);
  const leagueCount = new Set(telemetry.map((item) => item.league)).size;
  const confidenceValues = telemetry
    .map((item) => item.oracle_consensus?.confidenceScore)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const averageConfidence = confidenceValues.length
    ? `${(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length).toFixed(1)}%`
    : '—';
  const latestRecords = telemetry.slice(0, 3);

  const dashboardMetrics = [
    { title: 'Recorded matchups', value: String(telemetry.length), desc: 'Saved sports telemetry records in this workspace.' },
    { title: 'Leagues represented', value: `${leagueCount} / ${leagues.length}`, desc: 'Leagues with at least one saved record.' },
    { title: 'Tracked matchups', value: String(watchlist.length), desc: 'Items in your temporary, page-session watchlist.' },
    { title: 'Mean stated confidence', value: averageConfidence, desc: 'Average of confidence values submitted with saved records.' },
    { title: 'Selected league', value: activeLeague, desc: 'Change the league filter above the matchup list.' },
    { title: 'Latest record', value: latestRecords[0]?.league ?? '—', desc: latestRecords[0]?.matchup ?? 'No saved matchup yet.' },
    { title: 'Prediction sources', value: String(telemetry.reduce((sum, item) => sum + (item.oracle_consensus?.dataSourcesCount ?? 0), 0)), desc: 'Total source counts entered in saved telemetry; not independently verified.' },
    { title: 'Live sports feeds', value: 'Not connected', desc: 'This page does not ingest live scores, odds, or video.' },
    { title: 'Sportsbook links', value: 'None', desc: 'No betting, deposit, payout, or sportsbook integrations are connected.' },
    { title: 'Video highlights', value: 'Not connected', desc: `${activeFeed} highlights are a UI selection only; no video stream is embedded.` },
    { title: 'Simulations', value: 'Not connected', desc: 'No Monte Carlo or predictive simulation is run by this page.' },
    { title: 'Data status', value: error ? 'Unavailable' : loading ? 'Syncing' : 'Workspace records', desc: error ? 'Telemetry could not be loaded.' : 'Displayed data comes from user-entered telemetry records.' },
  ];

  const toggleWatchlist = (eventId: string) => {
    setWatchlist((current) => current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [...current, eventId]);
  };

  return (
    <div className="sports-os">
      <style>{styles}</style>
      <header className="sports-hero">
        <div>
          <h1 className="sports-logo">MAX SPORTS</h1>
          <p className="sports-kicker">PREDICTIVE INTELLIGENCE · TELEMETRY WORKSPACE</p>
        </div>
        <div className="sports-badges" aria-label="Data connection status">
          <span className="sports-pill">{loading ? 'SYNCING RECORDS' : 'USER-RECORDED DATA'}</span>
          <span className="sports-pill">{telemetry.length} SAVED RECORDS</span>
          <span className="sports-pill">NO LIVE ODDS FEED</span>
        </div>
      </header>

      <nav className="sports-nav" aria-label="Sports dashboard navigation">
        <strong>MAX SPORTS</strong>
        <input className="sports-search" aria-label="Search saved matchups" placeholder="Search teams, players, predictions…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="sports-links">
          <a href="#live">Matchups</a><a href="#predictions">Records</a><a href="#news">Feed status</a><a href="#analytics">Analytics</a><a href="#quantum">Modules</a>
        </div>
      </nav>

      <main className="sports-content">
        <section id="live" className="sports-ticker" aria-label="Latest recorded matchups">
          {latestRecords.length ? latestRecords.map((item) => (
            <article className="sports-ticker-item" key={item.event_id}>
              <div><strong>{item.matchup}</strong><div className="sports-muted">{item.league} · saved telemetry</div></div>
              <span style={{ color: '#25d9ff', fontSize: 11, fontWeight: 800 }}>{item.oracle_consensus?.predictedWinner ?? 'RECORD'}</span>
            </article>
          )) : <div className="sports-ticker-item"><span className="sports-muted">No saved matchups yet. Add a telemetry record to populate this area.</span></div>}
        </section>

        <section id="predictions" className="sports-grid">
          <div className="sports-panel">
            <div className="sports-panel-head">
              <h2 className="sports-heading">Saved predictions &amp; telemetry</h2>
              <button className="sports-action" type="button" onClick={() => { void loadTelemetry(); }} disabled={loading}>{loading ? 'SYNCING…' : 'REFRESH RECORDS'}</button>
            </div>
            <div className="sports-tabs" aria-label="Select league">
              {leagues.map((league) => <button className="sports-tab" key={league} type="button" aria-pressed={activeLeague === league} onClick={() => setActiveLeague(league)}>{league}</button>)}
            </div>
            {loading ? <p className="sports-muted" role="status">Loading saved sports telemetry…</p> : error ? (
              <div role="alert" className="sports-record"><p>{error}</p><button className="sports-tab" type="button" onClick={() => { void loadTelemetry(); }}>Try again</button></div>
            ) : filteredTelemetry.length === 0 ? (
              <p className="sports-muted">No matching {activeLeague} records. Add a record below; this page does not use a live sports feed.</p>
            ) : <div style={{ display: 'grid', gap: 10 }}>
              {filteredTelemetry.map((item) => {
                const tracked = watchlist.includes(item.event_id);
                return <article className="sports-record" key={item.event_id}>
                  <div className="sports-panel-head"><span className="sports-muted">{item.league} · USER-RECORDED PREDICTION</span><time className="sports-muted">{item.updated_at}</time></div>
                  <h3 style={{ margin: '8px 0 12px', fontSize: 16 }}>{item.matchup}</h3>
                  <div className="sports-metrics">
                    <div><span className="sports-muted">PREDICTION</span><div>{item.oracle_consensus?.predictedWinner ?? 'Not provided'}</div></div>
                    <div><span className="sports-muted">STATED CONFIDENCE</span><div>{item.oracle_consensus?.confidenceScore ?? '—'}{item.oracle_consensus?.confidenceScore == null ? '' : '%'}</div></div>
                    <div><span className="sports-muted">STATED SOURCES</span><div>{item.oracle_consensus?.dataSourcesCount ?? '—'}</div></div>
                  </div>
                  <button className="sports-tab" type="button" aria-pressed={tracked} onClick={() => toggleWatchlist(item.event_id)} style={{ marginTop: 12 }}>{tracked ? '✓ In watchlist' : 'Add to watchlist'}</button>
                </article>;
              })}
            </div>}
          </div>

          <aside className="sports-panel" id="news" aria-label="Sports feed status">
            <div className="sports-panel-head"><h2 className="sports-heading">Feed &amp; integration status</h2></div>
            <div className="sports-record" style={{ marginBottom: 10 }}><strong style={{ color: '#25d9ff' }}>Workspace telemetry</strong><p className="sports-muted">Saved predictions are user-entered records. Confidence and source counts are not independently validated.</p></div>
            <div className="sports-record" style={{ marginBottom: 10 }}><strong>Live scores, odds &amp; video</strong><p className="sports-muted">No live sports data or video provider is connected. League tabs below only change the selected label.</p></div>
            <div className="sports-tabs" aria-label="Select highlight category">
              {['NBA', 'NFL', 'MLB', 'WNBA'].map((feed) => <button className="sports-tab" key={feed} type="button" aria-pressed={activeFeed === feed} onClick={() => setActiveFeed(feed)}>{feed}</button>)}
            </div>
            <p className="sports-muted">{activeFeed} highlights are unavailable until a media provider is configured.</p>
            <p className="sports-muted">This tool does not place wagers or provide financial advice.</p>
          </aside>
        </section>

        <section id="analytics">
          <div className="sports-panel-head"><h2 className="sports-heading">Telemetry matrix</h2><span className="sports-muted">Computed from saved workspace records</span></div>
          <div className="sports-metrics">
            {dashboardMetrics.map((metric) => <article className="sports-card" key={metric.title}><h3 className="sports-card-title">{metric.title}</h3><p className="sports-card-value">{metric.value}</p><p className="sports-card-desc">{metric.desc}</p></article>)}
          </div>
        </section>

        <section id="quantum" className="sports-tiers">
          <article className="sports-tier"><span className="sports-pill">MAX SPORTS PRO</span><h3>Prediction workspace</h3><p className="sports-muted">Review and record matchup predictions with the existing telemetry form.</p><ul><li>League-filtered saved records</li><li>Session-only matchup watchlist</li><li>Refreshable telemetry view</li></ul></article>
          <article className="sports-tier"><span className="sports-pill">MAX SPORTS QUANTUM</span><h3>Simulation module</h3><p className="sports-muted">Simulation services are not configured in this application.</p><ul><li>No fabricated simulation results</li><li>No live probability feed</li><li>Connect a data/model provider to enable</li></ul></article>
          <article className="sports-tier"><span className="sports-pill">MAX SPORTS ELITE</span><h3>Portfolio integrations</h3><p className="sports-muted">No banking, sportsbook, or wagering integrations are connected.</p><ul><li>No deposits or payouts</li><li>No automated staking</li><li>Use the form to maintain user-entered records</li></ul></article>
        </section>

        <section aria-label="Add sports telemetry" className="sports-panel"><div className="sports-panel-head"><h2 className="sports-heading">Add a matchup record</h2></div><SportsTelemetryForm onSuccess={() => { void loadTelemetry(); }} /></section>
      </main>
    </div>
  );
}
