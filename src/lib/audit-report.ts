/**
 * Turns a raw site-audit result into the artefacts the lead funnel needs:
 *  - a prioritized fix list (worst problems first),
 *  - a branded HTML email (the "full report" the visitor gets),
 *  - a compact text summary stored on the CRM lead so Tal sees the score
 *    and top issues at a glance.
 *
 * Pure/serializable: safe to import in both the API route and the client.
 */

import { site } from "@/lib/content";

export type CheckStatus = "pass" | "warn" | "fail";
export type AuditCheck = { label: string; status: CheckStatus; detail: string };
export type AuditCategory = { key: string; label: string; score: number; checks: AuditCheck[] };

export type AuditResult = {
  finalUrl: string;
  score: number;
  loadMs: number;
  pageKb: number;
  headline: string;
  categories: AuditCategory[];
};

export type Fix = { area: string; label: string; detail: string; status: "fail" | "warn" };

/** Flatten every failing/warning check, worst (fail) first, grouped by severity. */
export function prioritizedFixes(categories: AuditCategory[]): Fix[] {
  const fixes: Fix[] = [];
  for (const cat of categories) {
    for (const c of cat.checks) {
      if (c.status === "fail" || c.status === "warn") {
        fixes.push({ area: cat.label, label: c.label, detail: c.detail, status: c.status });
      }
    }
  }
  // fails before warns; stable within each group
  return fixes.sort((a, b) => (a.status === b.status ? 0 : a.status === "fail" ? -1 : 1));
}

/** One-line-per-issue text summary saved to the CRM lead's message field. */
export function reportSummaryText(name: string, result: AuditResult): string {
  const fixes = prioritizedFixes(result.categories);
  const top = fixes.slice(0, 5).map((f) => `• [${f.status.toUpperCase()}] ${f.area}: ${f.label}`);
  return [
    `Instant audit requested by ${name}.`,
    `Site: ${result.finalUrl}`,
    `Score: ${result.score}/100. ${result.headline}`,
    `Load: ${result.loadMs}ms · ${result.pageKb}KB`,
    fixes.length ? `Top issues:` : `No major issues flagged.`,
    ...top,
    fixes.length > 5 ? `…and ${fixes.length - 5} more in the report.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function scoreColor(score: number): string {
  if (score >= 85) return "#7bb800";
  if (score >= 65) return "#8fae00";
  if (score >= 40) return "#c98a00";
  return "#d6336c";
}

/**
 * The full report email. Inline styles + table layout only: that's what
 * survives Gmail/Outlook/Apple Mail. Dark header, clean light body.
 */
export function renderReportEmailHtml(opts: {
  name: string;
  result: AuditResult;
  bookUrl: string;
  siteUrl: string;
}): string {
  const { name, result, bookUrl, siteUrl } = opts;
  const fixes = prioritizedFixes(result.categories);
  const ring = scoreColor(result.score);

  const catRows = result.categories
    .map((cat) => {
      const c = scoreColor(cat.score);
      return `
      <tr>
        <td style="padding:6px 0;font:600 14px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a0f2e;width:120px;">${esc(
          cat.label,
        )}</td>
        <td style="padding:6px 0;">
          <div style="background:#eceaf2;border-radius:9px;height:9px;width:100%;">
            <div style="background:${c};border-radius:9px;height:9px;width:${Math.max(
              4,
              cat.score,
            )}%;"></div>
          </div>
        </td>
        <td style="padding:6px 0 6px 12px;font:700 14px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:${c};text-align:right;width:40px;">${cat.score}</td>
      </tr>`;
    })
    .join("");

  const fixItems = fixes
    .map((f) => {
      const dot = f.status === "fail" ? "#d6336c" : "#c98a00";
      const tag = f.status === "fail" ? "Fix now" : "Improve";
      return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eceaf2;vertical-align:top;">
          <span style="display:inline-block;background:${dot};color:#fff;font:700 10px -apple-system,Segoe UI,Roboto,Arial,sans-serif;text-transform:uppercase;letter-spacing:.5px;padding:3px 8px;border-radius:5px;">${tag}</span>
        </td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid #eceaf2;">
          <div style="font:600 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a0f2e;">${esc(
            f.label,
          )} <span style="color:#8b81a0;font-weight:500;">· ${esc(f.area)}</span></div>
          <div style="font:400 14px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b6480;margin-top:3px;">${esc(
            f.detail,
          )}</div>
        </td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html>
<body style="margin:0;background:#f4f2f8;padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(26,15,46,.1);">
    <!-- header -->
    <tr><td style="background:#12081f;padding:28px 32px;">
      <div style="font:800 20px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#ffffff;letter-spacing:.5px;">STACKWRK</div>
      <div style="font:500 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#cbff3c;margin-top:2px;">Your full website audit</div>
    </td></tr>

    <!-- greeting + score -->
    <tr><td style="padding:32px 32px 8px;">
      <p style="font:400 16px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a0f2e;margin:0 0 20px;">Hi ${esc(
        name,
      )}, here's the full breakdown for <a href="${esc(
        result.finalUrl,
      )}" style="color:#7c3aed;">${esc(result.finalUrl)}</a>.</p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;padding-right:20px;">
          <div style="width:96px;height:96px;border-radius:50%;background:${ring};text-align:center;">
            <div style="font:800 34px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#ffffff;line-height:96px;">${result.score}</div>
          </div>
        </td>
        <td style="vertical-align:middle;">
          <div style="font:700 18px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a0f2e;">${esc(
            result.headline,
          )}</div>
          <div style="font:400 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8b81a0;margin-top:4px;">Overall score out of 100 · ${result.loadMs}ms load · ${result.pageKb}KB</div>
        </td>
      </tr></table>
    </td></tr>

    <!-- category bars -->
    <tr><td style="padding:24px 32px 8px;">
      <div style="font:700 12px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8b81a0;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Category scores</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${catRows}</table>
    </td></tr>

    <!-- prioritized fixes -->
    <tr><td style="padding:24px 32px 8px;">
      <div style="font:700 12px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8b81a0;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Your prioritized fix list</div>
      ${
        fixes.length
          ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${fixItems}</table>`
          : `<p style="font:400 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a0f2e;">Your site passed every check. Impressive. A few conversion tweaks could still squeeze out more leads. Let's talk.</p>`
      }
    </td></tr>

    <!-- where we come in -->
    <tr><td style="padding:24px 32px 4px;">
      <div style="font:700 12px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8b81a0;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Where we come in</div>
      <div style="font:400 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#3a3450;line-height:1.6;">
        Here is the good news: <strong style="color:#1a0f2e;">every issue above is fixable, and we can fix all of it.</strong>
        Stackwrk builds fast, custom, mobile-first sites and the systems behind them (lead capture, automations,
        a custom CRM, even a 24/7 AI assistant) that turn "near me" searches into booked jobs. Whatever your audit
        flagged, we do not just patch it, we rebuild it to convert and keep improving it month after month.
      </div>
    </td></tr>

    <!-- dual CTA: book OR call -->
    <tr><td style="padding:20px 32px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2f8;border-radius:12px;"><tr>
        <td style="padding:22px 24px;">
          <div style="font:700 17px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a0f2e;">Let's fix it. Two easy ways to start:</div>
          <div style="font:400 14px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b6480;margin:6px 0 16px;">Book a free 30-minute call, or just call or text me directly. Whatever is easier for you, no obligation either way.</div>
          <a href="${esc(bookUrl)}" style="display:inline-block;background:#cbff3c;color:#12081f;font:700 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;text-decoration:none;padding:12px 22px;border-radius:9px;margin:0 8px 8px 0;">Book my free call &rarr;</a>
          <a href="${esc(site.phoneHref)}" style="display:inline-block;background:#ffffff;color:#12081f;border:1px solid #d8d3e4;font:700 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;text-decoration:none;padding:12px 22px;border-radius:9px;margin:0 0 8px 0;">Call or text ${esc(site.phone)}</a>
        </td>
      </tr></table>
    </td></tr>

    <!-- footer -->
    <tr><td style="padding:20px 32px 28px;border-top:1px solid #eceaf2;">
      <div style="font:400 12px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#a49dbb;">Tal at Stackwrk · <a href="${esc(
        siteUrl,
      )}" style="color:#7c3aed;">stackwrk.com</a> · <a href="${esc(site.phoneHref)}" style="color:#7c3aed;">${esc(site.phone)}</a> · <a href="mailto:${esc(site.email)}" style="color:#7c3aed;">${esc(site.email)}</a><br/>You got this because you ran a free audit on stackwrk.com.</div>
    </td></tr>
  </table>
</body>
</html>`;
}
