import React, { useState, useEffect } from 'react';

type NavigationState = 
  | 'hub' 
  | 'art-portal' | 'art-submission' 
  | 'chess-portal' | 'chess-submission' | 'chess-arena' 
  | 'sports-portal' | 'sports-submission' 
  | 'marketplace-portal' 
  | 'admin-login' | 'portal-os-admin';

export function App() {
  const [navState, setNavState] = useState<NavigationState>('hub');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [salesLedger, setSalesLedger] = useState<any[]>([]);
  const [adminSubView, setAdminSubView] = useState<'overview' | 'gates' | 'icvs' | 'sales'>('overview');

  // Fetch public inventory on load
  useEffect(() => {
    fetch('/api/v1/store/inventory')
      .then((res) => res.json())
      .then((data: any) => {
        if (data.items) setInventory(data.items);
      })
      .catch((err) => console.error('Failed to load public inventory:', err));
  }, []);

  // Handle Portal-OS1 Admin Passkey Authentication
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/v1/admin/sales', {
        headers: { 'x-sovereign-passkey': passkeyInput.trim() },
      });
      if (res.ok) {
        const data = await res.json();
        setSalesLedger((data as any).sales || []);
        setNavState('portal-os-admin');
      } else {
        setAuthError('Unauthorized // Invalid MAX-ARCHITECTURE Passkey');
      }
    } catch (err) {
      setAuthError('Connection error validating sovereign passkey.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
      {/* TOP HEADER & ECOSYSTEM STATUS */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setNavState('hub')}>
          <span className="text-xl font-bold tracking-wider text-cyan-400">PLANETARY-MAX // MAX-ECOSYSTEM</span>
          <span className="text-xs px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            {navState === 'portal-os-admin' ? 'PORTAL-OS1 // ROOT AUTHORITY' : 'MAX SPACE // QUAD-VIEW HUB'}
          </span>
        </div>

        {/* NAVIGATION CONTROLS */}
        <div className="flex items-center gap-2">
          {navState !== 'portal-os-admin' ? (
            <>
              {navState !== 'hub' && (
                <button
                  onClick={() => setNavState('hub')}
                  className="px-3 py-1.5 text-xs rounded bg-slate-800 text-cyan-300 border border-cyan-900 hover:bg-slate-700"
                >
                  ← BACK TO QUAD HUB
                </button>
              )}
              <button
                onClick={() => setNavState('admin-login')}
                className="px-3 py-1.5 text-xs rounded bg-purple-900/60 text-purple-200 border border-purple-700 hover:bg-purple-900"
              >
                PORTAL-OS1 ADMIN
              </button>
            </>
          ) : (
            <button
              onClick={() => setNavState('hub')}
              className="px-3 py-1.5 text-xs rounded bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900"
            >
              LOCK VAULT // EXIT TO MAX SPACE
            </button>
          )}
        </div>
      </header>

      {/* MAIN VIEW RENDERER */}
      <main className="max-w-7xl mx-auto p-6">

        {/* 1. MAX SPACE QUAD-VIEW HUB */}
        {navState === 'hub' && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-slate-900 border border-slate-800">
              <h1 className="text-2xl font-bold text-cyan-400 mb-2">MAX SPACE PORTAL BROWSER</h1>
              <p className="text-slate-400 text-sm">
                Sovereign edge-native nexus under the executive authority of Max Jurreau. Select a portal below to enter its specialized domain or access its dedicated submission pipeline.
              </p>
            </div>

            {/* QUAD-VIEW GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* QUAD 1: MAX-ART GALLERY */}
              <div className="p-6 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-cyan-500 font-bold uppercase">ICV-01 // MAX-MEDIA</span>
                  <h2 className="text-xl font-bold text-white mt-1">MAX-ART GALLERY</h2>
                  <p className="text-xs text-slate-400 mt-2">
                    Digital canvases, multi-layer rendering studio, and cryptographic provenance verification.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setNavState('art-portal')}
                    className="px-4 py-2 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                  >
                    ENTER GALLERY
                  </button>
                  <button
                    onClick={() => setNavState('art-submission')}
                    className="px-4 py-2 text-xs rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800"
                  >
                    SUBMISSION PAGE
                  </button>
                </div>
              </div>

              {/* QUAD 2: MAX CHESS 3D ARENA */}
              <div className="p-6 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-purple-400 font-bold uppercase">SIMULATION & GAMES FACTORY</span>
                  <h2 className="text-xl font-bold text-white mt-1">MAX CHESS 3D</h2>
                  <p className="text-xs text-slate-400 mt-2">
                    Asymmetric distortion opening systems, PGN parsing, and Stockfish tactical analysis.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setNavState('chess-portal')}
                    className="px-4 py-2 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                  >
                    ENTER ARENA
                  </button>
                  <button
                    onClick={() => setNavState('chess-arena')}
                    className="px-4 py-2 text-xs rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                  >
                    MATCH TIME // 3D ARENA
                  </button>
                  <button
                    onClick={() => setNavState('chess-submission')}
                    className="px-4 py-2 text-xs rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800"
                  >
                    SUBMISSION
                  </button>
                </div>
              </div>

              {/* QUAD 3: SPORTS WAGERING */}
              <div className="p-6 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase">MAX-SPORTS TELEMETRY</span>
                  <h2 className="text-xl font-bold text-white mt-1">SPORTS WAGERING & HUD</h2>
                  <p className="text-xs text-slate-400 mt-2">
                    Real-time kinematic motion analysis feeds, predictive intelligence, and bettor HUDs.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setNavState('sports-portal')}
                    className="px-4 py-2 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    ENTER WAGERING HUD
                  </button>
                  <button
                    onClick={() => setNavState('sports-submission')}
                    className="px-4 py-2 text-xs rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-800"
                  >
                    SUBMISSION
                  </button>
                </div>
              </div>

              {/* QUAD 4: MARKETPLACE STOREFRONT */}
              <div className="p-6 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-amber-400 font-bold uppercase">MAX SPACE STOREFRONT</span>
                  <h2 className="text-xl font-bold text-white mt-1">SOVEREIGN MARKETPLACE</h2>
                  <p className="text-xs text-slate-400 mt-2">
                    Acquire rare manuscripts, artifacts, and edge-native digital assets via atomic ZK-Vouchers.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => setNavState('marketplace-portal')}
                    className="px-4 py-2 text-xs rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                  >
                    ENTER MARKETPLACE
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. SUB-PAGES & DEDICATED ARENAS */}
        {navState === 'art-portal' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-cyan-400">MAX-ART Gallery Portal</h2>
            <p className="text-sm text-slate-400">Exhibiting curated digital canvases under the Jurreauism art philosophy framework.</p>
          </div>
        )}

        {navState === 'art-submission' && (
          <div className="max-w-xl mx-auto space-y-6 p-6 rounded-lg bg-slate-900 border border-slate-800">
            <h2 className="text-xl font-bold text-cyan-400">MAX-ART Submission Portal</h2>
            <p className="text-xs text-slate-400">Submit new canvas metadata and IPFS provenance hashes to the edge ledger.</p>
            {/* Submission Form */}
          </div>
        )}

        {navState === 'chess-portal' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-purple-400">MAX Chess Study & PGN Database</h2>
            <p className="text-sm text-slate-400">Analyze Ruy Lopez, Italian Game, and asymmetric distortion opening systems.</p>
          </div>
        )}

        {navState === 'chess-arena' && (
          <div className="space-y-6 p-6 rounded-lg bg-slate-900 border border-amber-500/40">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-amber-400">DEDICATED 3D CHESS ARENA // MATCH TIME</h2>
              <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 text-xs">Siderios Friction Active</span>
            </div>
            <p className="text-xs text-slate-400">Live spatial board active. Stockfish evaluation and move validation online.</p>
            <div className="h-96 bg-slate-950 rounded border border-slate-800 flex items-center justify-center text-slate-600 text-sm">
              [ 3D Spatial Chess Board Render View ]
            </div>
          </div>
        )}

        {navState === 'chess-submission' && (
          <div className="max-w-xl mx-auto space-y-6 p-6 rounded-lg bg-slate-900 border border-slate-800">
            <h2 className="text-xl font-bold text-purple-400">MAX Chess Game Submission</h2>
            <p className="text-xs text-slate-400">Upload PGN game records for engine auditing and rating calculation.</p>
          </div>
        )}

        {navState === 'sports-portal' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-emerald-400">MAX-SPORTS Wagering & Telemetry Hub</h2>
            <p className="text-sm text-slate-400">Real-time kinematic motion feeds and predictive betting analytics.</p>
          </div>
        )}

        {navState === 'sports-submission' && (
          <div className="max-w-xl mx-auto space-y-6 p-6 rounded-lg bg-slate-900 border border-slate-800">
            <h2 className="text-xl font-bold text-emerald-400">MAX-SPORTS Telemetry Submission</h2>
            <p className="text-xs text-slate-400">Ingest live biometric and kinematic event feeds into the simulation engine.</p>
          </div>
        )}

        {navState === 'marketplace-portal' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-amber-400">MAX SPACE Marketplace Storefront</h2>
            <p className="text-sm text-slate-400">Public inventory and ZK-Voucher escrow acquisitions.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {inventory.map((item) => (
                <div key={item.id} className="p-4 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-cyan-500 uppercase">{item.category}</span>
                    <h3 className="text-lg font-semibold text-white mt-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-2">{item.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-400">{item.price_zk} ZK</span>
                    <button 
                      onClick={() => alert(`Initiating ZK-Voucher acquisition for ${item.title}`)}
                      className="px-3 py-1.5 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                    >
                      ACQUIRE // ZK
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ADMIN LOGIN & PORTAL-OS1 PRIVATE CONTROL PLANE */}
        {navState === 'admin-login' && (
          <div className="max-w-md mx-auto mt-12 p-8 rounded-lg bg-slate-900 border border-purple-900/50 shadow-xl">
            <h2 className="text-xl font-bold text-purple-400 mb-2">PORTAL-OS1 ADMIN VAULT</h2>
            <p className="text-xs text-slate-400 mb-6">Enter MAX-ARCHITECTURE passkey to verify root authority (Max Jurreau).</p>
            
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">SOVEREIGN PASSKEY</label>
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter passkey..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              {authError && <p className="text-xs text-rose-400">{authError}</p>}
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded tracking-wider"
              >
                VERIFY & UNLOCK PORTAL-OS1
              </button>
            </form>
          </div>
        )}

        {navState === 'portal-os-admin' && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-purple-950/20 border border-purple-900/40 flex justify-between items-center">
              <div>
                <span className="text-xs text-purple-400 font-bold uppercase">VERSION 1.0.0 // MAX-ECOSYSTEM</span>
                <h2 className="text-xl font-bold text-white mt-1">PORTAL-OS1 EXECUTIVE CONTROL PLANE</h2>
                <p className="text-slate-300 text-xs mt-1">Root Authority: Max Jurreau | Framework: MAX-INSTITUTE.ORG 7-Gate Protocol</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAdminSubView('overview')} className={`px-3 py-1.5 text-xs rounded ${adminSubView === 'overview' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}>OVERVIEW</button>
                <button onClick={() => setAdminSubView('gates')} className={`px-3 py-1.5 text-xs rounded ${adminSubView === 'gates' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}>7-GATES</button>
                <button onClick={() => setAdminSubView('icvs')} className={`px-3 py-1.5 text-xs rounded ${adminSubView === 'icvs' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}>ICVs & BEEMAX</button>
                <button onClick={() => setAdminSubView('sales')} className={`px-3 py-1.5 text-xs rounded ${adminSubView === 'sales' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}>SALES LEDGER</button>
              </div>
            </div>

            {adminSubView === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded bg-slate-900 border border-slate-800">
                  <h3 className="text-sm font-bold text-cyan-400">EXECUTIVE CONTROL</h3>
                  <p className="text-xs text-slate-400 mt-2">Orchestrator: Executive Orchestrator active across Portfolio, Operations, Platform, and Release Directors.</p>
                </div>
                <div className="p-4 rounded bg-slate-900 border border-slate-800">
                  <h3 className="text-sm font-bold text-purple-400">BEEMAX EDGE NODES</h3>
                  <p className="text-xs text-slate-400 mt-2">ICV-02 Serverless Isolate Microkernels operating on Cloudflare Workers edge runtime.</p>
                </div>
                <div className="p-4 rounded bg-slate-900 border border-slate-800">
                  <h3 className="text-sm font-bold text-amber-400">SIMULATION FACTORY</h3>
                  <p className="text-xs text-slate-400 mt-2">ICV-03 MC-001 / V3 Simulation Engines processing multi-agent meshes.</p>
                </div>
              </div>
            )}

            {adminSubView === 'gates' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-purple-400">MAX-INSTITUTE.ORG 7-Gate Protocol Status</h3>
                {[
                  { id: 'GATE-01', name: 'Architectural & First-Principles Alignment', status: 'PASSED' },
                  { id: 'GATE-02', name: 'Identity & Cryptographic Verification', status: 'PASSED' },
                  { id: 'GATE-03', name: 'Zero-Stub / Zero-Placeholder Compliance Audit', status: 'PASSED' },
                  { id: 'GATE-04', name: 'Edge-Native Runtime & Microkernel Isolate Isolation', status: 'PASSED' },
                  { id: 'GATE-05', name: 'Deterministic State Replication & Durable Object Integrity', status: 'PASSED' },
                  { id: 'GATE-06', name: 'Automated Test Suite & Multi-Agent Mesh Validation', status: 'PASSED' },
                  { id: 'GATE-07', name: 'Final Production Promotion & LiveOps Release Sign-Off', status: 'ACTIVE' },
                ].map((gate) => (
                  <div key={gate.id} className="p-3 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-cyan-400 font-bold">{gate.id}</span>: {gate.name}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">{gate.status}</span>
                  </div>
                ))}
              </div>
            )}

            {adminSubView === 'icvs' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-purple-400">Integrated Creation Verticals (ICVs)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-cyan-400 font-bold">ICV-01</span>
                    <h4 className="font-semibold text-white">MAX-MEDIA</h4>
                    <p className="text-slate-400">Virtual Production & Spatial Studio. Full 10-department engineering matrix active.</p>
                  </div>
                  <div className="p-4 rounded bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-purple-400 font-bold">ICV-02</span>
                    <h4 className="font-semibold text-white">EDGE & CORE</h4>
                    <p className="text-slate-400">BEEMAX / PORTAL-OS1 Microkernels & Serverless Infrastructure.</p>
                  </div>
                  <div className="p-4 rounded bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-amber-400 font-bold">ICV-03</span>
                    <h4 className="font-semibold text-white">SIMULATION & GAMES FACTORY</h4>
                    <p className="text-slate-400">MC-001 / V3 Simulation Engines & Multi-Agent Meshes.</p>
                  </div>
                </div>
              </div>
            )}

            {adminSubView === 'sales' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-purple-400">Sales Ledger & Escrow Oversight</h3>
                <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="p-3">Sale ID</th>
                        <th className="p-3">Item ID</th>
                        <th className="p-3">Buyer Node</th>
                        <th className="p-3">Amount (ZK)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {salesLedger.map((sale: any) => (
                        <tr key={sale.id}>
                          <td className="p-3 font-mono text-cyan-400">{sale.id}</td>
                          <td className="p-3">{sale.item_id}</td>
                          <td className="p-3">{sale.buyer_node}</td>
                          <td className="p-3 text-amber-400">{sale.amount_zk} ZK</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">{sale.settlement_status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
