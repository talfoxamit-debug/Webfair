/**
 * Renders a signed Website Agreement into a self-contained HTML email so both
 * the client and Tal get a permanent copy the moment it's signed. Inline styles
 * only — email clients strip <style>/external CSS.
 */
import { buildAgreement, resolveAgreement, type AgreementConfig } from "@/lib/agreement";

const NAVY = "#0C2333";
const GREEN = "#18894C";
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function renderAgreementEmailHtml(
  rawCfg: Partial<AgreementConfig>,
  sig: { signer: string; method: string; ip: string; signedAt: string },
): string {
  const cfg = resolveAgreement(rawCfg);
  const { deposit, clauses, money, listFee, savings, discountPct } = buildAgreement(cfg);
  const when = new Date(sig.signedAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

  const rows: [string, string][] = [
    ["Package", cfg.pkg],
    ["Project fee", (savings > 0 ? `${money(cfg.projectFee)} (list ${money(listFee)}, ${discountPct}% off)` : money(cfg.projectFee))],
    ["Deposit to start", money(deposit)],
    ["Care plan", `${money(cfg.careMonthly)}/mo`],
  ];

  const summary = rows
    .map(
      ([l, v]) =>
        `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">${esc(l)}</td><td style="padding:6px 0;text-align:right;font-weight:700;color:${NAVY};font-size:13px;">${esc(v)}</td></tr>`,
    )
    .join("");

  const body = clauses
    .map(
      (c) =>
        `<h3 style="margin:20px 0 6px;color:${NAVY};font-size:15px;">${esc(c.h)}</h3>` +
        c.body.map((line) => `<p style="margin:4px 0;color:#334155;font-size:13px;line-height:1.6;">${esc(line)}</p>`).join(""),
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
    <div style="background:linear-gradient(100deg,${NAVY},#123a52);border-radius:14px 14px 0 0;padding:16px 20px;color:#fff;">
      <span style="font-size:18px;font-weight:800;">Stack<span style="color:#CBFF3C;">wrk</span></span>
      <span style="float:right;color:rgba(255,255,255,.6);font-size:12px;padding-top:4px;">Signed Agreement</span>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:22px;">
      <div style="background:#f2faf5;border:1px solid #cfe9d8;border-radius:10px;padding:12px 14px;margin-bottom:16px;">
        <b style="color:${GREEN};">✓ Signed by ${esc(sig.signer)}</b> on ${esc(when)}.<br>
        <span style="color:#64748b;font-size:12px;">Recorded electronically · method: ${esc(sig.method)}${sig.ip ? ` · IP ${esc(sig.ip)}` : ""}, legally binding under the U.S. E-SIGN Act.</span>
      </div>
      <h1 style="margin:0 0 2px;color:${NAVY};font-size:20px;">Website Design &amp; Development Agreement</h1>
      <p style="margin:0 0 14px;color:#64748b;font-size:12px;">Fox Solutions LLC, d/b/a Stackwrk · ${esc(cfg.clientName)}</p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;padding:4px 12px;">${summary}</table>
      ${body}
      <p style="margin:22px 0 0;color:#94a3b8;font-size:11px;">Questions? Reply to this email or call (754) 551-2828 · hello@stackwrk.com</p>
    </div>
  </div>
</body></html>`;
}
