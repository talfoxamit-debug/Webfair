# Stackwrk — Go-to-Market TODO

**Niche (decided):** Exterior-improvement contractors — **start with fencing, trade up into siding.**
Chosen for the two goals that matter: **make money** + **easy leads**. Full research & rationale:
niche-selection strategy brief (see the shared artifact). Runner-up: kitchen & bath remodeling.

_Last updated: 2026-07-12_

---

## 💳 Payments — Stripe (do this to actually collect deposits)
- [ ] **You can wire Stripe now without the EIN** — onboard as a sole proprietor with
      your SSN; switch it to the LLC once the EIN arrives.
- [ ] Create Stripe **Payment Links**: a 50% deposit link per package (Launch/Growth/
      Market Leader) + the recurring care-plan subscriptions ($99 / $249 / $499/mo).
- [ ] Paste the deposit link into the CRM agreement generator (`payLink`) so the signed
      agreement shows a **Pay deposit** button — one link closes + collects.
- [ ] _(Claude)_ Wire the Stripe links into `src/lib/pricing.ts` + the agreement `payLink`.
- [ ] Meanwhile: take deposits by **Zelle/Venmo** so a "yes" tomorrow never stalls.

## 🔒 Decisions to lock (you)
- [ ] Confirm niche: **fencing first → siding later**
- [ ] Pick the **target metro** (for lead lists + naming local competitors)
- [ ] **New focused site** vs **rework the current Stackwrk site**
- [ ] _(optional)_ Niche sub-brand for outreach vs. keep "Stackwrk"

## 🛠️ Site / build (Claude)
- [ ] Reposition around fence/exterior contractors — headline "more booked jobs for fence companies", ROI + trust framing
- [ ] Switch to a **bright, trustworthy look** (retire the dark-luxury direction)
- [ ] Build a **fencing demo/template site** as the flagship proof piece
- [ ] Reframe the product-lab demos as contractor outcomes ("instant quote form", "never miss a call")
- [ ] Publish the **3-tier offer page** (Launch / Growth / Market Leader) + aim the audit tool at contractors

## 📇 Setup (you) — Week 1, start in parallel
- [ ] **Sending domain + warmup** — buy a secondary domain, set SPF/DKIM/DMARC, start warmup in Instantly or Smartlead **today** (needs 2–3 weeks before first send — longest pole)
- [ ] Sign up **Outscraper** (Maps scraper, "no website" filter) + **MillionVerifier** + **Loom**
- [ ] Build **first 100-lead list**: "fence company [metro]" → filter 50+ reviews, weak/no site
- [ ] **Stripe payment links** for the 3 tiers — _blocked on EIN_

## 🏗️ Week 2 — manufacture proof
- [ ] Land **3 founder clients at $1,500** (mockup-first: rebuild their homepage from their own project photo, send 30-sec preview)
- [ ] Deliver fast (10-day guarantee) → capture **video testimonials + before/after case studies**

## 📈 Weeks 3–8 — outreach machine
- [ ] Weekly: **100 manual dials + 150 personalized emails + 10–15 Looms (repliers only)**
- [ ] Move to **full price** ($3,900 Growth); present all 3 tiers live, deposit on the call
- [ ] Target **2–3 paying clients / month**

## 🔁 Ongoing — compound
- [ ] Rank your **own Google Business Profile** for "website designer [city]"
- [ ] Sign **1–2 referral / white-label partners** (SEO/ad agencies who don't build sites)
- [ ] Ask every delivered client for **referrals** at the peak-happy moment

---

## The offer (lead with the middle)
| Tier | Build | Care plan |
|---|---|---|
| Launch | $2,500 | $99/mo |
| **Growth ★** | **$3,900** | **$199/mo** |
| Market Leader | $6,500 | $399/mo |

- Care plan quoted as **opt-out**, not opt-in
- First 3–5 = **founder pricing $1,500** for a testimonial + case study + 2 referral intros
- Risk reversal: deposit to start, balance when happy, 30-day money-back, "live in 10 days or a free month"

## Money math (base case, ~2 clients/mo)
- Year 1 ≈ **$116–120k** (build + care fees)
- Exit year 1 at **~$4k/mo recurring (~$48k/yr)** — the real asset

## Stack (~$150–250/mo)
Outscraper · MillionVerifier · Instantly/Smartlead · Loom · Figma/Canva · PageSpeed Insights · Calendly · Stripe
