import crypto from "crypto";

/**
 * Tiny team auth for the CRM. Users live in the CRM_USERS env var
 * (format: "tal:pass1|othman:pass2") — never in code. Sessions are signed with
 * an HMAC of the username using CRM_ACCESS_KEY as the secret, so the cookie
 * can't be forged and no password is ever stored client-side.
 */
const SECRET = process.env.CRM_ACCESS_KEY || "stackwrk-crm-dev-secret";
export const SESSION_COOKIE = "crm_session";

export function getUsers(): Record<string, string> {
  const out: Record<string, string> = {};
  (process.env.CRM_USERS || "").split("|").forEach((pair) => {
    const i = pair.indexOf(":");
    if (i > 0) out[pair.slice(0, i).trim()] = pair.slice(i + 1);
  });
  return out;
}

export function checkLogin(username: string, password: string): boolean {
  const users = getUsers();
  return Boolean(users[username]) && users[username] === password;
}

export function makeToken(username: string): string {
  const h = crypto.createHmac("sha256", SECRET).update(username).digest("base64url");
  return Buffer.from(username).toString("base64url") + "." + h;
}

export function verifyToken(token?: string | null): string | null {
  if (!token) return null;
  const [u64, h] = token.split(".");
  if (!u64 || !h) return null;
  let username: string;
  try { username = Buffer.from(u64, "base64url").toString(); } catch { return null; }
  const expected = crypto.createHmac("sha256", SECRET).update(username).digest("base64url");
  if (h.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(h), Buffer.from(expected))) return null;
  return getUsers()[username] ? username : null;
}
