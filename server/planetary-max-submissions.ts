import app from './planetary-max';

// The base Worker registers the shared admin passkey middleware before this
// module adds its routes, so the inbox and publish endpoint remain protected.
const createSubmission = async (c: Parameters<typeof app.post>[1] extends (path: string, handler: infer H) => unknown ? H : never) => {
  let body: {
    domain?: string;
    creator_handle?: string;
    title?: string;
    payload_content?: string;
    stake_zk?: number;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const domain = body.domain?.trim() || 'general';
  const creator = body.creator_handle?.trim();
  const title = body.title?.trim();
  const content = body.payload_content?.trim();
  const stakeZk = body.stake_zk ?? 50;

  if (!creator || !title || !content) {
    return c.json({ error: 'Creator handle, title, and payload are required.' }, 400);
  }
  if (creator.length > 100 || title.length > 200 || content.length > 50_000 || domain.length > 64) {
    return c.json({ error: 'Submission fields exceed the allowed length.' }, 400);
  }
  if (!Number.isSafeInteger(stakeZk) || stakeZk < 0 || stakeZk > 1_000_000) {
    return c.json({ error: 'stake_zk must be a whole number between 0 and 1000000.' }, 400);
  }

  const subId = `sub_${crypto.randomUUID().slice(0, 8)}`;
  const auditId = `evt_sub_${crypto.randomUUID().slice(0, 8)}`;
  const now = Date.now();

  try {
    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO submissions
           (id, domain, creator_handle, title, payload_content, stake_zk, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'STAKED', ?)`
      ).bind(subId, domain, creator, title, content, stakeZk, now),
      c.env.DB.prepare(
        `INSERT INTO audit_events (id, event_type, actor_node, payload_json, created_at)
         VALUES (?, 'MAX_SOVEREIGN_SUBMISSION_STAKED', ?, ?, ?)`
      ).bind(
        auditId,
        creator,
        JSON.stringify({ sub_id: subId, domain, title, stake_zk: stakeZk }),
        now
      ),
    ]);

    return c.json({
      ok: true,
      submission_id: subId,
      stake_zk: stakeZk,
      status: 'STAKED',
    }, 201);
  } catch (error) {
    console.error('Submission intake failed:', error);
    return c.json({ error: 'Failed to process submission intake' }, 500);
  }
};

// Keep the original versioned route and expose the requested unversioned path.
app.post('/api/v1/submissions', createSubmission);
app.post('/api/submissions', createSubmission);

app.get('/api/v1/admin/submissions', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, domain, creator_handle, title, payload_content, stake_zk, status, created_at
       FROM submissions
       ORDER BY created_at DESC`
    ).all();
    return c.json({ ok: true, submissions: results ?? [] });
  } catch (error) {
    console.error('Failed to retrieve submissions queue:', error);
    return c.json({ error: 'Failed to retrieve submissions queue' }, 500);
  }
});

app.post('/api/v1/admin/submissions/:id/publish', async (c) => {
  const subId = c.req.param('id');
  const itemId = `item_${crypto.randomUUID().slice(0, 8)}`;
  const auditId = `evt_pub_${crypto.randomUUID().slice(0, 8)}`;
  const now = Date.now();

  try {
    // D1 batch executes these statements atomically. The status predicate also
    // makes repeat publish attempts a no-op rather than duplicate listings.
    const results = await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO store_inventory (id, title, category, description, price_zk, created_at)
         SELECT ?, title, UPPER(domain),
                'Creator: ' || creator_handle || ' | Payload: ' || payload_content,
                stake_zk, ?
         FROM submissions
         WHERE id = ? AND status = 'STAKED'`
      ).bind(itemId, now, subId),
      c.env.DB.prepare(
        `UPDATE submissions
         SET status = 'PUBLISHED'
         WHERE id = ? AND status = 'STAKED'`
      ).bind(subId),
      c.env.DB.prepare(
        `INSERT INTO audit_events (id, event_type, actor_node, payload_json, created_at)
         SELECT ?, 'MAX_SOVEREIGN_SUBMISSION_PUBLISHED', creator_handle, ?, ?
         FROM submissions
         WHERE id = ? AND status = 'PUBLISHED'`
      ).bind(
        auditId,
        JSON.stringify({ sub_id: subId, item_id: itemId }),
        now,
        subId
      ),
    ]);

    if (results[0]?.meta.changes !== 1 || results[1]?.meta.changes !== 1) {
      const existing = await c.env.DB.prepare(
        'SELECT id FROM submissions WHERE id = ?'
      ).bind(subId).first<{ id: string }>();
      if (!existing) return c.json({ error: 'Submission not found' }, 404);
      return c.json({ error: 'Only staked submissions can be published' }, 409);
    }

    return c.json({ ok: true, published_item_id: itemId, status: 'PUBLISHED' });
  } catch (error) {
    console.error('Submission publishing failed:', error);
    return c.json({ error: 'Failed to publish submission to storefront' }, 500);
  }
});

export { NodeRegistryDO, BEEMAXSecureNodeRegistryDO } from './planetary-max';
export default app;
