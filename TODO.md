# Stackwrk: Go-to-Market TODO

**Niche (decided):** Exterior-improvement contractors, **start with fencing, trade up into siding.**
Chosen for the two goals that matter: **make money** + **easy leads**. Full research & rationale:
niche-selection strategy brief (see the shared artifact). Runner-up: kitchen & bath remodeling.

_Last updated: 2026-07-12_

---

## 💳 Payments: Stripe (integration BUILT: just add your keys)
The code is live: signed agreements show a **Pay deposit** button that creates a
Stripe Checkout session (`/api/checkout`), a webhook records payments
(`/api/webhooks/stripe`), and a `/agreement/paid` thank-you page. It all degrades
gracefully until the keys are set.

**To turn it on (you):**
- [ ] **Onboard Stripe now without the EIN**, sign up as a sole proprietor with your
      SSN; switch it to the LLC once the EIN arrives.
- [ ] In **Vercel → Settings → Environment Variables**, add:
      - `STRIPE_SECRET_KEY` = `sk_test_…` (test first, then `sk_live_…`)
      - `STRIPE_WEBHOOK_SECRET` = `whsec_…` (from the webhook step below)
      - `NEXT_PUBLIC_SITE_URL` = `https://stackwrk.com`
- [ ] **Create the webhook:** Stripe Dashboard → Developers → Webhooks → Add endpoint
      → URL `https://stackwrk.com/api/webhooks/stripe`, events:
      `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`.
      Copy its signing secret into `STRIPE_WEBHOOK_SECRET`, then redeploy.
- [ ] _(optional)_ Run `supabase/payments.sql` to log payments in Supabase.
- [ ] _(optional)_ For the recurring **care plans**, create 3 Stripe **Payment Links**
      ($99 / $249 / $499/mo) and paste them into `src/lib/pricing.ts` (`stripeUrl`),
      or send a subscription checkout via `/api/checkout` `{kind:"care"}`.
- [ ] Test end-to-end with a test card (`4242 4242 4242 4242`) before going live.
- [ ] Meanwhile: take deposits by **Zelle/Venmo** so a "yes" never stalls.

## 📇 CRM & outreach (BUILT: /prospects)
The CRM now runs the whole call/email motion. Built and live:
- [x] **Copy-number button** on every lead (Today view + drawer), Quo isn't a
      `tel:` handler on Windows, so tap **📋 Copy** and paste into Quo to dial.
- [x] **Structured contact fields** per lead, contact name, editable email &
      phone, best time to reach, and a **Call outcome** dropdown (no answer,
      left VM, asked to email, interested, etc.), plus freeform notes.
- [x] **Two template pipelines**, grouped in the drawer:
      **📞 Phone-first** (opener → voicemail → *after-call "what we offer" email* → text)
      and **✉️ Email-first** (cold email → day-3 follow-up → day-7 breakup).
- [x] **Run the site audit** on a lead's website in-drawer for call talking points.
- [x] **Per-client e-sign agreement link** with a discount slider.

**To turn email fully on (you), carried over, still needed:**
- [ ] **Verify `stackwrk.com` in Resend** (add its DNS records) and set
      `REPORT_FROM_EMAIL` = `Stackwrk <audit@stackwrk.com>`, then redeploy.
      Until this is done, audit reports / lead alerts / booking + agreement
      copies do **not** send (Resend rejects the current unverified sender).
- [ ] _(nice-to-have)_ Install the **Quo (OpenPhone) Chrome extension** on
      Othman's machine for real click-to-call, so `tel:` links dial Quo directly
      instead of the "pick an app" popup. The copy-number button works regardless.

## 🔒 Decisions to lock (you)
- [ ] Confirm niche: **fencing first → siding later**
- [ ] Pick the **target metro** (for lead lists + naming local competitors)
- [ ] **New focused site** vs **rework the current Stackwrk site**
- [ ] _(optional)_ Niche sub-brand for outreach vs. keep "Stackwrk"

## 🛠️ Site / build (Claude)
- [ ] Reposition around fence/exterior contractors, headline "more booked jobs for fence companies", ROI + trust framing
- [ ] Switch to a **bright, trustworthy look** (retire the dark-luxury direction)
- [ ] Build a **fencing demo/template site** as the flagship proof piece
- [ ] Reframe the product-lab demos as contractor outcomes ("instant quote form", "never miss a call")
- [ ] Publish the **3-tier offer page** (Launch / Growth / Market Leader) + aim the audit tool at contractors

## 📇 Setup (you): Week 1, start in parallel
- [ ] **Sending domain + warmup**, buy a secondary domain, set SPF/DKIM/DMARC, start warmup in Instantly or Smartlead **today** (needs 2–3 weeks before first send, longest pole)
- [ ] Sign up **Outscraper** (Maps scraper, "no website" filter) + **MillionVerifier** + **Loom**
- [ ] Build **first 100-lead list**: "fence company [metro]" → filter 50+ reviews, weak/no site
- [ ] **Stripe payment links** for the 3 tiers, _blocked on EIN_

## 🏗️ Week 2: manufacture proof
- [ ] Land **3 founder clients at $1,500** (mockup-first: rebuild their homepage from their own project photo, send 30-sec preview)
- [ ] Deliver fast (10-day guarantee) → capture **video testimonials + before/after case studies**

## 📈 Weeks 3–8: outreach machine
- [ ] Weekly: **100 manual dials + 150 personalized emails + 10–15 Looms (repliers only)**
- [ ] Move to **full price** ($4,500 Growth founding rate); present all 3 tiers live, deposit on the call
- [ ] Target **2–3 paying clients / month**

## 🔁 Ongoing: compound
- [ ] Rank your **own Google Business Profile** for "website designer [city]"
- [ ] Sign **1–2 referral / white-label partners** (SEO/ad agencies who don't build sites)
- [ ] Ask every delivered client for **referrals** at the peak-happy moment

---

## The offer (lead with the middle): matches the CRM agreement generator
| Tier | Build (list → founding) | Pages | Care plan |
|---|---|---|---|
| Launch | $3,000 → **$2,000** | 5 | Essential $99/mo |
| **Growth ★** | $6,500 → **$4,500** | 8 | Growth $249/mo |
| Market Leader | $12,000 → **$8,000** | 12 | Partner $499/mo |

- The **founding rate** is the built-in discount shown to the client (list price
  struck through). Adjust per client with the discount slider in the drawer.
- Care plan quoted as **opt-out**, not opt-in
- First 3–5 = **founder pricing** for a testimonial + case study + 2 referral intros
- Risk reversal: deposit to start, balance when happy, 30-day money-back, "live in 10 days or a free month"

## Money math (base case, ~2 clients/mo)
- Year 1 ≈ **$116–120k** (build + care fees)
- Exit year 1 at **~$4k/mo recurring (~$48k/yr)**, the real asset

## Stack (~$150–250/mo)
Outscraper · MillionVerifier · Instantly/Smartlead · Loom · Figma/Canva · PageSpeed Insights · Calendly · Stripe
