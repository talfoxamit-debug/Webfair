import { NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { verifyQuoWebhook } from "@/lib/quo";
import { getSupabaseAdmin } from "@/lib/supabase";
import { phoneDigits } from "@/lib/prospects";

export const runtime = "nodejs";

type Json = Record<string, unknown>;
type QuoEvent = { type?: string; data?: { resource?: Json; context?: Json } };

/**
 * Quo (formerly OpenPhone) event webhook: the live feed for calls,
 * recordings, transcripts, summaries, texts and contact updates.
 *
 * Setup: Quo → Settings → Integrations → Webhooks → Add webhook
 *   URL:    https://stackwrk.com/api/quo/webhook
 *   Events: call.completed, call.missed, call.recording.completed,
 *           call.transcript.completed, call.summary.completed,
 *           message.received, message.delivered,
 *           contact.updated, contact.deleted
 * Copy the signing secret into QUO_WEBHOOK_SECRET (new-style, starts
 * "whsec_") or QUO_WEBHOOK_SECRET_LEGACY (older app-created webhooks).
 * Quo hands you one or the other depending on which system creates it.
 *
 * If your Quo workspace has numbers for more than one business (e.g. a
 * "receive updates from all phone numbers" webhook also covers an
 * unrelated line), set QUO_ALLOWED_NUMBERS to a comma-separated list of
 * the Stackwrk number(s): any event from a number not in that list is
 * ignored, so a different business's calls never leak into this CRM.
 *
 * The contact.* payload shape isn't fully documented publicly, so
 * handleContact() tries a couple of plausible field paths defensively and
 * skips silently (never throws) if neither matches.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyQuoWebhook(raw, req.headers)) {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 });
  }

  let event: QuoEvent;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const type = event.type || "";
  const resource = event.data?.resource || {};
  const context = event.data?.context || {};
  const sb = getSupabaseAdmin();

  const ownDigits = phoneDigits((context.phoneNumber as string) || "");
  const allowlist = (process.env.QUO_ALLOWED_NUMBERS || "").split(",").map((s) => phoneDigits(s)).filter(Boolean);
  if (allowlist.length && ownDigits && !allowlist.includes(ownDigits)) return NextResponse.json({ received: true });

  if (sb) {
    if (type.startsWith("call.")) await handleCall(sb, type, resource, context, ownDigits, event);
    else if (type.startsWith("message.")) await handleMessage(sb, type, resource, context, ownDigits, event);
    else if (type.startsWith("contact.")) await handleContact(sb, type, resource);
  }

  return NextResponse.json({ received: true });
}

const prettyPhone = (digits: string) => `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;

function otherParty(ownDigits: string, ...raws: unknown[]): string {
  const candidates = raws.filter((x): x is string => typeof x === "string" && x.length > 0);
  const other = candidates.find((p) => phoneDigits(p) !== ownDigits) || candidates[0] || "";
  return phoneDigits(other);
}

async function handleCall(sb: SupabaseClient, type: string, resource: Json, context: Json, ownDigits: string, event: QuoEvent) {
  const callId = (resource.id || resource.callId || context.callId) as string | undefined;
  if (!callId) return;
  const digits = otherParty(ownDigits, context.from, context.to, resource.from, resource.to);
  if (digits.length !== 10) return; // nothing usable to file this under

  const patch: Json = {
    id: callId,
    phone_digits: digits,
    phone_pretty: prettyPhone(digits),
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

async function handleMessage(sb: SupabaseClient, type: string, resource: Json, context: Json, ownDigits: string, event: QuoEvent) {
  const messageId = (resource.id || context.messageId) as string | undefined;
  if (!messageId) return;
  const digits = otherParty(ownDigits, context.from, context.to, resource.from, resource.to);
  if (digits.length !== 10) return;

  await sb.from("quo_messages").upsert({
    id: messageId,
    phone_digits: digits,
    phone_pretty: prettyPhone(digits),
    direction: resource.direction || context.direction || (type === "message.received" ? "incoming" : "outgoing"),
    status: type.replace(/^message\./, ""),
    body: resource.text ?? resource.body ?? null,
    occurred_at: (resource.createdAt as string) || (context.createdAt as string) || new Date().toISOString(),
    raw: event,
  }, { onConflict: "id" }).then(() => {}, () => {}); // table optional; best-effort
}

async function handleContact(sb: SupabaseClient, type: string, resource: Json) {
  // Try both plausible shapes: v1 create/update ({defaultFields: {...}}) and
  // the flatter shape seen on GET /contacts. Skip quietly if neither fits.
  const df = resource.defaultFields as Json | undefined;
  const phoneNumbers = (df?.phoneNumbers ?? resource.phoneNumbers) as { value?: string }[] | undefined;
  const rawPhone = phoneNumbers?.[0]?.value ?? (resource.phone as string | undefined);
  const digits = phoneDigits(rawPhone || "");
  if (digits.length !== 10) return;

  if (type === "contact.deleted") {
    await sb.from("quo_contacts").delete().eq("phone_digits", digits).then(() => {}, () => {});
    return;
  }
  const firstName = (df?.firstName ?? resource.firstName) as string | undefined;
  const lastName = (df?.lastName ?? resource.lastName) as string | undefined;
  const company = (df?.company ?? resource.company) as string | undefined;
  const name = [firstName, lastName].filter(Boolean).join(" ") || company || null;
  if (!name) return;

  await sb.from("quo_contacts").upsert({
    phone_digits: digits, name, quo_contact_id: (resource.id as string) || null, updated_at: new Date().toISOString(),
  }, { onConflict: "phone_digits" }).then(() => {}, () => {});
}
