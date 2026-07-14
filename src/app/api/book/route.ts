import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEmail, notifyEmail } from "@/lib/email";
import { site } from "@/lib/content";

export const runtime = "nodejs";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clamp = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function confirmationHtml(name: string, when: string, calUrl: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f2f8;padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(26,15,46,.1);">
    <tr><td style="background:#12081f;padding:26px 30px;">
      <div style="font:800 20px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#fff;letter-spacing:.5px;">STACKWRK</div>
      <div style="font:500 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#cbff3c;margin-top:2px;">Your intro call is booked</div>
    </td></tr>
    <tr><td style="padding:28px 30px;">
      <p style="font:400 16px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a0f2e;margin:0 0 16px;">Hi ${esc(
        name,
      )}, you're on the calendar. Here are the details:</p>
      <table role="presentation" width="100%" style="background:#f4f2f8;border-radius:12px;"><tr><td style="padding:18px 20px;">
        <div style="font:700 12px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8b81a0;text-transform:uppercase;letter-spacing:1.5px;">When</div>
        <div style="font:700 18px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a0f2e;margin-top:4px;">${esc(
          when,
        )}</div>
        <div style="font:400 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#6b6480;margin-top:6px;">30-minute intro call: we'll review your site and goals, no obligation.</div>
      </td></tr></table>
      <a href="${esc(
        calUrl,
      )}" style="display:inline-block;margin-top:18px;background:#cbff3c;color:#12081f;font:700 15px -apple-system,Segoe UI,Roboto,Arial,sans-serif;text-decoration:none;padding:12px 22px;border-radius:9px;">Add to Google Calendar</a>
      <p style="font:400 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8b81a0;margin:22px 0 0;">Need to reschedule? Just reply to this email.</p>
    </td></tr>
  </table></body></html>`;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, emailed: false, stored: false });
  }

  const name = clamp(body.name, 120);
  const email = clamp(body.email, 200);
  const phone = clamp(body.phone, 40);
  const when = clamp(body.when, 140); // e.g. "Tue, Jul 14 at 10:30 AM"
  const calUrl = clamp(body.calUrl, 1000);

  if (!name || !emailRe.test(email) || !when) {
    return NextResponse.json(
      { ok: false, error: "validation", message: "Name, a valid email, and a time are required." },
      { status: 422 },
    );
  }

  const message = `Booking request: ${when}\nPhone: ${phone || "not provided"}`;

  let stored = false;
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("leads").insert({
        name,
        email,
        message,
        source: "booking",
      });
      if (error) console.error("[book] lead insert failed:", error.message);
      else stored = true;
    }
  } catch (e) {
    console.error("[book] supabase error:", (e as Error).message);
  }

  const send = await sendEmail({
    to: email,
    subject: `Your call with Stackwrk: ${when}`,
    html: confirmationHtml(name, when, calUrl || site.calendlyUrl),
    replyTo: site.email,
  });

  const notify = notifyEmail();
  if (notify) {
    await sendEmail({
      to: notify,
      subject: `New booking: ${name}, ${when}`,
      html: `<pre style="font:14px ui-monospace,monospace;white-space:pre-wrap;">${esc(
        `${name}\n${email}\nPhone: ${phone || "not provided"}\nWhen: ${when}`,
      )}</pre>`,
      replyTo: email,
    });
  }

  return NextResponse.json({ ok: true, emailed: send.sent, stored });
}
