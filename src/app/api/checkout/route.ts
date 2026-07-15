import { NextResponse } from "next/server";
import { getStripe, siteOrigin } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Create a Stripe Checkout Session and return its URL.
 * Body:
 *   { kind: "deposit", amount, label, email?, client? }        : one-time payment
 *   { kind: "care", monthly, plan, email? }                    : monthly subscription
 * amount / monthly are in whole US dollars.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  let b: {
    kind?: "deposit" | "care";
    amount?: number; label?: string; client?: string;
    monthly?: number; plan?: string; email?: string;
  };
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false, error: "bad" }, { status: 400 }); }

  const origin = siteOrigin(req);
  const email = b.email && /.+@.+\..+/.test(b.email) ? b.email : undefined;

  try {
    let session;
    if (b.kind === "care") {
      const monthly = Math.round(Number(b.monthly));
      if (!monthly || monthly < 1) return NextResponse.json({ ok: false, error: "bad_amount" }, { status: 422 });
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: email,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: { name: `Stackwrk Care Plan: ${b.plan || "Growth"}` },
            unit_amount: monthly * 100,
            recurring: { interval: "month" },
          },
        }],
        success_url: `${origin}/agreement/paid?type=care`,
        cancel_url: `${origin}/`,
        allow_promotion_codes: true,
      });
    } else {
      const amount = Math.round(Number(b.amount));
      if (!amount || amount < 1) return NextResponse.json({ ok: false, error: "bad_amount" }, { status: 422 });
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: { name: `Deposit: ${b.label || "Website project"}${b.client ? ` (${b.client})` : ""}` },
            unit_amount: amount * 100,
          },
        }],
        payment_intent_data: { description: `Website deposit${b.client ? ` for ${b.client}` : ""}` },
        success_url: `${origin}/agreement/paid?type=deposit`,
        cancel_url: `${origin}/agreement`,
      });
    }
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "stripe_error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
