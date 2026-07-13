import { cookies } from "next/headers";
import { verifyToken, getUsers, SESSION_COOKIE } from "@/lib/crm-auth";
import Gate from "./Gate";
import Board from "./Board";

// Read the session cookie on the server — the board and lead data are never
// sent to the browser unless there's a valid team session.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stackwrk CRM",
  robots: { index: false, follow: false },
};

export default async function ProspectsPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  const user = verifyToken(token);
  if (!user) return <Gate configured={Object.keys(getUsers()).length > 0} />;
  return <Board user={user} />;
}
