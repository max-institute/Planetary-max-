import type { Context, Next } from 'hono';
import type { Bindings } from './types';

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_SIGNED_BODY_BYTES = 60_000;

function decodeBase64Url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Authenticates registered nodes using Ed25519 signatures.
 *
 * Clients sign this UTF-8 message:
 * timestamp + "\\n" + nonce + "\\n" + METHOD + "\\n" + pathname/search + "\\n" +
 * lowercase-hex(SHA-256(raw request body)).
 *
 * X-Max-Timestamp is Unix time in milliseconds. Nonces are single-use and
 * recorded in D1 to reject replayed requests. trusted_nodes.public_key_b64
 * stores the node's raw 32-byte Ed25519 public key in base64url form.
 */
export async function verifyNodeSignature(c: Context<{ Bindings: Bindings }>, next: Next) {
  const nodeId = c.req.header('X-Max-Node-Id');
  const signatureHeader = c.req.header('X-Max-Node-Signature');
  const timestampHeader = c.req.header('X-Max-Timestamp');
  const nonce = c.req.header('X-Max-Nonce');

  if (!nodeId || !signatureHeader || !timestampHeader || !nonce) {
    return c.json({ success: false, error: 'Unauthorized: node ID, signature, timestamp, and nonce are required.' }, 401);
  }
  if (!/^[\w.:-]{1,100}$/.test(nodeId) || !/^\d{13}$/.test(timestampHeader) || !/^[A-Za-z0-9_-]{16,128}$/.test(nonce)) {
    return c.json({ success: false, error: 'Unauthorized: invalid node signature headers.' }, 401);
  }

  const timestamp = Number(timestampHeader);
  const now = Date.now();
  if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > MAX_CLOCK_SKEW_MS) {
    return c.json({ success: false, error: 'Unauthorized: request timestamp is expired or invalid.' }, 401);
  }

  const db = c.env.DB;
  let nodeRecord: { public_key_b64: string } | null;
  try {
    nodeRecord = await db.prepare(
      "SELECT public_key_b64 FROM trusted_nodes WHERE node_id = ? AND status = 'ACTIVE' LIMIT 1",
    ).bind(nodeId).first<{ public_key_b64: string }>();
  } catch (error) {
    console.error('Unable to read node trust record:', error);
    return c.json({ success: false, error: 'Node trust registry is unavailable.' }, 503);
  }
  if (!nodeRecord) return c.json({ success: false, error: 'Forbidden: unrecognized or revoked node.' }, 403);

  const publicKeyBytes = decodeBase64Url(nodeRecord.public_key_b64);
  const signatureBytes = decodeBase64Url(signatureHeader);
  if (!publicKeyBytes || publicKeyBytes.byteLength !== 32 || !signatureBytes || signatureBytes.byteLength !== 64) {
    return c.json({ success: false, error: 'Unauthorized: malformed Ed25519 key or signature.' }, 401);
  }

  let body: ArrayBuffer;
  try {
    body = await c.req.raw.clone().arrayBuffer();
  } catch {
    return c.json({ success: false, error: 'Unable to read signed request body.' }, 400);
  }
  if (body.byteLength > MAX_SIGNED_BODY_BYTES) {
    return c.json({ success: false, error: 'Signed request body is too large.' }, 413);
  }

  try {
    const bodyHash = toHex(await crypto.subtle.digest('SHA-256', body));
    const requestUrl = new URL(c.req.url);
    const signedMessage = `${timestampHeader}\n${nonce}\n${c.req.method.toUpperCase()}\n${requestUrl.pathname}${requestUrl.search}\n${bodyHash}`;
    const publicKey = await crypto.subtle.importKey('raw', toArrayBuffer(publicKeyBytes), { name: 'Ed25519' }, false, ['verify']);
    const valid = await crypto.subtle.verify(
      'Ed25519', publicKey, toArrayBuffer(signatureBytes), toArrayBuffer(new TextEncoder().encode(signedMessage)),
    );
    if (!valid) return c.json({ success: false, error: 'Unauthorized: node signature verification failed.' }, 401);
  } catch (error) {
    console.error('Unable to verify Ed25519 node signature:', error);
    return c.json({ success: false, error: 'Node signature verification is unavailable.' }, 503);
  }

  try {
    await db.prepare('DELETE FROM node_signature_nonces WHERE expires_at <= ?').bind(now).run();
    const nonceResult = await db.prepare(
      'INSERT OR IGNORE INTO node_signature_nonces (node_id, nonce, expires_at) VALUES (?, ?, ?)',
    ).bind(nodeId, nonce, now + MAX_CLOCK_SKEW_MS).run();
    if (nonceResult.meta.changes !== 1) {
      return c.json({ success: false, error: 'Conflict: signed request nonce has already been used.' }, 409);
    }
  } catch (error) {
    console.error('Unable to persist node signature replay guard:', error);
    return c.json({ success: false, error: 'Node signature replay guard is unavailable.' }, 503);
  }

  await next();
}
