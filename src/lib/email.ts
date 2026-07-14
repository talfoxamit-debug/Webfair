/**
 * Minimal, dependency-free transactional email via Resend's HTTP API.
 * Gated on env: when RESEND_API_KEY is missing we return {sent:false,
 * reason:"not_configured"} so callers degrade gracefully instead of throwing —
 * same pattern as the Supabase client.
 *
 * Required env (set in Vercel, never committed):
 *   RESEND_API_KEY          — from resend.com
 *   REPORT_FROM_EMAIL       — verified sender, e.g. "Stackwrk <audit@stackwrk.com>"
 *   REPORT_NOTIFY_EMAIL     — (optional) where lead alerts go, e.g. Tal's inbox
 */

type SendResult = { sent: boolean; reason?: string };

const DEFAULT_FROM = "Stackwrk <onboarding@resend.dev>";
const EMAIL_RE = /[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+/;

/**
 * Resolve a Resend-valid `from` header. Resend accepts ONLY `email@domain` or
 * `Name <email@domain>` and returns a 422 on anything else — the single most
 * common cause of "emails silently never send" is a REPORT_FROM_EMAIL typo
 * (missing angle brackets, wrapping quotes, a name with no email). Rather than
 * let one typo 422 every message, we auto-heal the common mistakes and fall
 * back to the known-good default when the value is unusable.
 */
export function reportFromEmail(): string {
  const raw = (process.env.REPORT_FROM_EMAIL || "").trim();
  if (!raw) return DEFAULT_FROM;
  const m = raw.match(EMAIL_RE);
  if (!m) return DEFAULT_FROM; // no usable email address → safe default
  const email = m[0];
  // Always rebuild from the parsed email so we emit exactly `email` or
  // `Name <email>`. Everything that isn't the email becomes the display name,
  // with brackets/quotes/trailing punctuation stripped — this heals the common
  // typos (missing brackets, wrapping or RFC display-name quotes) uniformly.
  const name = raw
    .replace(EMAIL_RE, "")
    .replace(/["'<>]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[\s,;:]+$/, "")
    .trim();
  return name ? `${name} <${email}>` : email;
}

export function notifyEmail(): string | null {
  return process.env.REPORT_NOTIFY_EMAIL || null;
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: "not_configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: reportFromEmail(),
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] Resend send failed:", res.status, body.slice(0, 300));
      return { sent: false, reason: `send_failed_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] Resend request error:", (err as Error).message);
    return { sent: false, reason: "request_error" };
  }
}
