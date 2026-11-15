import { Hono } from 'hono';
import type { Bindings } from '../types';

const storeRouter = new Hono<{ Bindings: Bindings }>();

storeRouter.get('/inventory', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, title, description, category, price_zk, stock_count, media_url, status
       FROM store_inventory
       WHERE status = 'AVAILABLE'
       ORDER BY created_at DESC`,
    ).all();
    return c.json({ items: results ?? [] });
  } catch (error) {
    console.error('Storefront inventory query failed:', error);
    return c.json({ error: 'Failed to fetch storefront inventory' }, 500);
  }
});

storeRouter.post('/purchase', async (c) => {
  let body: { itemId?: string; buyerNode?: string; voucherHash?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const itemId = body.itemId?.trim();
  if (!itemId) return c.json({ error: 'Missing itemId' }, 400);

  try {
    const item = await c.env.DB.prepare(
      `SELECT id, title, price_zk, stock_count, status
       FROM store_inventory WHERE id = ?`,
    ).bind(itemId).first<{
      id: string;
      title: string;
      price_zk: number;
      stock_count: number;
      status: string;
    }>();

    if (!item || item.status !== 'AVAILABLE' || item.stock_count < 1) {
      return c.json({ error: 'Item unavailable or out of stock' }, 409);
    }

    const now = Date.now();
    const saleId = `sale_${crypto.randomUUID().slice(0, 12)}`;
    const auditId = `evt_${crypto.randomUUID().slice(0, 12)}`;
    const buyerNode = body.buyerNode?.trim() || 'node_guest_sovereign';
    const voucherHash = body.voucherHash?.trim() || `zkv_${crypto.randomUUID().replace(/-/g, '')}`;
    const nextStock = item.stock_count - 1;
    const nextStatus = nextStock === 0 ? 'SOLD_OUT' : 'AVAILABLE';

    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO sales_ledger
         (id, item_id, buyer_node, amount_zk, voucher_hash, settlement_status, created_at)
         VALUES (?, ?, ?, ?, ?, 'ESCROW_LOCKED', ?)`,
      ).bind(saleId, item.id, buyerNode, item.price_zk, voucherHash, now),
      c.env.DB.prepare(
        `UPDATE store_inventory SET stock_count = ?, status = ? WHERE id = ?`,
      ).bind(nextStock, nextStatus, item.id),
      c.env.DB.prepare(
        `INSERT INTO audit_events (id, event_type, actor_node, payload_json, created_at)
         VALUES (?, 'ZK_VOUCHER_PURCHASE', ?, ?, ?)`,
      ).bind(auditId, buyerNode, JSON.stringify({ saleId, itemId: item.id, amountZk: item.price_zk, voucherHash }), now),
    ]);

    return c.json({ ok: true, saleId, voucherHash, itemId: item.id, amountZk: item.price_zk, remainingStock: nextStock });
  } catch (error) {
    console.error('Storefront purchase failed:', error);
    return c.json({ error: 'Failed to process ZK-Voucher purchase' }, 500);
  }
});

export default storeRouter;
