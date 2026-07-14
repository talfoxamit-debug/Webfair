import { NextResponse } from "next/server";
import { verifyQuoWebhook } from "@/lib/quo";
import { getSupabaseAdmin } from "@/lib/supabase";
import { phoneDigits } from "@/lib/prospects";

export const runtime = "nodejs";

type QuoEvent = {
  type?: string;
  data?: {
    resource?: Record<string, unknown>;
    context?: Record<string, unknown>;
  };
};

/**
 * Quo (formerly OpenPhone) call-event webhook — the live feed for calls,
 * recordings, transcripts and summaries.
 *
 * Setup: Quo → Settings → Integrations → Webhooks → Add webhook
 *   URL:    https://stackwrk.com/api/quo/webhook
 *   Events: call.completed, call.missed, call.recording.completed,
 *           call.transcript.completed, call.summary.completed
 * Copy the signing secret into QUO_WEBHOOK_SECRET (new-style, starts
 * "whsec_") or QUO_WEBHOOK_SECRET_LEGACY (older app-created webhooks) —
 * Quo hands you one or the other depending on which system creates it.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyQuoWebhook(raw, req.headers)) {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 });
  }

  let event: QuoEvent;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const type = event.type || "";
  if (!type.startsWith("call.")) return NextResponse.json({ received: true }); // messages/contacts: not handled yet

  const resource = event.data?.resource || {};
  const context = event.data?.context || {};
  const callId = (resource.id || resource.callId || context.callId) as string | undefined;
  if (!callId) return NextResponse.json({ received: true });

  // File this under whichever participant isn't our own Quo line.
  const ownDigits = phoneDigits((context.phoneNumber as string) || "");
  const candidates = [context.from, context.to, resource.from, resource.to].filter((x): x is string => typeof x === "string" && x.length > 0);
  const otherRaw = candidates.find((p) => phoneDigits(p) !== ownDigits) || candidates[0] || "";
  const digits = phoneDigits(otherRaw);
  if (digits.length !== 10) return NextResponse.json({ received: true }); // nothing usable to file this under

  const sb = getSupabaseAdmin();
  if (sb) {
    const patch: Record<string, unknown> = {
      id: callId,
      phone_digits: digits,
      phone_pretty: `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`,
      direction: resource.direction || context.direction || null,
      status: resource.status || type.replace(/^call\./, ""),
      occurred_at: (resource.createdAt as string) || (context.createdAt as string) || new Date().toISOString(),
      raw: event,
    };
    if (type === "call.completed") patch.duration_seconds = resource.duration ?? null;
    if (type === "call.recording.completed") patch.recording_url = resource.url || resource.recordingUrl || null;
    if (type === "call.transcript.completed") {
      const dialogue = resource.dialogue;
      patch.transcript = Array.isArray(dialogue)
        ? dialogue.map((d: { identifier?: string; userId?: string; content?: string }) => `${d.identifier || d.userId || "?"}: ${d.content || ""}`).join("\n")
        : (resource.text ?? null);
    }
    if (type === "call.summary.completed") {
      const summary = resource.summary;
      patch.summary = Array.isArray(summary) ? summary.join(" ") : (summary ?? null);
    }
    // Upsert only touches the columns in `patch`, so earlier events (e.g. the
    // call itself) and later ones (its transcript, arriving separately) build
    // up the same row instead of overwriting each other.
    await sb.from("quo_calls").upsert(patch, { onConflict: "id" }).then(() => {}, () => {}); // table optional; best-effort
  }

  return NextResponse.json({ received: true });
}
