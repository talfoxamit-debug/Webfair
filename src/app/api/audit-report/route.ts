import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEmail, notifyEmail } from "@/lib/email";
import {
  renderReportEmailHtml,
  reportSummaryText,
  type AuditResult,
  type AuditCategory,
  type CheckStatus,
} from "@/lib/audit-report";
import { site } from "@/lib/content";

export const runtime = "nodejs";
export const maxDuration = 15;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clamp = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const STATUSES: CheckStatus[] = ["pass", "warn", "fail"];

/** Defensively coerce the posted audit into a trusted shape (can't trust the client). */
function parseAudit(raw: unknown): AuditResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const num = (v: unknown, d = 0) => (typeof v === "number" && isFinite(v) ? v : d);
  const cats = Array.isArray(r.categories) ? r.categories : [];
  const categories: AuditCategory[] = cats.slice(0, 8).map((c) => {
    const cc = (c ?? {}) as Record<string, unknown>;
    const checks = Array.isArray(cc.checks) ? cc.checks : [];
    return {
      key: clamp(cc.key, 40) || "cat",
      label: clamp(cc.label, 60) || "Category",
      score: Math.max(0, Math.min(100, Math.round(num(cc.score)))),
      checks: checks.slice(0, 12).map((ch) => {
        const c2 = (ch ?? {}) as Record<string, unknown>;
        const status = STATUSES.includes(c2.status as CheckStatus)
          ? (c2.status as CheckStatus)
          : "warn";
        return {
          label: clamp(c2.label, 120) || "Check",
          status,
          detail: clamp(c2.detail, 300),
        };
      }),
    };
  });
  if (!categories.length) return null;
  return {
    finalUrl: clamp(r.finalUrl, 300) || clamp(r.url, 300),
    score: Math.max(0, Math.min(100, Math.round(num(r.score)))),
    loadMs: Math.max(0, Math.round(num(r.loadMs))),
    pageKb: Math.max(0, Math.round(num(r.pageKb))),
    headline: clamp(r.headline, 200) || "Here's your audit.",
    categories,
  };
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot — silently accept, never store.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, emailed: false, stored: false });
  }

  const name = clamp(body.name, 120);
  const email = clamp(body.email, 200);
  if (!name || !emailRe.test(email)) {
    return NextResponse.json(
      { ok: false, error: "validation", message: "A valid name and email are required." },
      { status: 422 },
    );
  }

  const result = parseAudit(body.result ?? body.audit);
  if (!result) {
    return NextResponse.json(
      { ok: false, error: "no_audit", message: "Run an audit first, then request the report." },
      { status: 422 },
    );
  }

  const summary = reportSummaryText(name, result);

  // 1) Store the lead + audit in the CRM (best-effort; graceful if unconfigured).
  let stored = false;
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("leads").insert({
        name,
        email,
        website: result.finalUrl || null,
        message: summary,
        source: "instant_audit",
      });
      if (error) console.error("[audit-report] lead insert failed:", error.message);
      else stored = true;
    }
  } catch (e) {
    console.error("[audit-report] supabase error:", (e as Error).message);
  }

  // 2) Email the full report to the visitor (best-effort).
  const html = renderReportEmailHtml({
    name,
    result,
    bookUrl: site.calendlyUrl,
    siteUrl: `https://${site.domain}`,
  });
  const send = await sendEmail({
    to: email,
    subject: `Your website audit: ${result.score}/100`,
    html,
    replyTo: site.email,
  });

  // 3) Notify Tal of the new lead (best-effort, only if configured).
  const notify = notifyEmail();
  if (notify) {
    await sendEmail({
      to: notify,
      subject: `New audit lead: ${name} (${result.score}/100)`,
      html: `<pre style="font:14px ui-monospace,monospace;white-space:pre-wrap;">${summary
        .replace(/</g, "&lt;")}\n\nEmail: ${email}</pre>`,
      replyTo: email,
    });
  }

  return NextResponse.json({ ok: true, emailed: send.sent, stored });
}
