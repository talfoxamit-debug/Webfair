import dnsp from "dns/promises";

/**
 * SSRF-safe outbound HTTP fetch for user-submitted URLs (the audit tool,
 * lead email enrichment, etc.). Blocks localhost/internal/private/
 * link-local hosts, including cloud metadata endpoints — checked on every
 * redirect hop, not just the initial URL, so a public host can't redirect
 * its way into an internal one.
 */

const BLOCKED_NAMES = /(^|\.)(localhost|internal|metadata\.google\.internal|instance-data)$|\.local$/i;

/** True if a resolved IP (v4 or v6) is loopback / private / link-local. */
export function isPrivateIp(raw: string): boolean {
  let ip = raw.replace(/%.*$/, "").toLowerCase(); // drop IPv6 zone id
  const mapped = ip.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i);
  if (mapped) ip = mapped[1];
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;          // link-local (incl. cloud metadata)
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true;          // private
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  if (ip === "::1" || ip === "::") return true;
  if (ip.startsWith("fe80")) return true;             // link-local
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true; // unique-local
  return false;
}

/** Literal-hostname guard (no DNS): blocks internal names + private literal IPs. */
export function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
  if (BLOCKED_NAMES.test(h)) return true;
  // If the host is itself a literal IP, screen it directly.
  if (/^[0-9.]+$/.test(h) || h.includes(":")) return isPrivateIp(h);
  return false;
}

/** DNS-resolve a hostname and block if any address is internal (catches names
 *  that point at private IPs). Best-effort: a resolution failure doesn't block —
 *  the fetch will simply fail on its own for a genuinely unreachable host. */
export async function resolvesToPrivate(hostname: string): Promise<boolean> {
  if (/^[0-9.]+$/.test(hostname) || hostname.includes(":")) return isPrivateIp(hostname);
  try {
    const addrs = await dnsp.lookup(hostname, { all: true });
    return addrs.some((a) => isPrivateIp(a.address));
  } catch {
    return false;
  }
}

export function normalizeUrl(raw: string): URL | null {
  let s = raw.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    if (isBlockedHost(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

/** Fetch that validates every redirect hop's host (SSRF-safe). Returns the final
 *  non-redirect Response with its body still readable. */
export async function guardedFetch(start: URL, signal: AbortSignal, userAgent = "StackwrkBot/1.0 (+https://stackwrk.com)"): Promise<Response> {
  let url = start;
  for (let hop = 0; hop < 5; hop++) {
    if (isBlockedHost(url.hostname) || (await resolvesToPrivate(url.hostname))) {
      throw new Error("blocked_host");
    }
    const res = await fetch(url.toString(), {
      redirect: "manual",
      signal,
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return res;
      let next: URL;
      try { next = new URL(loc, url); } catch { throw new Error("bad_redirect"); }
      if (next.protocol !== "http:" && next.protocol !== "https:") throw new Error("bad_redirect");
      url = next;
      continue;
    }
    return res;
  }
  throw new Error("too_many_redirects");
}

/** Read a Response body as text, capped at maxBytes (aborts the stream once hit). */
export async function readBodyCapped(res: Response, maxBytes: number): Promise<string> {
  try {
    const reader = res.body?.getReader();
    if (!reader) return await res.text();
    const decoder = new TextDecoder();
    let html = "", total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (total >= maxBytes) {
        await reader.cancel();
        break;
      }
    }
    html += decoder.decode();
    return html;
  } catch {
    return "";
  }
}
