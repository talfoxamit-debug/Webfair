import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

type LeadBody = {
  name?: string;
  email?: string;
  website?: string;
  message?: string;
  company?: string; // honeypot — real users never fill this
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clamp = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

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
    // Env not configured yet — don't 500 the site, tell the client cleanly.
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
