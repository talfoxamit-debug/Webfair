import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/crm-auth";
import seed from "@/data/prospects-seed.json";

export const runtime = "nodejs";

/** GET → the 254-lead starter list. Login required (was a public file before). */
export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/(?:^|;\s*)crm_session=([^;]+)/)?.[1];
  if (!verifyToken(token ? decodeURIComponent(token) : null)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(seed);
}
