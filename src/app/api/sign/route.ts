import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/crm-auth";

export const runtime = "nodejs";

/** POST { config, signer } → record an e-signature. Public (clients sign without login). */
export async function POST(req: Request) {
  let body: { config?: unknown; signer?: string; method?: string; drawing?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "bad" }, { status: 400 }); }
  const signer = (body.signer || "").toString().trim();
  if (signer.length < 2 || !body.config) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 422 });
  }
  const cfg = body.config as { clientName?: string };
  const id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  const signedAt = new Date().toISOString();
  // Capture signing evidence for a defensible e-signature record.
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "";
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
    if (error) return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }
  // If Supabase isn't configured we still confirm — the signature intent is captured client-side.
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
