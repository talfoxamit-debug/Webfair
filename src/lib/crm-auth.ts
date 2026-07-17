import crypto from "crypto";

/**
 * Tiny team auth for the CRM. Users live in the CRM_USERS env var
 * (format: "tal:pass1|othman:pass2"). Never in code. Sessions are a signed HMAC
 * of "username|expiry" using CRM_ACCESS_KEY as the secret, so the cookie can't
 * be forged and no password is ever stored client-side.
 *
 * Fail closed: if CRM_ACCESS_KEY is unset there is no signing secret, so every
 * token fails to verify and no session can be minted. There is deliberately no
 * fallback/default secret (a committed default would make every session
 * forgeable).
 */
export const SESSION_COOKIE = "crm_session";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

/** The signing secret, or null when the CRM is not configured. */
function getSecret(): string | null {
  const s = process.env.CRM_ACCESS_KEY;
  return s && s.length > 0 ? s : null;
}

export function getUsers(): Record<string, string> {
  const out: Record<string, string> = {};
  (process.env.CRM_USERS || "").split("|").forEach((pair) => {
    const i = pair.indexOf(":");
    if (i > 0) out[pair.slice(0, i).trim()] = pair.slice(i + 1);
  });
  return out;
}

/** True only when both a signing secret and at least one user are configured. */
export function isConfigured(): boolean {
  return getSecret() !== null && Object.keys(getUsers()).length > 0;
}

export function checkLogin(username: string, password: string): boolean {
  const users = getUsers();
  const stored = users[username];
  if (!stored) return false;
  const a = Buffer.from(stored);
  const b = Buffer.from(password);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Mint a signed, expiring session token. Returns null when unconfigured. */
export function makeToken(username: string): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = `${username}|${Date.now() + TOKEN_TTL_MS}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return Buffer.from(payload).toString("base64url") + "." + sig;
}

/** Verify a token and return the username, or null if invalid/expired/unconfigured. */
export function verifyToken(token?: string | null): string | null {
  const secret = getSecret();
  if (!secret || !token) return null;
  const [p64, sig] = token.split(".");
  if (!p64 || !sig) return null;
  let payload: string;
  try { payload = Buffer.from(p64, "base64url").toString(); } catch { return null; }
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  const sep = payload.lastIndexOf("|");
  if (sep < 0) return null;
  const username = payload.slice(0, sep);
  const exp = Number(payload.slice(sep + 1));
  if (!username || !Number.isFinite(exp) || Date.now() > exp) return null;
  return getUsers()[username] ? username : null;
}

/**
 * Parse the crm_session cookie off a request and return the signed-in username,
 * or null. Single source of truth so the cookie name lives in SESSION_COOKIE
 * only, not in a regex copy-pasted across every route.
 */
export function getSessionUser(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!m) return null;
  let raw = m[1];
  try { raw = decodeURIComponent(raw); } catch { /* use as-is */ }
  return verifyToken(raw);
}
