import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/crm-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
const DOC_ID = "prospects";

// Compare two timestamps by the instant they represent, not by their exact
// string form. Postgres serializes timestamptz as "...+00:00" while
// new Date().toISOString() yields "...Z"; the same moment in two spellings must
// count as equal, or optimistic-concurrency would 409 on every save after the
// first and wipe the editor's in-progress changes.
function sameInstant(a: string, b: string): boolean {
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  return Number.isFinite(ta) && Number.isFinite(tb) && ta === tb;
}

/** GET → the shared prospect list (whole document). */
export async function GET(req: Request) {
  if (!getSessionUser(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  const { data, error } = await sb.from("team_crm").select("data, updated_at").eq("id", DOC_ID).maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, data: data?.data ?? [], updatedAt: data?.updated_at ?? null });
}

/**
 * PUT { data: Prospect[], baseUpdatedAt?, force? } -> replace the shared list.
 * Guards against the two ways the single shared document silently loses data:
 *  1. A destructive empty overwrite (a failed load leaving the client with []),
 *     rejected unless force is set.
 *  2. A concurrent overwrite: if the caller's baseUpdatedAt no longer matches
 *     the stored version, the write is rejected so the client can resync
 *     instead of clobbering another editor.
 */
export async function PUT(req: Request) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  let body: { data?: unknown; baseUpdatedAt?: string | null; force?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "bad" }, { status: 400 }); }
  if (!Array.isArray(body.data)) return NextResponse.json({ ok: false, error: "bad_shape" }, { status: 422 });

  const { data: cur, error: readErr } = await sb.from("team_crm").select("data, updated_at").eq("id", DOC_ID).maybeSingle();
  if (readErr) return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  const storedLen = Array.isArray(cur?.data) ? cur!.data.length : 0;

  if (body.data.length === 0 && storedLen > 0 && !body.force) {
    return NextResponse.json({ ok: false, error: "refuse_empty_overwrite", storedCount: storedLen }, { status: 409 });
  }
  if (body.baseUpdatedAt != null && cur?.updated_at && !sameInstant(body.baseUpdatedAt, cur.updated_at)) {
    return NextResponse.json({ ok: false, error: "conflict", currentUpdatedAt: cur.updated_at }, { status: 409 });
  }

  const now = new Date().toISOString();
  // Return the value the database actually stored (its timestamptz form), not
  // the JS ISO string we sent, so the client's next baseUpdatedAt round-trips
  // and matches on the following save.
  const { data: saved, error } = await sb
    .from("team_crm")
    .upsert({ id: DOC_ID, data: body.data, updated_at: now })
    .select("updated_at")
    .single();
  if (error || !saved) return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, updatedAt: saved.updated_at });
}
