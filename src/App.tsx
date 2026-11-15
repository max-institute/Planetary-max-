import React, { useState, useEffect } from 'react';

type NavigationState =
  | 'hub'
  | 'art-portal'
  | 'art-submission'
  | 'chess-portal'
  | 'chess-submission'
  | 'chess-arena'
  | 'sports-portal'
  | 'sports-submission'
  | 'marketplace-portal'
  | 'admin-login'
  | 'portal-os-admin';

type AdminTab =
  | 'portal-os'
  | 'sales'
  | 'audit'
  | 'beemax'
  | 'max-finance'
  | 'ai-mind'
  | 'api-inspector';

export function App() {
  const [navState, setNavState] = useState<NavigationState>('hub');
  const [adminSubView, setAdminSubView] = useState<AdminTab>('portal-os');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [salesLedger, setSalesLedger] = useState<any[]>([]);

  // Live API Inspector State
  const [inspectorRoute, setInspectorRoute] = useState('/api/v1/store/inventory');
  const [inspectorMethod, setInspectorMethod] = useState<'GET' | 'POST'>('GET');
  const [inspectorBody, setInspectorBody] = useState(
    '{"prompt": "Audit all active ICV meshes and verify 7-Gate integrity."}'
  );
  const [inspectorResponse, setInspectorResponse] = useState<string>(
    '// Select an endpoint and click EXECUTE EDGE REQUEST to inspect live JSON'
  );

  // MAX-MIND Sovereign AI Co-Pilot State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiConversation, setAiConversation] = useState<
    Array<{ role: string; text: string }>
  >([
    {
      role: 'system',
      text: 'MAX-MIND Sovereign AI Co-Pilot online. Connected to Portal-OS1 microkernel and D1 ledger. Awaiting directive, Max Jurreau.',
    },
  ]);

  useEffect(() => {
    fetch('/api/v1/store/inventory')
      .then((res) => res.json())
      .then((data: any) => {
        if (data.items) setInventory(data.items);
      })
      .catch((err) => console.error('Failed to load public inventory:', err));
  }, []);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/v1/admin/sales', {
        headers: { 'x-sovereign-passkey': passkeyInput.trim() },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        setSalesLedger(data.sales || []);
        setNavState('portal-os-admin');
      } else {
        setAuthError('Unauthorized // Invalid MAX-ARCHITECTURE Passkey');
      }
    } catch {
      setAuthError('Connection error validating sovereign passkey.');
    }
  };

  const handleRunInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    setInspectorResponse('Executing request against edge worker...');
    try {
      const options: RequestInit = {
        method: inspectorMethod,
        headers: {
          'Content-Type': 'application/json',
          'x-sovereign-passkey': passkeyInput.trim(),
        },
      };
      if (inspectorMethod === 'POST') {
        options.body = inspectorBody;
      }
      const res = await fetch(inspectorRoute, options);
      const data = await res.json();
      setInspectorResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setInspectorResponse(`Error executing request: ${err.message || err}`);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userMsg = aiPrompt;
    setAiConversation((prev) => [...prev, { role: 'user', text: userMsg }]);
    setAiPrompt('');

    try {
      const res = await fetch('/api/v1/admin/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sovereign-passkey': passkeyInput.trim(),
        },
        body: JSON.stringify({ prompt: userMsg }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        setAiConversation((prev) => [
          ...prev,
          { role: 'system', text: data.reply },
        ]);
      } else {
        setAiConversation((prev) => [
          ...prev,
          {
            role: 'system',
            text: 'Error: Unauthorized MAX-MIND access or execution failure.',
          },
        ]);
      }
    } catch {
      setAiConversation((prev) => [
        ...prev,
        {
          role: 'system',
          text: 'Connection error transmitting directive to edge worker.',
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
      {/* Top Sovereign Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setNavState('hub')}
        >
          <span className="text-xl font-bold tracking-wider text-cyan-400">
            PLANETARY-MAX // MAX-ECOSYSTEM
          </span>
          <span className="text-xs px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            {navState === 'portal-os-admin'
              ? 'PORTAL-OS1 // ROOT AUTHORITY'
              : 'MAX SPACE // QUAD-VIEW HUB'}
          </span>
        </div>

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

      <main className="max-w-7xl mx-auto p-6">
        {/* PUBLIC MAX SPACE QUAD-VIEW HUB */}
        {navState === 'hub' && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-slate-900 border border-slate-800">
              <h1 className="text-2xl font-bold text-cyan-400 mb-2">
                MAX SPACE PORTAL BROWSER
              </h1>
              <p className="text-slate-400 text-sm">
                Sovereign edge-native nexus under the executive authority of Max
                Jurreau. Select a portal below to enter its specialized domain
                or access its dedicated submission pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QUADRANT 1: MAX-ART */}
              <div className="p-6 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-cyan-500 font-bold uppercase">
                    ICV-01 // MAX-MEDIA
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    MAX-ART GALLERY
                  </h2>
                  <p className="text-xs text-slate-400 mt-2">
                    Digital canvases, multi-layer rendering studio, and
                    cryptographic provenance verification signed MaxJ.
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

              {/* QUADRANT 2: MAX CHESS 3D */}
              <div className="p-6 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-purple-400 font-bold uppercase">
                    SIMULATION & GAMES FACTORY
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    MAX CHESS 3D
                  </h2>
                  <p className="text-xs text-slate-400 mt-2">
                    Asymmetric distortion opening systems, 64-square spatial
                    board, PGN parsing, and Stockfish tactical analysis.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
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
                    MATCH TIME // 3D BOARD
                  </button>
                  <button
                    onClick={() => setNavState('chess-submission')}
                    className="px-4 py-2 text-xs rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800"
                  >
                    SUBMISSION
                  </button>
                </div>
              </div>

              {/* QUADRANT 3: MAX-SPORTS */}
              <div className="p-6 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase">
                    MAX-SPORTS TELEMETRY
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    SPORTS WAGERING & HUD
                  </h2>
                  <p className="text-xs text-slate-400 mt-2">
                    Real-time kinematic motion analysis feeds, predictive
                    intelligence, and bettor HUDs.
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

              {/* QUADRANT 4: SOVEREIGN MARKETPLACE */}
              <div className="p-6 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-amber-400 font-bold uppercase">
                    MAX SPACE STOREFRONT
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    SOVEREIGN MARKETPLACE
                  </h2>
                  <p className="text-xs text-slate-400 mt-2">
                    Acquire rare manuscripts, artifacts, and edge-native digital
                    assets via atomic ZK-Vouchers.
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

        {/* SUB-PORTAL VIEWS */}
        {(navState === 'art-portal' ||
          navState === 'art-submission' ||
          navState === 'chess-portal' ||
          navState === 'chess-submission' ||
          navState === 'sports-portal' ||
          navState === 'sports-submission') && (
          <div className="p-6 rounded-lg bg-slate-900 border border-cyan-500/30 space-y-4">
            <span className="text-xs uppercase text-cyan-400 font-bold">
              ACTIVE DOMAIN // {navState.toUpperCase()}
            </span>
            <h2 className="text-xl font-bold text-white">
              {navState.replace('-', ' ').toUpperCase()} MODULE
            </h2>
            <p className="text-xs text-slate-400">
              Edge node verified under DAT-JURREAUISM-v1. All submissions and
              telemetry packets route directly to the D1 sovereign ledger.
            </p>
          </div>
        )}

        {/* DEDICATED 3D CHESS ARENA */}
        {navState === 'chess-arena' && (
          <div className="space-y-6 p-6 rounded-lg bg-slate-900 border border-amber-500/40">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-amber-400">
                DEDICATED 3D CHESS ARENA // 8x8 TOURNAMENT BOARD
              </h2>
              <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 text-xs">
                64 Squares // Asymmetric Distortion Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live spatial 8x8 board active. Stockfish evaluation and legal move
              validation online.
            </p>
            <div className="h-96 bg-slate-950 rounded border border-slate-800 flex items-center justify-center text-slate-500 text-sm">
              [ 3D Spatial 64-Square Chess Board Render View ]
            </div>
          </div>
        )}

        {/* SOVEREIGN MARKETPLACE */}
        {navState === 'marketplace-portal' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-amber-400">
              MAX SPACE Marketplace Storefront
            </h2>
            <p className="text-sm text-slate-400">
              Public inventory and ZK-Voucher escrow acquisitions.
            </p>
            {inventory.length === 0 ? (
              <div className="p-6 rounded bg-slate-900 border border-slate-800 text-xs text-slate-400">
                No active inventory items found in D1 table yet. Seed
                `store_inventory` or inspect `/api/v1/store/inventory`.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs text-cyan-500 uppercase">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-semibold text-white mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-bold text-amber-400">
                        {item.price_zk} ZK
                      </span>
                      <button
                        onClick={() =>
                          alert(
                            `Initiating ZK-Voucher acquisition for ${item.title}`
                          )
                        }
                        className="px-3 py-1.5 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                      >
                        ACQUIRE // ZK
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PORTAL-OS1 PASSKEY LOGIN */}
        {navState === 'admin-login' && (
          <div className="max-w-md mx-auto mt-12 p-8 rounded-lg bg-slate-900 border border-purple-900/50 shadow-xl">
            <h2 className="text-xl font-bold text-purple-400 mb-2">
              PORTAL-OS1 ADMIN VAULT
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Enter MAX-ARCHITECTURE passkey to verify root authority (Max
              Jurreau).
            </p>
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  SOVEREIGN PASSKEY
                </label>
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

        {/* PRIVATE PORTAL-OS1 ADMIN CONTROL PLANE */}
        {navState === 'portal-os-admin' && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-purple-950/20 border border-purple-900/40 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="text-xs text-purple-400 font-bold uppercase">
                  VERSION 1.0.0 // MAX-ECOSYSTEM
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  PORTAL-OS1 EXECUTIVE CONTROL PLANE
                </h2>
                <p className="text-slate-300 text-xs mt-1">
                  Root Authority: Max Jurreau | Framework: MAX-INSTITUTE.ORG
                  7-Gate Protocol
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAdminSubView('portal-os')}
                  className={`px-3 py-1.5 text-xs rounded ${
                    adminSubView === 'portal-os'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  OVERVIEW
                </button>
                <button
                  onClick={() => setAdminSubView('ai-mind')}
                  className={`px-3 py-1.5 text-xs rounded ${
                    adminSubView === 'ai-mind'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  MAX-MIND CO-PILOT
                </button>
                <button
                  onClick={() => setAdminSubView('sales')}
                  className={`px-3 py-1.5 text-xs rounded ${
                    adminSubView === 'sales'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  SALES LEDGER
                </button>
                <button
                  onClick={() => setAdminSubView('api-inspector')}
                  className={`px-3 py-1.5 text-xs rounded ${
                    adminSubView === 'api-inspector'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  API INSPECTOR
                </button>
              </div>
            </div>

            {adminSubView === 'portal-os' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded bg-slate-900 border border-slate-800">
                  <h3 className="text-sm font-bold text-cyan-400">
                    EXECUTIVE CONTROL
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Executive Orchestrator active across Portfolio, Operations,
                    Platform, and Release Directors.
                  </p>
                </div>
                <div className="p-4 rounded bg-slate-900 border border-slate-800">
                  <h3 className="text-sm font-bold text-purple-400">
                    BEEMAX EDGE NODES
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    ICV-02 Serverless Isolate Microkernels & Durable Object
                    Registries active on Cloudflare Workers.
                  </p>
                </div>
                <div className="p-4 rounded bg-slate-900 border border-slate-800">
                  <h3 className="text-sm font-bold text-amber-400">
                    SIMULATION FACTORY
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    ICV-03 MC-001 / V3 Simulation Engines processing multi-agent
                    ICV meshes.
                  </p>
                </div>
              </div>
            )}

            {adminSubView === 'ai-mind' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="p-4 rounded bg-slate-900 border border-cyan-500/40">
                  <h3 className="text-sm font-bold text-cyan-400">
                    MAX-MIND // Private Sovereign AI Co-Pilot
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Verified telemetry-backed architectural intelligence for
                    Portal-OS1.
                  </p>
                </div>
                <div className="h-96 bg-slate-950 border border-slate-800 rounded p-4 overflow-y-auto space-y-3 font-mono text-xs">
                  {aiConversation.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-cyan-300 ml-8'
                          : 'bg-purple-950/30 text-purple-200 border border-purple-900/30 mr-8'
                      }`}
                    >
                      <span className="font-bold block mb-1 text-[10px] uppercase opacity-70">
                        {msg.role === 'user'
                          ? 'Max Jurreau (Root Authority)'
                          : 'MAX-MIND Co-Pilot'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAiSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter verified directive or query..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded"
                  >
                    TRANSMIT
                  </button>
                </form>
              </div>
            )}

            {adminSubView === 'sales' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-purple-400">
                  Sales Ledger & Escrow Oversight
                </h3>
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
                      {salesLedger.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-4 text-center text-slate-500"
                          >
                            No settled sales records in D1 ledger yet.
                          </td>
                        </tr>
                      ) : (
                        salesLedger.map((sale: any) => (
                          <tr key={sale.id}>
                            <td className="p-3 font-mono text-cyan-400">
                              {sale.id}
                            </td>
                            <td className="p-3">{sale.item_id}</td>
                            <td className="p-3">{sale.buyer_node}</td>
                            <td className="p-3 text-amber-400">
                              {sale.amount_zk} ZK
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">
                                {sale.settlement_status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminSubView === 'api-inspector' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="p-4 rounded bg-slate-900 border border-amber-500/40">
                  <h3 className="text-sm font-bold text-amber-400">
                    PORTAL-OS1 // Live API Inspector
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Test your edge endpoints directly from the browser with
                    automatic passkey header injection.
                  </p>
                </div>
                <form
                  onSubmit={handleRunInspector}
                  className="space-y-3 p-4 rounded bg-slate-900 border border-slate-800"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">
                        HTTP Method
                      </label>
                      <select
                        value={inspectorMethod}
                        onChange={(e) =>
                          setInspectorMethod(e.target.value as 'GET' | 'POST')
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">
                        Endpoint Route
                      </label>
                      <select
                        value={inspectorRoute}
                        onChange={(e) => setInspectorRoute(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
                      >
                        <option value="/api/v1/health">
                          GET /api/v1/health
                        </option>
                        <option value="/api/v1/store/inventory">
                          GET /api/v1/store/inventory
                        </option>
                        <option value="/api/v1/admin/sales">
                          GET /api/v1/admin/sales (Secured)
                        </option>
                        <option value="/api/v1/admin/ai">
                          POST /api/v1/admin/ai (MAX-MIND)
                        </option>
                      </select>
                    </div>
                  </div>
                  {inspectorMethod === 'POST' && (
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">
                        Request Body (JSON)
                      </label>
                      <input
                        type="text"
                        value={inspectorBody}
                        onChange={(e) => setInspectorBody(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded tracking-wider"
                  >
                    EXECUTE EDGE REQUEST
                  </button>
                </form>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">
                    Response Output
                  </span>
                  <pre className="p-4 rounded bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto max-h-96">
                    {inspectorResponse}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
