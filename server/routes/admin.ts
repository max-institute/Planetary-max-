import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Bindings } from '../types';

const adminRouter = new Hono<{ Bindings: Bindings }>();

async function getSales(c: Context<{ Bindings: Bindings }, '/sales'>) {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT s.id, s.item_id, i.title, s.buyer_node, s.amount_zk,
              s.voucher_hash, s.settlement_status, s.created_at
       FROM sales_ledger s
       LEFT JOIN store_inventory i ON s.item_id = i.id
       ORDER BY s.created_at DESC LIMIT 50`,
    ).all();
    const sales = results ?? [];
    return c.json({ status: 'success', protocol: 'DAT-JURREAUISM-v1', sales, ledger: sales });
  } catch (error) {
    console.error('Failed to retrieve sales ledger:', error);
    return c.json({ error: 'Failed to retrieve sales ledger' }, 500);
  }
}

// GET matches the existing browser UI; POST is also supported for compatibility
// with the originally supplied admin-router example.
adminRouter.get('/sales', getSales);
adminRouter.post('/sales', getSales);

export default adminRouter;
