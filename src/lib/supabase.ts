import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client used by API routes to write to the `leads` table.
 * Uses the service-role key, which must stay server-only — never expose it to
 * the browser. Returns null when env is not configured so callers can degrade
 * gracefully (the build/deploy still succeeds before creds are wired up).
 *
 * Required env vars (set in Vercel / .env.local, never committed):
 *   SUPABASE_URL                (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
