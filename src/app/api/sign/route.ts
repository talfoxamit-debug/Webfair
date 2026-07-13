import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/crm-auth";

export const runtime = "nodejs";

/** POST { config, signer } → record an e-signature. Public (clients sign without login). */
export async function POST(req: Request) {
  let body: { config?: unknown; signer?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "bad" }, { status: 400 }); }
  const signer = (body.signer || "").toString().trim();
  if (signer.length < 2 || !body.config) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 422 });
  }
  const cfg = body.config as { clientName?: string };
  const id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from("signatures").insert({
      id,
      business: cfg.clientName || "",
      signer,
      data: body.config,
      signed_at: new Date().toISOString(),
      user_agent: req.headers.get("user-agent") || "",
    });
    if (error) return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }
  // If Supabase isn't configured we still confirm — the signature intent is captured client-side.
  return NextResponse.json({ ok: true, id });
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
