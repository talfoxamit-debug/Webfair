import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/crm-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchCallHistory } from "@/lib/quo";

export const runtime = "nodejs";

type CallRow = {
  id: string;
  direction: string | null;
  status: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  summary: string | null;
  occurred_at: string;
};

/**
 * GET → call history synced from Quo (see /api/quo/webhook).
 *   ?phone=<any format>  → one lead's call log for the drawer. Merges what
 *                          the webhook has captured (incl. transcripts) with
 *                          a live Quo lookup, so history shows up even for
 *                          calls made before the webhook was connected.
 *   (no query)            → most recent call per number, for surfacing
 *                          numbers you called that aren't in the CRM yet.
 * Team login required.
 */
export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/(?:^|;\s*)crm_session=([^;]+)/)?.[1];
  if (!verifyToken(token ? decodeURIComponent(token) : null)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const phone = (searchParams.get("phone") || "").replace(/\D/g, "").slice(-10);

  if (phone) {
    const byId = new Map<string, CallRow>();
    if (sb) {
      const { data } = await sb
        .from("quo_calls")
        .select("id, direction, status, duration_seconds, transcript, summary, occurred_at")
        .eq("phone_digits", phone)
        .order("occurred_at", { ascending: false })
        .limit(50);
      (data ?? []).forEach((r) => byId.set(r.id, r as CallRow));
    }
    const live = await fetchCallHistory(phone).catch(() => []);
    for (const c of live) {
      if (byId.has(c.id)) continue; // DB copy already has richer data (transcript/summary)
      byId.set(c.id, { id: c.id, direction: c.direction, status: c.status, duration_seconds: c.durationSeconds, transcript: null, summary: null, occurred_at: c.createdAt || new Date().toISOString() });
    }
    const merged = [...byId.values()].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
    return NextResponse.json({ ok: true, data: merged });
  }

  if (!sb) return NextResponse.json({ ok: true, data: [] });
  const { data, error } = await sb.from("quo_calls").select("phone_digits, phone_pretty, contact_name, occurred_at").order("occurred_at", { ascending: false }).limit(1000);
  if (error) return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });

  const counts = new Map<string, number>();
  for (const r of data ?? []) counts.set(r.phone_digits, (counts.get(r.phone_digits) || 0) + 1);
  const seen = new Set<string>();
  const out: { phone_digits: string; phone_pretty: string; contact_name: string | null; last_call: string; call_count: number }[] = [];
  for (const r of data ?? []) {
    if (seen.has(r.phone_digits)) continue;
    seen.add(r.phone_digits);
    out.push({ phone_digits: r.phone_digits, phone_pretty: r.phone_pretty, contact_name: r.contact_name, last_call: r.occurred_at, call_count: counts.get(r.phone_digits) || 1 });
  }
  return NextResponse.json({ ok: true, data: out });
}
