import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/crm-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
const DOC_ID = "prospects";

function currentUser(req: Request): string | null {
  const token = req.headers.get("cookie")?.match(/(?:^|;\s*)crm_session=([^;]+)/)?.[1];
  return verifyToken(token ? decodeURIComponent(token) : null);
}

/** GET → the shared prospect list (whole document). */
export async function GET(req: Request) {
  if (!currentUser(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  const { data, error } = await sb.from("team_crm").select("data, updated_at").eq("id", DOC_ID).maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, data: data?.data ?? [], updatedAt: data?.updated_at ?? null });
}

/** PUT { data: Prospect[] } → replace the shared list. Last write wins. */
export async function PUT(req: Request) {
  const user = currentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  let body: { data?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "bad" }, { status: 400 }); }
  if (!Array.isArray(body.data)) return NextResponse.json({ ok: false, error: "bad_shape" }, { status: 422 });
  const { error } = await sb.from("team_crm").upsert({ id: DOC_ID, data: body.data, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
