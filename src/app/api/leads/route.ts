import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { LEAD_STATUSES } from "@/lib/crm";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { sendEmail, notifyEmail } from "@/lib/email";
import { PROMO_CODES } from "@/lib/promo";

export const runtime = "nodejs";

type LeadBody = {
  name?: string;
  email?: string;
  website?: string;
  message?: string;
  company?: string; // honeypot: real users never fill this
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  landing_path?: string;
  promo_code?: string;
  promo_extra_pct?: number;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clamp = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";


/** Internal endpoints (GET/PATCH) require the CRM access key in a header.
 *  Header-only (never a URL query param, which would leak the secret into
 *  access logs, browser history, and the Referer header) and compared in
 *  constant time. */
function authorized(req: Request): boolean {
  const key = process.env.CRM_ACCESS_KEY;
  if (!key) return false; // locked until configured
  const provided = req.headers.get("x-crm-key");
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(key);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, leads: data });
}

export async function PATCH(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  let body: { id?: string; status?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }
  const patch: Record<string, string> = {};
  if (body.status !== undefined) {
    if (!(LEAD_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ ok: false, error: "bad_status" }, { status: 422 });
    }
    patch.status = body.status;
  }
  if (body.notes !== undefined) patch.notes = clamp(body.notes, 4000);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "empty_patch" }, { status: 422 });
  }
  const { error } = await supabase.from("leads").update(patch).eq("id", body.id);
  if (error) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  if (!rateLimit(`leads:${getClientIp(req)}`, 12, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited", message: "Too many submissions. Please wait a minute and try again." }, { status: 429 });
  }
  let body: LeadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: silently accept (don't tip off bots) but never store.
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = clamp(body.name, 120);
  const email = clamp(body.email, 200);
  const website = clamp(body.website, 300);
  const message = clamp(body.message, 2000);

  if (!name || !emailRe.test(email)) {
    return NextResponse.json(
      { ok: false, error: "validation", message: "A valid name and email are required." },
      { status: 422 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Env not configured yet: don't 500 the site, tell the client cleanly.
    console.warn("[leads] Supabase env not configured; lead not stored.");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const base = {
    name,
    email,
    website: website || null,
    message: message || null,
    source: clamp(body.source, 60) || "audit_form",
  };
  const attribution = {
    utm_source: clamp(body.utm_source, 120) || null,
    utm_medium: clamp(body.utm_medium, 120) || null,
    utm_campaign: clamp(body.utm_campaign, 160) || null,
    referrer: clamp(body.referrer, 300) || null,
    landing_path: clamp(body.landing_path, 200) || null,
  };
  // Validate the promo code against the known set server-side (don't trust a
  // client-supplied discount percent, even for a non-payment field): the code
  // is real, but the extra percent it carries always comes from our own table.
  const promoCode = clamp(body.promo_code, 20).toUpperCase();
  const promoDef = promoCode ? PROMO_CODES[promoCode] : undefined;
  const promo =
    promoDef?.active ? { promo_code: promoCode, promo_extra_pct: promoDef.extraPercent } : {};

  // Store with attribution + promo. If those columns are not present yet
  // (schema not migrated), retry with the base row only so a lead is never dropped.
  let { error } = await supabase.from("leads").insert({ ...base, ...attribution, ...promo });
  if (error) {
    console.warn("[leads] insert with attribution failed, retrying base only:", error.message);
    ({ error } = await supabase.from("leads").insert(base));
  }
  if (error) {
    console.error("[leads] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  // Notify Tal of the new lead (best-effort, only if configured). Without
  // this, a mockup-request submission landed in the DB with no one told.
  const notify = notifyEmail();
  if (notify) {
    const esc = (s: string) => s.replace(/</g, "&lt;");
    const promoLine = promo.promo_code
      ? `\nReferral: ${esc(promo.promo_code)} (${esc(PROMO_CODES[promo.promo_code].partner)}, +${promo.promo_extra_pct}% extra off)`
      : "";
    await sendEmail({
      to: notify,
      subject: `New lead: ${name}`,
      html: `<pre style="font:14px ui-monospace,monospace;white-space:pre-wrap;">Name: ${esc(name)}\nEmail: ${esc(email)}\nWebsite: ${esc(website || "-")}\nSource: ${esc(base.source)}${promoLine}\n\n${esc(message || "")}</pre>`,
      replyTo: email,
    });
  }

  return NextResponse.json({ ok: true });
}
