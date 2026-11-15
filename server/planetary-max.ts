import { Hono } from 'hono';
import { z } from 'zod';

import type { Bindings } from './types';
import beemaxFinanceRouter from './beemax-finance';
import { sovereignAuthMiddleware } from './middleware/auth';
import adminRouter from './routes/admin';
import storeRouter from './routes/store';

const app = new Hono<{ Bindings: Bindings }>();
const leagues = ['NFL', 'NBA', 'MLB', 'SOCCER', 'MMA'] as const;

// Secure every admin endpoint, including routes registered later in this file.
app.use('/api/v1/admin/*', sovereignAuthMiddleware);
app.route('/api/v1/store', storeRouter);
app.route('/api/v1/admin', adminRouter);

app.get('/api/v1/health', (c) => c.json({
  ok: true,
  status: 'online',
  runtime: 'cloudflare-workers',
  timestamp: Date.now(),
  protocol: 'DAT-JURREAUISM-v1',
}));

const ArtworkSchema = z.object({
  creator: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  medium: z.string().trim().min(1).max(100),
  dimensions: z.string().trim().max(100).default(''),
  price_cents: z.number().int().min(1).max(100_000_000),
  image_url: z.string().url().max(2048),
  provenance_hash: z.string().trim().regex(/^(?:0x)?[\da-fA-F]{64}$/, 'Expected a SHA-256 hex digest'),
});
const ChessSchema = z.object({
  gameId: z.string().trim().min(3).max(64),
  whitePlayer: z.string().trim().min(1).max(100),
  blackPlayer: z.string().trim().min(1).max(100),
  openingTag: z.string().trim().max(100).default(''),
  pgnData: z.string().trim().min(3).max(50_000),
});
const SportsSchema = z.object({
  eventId: z.string().trim().min(3).max(64),
  league: z.enum(leagues),
  matchup: z.string().trim().min(1).max(200),
  oracleConsensus: z.object({
    predictedWinner: z.string().trim().min(1).max(100),
    confidenceScore: z.number().finite().min(0).max(100),
    dataSourcesCount: z.number().int().min(1).max(1000),
  }).strict(),
});
const MaxMindPromptSchema = z.object({ prompt: z.string().trim().min(1).max(4000) }).strict();

function sameOriginWrite(c: { req: { header(name: string): string | undefined; url: string } }) {
  const origin = c.req.header('Origin');
  return Boolean(origin && origin === new URL(c.req.url).origin);
}

async function readJson(c: { req: { header(name: string): string | undefined; json(): Promise<unknown> } }) {
  const contentLength = Number(c.req.header('Content-Length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > 60_000) throw new Error('Request body too large');
  const body = await c.req.json();
  if (new TextEncoder().encode(JSON.stringify(body)).byteLength > 60_000) throw new Error('Request body too large');
  return body;
}

app.get('/api/artworks', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT a.id, a.artist_id, a.title, u.username AS artist_name,
              ap.bio, ap.portfolio_url, a.medium, a.dimensions, a.price_cents,
              a.image_url, a.status, a.metadata_hash AS provenance_hash
       FROM artworks a JOIN users u ON u.id = a.artist_id
       LEFT JOIN artist_profiles ap ON ap.user_id = a.artist_id
       ORDER BY a.created_at DESC LIMIT 100`,
    ).all();
    return c.json({ artworks: results ?? [] });
  } catch (error) {
    console.error('Unable to read artwork catalog:', error);
    return c.json({ error: 'Artwork catalog is unavailable. Apply the D1 migrations.' }, 503);
  }
});

app.post('/api/artworks', async (c) => {
  if (!sameOriginWrite(c)) return c.json({ success: false, error: 'A same-origin request is required.' }, 403);
  let parsed;
  try { parsed = ArtworkSchema.safeParse(await readJson(c)); } catch (error) {
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Invalid JSON body.' }, 400);
  }
  if (!parsed.success) return c.json({ success: false, error: 'Invalid artwork data.', details: parsed.error.flatten() }, 400);
  const input = parsed.data;
  try {
    const creator = await c.env.DB.prepare('SELECT id FROM users WHERE id = ? OR username = ? LIMIT 1').bind(input.creator, input.creator).first<{ id: string }>();
    if (!creator) return c.json({ success: false, error: 'Creator account was not found. Use an existing artist account username or ID.' }, 400);
    await c.env.DB.prepare(
      `INSERT INTO artworks (id, artist_id, title, medium, dimensions, price_cents, currency, image_url, status, metadata_hash)
       VALUES (?, ?, ?, ?, ?, ?, 'DAT', ?, 'available', ?)`,
    ).bind(crypto.randomUUID(), creator.id, input.title, input.medium, input.dimensions, input.price_cents, input.image_url, input.provenance_hash.replace(/^0x/i, '').toLowerCase()).run();
    return c.json({ success: true, message: 'Artwork listed.', artwork: { artist_id: creator.id, title: input.title } }, 201);
  } catch (error) {
    console.error('Unable to save artwork:', error);
    return c.json({ success: false, error: 'Artwork could not be saved to D1.' }, 503);
  }
});

app.get('/v1/dat/chess/list', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT game_id, white_player, black_player, opening_tag, pgn_data, status, updated_at FROM chess_games ORDER BY updated_at DESC LIMIT 50').all();
    return c.json({ success: true, games: results ?? [] });
  } catch (error) {
    console.error('Unable to read chess records:', error);
    return c.json({ success: false, error: 'Chess records are unavailable. Apply the D1 migrations.' }, 503);
  }
});

app.post('/v1/dat/chess', async (c) => {
  if (!sameOriginWrite(c)) return c.json({ success: false, error: 'A same-origin request is required.' }, 403);
  let parsed;
  try { parsed = ChessSchema.safeParse(await readJson(c)); } catch (error) {
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Invalid JSON body.' }, 400);
  }
  if (!parsed.success) return c.json({ success: false, error: 'Invalid chess record.', details: parsed.error.flatten() }, 400);
  const game = parsed.data;
  try {
    await c.env.DB.prepare(`INSERT INTO chess_games (game_id, white_player, black_player, opening_tag, pgn_data, status) VALUES (?, ?, ?, ?, ?, 'active')`).bind(game.gameId, game.whitePlayer, game.blackPlayer, game.openingTag, game.pgnData).run();
    return c.json({ success: true, game_id: game.gameId }, 201);
  } catch (error) {
    console.error('Unable to save chess record:', error);
    return c.json({ success: false, error: 'Chess record could not be saved. The game ID may already exist.' }, 409);
  }
});

app.get('/v1/dat/sports/list', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT event_id, league, matchup, oracle_consensus_json, updated_at FROM sports_telemetry ORDER BY updated_at DESC LIMIT 50').all<{ event_id: string; league: string; matchup: string; oracle_consensus_json: string; updated_at: string }>();
    const telemetry = (results ?? []).map((row) => {
      let oracle_consensus: unknown = {};
      try { oracle_consensus = JSON.parse(row.oracle_consensus_json); } catch { /* Ignore malformed legacy JSON. */ }
      return { event_id: row.event_id, league: row.league, matchup: row.matchup, oracle_consensus, updated_at: row.updated_at };
    });
    return c.json({ success: true, telemetry });
  } catch (error) {
    console.error('Unable to read sports telemetry:', error);
    return c.json({ success: false, error: 'Sports telemetry is unavailable. Apply the D1 migrations.' }, 503);
  }
});

app.post('/v1/dat/sports', async (c) => {
  if (!sameOriginWrite(c)) return c.json({ success: false, error: 'A same-origin request is required.' }, 403);
  let parsed;
  try { parsed = SportsSchema.safeParse(await readJson(c)); } catch (error) {
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Invalid JSON body.' }, 400);
  }
  if (!parsed.success) return c.json({ success: false, error: 'Invalid sports telemetry.', details: parsed.error.flatten() }, 400);
  const item = parsed.data;
  try {
    await c.env.DB.prepare('INSERT INTO sports_telemetry (event_id, league, matchup, oracle_consensus_json) VALUES (?, ?, ?, ?)').bind(item.eventId, item.league, item.matchup, JSON.stringify(item.oracleConsensus)).run();
    return c.json({ success: true, event_id: item.eventId }, 201);
  } catch (error) {
    console.error('Unable to save sports telemetry:', error);
    return c.json({ success: false, error: 'Sports telemetry could not be saved. The event ID may already exist.' }, 409);
  }
});

app.post('/api/v1/admin/ai', async (c) => {
  let parsed;
  try { parsed = MaxMindPromptSchema.safeParse(await readJson(c)); } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Invalid JSON body.' }, 400);
  }
  if (!parsed.success) return c.json({ error: 'A prompt of 1–4000 characters is required.', details: parsed.error.flatten() }, 400);

  const { prompt } = parsed.data;
  const db = c.env.DB;
  const now = Date.now();
  let inventoryCount: number;
  let totalSales: number;
  let auditCount: number;
  try {
    const [inventory, sales, audits] = await Promise.all([
      db.prepare('SELECT COUNT(*) AS cnt FROM store_inventory').first<{ cnt: number }>(),
      db.prepare('SELECT COUNT(*) AS cnt FROM sales_ledger').first<{ cnt: number }>(),
      db.prepare('SELECT COUNT(*) AS cnt FROM audit_events').first<{ cnt: number }>(),
    ]);
    if (inventory?.cnt == null || sales?.cnt == null || audits?.cnt == null) throw new Error('D1 telemetry returned incomplete counts');
    inventoryCount = inventory.cnt;
    totalSales = sales.cnt;
    auditCount = audits.cnt;
  } catch (error) {
    console.error('MAX-MIND telemetry query failed:', error);
    return c.json({ error: 'Verified D1 telemetry is temporarily unavailable.' }, 503);
  }

  const telemetryContext = `[Verified D1 telemetry captured at ${new Date(now).toISOString()}]\nInventory records: ${inventoryCount}\nSales records: ${totalSales}\nAudit events before this query: ${auditCount}`;
  let reply: string;
  let inferenceMode: 'workers-ai' | 'telemetry-fallback' = 'telemetry-fallback';
  if (c.env.AI) {
    try {
      const result = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: `You are MAX-MIND, an administrative assistant. Use only this verified telemetry for system claims and do not claim unverified services or payments are healthy.\n${telemetryContext}` },
          { role: 'user', content: prompt },
        ],
      });
      reply = result.response?.trim() || 'The AI model returned an empty response.';
      inferenceMode = 'workers-ai';
    } catch (error) {
      console.error('MAX-MIND Workers AI invocation failed:', error);
      reply = `AI inference is unavailable. Verified telemetry:\n${telemetryContext}`;
    }
  } else {
    reply = `Workers AI is not configured. Verified telemetry:\n${telemetryContext}`;
  }

  try {
    await db.prepare(`INSERT INTO audit_events (id, event_type, actor_node, payload_json, created_at) VALUES (?, 'MAX_MIND_VERIFIED_QUERY', 'root_authority_max_jurreau', ?, ?)`)
      .bind(`evt_mind_${crypto.randomUUID().slice(0, 10)}`, JSON.stringify({ prompt, inventoryCount, totalSales, auditCount, inferenceMode }), now).run();
  } catch (error) {
    console.error('MAX-MIND audit write failed:', error);
    return c.json({ error: 'Unable to persist the MAX-MIND audit event.' }, 503);
  }

  return c.json({ ok: true, timestamp: now, telemetry: { inventoryCount, totalSales, auditCount }, inferenceMode, reply });
});

app.route('/', beemaxFinanceRouter);
app.notFound((c) => {
  if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/v1/')) return c.json({ error: 'Not found' }, 404);
  return c.env.ASSETS.fetch(c.req.raw);
});
app.onError((error, c) => {
  console.error('Request failed:', error);
  return c.json({ error: 'Internal server error' }, 500);
});

export { NodeRegistryDO } from '../workers/beemax-core/src/registryDo';
export { BEEMAXSecureNodeRegistryDO } from '../workers/beemax-core/src/secureRegistryDo';
export default app;
