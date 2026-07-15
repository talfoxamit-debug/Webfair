# Stackwrk: Delivery Playbook & Tool Library (Level 4)

INTERNAL. The systems that make delivery repeatable, retention sticky, and the
moat compound. Companion to `STRATEGY.md`, `MARKETING.md`, `PRICING-BENCHMARKS.md`.

---

## 1. Productized delivery pipeline (checklists)

Run every project through the same rails. Max **2 concurrent builds** (solo rule).

### A. Sale → Kickoff (day 0–2)
- [ ] Quote built at `/quote` → sent → accepted in writing
- [ ] 50% deposit invoiced & paid (remainder at launch): no work before deposit
- [ ] Lead marked **won** in `/crm`; pain points from the call copied into notes
- [ ] 30-min kickoff: goals, brand assets, domain access, ONE decision-maker named
- [ ] Scope doc (1 page): pages, tools, what's explicitly OUT of scope

### B. Build (week 1–2)
- [ ] Repo from the Stackwrk base template (tool library, see §4)
- [ ] Copy draft from client questionnaire: never wait on client copy to start design
- [ ] Preview URL to client at end of week 1 (Vercel preview): momentum beats polish
- [ ] One consolidated revision round (scope rule: further rounds = change order)

### C. Launch (week 2–4)
- [ ] Audit tool score ≥85 on the new site (dogfood the audit before the client sees it)
- [ ] Mobile pass on a real phone; forms tested end-to-end into their inbox/CRM
- [ ] Analytics + uptime monitor installed; domains, SSL, redirects verified
- [ ] Final invoice paid → DNS flipped

### D. Handoff → Care onboarding (launch day)
- [ ] 20-min handoff call; screen-recorded walkthrough video sent after
- [ ] **Care plan presented as the default** (opt-out): "I keep it fast, secure and
      improving. $X/mo, cancel anytime." Target ≥60% attach.
- [ ] Stripe subscription link sent on the call, not after
- [ ] Ask for: 1 testimonial + 1 referral intro (happiness peak: never skip)
- [ ] Before/after + audit-score delta captured for marketing (MARKETING.md §④)

## 2. Retention system (care plans = the asset: protect it)

- **Monthly (15 min/client):** updates/backups verified, uptime report, 3-line
  email: what was done, site health, one improvement idea. Visible value beats silent value.
- **Quarterly (Partner tier):** 30-min strategy call: what's changed in the
  business, one new automation/tool idea (= expansion revenue).
- **Annual:** small surprise upgrade shipped free (speed bump, new section):
  reciprocity drives referrals.
- **Churn save:** exit interview → offer downgrade to Essential before losing the
  relationship entirely. A $99 client still refers.
- **Referral loop:** standing "refer → 1 month free" for every care client.

## 3. Billing (Stripe: 10-minute setup, Tal)

1. Stripe dashboard → Payment Links → create 3 recurring products:
   Care Essential $99/mo · Care Growth $249/mo · Care Partner $499/mo
2. Paste each URL into `carePlans[].stripeUrl` in `src/lib/pricing.ts` → push
3. "Subscribe now" buttons appear on the live pricing cards automatically
4. Builds/projects: keep invoicing via Stripe invoices (50% deposit / 50% launch)

## 4. Proprietary tool library (the compounding moat)

Every build deposits IP here. Each reuse makes the next project cheaper. This
ledger IS the moat. Current inventory (all in this repo):

| Tool | Where | Reuse |
|---|---|---|
| **Site audit engine** | `src/app/api/audit/route.ts` + `AuditTool.tsx` | Lead magnet on any client site; white-label as "powered by Stackwrk" |
| Booking widget | `DemoShowcase.tsx` (BookingDemo) | Base for real client booking flows |
| ROI/revenue calculator | `DemoShowcase.tsx` (CalculatorDemo) | Any "value proof" client tool |
| AI assistant chat UI | `DemoShowcase.tsx` (ChatbotDemo) | Front-end for real AI assistant packages |
| Before/after slider | `DemoShowcase.tsx` | Case-study visuals for every redesign |
| Quote builder | `/quote` + `src/lib/pricing.ts` | Internal sales; adaptable per client as configurators |
| Lead capture + CRM | `AuditForm` → `/api/leads` → `/crm` | Deployable mini-CRM for clients (productize later) |
| Campaign personalization | `IndustryGreeting` + `StickyCTA` (`?for=`) | Any client running outbound |
| Design system | tailwind config + components | Reskin per client; structure carries over |

**Rule:** after every client project, ask "what did we build that generalizes?"
→ extract it into the base template → add a row here.

## 5. Client portal (deferred: build at ~10 care clients)

v1 sketch: magic-link auth (Supabase), per-client page showing uptime, monthly
report history, open requests, invoices (Stripe customer portal link), "request
a change" form that lands in `/crm`. Don't build before the pain exists.

## 6. Internal tools map

| URL | What | Access |
|---|---|---|
| `stackwrk.com/quote` | Quote builder (pricing software) | Unlisted, noindex |
| `stackwrk.com/crm` | Lead pipeline board | `CRM_ACCESS_KEY` + noindex |
| `stackwrk.com/?for=X` | Personalized campaign landing | Public (campaign links) |
| Supabase `audits` table | Every audit run (warm-lead signal) | Service-role only |
| `/api/audit-report` | Audit → emails full report + stores lead (`source: instant_audit`) with the scorecard in `message` | Public POST |

### Lead funnel (the money path)

The instant audit is the hook, not the conversion. Flow:
`enter URL → animated scorecard + category breakdown → "Get the full report (free)"
captures name/email → /api/audit-report` which (best-effort, each independent):
1. inserts the lead into Supabase `leads` (`source: instant_audit`, the audited
   URL in `website`, a prioritized issue summary in `message`) → shows in `/crm`,
2. emails the visitor a branded, prioritized audit report (Resend),
3. emails Tal a lead alert if `REPORT_NOTIFY_EMAIL` is set.
All three degrade gracefully when their env is missing. The UX still confirms.

## 7. Setup still owed by Tal (blocking full activation)

1. **Supabase**: pick/create the Stackwrk project → run the schema in `.env.example`
   → set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRM_ACCESS_KEY` in Vercel.
   (Unlocks: lead form storage, /crm board, audit logging, audit-report leads.)
2. **Resend** (email the audit reports): create an account + verify the sending
   domain → set `RESEND_API_KEY`, `REPORT_FROM_EMAIL` (e.g. `Stackwrk <audit@stackwrk.com>`),
   and optionally `REPORT_NOTIFY_EMAIL` (your inbox, for instant lead alerts) in Vercel.
   (Until set, the funnel still captures the lead and confirms. It just can't
   auto-send the report yet.)
3. **Stripe**: create the 3 Payment Links → paste into `src/lib/pricing.ts`.
4. **Calendly**: real URL into `src/lib/content.ts` (`site.calendlyUrl`).
5. **Testimonials**: replace samples in `src/lib/content.ts` after first launches.
