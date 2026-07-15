import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { LEAD_STATUSES } from "@/lib/crm";

export const runtime = "nodejs";

type LeadBody = {
  name?: string;
  email?: string;
  website?: string;
  message?: string;
  company?: string; // honeypot: real users never fill this
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clamp = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";


/** Internal endpoints (GET/PATCH) require the CRM access key. */
function authorized(req: Request): boolean {
  const key = process.env.CRM_ACCESS_KEY;
  if (!key) return false; // locked until configured
  const url = new URL(req.url);
  return req.headers.get("x-crm-key") === key || url.searchParams.get("key") === key;
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

  const { error } = await supabase.from("leads").insert({
    name,
    email,
    website: website || null,
    message: message || null,
    source: "audit_form",
  });

  if (error) {
    console.error("[leads] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
