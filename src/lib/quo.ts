import crypto from "crypto";
import { phoneDigits } from "@/lib/prospects";

/**
 * Server-side client for the Quo API (formerly OpenPhone) — pulls call
 * history/transcripts on demand and verifies inbound webhook signatures.
 * Env-gated throughout so the build/deploy succeeds before it's wired up.
 *
 * Setup (see /api/quo/webhook for the webhook side):
 *   QUO_API_KEY            Quo → Settings → API → generate key
 *   QUO_PHONE_NUMBER_ID    optional — your Quo number's id (starts "PN…").
 *                          Auto-resolved via /phone-numbers if omitted.
 */
const API_BASE = "https://api.quo.com/v1";

export function getQuoKey(): string | null {
  return process.env.QUO_API_KEY || null;
}

async function quoFetch(path: string, init?: RequestInit): Promise<Response | null> {
  const key = getQuoKey();
  if (!key) return null;
  try {
    // Quo's API key goes directly in Authorization — no "Bearer" prefix.
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { Authorization: key, ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

let cachedPhoneNumberId: string | null | undefined;

async function resolvePhoneNumberId(): Promise<string | null> {
  if (process.env.QUO_PHONE_NUMBER_ID) return process.env.QUO_PHONE_NUMBER_ID;
  if (cachedPhoneNumberId !== undefined) return cachedPhoneNumberId;
  const res = await quoFetch("/phone-numbers");
  const j = res && res.ok ? await res.json().catch(() => null) : null;
  const resolved: string | null = j?.data?.[0]?.id ?? null;
  cachedPhoneNumberId = resolved;
  return resolved;
}

export type QuoCall = {
  id: string;
  direction: string | null;
  status: string | null;
  createdAt: string | null;
  durationSeconds: number | null;
};

/** On-demand call history for one lead's number — used by the CRM drawer. */
export async function fetchCallHistory(leadPhone: string): Promise<QuoCall[]> {
  const digits = phoneDigits(leadPhone);
  if (digits.length !== 10) return [];
  const phoneNumberId = await resolvePhoneNumberId();
  if (!phoneNumberId) return [];
  const qs = new URLSearchParams({ phoneNumberId, maxResults: "25" });
  qs.append("participants", `+1${digits}`);
  const res = await quoFetch(`/calls?${qs.toString()}`);
  const j = res && res.ok ? await res.json().catch(() => null) : null;
  const rows = Array.isArray(j?.data) ? j.data : [];
  return rows.map((c: { id: string; direction?: string; status?: string; createdAt?: string; duration?: number }) => ({
    id: c.id,
    direction: c.direction ?? null,
    status: c.status ?? null,
    createdAt: c.createdAt ?? null,
    durationSeconds: c.duration ?? null,
  }));
}

/** Best-effort transcript — only present on Quo Business/Scale plans. */
export async function fetchCallTranscript(callId: string): Promise<string | null> {
  const res = await quoFetch(`/call-transcripts/${callId}`);
  const j = res && res.ok ? await res.json().catch(() => null) : null;
  const dialogue = j?.data?.dialogue;
  if (Array.isArray(dialogue)) return dialogue.map((d: { identifier?: string; userId?: string; content?: string }) => `${d.identifier || d.userId || "?"}: ${d.content || ""}`).join("\n");
  return j?.data?.text ?? null;
}

/** Best-effort AI call summary — only present on Quo Business/Scale plans. */
export async function fetchCallSummary(callId: string): Promise<string | null> {
  const res = await quoFetch(`/call-summaries/${callId}`);
  const j = res && res.ok ? await res.json().catch(() => null) : null;
  const summary = j?.data?.summary;
  return Array.isArray(summary) ? summary.join(" ") : (summary ?? null);
}

// ---- Webhook signature verification --------------------------------------
// Quo has two incompatible webhook systems: legacy (created in the Quo app —
// `openphone-signature` header) and the newer API-registered one (Standard
// Webhooks-compatible `webhook-signature` header). Setup happens by pasting
// our URL into Quo's own dashboard, which controls which scheme we get — so
// we accept either and verify against whichever secret is configured.

function timingSafeEqualB64(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "base64"), bb = Buffer.from(b, "base64");
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

/** Legacy: "openphone-signature: hmac;1;<timestamp>;<sig>", plain base64 key. */
function verifyLegacy(rawBody: string, header: string, secret: string): boolean {
  const parts = header.split(";");
  if (parts.length !== 4 || parts[0] !== "hmac") return false;
  const [, , timestamp, sig] = parts;
  const expected = crypto.createHmac("sha256", Buffer.from(secret, "base64")).update(`${timestamp}.${rawBody}`).digest("base64");
  return timingSafeEqualB64(sig, expected);
}

/** New: Standard Webhooks-compatible headers, "whsec_…" secret. */
function verifyStandard(rawBody: string, id: string, timestamp: string, sigHeader: string, secret: string): boolean {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false; // 5-min replay window
  const keyBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", keyBytes).update(`${id}.${timestamp}.${rawBody}`).digest("base64");
  return sigHeader.split(" ").some((piece) => {
    const sig = piece.split(",")[1];
    return sig ? timingSafeEqualB64(sig, expected) : false;
  });
}

export function verifyQuoWebhook(rawBody: string, headers: Headers): boolean {
  const standardSig = headers.get("webhook-signature");
  if (standardSig) {
    const secret = process.env.QUO_WEBHOOK_SECRET;
    const id = headers.get("webhook-id"), ts = headers.get("webhook-timestamp");
    return Boolean(secret && id && ts && verifyStandard(rawBody, id, ts, standardSig, secret));
  }
  const legacySig = headers.get("openphone-signature");
  if (legacySig) {
    const secret = process.env.QUO_WEBHOOK_SECRET_LEGACY;
    return Boolean(secret && verifyLegacy(rawBody, legacySig, secret));
  }
  return false;
}

// ---- Contact push (CRM → Quo) ---------------------------------------------
// So a lead's name shows up in Quo's own call/text UI, not just a raw number.
// Keyed by our own lead id as Quo's externalId. POST always creates a new
// contact (it doesn't upsert), so we look one up by externalId first and
// PATCH it if found. Best-effort throughout — the write schema below is
// reconstructed from Quo's docs, not a verified example, so failures
// degrade to "wasn't pushed" rather than a broken-looking error in the CRM.

export type QuoContactInput = { id: string; name?: string; company?: string; email?: string; phone?: string };
const CONTACT_SOURCE = "stackwrk-crm";

export async function upsertQuoContact(input: QuoContactInput): Promise<boolean> {
  const digits = phoneDigits(input.phone || "");
  if (digits.length !== 10) return false;

  const [firstName, ...rest] = (input.name || "").trim().split(/\s+/).filter(Boolean);
  const defaultFields: Record<string, unknown> = {
    ...(firstName ? { firstName } : {}),
    ...(rest.length ? { lastName: rest.join(" ") } : {}),
    ...(input.company ? { company: input.company } : {}),
    phoneNumbers: [{ name: "primary", value: `+1${digits}` }],
    ...(input.email ? { emails: [{ name: "primary", value: input.email }] } : {}),
  };
  if (!firstName && !input.company) return false; // nothing worth naming the contact

  const existingRes = await quoFetch(`/contacts?externalIds=${encodeURIComponent(input.id)}&sources=${CONTACT_SOURCE}`);
  const existingJson = existingRes && existingRes.ok ? await existingRes.json().catch(() => null) : null;
  const existingId = existingJson?.data?.[0]?.id as string | undefined;

  const res = existingId
    ? await quoFetch(`/contacts/${existingId}`, { method: "PATCH", body: JSON.stringify({ defaultFields }) })
    : await quoFetch("/contacts", { method: "POST", body: JSON.stringify({ defaultFields, externalId: input.id, source: CONTACT_SOURCE }) });
  return Boolean(res && res.ok);
}
