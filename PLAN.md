# Stackwrk: Conversion Build Plan

Living plan for turning stackwrk.com into a high-converting lead-gen site for a
web-development service. **Order-independent, every phase below gets built.**
This file is the source of truth for scope + status; it's updated as work lands.

---

## Purpose

stackwrk.com is not a brochure, it's a **conversion machine** with one job:
turn a cold-email click into a booked "free site audit" call.

**Funnel:** cold email ("I can build you a website") → prospect clicks → lands on
stackwrk.com (usually on their phone, skeptical) → sees proof + wants it →
books an audit.

**In ~8 seconds the site must answer:** (1) *Is this person actually good?*, the
site itself is the proof. (2) *Will this make me money?*, sell outcomes, not
code. (3) *Is this about me?*, relevance/personalization.

---

## Phases (all required; order does not matter)

Status key: ☐ todo · ◐ in progress · ☑ done

### Phase 1: Instant Site Audit tool ⭐ (flagship): ☑ DONE
The best cold-email weapon: visitor enters their URL → live scorecard →
"here's what I'd fix." Gives free value, proves expertise, creates the gap.
- ☑ `POST /api/audit`, fetches the URL server-side & analyzes (HTTPS, TTFB, title,
  meta description, viewport/mobile, H1, favicon, image weight/alt, booking/CTA/
  contact/analytics signals, page size). SSRF-safe (http/https only, 9s timeout,
  2 MB cap, blocks private/local hosts). `src/app/api/audit/route.ts`
- ☑ Audit UI: URL input → loading → animated scorecard (Speed / Mobile / SEO /
  Conversion) with a score ring, per-category bars, pass/warn/fail checks, and a
  "Get my free audit" CTA → #about. `AuditTool.tsx` + `AuditSection.tsx`
- ☑ Wired into the page (`#audit`, after Featured Projects). Verified live against
  real sites (seatophomes.com → 94, example.com → 74).

### Phase 2: Interactive demo showcase: ☑ DONE
"See what I can build", live, touchable mini-tools so prospects think *"I want
that on my site."* Tabbed showcase at `#demos`. `DemoShowcase.tsx` + `DemoSection.tsx`
- ☑ Booking / availability widget (day + time-slot picker → confirmation state)
- ☑ ROI / revenue calculator (visitor + sale-value sliders → now vs Stackwrk + uplift)
- ☑ AI-style chatbot demo (quick-question chips, typing indicator, scripted replies)
- ☑ Before/after redesign slider (drag to reveal dated vs modern)
- ☑ Tabbed showcase wrapper; verified desktop + mobile

### Phase 3: Proof & results upgrade: ☑ DONE
- ☑ Project cards → outcome result line (truthful "so what", highlighted). `FeaturedProjects.tsx`
  + external live-site links open in a new tab.
- ☑ Testimonials section (`Testimonials.tsx`), ⚠️ SAMPLE quotes, must be replaced with
  real client testimonials (flagged in content.ts).
- ☑ "How it works" 3-step (Audit → Build → Launch). `HowItWorks.tsx` (#how)
- ☑ Risk-reversal guarantee callout. `Guarantee.tsx`, ⚠️ confirm terms match Tal's offer.

### Phase 4: Mobile conversion polish: ☑ DONE
- ☑ Sticky "Book a free audit" bar on mobile (`StickyCTA.tsx`), appears past the
  hero, auto-hides over the form, personalizes its label from `?for=`.
- ☑ Tighter CTA flow, persistent mobile CTA always one tap from the form.
- ☑ Per-industry hook (`IndustryGreeting.tsx`), campaign links like
  `stackwrk.com/?for=dentists` greet the visitor by industry (strip + sticky-bar
  label). Renders nothing without the param.

---

## ✅ All four phases complete.

### Campaign usage
Send cold-email links as `https://stackwrk.com/?for=<industry>` (e.g. `?for=dentists`,
`?for=roofers`), the site greets them by industry and personalizes the mobile CTA.

---

## Needs real data from Tal (placeholders used until provided)

- **Supabase**: no Stackwrk project exists yet (only YatHub / FoxStays Docks).
  Decide: new project or reuse. Then add `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
  to Vercel env (dashboard-only). Form degrades gracefully until then.
- **Calendly URL**, real link for the secondary "Book on Calendly".
- **Testimonials**, name, company, quote (photo/video ideal).
- **Result metrics** per project (e.g. "+40% bookings").
- **Project screenshots** (optional) to replace generated mockups.

---

## Deployment / coordination

- `main` is the Vercel **production branch** → deploys to **stackwrk.com**.
- Two agents edit this repo (codex = visuals, Claude = functionality). Always
  `git pull` before push; keep changes modular to avoid clobbering.
