import Stripe from "stripe";

/**
 * Server-side Stripe client. The secret key must stay server-only. Never expose
 * it to the browser. Returns null when env isn't configured so routes degrade
 * gracefully (build/deploy succeeds before the key is wired up, and the agreement
 * page falls back to "Tal will invoice you" until Stripe is live).
 *
 * Required env vars (set in Vercel / .env.local, NEVER committed):
 *   STRIPE_SECRET_KEY        sk_test_… while testing, sk_live_… in production
 *   STRIPE_WEBHOOK_SECRET    whsec_…  (from the webhook endpoint you create)
 * Optional:
 *   NEXT_PUBLIC_SITE_URL     e.g. https://stackwrk.com (for redirect URLs)
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { typescript: true });
}

/** Base URL for Stripe redirect URLs: prefers the incoming request's origin. */
export function siteOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, "");
  try { return new URL(req.url).origin; } catch { return "https://stackwrk.com"; }
}
