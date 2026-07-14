import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/crm-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchCallHistory } from "@/lib/quo";

export const runtime = "nodejs";

type ActivityRow = {
  id: string;
  kind: "call" | "message";
  direction: string | null;
  status: string | null;
  duration_seconds: number | null;
  body: string | null;
  transcript: string | null;
  summary: string | null;
  occurred_at: string;
};

/**
 * GET → calls + texts synced from Quo (see /api/quo/webhook).
 *   ?phone=<any format>  → one lead's activity for the drawer: merges what
 *                          the webhook has captured (incl. transcripts) with
 *                          a live Quo call lookup, so call history shows up
 *                          even for calls made before the webhook connected.
 *   (no query)            → most recent activity per number, for surfacing
 *                          numbers you've called or texted that aren't in
 *                          the CRM yet. Names come from quo_contacts when
 *                          Quo already knows one.
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
    const byId = new Map<string, ActivityRow>();
    if (sb) {
      const [{ data: calls }, { data: texts }] = await Promise.all([
        sb.from("quo_calls").select("id, direction, status, duration_seconds, transcript, summary, occurred_at").eq("phone_digits", phone).order("occurred_at", { ascending: false }).limit(50),
        sb.from("quo_messages").select("id, direction, status, body, occurred_at").eq("phone_digits", phone).order("occurred_at", { ascending: false }).limit(50),
      ]);
      (calls ?? []).forEach((r) => byId.set(`call:${r.id}`, {
        id: r.id, kind: "call", direction: r.direction, status: r.status,
        duration_seconds: r.duration_seconds, body: null, transcript: r.transcript, summary: r.summary, occurred_at: r.occurred_at,
      }));
      (texts ?? []).forEach((r) => byId.set(`msg:${r.id}`, {
        id: r.id, kind: "message", direction: r.direction, status: r.status,
        duration_seconds: null, body: r.body, transcript: null, summary: null, occurred_at: r.occurred_at,
      }));
    }
    const live = await fetchCallHistory(phone).catch(() => []);
    for (const c of live) {
      const key = `call:${c.id}`;
      if (byId.has(key)) continue; // DB copy already has richer data (transcript/summary)
      byId.set(key, { id: c.id, kind: "call", direction: c.direction, status: c.status, duration_seconds: c.durationSeconds, body: null, transcript: null, summary: null, occurred_at: c.createdAt || new Date().toISOString() });
    }
    const merged = [...byId.values()].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
    return NextResponse.json({ ok: true, data: merged });
  }

  if (!sb) return NextResponse.json({ ok: true, data: [] });
  const [{ data: calls }, { data: texts }, { data: contacts }] = await Promise.all([
    sb.from("quo_calls").select("phone_digits, phone_pretty, occurred_at"),
    sb.from("quo_messages").select("phone_digits, phone_pretty, occurred_at"),
    sb.from("quo_contacts").select("phone_digits, name"),
  ]);
  const names = new Map((contacts ?? []).map((c) => [c.phone_digits, c.name] as const));
  const agg = new Map<string, { phone_digits: string; phone_pretty: string; last: string; calls: number; texts: number }>();
  for (const r of calls ?? []) {
    const e = agg.get(r.phone_digits) || { phone_digits: r.phone_digits, phone_pretty: r.phone_pretty, last: r.occurred_at, calls: 0, texts: 0 };
    e.calls++; if (r.occurred_at > e.last) e.last = r.occurred_at;
    agg.set(r.phone_digits, e);
  }
  for (const r of texts ?? []) {
    const e = agg.get(r.phone_digits) || { phone_digits: r.phone_digits, phone_pretty: r.phone_pretty, last: r.occurred_at, calls: 0, texts: 0 };
    e.texts++; if (r.occurred_at > e.last) e.last = r.occurred_at;
    agg.set(r.phone_digits, e);
  }
  const out = [...agg.values()]
    .sort((a, b) => b.last.localeCompare(a.last))
    .map((e) => ({ phone_digits: e.phone_digits, phone_pretty: e.phone_pretty, contact_name: names.get(e.phone_digits) || null, last_call: e.last, call_count: e.calls, message_count: e.texts }));
  return NextResponse.json({ ok: true, data: out });
}
