import type { Context, Next } from 'hono';
import type { Bindings } from '../types';

/** Protect admin APIs; fail closed if the secret is not configured. */
export async function sovereignAuthMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next,
) {
  const providedKey = c.req.header('x-sovereign-passkey');
  const expectedKey = c.env.ADMIN_PASSKEY;

  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return c.json({ error: 'Unauthorized // Invalid MAX-ARCHITECTURE Passkey' }, 401);
  }

  await next();
}
