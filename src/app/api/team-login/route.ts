import { NextResponse } from "next/server";
import { checkLogin, makeToken, verifyToken, getUsers, SESSION_COOKIE } from "@/lib/crm-auth";

export const runtime = "nodejs";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/** POST { username, password } → set session cookie. */
export async function POST(req: Request) {
  if (!Object.keys(getUsers()).length) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  let body: { username?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "bad" }, { status: 400 }); }
  const { username = "", password = "" } = body;
  if (!checkLogin(username, password)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(SESSION_COOKIE, makeToken(username), cookieOpts);
  return res;
}

/** GET → who am I (used on page load to detect a session). */
export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/(?:^|;\s*)crm_session=([^;]+)/)?.[1];
  const user = verifyToken(token ? decodeURIComponent(token) : null);
  return NextResponse.json({ ok: Boolean(user), username: user, configured: Object.keys(getUsers()).length > 0 });
}

/** DELETE → log out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOpts, maxAge: 0 });
  return res;
}
