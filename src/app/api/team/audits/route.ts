import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/crm-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const domainOf = (u: string) => {
  try { return new URL(u.startsWith("http") ? u : "https://" + u).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return ""; }
};
// don't surface our own site / demo as "leads"
const SELF = /(^|\.)stackwrk\.com$|apex-fence|vercel\.app$/i;

/**
 * GET → recent audited sites as warm inbound leads (team login required).
 * Everyone who runs the site audit is logged in `audits` even without contact
 * info; this returns the latest score per domain so the CRM can show them.
 */
export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/(?:^|;\s*)crm_session=([^;]+)/)?.[1];
  if (!verifyToken(token ? decodeURIComponent(token) : null)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: true, data: [] });

  const { data, error } = await sb.from("audits").select("url, score, created_at").order("created_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });

  // Keep the most recent audit per domain, drop our own domains.
  const seen = new Set<string>();
  const out: { domain: string; url: string; score: number | null; created_at: string }[] = [];
  for (const a of data ?? []) {
    const d = domainOf(a.url);
    if (!d || SELF.test(d) || seen.has(d)) continue;
    seen.add(d);
    out.push({ domain: d, url: a.url, score: a.score ?? null, created_at: a.created_at });
  }
  return NextResponse.json({ ok: true, data: out });
}
