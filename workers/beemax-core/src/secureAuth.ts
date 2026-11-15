import { base64UrlToBytes, decodeUtf8Json } from './utils/jwt';

export interface AuthEnv {
  SESSION_KV: Pick<KVNamespace, 'get'>;
  JWT_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
}

export interface SessionVerificationResult {
  authorized: boolean;
  userId?: string;
  role?: string;
}

interface JwtHeader {
  alg?: unknown;
  typ?: unknown;
  [key: string]: unknown;
}

interface JwtPayload {
  sub?: unknown;
  iss?: unknown;
  aud?: unknown;
  exp?: unknown;
  iat?: unknown;
  nbf?: unknown;
  jti?: unknown;
  role?: unknown;
  [key: string]: unknown;
}

const MAX_TOKEN_LENGTH = 8192;
const MAX_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const CLOCK_SKEW_SECONDS = 30;
const ALLOWED_ROLES = new Set(['operator', 'admin', 'auditor', 'node-agent', 'user']);

function extractCookie(cookieHeader: string, name: string): string | null {
  for (const segment of cookieHeader.split(';')) {
    const separator = segment.indexOf('=');
    if (separator < 0 || segment.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(segment.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

/** Verifies an HS256 session and requires an active KV session record. */
export async function verifyRealUserSession(request: Request, env: AuthEnv): Promise<SessionVerificationResult> {
  try {
    if (
      !env.JWT_SECRET || new TextEncoder().encode(env.JWT_SECRET).byteLength < 32 ||
      !env.JWT_ISSUER || !env.JWT_AUDIENCE ||
      !env.SESSION_KV || typeof env.SESSION_KV.get !== 'function'
    ) return { authorized: false };

    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return { authorized: false };
    const token = extractCookie(cookieHeader, 'beemax_auth_session');
    if (!token || token.length > MAX_TOKEN_LENGTH) return { authorized: false };

    const parts = token.split('.');
    if (parts.length !== 3) return { authorized: false };
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = decodeUtf8Json(encodedHeader);
    const payload = decodeUtf8Json(encodedPayload);
    const signature = base64UrlToBytes(encodedSignature);
    if (!isRecord(header) || !isRecord(payload) || !signature || signature.byteLength !== 32) {
      return { authorized: false };
    }

    const jwtHeader = header as JwtHeader;
    if (
      Object.keys(jwtHeader).some((key) => key !== 'alg' && key !== 'typ') ||
      jwtHeader.alg !== 'HS256' || jwtHeader.typ !== 'JWT'
    ) return { authorized: false };

    const jwtPayload = payload as JwtPayload;
    if (jwtPayload.iss !== env.JWT_ISSUER || jwtPayload.aud !== env.JWT_AUDIENCE) return { authorized: false };

    const userId = jwtPayload.sub;
    const tokenId = jwtPayload.jti;
    const issuedAt = jwtPayload.iat;
    const expiresAt = jwtPayload.exp;
    const notBefore = jwtPayload.nbf;
    if (
      typeof userId !== 'string' || !userId.trim() || userId.length > 128 ||
      typeof tokenId !== 'string' || tokenId.length < 8 || tokenId.length > 64 ||
      (jwtPayload.role !== undefined && (typeof jwtPayload.role !== 'string' || !ALLOWED_ROLES.has(jwtPayload.role))) ||
      typeof issuedAt !== 'number' || !Number.isSafeInteger(issuedAt) ||
      typeof expiresAt !== 'number' || !Number.isSafeInteger(expiresAt)
    ) return { authorized: false };

    const now = Math.floor(Date.now() / 1000);
    if (
      expiresAt <= issuedAt || expiresAt - issuedAt > MAX_TOKEN_TTL_SECONDS ||
      issuedAt > now + CLOCK_SKEW_SECONDS || now >= expiresAt
    ) return { authorized: false };
    if (notBefore !== undefined && (
      typeof notBefore !== 'number' || !Number.isSafeInteger(notBefore) ||
      notBefore > now + CLOCK_SKEW_SECONDS || notBefore >= expiresAt
    )) return { authorized: false };

    const key = await crypto.subtle.importKey(
      'raw',
      toArrayBuffer(new TextEncoder().encode(env.JWT_SECRET)),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const signedContent = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
    const validSignature = await crypto.subtle.verify(
      'HMAC', key, toArrayBuffer(signature), toArrayBuffer(signedContent),
    );
    if (!validSignature) return { authorized: false };

    const sessionStatus = await env.SESSION_KV.get(`session:active:${userId}:${tokenId}`);
    if (sessionStatus !== 'active') return { authorized: false };

    return {
      authorized: true,
      userId,
      role: typeof jwtPayload.role === 'string' ? jwtPayload.role : 'user',
    };
  } catch {
    // Fail closed; do not log cookies, JWTs, or credential material.
    return { authorized: false };
  }
}

/** Returns true only for active users with an operator/admin ACL entry for an existing node. */
export async function checkUserNodeAuthorization(db: D1Database, userId: string, nodeId: string): Promise<boolean> {
  try {
    if (!userId || !nodeId) return false;
    const result = await db.prepare(`
      SELECT 1
      FROM users AS u
      INNER JOIN user_node_permissions AS p ON p.user_id = u.id
      INNER JOIN nodes AS n ON n.id = p.node_id
      WHERE u.id = ?
        AND n.id = ?
        AND u.status = 'active'
        AND p.role IN ('operator', 'admin')
      LIMIT 1
    `).bind(userId, nodeId).first<{ 1: number }>();
    return result !== null;
  } catch {
    return false;
  }
}
