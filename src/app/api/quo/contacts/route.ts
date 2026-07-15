import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/crm-auth";
import { upsertQuoContact } from "@/lib/quo";

export const runtime = "nodejs";

/**
 * POST → push one CRM lead into Quo as a contact (create or update), so
 * their name shows up in Quo's own call/text UI instead of a raw number.
 * Best-effort by design (see upsertQuoContact): a failure here never
 * blocks saving the lead in the CRM itself.
 */
export async function POST(req: Request) {
  const token = req.headers.get("cookie")?.match(/(?:^|;\s*)crm_session=([^;]+)/)?.[1];
  if (!verifyToken(token ? decodeURIComponent(token) : null)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.phone) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });

  const synced = await upsertQuoContact({ id: body.id, name: body.name, company: body.company, email: body.email, phone: body.phone });
  return NextResponse.json({ ok: synced });
}
