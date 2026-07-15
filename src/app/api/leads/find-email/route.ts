import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/crm-auth";
import { normalizeUrl, guardedFetch, readBodyCapped } from "@/lib/safe-fetch";

export const runtime = "nodejs";
export const maxDuration = 20;

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 1_500_000;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Emails that show up in page source but aren't a real contact: platform
// noise (Wix/Squarespace/analytics/CDN), template placeholders, etc.
const JUNK_DOMAIN = /(^|\.)(wixpress|sentry|godaddy|example|schema|w3|domain|yoursite|sentry-next)\.(com|org|io)$/i;
const JUNK_LOCAL = /^(noreply|no-reply|donotreply|postmaster|webmaster|abuse|test|admin@localhost)/i;

function stripNoise(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
}

function bestEmail(html: string): string | null {
  const clean = stripNoise(html);
  // Prefer a real mailto: link (the highest-confidence signal).
  const mailtos = [...clean.matchAll(/mailto:([^"'?\s]+)/gi)].map((m) => { try { return decodeURIComponent(m[1]); } catch { return m[1]; } });
  const candidates = mailtos.length ? mailtos : (clean.match(EMAIL_RE) || []);
  for (const raw of candidates) {
    const email = raw.trim().toLowerCase().replace(/[.,;]+$/, "");
    const at = email.indexOf("@");
    if (at < 1) continue;
    const domain = email.slice(at + 1);
    if (!domain.includes(".") || JUNK_DOMAIN.test(domain) || JUNK_LOCAL.test(email)) continue;
    if (/\.(png|jpe?g|gif|svg|webp|css|js)$/i.test(email)) continue;
    return email;
  }
  return null;
}

function contactPageLink(html: string, base: URL): URL | null {
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const m of links) {
    const [, href, text] = m;
    if (/contact/i.test(href) || /contact\s*us|get\s*in\s*touch/i.test(text)) {
      try {
        const u = new URL(href, base);
        if (u.protocol === "http:" || u.protocol === "https:") return u;
      } catch { /* skip malformed href */ }
    }
  }
  return null;
}

async function fetchPage(url: URL): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await guardedFetch(url, controller.signal, "StackwrkLeadBot/1.0 (+https://stackwrk.com)");
    return await readBodyCapped(res, MAX_BYTES);
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST → best-effort: find a published contact email on a lead's website.
 * Checks the homepage, then one contact-page hop if nothing's on the
 * homepage. Never guesses or fabricates: only returns an email actually
 * published on the page (a mailto: link, or plain text as a fallback).
 * Team login required.
 */
export async function POST(req: Request) {
  const token = req.headers.get("cookie")?.match(/(?:^|;\s*)crm_session=([^;]+)/)?.[1];
  if (!verifyToken(token ? decodeURIComponent(token) : null)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const target = normalizeUrl(body?.url || "");
  if (!target) return NextResponse.json({ ok: false, error: "invalid_url" }, { status: 422 });

  const home = await fetchPage(target);
  let email = home ? bestEmail(home) : null;

  if (!email && home) {
    const contactUrl = contactPageLink(home, target);
    if (contactUrl) {
      const page = await fetchPage(contactUrl);
      email = page ? bestEmail(page) : null;
    }
  }

  return NextResponse.json({ ok: true, email });
}
