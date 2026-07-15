import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/crm-auth";
import { sendEmail, notifyEmail } from "@/lib/email";
import { renderAgreementEmailHtml } from "@/lib/agreement-email";

export const runtime = "nodejs";

// Best-effort in-memory rate limit. This endpoint is public (clients sign
// without logging in) and sends branded email to the config's address, so an
// unthrottled loop could relay spam from our domain or flood the notify inbox.
// Serverless instances are ephemeral so this isn't airtight, but it stops a
// naive burst against a warm instance. IP → recent hit timestamps (ms).
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
function rateLimited(ip: string): boolean {
  const key = ip || "unknown";
  const now = Date.now();
  const recent = (HITS.get(key) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(key, recent);
  if (HITS.size > 5000) HITS.clear(); // crude memory cap
  return recent.length > MAX_PER_WINDOW;
}

/** POST { config, signer } → record an e-signature. Public (clients sign without login). */
export async function POST(req: Request) {
  let body: { config?: unknown; signer?: string; method?: string; drawing?: string; company?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "bad" }, { status: 400 }); }
  // Honeypot: bots fill hidden fields; silently accept without sending/storing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, id: "", ip: "", signedAt: new Date().toISOString() });
  }
  const signer = (body.signer || "").toString().trim();
  if (signer.length < 2 || !body.config) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 422 });
  }
  const ipForLimit = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "";
  if (rateLimited(ipForLimit)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  const cfg = body.config as { clientName?: string };
  const id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  const signedAt = new Date().toISOString();
  // Capture signing evidence for a defensible e-signature record.
  const ip = ipForLimit;
  const userAgent = req.headers.get("user-agent") || "";
  const method = body.method === "drawn" ? "drawn" : "typed";
  // Store the config plus signing evidence in the jsonb column (no schema change).
  const record = {
    ...(body.config as object),
    _signature: { ip, userAgent, method, signedAt, drawing: body.drawing?.slice(0, 60000) || null },
  };
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from("signatures").insert({
      id,
      business: cfg.clientName || "",
      signer,
      data: record,
      signed_at: signedAt,
      user_agent: userAgent,
    });
    // Best-effort: a DB error (e.g. the `signatures` table not created yet) must
    // NOT block a real client from signing and paying. Log it and continue:
    // the signed confirmation + emailed copy still go through.
    if (error) console.error("[sign] signature insert failed:", error.message);
  }

  // Email a permanent copy to the client (and Tal): best-effort, never blocks
  // the signed confirmation the client sees.
  try {
    const html = renderAgreementEmailHtml(body.config as Record<string, unknown>, { signer, method, ip, signedAt });
    const clientEmail = (cfg as { email?: string }).email?.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (clientEmail && emailRe.test(clientEmail)) {
      await sendEmail({ to: clientEmail, subject: "Your signed agreement from Stackwrk", html, replyTo: "hello@stackwrk.com" });
    }
    const notify = notifyEmail();
    if (notify) {
      await sendEmail({ to: notify, subject: `Agreement signed: ${cfg.clientName || signer}`, html, replyTo: clientEmail || undefined });
    }
  } catch (e) {
    console.error("[sign] copy email failed:", (e as Error).message);
  }

  // If Supabase isn't configured we still confirm: the signature intent is captured client-side.
  return NextResponse.json({ ok: true, id, ip, signedAt });
}

/** GET → recent signatures (team login required). Lets the CRM show what's signed. */
export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/(?:^|;\s*)crm_session=([^;]+)/)?.[1];
  if (!verifyToken(token ? decodeURIComponent(token) : null)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: true, data: [] });
  const { data, error } = await sb.from("signatures").select("id, business, signer, signed_at").order("signed_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, data: data ?? [] });
}
