# Stackwrk Full Audit Plan

> To-do for tomorrow: run this audit in ultracode mode. This document is the blueprint the run executes, so the findings map straight back to these checks.
>
> Generated 2026-07-16 by a 12-domain multi-agent design pass, each agent grounded in the real repo. Nothing here was fixed yet; this is the plan only.

## Contents

1. Executive summary
2. How to run it tomorrow (ultracode)
3. Execution order
4. Cross-cutting risks
5. Scoring model
6. Estimated effort
7. Audit domains (detailed checks)

---

## 1. Executive summary

Stackwrk (Fox Solutions LLC) is simultaneously a public marketing site and the internal CRM plus go-to-market engine for the entire book of business, all auto-deploying to production on every push to main. That dual nature is the organizing insight of this audit: a single defect can leak every prospect's PII, wipe the sales pipeline, mishandle money, ship a placeholder testimonial to production, or make the flagship "instant audit" lead magnet hang. Twelve domains were designed, spanning roughly 250 discrete, file-grounded checks: eight are P0 (Security and Privacy, Data Model and Integrations, Reliability and Error Handling, Conversion and UX Funnels, Content and Legal and Compliance, Analytics and Measurement, Business and GTM Strategy, Performance and Core Web Vitals) and four are P1 (SEO and AI Answer Engines, Accessibility WCAG 2.2 AA, Code Quality and Maintainability, Mobile and Responsive). This is a findings-only pass: nothing is fixed, the deliverable is evidence.

Six issues already read as ship-blockers before the run even starts, and they concentrate in the data and money paths. The CRM session HMAC falls back to a hardcoded public constant (crm-auth.ts:9, "stackwrk-crm-dev-secret") whenever CRM_ACCESS_KEY is unset while CRM_USERS is set, making every session token forgeable. The unauthenticated /api/audit crawler accepts encoded loopback and metadata addresses (127.1, 2130706433, 0x7f.0.0.1) that safe-fetch.ts fails to block, and it has no rate limit, so it is both an SSRF probe and a cost/DoS amplifier. The sales pipeline lives as one shared team_crm JSON document with last-write-wins semantics, so a failed initial load in Board.tsx followed by the debounced save silently overwrites the whole pipeline, and that same store silently loses the exportedAt and emailCheckedAt stamps, which re-emails real prospects through Instantly. Supabase, Resend, and Stripe may be unactivated in production, in which case lead capture, report email, booking storage, and care-plan billing all silently break, meaning the funnel captures and bills nothing. Prices and offers contradict each other across surfaces ($3,900 on the phone versus $4,500 in the e-signed agreement, two competing free wedges, two parallel CRMs, a seatophomes Calendly, placeholder testimonials). And the owner's standing no-dash rule is already broken: en dashes are live in 27 files while em dashes are clean except for the rule text itself in CLAUDE.md.

The plan therefore front-loads cheap deterministic sweeps and the critical security and data verification, batches the frontend experience domains behind shared browser tooling, and saves the deepest strategic synthesis (Code Quality decision memos and Business and GTM coherence) for last, since those consume the concrete price, activation, and data-flow findings that earlier phases produce.

## 2. How to run it tomorrow (ultracode)

FAN-OUT SHAPE. One lead orchestrator owns the shared route matrix, the shared harnesses, phase gating, and the final merged register. Work runs as five sequential phases (phases depend on earlier artifacts) with parallel domain subagents inside each phase (domains touch distinct concerns and can run concurrently against a coordinated set of services). Phase 0 is a bootstrap fan-out: dedicated agents build reusable assets that all later agents consume rather than rebuild: (1) a next build plus next start server and a parallel next dev, (2) a Node crypto/SSRF/webhook harness (forge makeToken with the fallback secret, drive isPrivateIp/isBlockedHost/normalizeUrl over the encoded-IP payload list, replay legacy and standard Quo signatures, feed literal-null bodies to every route), (3) a Playwright harness for route x breakpoint navigation, screenshots, scrollWidth and getBoundingClientRect assertions, CLS capture, and axe scans, (4) a Supabase MCP attestation of live RLS via get_advisors and pg_class/pg_policies across all eight tables, (5) a contrast-ratio calculator over the real Tailwind alpha tokens, and (6) the git-grep sweeps (dashes, price literals, ` as ` casts, swallowed-error patterns, auth-gate coverage). Phases 1 through 4 then spawn one discovery agent per domain (three, three, four, two agents respectively) that consume these assets. The orchestrator holds a shared "activation status" fact (are Supabase/Resend/Stripe/Calendly and the sending domain actually configured) established in Phase 1 and injects it into every later agent so no agent wastes cycles testing a path that is inert, and none falsely reports a live path as broken.

ADVERSARIAL VERIFICATION. Two-pass, with the verifier always a different agent than the discoverer. Pass 1 (discovery): each domain agent emits candidate findings, and every candidate must ship with a concrete, re-runnable reproduction: the exact curl command, forged token, SSRF payload, Playwright script, crafted CSV, or file:line-anchored code trace, plus observed-versus-expected. Pass 2 (verification): a separate verifier agent per phase attempts to reproduce each candidate against the running system. A finding is marked CONFIRMED only when the verifier independently reproduces the observed behavior; if it cannot, the finding is downgraded to PLAUSIBLE with a note and may not be tagged P0 or ship-blocker. Static-evident findings (no test exists, ESLint unconfigured, a price literal mismatch, a missing canonical) are marked CONFIRMED-STATIC. The verifier also actively hunts false positives and prunes them: a canonical that is actually correct, a contrast pair that is never actually used in the DOM, a "missing" noindex that does render, a dead anchor that Nav.to() rewrites correctly. It re-checks that every claimed file:line still matches after any line drift and that the asserted severity is justified by the repro rather than merely stated. Live-infra checks that need owner-only access (Vercel env dashboard, Search Console, the live prod domain, Stripe/Resend dashboards) that the run cannot reach are marked NEEDS-OWNER-VERIFICATION rather than guessed, and are listed separately so Tal can close them.

FINAL OUTPUT. A single merged findings register, one row per finding, with columns: id, domain, file:line, category, impact severity, likelihood/verdict (CONFIRMED, CONFIRMED-STATIC, PLAUSIBLE, or NEEDS-OWNER-VERIFICATION), blast radius, effort, computed priority (P0 to P3), reproduction, observed-versus-expected, and a one-line fix direction (no code changes applied). Above the register sit three cross-cutting sections: a SHIP-BLOCKERS list (the confirmed criticals, led by the team_crm pipeline-wipe, the forgeable session, and the SSRF bypass), a QUICK-WINS-TO-LAND-FIRST list (high impact, small effort, so Tal can clear them in one pass), and the two git grep dash gates ready to wire into CI. Each domain also attaches its own designed deliverable (the CWV baseline table, the per-route SEO scorecard, the RLS attestation table, the CTA inventory, the reconciled price book, the measurement-gap inventory, the route x breakpoint matrix). The orchestrator de-duplicates findings that surfaced in multiple domains (for example the team_crm and SSRF issues) into one canonical row cross-referenced from each domain. The entire report obeys the no-dash rule and the dash grep runs against the report itself before delivery.

## 3. Execution order

### Phase 1: Phase 0: Static sweeps and shared-harness bootstrap

**Domains:** Content, Copy, Brand Voice and Legal/Compliance (dash and claim sweeps), Security and Privacy (SSRF unit harness, auth-gate map, secret-history scan), Code Quality and Maintainability (ESLint stand-up, dead-code and duplication scan), Data Model and Integrations (static writer/reader tracing), Analytics and Measurement (grep for any tag or event), Business and GTM Strategy (price-literal reconciliation grep)

Everything here needs no running server, no browser, and no live credentials, so it produces the first batch of quick wins within the first hour and de-risks the rest. This phase also builds the reusable assets every later phase consumes rather than rebuilding: the git-grep dash and price-literal sweeps (already confirmed: em dashes clean except CLAUDE.md, en dashes in 27 files, hardcoded fallback secret at crm-auth.ts:9), a Node crypto and SSRF and webhook harness (forge makeToken with the fallback secret, feed isPrivateIp/isBlockedHost/normalizeUrl the encoded-IP payload list, replay legacy Quo signatures), a tsc --noEmit and ESLint baseline, ts-prune/knip dead-code output, and the full /api route to auth-mechanism map. Deterministic, parallelizable, and the foundation for adversarial reproduction later.

### Phase 2: Phase 1: Critical security and data-integrity verification (ship-blockers)

**Domains:** Security and Privacy, Data Model and Integrations, Reliability, Error Handling and Edge Cases

These three are the highest-severity P0 domains and they share the same live infrastructure: a dev server, curl, the Node harnesses from Phase 0, and Supabase MCP (get_advisors, pg_class/pg_policies) to attest live RLS across all eight tables rather than trusting the SQL files. Run first because the outcomes are irreversible or exploitable: forgeable CRM sessions, the 127.1 and integer-IP SSRF bypass, the team_crm load-then-overwrite pipeline wipe, cloud-metadata reachability across redirect hops, missing-env 500s, and swallowed webhook errors that make a Supabase outage look like success. Data Model and Reliability overlap heavily with Security on the same files (safe-fetch.ts, quo.ts, crm-auth.ts, Board.tsx, the webhook routes), so co-scheduling them avoids duplicate setup and lets one confirmed exploit inform all three reports.

### Phase 3: Phase 2: Revenue, compliance and measurement

**Domains:** Conversion and UX Funnels, Content, Copy, Brand Voice and Legal/Compliance, Analytics and Measurement

All three depend on driving the app in a production-like config (real Calendly, Stripe test mode, Resend and Supabase connected) and they share subject matter: CTAs, prices, offers, copy, and the events that would measure them. Conversion drives the four funnels end-to-end and confirms dead anchors, broken promises, and the audit-versus-mockup wedge conflict. Content confirms the Phase 0 dash and claim sweeps against rendered pages and checks CAN-SPAM, subprocessor disclosure, and the guarantee-versus-contract gap. Analytics inventories the measurement blind spots that make every prior funnel finding unquantifiable. Sequenced after the security/data blockers because a leaky funnel matters less than a forgeable session, but before the frontend polish because these are P0 and gate revenue.

### Phase 4: Phase 3: Frontend experience quality

**Domains:** Performance and Core Web Vitals, Accessibility (WCAG 2.2 AA), Mobile and Responsive, SEO and AI Answer Engines (AIO)

These four batch because they drive one shared measurement harness across one shared route matrix: next build then next start, Lighthouse (perf and a11y and SEO categories), Playwright device emulation with per-breakpoint screenshots and scrollWidth/getBoundingClientRect assertions, axe-core, and curl-the-rendered-head for metadata, canonical, and JSON-LD. Building the route x breakpoint x tool matrix once and running perf, accessibility, mobile-overflow, and the SEO scorecard against it in the same passes is far cheaper than four separate crawls. Lower ship-risk than the data and money paths, so they follow the P0 blockers, but they are the domains where Stackwrk's own product claim (fast, mobile-first, converting sites) is most directly on the line.

### Phase 5: Phase 4: Maintainability and strategic synthesis

**Domains:** Code Quality and Maintainability, Business and GTM Strategy

Authored last because their headline deliverables are decision memos that consume the concrete findings from every earlier phase. Code Quality's two-CRM consolidate-or-delete recommendation needs the Phase 1 data-flow evidence (audit-form leads land in the leads table, the working board reads audits), and its shared-helpers refactor list is stronger once the duplicated SSRF guards and email regexes have been shown to actually diverge in behavior. Business and GTM is the highest-altitude synthesis: its single reconciled price book, positioning decision, and activation checklist depend on the price literals (Phase 0), the funnel and offer findings (Phase 2), the integration activation status (Phase 1 and 2), and the measurement gaps (Phase 2). Running it last means it reports on a fully-evidenced system rather than on assumptions.

## 4. Cross-cutting risks

- Forgeable CRM auth plus a split auth model: the hardcoded fallback secret (crm-auth.ts:9) makes sessions forgeable when CRM_ACCESS_KEY is unset, the same key doubles as the session-signing secret while also being accepted in a query string (/api/leads ?key=) and persisted in sessionStorage (CrmBoard.tsx), and the cookie-parse-plus-verifyToken boilerplate is copy-pasted inline across eight routes. Spans Security, Data Model, Code Quality, and Reliability: one env misconfiguration exposes every table because the service-role key bypasses RLS, and one missed gate exposes a whole table.
- The team_crm single JSON document with last-write-wins: a failed or slow initial load leaves the array empty and the debounced save overwrites the shared pipeline, concurrent editors clobber each other with no conflict detection, and the same store silently loses the exportedAt/emailCheckedAt/quoSyncedSig stamps, which resurrects already-exported leads for re-emailing. Spans Data Model, Reliability, Code Quality, Conversion (the CRM the funnel feeds), and Content/CAN-SPAM (duplicate cold outreach to real prospects).
- The unauthenticated SSRF and DoS surface at /api/audit: safe-fetch.ts only matches dotted-quad addresses so encoded loopback and metadata forms slip past, there is no IP pinning after the DNS check (rebinding TOCTOU), fetchRobots uses a plain fetch, and no route except /api/sign is rate limited. Spans Security, Reliability (hang to 504, cost amplification), Performance and Conversion (the audit endpoint powers the flagship lead magnet, so abuse degrades the primary funnel).
- Integration activation gap: if Supabase, Resend, and Stripe are unset in production, lead capture 503s, the audit report email never sends, bookings are dropped, and the care-plan subscribe button never renders. Spans Reliability (missing-env behavior), Conversion (funnel captures nothing), Content (promised emails never arrive), Data Model (nothing persisted), Analytics (no server-side signal), and Business/GTM (the whole engine is inert). This is the single precondition that determines whether many other findings are live or moot, so it must be attested early.
- Price, offer, and copy incoherence across surfaces: $3,900 on the phone versus $4,500 in the e-signed agreement, two hardcoded price tables that must be hand-synced, two competing free wedges (audit versus mockup), the top tier named two ways, placeholder and draft testimonials rendered live with star ratings, a seatophomes-branded Calendly at the moment of highest intent, and delivery timelines that disagree four ways. Spans Content, Conversion, Business/GTM, and SEO/AIO, and directly costs closes because a prospect who hears one number and signs another does not convert.
- The owner's no-dash standing rule as a repo-wide gate: en dashes are live in 27 files (13 user-facing, 14 internal docs) including two decrement-button glyphs, while em dashes are clean except for the rule text in CLAUDE.md. Spans Content and, because the rule applies to all output, every domain's own report: each agent must obey it in its findings, and the two git grep commands should be wired as a pre-merge CI check.
- Duplication with zero test coverage and no lint gate: identical email regexes, clamp, esc, money, and SSRF-guard logic are copied across four to six files and some copies already diverge, while npm run lint drops into an interactive prompt and there are zero automated tests over the highest-risk pure logic (phone classification, CSV/BOM parsing, dedup, token signing, webhook verification, SSRF guards, audit scoring). Spans Code Quality, Security (a hardening fix patches one copy and misses three), Data Model (dedup and phone and CSV bugs ship unguarded), and Reliability. main auto-deploys with only manual click-through as defense.
- Silent error swallowing plus no measurement: best-effort .then(()=>{},()=>{}) on Quo and Stripe writes returns 200 even on a real DB failure so providers never retry, failed CRM saves are invisible, and there is no web analytics tag or conversion event anywhere. Spans Reliability, Data Model, Analytics, and Business/GTM: failures are undetectable and the funnel is unmeasurable, which is doubly ironic since the audit tool itself dings prospects for missing analytics.

## 5. Scoring model

Every finding is scored on four axes, then mapped to a priority, then flagged for sequencing.

AXIS 1, IMPACT (what breaks and how badly): Critical = irreversible data loss, live PII exposure, money mishandled, or a primary funnel that captures/bills nothing. High = an exploit with a precondition, a broken promise on a conversion path, a legal/compliance breach (CAN-SPAM, undisclosed subprocessor, unconsented testimonial), or a WCAG blocker on the funnel. Medium = inconsistency, degraded performance or UX, or an internal-tool defect. Low = cosmetic or a nit.

AXIS 2, LIKELIHOOD/VERDICT (how sure we are it is real): CONFIRMED (a verifier reproduced it live) > CONFIRMED-STATIC (self-evident from code, no runtime needed) > PLAUSIBLE (clear code path, not reproduced) > CONDITIONAL (needs a specific env or precondition, for example CRM_ACCESS_KEY unset) > NEEDS-OWNER-VERIFICATION (requires access the run does not have).

AXIS 3, BLAST RADIUS: whole book of business or all money/PII > all public visitors > a single route or funnel step > internal-only (noindex CRM). The two parallel CRMs and the team_crm store score at the top of this axis.

AXIS 4, EFFORT TO REMEDIATE: Quick win (localized, under about thirty minutes) < Small < Medium < Large.

PRIORITY MAPPING. P0 if Impact=Critical AND Likelihood is CONFIRMED, CONFIRMED-STATIC, or CONDITIONAL-with-a-realistic-precondition, OR the finding is a ship-blocker (irreversible data loss, live PII exposure, or mishandled money). P1 if Impact=High, OR Impact=Critical but only PLAUSIBLE. P2 if Impact=Medium. P3 if Impact=Low. A PLAUSIBLE or NEEDS-OWNER finding may never be P0: unverified severity is capped.

SEQUENCING WITHIN A PRIORITY. Sort by verdict (CONFIRMED before PLAUSIBLE), then by effort (quick win before larger), then by blast radius. Independently, tag QUICK-WIN on any finding where Effort <= Small AND Impact >= High and pull those to the very front so the owner banks momentum before tackling the large structural fixes (the two-CRM consolidation, the team_crm concurrency model, shared-helpers refactor). The register also carries a SHIP-BLOCKER boolean, set only on confirmed criticals in the data, auth, and money paths, which overrides ordinary ordering and is listed first in the report.

## 6. Estimated effort

Scale: 12 domains, roughly 250 file-grounded checks, two-pass adversarial verification, and a running app plus live integrations. Run as a coordinated ultracode multi-agent workflow with parallel domain agents inside each sequential phase, the realistic wall-clock is about 1.5 to 2 working days; the equivalent single-threaded effort is far larger (on the order of 30 to 50 agent-hours) because verification doubles the discovery cost.

Per phase (wall-clock, agents parallel within the phase): Phase 0 static sweeps and harness bootstrap, about 1 to 2 hours (fastest quick-win yield). Phase 1 critical security and data verification, about 3 to 4 hours (the ship-blocker reproductions and live Supabase RLS attestation dominate). Phase 2 revenue, compliance, and measurement, about 3 to 4 hours (driving four funnels end-to-end with Stripe test mode is the slow part). Phase 3 frontend experience, about 3 to 4 hours (one shared Lighthouse/Playwright/axe matrix across the full route set). Phase 4 maintainability and strategic synthesis, about 2 to 3 hours. Final merge, de-duplication, scoring, and dash-clean report assembly, about 1 to 2 hours.

Key caveats that move the estimate. A meaningful slice of checks needs owner-only access that the run may not have (Vercel env dashboard, Google Search Console, Stripe/Resend/Supabase dashboards, the live production domain, and a real low-end mobile device); those are marked NEEDS-OWNER-VERIFICATION rather than blocking the run, but they extend total time-to-closure past the audit itself. If the integrations turn out to be unactivated (a real possibility per the plans), several Phase 2 and Phase 3 funnel checks collapse to "inert, cannot test live" and the phase shortens, while Business and GTM lengthens. Effort assumes findings only, with zero remediation; applying fixes is a separate, larger body of work.

## 7. Audit domains (detailed checks)

Each domain below is one lane of tomorrow's run. Checks are ordered most severe first.

### 1. Performance & Core Web Vitals  (P0)

**Objective.** Verify that Stackwrk's marketing surfaces load fast and stay visually stable on mobile and desktop, and that the site practices the performance it sells. Stackwrk's pitch is "bold websites, real results, built fast, built to convert," and it literally scores prospects' sites on performance via /api/audit (which flags legacy image formats, missing img dimensions, render-blocking CSS, and more). A slow or janky home page directly undercuts the sales motion and the audit tool's credibility. This audit measures LCP, CLS, and INP on the real routes, quantifies the JavaScript shipped per route, and traces each regression to the specific file, image, font, or animation causing it. The heaviest client surface is DemoShowcase.tsx (807 lines, five fully interactive demos) which is eagerly bundled into the home page with zero code splitting anywhere in the repo, so JS weight and below-the-fold hydration are the prime suspects, alongside a total absence of img width/height attributes (0 of roughly 15 img tags carry dimensions) and a self-hosted Anton display font with no preload.

**Scope**

- / (home, src/app/page.tsx): the primary conversion surface, mounts Hero, DemoSection to DemoShowcase, FeaturedProjects, HowItWorks, FinalCTA, MockupModal, AuditPopup
- /services, /pricing, /work, /tools (each renders a large decorative fox webp eager plus shared client chrome)
- /tools/roi-calculator and /tools/saas-vs-custom-calculator (RoiCalculator.tsx, SaasVsCustomCalculator.tsx)
- /tools/website-audit (AuditTool.tsx, 478 lines)
- /demos/apex-fence (FenceSite.tsx, loads 7 webp images including hero.webp 151KB)
- /prospects (Board.tsx, 809 lines, largest route chunk at 72KB) and /crm internal tools
- src/app/layout.tsx (mounts CustomCursor, ScrollProgress, Nav, ScrollToTop on every route)
- src/app/globals.css (247 lines: @font-face Anton, body::before fixed gradient, body::after fixed film-grain SVG with mix-blend-mode overlay, backdrop-blur utilities, keyframes)
- next.config.mjs (no image or compression config), tailwind.config.ts (7 infinite keyframe animations)
- src/components: DemoShowcase.tsx, Hero.tsx, HeroMedia.tsx, HeroWaves.tsx, PointerVars.tsx, ScrollParallax.tsx, CustomCursor.tsx, ScrollProgress.tsx, AuditPopup.tsx, MockupModal.tsx, Nav.tsx, FeaturedProjects.tsx, FinalCTA.tsx, HowItWorks.tsx, CountUp.tsx, Reveal.tsx, StickyCTA.tsx
- public/ assets: fox.webp (340KB), fox-proud.webp (176KB), fox-alert.webp (173KB), fox-run.webp (158KB), fox-620.webp (127KB), demo/fence/*, shots/*, fonts/anton-*.woff2

**Quick wins (check these first)**

- Zero of the roughly 15 img tags in src carry width/height attributes (grep '<img' returns 0 matches with width=). Every screenshot in FeaturedProjects.tsx and every photo in FenceSite.tsx can reflow the page as it decodes. Add intrinsic width/height or aspect-ratio wrappers.
- The Anton display woff2 (used in the H1 that is a likely LCP element) has font-display: swap but no <link rel=preload as=font> in layout.tsx, so it is discovered only after CSS parse and will FOUT-swap the biggest headline.
- DemoShowcase.tsx (807 lines, five interactive demos, a fake CRM with drag interactions) is imported statically by DemoSection.tsx and ships in the initial home bundle; there is no next/dynamic anywhere in the repo. It sits below the fold and is a prime lazy-load candidate.
- fox.webp is 340KB (the single largest asset) with no AVIF variant; the hero srcset tops out at fox.webp 1000w while the decorative foxes on /services, /work, /pricing, /tools load 158KB to 176KB webp each with no responsive sizing.
- Anton has no size-adjust or ascent/descent override against its Impact/Haettenschweiler fallback, so the swap will shift heading metrics and feed CLS.
- next.config.mjs sets only reactStrictMode and poweredByHeader; there is no image, compression, or headers tuning to review as a baseline.

**Checks**

- **[HIGH]** Capture baseline field and lab Core Web Vitals for the home route and each key marketing route (/services, /pricing, /work, /tools, /demos/apex-fence). Establish LCP, CLS, INP, TBT, and Speed Index on mobile and desktop.
  - How: Run Lighthouse mobile and desktop against a production or preview URL for each route and save JSON; cross-check with PageSpeed/CrUX and Vercel Speed Insights for real-user data. Repeat 3 times and take the median.
  - Signal of a problem: Mobile LCP > 2.5s, CLS > 0.1, or INP > 200ms on any route; a large gap between lab and field points to real-user network/CPU sensitivity.
- **[HIGH]** Measure the actual First Load JS shipped per route and confirm the home page is not bloated by eagerly bundled interactive components.
  - How: Run npm run build and read the route table; corroborate with .next/app-build-manifest.json (home '/' pulls chunks 4bd1b696 ~173KB, 1255 ~173KB, page ~55KB, framework ~189KB on disk before gzip). Attribute weight with @next/bundle-analyzer.
  - Signal of a problem: Home First Load JS materially above a ~150 to 200KB gzip budget, or the page-specific chunk dominated by DemoShowcase and the modals rather than above-the-fold content.
- **[HIGH]** Confirm DemoShowcase.tsx and its five demos (BookingDemo, CalculatorDemo, ChatbotDemo, CrmDemo, BeforeAfterDemo) are not hydrated eagerly despite living below the fold.
  - How: Grep the repo for next/dynamic (currently zero hits) and trace DemoSection.tsx static import of DemoShowcase. In DevTools Performance, watch for a hydration/long-task spike attributable to the demo tree during initial load.
  - Signal of a problem: DemoShowcase JS parsed and hydrated before the user scrolls to #demos; a long task > 50ms on load traced to the demo components; TBT inflated on mobile.
- **[HIGH]** Identify the LCP element on the home page and confirm it is prioritized. It is either the Anton H1 headline or the hero fox image served by HeroMedia.tsx.
  - How: Use DevTools Performance LCP marker and WebPageTest filmstrip. Inspect HeroMedia.tsx: the bleed variant uses srcset fox-620.webp 620w / fox.webp 1000w, sizes 46vw, loading=eager, fetchPriority=high.
  - Signal of a problem: LCP is a text node blocked on the un-preloaded Anton font, or the fox image downloads the 1000w (333KB) variant on a viewport that only needs 620w, delaying paint past 2.5s on mobile.
- **[HIGH]** Verify every content image declares intrinsic dimensions to prevent layout shift.
  - How: Grep '<img' across src (about 15 tags, 0 currently carry width=). Load /work, /demos/apex-fence, and the home FeaturedProjects section with DevTools Rendering > Layout Shift Regions and Slow 4G throttling.
  - Signal of a problem: Visible reflow as screenshots (shots/*.webp) and fence photos decode; CLS contribution from any image without width/height or an aspect-ratio box.
- **[HIGH]** Run a low-end mobile load simulation to expose CPU-bound hydration and image cost.
  - How: Lighthouse mobile with 4x CPU throttling and Slow 4G, plus WebPageTest on a real low-end device, for / and /demos/apex-fence. FenceSite.tsx loads 7 webp images and the home page hydrates the full demo tree.
  - Signal of a problem: TBT well above 200ms, LCP above 2.5s, and a long main-thread block during hydration on the throttled profile.
- **[MEDIUM]** Assess the self-hosted Anton display font loading path for render delay and swap shift.
  - How: Inspect layout.tsx head (no preload present) and globals.css @font-face (two subsets, font-display: swap). In DevTools Network, confirm the woff2 is discovered late; in Rendering, emulate font swap to observe the H1 metric change.
  - Signal of a problem: Late woff2 request pushes text LCP; a visible headline jump when Anton replaces the Impact fallback because no size-adjust/ascent-override is set, adding to CLS.
- **[MEDIUM]** Quantify the paint and compositing cost of the always-on infinite animations running in the hero simultaneously.
  - How: In DevTools Performance and Layers, profile the hero with marquee (26s), float/float-slow (7s/10s), drift (9s), pulse-glow (4s), and animate-float-y (6.5s) all active. Note that the floating fox combines animate-float with a large drop-shadow filter.
  - Signal of a problem: Continuous compositor or raster work while idle, scroll jank on mid-range mobile, or repaints because drop-shadow on an animated element (HeroMedia, FinalCTA, HowItWorks foxes) forces filter re-rasterization each frame.
- **[MEDIUM]** Evaluate backdrop-blur usage for scroll-time repaint cost, especially the fixed Nav.
  - How: In DevTools Rendering enable Paint Flashing and scroll on mobile emulation. Nav.tsx applies backdrop-blur-xl on a fixed header once scrolled; the Hero CodeCard uses backdrop-blur-xl, .card uses backdrop-blur-sm, and AuditPopup/MockupModal use backdrop-blur-sm.
  - Signal of a problem: The fixed blurred nav repaints a blurred region on every scroll frame, producing jank and elevated GPU usage on low-end Android.
- **[MEDIUM]** Profile the fixed full-viewport film-grain overlay (body::after) and ambient gradient (body::before) for blend and paint overhead.
  - How: Read globals.css: body::after is a tiled SVG turbulence noise at z-index 80 with mix-blend-mode: overlay; body::before is a fixed radial-gradient layer at z-index -1. Toggle each in DevTools and compare paint profiles and scroll FPS.
  - Signal of a problem: mix-blend-mode: overlay forces the browser to composite the entire stack beneath it, raising paint cost during scroll or animation on weaker devices.
- **[MEDIUM]** Measure INP on the interactive demos and controls where users actually click and drag.
  - How: In DevTools use the INP/interaction tooling while exercising DemoShowcase: the CrmDemo stage advance, BeforeAfterDemo drag (setPos), ChatbotDemo send (setTimeout typing), the RoiCalculator and SaasVsCustomCalculator sliders, and the FenceEstimator.
  - Signal of a problem: Interaction to next paint > 200ms on a slider drag or tab switch, or dropped frames during the before/after drag due to per-move React state updates.
- **[MEDIUM]** Assess image delivery: formats, responsive sizing, and cache headers for the largest static assets.
  - How: ls public asset sizes (fox.webp 340KB, several foxes 158 to 176KB, demo/fence/hero.webp 151KB). Test-encode to AVIF with squoosh to estimate savings. curl -I the assets on Vercel to check Cache-Control. Note there is no next/image usage anywhere, so no optimizer or automatic AVIF/resizing.
  - Signal of a problem: Decorative foxes shipped at full webp weight to mobile with no AVIF and no responsive variant; oversized downloads relative to rendered size; missing long-lived immutable cache on static assets.
- **[LOW]** Quantify the cost of the globally mounted client components that run on every route, including the internal CRM.
  - How: Read layout.tsx: CustomCursor (rAF pointermove lerp), ScrollProgress (scroll rAF), and ScrollToTop mount on all routes. Confirm the pointer/scroll listeners short-circuit correctly on touch and reduced-motion, and profile main-thread time during pointer movement.
  - Signal of a problem: Continuous rAF or pointermove handler work on pages that do not need the cursor effect, contributing to INP and battery drain; listeners not disabled on coarse-pointer devices.
- **[LOW]** Verify the entry popup (AuditPopup) does not cause a late layout shift, main-thread spike, or unwanted hydration cost.
  - How: Read AuditPopup.tsx: a 2500ms setTimeout flips open and renders a fixed full-screen backdrop-blur modal. Load the home page and watch DevTools Performance around the 2.5s mark and the CLS timeline.
  - Signal of a problem: A CLS event when the modal mounts, or a main-thread long task from mounting the modal plus its backdrop-blur layer while the user is still reading.
- **[LOW]** Confirm no render-blocking or unexpected third-party requests exist in the critical path.
  - How: Inspect the WebPageTest/DevTools network waterfall for the home route. The site self-hosts fonts and has no analytics tags in layout.tsx, so the expectation is zero external blocking resources; verify this holds in production.
  - Signal of a problem: Any external stylesheet, font, or script (or a redirect chain) blocking first paint that was not expected from the source.
- **[LOW]** Review the shipped JavaScript for legacy polyfills and dead weight that modern browsers do not need.
  - How: Inspect the polyfills chunk (~112KB on disk) and the build's browserslist resolution; use DevTools Coverage to measure unused JS on the home route.
  - Signal of a problem: Large polyfill payload or high unused-JS percentage delivered to evergreen browsers, inflating parse/compile time.
- **[LOW]** Spot-check the heaviest internal route (/prospects, Board.tsx at 809 lines, page chunk ~72KB) so the CRM tool does not regress load for the team.
  - How: Run npm run build route table and Lighthouse on /prospects; profile hydration of Board.tsx and CrmBoard.tsx.
  - Signal of a problem: Slow interactive readiness on the CRM board, long hydration task, or an oversized route chunk relative to its usage.

**Tooling**

- Lighthouse (mobile and desktop presets) on each in-scope route, run against a Vercel preview or production URL, saved as JSON for diffing
- PageSpeed Insights / CrUX and Vercel Speed Insights or Analytics for real-user field CWV (LCP, CLS, INP) if data exists
- WebPageTest (Moto G4 or low-end Android, Slow 4G) for filmstrip, LCP element, and blocking-request waterfall
- Chrome DevTools: Performance panel (LCP/CLS/INP markers, main-thread flame chart), Coverage tab (unused JS/CSS), Rendering panel (paint flashing, layer borders, layout shift regions, font-swap emulation), Network throttling
- npm run build to read the per-route First Load JS table (Next 15.5), plus inspection of .next/static/chunks and .next/app-build-manifest.json
- @next/bundle-analyzer or webpack-bundle-analyzer to attribute chunk weight to modules
- Playwright (already a devDependency) to script repeatable navigations, capture CLS via PerformanceObserver, and record traces headlessly
- curl -I on hashed and public assets to confirm Cache-Control immutability
- squoosh or ImageMagick to test-encode fox.webp and demo images to AVIF and to right-sized dimensions for comparison

**Deliverable.** A prioritized Performance and Core Web Vitals findings report for Stackwrk containing: (1) a baseline table of measured LCP, CLS, INP, TBT, and Speed Index for mobile and desktop across /, /services, /pricing, /work, /tools, /demos/apex-fence, and /prospects, from both lab (Lighthouse) and, where available, field (CrUX/Vercel Speed Insights); (2) a per-route First Load JS table from npm run build with the biggest contributors attributed to specific modules (expected top offenders: DemoShowcase and the eagerly bundled modals); (3) a ranked list of findings, each tied to a concrete file and line (for example HeroMedia.tsx srcset, layout.tsx missing font preload, the 0-of-15 img tags without dimensions, globals.css body::after blend overlay, Nav.tsx fixed backdrop-blur) with severity, the measured before value, the suspected cause, and the expected impact of the fix (for example "lazy-load DemoShowcase to remove roughly X KB from initial JS" or "add width/height to cut CLS from Y to under 0.1"); (4) the identified LCP element per route and what is delaying it; and (5) a short, repeatable measurement script or Playwright harness plus the Lighthouse command set so the audit can be re-run after fixes to prove the deltas. No fixes are applied; the output is the measured, evidence-backed plan of what to change and why.

---

### 2. Security & Privacy  (P0)

**Objective.** Verify that every path holding customer PII or moving money is actually protected, that the two server-side auth schemes (signed CRM cookies and the raw CRM_ACCESS_KEY bearer) cannot be forged or bypassed, that inbound webhooks (Quo, Stripe) reject forged or replayed payloads, that the unauthenticated SSRF surface (/api/audit) cannot be steered at internal or cloud-metadata hosts, that the Supabase service-role key stays server-only with RLS-on-no-policy tables as the last line of defense, and that PII (leads, call transcripts, e-signatures, the 254-lead seed) is handled and stored responsibly. This matters because Stackwrk is BOTH a public marketing site and the internal CRM for the whole book of business: a single missing auth check on a /api/team* route, a forgeable session, or an SSRF bypass exposes every prospect's name, phone, email, address, call transcript and signed agreement, and the site runs on a service-role key that bypasses RLS entirely, so app-layer auth is the only real gate on most tables.

**Scope**

- src/lib/crm-auth.ts (makeToken/verifyToken/getUsers, CRM_ACCESS_KEY HMAC)
- src/lib/quo.ts (verifyQuoWebhook, verifyLegacy, verifyStandard, timingSafeEqualB64)
- src/lib/safe-fetch.ts (isPrivateIp, isBlockedHost, resolvesToPrivate, normalizeUrl, guardedFetch)
- src/lib/supabase.ts (getSupabaseAdmin service-role client)
- src/lib/stripe.ts, src/lib/email.ts
- src/app/api/team/route.ts, api/team/audits/route.ts, api/team/quo-calls/route.ts, api/team/seed/route.ts
- src/app/api/team-login/route.ts
- src/app/api/leads/route.ts (query-param key auth), api/leads/find-email/route.ts
- src/app/api/audit/route.ts (unauthenticated SSRF surface + fetchRobots), api/audit-report/route.ts
- src/app/api/quo/webhook/route.ts (allowlist, raw payload storage), api/quo/contacts/route.ts
- src/app/api/webhooks/stripe/route.ts, api/checkout/route.ts, api/sign/route.ts, api/book/route.ts
- src/app/prospects/page.tsx + Gate.tsx + Board.tsx (maskProspect presentation mode)
- src/components/CrmBoard.tsx (sessionStorage key)
- supabase/schema.sql + signatures.sql + team-crm.sql + quo-calls.sql + quo-messages.sql + quo-contacts.sql + payments.sql
- src/data/prospects-seed.json (254 real business records committed to git)
- .env.example, .gitignore

**Quick wins (check these first)**

- crm-auth.ts:9 ships a hardcoded fallback secret: SECRET = process.env.CRM_ACCESS_KEY || 'stackwrk-crm-dev-secret'. If CRM_ACCESS_KEY is unset in prod while CRM_USERS is set, anyone who knows a username (e.g. 'tal') can forge a valid session token and open the entire CRM without a password.
- SSRF short/encoded-IP bypass: isPrivateIp in safe-fetch.ts only matches dotted-quad, so http://127.1, http://2130706433, http://0x7f.0.0.1 and octal forms slip past isBlockedHost and resolvesToPrivate, then getaddrinfo may resolve them to loopback. The consuming route /api/audit is UNAUTHENTICATED.
- verifyLegacy in quo.ts has no timestamp/replay window (only verifyStandard enforces the 300s window), so a captured legacy openphone-signature webhook can be replayed indefinitely.
- QUO_ALLOWED_NUMBERS is only enforced when both allowlist.length AND ownDigits are truthy (webhook/route.ts:52); if context.phoneNumber is absent the allowlist is skipped and a different business's calls/texts land in this CRM.
- /api/leads accepts the CRM_ACCESS_KEY via ?key= query string (leads/route.ts:25), so the master key leaks into server logs, browser history and Referer headers; the comparison is also a plain === (not timing-safe).
- src/data/prospects-seed.json (254 real South Florida business names, phone numbers and street addresses) is committed to the git repo.
- /api/audit has no rate limiting and does a server-side fetch of any user-supplied URL, usable as an SSRF probe and a serverless-cost / traffic-amplification DoS.
- Presentation mode (Board.tsx maskProspect) masks only in the browser render; the real PII is still fetched via /api/team and lives in network responses and React state, so it is a screenshot aid, not a security boundary.

**Checks**

- **[CRITICAL]** CRM session HMAC uses a hardcoded fallback secret when CRM_ACCESS_KEY is unset (crm-auth.ts:9). Determine whether forging makeToken('tal') with the literal 'stackwrk-crm-dev-secret' yields a token that verifyToken accepts, given CRM_USERS is set but CRM_ACCESS_KEY is not.
  - How: Read crm-auth.ts; in a Node harness compute the token for a known username with the fallback secret and pass it to verifyToken with CRM_USERS set and CRM_ACCESS_KEY unset; then curl /api/team with that forged crm_session cookie.
  - Signal of a problem: verifyToken returns a username / GET /api/team returns 200 with lead data using a token minted from the hardcoded default secret, i.e. full CRM access with no password.
- **[CRITICAL]** Every mutating and reading /api/team* handler and other cookie-gated routes actually enforce verifyToken before calling getSupabaseAdmin (team, team/audits, team/quo-calls, team/seed, sign GET, leads/find-email, quo/contacts). Since the service-role key bypasses RLS, a single missing gate exposes a whole table.
  - How: Grep every exported HTTP handler under src/app/api and confirm the verifyToken (or CRM_ACCESS_KEY) check precedes any Supabase call; then curl each endpoint with no cookie and with a garbage cookie.
  - Signal of a problem: Any team/CRM endpoint returns 200 with real data (leads, call transcripts, seed list, signatures) on a request that carries no valid crm_session cookie.
- **[CRITICAL]** Supabase RLS is live and matches the repo intent: all eight tables (leads, audits, team_crm, signatures, quo_calls, quo_messages, quo_contacts, payments) have RLS enabled with zero anon/public policies, so the anon key cannot read them and only the service role (server) can.
  - How: Supabase MCP get_advisors plus list_tables / policy inspection on the live project; attempt an anon-key select against leads to confirm it returns nothing.
  - Signal of a problem: get_advisors flags RLS-disabled or a permissive policy, or an anon-key select returns rows from any of these tables (drift from the SQL files).
- **[CRITICAL]** Service-role key confinement: SUPABASE_SERVICE_ROLE_KEY is only ever read server-side (supabase.ts) and never behind a NEXT_PUBLIC_ prefix, and no route returns it or leaks it in an error body.
  - How: Grep for SERVICE_ROLE and NEXT_PUBLIC across the repo and the built client bundle (.next/static) to confirm the key never ships to the browser.
  - Signal of a problem: The service-role key (or any sk_/whsec_/re_ secret) appears in a NEXT_PUBLIC_ var, a client bundle, or an API error response.
- **[HIGH]** /api/leads GET/PATCH authorization accepts the master CRM_ACCESS_KEY via the ?key= query parameter and compares with a plain === (leads/route.ts:21-26). Query-string secrets leak into logs, history and Referer; === is not constant-time.
  - How: Read leads/route.ts authorized(); curl /api/leads?key=THEKEY and confirm it authorizes; check whether the key would appear in Vercel access logs / Referer.
  - Signal of a problem: GET /api/leads?key=... returns leads (secret transmitted in URL), and/or the comparison is a direct === rather than crypto.timingSafeEqual.
- **[HIGH]** verifyQuoWebhook fails closed when neither QUO_WEBHOOK_SECRET nor QUO_WEBHOOK_SECRET_LEGACY is configured, and there is no code path where a missing secret is treated as valid (quo.ts:129-142).
  - How: Read verifyQuoWebhook; unset both secrets and POST any body to /api/quo/webhook.
  - Signal of a problem: With secrets unset, the webhook returns 200 received:true or otherwise processes the body instead of 401 bad_signature.
- **[HIGH]** SSRF: isPrivateIp / isBlockedHost only recognize dotted-quad and standard IPv6 forms, so short (127.1), integer (2130706433), hex (0x7f.0.0.1) and octal (017700000001) encodings of loopback/private space are not blocked, while getaddrinfo/undici may still resolve them internally. The consuming route /api/audit is unauthenticated.
  - How: Unit-test isPrivateIp/isBlockedHost/normalizeUrl with the encoded-IP list; then POST {url:'http://127.1'} / {url:'http://2130706433'} to /api/audit and observe whether guardedFetch attempts the request.
  - Signal of a problem: normalizeUrl returns a URL (not null) and guardedFetch proceeds for an encoded loopback/private address instead of throwing blocked_host / returning invalid_url.
- **[HIGH]** Cloud metadata reachability end to end: confirm a request that resolves or redirects to 169.254.169.254 (and IPv6 ::ffff:169.254.169.254 / fd00 ranges) is blocked on the initial host AND on every redirect hop of guardedFetch, including the audit route's fetchRobots which uses a plain fetch rather than guardedFetch (audit/route.ts:30).
  - How: Stand up a public host that 302-redirects to http://169.254.169.254/latest/meta-data/ and submit it to /api/audit and /api/leads/find-email; separately point robots.txt handling at an internal origin via the encoded-IP bypass.
  - Signal of a problem: Any hop reaches 169.254.169.254 or another private target, or fetchRobots issues a request to an internal origin that guardedFetch would have blocked.
- **[HIGH]** /api/audit is unauthenticated, unrate-limited and performs a server-side fetch of an arbitrary URL, making it both the primary SSRF surface and a serverless-cost / amplification DoS vector.
  - How: Read audit/route.ts (no auth, no limiter); loop several rapid POSTs with distinct URLs and confirm each triggers an outbound fetch with no throttle.
  - Signal of a problem: Repeated anonymous POSTs each cause an outbound fetch with no rate limit, IP throttle, or auth in front of them.
- **[HIGH]** Stripe webhook integrity: /api/webhooks/stripe verifies via constructEvent on the raw body, fails closed (503) when the secret is missing, and is idempotent on event.id (webhooks/stripe/route.ts + payments.sql PK on id).
  - How: Send an unsigned and a wrong-secret event (expect 400 bad_signature), then a valid event twice and confirm one row via the event.id primary key.
  - Signal of a problem: An event with a missing/invalid stripe-signature is accepted, or a duplicate event.id inserts twice / errors instead of being idempotent.
- **[HIGH]** Secret history hygiene: confirm no real secret (service-role JWT, sk_live, re_, whsec_) was ever committed to git history, and .gitignore covers .env and .env*.local.
  - How: gitleaks/trufflehog over full history plus git log -p on env paths; verify .gitignore entries.
  - Signal of a problem: Any real secret surfaces in git history (even if since removed) or an env file is tracked.
- **[MEDIUM]** Two divergent auth schemes coexist: /prospects and /api/team* use signed cookies while /crm and /api/leads use the raw CRM_ACCESS_KEY stored in sessionStorage (CrmBoard.tsx:28,46). Confirm the raw master key is persisted client-side and reachable via XSS or a shared machine.
  - How: Read CrmBoard.tsx; load /crm, enter the key, inspect sessionStorage['crm_key'] in devtools.
  - Signal of a problem: The plaintext CRM_ACCESS_KEY (which is also the session-signing secret) sits in sessionStorage, readable by any script running on the origin.
- **[MEDIUM]** verifyLegacy (quo.ts:109) omits any timestamp / replay window, unlike verifyStandard which enforces a 300s window (quo.ts:120). A captured legacy openphone-signature request is replayable forever.
  - How: Node harness: build a valid legacy signature with a known secret, verify it passes verifyLegacy, then re-submit the identical body/header hours later and confirm it still passes; POST a replayed event to /api/quo/webhook.
  - Signal of a problem: A byte-identical legacy webhook replayed after an arbitrary delay still returns verified true and writes/overwrites rows in quo_calls/quo_messages.
- **[MEDIUM]** QUO_ALLOWED_NUMBERS allowlist is bypassed when ownDigits is empty (webhook/route.ts:52 guards on `allowlist.length && ownDigits`). Events lacking context.phoneNumber are processed regardless of the allowlist, leaking another line's calls/texts into this CRM.
  - How: POST a validly-signed webhook whose data.context has no phoneNumber and confirm the call/message is still stored despite an allowlist being set.
  - Signal of a problem: A signed event with no resolvable own-number is written to quo_calls/quo_messages even though QUO_ALLOWED_NUMBERS is configured and would not match it.
- **[MEDIUM]** DNS-rebinding TOCTOU in guardedFetch: resolvesToPrivate does its own DNS lookup, then fetch() does a second, independent lookup with no IP pinning (safe-fetch.ts:76-86). A record that flips between a public and a private IP can pass the guard and then connect internally.
  - How: Point a controlled hostname with a very low TTL alternating between a public IP and 169.254.169.254, submit it to /api/audit repeatedly, and watch for an internal fetch; or document the gap by code inspection and recommend resolve-then-pin.
  - Signal of a problem: The guard validates the public answer while the subsequent fetch connects to the private answer (evidence of an internal request, or a clear absence of IP pinning in the code).
- **[MEDIUM]** Rate limiting coverage across public POST routes: only /api/sign has an (in-memory, x-forwarded-for-trusting) limiter (sign/route.ts:14-25); /api/leads POST, /api/book, /api/audit-report, /api/checkout and /api/audit have none. Also confirm the sign limiter is not trivially bypassed by rotating the spoofable x-forwarded-for header.
  - How: Read each route; burst-POST each endpoint and observe absence of 429; for /api/sign, resend past the limit while rotating x-forwarded-for.
  - Signal of a problem: Public endpoints accept unbounded bursts (DB flooding, email relay via book/audit-report/sign, Stripe session spam via checkout), and /api/sign's limiter resets per forged x-forwarded-for value.
- **[MEDIUM]** Input validation on /api/checkout: attacker-controlled amount, monthly, label, plan and client are accepted with no length clamp and flow into Stripe product_data.name and payment_intent_data.description (checkout/route.ts:37-63); confirm amounts are integer-coerced and bounded and strings are not unbounded.
  - How: POST oversized label/plan strings and edge amounts (0, negative, huge, non-numeric) and inspect the created session / error handling.
  - Signal of a problem: Unbounded or attacker-shaped strings reach Stripe, or an out-of-range amount is accepted, or unlimited sessions can be minted anonymously.
- **[MEDIUM]** PII committed to source control: src/data/prospects-seed.json contains 254 real business names, phone numbers and street addresses and is tracked in git (now served only via login-gated /api/team/seed, but the file itself lives in the repo).
  - How: Inspect the tracked file and git history; assess whether this repo/host or any fork exposes it.
  - Signal of a problem: Real contact PII is present in the repository and would be exposed to anyone with repo/history/fork access regardless of the app-layer login gate.
- **[MEDIUM]** PII at rest and lifecycle: leads, quo_calls/quo_messages (bodies, transcripts, summaries, full raw event JSON), quo_contacts, and signatures (captured IP, user-agent, and a base64 drawn-signature image up to 60KB) are stored with no documented retention, deletion, or subject-access path. Assess minimization and a data-subject deletion story.
  - How: Read the webhook handlers (raw:event storage) and sign/route.ts record shape; review the SQL columns; check for any deletion endpoint or retention job.
  - Signal of a problem: Sensitive PII (call transcripts, signature images, IPs) is stored indefinitely with no deletion mechanism or minimization, creating GDPR/CCPA and breach-blast-radius exposure.
- **[MEDIUM]** team-login brute-force and enumeration: /api/team-login POST validates credentials with a plain === (crm-auth.ts:23) and has no rate limiting or lockout, and returns distinct errors (not_configured vs invalid) that could aid enumeration.
  - How: Read team-login/route.ts and checkLogin; burst wrong-password POSTs and observe no throttling; compare 401 invalid vs 503 not_configured responses.
  - Signal of a problem: Unlimited password guesses are accepted with no delay/lockout, and the password check is a non-constant-time string compare.
- **[MEDIUM]** find-email SSRF and scraping scope: /api/leads/find-email (team-gated) fetches an arbitrary body.url via guardedFetch and follows one contact-page hop (find-email/route.ts); confirm the same encoded-IP / rebinding gaps as /api/audit apply here and that the one extra hop is also host-validated.
  - How: As an authenticated team user, submit encoded-loopback and redirect-to-internal URLs and confirm guardedFetch blocks both the homepage fetch and the contact-page hop.
  - Signal of a problem: An authenticated user can steer find-email at an internal host via an encoded IP or a contact-link pointing at a private address.
- **[LOW]** Presentation-mode masking is a display-only transform: maskProspect (Board.tsx:106,466,521,558) runs in the browser after /api/team returns the real records, so real names/phones/emails/addresses remain in the network response and React state even while 'Presenting'. Confirm no server-side redaction exists and document the limitation.
  - How: With presentation mode on, open the Network tab and inspect the /api/team response and React state for unmasked PII; confirm readOnly/disabled inputs are the only protection and are devtools-bypassable.
  - Signal of a problem: Real PII is visible in the /api/team payload or component state while the UI shows masked values, i.e. masking protects only against over-the-shoulder viewing, not data capture.
- **[LOW]** Email/notify injection and PII fan-out: name/email/when values are interpolated into email subjects (book/route.ts:87,96, audit-report/route.ts:131) and HTML bodies; confirm HTML bodies escape user input (book esc(), audit-report escapes < only) and that subjects cannot carry header/newline injection, and that notify emails are only sent to the configured REPORT_NOTIFY_EMAIL.
  - How: POST names/emails containing <, >, newlines and quotes to /api/book, /api/audit-report and /api/sign; inspect the generated HTML and subject and the recipient list.
  - Signal of a problem: Unescaped user input renders as markup in an outbound email, a newline reaches a subject/header, or lead PII is sent anywhere other than the configured notify address.
- **[LOW]** Cookie and session hardening: crm_session is httpOnly, sameSite=lax, secure only in production, path=/, 30-day maxAge (team-login/route.ts:6-12); the token has no expiry baked in (it is a bare HMAC of the username), so it never rotates and cannot be revoked short of changing CRM_ACCESS_KEY or removing the user from CRM_USERS.
  - How: Read cookieOpts and makeToken/verifyToken; inspect the Set-Cookie header; reason about token revocation and lifetime.
  - Signal of a problem: A leaked crm_session is valid indefinitely (no exp claim, no rotation), and there is no per-session revocation short of rotating the global secret.

**Tooling**

- ripgrep / Grep for auth-gate coverage: rg 'export async function (GET|POST|PUT|PATCH|DELETE)' across src/app/api and confirm each handler calls verifyToken or the CRM_ACCESS_KEY check before touching getSupabaseAdmin
- A small local Node/ts harness that imports safe-fetch.ts and asserts isPrivateIp/isBlockedHost/normalizeUrl against a payload list (127.1, 2130706433, 0x7f.0.0.1, 017700000001, ::1, ::ffff:127.0.0.1, 169.254.169.254, [::ffff:a9fe:a9fe], metadata.google.internal, http://localhost#.evil.com)
- A Node harness that imports verifyQuoWebhook and feeds forged/replayed legacy and standard signatures, missing-secret cases, and old timestamps
- curl against a running dev server for endpoint probing: no-cookie and forged-cookie requests to every /api/team* and /api/leads and /api/sign GET; SSRF payloads and redirect-to-169.254.169.254 targets to /api/audit and /api/leads/find-email; missing/garbage stripe-signature and quo signatures to the webhooks
- Supabase MCP: get_advisors (security lints), list_tables and per-table policy inspection to confirm RLS is enabled with zero anon/public policies on leads, audits, team_crm, signatures, quo_calls, quo_messages, quo_contacts, payments (the SQL says so, verify the live project has not drifted)
- Secret-history scanning: gitleaks or trufflehog over full git history, plus git log -p on .env* paths, to confirm no service-role key / sk_live / re_ / whsec_ was ever committed
- next build + tsc --noEmit to confirm the audited code compiles and no type-erasure hides an unchecked any on request bodies
- Stripe CLI (stripe trigger / stripe listen) to confirm /api/webhooks/stripe rejects an unsigned or wrong-secret event and is idempotent on repeated event.id

**Deliverable.** A Security & Privacy findings report, one row per check, each with: file and line reference, severity, a concrete reproduction (the exact curl command, forged token, or SSRF payload used), observed vs expected behavior, and a specific remediation. Group by area (Auth and access control, Webhook verification, SSRF, Input validation and abuse, Secrets and env, Supabase RLS and service-role, PII and presentation mode). Include a confirmed exploit-or-not verdict for each quick-win item (especially the CRM_ACCESS_KEY fallback secret and the 127.1 / integer-IP SSRF bypass, which should be reproduced live against a dev server), a table of every /api route mapped to its auth mechanism and rate-limit status, and a prioritized fix list (P0 blockers first). No code changes are made; the report is the deliverable.

---

### 3. Conversion & UX Funnels  (P0)

**Objective.** Verify that every primary revenue path on Stackwrk actually carries a visitor from first touch to a captured lead or a paid deposit without confusion, friction, broken promises, or dead ends. Stackwrk sells conversion-first websites, so its own funnels are both the product demo and the sales engine: the instant audit (AuditTool to /api/audit-report to Supabase leads), the free-mockup request (AuditForm to /api/leads, reused in FinalCTA, MockupModal, and /contact), the book-a-call path (Calendly plus the BookingDemo to /api/book), and the agreement-to-Stripe close (/agreement, SignBlock to /api/sign to /api/checkout). The audit confirms CTA clarity and consistency, form friction, trust-signal integrity, pricing presentation, the entry discount popup, and that no CTA scrolls or links to nothing. A leaky or contradictory funnel here directly costs Tal booked jobs, so this is the highest-leverage domain to get right.

**Scope**

- src/components/AuditTool.tsx (inline audit + ReportCapture + SampleScorecard)
- src/components/AuditSection.tsx (id=audit wrapper + 10% off badge)
- src/components/AuditForm.tsx (shared mockup/lead form)
- src/components/AuditPopup.tsx (entry discount popup)
- src/components/MockupModal.tsx (#mockup modal)
- src/components/FinalCTA.tsx (id=about, mockup form + deliverables + Calendly)
- src/components/DemoShowcase.tsx (BookingDemo, CalculatorDemo, ChatbotDemo, CrmDemo, DemoCTA to #about)
- src/components/StickyCTA.tsx (mobile audit bar)
- src/components/Nav.tsx (Get a Free Mockup CTA + to() anchor rewrite)
- src/components/Hero.tsx (primaryCta #mockup, secondaryCta #work)
- src/components/Investment.tsx (starting-price strip, #mockup CTA)
- src/components/Plans.tsx (care-plan cards, #audit CTA)
- src/app/page.tsx (home section order + modal/popup mounting)
- src/app/pricing/page.tsx (build tiers + value strip)
- src/app/services/page.tsx
- src/app/contact/page.tsx
- src/app/quote/page.tsx + src/components/QuoteBuilder.tsx (internal, noindex)
- src/app/mockup/page.tsx + src/app/mockup/preview (internal generator)
- src/app/agreement/page.tsx + SignBlock.tsx + agreement/paid/page.tsx
- src/app/api/audit/route.ts
- src/app/api/audit-report/route.ts
- src/app/api/leads/route.ts
- src/app/api/book/route.ts
- src/app/api/sign/route.ts
- src/app/api/checkout/route.ts
- src/lib/content.ts (all CTA + offer + testimonial copy)
- src/lib/pricing.ts (priceItems, carePlans)
- src/lib/agreement.ts (PLAN_PRESETS)

**Quick wins (check these first)**

- Placeholder testimonial is live: src/lib/content.ts testimonials[2] is a TODO stub (name 'Client', role 'Local service business', generic quote) and all three are marked DRAFT, so a fake-looking review renders on the home page and /pricing via Testimonials
- Dead anchor on the pricing page: src/components/Plans.tsx care-plan cards link to bare href=#audit, but /pricing has no #audit section (AuditSection is only on the home page) and all carePlans have empty stripeUrl, so every care card's only CTA scrolls nowhere
- Calendly link may still be a placeholder: content.ts header says to replace Calendly before launch; site.calendlyUrl feeds FinalCTA, ReportCapture, MockupModal, /contact, and the booking email, so one bad value breaks the entire call funnel
- Two competing free offers confuse the primary action: Hero, Nav, Investment, FinalCTA, and MockupModal push 'Free Site Mockup' while AuditSection, AuditPopup, StickyCTA, and pricing CTAs push 'Free Audit + 10% off', and DemoShowcase DemoCTA sends audit-flavored clicks to the mockup form at #about
- Timeline claims disagree: Hero 'about two weeks', pricing Launch 'about 2 weeks', priceItems launch-site '2 to 3 weeks', whatYouGet '2 to 4 weeks'
- Stripe deposit cancel_url in /api/checkout is /agreement without the ?d= config, so a client who backs out of checkout lands on a blank default agreement and loses their specific deal
- AuditForm success state ('Request received, we will reply within one business day') offers no next step (no Calendly, no what-happens-next), a soft dead end on the most-used form
- AuditPopup has no Escape handler, no body scroll lock, and closing on backdrop click silently discards everything typed

**Checks**

- **[HIGH]** Drive the inline audit funnel end to end: enter a URL in AuditTool, confirm /api/audit returns a scored result, submit name+email in ReportCapture, and confirm /api/audit-report both inserts a Supabase lead and sends the report email. Then re-run with email env unset.
  - How: npm run dev, run the flow in the browser with Network tab; inspect src/lib/email.ts sendEmail return and the ReportCapture 'sent' branch in AuditTool.tsx (lines 240 to 268); toggle RESEND/REPORT_FROM_EMAIL off and repeat
  - Signal of a problem: When email is not configured, ReportCapture still shows 'You are in' / 'we will send the full report shortly' with no fallback, so the visitor is promised a report that never arrives (a broken-promise dead end); or the lead insert fails silently and no CRM row appears
- **[HIGH]** Resolve the competing-offer problem: map every primary CTA site-wide to the offer it promises (free mockup vs free audit + 10% off) and whether the destination matches the label.
  - How: grep for href values and CTA labels across Hero, Nav, Investment, FinalCTA, MockupModal, AuditSection, AuditPopup, StickyCTA, Plans, pricing/page.tsx, DemoShowcase; build a label-to-target table
  - Signal of a problem: The visitor cannot tell what the single next step is: Hero/Nav/Investment/FinalCTA say 'Get a Free Site Mockup' while StickyCTA says 'Book a free site audit' and AuditSection/popup push the audit + discount, and DemoShowcase DemoCTA labels ('Put this AI assistant on your site') all dump into the #about mockup form
- **[HIGH]** Confirm site.calendlyUrl is a real, live scheduling link and opens correctly from every place it is used.
  - How: Read content.ts (calendlyUrl and the 'replace placeholder links before launch' note), then click through from FinalCTA, AuditTool ReportCapture 'Book my free call', MockupModal, /contact, and the /api/book confirmation email
  - Signal of a problem: The Calendly URL 404s, points to the wrong account, or is still a placeholder, silently breaking the primary call-booking CTA everywhere it appears
- **[HIGH]** Audit every in-page anchor CTA and confirm its target id exists on the destination route, especially cross-page anchors and component-level bare anchors.
  - How: grep for href="#... and href="/#... across src, then confirm ids audit (AuditSection, home only), about (FinalCTA, home only), work (FeaturedProjects, home only), plans (Plans, /pricing only), mockup, stack, demos exist where linked; pay special attention to Nav.to() rewriting #x to /#x on non-home routes versus components that do not rewrite
  - Signal of a problem: Plans.tsx care cards use bare #audit on /pricing where no #audit exists (scrolls to top / nowhere); any other component-level bare anchor rendered on a non-home route dead-ends the same way
- **[HIGH]** Exercise the full agreement close: open /agreement?d=<config>, sign (typed and drawn) via SignBlock to /api/sign, then pay the deposit via /api/checkout to Stripe and back to /agreement/paid.
  - How: Generate a config link, sign in the browser, watch /api/sign (signature stored + emails), then use Stripe test mode to complete /api/checkout and verify redirect to /agreement/paid?type=deposit
  - Signal of a problem: Signing fails, the deposit button never appears, checkout returns 503 without the invoice fallback message, or the success page does not confirm the specific deal, stalling the money step
- **[HIGH]** Validate trust signals are real and substantiated, not placeholder or fabricated.
  - How: Read content.ts testimonials (DRAFT flags + the [2] TODO stub) and FinalCTA.tsx (avatarGradients fake avatars + 'Trusted by contractors across South Florida'); confirm which Testimonials render on home and /pricing
  - Signal of a problem: A visibly placeholder testimonial ('Client', 'Local service business') or generic fake-avatar trust bar reads as untrustworthy on the exact pages meant to build confidence
- **[MEDIUM]** Confirm the entry popup (AuditPopup) captures and flags the 10% founding discount correctly and does not double-count leads against the inline tool.
  - How: Trigger the popup (2.5s on home), submit, and watch that it calls /api/audit then /api/audit-report with source 'popup_audit'; then also use the inline AuditTool with the same email and check Supabase leads for duplicates
  - Signal of a problem: A visitor who uses both the popup and the inline tool creates two or three leads plus multiple audits rows for one person, cluttering the CRM and muddying follow-up; or the discount note is stored inconsistently
- **[MEDIUM]** Evaluate the discount popup's value ordering and friction: it asks for url + name + email + a consent checkbox before showing any score, whereas the inline tool shows the score first and asks for email after.
  - How: Compare AuditPopup.tsx (fields + ready gate at line 49) against AuditTool.tsx ReportCapture ordering; assess drop-off risk of a four-field gate shown 2.5s after landing
  - Signal of a problem: The popup demands maximum information before delivering any payoff (no score shown in the 'done' state, only 'on its way to your inbox'), the highest-friction lowest-reward ask on the site, likely suppressing completion and possibly raising bounce
- **[MEDIUM]** Verify the StickyCTA logic: it is labeled around the audit (links to #audit) but hides when #about (the FinalCTA mockup form) is on screen.
  - How: Read StickyCTA.tsx (atForm observer on #about, href #audit) and scroll the home page on a mobile viewport watching when the bar shows and hides
  - Signal of a problem: The persistent 'Book a free site audit' bar disappears exactly when the user reaches the mockup form rather than the audit, so the mobile visitor loses the audit CTA at the wrong moment and sees a mockup form instead of what the bar promised
- **[MEDIUM]** Clarify the BookingDemo status: it is presented in a 'Live product lab / demo' but posts to /api/book, inserts a real lead, and emails a real 'your call is booked' confirmation, while showing 'You are booked!'.
  - How: Trace DemoShowcase.tsx BookingDemo submit to /api/book/route.ts; complete it and check the confirmation email plus the leads row; compare against the real Calendly path used elsewhere
  - Signal of a problem: A visitor believes they booked a real meeting (confirmation email sent) but no calendar event is created (only a Google Calendar 'add' link and a CRM lead), and the site also offers Calendly separately, so there are two conflicting booking surfaces and a possible no-show or double-book
- **[MEDIUM]** Verify the Stripe deposit cancel path preserves the client's agreement context.
  - How: In SignBlock start checkout, then cancel on the Stripe page and observe the landing URL; compare to /api/checkout cancel_url ('/agreement' with no ?d=)
  - Signal of a problem: Cancelling checkout drops the client on a blank default agreement (resolveAgreement of {}), losing their name, package, and price, so they cannot easily resume paying
- **[MEDIUM]** Confirm the deposit amount and care price cannot be tampered with by the client before payment.
  - How: Inspect SignBlock payDeposit posting depositAmount and /api/checkout trusting b.amount / b.monthly with no server-side re-derivation from the signed config
  - Signal of a problem: A user can alter the posted amount in the browser and pay an arbitrary (lower) deposit, since checkout does not recompute the price from a trusted source
- **[MEDIUM]** Determine whether the care-plan subscription is actually purchasable anywhere in the funnel.
  - How: Check carePlans[].stripeUrl in pricing.ts (all empty), the Plans.tsx branch that only shows 'Subscribe now' when stripeUrl is set, and whether /api/checkout kind=care is reachable from any UI
  - Signal of a problem: Every care card falls back to 'Start with a free audit' (and to the dead #audit anchor on /pricing), so the recurring-revenue path has no working purchase button and the kind=care checkout branch is effectively dead code
- **[MEDIUM]** Check price and offer consistency across every surface that quotes a number or a discount.
  - How: Cross-reference Investment ($2,000), pricing.ts priceItems launch-site (founding 2000 / standard 3000), pricing/page.tsx build tiers via PLAN_PRESETS (fee vs listFee), Plans care prices, ChatbotDemo ('around $2,000'), and the popup/AuditSection '10% off' plus '$2,000' in the org schema
  - Signal of a problem: A visitor sees mismatched starting prices or a discount that is described differently (10% off, founding rate, first 5 clients) across pages, undermining the 'fixed prices, no surprises' promise
- **[MEDIUM]** Verify the guarantee and refund language is consistent and accurate across the funnel.
  - How: Compare content.ts guarantee (flagged 'confirm terms'), pricing page ('Refundable deposit', 'Love-the-design guarantee'), and agreement page ('Zero-risk ... full refund of your deposit')
  - Signal of a problem: The public guarantee copy, pricing badges, and the binding agreement describe the refund differently, creating a claim Tal may not intend to honor or that a client can dispute
- **[MEDIUM]** Inventory form friction across all lead-capture forms: required vs optional fields, honeypots, inline validation, error copy, and double-submit guards.
  - How: Compare AuditForm (name/email + optional website/message), ReportCapture (name/email), AuditPopup (url/name/email + consent), BookingDemo (name/email + optional phone), SignBlock; check each uses noValidate with JS validation and disables on submit
  - Signal of a problem: A form asks for more than needed (the popup's four-field gate), lacks inline validation so users hit opaque errors, or allows a double submit that creates duplicate leads or a double charge
- **[MEDIUM]** Assess modal and popup accessibility and data-safety (AuditPopup, MockupModal, SignBlock).
  - How: axe/Lighthouse plus manual keyboard test: Escape to close, body scroll lock, focus trap and focus return, and whether a backdrop click discards typed input
  - Signal of a problem: AuditPopup has no Escape handler, no scroll lock, and a backdrop click silently deletes everything the visitor typed; MockupModal lacks a focus trap; keyboard and screen-reader users cannot operate the funnel cleanly
- **[MEDIUM]** Verify the audit endpoint that powers the top-of-funnel is protected against abuse that would slow or break the funnel.
  - How: Read /api/audit/route.ts (maxDuration 20, server-side guardedFetch, no per-IP rate limit) and compare to /api/sign which does rate-limit; attempt rapid repeated requests
  - Signal of a problem: The public audit endpoint has no throttle, so a burst of requests can exhaust the warm instance and make the flagship 'instant audit' hang or fail for real visitors
- **[MEDIUM]** Confirm conversion events across all four funnels are instrumented so the executed audit can be quantified over time.
  - How: grep the app for analytics (gtag, plausible, posthog, fathom) and check whether audit-run, report-requested, mockup-submitted, call-booked, agreement-signed, and deposit-paid fire any event
  - Signal of a problem: Stackwrk's own funnels have no conversion tracking (ironic given the audit dings prospects for missing analytics), so there is no data to measure drop-off or prove the fixes worked
- **[LOW]** Reconcile the delivery-timeline claim across the site.
  - How: grep for week/weeks in content.ts and pricing pages; compare Hero, pricing Launch, priceItems, and whatYouGet
  - Signal of a problem: The site promises 'about two weeks', '2 to 3 weeks', and '2 to 4 weeks' in different places, a small but repeated trust and expectation-setting inconsistency
- **[LOW]** Confirm the home page's absence of any pricing section is intentional and does not create a price-discovery dead end.
  - How: Read page.tsx (Investment and Plans are not mounted on home); confirm price is reachable only via the Nav 'Pricing' link and the chatbot demo mention
  - Signal of a problem: A price-sensitive home visitor finds no dollar figure and no direct 'see pricing' CTA in the main flow, adding a step before they can qualify themselves
- **[LOW]** Confirm internal tools never appear as public funnel destinations and stay noindex and unlinked.
  - How: Verify /quote, /mockup, /agreement carry robots noindex and are not linked from any public CTA; confirm Nav 'bare' regex hides marketing chrome on those routes
  - Signal of a problem: A public CTA or crawler reaches the internal QuoteBuilder or Mockup generator, exposing pricing internals or a form that means nothing to a prospect

**Tooling**

- npm run dev, then drive each funnel manually in a browser with the DevTools Network tab open to watch /api/audit, /api/audit-report, /api/leads, /api/book, /api/sign, /api/checkout
- Playwright or Puppeteer to script the four funnels end to end and capture pass/fail plus screenshots at each step
- grep / ripgrep and Read to inventory every CTA (href, label, target id) and cross-check anchor targets against ids that exist on each destination route
- Stripe test mode with test cards (4242...) to exercise agreement sign to deposit to /agreement/paid, plus the checkout cancel path
- Supabase dashboard (leads, audits, signatures tables) to confirm rows land and to spot duplicate leads
- Resend dashboard or env inspection to confirm the audit report, booking, and signed-agreement emails actually send (verify RESEND_API_KEY, REPORT_FROM_EMAIL, NOTIFY_EMAIL, SUPABASE, STRIPE, CRM keys, and site.calendlyUrl are real in prod)
- axe DevTools or Lighthouse accessibility pass on the modal and form surfaces (AuditPopup, MockupModal, SignBlock)
- Mobile viewport emulation for StickyCTA, AuditPopup, and the agreement sign flow

**Deliverable.** A funnel-by-funnel conversion audit report covering the four primary paths (instant audit to email report to CRM, free-mockup request, book-a-call, and agreement to Stripe deposit). It must include: (1) a complete CTA inventory table listing every button and link (label, source file and line, target, and a works / dead / mislabeled verdict), with all dead anchors and broken promises called out explicitly (starting with the confirmed dead #audit anchor on /pricing care cards and the placeholder testimonial); (2) an end-to-end pass/fail with screenshots or a recording for each funnel run in a production-like config (real Calendly, Stripe test mode, email and Supabase connected), including the email-unconfigured and checkout-cancel edge cases; (3) a per-form friction map (fields, validation, a11y, double-submit and duplicate-lead risk); (4) a trust-and-pricing consistency findings list (placeholder testimonials, guarantee wording, price and timeline mismatches, discount and scarcity claims); and (5) a single prioritized fix list, each item tagged with severity and the exact file and line, ordered so the quick-win dead ends and the offer-clarity conflict are fixed first. No code changes are made; this is findings only.

---

### 4. Data Model & Integrations  (P0)

**Objective.** Verify that Stackwrk's persistence layer and every external integration keep lead data correct, private, and non-duplicated across the full lifecycle: audit inbound to prospect to Quo sync to Instantly export to signed agreement to Stripe payment. Concretely, prove that (1) Supabase RLS is actually on in the live project so anon/browser clients cannot read leads/audits/team_crm/signatures/payments/quo_* (the app relies entirely on service-role bypass with zero policies), (2) the Quo call/SMS/contact webhook upserts build up rows correctly by externalId/id without clobbering real status/time or dropping enrichment events, (3) Instantly CSV export and the emailCheckedAt / exportedAt / quoSyncedSig bookkeeping never re-email or re-push the same contact, (4) find-email only returns real published business emails, (5) phone dedup/flagging classifies numbers correctly before a dial, (6) the whole-document team_crm store does not silently lose concurrent edits (which would also resurrect already-exported leads), and (7) external calls to Quo/Stripe are idempotent on retry and their failures are observable rather than silently swallowed. This matters because this repo IS the go-to-market engine: a data bug here means double-emailing a prospect from the company domain, leaking a customer's PII, or losing paid/signed records.

**Scope**

- supabase/schema.sql (leads, audits)
- supabase/team-crm.sql (team_crm single-JSON store)
- supabase/quo-calls.sql
- supabase/quo-messages.sql
- supabase/quo-contacts.sql
- supabase/signatures.sql
- supabase/payments.sql
- src/lib/supabase.ts (getSupabaseAdmin, service-role only)
- src/lib/quo.ts (quoFetch, verifyQuoWebhook, verifyLegacy, verifyStandard, upsertQuoContact, fetchCallHistory/Transcript/Summary, resolvePhoneNumberId)
- src/lib/prospects.ts (phoneDigits, phoneCheck, SOFLA_AREA_CODES, TOLLFREE_CODES, Prospect type)
- src/lib/safe-fetch.ts (normalizeUrl, guardedFetch, isPrivateIp, readBodyCapped)
- src/app/api/quo/webhook/route.ts (handleCall, handleMessage, handleContact, otherParty, allowlist)
- src/app/api/quo/contacts/route.ts
- src/app/api/leads/find-email/route.ts (bestEmail, contactPageLink, JUNK_DOMAIN, JUNK_LOCAL)
- src/app/api/leads/route.ts
- src/app/api/team/route.ts (GET/PUT whole-doc, DOC_ID='prospects')
- src/app/api/team/audits/route.ts (domainOf, SELF regex)
- src/app/api/team/quo-calls/route.ts
- src/app/api/webhooks/stripe/route.ts
- src/app/api/audit/route.ts (audits insert)
- src/app/prospects/Board.tsx (parseCSV, rowsToProspects, doImport, exportInstantlyCSV, findMissingEmails, quoSyncSig, maybeAutoSyncQuo, load-merge effect, debounced PUT)

**Quick wins (check these first)**

- Quo webhook overwrites the real call status and occurred_at on every enrichment event: call.transcript.completed / call.summary.completed / call.recording.completed set status to 'transcript.completed' etc. and shift occurred_at to the enrichment time (src/app/api/quo/webhook/route.ts lines 83 to 97). Almost certainly already corrupting quo_calls.
- Instantly 'Export new' can email the same address twice: dedup is per-lead exportedAt plus in-batch email only, so two leads sharing one email get contacted on successive exports (src/app/prospects/Board.tsx lines 354 to 383).
- team_crm is a single last-write-wins JSON document with no concurrency check (src/app/api/team/route.ts lines 23 to 35); concurrent editors lose data AND lose exportedAt/emailCheckedAt/quoSyncedSig stamps, which resurrects already-exported leads for re-emailing.
- QUO_ALLOWED_NUMBERS multi-tenant filter is bypassed and own-number exclusion fails when context.phoneNumber is absent, because ownDigits='' short-circuits the guard (webhook/route.ts lines 50 to 52, 65 to 69).
- Legacy Quo webhook signature path has no replay window; only the Standard path checks the 5-minute timestamp (src/lib/quo.ts lines 109 to 120).
- Best-effort .then(()=>{}, ()=>{}) on Quo/Stripe writes returns 200 even on a real DB failure, so the provider never retries and the event is lost (webhook/route.ts 101/119/143, stripe/route.ts 45 to 52).
- upsertQuoContact write/dedup schema is self-documented as unverified against Quo (src/lib/quo.ts lines 148 to 176): confirm the externalIds+sources lookup actually dedups or every push creates a duplicate contact.
- Confirm live RLS is on for all seven tables via get_advisors, since the SQL files are the only evidence and the whole PII model rests on it.

**Checks**

- **[CRITICAL]** Confirm RLS is actually ENABLED on all seven public tables in the live Supabase project (leads, audits, team_crm, signatures, payments, quo_calls, quo_messages) and that ZERO policies exist. The entire privacy model in supabase/schema.sql depends on 'RLS on, no policies, service-role bypasses' being true in the deployed DB, not just in the checked-in SQL.
  - How: Run Supabase get_advisors (security lint) and list_tables on the project, and/or execute SQL: select relname, relrowsecurity from pg_class where relname in ('leads','audits','team_crm','signatures','payments','quo_calls','quo_messages'); and select * from pg_policies where schemaname='public'; Compare against the SQL files.
  - Signal of a problem: Any of the tables shows relrowsecurity=false, or an advisor flags 'RLS disabled in public', or an unexpected permissive policy exists: every lead, signature, and phone transcript is then readable by the anon key that ships to the browser.
- **[CRITICAL]** Confirm the Supabase service-role key never reaches the client bundle. getSupabaseAdmin() reads SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix) and must be imported only by server route handlers.
  - How: Grep confirmed all 11 importers of @/lib/supabase are src/lib/supabase.ts plus src/app/api/**/route.ts (no client components). Re-verify no 'use client' file imports it, and grep the production build output (.next) for the service-role key value to be sure it is not inlined.
  - Signal of a problem: A component with 'use client' imports getSupabaseAdmin, or the service-role JWT string appears in any .next client chunk.
- **[HIGH]** Verify Quo webhook does NOT clobber a call's real status and occurred_at when later enrichment events arrive. In src/app/api/quo/webhook/route.ts handleCall, `status` (line 83) and `occurred_at` (line 84) are written into the upsert patch on EVERY event, so call.recording.completed / call.transcript.completed / call.summary.completed overwrite the original status ('completed'/'missed') with 'recording.completed'/'transcript.completed'/'summary.completed' and shift occurred_at to the enrichment event's timestamp.
  - How: Trace the upsert onConflict:'id' merge across an event sequence (call.completed then call.transcript.completed). Confirm by reading lines 77 to 101, then check the drawer render path in src/app/api/team/quo-calls/route.ts which orders by occurred_at and shows status. Optionally replay a synthetic two-event sequence against the handler.
  - Signal of a problem: After a transcript/summary event, quo_calls.status reads 'transcript.completed' instead of 'completed'/'missed', and occurred_at jumped to the enrichment time, so the call sorts to the wrong position and shows a nonsense status in the CRM drawer.
- **[HIGH]** Verify enrichment events (call.transcript.completed, call.summary.completed, call.recording.completed) are not silently dropped when Quo's payload for those events lacks participant numbers. handleCall computes digits via otherParty(context.from, context.to, resource.from, resource.to) and returns early if digits.length !== 10 (webhook/route.ts lines 74 to 75), which would discard the transcript/summary instead of merging it onto the existing call row.
  - How: Inspect Quo's real event payloads for transcript/summary/recording events (docs or a captured raw jsonb in quo_calls.raw). Determine whether from/to are present. If absent, the early return prevents the upsert.
  - Signal of a problem: quo_calls rows never get transcript/summary populated even on a Business/Scale plan, because the enrichment event carried a callId but no from/to and was rejected at the 10-digit guard.
- **[HIGH]** Verify own-number detection and the QUO_ALLOWED_NUMBERS multi-tenant filter behave when context.phoneNumber is missing. ownDigits is derived only from context.phoneNumber (webhook/route.ts line 50). If empty, the allowlist guard at line 52 (`allowlist.length && ownDigits && ...`) is bypassed, so a different business's line is NOT filtered, and otherParty(ownDigits='') can no longer exclude your own number, so a row can be filed under the Stackwrk number itself.
  - How: Read lines 50 to 69. Confirm what field Quo actually populates for the receiving number across call.* and message.* events. Test the handler with a payload that omits context.phoneNumber and QUO_ALLOWED_NUMBERS set.
  - Signal of a problem: With an allowlist configured, an event from a non-allowlisted number still writes to quo_calls/quo_messages, or phone_digits equals the Stackwrk number so unrelated calls collapse onto one bogus contact.
- **[HIGH]** Verify the Instantly export does NOT re-email the same address across successive 'Export new' runs. exportInstantlyCSV (Board.tsx lines 354 to 383) filters newOnly by per-LEAD exportedAt and dedups by email only WITHIN a single batch (the `seen` set, lines 360 to 368). Two distinct leads sharing one email: the first export stamps lead A, a later 'Export new' then exports lead B with the identical address, so Instantly emails that person twice from the company domain.
  - How: Read lines 354 to 383. Construct two leads with the same email, export new (only A goes, A stamped), then export new again (B goes with the same email). Confirm B is not filtered.
  - Signal of a problem: The second stackwrk-instantly-leads.csv contains an email address that was already sent in a prior export, causing duplicate cold outreach to a real prospect.
- **[HIGH]** Verify the exportedAt / emailCheckedAt / quoSyncedSig bookkeeping stamps survive persistence. These flags live inside the single team_crm JSON document and are written via local setItems then a debounced full-document PUT (Board.tsx lines 200 to 206). If the PUT fails or a stale concurrent client overwrites the doc, the stamps are lost and leads get re-exported to Instantly and re-scanned by find-email.
  - How: Trace exportInstantlyCSV setItems (line 381) to the debounce effect PUT to /api/team. Confirm there is no server-side merge, no retry on PUT failure (.catch(()=>{})), and no per-field write. Reproduce by exporting then triggering a stale overwrite from a second tab.
  - Signal of a problem: After an export or an email hunt, reloading or a second editor's save reverts exportedAt/emailCheckedAt to undefined, so the same leads re-appear in the 'Export to email campaign (N)' and 'Find emails (N)' counters and get contacted again.
- **[HIGH]** Verify the whole-document team_crm store does not silently lose concurrent edits. /api/team PUT replaces the entire prospect array with 'last write wins' (src/app/api/team/route.ts lines 23 to 35, DOC_ID='prospects'); updated_at is written but never compared. Board.tsx debounce-saves the full items array every 800ms. Two team members (CRM_USERS supports multiple) editing at once means one save clobbers the other's changes and any newly merged inbound leads.
  - How: Read team/route.ts GET/PUT and Board.tsx lines 152 to 206. Confirm there is no optimistic-concurrency check (If-Match / updated_at compare) and no per-prospect update. Reproduce with two sessions editing different leads and saving.
  - Signal of a problem: User B's edit overwrites User A's just-added leads or stage changes; the losing writer's data vanishes with no error surfaced, and audit/Quo inbound leads merged on B's load disappear on A's next save.
- **[MEDIUM]** Verify the legacy Quo webhook path enforces replay protection. verifyStandard (src/lib/quo.ts lines 118 to 120) checks a 5-minute timestamp window, but verifyLegacy (lines 109 to 115) validates only the HMAC and never checks the timestamp freshness, so a captured legacy 'openphone-signature' request can be replayed indefinitely.
  - How: Read verifyLegacy and verifyQuoWebhook. Confirm QUO_WEBHOOK_SECRET_LEGACY is the live secret in use (which scheme Quo issued). Attempt a replay of a previously valid legacy body/header pair.
  - Signal of a problem: A replayed legacy-signed event is accepted (200 received:true) and re-upserts rows, meaning inbound events are replayable when the legacy secret is the active one.
- **[MEDIUM]** Verify upsertQuoContact's create-vs-update dedup actually prevents duplicate Quo contacts. src/lib/quo.ts lines 169 to 176 look up by GET /contacts?externalIds=<lead id>&sources=stackwrk-crm, then PATCH if found else POST with externalId+source. The code comment (lines 148 to 151) states this write schema is 'reconstructed from Quo's docs, not a verified example'. If the query param names (externalIds/sources) or the defaultFields body shape are wrong, every push creates a new contact.
  - How: Validate against current Quo API docs (Context7 or Quo's OpenAPI) for GET/POST/PATCH /contacts field names and the externalId lookup contract. Do a live round-trip: push a lead twice via /api/quo/contacts and confirm Quo shows one contact, not two.
  - Signal of a problem: A second push for the same lead id creates a duplicate Quo contact (lookup returned nothing because the param name or source filter was wrong), or the PATCH 400s because defaultFields shape is off.
- **[MEDIUM]** Verify best-effort external writes surface or retry on real failure rather than being silently swallowed. Quo webhook upserts use `.then(()=>{}, ()=>{})` (webhook/route.ts lines 101, 119, 143) and always return {received:true}; the Stripe webhook swallows the payments insert error (stripe/route.ts lines 45 to 52). When Supabase is down or a table is missing, the event is acknowledged 200 and lost with no retry and no log.
  - How: Read the swallow sites. Determine whether Quo/Stripe retry on non-200 (they do) and whether a genuine DB error should therefore return 5xx to trigger their retry. Force a write failure (e.g. temporarily wrong column) and observe that the event is dropped silently.
  - Signal of a problem: A Supabase outage during a Quo/Stripe event window leaves zero rows and zero logs; the provider never retries because it got a 200, so calls/texts/payments are permanently missing from the CRM.
- **[MEDIUM]** Verify find-email returns only a real published business email, not a third-party/agency/webmaster address. bestEmail (find-email/route.ts lines 21 to 36) returns the FIRST plausible email after junk filtering, preferring mailto. It can return a web designer's or platform-support address that happens to appear first, which then becomes the prospect's outreach address and feeds Instantly.
  - How: Read bestEmail, JUNK_DOMAIN (line 14), JUNK_LOCAL (line 15). Run /api/leads/find-email against several real contractor sites (Wix, Squarespace, custom) and eyeball whether the returned address is the business or a vendor. Check the homepage-then-one-contact-hop logic (route lines 81 to 90).
  - Signal of a problem: find-email returns an address like info@somewebdesigner.com or a Google/Facebook support address, and that value is written to the lead and later exported to the cold-email campaign.
- **[MEDIUM]** Verify inbound audit-lead and Quo-call-lead merges do not create duplicates or resurrect deleted leads on every board load. The load effect (Board.tsx lines 152 to 197) re-derives audit leads (dedup by normalized domain via dom()) and quo-call leads (dedup by phoneDigits) on EVERY mount, assigning fresh uid()s, then persists them. Editing a lead's website removes it from the 'have' set so the same audit re-appears; a deleted quo-sourced lead reappears because /api/team/quo-calls still returns it.
  - How: Read the merge blocks and src/app/api/team/audits/route.ts (domainOf, SELF regex) and src/app/api/team/quo-calls/route.ts aggregation. Reproduce: save a lead, edit its website domain, reload, check for a duplicate; delete a quo-sourced lead, reload, check it does not come back.
  - Signal of a problem: The same audited domain or Quo number appears as two prospect cards, or a lead the operator deleted reappears on next load because there is no tombstone for auto-collected sources.
- **[MEDIUM]** Verify quo_calls/quo_messages phone_digits normalization is consistent between the webhook writer and every reader so a lead's activity actually joins. Writer normalizes to 10 digits via otherParty/phoneDigits (webhook/route.ts); the drawer reader queries eq('phone_digits', phone) where phone = raw.replace(/D/g,'').slice(-10) (team/quo-calls/route.ts line 39).
  - How: Compare phoneDigits (prospects.ts lines 83 to 87, strips a leading 1) against team/quo-calls slice(-10). Insert a call for +1XXXXXXXXXX and query the drawer with several input formats ((954)..., 1954..., +1 954...).
  - Signal of a problem: A lead's call/text history is empty in the drawer even though quo_calls has rows, because the stored phone_digits and the queried 10-digit slice disagree for some input format.
- **[LOW]** Verify Quo auto-sync dedup by signature is stable and complete. Board.tsx quoSyncSig (lines 72 to 74) hashes phoneDigits|owner|name|email; maybeAutoSyncQuo (lines 227 to 229) only pushes when the sig changed and the lead is 'engaged'. Confirm the sig captures every field upsertQuoContact actually sends so a real change is never missed and an unchanged lead never re-pushes.
  - How: Compare quoSyncSig fields against upsertQuoContact's defaultFields (quo.ts lines 159 to 166). Simulate editing only the company/name, then only whitespace, and confirm push fires exactly when a Quo-visible field changed.
  - Signal of a problem: Editing a Quo-relevant field (e.g. company distinct from name) does not change the sig so Quo is never updated, or a no-op edit re-pushes on every drawer close.
- **[LOW]** Verify Stripe payment logging is idempotent on duplicate delivery. payments.id is the Stripe event id as primary key (supabase/payments.sql) and stripe/route.ts uses insert (not upsert). A re-delivered event hits the PK conflict, which is swallowed, so no duplicate row is created; confirm this is actually the behavior and that a legit first insert error is distinguishable from a dup.
  - How: Read stripe/route.ts lines 42 to 53 and payments.sql. Send the same event.id twice (Stripe CLI resend) and confirm exactly one payments row. Check that only checkout.session.completed, invoice.paid, invoice.payment_failed are recorded.
  - Signal of a problem: Duplicate delivery creates two payment rows (upsert/insert mismatch), or a real insert failure is indistinguishable from a benign duplicate because both are swallowed identically.
- **[LOW]** Verify find-email junk filters do not drop legitimate business emails or admit obvious junk. JUNK_LOCAL (/^(noreply|no-reply|donotreply|postmaster|webmaster|abuse|test|admin@localhost)/i) drops any local part STARTING with 'test' (e.g. testimonials@, testing@realco.com) and 'webmaster@' which is sometimes the only published address. JUNK_DOMAIN targets platform noise (wixpress, sentry, godaddy, example) and is not exhaustive.
  - How: Read lines 14 to 34. Feed sample HTML containing testimonials@realco.com, webmaster@realco.com, and a wixpress noise address; confirm which pass and which are dropped. Check for uncovered platforms (squarespace, cloudflare, jsdelivr).
  - Signal of a problem: A real business email is discarded because its local part begins with 'test' or is 'webmaster', leaving the lead marked emailCheckedAt with no email, or a platform noise address slips through the JUNK_DOMAIN list.
- **[LOW]** Verify phone dedup and flagging in prospects.ts classify correctly before a dial. phoneCheck (lines 90 to 101) normalizes via phoneDigits (strips leading country-code 1), rejects non-10-digit and N11/leading-0/1 area+exchange, flags TOLLFREE_CODES, and flags anything outside SOFLA_AREA_CODES as out-of-area. Confirm the SoFla allowlist is right: it includes '472' and '645', which are not standard South Florida area codes and may misclassify.
  - How: Read SOFLA_AREA_CODES and TOLLFREE_CODES (lines 77 to 78) and phoneCheck. Cross-check the SoFla set against the actual NANPA-assigned South Florida area codes (305, 786, 954, 754, 561, plus overlay 645 for 305 and 656 for 561). Unit-test phoneCheck across tollfree, out-of-area, 11-digit, and formatted inputs.
  - Signal of a problem: A valid local number is flagged out-of-area (or vice versa) because the SOFLA set is wrong, sending good leads to the Skip tier via skipBadNumbers, or a genuinely out-of-area number is treated as local.
- **[LOW]** Verify CSV import dedup in doImport handles no-phone and near-duplicate-name rows. doImport (Board.tsx lines 287 to 308) dedups on (name+phone) plus 10-digit dial against existing and within-batch, drops toll-free silently, and marks out-of-area as tier 'verify'. A row with a blank phone dedups only on name, so two different businesses named 'ABC Fence' with no phone collapse, while re-importing near-duplicate names duplicates rows.
  - How: Read parseCSV (lines 16 to 28), rowsToProspects (lines 30 to 52), doImport. Import a CSV twice with no-phone rows and near-duplicate names; confirm counts in the 'Imported N, skipped D dupes, T toll-free' flash.
  - Signal of a problem: Re-importing the same list adds duplicates (dedup key too weak for no-phone rows), or two distinct no-phone businesses are wrongly merged, or toll-free drops are invisible so the operator cannot tell why a lead is missing.
- **[LOW]** Verify the Prospect JSON written to team_crm is shape-validated and size-bounded. /api/team PUT accepts any Array (route.ts line 31, only Array.isArray) and stores it whole in jsonb with no per-field validation, no max length, and no server-side sanitization of stage/source/tier enums.
  - How: Read team/route.ts PUT. POST an array with a bad stage, a huge notes field, and a missing id; confirm it is stored and observe how Board.tsx handles it on next load.
  - Signal of a problem: team_crm accepts prospects with an invalid stage/source or an oversized document, and the board mis-renders or a downstream filter (stage columns, tier counts) silently drops them.
- **[LOW]** Verify lead source attribution is accurate across the three writers. /api/leads POST hardcodes source:'audit_form' (leads/route.ts line 119) regardless of the actual origin, /api/book writes source:'booking', and audit runs write to the separate audits table. If the audit-form endpoint also backs the instant-audit or entry-popup capture, every such lead is mislabeled.
  - How: Grep client callers of /api/leads POST (entry popup, contact form, instant audit) and compare the intended source to the hardcoded value. Read leads/route.ts lines 82 to 128.
  - Signal of a problem: Leads captured from distinct funnels all show source='audit_form' in the leads table, making funnel attribution and follow-up routing wrong.

**Tooling**

- Supabase MCP: get_advisors (security lint), list_tables, list_migrations, execute_sql against pg_class/pg_policies/information_schema to attest live RLS state
- Read/Grep/Glob for static tracing of the writer/reader phone normalization, dedup keys, and swallow sites
- Node/tsx unit harness in the scratchpad to exercise pure functions: phoneCheck, phoneDigits, quoSyncSig, parseCSV, rowsToProspects, bestEmail, verifyLegacy/verifyStandard, otherParty
- curl or a small fetch script to POST synthetic Quo events (call.completed then call.transcript.completed, event missing context.phoneNumber) at the webhook handler and inspect resulting rows
- Stripe CLI (stripe trigger / resend) to test payments idempotency, if Stripe test creds are available
- Context7 or Quo's OpenAPI/docs to verify the /contacts externalIds+sources lookup and defaultFields write shape used by upsertQuoContact
- A second authenticated browser/tab session to reproduce the team_crm last-write-wins lost update and stamp loss

**Deliverable.** A written findings report (Markdown, no dashes) with one row per check: pass/fail, the exact file and line, a concrete reproduction (the input event/CSV/API call used), the observed vs expected result, and a severity. It must include: (1) a live RLS + policy attestation table for all seven Supabase tables produced from get_advisors and pg_class/pg_policies output (not just from the SQL files), (2) a confirmation that the service-role key is absent from the client bundle, (3) a prioritized defect list for the confirmed data-corruption bugs (Quo status/occurred_at clobber, enrichment-event drop, own-number/allowlist bypass, Instantly cross-batch double-email, team_crm lost-update wiping export/scan stamps), each with a minimal repro and a suggested fix direction (no code changes applied), and (4) an integration idempotency matrix (Quo webhook, Quo contact upsert, Stripe webhook, Instantly export, find-email) marking each retry-safe or not. Include a short 'ship-blockers' section listing anything at critical/high severity.

---

### 5. Content, Copy, Brand Voice & Legal/Compliance  (P0)

**Objective.** Verify that every piece of copy in Stackwrk (the marketing site, the CRM, transactional emails, the signed agreement, the GTM playbooks, and public/llms.txt) obeys Tal's strict no-em-dash and no-en-dash rule, that all public claims (testimonials, guarantees, timelines, revenue calculators, statistics) are truthful and internally consistent across the marketing site, the contract in src/lib/agreement.ts, and public/llms.txt, that the cold-outreach playbooks and email templates meet CAN-SPAM obligations, that the privacy and terms pages fully and accurately disclose the PII this business collects and every third party that processes it, and that the Fox Solutions LLC vs Stackwrk identity is presented consistently. This matters because Stackwrk ships to production on every push to main, so a placeholder testimonial, an unverified money-back promise, an undisclosed subprocessor, or a cold email missing a physical address is live legal and brand exposure the moment it merges, and the dash rule is an explicit standing instruction from the owner.

**Scope**

- src/lib/content.ts (hero, projects, whatYouGet, investment, finalCta, testimonials, guarantee, footer, socials, calendlyUrl)
- public/llms.txt
- src/app/privacy/page.tsx and src/app/terms/page.tsx
- src/components/LegalDoc.tsx
- src/components/Testimonials.tsx and src/components/Guarantee.tsx
- src/app/pricing/page.tsx and src/app/services/page.tsx
- src/lib/agreement.ts, src/app/agreement/page.tsx, src/lib/agreement-email.ts
- src/lib/email.ts (transactional sender + from header)
- playbook/01-email-sequences.md, playbook/05-instantly-campaign.md, playbook/02-call-scripts.md, playbook/07-grow-email-list.md
- src/components/RoiCalculator.tsx, src/components/SaasVsCustomCalculator.tsx, src/lib/tools.ts (calculator and audit claims)
- src/lib/guides.ts (the real /guides blog content) and src/lib/fence-guides.ts, src/lib/fence-theme.ts, src/lib/pricing.ts, src/components/Faq.tsx, src/components/MetricsBand.tsx
- src/components/FenceEstimator.tsx and src/components/tools/MaterialsCalculator.tsx (en-dash used as a UI minus glyph)
- src/app/layout.tsx metadata and src/components/JsonLd.tsx
- Internal docs that are still 'output' under the rule: STRATEGY.md, MARKETING.md, DELIVERY.md, PRICING-BENCHMARKS.md, TODO.md, and all playbook/*.md

**Quick wins (check these first)**

- En dashes are live in 27 files (13 user-facing plus 14 internal docs), the single highest-volume house-rule breach; the two decrement-button glyphs in FenceEstimator.tsx line 103 and MaterialsCalculator.tsx line 50 need a plain hyphen, the rest are ranges that become the word to
- The third homepage testimonial is a pure placeholder (name Client, role Local service business, TODO(Tal)) rendered live with a 5-star rating via Testimonials.tsx
- The guarantee carries an unresolved NOTE(Tal) and the headline Love it, or your money back is contradicted by a deposit-only body, while the contract's 30-day full money-back is never shown to buyers
- Footer social links point at bare https://www.linkedin.com/ and https://github.com/ (content.ts lines 15 to 16), and the public Calendly URL still says seatophomes
- public/llms.txt calls the business a solo studio while the homepage sells A Team Behind You and uses we throughout
- Quo and Instantly process phone, SMS, and email PII but are absent from the privacy policy's subprocessor list
- playbook/01 email templates have no physical postal address and no opt-out line in the actual copy (only in the checklist), and both playbooks use deceptive re: subject lines on cold first touches
- Em dashes are already clean everywhere except CLAUDE.md line 8 (the rule text itself), so that check should pass and mainly needs a CI guard to stay clean

**Checks**

- **[HIGH]** Em dash (U+2014) sweep across the whole repo excluding package-lock.json. As of this scan the only hit is CLAUDE.md line 8, which is the rule quoting the character itself, so any other hit is a live violation.
  - How: git grep -n $' - ' -- ':!package-lock.json' ; treat CLAUDE.md as the single expected match and fail on anything else
  - Signal of a problem: Any em dash in src, public, playbook, or the .md docs. Even one is a house-rule breach.
- **[HIGH]** En dash (U+2013) sweep across the whole repo. The rule bans en dashes too. Current scan finds them in 13 user-facing files (public/llms.txt, src/lib/content.ts line 167, src/lib/pricing.ts line 32, src/lib/fence-theme.ts, src/lib/fence-guides.ts, src/components/Faq.tsx line 24, src/components/MetricsBand.tsx line 10, src/components/RoiCalculator.tsx line 51, src/components/FenceSite.tsx, src/components/DemoShowcase.tsx, src/components/tools/MaterialsCalculator.tsx, src/app/prospects/LeadAudit.tsx line 56) plus 14 internal docs (STRATEGY.md and PRICING-BENCHMARKS.md have 20 each, plus playbook files, MARKETING.md, DELIVERY.md, TODO.md). Most are numeric or day ranges (0 to 100, $99 to $499, Mon to Sat, 2 to 4 weeks) that should become the word to, a hyphen, or a comma.
  - How: git grep -n $' - ' -- ':!package-lock.json' | tee an enumerated file:line list; classify each as range (use 'to'), UI glyph, or prose
  - Signal of a problem: Any en dash anywhere. Flag the two decrement-button glyphs specially: src/components/FenceEstimator.tsx line 103 and src/components/tools/MaterialsCalculator.tsx line 50 render a lone en dash as the minus control, so those need a plain hyphen or minus, not the range treatment.
- **[HIGH]** Placeholder and draft testimonial displayed live. src/lib/content.ts lines 226 to 246 mark all three testimonials DRAFT WORDING and the third is an outright placeholder (name Client, role Local service business) carrying a TODO(Tal) to add a real quote. Testimonials.tsx renders all three with a 5-star rating on the homepage (src/app/page.tsx).
  - How: Read src/lib/content.ts testimonials array and cross-check what Testimonials.tsx renders; grep for TODO and DRAFT inside content.ts
  - Signal of a problem: Any testimonial without a real, named, consented client shown publicly, or the DRAFT WORDING and TODO markers still present, or real client first names (Brian, Saar) used with the star rating before written consent is on file. This is FTC endorsement-guide and consumer-protection exposure.
- **[HIGH]** Guarantee truthfulness and cross-surface consistency. src/lib/content.ts line 248 carries NOTE(Tal): confirm these guarantee terms. The marketing headline (content.ts line 251) is Love it, or your money back but the body (line 252) only promises a deposit refund. The actual contract (src/lib/agreement.ts lines 96 to 100) defines three separate guarantees: love-the-design deposit refund, on-time launch (first month of care free), and a 30-day full money-back on the project fee. The pricing page (src/app/pricing/page.tsx lines 85 and 141) and agreement page (src/app/agreement/page.tsx line 47) each state it differently.
  - How: Diff the guarantee wording across content.ts, Guarantee.tsx, pricing/page.tsx, agreement/page.tsx, and agreement.ts; confirm the marketing promise is neither stronger nor weaker than the contract
  - Signal of a problem: Marketing says money back while the body only covers the deposit, or the 30-day full-fee money-back from the contract is never surfaced to buyers, or the NOTE(Tal) confirmation is still unresolved. A promised refund the contract does not back, or a real refund the site hides, are both defects.
- **[HIGH]** CAN-SPAM completeness of the cold-email templates. playbook/01-email-sequences.md Sequence A and B templates end their signatures with only ,Tal and contain no physical postal address and no opt-out sentence in the copy itself; the address and opt-out only appear in the checklist at lines 94 and 97. playbook/05-instantly-campaign.md is better: it carries a [YOUR MAILING ADDRESS] placeholder and a Not interested? Just reply and I'll stop line in every step, but the placeholder is unfilled.
  - How: Read every ready-to-paste email block in playbook/01 and playbook/05 and check each for a valid physical postal address and a clear opt-out; confirm the privacy policy cold-outreach section (src/app/privacy/page.tsx lines 34 to 36) matches the opt-out actually offered
  - Signal of a problem: Any commercial template a user could send that lacks a real physical mailing address or a functioning opt-out (playbook/01 fails both in the body copy). The [YOUR MAILING ADDRESS] token must be replaced with a real address before any send, per 15 U.S.C. 7704.
- **[HIGH]** Privacy policy subprocessor accuracy. src/app/privacy/page.tsx lists Vercel, Supabase, Stripe, and Resend, but the codebase also processes contact PII through Quo (calls, SMS, contacts: src/lib/quo.ts, src/app/api/quo/*) and exports lead PII to Instantly for cold email (the CSV export flow and playbook/05). Neither Quo nor Instantly is disclosed.
  - How: List every third party the code sends personal data to (grep src/lib and src/app/api for quo, instantly, resend, stripe, supabase, vercel) and diff against the Who we share it with list in privacy/page.tsx
  - Signal of a problem: A processor that touches names, phone numbers, SMS, or emails (Quo, Instantly) is missing from the disclosed list, understating who handles user PII.
- **[MEDIUM]** Other dash lookalikes as a regression guard: horizontal bar U+2015, minus sign U+2212, figure dash U+2012, two-em and three-em dashes, and fullwidth hyphen-minus U+FF0D. Current scan finds none, so this is a zero-baseline gate.
  - How: git grep -nP '[\x{2015}\x{2212}\x{2012}\x{2E3A}\x{2E3B}\x{FF0D}]' -- ':!package-lock.json'
  - Signal of a problem: Any match at all, since a sneaky lookalike would pass an em/en-only grep.
- **[MEDIUM]** Solo versus team representation. public/llms.txt line 5 calls Stackwrk a solo web-development studio, while the marketing site sells A Team Behind You (content.ts line 51) and uses we and us throughout, and the signed agreement flips to first person I build (src/app/agreement/page.tsx line 47) with Developer singular in agreement.ts. The project is run by one person.
  - How: grep for 'solo', 'team', ' we ', ' us ', ' I ' across content.ts, llms.txt, services/page.tsx, agreement.ts, agreement/page.tsx and reconcile
  - Signal of a problem: Contradictory company-size claims inside one funnel: llms.txt says solo, the homepage says team, the contract says I. Decide the honest framing and make every surface agree.
- **[MEDIUM]** Deceptive subject lines in cold email. playbook/01 uses re: {{business}} + a website and re: quick note on {{business}}'s website, and playbook/05 uses re: quick idea for {{company_name}}, all on messages that are the first or a follow-up in a thread the recipient never started. CAN-SPAM forbids materially deceptive subject headers.
  - How: grep -n 're:' and 'fwd:' across playbook/01, playbook/05, and playbook/02; flag any on a genuinely cold first touch
  - Signal of a problem: A re: or fwd: prefix implying a prior conversation that did not happen. The step-2 follow-ups may be defensible; the cold openers are the risk.
- **[MEDIUM]** Privacy and terms completeness for a PII collector that also captures e-signatures. privacy/page.tsx collects name, email, phone, signature, IP, and billing (via Stripe) and stores signatures in Supabase, yet lists no physical business mailing address and no concrete statutory request channel beyond email. terms/page.tsx runs an e-signature flow (src/app/agreement, src/app/api/sign) but contains no ESIGN or UETA electronic-consent clause.
  - How: Read privacy/page.tsx and terms/page.tsx in full against a PII and e-sign checklist (contact address, data-subject request mechanism, retention specifics, electronic-signature consent, effective date automation at UPDATED constant on line 9 of each)
  - Signal of a problem: No physical address, no clear rights-request path, or no electronic-signature consent language despite a live signing product. The July 14, 2026 UPDATED date is hardcoded, so confirm it is maintained.
- **[MEDIUM]** Placeholder social and booking links leaking legacy brand. src/lib/content.ts socials (lines 13 to 17) point LinkedIn at https://www.linkedin.com/ and GitHub at https://github.com/, bare homepages rendered as real profile links by Footer.tsx. The calendlyUrl (line 12) is calendly.com/tal-foxamit-seatophomes/30min, exposing the old seatophomes brand in a customer-facing URL.
  - How: Read content.ts socials and calendlyUrl; confirm Footer.tsx renders them; check for seatophomes leakage with git grep -n seatophomes -- src public
  - Signal of a problem: Footer links resolve to generic linkedin.com or github.com rather than real Stackwrk profiles, and the public booking link carries the retired seatophomes brand.
- **[MEDIUM]** Delivery-timeline claim consistency. The site promises live in about two weeks (content.ts line 45), Live In ~2 Weeks (line 49), 2 to 4 weeks (line 167), Live in about 2 weeks (pricing/page.tsx line 32), and Live in weeks, not months (HowItWorks), while the contract commits to 14 business days (agreement.ts lines 82 and 99) and playbook/01 line 81 tells prospects ~10 business days.
  - How: grep the timeline phrases across content.ts, pricing/page.tsx, services/page.tsx, agreement.ts, and playbook/01 and line them up
  - Signal of a problem: Conflicting launch promises across marketing and the binding contract (about two weeks versus 2 to 4 weeks versus 14 business days versus ~10 business days). Pick one honest, contract-backed number.
- **[MEDIUM]** Unsourced statistical and revenue claims in the calculators and audit tool. src/components/RoiCalculator.tsx line 51 asserts Most small-business sites convert 1 to 2% and drives a monthly revenue figure off a dated-site baseline; SaasVsCustomCalculator.tsx line 79 states Often 10 to 15%; src/lib/tools.ts (lines 63 and 67) markets the audit as Lighthouse-grade and the same categories a Lighthouse audit weighs. terms line 22 disclaims tools generally, but the calculators carry no on-page disclaimer.
  - How: Read RoiCalculator.tsx, SaasVsCustomCalculator.tsx, and tools.ts; check each numeric or comparative claim for a source or an on-page not-a-guarantee disclaimer and verify the Lighthouse-grade claim against what src/app/api/audit actually computes
  - Signal of a problem: A revenue or conversion figure presented as fact without a source or visible disclaimer (FTC deceptive-claims and earnings-claim exposure), or a Lighthouse-grade claim the audit route does not actually substantiate.
- **[LOW]** DBA and legal-entity presentation consistency. The identity appears in at least four formats: d/b/a Stackwrk (src/app/agreement/page.tsx line 41, src/lib/agreement-email.ts line 55), doing business as Stackwrk (terms line 14), trade name of Fox Solutions LLC (privacy line 14), and Fox Solutions LLC (Stackwrk) (agreement/page.tsx line 55), with the footer showing only Fox Solutions LLC (content.ts line 261).
  - How: git grep -n 'Fox Solutions' across src, public, and supabase and normalize on one canonical phrasing
  - Signal of a problem: Inconsistent legal-entity wording across contract, legal pages, and footer. Pick one canonical form and apply it everywhere.
- **[LOW]** Factual accuracy of the /guides blog and fence pricing content. src/lib/guides.ts is the real /guides content, and src/lib/fence-guides.ts and src/lib/fence-theme.ts publish concrete South Florida fence prices, permit costs, lifespans, and per-foot ranges (for example chain-link $15 to $26/ft, permits $50 to $300) presented as current fact.
  - How: Spot-check the numeric and regulatory claims in guides.ts, fence-guides.ts, and fence-theme.ts for currency and regional accuracy; confirm demo-only fence content stays under /demos/apex-fence and is labeled demo while /guides is owned Stackwrk content
  - Signal of a problem: Outdated or region-wrong pricing, permit, or lifespan figures stated as fact on the owned /guides pages, or fence-vertical claims bleeding into the general Stackwrk brand without the demo label.
- **[LOW]** Brand-name casing and typography consistency. content.ts sets brand STACKWRK in all caps while prose and metadata use Stackwrk; apostrophes and quotes are curly in privacy and terms but straight in much of content.ts and the components, so body copy mixes both.
  - How: git grep -oh -E 'STACKWRK|Stackwrk|stackwrk' to confirm all-caps is stylistic only; grep for straight versus curly apostrophes across src/app and src/components
  - Signal of a problem: All-caps STACKWRK appearing in running prose rather than logo or hero treatment, or a single page mixing straight and curly quotes.

**Tooling**

- git grep unicode dash sweeps
- ripgrep claim cross-reference
- manual legal-page and playbook read against CAN-SPAM checklist
- en-dash enumeration script
- FTC CAN-SPAM and Endorsement Guides as reference

**Deliverable.** A single findings register (CSV or Markdown table) with one row per violation, each row carrying: file path and line, category (dash-rule, testimonial, guarantee, claim, CAN-SPAM, privacy-disclosure, DBA, timeline, placeholder, typography), severity, the exact offending text, and recommended replacement wording that itself contains no em or en dashes. Alongside it: (1) a zero-tolerance pass or fail gate for em dashes and en dashes, expressed as the two git grep commands so it can be wired into CI as a pre-merge check; (2) a redlined Who we share it with block for src/app/privacy/page.tsx that adds Quo and Instantly and any other real subprocessor; (3) a corrected CAN-SPAM signature block (physical postal address plus opt-out) to drop into the playbook/01 email templates and to replace the [YOUR MAILING ADDRESS] token in playbook/05; and (4) a one-page consistency matrix reconciling the guarantee, the delivery timeline, and the solo-versus-team framing across content.ts, agreement.ts, pricing/page.tsx, and public/llms.txt, with the single canonical wording chosen for each.

---

### 6. Analytics & Measurement  (P0)

**Objective.** Determine whether Tal can actually measure what is working across the Stackwrk funnel, and specify the minimum instrumentation to fix the blind spots. The engine spends on two paid/outbound channels (Instantly cold email and Facebook) plus organic, yet the codebase currently has zero web analytics: no page-view tag, no client-side conversion events, and no channel attribution. The only signals are three server-side Supabase tables (audits, leads, payments) with a hardcoded per-form source string. This audit verifies exactly what is and is not measured at every funnel step (page view, audit run, report/lead capture, in-page booking, external Calendly booking, care-plan subscribe, deposit pay), confirms Search Console / sitemap submission readiness, and defines the smallest set of instrumentation (one page-view tag, a UTM/referrer capture util, source columns on leads, named conversion events, Calendly and Stripe attribution) that would let Tal compute conversion rates by channel and landing page. Measurement blindness on a live GTM engine is the core risk: money is going into Instantly and Facebook with no way to tell which produces leads, bookings, or revenue.

**Scope**

- src/app/layout.tsx (root layout, where a page-view tag / next/script tag would mount, currently absent)
- package.json + node_modules (confirm no analytics dependency: no @vercel/analytics, gtag, plausible, posthog, meta pixel)
- src/app/api/leads/route.ts (LeadBody type + hardcoded source: 'audit_form')
- src/app/api/audit-report/route.ts (source defaults to 'instant_audit', accepts optional source/note the frontend rarely sets)
- src/app/api/book/route.ts (source: 'booking')
- src/app/api/audit/route.ts (line 339-341 inserts audit runs into audits table with no source/session)
- src/app/api/checkout/route.ts (Stripe Checkout, no client_reference_id / metadata / UTM)
- src/app/api/webhooks/stripe/route.ts (payments table insert: email + amount only)
- src/components/AuditForm.tsx, src/components/AuditTool.tsx (ReportCapture), src/components/AuditPopup.tsx, src/components/DemoShowcase.tsx (booking submit), src/components/Plans.tsx (external Stripe Payment Link CTA) (conversion submit handlers, none fire an analytics event)
- src/lib/content.ts (site.calendlyUrl, the primary external booking CTA linked from Nav, Footer, Hero, FinalCTA, tools, guides)
- src/app/sitemap.ts and src/app/robots.ts (sitemap coverage + robots disallow list)
- public/ (check for GSC/Bing verification file; only llms.txt present)
- supabase/*.sql (leads / audits / payments table columns; whether any source/utm column exists)
- .env.example (no NEXT_PUBLIC analytics id / measurement env var)

**Quick wins (check these first)**

- No analytics tag exists at all: layout.tsx has no <Script>, package.json has no analytics dependency (confirmed). Adding one page-view tag is the single highest-leverage fix.
- leads capture has no UTM/source columns and /api/leads hardcodes source: 'audit_form'; every channel collapses into one label. Widen the body type and add a source/utm capture.
- The primary CTA everywhere is the external site.calendlyUrl with no UTM and no click tracking, so the most-clicked conversion is invisible.
- No GSC verification token in layout.tsx metadata and no verification file in /public (only llms.txt), so sitemap submission and organic measurement cannot be confirmed.
- Stripe Payment Links in Plans.tsx and /api/checkout carry no client_reference_id/metadata; payments in the payments table join to leads only by email and never to a channel.
- /demos/apex-fence is crawlable (not in robots.ts disallow) and absent from sitemap.ts, risking demo content polluting Search Console reports for the real site.
- sitemap.ts stamps lastModified = new Date() on every static URL, a weak/self-defeating freshness signal.

**Checks**

- **[CRITICAL]** Confirm there is no web analytics tag of any kind loaded on the public site (no GA4/GTM/dataLayer, no @vercel/analytics or Speed Insights, no Plausible/PostHog).
  - How: Grep src for gtag|googletagmanager|dataLayer|GTM-|G-[A-Z0-9]|@vercel/analytics|SpeedInsights|plausible|posthog|next/script; read src/app/layout.tsx end to end (it mounts only ScrollProgress, CustomCursor, Nav, ScrollToTop); grep package.json dependencies and ls node_modules for any analytics package; load prod stackwrk.com with devtools Network tab and confirm no analytics request fires.
  - Signal of a problem: Zero matches and no <Script> in layout.tsx means no page views are counted anywhere, so total traffic, top pages, and traffic sources are completely unknown. This is the anchor finding.
- **[CRITICAL]** Verify no client-side conversion events fire on any funnel action (audit run, full-report/lead capture, in-page booking, care-plan subscribe, deposit pay).
  - How: Read the submit success branches of AuditTool.run and ReportCapture.submit, AuditForm.onSubmit, AuditPopup.submit, DemoShowcase.submit, and the Subscribe/Checkout anchors in Plans.tsx and /api/checkout; look for any track()/gtag()/window.dataLayer.push on the ok path.
  - Signal of a problem: No event helper is called on any success path, so even if a page-view tag existed, conversion counts and funnel step-through rates would still be unmeasured client-side.
- **[CRITICAL]** Verify UTM parameters, referrer, landing path, and click ids (fbclid, gclid) are never captured or persisted on lead capture, so Instantly vs Facebook vs organic cannot be told apart.
  - How: Inspect the LeadBody type in src/app/api/leads/route.ts (only name/email/website/message/company) and the request bodies built in AuditForm, AuditTool ReportCapture, and AuditPopup; confirm source is a hardcoded literal per form (audit_form / instant_audit / popup_audit) and that no utm_* / referrer / landing / fbclid / gclid is read from window.location or posted; check supabase/*.sql for any utm/source/referrer column on the leads table.
  - Signal of a problem: An Instantly cold-email lead and a Facebook-ad lead land in the leads table with the same generic source string, making channel ROI impossible. The audit-report route even accepts source/note but the UI hardcodes them.
- **[HIGH]** Assess the Instantly cold-email channel: whether the links used in campaigns carry UTMs and whether the site would even read them.
  - How: Check MARKETING.md and playbook/*.md for the destination URLs used in T1 to T3 cold emails; confirm whether they include ?utm_source=instantly&utm_campaign=... and, more importantly, confirm from the code that the site has no reader for those params (see the UTM-capture check), so any tags added to Instantly links are dropped on arrival.
  - Signal of a problem: Instantly campaign clicks that reach the site cannot be tied to any on-site audit run, lead, or booking. Reply and open rates live only inside Instantly with no downstream conversion join.
- **[HIGH]** Assess the Facebook channel: no Meta Pixel and no fbclid handling.
  - How: Grep src for fbq|facebook|pixel|_fbp|fbclid (only false-positive matches from Google/Facebook page copy exist); confirm layout.tsx loads no pixel and no route reads fbclid.
  - Signal of a problem: Without a Meta Pixel, Facebook cannot optimize toward or report on Stackwrk conversions, no custom or lookalike audiences can be built, and FB-driven leads are invisible in both Meta and the CRM.
- **[HIGH]** Confirm external Calendly bookings, the primary CTA site-wide, are entirely unmeasured.
  - How: Grep for site.calendlyUrl (Nav, Footer, Hero, FinalCTA, contact, tools/page, guides pages, RoiCalculator, SaasVsCustomCalculator, ToolLayout, MockupModal, AuditTool) and confirm each is a plain <a target=_blank> with no click event and no UTM appended; check whether any Calendly analytics, redirect tracking, or Calendly webhook exists. Contrast with the in-page DemoShowcase flow that posts to /api/book (source 'booking').
  - Signal of a problem: The most-linked conversion action on the whole site (book a call via Calendly) produces no click count, no completion count, and no channel tag, so the single most important funnel step is a black box.
- **[HIGH]** Verify Stripe revenue cannot be attributed to a channel or reliably joined to a lead.
  - How: Read src/app/api/checkout/route.ts (no client_reference_id, no metadata, no UTM on session create), Plans.tsx (carePlans[].stripeUrl are external Payment Links opened via <a target=_blank> with no tracking), and src/app/api/webhooks/stripe/route.ts (payments row stores only type/email/amount_cents/status).
  - Signal of a problem: A payment can only be joined back to a lead by email string match and never to a marketing channel, so revenue by source (the number that matters most) cannot be produced.
- **[HIGH]** Test whether funnel drop-off can be reconstructed from the three server tables and confirm the gaps.
  - How: In the Supabase SQL editor, inspect columns and run counts on audits (from /api/audit line 341), leads (grouped by source), and payments; attempt an audit-run to lead to booking to payment conversion by channel and by landing page.
  - Signal of a problem: Raw per-table counts are possible, but there is no session/visitor id, no landing-page column, and no channel column, so no true funnel rate (audit to lead to book to pay) can be segmented by Instantly / Facebook / organic. Top-of-funnel traffic is missing entirely because page views are not measured.
- **[HIGH]** Confirm Google Search Console verification and sitemap submission readiness.
  - How: Read src/app/layout.tsx metadata for a verification.google (or other) token; ls public/ for a googleXXXX.html or BingSiteAuth.xml file (only llms.txt is present); then in Search Console confirm the stackwrk.com property is verified and that /sitemap.xml shows as submitted with pages discovered. Curl https://stackwrk.com/robots.txt and /sitemap.xml to confirm they serve.
  - Signal of a problem: No verification token in code and no verification file means we cannot confirm the property is even verified or the sitemap submitted, so organic impressions, clicks, queries, and indexation coverage are unmeasured and un-actionable.
- **[MEDIUM]** Validate sitemap coverage and freshness signals in src/app/sitemap.ts.
  - How: Read sitemap.ts and diff its URL set against the real public routes (home, /work, /services, /pricing, /guides + guide slugs, /contact, /tools + tool slugs). Note that lastModified is new Date() for every static URL (always 'now', a weak signal) and that /demos/apex-fence and its subpages (areas/[city], guides/[slug]) are absent.
  - Signal of a problem: Every static URL reporting lastmod = today on each crawl trains Google to distrust the timestamp, and demo pages are neither listed nor excluded, muddying what should be indexed.
- **[MEDIUM]** Check robots.ts against demo-site indexing to prevent thin/duplicate content diluting measurement of the real site.
  - How: Read src/app/robots.ts: it disallows /crm, /quote, /prospects, /mockup, /agreement but NOT /demos. Confirm /demos/apex-fence (a labeled sample fence site with its own guides and per-city pages) is crawlable and not in the sitemap.
  - Signal of a problem: The Apex demo can get indexed and compete with or dilute stackwrk.com in Search Console reports, making organic measurement of the actual product harder to read.
- **[MEDIUM]** Confirm the audits table cannot serve as a channel-segmented top-of-funnel metric.
  - How: Read src/app/api/audit/route.ts lines 339 to 341: insert into audits is url/score/load_ms/page_kb only, with no source, session id, referrer, or UTM.
  - Signal of a problem: Audit-run volume (a genuine top-of-funnel signal) exists but cannot be split by channel or landing page, so even the one thing that is counted server-side cannot answer 'which channel drives audits'.
- **[LOW]** Confirm there is no env/config slot for a measurement id and that any added analytics stays consent-aligned.
  - How: Read .env.example (no NEXT_PUBLIC_GA_ID / measurement env var) and confirm nowhere to configure a tag; read /privacy page copy and note AuditPopup already collects marketing consent, so a GA4/Meta Pixel addition needs a matching privacy disclosure.
  - Signal of a problem: Instrumentation cannot be turned on without adding a NEXT_PUBLIC env var and a Vercel env entry, and adding pixels without updating /privacy creates a compliance gap.
- **[LOW]** Validate JSON-LD structured data is present and correct on key routes (feeds rich results and AI answer engines, a measurable organic surface).
  - How: Confirm JsonLd usage on src/app/page.tsx (Organization), /guides, /guides/[slug] (Article + FAQ + Breadcrumb), /tools, ToolLayout, and Faq; run the emitted markup through Google Rich Results Test / Schema validator.
  - Signal of a problem: Malformed or missing schema on money pages reduces eligibility for rich results and weakens the trackable organic footprint in Search Console's enhancement reports.

**Tooling**

- Grep / Glob / Read for static verification of missing tags, hardcoded source strings, and request bodies
- curl against prod for https://stackwrk.com/robots.txt, /sitemap.xml, /llms.txt
- Browser devtools Network tab on prod to confirm zero analytics/pixel requests fire
- Google Search Console (property verification status, sitemap submission state, Coverage/Indexing and Enhancement reports)
- Vercel dashboard (Web Analytics and Speed Insights toggles, project env vars)
- Supabase SQL editor to inspect audits/leads/payments columns and run funnel count queries
- Google Rich Results Test and Schema.org validator for the JsonLd output
- Meta Pixel Helper and GA4 DebugView for validating any tag added during execution (post-audit)

**Deliverable.** Two artifacts. (1) A measurement-gap inventory: a table mapping every funnel step (page view, audit run, full-report/lead capture, in-page booking via /api/book, external Calendly click and completion, care-plan subscribe, deposit pay) to 'measured today? where?' with the exact file/table backing each answer, making the blind spots undeniable. (2) A prioritized minimum-instrumentation spec ready for tomorrow's build, covering: (a) one page-view tag in src/app/layout.tsx (Vercel Web Analytics or GA4 via next/script) so traffic and top pages are counted; (b) a shared client util that on first load reads utm_source/medium/campaign/content/term plus fbclid, gclid, referrer, and landing path, stores them in sessionStorage, and attaches them to every POST to /api/leads, /api/audit-report, and /api/book; (c) a Supabase migration adding utm/source/referrer/landing columns to the leads table (and optionally audits), plus widening the LeadBody and audit-report body types to persist them; (d) a named-event dictionary (for example audit_run, report_requested, lead_submitted, booking_confirmed, calendly_click, subscribe_click, deposit_paid) with properties, fired on each success path; (e) appending UTM to site.calendlyUrl and enabling Calendly UTM tracking or its webhook so external bookings are attributable; (f) passing client_reference_id and UTM metadata into /api/checkout and the Stripe Payment Links so payments join to a lead and a channel; (g) a Meta Pixel for the Facebook channel; (h) a GSC verification token via metadata.verification.google plus confirmed sitemap submission, and a decision on noindex/disallow for /demos. Include the ready-to-run SQL for funnel counts by channel once source columns exist.

---

### 7. Reliability, Error Handling & Edge Cases  (P0)

**Objective.** Verify that Stackwrk degrades gracefully instead of breaking or losing data when its external dependencies (Supabase, Quo, Resend, Stripe, and arbitrary site-audit fetches) are slow, failing, or unconfigured, and that every user-facing surface (public tools, the two CRMs, the agreement and pay flow) handles empty, loading, error, timeout, and malformed-input conditions without 500s, hangs, silent data loss, or misleading output. This matters acutely here because the app is a solo-run go-to-market engine: /prospects is the single source of truth for the sales pipeline stored as one shared JSON document, the audit and email-hunt endpoints make the server fetch attacker-controllable external URLs, and money flows through Stripe from a client-crafted agreement link. One unhandled failure can wipe the pipeline, hang a serverless function to a 504, or show a paying client a broken agreement.

**Scope**

- src/app/prospects/Board.tsx (shared pipeline load + debounced save + CSV/email-hunt)
- src/lib/quo.ts (quoFetch, resolvePhoneNumberId caching, verifyQuoWebhook, upsertQuoContact)
- src/lib/email.ts (Resend sendEmail, reportFromEmail)
- src/lib/safe-fetch.ts (normalizeUrl, guardedFetch, resolvesToPrivate, readBodyCapped)
- src/lib/supabase.ts, src/lib/stripe.ts, src/lib/crm-auth.ts, src/lib/agreement.ts (decodeAgreement)
- src/app/api/audit/route.ts, src/app/api/audit-report/route.ts, src/app/api/leads/route.ts, src/app/api/leads/find-email/route.ts
- src/app/api/book/route.ts, src/app/api/sign/route.ts, src/app/api/checkout/route.ts, src/app/api/webhooks/stripe/route.ts
- src/app/api/team/route.ts, src/app/api/team/audits/route.ts, src/app/api/team/quo-calls/route.ts, src/app/api/quo/webhook/route.ts, src/app/api/quo/contacts/route.ts, src/app/api/team-login/route.ts
- src/components/AuditTool.tsx, src/components/CrmBoard.tsx
- src/app/prospects/LeadAudit.tsx, CallHistory.tsx, AgreementGen.tsx, Gate.tsx
- src/app/agreement/page.tsx, src/app/agreement/SignBlock.tsx

**Quick wins (check these first)**

- Board.tsx: a transient/ok:false response from GET /api/team on mount leaves base=[], then the debounced save effect immediately PUTs the empty list back and wipes the shared team_crm pipeline for everyone. Likely the single highest-impact bug in this domain.
- quo.ts resolvePhoneNumberId caches null permanently (module-level cachedPhoneNumberId) after one transient failure, so fetchCallHistory returns [] for the life of that serverless instance even after Quo recovers.
- No request timeout on Resend (email.ts) or the Quo API (quo.ts quoFetch); a slow upstream stalls book/sign/audit-report and the CRM Activity drawer up to the platform limit (504).
- No rate limiting on the public /api/audit crawler (or /api/audit-report, /api/book, /api/leads POST, /api/checkout); only /api/sign is throttled. /api/audit will fetch attacker-supplied URLs unbounded.
- POST with a literal JSON null body (or a scalar) to /api/audit, /api/leads, /api/book, /api/audit-report, /api/sign, /api/checkout, /api/team-login, /api/team throws an uncaught TypeError (body.X on null) and returns 500 instead of a clean 400. The try/catch only wraps req.json().
- A corrupted or truncated agreement ?d param (e.g. projectFee as a non-number) renders $NaN on /agreement and passes NaN to SignBlock, breaking the doc for a real client.
- Board.tsx save uses .catch(()=>{}) with no toast, and CrmBoard.patch never checks res.ok: failed saves are invisible and lost.
- guardedFetch/resolvesToPrivate do DNS lookups (dns.lookup, no timeout) outside the AbortController, so a slow DNS can blow past FETCH_TIMEOUT_MS and the route maxDuration.

**Checks**

- **[CRITICAL]** On /prospects mount, a failed or {ok:false} GET /api/team (503 not_configured, 500 query_failed, 401 cookie hiccup, or network error) leaves base=[], then the debounced save effect PUTs that empty/partial list back to team_crm, destroying the shared pipeline.
  - How: In src/app/prospects/Board.tsx trace the mount effect (lines 152-197) and save effect (lines 200-206). Reproduce with Playwright page.route() forcing /api/team GET to return {ok:false}/503 or a network abort, load /prospects, then observe the immediately-following PUT payload and Supabase team_crm.data. Confirm the save is not gated on a successful load.
  - Signal of a problem: team_crm.data becomes [] (or only audit/quo-derived rows) after a failed or slow initial load; all manually added prospects vanish for the whole team on next load.
- **[HIGH]** quo.ts resolvePhoneNumberId negatively caches null forever after one transient failure, disabling live call history for the instance lifetime.
  - How: Read src/lib/quo.ts lines 35-45. With Playwright/mock, make the first GET /phone-numbers return non-ok, then call any flow hitting fetchCallHistory (open a lead drawer -> CallHistory -> /api/team/quo-calls). Confirm cachedPhoneNumberId stays null and no subsequent request re-resolves it even after Quo is healthy.
  - Signal of a problem: CRM Activity panel permanently empty on a warm instance despite Quo working; no re-fetch of the phone number id.
- **[HIGH]** No rate limiting on the public POST endpoints /api/audit, /api/audit-report, /api/book, /api/leads, /api/checkout; only /api/sign throttles. /api/audit is an SSRF-guarded fetch-anything crawler and /api/checkout mints real Stripe sessions.
  - How: grep confirms rateLimited exists only in src/app/api/sign/route.ts. Loop 50+ rapid POSTs at /api/audit (varied public URLs) and /api/checkout; confirm no throttling and observe compute/Stripe object creation.
  - Signal of a problem: Unbounded server-side outbound fetches (abuse/DoS amplification) and unbounded Stripe session creation from a single client.
- **[HIGH]** Board.tsx persists via .catch(()=>{}) with no user feedback, and CrmBoard.patch never checks res.ok, so failed status/notes/pipeline saves are silent and lost.
  - How: Read src/app/prospects/Board.tsx line 204 and src/components/CrmBoard.tsx lines 54-65. With Playwright, force PUT/PATCH /api/leads and /api/team to 500 or offline, edit a lead, then reload and confirm the change is gone with no error surfaced.
  - Signal of a problem: UI shows the edited value but the DB never updated; no toast/indicator; work silently lost on refresh.
- **[MEDIUM]** Resend sendEmail (email.ts) has no AbortController/timeout; book/sign/audit-report await it (twice, serially) with book and sign having no maxDuration, so a slow Resend stalls the request to a platform 504 while the lead may already be stored.
  - How: Read src/lib/email.ts (line 59) and confirm no maxDuration in src/app/api/book/route.ts and src/app/api/sign/route.ts. Intercept api.resend.com with a multi-second delay and submit the booking form and the agreement sign flow; measure latency and the client outcome.
  - Signal of a problem: Booking/sign request hangs then 504s; client sees an error even though the lead/signature was persisted; possible duplicate submissions.
- **[MEDIUM]** Quo API quoFetch (quo.ts) has no timeout; fetchCallHistory is awaited live inside /api/team/quo-calls (the drawer load), so a slow Quo hangs the Activity fetch beyond the .catch guard (which only catches rejection, not a hang).
  - How: Read src/lib/quo.ts line 25 and src/app/api/team/quo-calls/route.ts line 57. Delay api.quo.com responses and open a lead drawer with a phone; confirm the request stalls rather than degrading to the DB-only merge.
  - Signal of a problem: Lead drawer Activity spinner never resolves when Quo is slow; function runs to maxDuration.
- **[MEDIUM]** DNS resolution in guardedFetch/resolvesToPrivate is not bounded by the AbortController or any timeout, so a slow authoritative DNS on an audited/hunted host can exceed FETCH_TIMEOUT_MS and the route maxDuration.
  - How: Read src/lib/safe-fetch.ts resolvesToPrivate (46-54) and guardedFetch loop (73-99): dns.lookup runs per hop with no signal. Point /api/audit at a hostname whose DNS server is deliberately slow and measure total request time against maxDuration=20.
  - Signal of a problem: Audit or find-email request exceeds 20s and returns a platform 504 rather than a clean unreachable error.
- **[MEDIUM]** POST with a valid JSON literal null body (or a scalar/array) throws an uncaught TypeError because body.X is read outside the try that only wraps req.json().
  - How: Confirmed statically in audit (body.url line 52), leads (body.id/body.company), book (body.company line 49), audit-report (body.company line 68), sign (body.company line 32), checkout (b.email line 25), team-login (destructure line 21). Send curl -d 'null' -H 'content-type: application/json' to each and check for 500 vs 400/422.
  - Signal of a problem: Endpoint returns 500 Internal Server Error (unhandled TypeError) instead of a clean 400 invalid body.
- **[MEDIUM]** A corrupted/truncated agreement ?d param decodes to arbitrary JSON that resolveAgreement spreads over defaults; buildAgreement then does arithmetic on a non-number projectFee/depositPct, rendering $NaN and passing NaN deposit into SignBlock.
  - How: Read src/lib/agreement.ts decodeAgreement (158-167), resolveAgreement, buildAgreement (deposit calc line 64) and src/app/agreement/page.tsx line 16. Load /agreement?d=<base64url of {"projectFee":"abc"}> and inspect the rendered deposit and the /api/checkout call.
  - Signal of a problem: Agreement shows $NaN for a paying client; checkout receives NaN amount (rejected as bad_amount, so the page is broken but no wrong charge).
- **[MEDIUM]** The shared /prospects pipeline is one team_crm row upserted wholesale with last-write-wins; concurrent editors overwrite each other and the returned updated_at is never used for conflict detection.
  - How: Read src/app/api/team/route.ts PUT (24-35) and the Board save effect. Open two authenticated sessions, edit different leads within the 800ms debounce window in each, and confirm one session's changes are silently clobbered.
  - Signal of a problem: A teammate's edits disappear after another teammate saves; no merge or stale-write rejection.
- **[MEDIUM]** crm-auth SECRET falls back to the hardcoded constant 'stackwrk-crm-dev-secret' when CRM_ACCESS_KEY is unset, so if CRM_USERS is configured but CRM_ACCESS_KEY is not, session tokens are signed with a public constant and are forgeable.
  - How: Read src/lib/crm-auth.ts line 9 and makeToken/verifyToken. In a deploy with CRM_USERS set and CRM_ACCESS_KEY unset, forge a token as HMAC('stackwrk-crm-dev-secret', username) and hit /api/team or /api/sign GET.
  - Signal of a problem: Team CRM and signatures readable/writable without valid credentials in a partially-configured environment.
- **[MEDIUM]** Systematic missing-env degradation: each integration must return a clean 503/empty/friendly state rather than 500 when its env is absent.
  - How: Toggle off, one at a time in .env.local: SUPABASE_* (expect getSupabaseAdmin null -> 503 or [] in leads/team/sign/audit-report), STRIPE_SECRET_KEY (checkout 503, SignBlock falls back to invoice message), STRIPE_WEBHOOK_SECRET (stripe webhook 503), RESEND_API_KEY (sendEmail not_configured, routes still ok:true emailed:false), QUO_API_KEY (fetchCallHistory [], upsertQuoContact false), QUO_WEBHOOK_SECRET (webhook 401), CRM_USERS (team-login 503, Gate shows not_configured), CRM_ACCESS_KEY (leads authorized false -> locked). Hit each consuming route and record status + client rendering.
  - Signal of a problem: Any route returns an unhandled 500, or the client shows a raw error instead of the intended graceful/degraded state.
- **[MEDIUM]** Board.findMissingEmails fans out client-side at CONCURRENCY=5 across 100+ leads to /api/leads/find-email (each up to 2 external fetches), with no server-side concurrency or rate cap.
  - How: Read src/app/prospects/Board.tsx lines 392-422 and src/app/api/leads/find-email/route.ts. Run the email hunt over a large seed list and watch function concurrency, target-site throttling, and whether a stuck worker (server maxDuration 20s) blocks progress.
  - Signal of a problem: Server function concurrency exhausted, server IP rate-limited/blocked by target sites, or the hunt effectively hangs on slow sites.
- **[LOW]** AuditTool.run parses res.json() without a catch, so a platform 504/HTML response (plausible given the crawler and DNS gaps) throws and is mislabeled as a generic network error, unlike ReportCapture which uses .catch(()=>({})).
  - How: Read src/components/AuditTool.tsx line 350 vs line 224. Force /api/audit to return a non-JSON 504 via interception and confirm the surfaced message and phase.
  - Signal of a problem: Timeout on a real site shows 'Network error. Please try again.' instead of an accurate 'took too long / unreachable' message.
- **[LOW]** readBodyCapped swallows any read error to an empty string, so the audit then scores an empty document (no title, no viewport, etc.) and reports a bogus 'critical issues' low score instead of an unreachable/parse error.
  - How: Read src/lib/safe-fetch.ts readBodyCapped (102-123) and src/app/api/audit/route.ts (83-88). Simulate a site that returns headers then drops the connection mid-body and confirm the score output vs an error.
  - Signal of a problem: A site that timed out mid-body gets a misleading 'needs a rebuild' scorecard, damaging credibility of the lead magnet.
- **[LOW]** Quo webhook allowlist (QUO_ALLOWED_NUMBERS) is bypassed when context.phoneNumber is absent, because the filter condition requires ownDigits to be truthy.
  - How: Read src/app/api/quo/webhook/route.ts lines 50-52. Send a signed event with no context.phoneNumber and a foreign number and confirm it is processed (written to quo_calls) despite an allowlist.
  - Signal of a problem: Calls/texts from an unrelated business on a shared Quo workspace leak into this CRM.
- **[LOW]** Legacy Quo webhook verification (verifyLegacy) ignores timestamp freshness, so a captured legacy payload can be replayed indefinitely, unlike the Standard path which enforces a 300s window.
  - How: Read src/lib/quo.ts verifyLegacy (109-115) vs verifyStandard (118-127). Replay a previously valid legacy-signed body and confirm it is accepted.
  - Signal of a problem: Replayed webhook writes stale/duplicate activity rows; no replay protection on the legacy scheme.
- **[LOW]** Stripe webhook and Quo webhook persist via .then(()=>{},()=>{}) that swallows all Supabase errors, so the durable payment/activity log can silently develop gaps (missing table, dup PK, RLS error) while returning 200.
  - How: Read src/app/api/webhooks/stripe/route.ts (42-54) and the upserts in src/app/api/quo/webhook/route.ts (101, 119, 143). Drop the payments/quo_* table or violate the PK and confirm the failure is invisible.
  - Signal of a problem: Payments/calls not recorded despite a 200 to Stripe/Quo; no log or alert on insert failure.
- **[LOW]** State-completeness inventory: confirm every data surface renders explicit idle, loading, empty, and error branches, and flag Board.tsx which renders the empty board and zeroed stats during load (no ready-guard skeleton).
  - How: Read AuditTool.tsx (has all four), CrmBoard.tsx (has all four), LeadAudit.tsx (has all four), CallHistory.tsx (null on empty/error by design), and Board.tsx (renders before ready flips true). Confirm no surface shows a permanent spinner or a crash on empty data.
  - Signal of a problem: Board flashes '0 Total / empty columns' as if the pipeline were empty during every load; any surface stuck on a spinner when data is genuinely empty.
- **[LOW]** checkout amount is taken from the client (decoded agreement config) and only guarded against NaN/<1, not validated against expected plan pricing.
  - How: Read src/app/api/checkout/route.ts (lines 30-31, 49-50). Confirm Math.round(Number(...)) rejects NaN/0/negative for both deposit and care, and note that a crafted amount is otherwise honored (reliability + trust boundary).
  - Signal of a problem: A malformed or manipulated amount either 422s (acceptable) or creates a session for an arbitrary amount (trust gap).
- **[LOW]** book and sign routes await two serial sendEmail calls (visitor copy then Tal notify) with no maxDuration; verify a failed visitor email still returns ok:true with emailed:false and the client handles it, and that the notify failure is not surfaced as a hard error.
  - How: Read src/app/api/book/route.ts (85-102), src/app/api/audit-report/route.ts (119-136), src/app/api/sign/route.ts (74-87) and the AuditTool 'sent' branch (240-268). Force the first sendEmail to fail and confirm graceful copy ('we will send shortly') vs an error state.
  - Signal of a problem: A single email failure blocks the confirmation the user sees, or doubles latency enough to 504.

**Tooling**

- next dev locally, plus curl/httpie to POST crafted bodies (JSON null, scalars, arrays, oversized fields, invalid URLs) at every /api route
- Playwright (already a devDependency) to drive AuditTool, CrmBoard, /prospects, and the agreement/sign flow, using page.route() to abort, delay, or fulfill /api/* calls and simulate slow/failing/offline dependencies
- .env.local toggling to drop each integration's env vars (SUPABASE_*, STRIPE_*, RESEND_API_KEY, QUO_API_KEY, CRM_USERS, CRM_ACCESS_KEY) and confirm graceful degradation
- A local slow/hanging HTTP server (or Playwright request interception with added latency) to simulate a slow Resend, slow Quo API, and slow/large target sites, plus a slow-DNS hostname to probe resolvesToPrivate
- Supabase SQL editor / MCP to snapshot team_crm.data before and after a simulated failed load, and to inspect audits/leads/payments/quo_* rows
- rg/grep for fetch(, AbortController, maxDuration, .catch(, and .then(()=>{},()=>{}) to map timeout and swallow coverage
- React DevTools or code inspection to enumerate idle/loading/empty/error state branches per component

**Deliverable.** A triaged findings report for this domain, each finding with: severity, a concrete repro (route + crafted input, or the interception that induces the failure), file:line anchor, observed vs expected behavior, and blast radius. Plus three supporting tables: (1) a missing-env degradation matrix (Supabase, Stripe, Resend, Quo, CRM_USERS, CRM_ACCESS_KEY x each consuming route -> observed status/body and client rendering, flagging any unhandled 500 or forgeable-auth case); (2) an outbound-call timeout and abort coverage table (audit fetch, robots fetch, find-email fetch, Resend, Quo API, Supabase, Stripe, DNS resolution -> has timeout? bounded by maxDuration? retry/backoff?); (3) a per-surface state inventory (AuditTool, CrmBoard, /prospects Board, LeadAudit, CallHistory, SignBlock, Gate -> idle/loading/empty/error present or missing). End with a prioritized fix list; the Board.tsx load-then-overwrite data-loss issue is called out as a ship-blocker.

---

### 8. Business & Go-To-Market Strategy  (P0)

**Objective.** Verify that Stackwrk tells ONE coherent commercial story from cold touch to signed agreement: that positioning and the free wedge are singular, that every price a prospect can encounter (cold call, cold email, live site, services grid, e-signed agreement) matches, that the lead-gen engine and email deliverability can actually run (not just be documented), and that no funnel step from stranger to paid is inert or self-contradicting. This matters more than anything else for Stackwrk specifically because it is pre-revenue (STRATEGY.md names "zero paying customers" as risk #1), the entire thesis is MRR per hour of a solo operator's time, and the go-to-market motion has just been fully built but not activated. Incoherence here does not degrade gracefully: a prospect who hears $3,900 on the phone, sees $4,500 on the site, and gets a $4,500 agreement simply does not close. Ground every check in the real price books (src/lib/pricing.ts, src/lib/agreement.ts), the playbooks, the live routes, and the integration config, and treat "documented in a playbook" as unproven until the wiring exists.

**Scope**

- STRATEGY.md
- PRICING-BENCHMARKS.md
- MARKETING.md
- PLAN.md
- TODO.md
- DELIVERY.md
- playbook/00-RUNBOOK.md
- playbook/01-email-sequences.md
- playbook/02-call-scripts.md
- playbook/03-service-agreement.md
- playbook/04-systems.md
- playbook/05-instantly-campaign.md
- playbook/07-grow-email-list.md
- playbook/08-qualify-phone-leads.md
- playbook/START-HERE-TOMORROW.md
- src/lib/pricing.ts
- src/lib/agreement.ts
- src/lib/content.ts
- src/lib/guides.ts
- src/lib/tools.ts
- src/lib/prospects.ts
- src/app/pricing/page.tsx
- src/app/services/page.tsx
- src/app/contact/page.tsx
- src/app/guides/page.tsx
- src/app/page.tsx
- src/components/IndustryGreeting.tsx
- src/components/StickyCTA.tsx
- src/components/Plans.tsx
- src/components/FinalCTA.tsx
- src/app/api/leads/route.ts
- src/app/api/book/route.ts
- src/app/api/audit-report/route.ts
- src/app/api/checkout/route.ts
- .env.example
- instantly-fence-leads.csv
- no-website-qualified.csv
- guessed-emails-to-verify.csv

**Quick wins (check these first)**

- Grep the repo for price literals: the playbooks quote builds of $2,500/$3,900/$6,500 and care of $99/$199/$399, which contradict the live site's $2,000/$4,500/$8,000 and $99/$249/$499 (and the phone script's '$3,900' contradicts the e-sign agreement's $4,500).
- site.calendlyUrl in src/lib/content.ts is a seatophomes.com Calendly, not a Stackwrk one, shown on every 'Book a call' CTA.
- Resend, Supabase, and Stripe are all unset, so the audit-report email, lead capture, booking storage, and care-plan subscribe button are inert (funnel captures and bills nothing).
- The top build tier is 'Market Leader' on /pricing but 'Custom App / Platform' on /services, same $8,000, two names.
- /services shows no struck-through standard price even though PRICING-BENCHMARKS.md claims the anchor is there.
- Cold sending domain is undecided across docs (foxwrk.com vs getstackwrk.com vs stackwrkhq.com); the 2 to 3 week warmup cannot start until it is picked.
- Testimonials in content.ts are draft/unconfirmed with real client names and a placeholder third quote; the guarantee is flagged 'confirm.'
- playbook/05 still has the literal [YOUR MAILING ADDRESS] placeholder in the CAN-SPAM signature.
- STRATEGY.md section 2 still names real-estate/marine + local services as the beachhead while the whole machine is fence/exterior.
- The 'ai' guide cluster is defined but has zero guides while the AI Assistant is sold on /services.

**Checks**

- **[CRITICAL]** Reconcile every build-tier and care-tier price a prospect can encounter into one table and flag mismatches. The live site (src/lib/pricing.ts + src/lib/agreement.ts PLAN_PRESETS) sells builds at $2,000 / $4,500 / $8,000 and care at $99 / $249 / $499, but the playbooks Tal reads aloud sell different numbers: playbook/00-RUNBOOK.md, 02-call-scripts.md, 03-service-agreement.md, 04-systems.md and START-HERE-TOMORROW.md quote builds of $2,500 / $3,900 / $6,500 and care of $99 / $199 / $399. The phone objection script literally says 'most fence guys land around $3,900'; the site and the e-sign agreement say $4,500.
  - How: Grep the whole repo for price literals: rg -n '\$?(2,?000|2,?500|3,?900|4,?500|6,?500|8,?000|199|249|399|499)' across playbook/, src/lib/pricing.ts, src/lib/agreement.ts, src/lib/content.ts and all *.md. Build a matrix of tier vs source (call script, cold email, service agreement, pricing.ts, agreement.ts, /pricing, /services) and mark each cell that disagrees with the canonical live value.
  - Signal of a problem: Any build or care price in a playbook, script, or agreement template that differs from the live pricing.ts / agreement.ts value the client will actually be charged. Confirmed present: $3,900 vs $4,500, $199/$399 care vs $249/$499.
- **[CRITICAL]** Confirm the audit reports, lead alerts, booking confirmations, and signed-agreement copies can actually send. .env.example and DELIVERY.md section 7 show REPORT_FROM_EMAIL on stackwrk.com but TODO.md states the domain is not yet verified in Resend, so 'audit reports / lead alerts / booking + agreement copies do NOT send.' This is the core audit-to-emailed-report-to-CRM weapon named in MARKETING.md and DELIVERY.md.
  - How: Check whether RESEND_API_KEY and a verified REPORT_FROM_EMAIL are set in Vercel (dashboard) and confirm src/lib/email.ts behavior when unset. Trace /api/audit-report and /api/book to see they degrade to silent no-send. Attempt a live audit-report submission and confirm whether an email arrives.
  - Signal of a problem: Resend unverified or unset: the flagship cold-email weapon captures nothing usable and the prospect never receives the promised report, so the entire audit-led motion is inert.
- **[CRITICAL]** Confirm inbound lead capture is live. src/app/api/leads/route.ts and src/app/api/book/route.ts return 503 (not_configured) when Supabase env is missing, and PLAN.md / DELIVERY.md section 7 state no Stackwrk Supabase project exists yet. Until SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and CRM_ACCESS_KEY are set, every mockup-form and booking submission is dropped and /crm is empty.
  - How: Check Vercel env for the three vars; POST a test payload to /api/leads and /api/book and observe 503 vs ok. Confirm getSupabaseAdmin() returns null path in src/lib/supabase.ts. Load /crm and see whether it is gated/empty.
  - Signal of a problem: 503 on lead POST: inbound leads and bookings are not stored anywhere, the audit-run warm-lead signal is off, and the CRM pipeline that the whole outreach cadence depends on has no data.
- **[HIGH]** Confirm there is genuinely ONE live price book, not two that happen to agree today. /pricing (src/app/pricing/page.tsx) renders build tiers from PLAN_PRESETS in src/lib/agreement.ts, while /services (src/app/services/page.tsx) and the quote builder render from priceItems in src/lib/pricing.ts. PRICING-BENCHMARKS.md claims 'one source of truth, no drift,' but two independent constant tables exist.
  - How: Diff PLAN_PRESETS (agreement.ts) against the build + care entries in priceItems (pricing.ts) field by field (founding, standard/listFee, care monthly). Confirm whether one imports the other or they are duplicated literals that must be hand-synced.
  - Signal of a problem: Two hardcoded price tables with no shared import: a future edit to one silently diverges the other, and the 'single source of truth' claim is false.
- **[HIGH]** Resolve the ICP contradiction between the top-level strategy and everything downstream. STRATEGY.md section 2 names the beachhead verticals as real-estate / marine-boating (SeaTop, YatHub) plus local services (Capoeira Aue), but TODO.md, all playbooks, the lead CSVs, the apex-fence demo, the home hero eyebrow ('Websites for fence & exterior contractors'), the /pricing meta, and the cold scripts are all fence / exterior contractors in South Florida. CLAUDE.md reconciles this as 'originally fence, now broadening,' but STRATEGY.md was never updated.
  - How: Cross-read STRATEGY.md section 2 against TODO.md niche decision, hero.eyebrow in src/lib/content.ts, the projects array, and playbook targeting. Identify which ICP the money is actually being spent against (the CSVs and demos are fence-only).
  - Signal of a problem: The guiding strategy document and the operational machine disagree on who the customer is; cold-email reply rates and messaging suffer when the north-star doc points at a different niche than the assets.
- **[HIGH]** Determine the single top-of-funnel wedge. The home hero primaryCta in src/lib/content.ts is 'Get a Free Site Mockup' and finalCta/howItWorks lead with a free mockup, but PLAN.md calls the Instant Site Audit the flagship cold-email weapon and MARKETING.md section 3 builds the whole cold sequence around the audit score. The site offers two different free things (audit vs mockup) as the entry point.
  - How: Trace the CTAs across src/lib/content.ts (hero, finalCta), the AuditTool/AuditSection, the entry popup (promo in content.ts), and the cold-email/call scripts. Map where each free offer hands off and whether a visitor arriving from an audit-hook email lands on a mockup CTA or vice versa.
  - Signal of a problem: Audit and mockup compete as the wedge with no unified handoff; a prospect promised an audit score in the email meets a 'free mockup' hero, breaking message-to-landing continuity.
- **[HIGH]** Confirm care-plan billing, the entire MRR thesis, can be transacted. carePlans[].stripeUrl in src/lib/pricing.ts is empty on all three tiers, so the 'Subscribe now' button never appears, and TODO.md / DELIVERY.md show Stripe keys and Payment Links are not set. STRATEGY.md makes recurring care revenue the actual business, but there is no automated way to start a subscription.
  - How: Read carePlans in src/lib/pricing.ts (stripeUrl values), check /api/checkout and /api/webhooks/stripe for key presence, and load /pricing to confirm no subscribe button renders. Confirm the fallback is manual Zelle/Venmo per playbook/00 and TODO.md.
  - Signal of a problem: Empty stripeUrl and unset Stripe keys: care-plan MRR has no self-serve billing, attach happens only via manual invoicing, and the sellable-asset thesis cannot compound without operator effort per client.
- **[HIGH]** Check for cross-brand identity leakage at the booking and contact step. site.calendlyUrl in src/lib/content.ts is https://calendly.com/tal-foxamit-seatophomes/30min (a SeaTop Homes Calendly), while the site brand is Stackwrk and the public email is hello@stackwrk.com. The owner email is tal.foxamit@seatophomes.com. Every 'Book a call' CTA sends a Stackwrk prospect to a seatophomes URL.
  - How: Grep for calendlyUrl usage (already found in FinalCTA, Footer, AuditTool, RoiCalculator, SaasVsCustomCalculator, ToolLayout, MockupModal, /api/book fallback). Click through the live booking CTA and read the resulting Calendly page branding.
  - Signal of a problem: A seatophomes.com Calendly (or any non-Stackwrk brand) shown at the moment of highest intent; erodes trust and signals the business is a side operation, right where the prospect decides to book.
- **[HIGH]** Resolve the undecided cold-email sending domain (the longest lead-time item). MARKETING.md says use foxwrk.com, playbook/01-email-sequences.md says getstackwrk.com or stackwrkhq.com, and playbook/05, playbook/00, START-HERE-TOMORROW.md and TODO.md say getstackwrk.com. Warmup takes 2 to 3 weeks, so warming the wrong or an undecided domain wastes the critical path.
  - How: Collect every sending-domain reference across MARKETING.md and playbook/*.md. Confirm which domain (if any) is actually registered and warming. Verify SPF, DKIM, and DMARC records exist for the chosen domain via dig/MXToolbox, and that it is separate from stackwrk.com so cold volume cannot damage the transactional domain.
  - Signal of a problem: No single warmed domain decided, or missing SPF/DKIM/DMARC: cold sends land in spam and the 2 to 3 week warmup clock has not even started against the right domain.
- **[HIGH]** Check the actual cold-email list size against the planned volume. playbook/07-grow-email-list.md and instantly-fence-leads.csv show 47 verified emails plus ~52 to guess-and-verify (roughly 15 to 25 more), but STRATEGY.md and MARKETING.md plan 200 targets per vertical and 30 personalized sends per day. The email engine has about one to two days of fuel.
  - How: Count rows in instantly-fence-leads.csv, guessed-emails-to-verify.csv, and no-website-qualified.csv. Compare the deliverable email count against the 30/day x 5 day/week cadence in MARKETING.md and the 10 audit-calls/month funnel math.
  - Signal of a problem: The verified list sustains only a few days of sends, so the funnel math (30/day to 10 calls/month) is unfunded; the real near-term engine is phone-only, which the plan underweights.
- **[HIGH]** Verify CAN-SPAM and opt-out compliance in the actual sending copy. playbook/05-instantly-campaign.md still contains the literal placeholder [YOUR MAILING ADDRESS] in all three step signatures, and the audit-report email (a promotional message) must carry a physical address and unsubscribe path.
  - How: Grep playbook/05 and playbook/01 for '[YOUR MAILING ADDRESS]' and 'Reply STOP'. Read the audit-report email template in src/lib/email.ts / audit-report.ts (or /api/audit-report) for a physical address and opt-out. Confirm a real Fox Solutions LLC postal address is substituted before any send.
  - Signal of a problem: Unresolved address placeholder or a promotional audit-report email lacking a physical address / opt-out: CAN-SPAM violation and a deliverability penalty on the first batch.
- **[HIGH]** Audit proof and claims against reality for legal and trust risk. src/lib/content.ts testimonials are flagged as DRAFT/unconfirmed with real names (Brian at Above Air A/C, Saar at Fort Lauderdale Dock Rental) and a placeholder third quote ('Client / Local service business'); the guarantee block is flagged 'confirm these reflect what you actually offer'; and the hero claims 'A Team Behind You' and 'Trusted by contractors and local businesses across South Florida' while STRATEGY.md names zero paying customers as risk #1 and CLAUDE.md describes a solo builder.
  - How: Read the testimonials, guarantee, hero.highlights, and finalCta.trust in src/lib/content.ts and the TODO/NOTE comments there. Cross-check the 'team' and 'trusted by' claims against the solo-operator reality in STRATEGY.md and CLAUDE.md and against how many launches actually exist.
  - Signal of a problem: Named testimonials used without confirmed consent, guarantee terms not verified against what Tal will honor, or 'trusted by' / 'team' claims not yet true; a consent/false-advertising risk plus weak, unquantified proof for cold skeptical traffic.
- **[HIGH]** Trace the real booking path end to end and confirm it does not dead-end or confuse. There are three booking surfaces: the scripted DemoShowcase BookingDemo (a fake demo per PLAN.md), the real /api/book (used by MockupModal), and the external Calendly link. A booked call must land in both the calendar and the CRM.
  - How: Follow a booking from src/components/MockupModal.tsx and the demo widget through /api/book/route.ts: confirm it stores a lead (source 'booking') only when Supabase is set, emails a confirmation only when Resend is set, and that the 'Add to Google Calendar' link resolves to a real Stackwrk calendar. Verify the demo booking widget is clearly labeled as a demo so prospects do not think they booked.
  - Signal of a problem: A prospect completes the demo booking thinking it is real, or /api/book silently drops the booking (Supabase/Resend unset) with no calendar hold; a booked call that never reaches Tal.
- **[MEDIUM]** The same top build tier is named differently on two public pages: 'Market Leader' on /pricing and in agreement.ts, but 'Custom App / Platform' on /services and in pricing.ts, both at $8,000. A prospect comparing the two pages sees two products.
  - How: Compare the tier keys in src/app/pricing/page.tsx (tiers array + PLAN_PRESETS keys) against the build-category labels in src/lib/pricing.ts rendered on /services. Load both live routes and read the tier headers.
  - Signal of a problem: Same price, two names across two public pages; buyer confusion and a credibility ding on the core offer.
- **[MEDIUM]** Verify the founding-vs-standard anchoring PRICING-BENCHMARKS.md claims is actually rendered. It states 'Services grid shows the standard rate struck through next to the live founding rate,' but the priceLabel function in src/app/services/page.tsx only emits the founding number with no struck-through standard.
  - How: Read priceLabel in src/app/services/page.tsx; load /services live and inspect each service card for a struck-through anchor price. Cross-check against the claim table at the bottom of PRICING-BENCHMARKS.md.
  - Signal of a problem: No anchor price on /services, so the founding discount is invisible there and the documented anchoring strategy is only half-implemented.
- **[MEDIUM]** Assess whether the public offer surface is too wide for Stage A and dilutes the fence positioning. /services (src/app/services/page.tsx via pricing.ts) publicly lists Fractional CTO, Custom CRM, Automation Program, and AI Assistant, yet STRATEGY.md section 4 explicitly says do not chase Fractional CTO, equity, or vertical SaaS now, and the day-90 gate says 'do not add services, narrow instead.'
  - How: List every category rendered on /services from priceItems and compare against the Stage-A focus in STRATEGY.md sections 3, 4 and 7. Judge whether a fence contractor arriving from a fence-branded ad sees offers (Fractional CTO) that undercut the 'built for fence pros' story.
  - Signal of a problem: The live offer menu is broader than the validated Stage-A wedge; positioning reads as generalist agency rather than the sharp fence-first wedge the strategy prescribes.
- **[MEDIUM]** Reconcile the care-plan attach-rate assumption that the revenue projections rest on. STRATEGY.md, MARKETING.md, and DELIVERY.md all target >=60% attach, but playbook/00-RUNBOOK.md money math assumes ~85% attach, and the two docs produce different year-1 figures (PLAN.md $116k to $120k vs RUNBOOK ~$91k) partly because they also use different build prices.
  - How: Compare the attach assumptions and build-price inputs in STRATEGY.md section 3, MARKETING.md section 1, DELIVERY.md section 1D, PLAN.md money math, and playbook/00 money math. Re-derive year-1 revenue with one consistent set of inputs and see which docs are internally reproducible.
  - Signal of a problem: Headline revenue math is not reproducible from a single set of assumptions; the go/no-go gate at day 90 and the full-time decision at Stage B rest on figures that disagree by ~25 to 30 percent.
- **[MEDIUM]** Confirm no TCPA-risky automated calling or cold-SMS path exists. Playbooks correctly say manual dials only and no cold SMS, but a Quo (OpenPhone) SMS/calls integration exists (src/lib/quo.ts, /api/quo/*). Verify the CRM cannot blast cold SMS or autodial cell numbers.
  - How: Read src/lib/quo.ts and src/app/api/quo/* plus the prospects CRM (src/lib/prospects.ts, Board.tsx) for any bulk-SMS or autodial-to-cell capability. Cross-check against the manual-dial rule in playbook/02 and playbook/00 reality checks.
  - Signal of a problem: A one-click bulk-SMS or autodial feature over cell numbers in the CRM; TCPA exposure that the playbooks warn against but the tooling could enable.
- **[MEDIUM]** Set correct expectations for the guides SEO play as a channel. All 15 guides in src/lib/guides.ts are dated 2026-07-16 (today), so they have zero ranking authority, yet MARKETING.md and the funnel treat content as a lead source. Most guides target broad SMB queries (own your software, per-user CRM fees, consolidate apps) rather than fence queries, a different ICP than the fence-branded home and outreach.
  - How: Read the date/updated fields and targetQuery/clusterId for each guide in src/lib/guides.ts. Bucket target queries as fence-specific vs broad-SMB. Judge realistic time-to-rank (6 to 12 months) against the Stage-A 90-day window.
  - Signal of a problem: Guides counted as a near-term channel despite zero authority and a query set aimed at a broader ICP than the fence outreach; the content payoff is a Stage-B asset being budgeted as a Stage-A lead source.
- **[MEDIUM]** Verify the icebreaker personalization and campaign-link personalization actually read as human and specific. playbook/05 and prospects.ts generate a per-lead icebreaker first line, and src/components/IndustryGreeting.tsx greets visitors from ?for=<industry> links. Generic or templated-looking first lines tank cold reply rates and deliverability.
  - How: Read the icebreaker generation logic in src/lib/prospects.ts and sample the icebreaker column in instantly-fence-leads.csv for repetition or obvious templating. Load stackwrk.com/?for=fence-companies and confirm the greeting renders correctly and matches the email promise.
  - Signal of a problem: Repetitive or spammy icebreakers, or a ?for= greeting that mismatches the email hook; low reply rate and a landing that does not feel made-for-them.
- **[MEDIUM]** Locate the orphan financing offer. playbook/03-service-agreement.md offers a '$0 down + $199/mo for 12 months' payment plan that appears in no other place: not in src/lib/pricing.ts, not in src/lib/agreement.ts, and not on /pricing. If Tal quotes it, there is no price-book entry or agreement template to back it.
  - How: Grep for '$0 down', '199/mo', and 'plan' across pricing.ts, agreement.ts, content.ts, and the site. Confirm whether the financing option is represented anywhere the client-facing agreement or /pricing renders.
  - Signal of a problem: A payment-plan offer that exists only in a playbook, with no matching agreement clause or price-book line; quoting it creates an unbacked commitment and a bookkeeping gap.
- **[MEDIUM]** Confirm there is a real mechanism (not just static copy) to end founding-client pricing after 5 clients. /pricing shows a static 'Founding-client rates: first 5 clients only' badge and the founding vs standard step-up lives in PRICING-BENCHMARKS.md, but nothing counts closed clients or flips the price. The urgency claim is unfalsifiable and the planned price increase has no trigger.
  - How: Search src/app/pricing/page.tsx, src/lib/pricing.ts, and the quote builder (/quote) for any client-count gate or scheduled switch from founding to standard. Check whether the standard rate is ever surfaced to prospects beyond the struck-through anchor.
  - Signal of a problem: Static 'first 5 clients only' copy with no counting or expiry logic and no reminder to raise prices; the founding-rate weapon becomes a permanent discount and the WTP-discovery step-up in PRICING-BENCHMARKS.md never happens.
- **[MEDIUM]** Verify the Stage-A measurement instrument exists. STRATEGY.md defines hard gates (5 clients, >=$10k collected, >=3 care plans by day 90) and MARKETING.md defines weekly targets (open >=50%, reply >=4%, call-booked >=1.5%, close >=25%), but the CRM that would track these is unconfigured and there is no dashboard tying outreach touches to closed revenue.
  - How: Check whether /crm (gated by CRM_ACCESS_KEY) and the Supabase leads/audits tables are live, and whether any view aggregates outreach-to-close metrics. Compare the metrics MARKETING.md says to watch weekly against what the CRM can actually report.
  - Signal of a problem: No live instrument to measure the Stage-A gate or the weekly funnel metrics; the reposition-or-proceed decision at day 90 would be made on gut feel, defeating the learning-system design in STRATEGY.md section 2.
- **[LOW]** Check the AI service has any supporting content and that no empty cluster ships. src/lib/guides.ts defines an 'ai' cluster (Practical AI) with zero guides, while /services actively sells an AI Assistant ($1,500 + $150/mo). The hub filters empty clusters (publishedClusters in src/app/guides/page.tsx), so the AI cluster is hidden, leaving the sold AI offer with no SEO/answer-engine content behind it.
  - How: Confirmed via grep: clusterId 'ai' has 0 guides while own-it/automation/crm/internal-tools each have 3. Verify /guides hides the empty cluster and that the AI Assistant on /services links to no supporting guide.
  - Signal of a problem: A paid offer (AI Assistant) with no content cluster feeding it, and a defined cluster that renders nothing; a content-coverage gap on a headline service.

**Tooling**

- ripgrep across the repo for price literals, tier names, domain names, and placeholders (rg -n)
- Manual cross-read of STRATEGY.md, PRICING-BENCHMARKS.md, MARKETING.md, PLAN.md, TODO.md, DELIVERY.md and playbook/*.md against src/lib/pricing.ts and src/lib/agreement.ts
- A price-reconciliation matrix (tier x source) built as a scratch table
- Load live routes stackwrk.com/pricing, /services, /guides, /contact, and /?for=<industry> and read rendered copy + CTAs
- Vercel dashboard to confirm which env vars (SUPABASE_*, CRM_ACCESS_KEY, RESEND_API_KEY, REPORT_FROM_EMAIL, STRIPE_*) are actually set
- curl/Postman to POST test payloads to /api/leads, /api/book, /api/audit-report and observe 503 vs ok and whether emails send
- dig or MXToolbox to verify SPF, DKIM, and DMARC on the chosen cold-sending domain
- MillionVerifier and the lead CSVs to confirm real deliverable list size
- Resend, Supabase, and Stripe dashboards to confirm activation state of each integration

**Deliverable.** A GTM coherence report (Markdown, no code changes) containing: (1) a single reconciled price book, one table mapping every build tier, care tier, and the financing plan across src/lib/pricing.ts, src/lib/agreement.ts, /pricing, /services, all playbooks, and the cold scripts, with each mismatch flagged and the one canonical value to keep (this alone resolves the phone-vs-site price gap); (2) a positioning decision memo that resolves the ICP (fence-first vs broad SMB) and names the single free wedge (audit or mockup), listing the exact files and copy to change to make STRATEGY.md, the hero, /services, and the guides tell one story; (3) an activation status checklist mapping each funnel stage (capture, email report, booking, deposit, care subscription) to its blocking integration (Supabase, Resend, Stripe, Calendly, sending domain) and stating precisely what silently breaks until each is set; (4) a lead-gen readiness assessment covering real list size vs planned cadence, the sending-domain decision plus SPF/DKIM/DMARC, CAN-SPAM/TCPA compliance, and icebreaker quality; (5) a proof-and-claims risk list (testimonial consent, guarantee terms, 'trusted by' and 'team' puffery) with the specific lines to fix; and (6) a prioritized fix list ranked P0/P1/P2 tied to the checks above. Every finding cites a real file, route, or doc line.

---

### 9. SEO & AI Answer Engines (AIO)  (P1)

**Objective.** Verify that every public, indexable route on stackwrk.com is correctly discoverable, correctly canonicalized, richly described for both classic search and AI answer engines (ChatGPT, Perplexity, Google AI Overviews), and that the new /guides content cluster is genuinely citable and internally linked so its authority compounds. This matters more for Stackwrk than for a typical site: the entire go-to-market thesis (see the header comment in src/lib/guides.ts) is that long-tail guides plus FAQ/Article/WebApplication JSON-LD get the business quoted by search engines and AI engines. If canonicals, metadata, structured data, or internal linking are wrong, the cluster silently fails to rank or be cited and the GTM engine produces nothing. The audit confirms the plumbing (metadata, canonical, sitemap, robots, JSON-LD) is correct and the content (titles, descriptions, takeaways, FAQ answers, headings, interlinks) is optimized and quotable.

**Scope**

- src/app/layout.tsx (global metadata, metadataBase, the global alternates.canonical footgun, OG/Twitter card, viewport)
- src/app/sitemap.ts (which routes are listed, lastModified values)
- src/app/robots.ts (allow/disallow rules, sitemap + host)
- src/app/icon.png and src/app/apple-icon.png (favicons present; no opengraph-image found)
- src/lib/guides.ts (15 guides, 7 CLUSTERS, guideBySlug/guidesByCluster/guideWordCount helpers, GuideBlock union)
- src/app/guides/page.tsx (hub, ItemList JSON-LD, GuideCard h3 structure)
- src/app/guides/[slug]/page.tsx (generateMetadata, Article + FAQPage + BreadcrumbList JSON-LD, Block renderer, byline)
- src/components/JsonLd.tsx (server-rendered ld+json emitter)
- src/components/ToolLayout.tsx (WebApplication + FAQPage + BreadcrumbList for /tools/[slug])
- src/app/tools/page.tsx (CollectionPage + ItemList + BreadcrumbList) and src/lib/tools.ts (metaTitle/metaDescription/keywords/faq per tool)
- src/components/Faq.tsx (home FAQPage) and src/app/page.tsx (ProfessionalService + WebSite orgJsonLd)
- src/app/work|services|pricing|contact/page.tsx (metadata + canonical, absence of JSON-LD/breadcrumbs)
- src/app/privacy/page.tsx and src/app/terms/page.tsx (canonical inheritance bug, missing from sitemap)
- src/app/demos/apex-fence/** including areas/[city], guides, guides/[slug], tools (noindex verification) and src/components/FenceSite.tsx (demo FAQPage)
- src/lib/content.ts (site.domain source of truth used to build all URLs)

**Quick wins (check these first)**

- Canonical bug: /privacy and /terms inherit the root layout's homepage canonical (src/app/layout.tsx alternates.canonical) because neither page.tsx sets its own alternates. Confirmed by reading both files.
- No og:image / twitter:image anywhere despite twitter.card=summary_large_image in layout.tsx; no opengraph-image file exists (only icon.png/apple-icon.png).
- Every one of the 15 guide meta descriptions in src/lib/guides.ts is 180 to 227 chars (past the ~160 display limit).
- 11 of 15 guide title tags exceed 60 chars after the Stackwrk suffix is appended in guides/[slug]/page.tsx.
- All 15 guides share identical date and updated (2026-07-16), so Article datePublished === dateModified and sitemap lastModified are uniform across the whole cluster.
- GuideBlock has no link variant, so in-body references to sibling guides and the /tools calculators are plain text, not Link components; only bottom related cards and Nav link internally.
- Article JSON-LD in guides/[slug]/page.tsx omits the recommended image field (and Guide type has no image field to supply one).
- /work, /services, /pricing, /contact emit zero JSON-LD (no BreadcrumbList site-wide, no Service/Offer on the commercial pages).
- BreadcrumbList 3rd item (g.title) does not match the visible breadcrumb 3rd crumb (cluster.name) in guides/[slug]/page.tsx.
- /privacy and /terms are indexable but missing from src/app/sitemap.ts.

**Checks**

- **[HIGH]** Canonical inheritance bug: /privacy and /terms inherit the root layout's global alternates.canonical and self-canonicalize to the homepage. Confirm src/app/layout.tsx sets alternates.canonical = 'https://stackwrk.com', then confirm src/app/privacy/page.tsx and src/app/terms/page.tsx define no alternates of their own.
  - How: Read layout.tsx metadata; grep 'alternates' in privacy/page.tsx and terms/page.tsx (none present). Then run next build and next start and curl -s http://localhost:3000/privacy and grep for canonical, same for /terms. Confirm rel=canonical resolves to https://stackwrk.com instead of the page's own URL.
  - Signal of a problem: The link rel=canonical on /privacy and /terms points to https://stackwrk.com (the homepage) rather than /privacy and /terms. Google treats both legal pages as duplicates of the homepage. This is also a latent footgun for any future page that forgets to set its own canonical.
- **[HIGH]** Global canonical footgun audit: enumerate every route and confirm each sets its own self-referential canonical rather than silently inheriting the layout homepage canonical.
  - How: Crawl the built site (curl each route or Screaming Frog) and extract rel=canonical per URL; cross-reference against the metadata exports (grep alternates across src/app all page.tsx and generateMetadata in guides/[slug] and tools/[slug]). Marketing pages set absolute canonicals, tool pages set relative (/tools, /tools/website-audit), guides set absolute BASE canonicals; the homepage correctly inherits.
  - Signal of a problem: Any indexable route whose emitted canonical does not equal its own URL. Beyond /privacy and /terms, watch for the homepage (should be https://stackwrk.com) and any page added later.
- **[MEDIUM]** Open Graph and Twitter image gap: layout.tsx declares twitter.card = 'summary_large_image' and OG type website, but no openGraph.images is set anywhere and there is no opengraph-image.(tsx|png). Confirm no route emits og:image, so social and some AI cards render imageless despite claiming a large-image card.
  - How: grep -rn for images: and opengraph-image across src/app and src/components (currently none); find src/app -iname opengraph-image (none). Curl a guide, the homepage, and a tool page and grep for og:image and twitter:image in the head.
  - Signal of a problem: No og:image / twitter:image meta on any page. Shares in Slack/LinkedIn/iMessage and AI answer cards show a blank or cropped-favicon preview. The summary_large_image card is a promise with no image behind it.
- **[MEDIUM]** Guide meta description length: all 15 guide descriptions in src/lib/guides.ts run 180 to 227 characters, well past the roughly 155 to 160 chars Google displays. These strings feed both the meta description and the OG description in generateMetadata.
  - How: Node script over the GUIDES array measuring description.length (already measured: every one exceeds 160, longest 227). Confirm in rendered head via curl. Cross-check the hub excerpt reuses the same long strings.
  - Signal of a problem: Descriptions truncated mid-sentence in SERPs, weaker click-through, and the tail of each description (often the value prop or CTA hook) never shown.
- **[MEDIUM]** Guide title-tag length: 11 of 15 guide title tags exceed 60 characters once generateMetadata appends the Stackwrk suffix (up to 72 chars, e.g. Outgrew Jobber or Housecall Pro? Your Options When It's Rigid | Stackwrk). Google truncates around 60 chars / 600px.
  - How: Node script computing (metaTitle or title).length plus the suffix length for each guide (already measured). Verify the assembled title in guides/[slug]/page.tsx generateMetadata line 32.
  - Signal of a problem: Titles truncated in SERPs and AI citations, the brand suffix or the differentiating tail clipped, and near-identical truncations across the cluster.
- **[MEDIUM]** In-body contextual internal linking is absent across the /guides cluster. The GuideBlock union in src/lib/guides.ts has no link/anchor variant, so every in-prose reference to a sibling guide or a tool (for example 'the guide on when custom software beats subscriptions', 'the SaaS vs custom calculator', 'custom CRM for fencing') renders as plain text in the Block component, not as a Link. The only real internal links are the bottom related cards and the global Nav.
  - How: Read the Block renderer in guides/[slug]/page.tsx (p blocks output raw text, no anchors). grep the guide body prose for phrases that name other guides/tools and confirm none are hyperlinked. Build an internal-link map: for each guide count inbound and outbound contextual links versus related-card links.
  - Signal of a problem: Guides that mention sibling guides and the /tools calculators in prose but pass no link equity to them. Hub-and-spoke authority (promised in the guides.ts header comment) is not actually delivered in-content, which is where link weight matters most for cluster ranking and for AI engines following citations.
- **[MEDIUM]** Guide-to-tool and tool-to-guide cross-cluster linking: guides reference the SaaS vs Custom, ROI, and Website Audit calculators but never link to /tools/[slug], and ToolLayout.tsx and the tool FAQs never link back to the relevant guide.
  - How: grep guide prose and CTAs for tool names; grep src/components/ToolLayout.tsx and src/lib/tools.ts for /guides. Confirm zero cross-links exist today.
  - Signal of a problem: Two commercially aligned clusters (guides and free tools) that never pass authority or user flow to each other, leaving conversion paths and topical relevance on the table.
- **[MEDIUM]** Article JSON-LD completeness in guides/[slug]/page.tsx: the articleLd object (lines ~173-187) omits the image property that Google's Article structured-data guidance expects, and there is no per-guide image field in the Guide type to supply one.
  - How: Read articleLd construction; run a representative guide URL through Google Rich Results Test and note the image warning. Confirm the Guide type in guides.ts has no image field.
  - Signal of a problem: Rich Results Test reports a missing recommended image field on every guide Article. Reduced eligibility for article rich treatment and weaker entity signal.
- **[MEDIUM]** Marketing pages emit no structured data: /work, /services, /pricing, /contact contain no JSON-LD at all (no BreadcrumbList, no Service/Offer on /services or /pricing, no ContactPoint on /contact).
  - How: grep -c for JsonLd or application/ld in each of the four page.tsx files (currently 0). Compare to the ProfessionalService+WebSite on the homepage and the WebApplication on tool pages. Assess adding BreadcrumbList site-wide and Service/OfferCatalog on /services and /pricing.
  - Signal of a problem: Commercial-intent pages (/services, /pricing) with zero structured data, no breadcrumb schema, and no Service/Offer entities for search or AI engines to parse, unlike the tool and guide pages.
- **[MEDIUM]** AIO citability per guide: confirm each guide's takeaways (The short answer) block plus the first FAQ answer directly and self-containedly answer the declared targetQuery, lead with the answer, and contain concrete numbers, so an AI engine can lift a quotable passage.
  - How: For each guide, place its targetQuery beside its takeaways and FAQ answers; check the answer is self-contained (no as mentioned above / see below), leads with the answer, and includes specifics (dollar figures, seat counts, intervals). Optionally query the actual targetQuery in ChatGPT, Perplexity, and Google AI Overviews and record whether Stackwrk content is surfaced or citable.
  - Signal of a problem: A guide whose takeaways/FAQ hedge, bury the answer, reference other sections, or lack concrete numbers, so no clean quotable snippet exists for AI answer engines to cite.
- **[MEDIUM]** Noindex enforcement on all non-canonical / demo / transactional routes: confirm robots index:false,follow:false is actually rendered (not just declared) on /demos/apex-fence, /demos/apex-fence/areas/[city], /demos/apex-fence/guides, /demos/apex-fence/guides/[slug], /demos/apex-fence/tools, /mockup, /mockup/preview, /agreement, /agreement/paid, /crm, /prospects, /quote.
  - How: Curl each route from the built app and grep for meta name=robots content=noindex. The metadata exports declare it; confirm it survives to the rendered head (dynamic routes via generateMetadata included).
  - Signal of a problem: Any demo, mockup, or transactional page missing the noindex meta in the rendered HTML, which would let a client-facing demo or a private CRM route get indexed and compete with or embarrass the real site.
- **[LOW]** Content freshness / mass-publish signal: every guide in src/lib/guides.ts has date === updated === 2026-07-16 (today), so all Article JSON-LD emits datePublished === dateModified on the same day for all 15 pages, and sitemap.ts lastModified is identical for the whole cluster.
  - How: Node script collecting distinct date and updated values (already confirmed: single value across all 15). Inspect articleLd.datePublished/dateModified in guides/[slug]/page.tsx and the guide entries in sitemap.ts.
  - Signal of a problem: A cluster that looks bulk-generated on one day with no genuine revision history. Weakens freshness and E-E-A-T signals and means updated conveys nothing. Real staggered publish/review dates would read as an evolving, maintained library.
- **[LOW]** Author entity mismatch and E-E-A-T: articleLd author and publisher are both Organization Stackwrk, but the visible byline in guides/[slug]/page.tsx (around line 303) reads Written by Tal, founder of Stackwrk. A Person author with credentials strengthens E-E-A-T for AI answer engines.
  - How: Compare articleLd.author (@type Organization) against the on-page byline text. Decide whether a Person author (name Tal, worksFor Stackwrk) should be modeled in schema and surfaced consistently.
  - Signal of a problem: Structured author is a faceless Organization while the page claims a named human expert. The expertise signal that helps AI engines trust and attribute the content is not machine-readable.
- **[LOW]** BreadcrumbList vs visible breadcrumb consistency in guides/[slug]/page.tsx: the JSON-LD breadcrumb 3rd item uses g.title (line ~205) while the visible breadcrumb nav renders cluster.name as the 3rd crumb (line ~224). Google expects structured breadcrumbs to match the visible ones.
  - How: Diff the breadcrumbLd itemListElement names against the rendered nav aria-label Breadcrumb text. Run Rich Results Test breadcrumb check.
  - Signal of a problem: Structured breadcrumb trail (Home / Guides / full title) does not match the visible trail (Home / Guides / cluster name), a validation warning and a mismatch AI/search may flag or ignore.
- **[LOW]** FAQPage schema strategy across the site: FAQPage JSON-LD is emitted on the homepage (Faq.tsx), every tool page (ToolLayout.tsx), every guide (guides/[slug]/page.tsx), and the demo (FenceSite.tsx). Verify each page has at most one FAQPage, that schema answer text matches the visible answer verbatim, and note that Google restricted FAQ rich results to gov/health sites in 2023 (still valuable for AIO, but no SERP accordion should be expected).
  - How: Per page, confirm exactly one FAQPage script; diff schema mainEntity acceptedAnswer.text against the visible details text (both derive from the same source arrays, so confirm no divergence and no HTML in the answer strings). Validate via Rich Results Test.
  - Signal of a problem: Two competing FAQPage blocks on one page, schema answer text drifting from visible text, or HTML/markup leaking into acceptedAnswer.text. Also a strategy note if FAQ rich-result expectations are set incorrectly.
- **[LOW]** Heading structure and semantic hierarchy per route: confirm exactly one h1 per page and a logical h2/h3 order. Verified single h1 on /work, /services, /pricing, /contact, /tools, guide articles (g.title), tool pages (tool.h1), and the homepage (Hero.tsx line 115).
  - How: Crawl and count h1 per URL; for guides confirm the Block renderer never emits a second h1 (it uses h2/h3 only) and that h3 blocks never appear before their parent h2. Check the CTA/related sections do not introduce stray h1s.
  - Signal of a problem: Any page with zero or multiple h1s, or h3 content preceding an h2, which muddies the outline search and AI engines use to segment content.
- **[LOW]** Sitemap completeness and accuracy in src/app/sitemap.ts: confirm it lists all indexable routes and excludes noindex/internal ones. It currently lists /, /work, /services, /pricing, /guides, /contact, /tools, the 3 tool slugs, and all 15 guide slugs, but omits the indexable /privacy and /terms; the empty ai cluster is fine. Also review lastModified on static routes using new Date() (build time, churns every deploy).
  - How: Read sitemap.ts; diff its URL set against the full route list and against robots disallow. Fetch /sitemap.xml from the built app and validate. Check whether /privacy and /terms should be included and whether static-route lastModified should be pinned rather than build-time.
  - Signal of a problem: Indexable pages (/privacy, /terms) absent from the sitemap, or lastModified values that reset to the build timestamp every deploy and erode Google's trust in the signal.
- **[LOW]** robots.ts correctness and crawl budget: confirm disallow list [/crm,/quote,/prospects,/mockup,/agreement] covers all private/noindex internal routes, that the sitemap URL is correct, and decide whether the noindex /demos/apex-fence tree (crawlable today) should be disallowed to save crawl budget. Note the non-standard host field.
  - How: Read robots.ts; fetch /robots.txt; cross-check every route with robots index:false (demos, mockup/preview, agreement/paid, crm, prospects, quote, agreement) against the disallow list. Verify /mockup prefix also blocks /mockup/preview.
  - Signal of a problem: A private route that is crawlable and not disallowed, or crawl budget spent on the large noindex demo tree (per-city pages under areas/[city]) that will never be indexed.
- **[LOW]** URL and domain consistency: all URLs are built from site.domain (stackwrk.com in src/lib/content.ts) and metadataBase (https://stackwrk.com in layout.tsx). Confirm they agree everywhere and that canonical style (absolute vs relative) resolves identically. Marketing pages use absolute canonicals, tool pages use relative (/tools), guides use absolute BASE.
  - How: grep for hardcoded stackwrk.com vs site.domain usage; confirm metadataBase resolves the relative tool canonicals to https://stackwrk.com/tools/... Curl and compare resolved canonicals for a tool page (relative) and a work page (absolute).
  - Signal of a problem: A hardcoded URL that diverges from site.domain, or a relative canonical that resolves to the wrong origin (localhost/preview) if metadataBase were ever wrong. Mixed styles are not a bug but should be normalized.
- **[LOW]** generateMetadata not-found handling for /guides/[slug] and /demos/apex-fence/{areas,guides}/[slug]: confirm unknown slugs 404 (notFound()) rather than rendering a thin indexable page, and that the not-found metadata does not accidentally emit an indexable title.
  - How: Read generateMetadata and component in guides/[slug]/page.tsx (returns title Guide not found but the component calls notFound() which 404s) and the two demo dynamic routes. Request a bogus slug from the built app and confirm HTTP 404 plus noindex behavior.
  - Signal of a problem: A soft-404: an unknown slug returning HTTP 200 with a not found title that is still indexable, creating low-value pages.
- **[LOW]** JSON-LD emitter safety and validity in src/components/JsonLd.tsx: it JSON.stringifies trusted data into a script via dangerouslySetInnerHTML. Confirm no page passes user-derived content, and that every emitted object includes @context and a valid @type and parses as valid JSON-LD.
  - How: Run each page's rendered ld+json through the schema.org validator and Google Rich Results Test. Confirm all data sources are static (guides.ts, tools.ts, content.ts, fence-config.ts) and none inject unescaped user input.
  - Signal of a problem: A JSON-LD block missing @context/@type, failing validation, or (worse) any dynamic user text reaching the stringified script, which would be both an SEO error and an XSS risk.
- **[LOW]** Reading-time and word-count sanity for guides: guideWordCount() exists in guides.ts but confirm each guide's readMins roughly matches its actual word count and that guides are substantial enough (not thin) to be citable authority pages.
  - How: Run guideWordCount over GUIDES and compare against the stated readMins (5 to 6 min). Flag any guide whose body is materially thinner than peers or whose readMins is misleading.
  - Signal of a problem: A guide claiming 6 min read with a fraction of the words, or a guide thin enough to read as filler rather than the best answer to its targetQuery.

**Tooling**

- next build then next start, then curl each route and grep the rendered head for title, meta description, rel=canonical, meta robots, og:*, twitter:*, and ld+json (the reliable way to see merged metadata, since layout+page metadata is only resolved at render)
- Google Rich Results Test and the schema.org validator for every emitted @type (ProfessionalService, WebSite, Article, FAQPage, BreadcrumbList, WebApplication, CollectionPage, ItemList, LocalBusiness)
- A crawler (Screaming Frog or a small Node/fetch script) to build the per-route scorecard: title/description length, canonical, h1 count, indexability, JSON-LD types, OG image presence
- A Node script iterating the GUIDES and freeTools arrays to measure title/description lengths, validate every related[] slug resolves (already confirmed all resolve), check date/updated spread, and run guideWordCount vs readMins
- Google Search Console (URL Inspection + Coverage + Sitemaps) once deployed, to confirm canonical resolution and index status on the live site
- Lighthouse SEO category (or the repo's own /tools/website-audit AuditTool) run against key routes for a baseline SEO score
- Manual AIO spot-check: run each guide's targetQuery in ChatGPT, Perplexity, and Google AI Overviews and record whether Stackwrk content is surfaced or citable
- view-source and a diff script to confirm each JSON-LD acceptedAnswer.text matches the visible FAQ details text verbatim

**Deliverable.** A per-route SEO/AIO scorecard plus a prioritized fix list. Concretely: (1) a table of every public route (/, /work, /services, /pricing, /contact, /tools, /tools/[3 slugs], /guides, /guides/[15 slugs], /privacy, /terms) with columns: rendered <title> and length, meta description and length, resolved canonical URL, robots directive, indexable Y/N, count of h1 tags, JSON-LD @types present, and OG image present Y/N, generated by crawling the built output. (2) A JSON-LD validation report: every emitted @type (ProfessionalService, WebSite, Article, FAQPage, BreadcrumbList, WebApplication, CollectionPage, ItemList, LocalBusiness) run through Google Rich Results Test and the schema.org validator, with pass/warn/error per page. (3) A ranked findings list, each with file:line, severity, and a one-line fix (no code changes performed). (4) An internal-linking map of the /guides cluster showing hub, spoke, related-card, and in-body contextual links, flagging orphaned or under-linked guides and missing guide-to-tool links. (5) An AIO citability verdict per guide: does the takeaways block plus FAQ answer the declared targetQuery in a self-contained, quotable way. Every finding must cite real files/lines from this repo, and the output must contain no em dashes or en dashes.

---

### 10. Accessibility (WCAG 2.2 AA)  (P1)

**Objective.** Verify that the public Stackwrk marketing site and the internal CRM meet WCAG 2.2 AA, given the design bets that create the most risk: a very dark theme (#070312 body) with heavy use of low-opacity white text (text-white/30 to /55), a single electric-lime accent (#CBFF3C), custom-built modals and drawers (AuditPopup, MockupModal, Board.tsx), a JS-driven mobile menu, self-managed focus, and pervasive motion (parallax, marquee, float, count-up, custom cursor). The site is the primary lead-generation funnel (entry popup, mockup modal, contact and audit forms), so accessibility failures on those paths directly cost conversions and create ADA exposure for a business that sells websites to other businesses. The audit confirms which of the existing a11y scaffolding (skip link, global :focus-visible ring, reduced-motion cap, sr-only labels) actually holds up in practice and pins down the concrete failures by file and line, without changing any code.

**Scope**

- src/app/layout.tsx (skip link, lang, main#main landmark, viewport colorScheme)
- src/app/globals.css (:focus-visible ring lines 91-95, skip-link lines 98-105, reduced-motion block lines 118-130, crm-* theme tokens lines 138-150, btn-primary/btn-ghost/btn-dark focus styles lines 162-206)
- tailwind.config.ts (ink/lime/violet/flare palette, keyframes and animation registry)
- Public routes: / (home), /work, /services, /pricing, /contact, /guides and /guides/[slug], /tools plus /tools/website-audit, /tools/roi-calculator, /tools/saas-vs-custom-calculator, /privacy, /terms, /quote, /mockup, /agreement
- Demo site: /demos/apex-fence and /demos/apex-fence/areas/[city]
- Internal CRM: /prospects (src/app/prospects/Board.tsx, TodayDriver.tsx, CallConsole.tsx, Gate.tsx) and /crm (src/components/CrmBoard.tsx)
- Nav and chrome: src/components/Nav.tsx (mobile menu), Footer.tsx, ScrollToTop.tsx, ScrollProgress.tsx, StickyCTA.tsx, IndustryGreeting.tsx, CustomCursor.tsx
- Modals and overlays: src/components/AuditPopup.tsx, MockupModal.tsx, and the Board.tsx drawer/import/add dialogs (lines 555-806)
- Forms: src/components/AuditForm.tsx, AuditTool.tsx, QuoteBuilder.tsx, CrmBoard.tsx access-key form, Board.tsx add/edit inputs
- Interactive widgets: RoiCalculator.tsx, SaasVsCustomCalculator.tsx, FenceEstimator.tsx, src/components/tools/*.tsx (range sliders), DemoShowcase.tsx (custom before/after slider role=slider and chatbot), Faq.tsx and FenceSite.tsx FAQ (details/summary)
- Media and icons: HeroMedia.tsx, HeroVisual.tsx, HeroWaves.tsx, FeaturedProjects.tsx, FenceSite.tsx images, FinalCTA/HowItWorks fox art, src/components/icons.tsx (32 inline SVGs)

**Quick wins (check these first)**

- Low-opacity white text below the AA threshold is used site-wide: text-white/30 (2.53:1), text-white/35 (3.07:1), text-white/40 (3.72:1) and text-white/45 (4.44:1) all fail 4.5:1 for normal text. Grep src for these classes first: they appear in Footer, guides/[slug] and ToolLayout breadcrumbs (white/40), RoiCalculator disclaimers and AuditForm 'No spam' microcopy (white/35), CrmBoard timestamps and Board card meta (white/30, white/45).
- AuditPopup.tsx (the entry popup every visitor sees) is role=dialog aria-modal but has NO Escape handler, NO focus trap, NO initial focus, NO focus restore, and does NOT lock body scroll, unlike MockupModal.tsx which at least handles Escape and scroll-lock. This is on the primary conversion path.
- AuditPopup.tsx inputs (lines 144-146: website, name, email) and the CrmBoard access-key input are placeholder-only with no associated <label> or aria-label, failing 1.3.1/3.3.2/4.1.2 (contrast with AuditForm.tsx which correctly uses sr-only label spans).
- All text inputs use the shared 'field' class with outline-none plus focus:border-lime/60, so keyboard focus is signalled only by a thin border color change (the global :focus-visible 2px lime ring is overridden by the utility outline-none). Check whether that meets 2.4.7 visible focus.
- Nav.tsx mobile menu collapses with max-h-0 overflow-hidden but the links stay in the DOM and in tab order (not display:none, hidden, or inert), so a keyboard user on a narrow viewport tabs into invisible links; the toggle also has aria-expanded but no aria-controls pointing at the menu.
- Board.tsx CRM drawer (line 560) and the import (759) and add-lead (774) overlays are plain divs with fixed inset-0 and onClick-backdrop close: no role=dialog, no aria-modal, no Escape key, no focus trap, and the toast at line 806 has no aria-live so status changes are silent to screen readers.
- CRM crm-subtle token fails in both themes (slate-400 on white = 2.56:1 light, slate-500 on #0b0f14 = 4.04:1 dark) and is used for counts, timestamps, and empty-column markers in Board.tsx.

**Checks**

- **[CRITICAL]** Contrast of every low-opacity white text token against the true composited background. Enumerate actual usages of text-white/30, /35, /40, /45, /55, /60, /65 and placeholder-white/35 across src, composite the alpha over body #070312 (and over card bg white/[0.02] which is effectively still near-black), and compare to 4.5:1 (normal) and 3.0:1 (large >=18.66px bold or 24px).
  - How: Grep src for the class strings, feed the tailwind tokens into the luminance script, cross-check flagged nodes with axe rule color-contrast on each route.
  - Signal of a problem: Any normal-size body/meta text computing below 4.5:1: confirmed failers today are white/30 (2.53), white/35 (3.07), white/40 (3.72), white/45 (4.44). Report each with file:line and the SC 1.4.3 reference.
- **[HIGH]** Placeholder-only text used as the sole visible label, and placeholder contrast. AuditPopup.tsx inputs (lines 144-146) and CrmBoard.tsx access-key input rely on placeholder text with no <label>, aria-label, or aria-labelledby.
  - How: axe rule label plus manual VoiceOver/NVDA form-field walk; grep for placeholder= on inputs that lack an adjacent label or sr-only span.
  - Signal of a problem: Screen reader announces an unlabeled edit field, or the only name disappears on input; placeholder-white/35 (3.07:1) also fails as text. Violates 1.3.1, 3.3.2, 4.1.2.
- **[HIGH]** Keyboard focus visibility on text inputs and selects. The shared 'field' class and crm-input use outline-none with only a focus:border color change; the global :focus-visible 2px lime outline in globals.css is overridden by the utility layer.
  - How: Tab through each form with a keyboard only, screenshot the focused state, verify the focus indicator meets a perceivable change; inspect computed outline in DevTools.
  - Signal of a problem: Focused input shows no ring, only a subtle white/10 to lime/60 border shift that is hard to perceive, especially at the same time as :focus for mouse users. Violates 2.4.7.
- **[HIGH]** AuditPopup.tsx modal semantics and focus management. It sets role=dialog aria-modal aria-label but implements no Escape close, no focus trap, no initial focus into the dialog, no focus restore on close, and no body scroll lock.
  - How: Open the popup (waits 2.5s), test Escape, Tab past the last control to confirm focus escapes to the page behind, and confirm background scroll; compare against MockupModal.tsx behavior.
  - Signal of a problem: Escape does nothing, Tab moves focus to nav/page content behind the overlay, focus is not placed in the dialog on open, and focus is lost to <body> on close. Violates 2.1.2, 2.4.3, and the aria-modal contract.
- **[HIGH]** Nav.tsx mobile menu keyboard behavior. The collapsed menu uses max-h-0 overflow-hidden (not display:none/hidden/inert), so its links remain focusable and in tab order while visually hidden on narrow viewports; the toggle has aria-expanded but no aria-controls.
  - How: At a mobile width, Tab from the logo and watch focus; confirm collapsed links receive focus while invisible; inspect the toggle button attributes.
  - Signal of a problem: Keyboard focus lands on off-screen menu links when the menu is closed, and the toggle does not programmatically reference the menu it controls. Violates 2.4.3, 4.1.2.
- **[MEDIUM]** MockupModal.tsx focus management completeness. It correctly handles Escape and locks body scroll but does not trap focus, set initial focus, or restore focus to the #mockup trigger on close.
  - How: Open via a #mockup link, Tab through, confirm focus can leave the dialog, and confirm focus after close returns to the triggering CTA or is lost.
  - Signal of a problem: Focus tabs out of the dialog into hidden page content, or lands on <body> after close instead of the invoking link. Violates 2.4.3.
- **[MEDIUM]** CRM Board.tsx drawer and modal accessibility (detail drawer line 560, import overlay 759, add-lead overlay 774). None declare role=dialog or aria-modal, none close on Escape, none trap focus, and each closes only via a backdrop onClick or a text-glyph button.
  - How: Open each surface in /prospects, test Escape, Tab traversal, and screen-reader announcement of the dialog; check the close control has an accessible name.
  - Signal of a problem: Screen reader treats the overlay as ordinary content, Escape fails, focus roams behind the drawer, and the close control is announced only as the raw glyph. Violates 2.1.2, 4.1.2. Lower weight because /prospects is noindex and internal.
- **[MEDIUM]** Status and loading announcements. CrmBoard loading spinner ('Loading pipeline'), Board.tsx toast (line 806), email-hunt progress button, and AuditForm/AuditTool async success states are not wrapped in role=status or aria-live regions (only the error <p> uses role=alert).
  - How: Trigger each async flow with a screen reader running; verify whether the change is announced.
  - Signal of a problem: Submitting a form, opening the CRM, or firing a toast produces a silent visual-only change; SR users get no feedback. Violates 4.1.3.
- **[MEDIUM]** Reduced-motion coverage beyond the global CSS cap. globals.css caps animation/transition duration under prefers-reduced-motion and CustomCursor.tsx bails out, but JS-driven motion (CountUp.tsx, AuditTool ScoreRing count-up, DemoShowcase, ScrollParallax.tsx, Reveal.tsx, HeroWaves.tsx, marquee/FenceTicker) may animate via rAF or transforms not governed by animation-duration.
  - How: Enable prefers-reduced-motion in DevTools, load home, /tools, /work, and the demo, and watch for parallax, count-up, marquee, wave, and reveal motion that still runs; grep those components for a matchMedia('(prefers-reduced-motion)') guard.
  - Signal of a problem: Any looping or scroll-triggered motion continues under reduced-motion (rAF loops and JS transforms ignore the CSS duration cap). Violates 2.3.3 (AAA) and the spirit of 2.2.2 for the marquee/ticker which auto-scrolls.
- **[MEDIUM]** Auto-moving content controls (2.2.2). The marquee animation and FenceTicker.tsx auto-scroll for more than 5 seconds with no pause/stop control.
  - How: Load pages using marquee/FenceTicker, confirm continuous auto-motion and absence of a pause affordance, and confirm it stops under reduced-motion.
  - Signal of a problem: Content scrolls indefinitely with no user pause and (if the CSS cap does not apply) keeps moving under reduced-motion. Violates 2.2.2.
- **[MEDIUM]** Decorative vs meaningful image alt text. Confirm fox art and background images use alt="" (HeroMedia lines 39/70, FinalCTA, HowItWorks, services/work/tools/pricing fox images already do) and that meaningful images carry descriptive alt (FeaturedProjects.tsx line 33 uses `${project.name} website`, FenceSite gallery uses captions, but FenceSite.tsx line 111 hero and demos/apex-fence city hero use alt="").
  - How: axe rules image-alt and role-img-alt per route, plus manual review of each <img> flagged by the earlier grep (32 files) for correct decorative-vs-informative classification.
  - Signal of a problem: A meaningful demo hero or content image exposes alt="" (invisible to SR) or a decorative fox exposes redundant alt text. Violates 1.1.1.
- **[MEDIUM]** CRM theme token contrast in both light and dark. crm-muted (slate-500 light, slate-400 dark) and crm-subtle (slate-400 light, slate-500 dark) defined in globals.css lines 147-148, plus crm-input placeholders (slate-400/500).
  - How: Run the luminance script on the crm-* slate pairs over crm-page backgrounds in both themes; spot-check with axe on /prospects in day and night mode.
  - Signal of a problem: crm-subtle fails both themes (2.56:1 light, 4.04:1 dark) and placeholder slate tones fail; used for counts, timestamps, and empty markers in Board.tsx. Violates 1.4.3. Internal tool, lower business weight.
- **[MEDIUM]** Focus not obscured by the sticky/hiding chrome (WCAG 2.2 new SC 2.4.11). Nav.tsx is a fixed header that hides on scroll-down and reveals on scroll-up; StickyCTA and ScrollToTop are fixed. A focused element scrolled under the fixed nav may be fully hidden.
  - How: Keyboard-tab down a long page (home, /guides/[slug]) and watch whether the focused control is ever covered by the fixed header or sticky CTA; note scroll-padding-top:68px only helps anchor jumps, not Tab focus.
  - Signal of a problem: A focused link/button sits behind the fixed nav or sticky CTA and is not at least partially visible. Violates 2.4.11 (AA, new in 2.2).
- **[MEDIUM]** Landmark, heading, and language structure per route. Confirm one <h1> per page and no skipped heading levels, that main#main wraps content on every route, that nav/header/footer landmarks are present, and that html lang is set (layout.tsx sets lang=en; verify demo and dynamic routes do not override or omit).
  - How: axe rules heading-order, landmark-one-main, page-has-heading-one, html-has-lang per route; manual heading-outline review on /pricing, /services, /guides/[slug], /work.
  - Signal of a problem: A page has no h1 or jumps h2 to h4, content sits outside a main landmark, or a route lacks a lang attribute. Violates 1.3.1, 2.4.6, 3.1.1.
- **[MEDIUM]** Non-text UI contrast for borders, inputs, and focus (1.4.11). Input borders (border-white/10, /12), card edges (white/[0.08]), and the disabled submit state (opacity-60/70) must meet 3:1 against adjacent colors.
  - How: Contrast script on the border tokens over the dark background and over card fills; visually verify the boundary of inputs and buttons is perceivable, including disabled states.
  - Signal of a problem: Input/card borders compute below 3:1 (white/10 over near-black is very faint), making field boundaries and the focus border imperceptible. Violates 1.4.11.
- **[LOW]** Inline SVG icon accessibility. src/components/icons.tsx (32 icons) render bare <svg> with no aria-hidden and no title. Icons paired with visible text are fine, but standalone icon-only controls need an accessible name.
  - How: Inspect icon-only buttons/links (ScrollToTop has aria-label, Footer social links have aria-label, IndustryGreeting dismiss has aria-label) and confirm none render a naked icon as the sole content without a label; verify decorative icons are hidden from the tree.
  - Signal of a problem: An icon-only control is announced as 'button' with no name, or a decorative icon adds noise to the accessibility tree. Violates 1.1.1, 4.1.2.
- **[LOW]** details/summary FAQ operability. Faq.tsx and the FenceSite FAQ use native <details>/<summary> with list-none and a '+' marker span. Confirm keyboard operability (Enter/Space toggles), that the '+' indicator is not the sole state cue for SR users, and that removing the default marker did not break the disclosure role.
  - How: Keyboard-toggle each accordion, verify SR announces expanded/collapsed via the native details semantics, and confirm focus-visible ring shows on the summary.
  - Signal of a problem: Summary not focusable or not toggling by keyboard, or state conveyed only by the rotating '+' glyph with no programmatic expanded state. Violates 1.3.1, 2.1.1, 4.1.2.
- **[LOW]** Range slider and custom slider accessibility. RoiCalculator, SaasVsCustomCalculator, FenceEstimator, and tools/*.tsx use native input type=range wrapped in <label> (good), while DemoShowcase.tsx before/after uses a custom role=slider with aria-valuenow/min/max and onKeyDown. Verify every slider has an accessible name and keyboard operability, and that the native ranges expose their current value.
  - How: Tab to each slider, operate with arrow keys, and inspect the accessibility name/value in the tree; confirm the DemoShowcase custom slider announces value and label.
  - Signal of a problem: A slider has no accessible name (native range label association broken) or the custom slider cannot be operated by keyboard or omits value. Violates 1.3.1, 2.1.1, 4.1.2.
- **[LOW]** Accent and state-color contrast. Verify violet-400 eyebrow text (.eyebrow, text-violet-400, ~4.81:1, passes but tight at text-xs), rose-300/fuchsia-300 error text, amber-300/amber-400 warn states in AuditTool, and lime-on-lime scenarios all meet AA, and that status is never conveyed by color alone.
  - How: Contrast script on each accent over its real background; review AuditTool.tsx check pills (pass/warn/fail already pair a glyph with color) and scorecard bars (numeric value shown alongside color) for redundant non-color cues.
  - Signal of a problem: An accent text token dips below 4.5:1, or a state (pass/warn/fail, tier chips in Board.tsx) is distinguishable only by color. Violates 1.4.1, 1.4.3.
- **[LOW]** Target size (WCAG 2.2 new SC 2.5.8, 24x24 CSS px). Audit small controls: Board.tsx tier/tag chips and glyph buttons at text-[0.55rem], the refresh/close ✕ glyph buttons, and any inline icon links.
  - How: Measure rendered hit areas in DevTools for the smallest interactive elements in Board.tsx, Nav, and the modals; flag anything under 24x24 without adequate spacing or an inline-text exception.
  - Signal of a problem: Interactive chips or glyph buttons render below 24x24 CSS px with insufficient spacing and no exception. Violates 2.5.8.
- **[LOW]** Forced-colors and prefers-contrast resilience. The theme leans on translucent borders (white/[0.06] to /12), backdrop-blur glass, and glow shadows for structure; none of these survive Windows High Contrast / forced-colors mode.
  - How: Enable forced-colors: active and prefers-contrast: more in DevTools on home, /contact form, and /prospects; check that buttons, cards, inputs, and focus remain distinguishable.
  - Signal of a problem: Card and button edges vanish, ghost buttons become invisible, or focus is lost in forced-colors mode. Relates to 1.4.11 (non-text contrast) and 1.4.3.

**Tooling**

- @axe-core/playwright driven against a local next dev or next build server, one automated scan per in-scope route, capturing violation nodes and WCAG tags (Playwright is already a devDependency)
- Lighthouse accessibility category (CLI or Chrome DevTools) per key route for a Lighthouse-grade score, matching the project's stated audit bar
- Playwright keyboard scripts: page.keyboard.press('Tab') traversal to dump focus order and detect focus reaching hidden/collapsed elements, Escape-to-close assertions on AuditPopup/MockupModal/Board dialogs, and focus-restore assertions after close
- A small Node script that reads the actual utility classes and tailwind.config.ts tokens and computes WCAG contrast ratios (relative luminance) for every composited white-alpha-over-#070312 pair and the crm-* slate pairs, so numbers are grounded not eyeballed
- Chrome DevTools: Rendering pane to emulate prefers-reduced-motion, prefers-contrast, and forced-colors (Windows High Contrast); Accessibility tree pane to inspect roles/names; CSS Overview for contrast sweep
- Screen reader manual pass: VoiceOver + Safari (matches the -apple-system font stack) and NVDA + Firefox, focused on the entry popup, mockup modal, CRM drawer, forms, and details/summary FAQ
- eslint-plugin-jsx-a11y run through next lint (not currently installed, add for the audit) to statically catch missing labels, alt, and role misuse
- WebAIM contrast checker as a manual spot-check backstop for the flagged token pairs

**Deliverable.** A per-route accessibility findings report covering every route in scope. For each route: (1) axe-core violation list and Lighthouse accessibility score with the raw JSON attached, (2) a violations table with columns WCAG 2.2 success criterion, severity, exact file and line reference, the failing selector or component, and a one-line description of the failure (no fix code, remediation is a separate task). Plus three cross-cutting artifacts: (a) a color-contrast token table listing every text/background pair actually used (white/30, /35, /40, /45, /55, /60, violet-400 eyebrow, rose-300, amber-300, lime, and the CRM crm-muted/crm-subtle tokens in both light and dark) with its computed ratio, pass/fail against 4.5 normal and 3.0 large, and where it appears; (b) a keyboard-and-screen-reader manual test log (Tab order per page, skip link, mobile menu, all four modal/drawer surfaces, sliders, details/summary) recording what a keyboard-only and a VoiceOver/NVDA user actually experiences; (c) a prioritized remediation backlog grouped critical/high/medium/low with the count of routes each issue touches. Deliver as a single markdown report in scratchpad, no source files modified.

---

### 11. Code Quality & Maintainability  (P1)

**Objective.** Verify that the Stackwrk codebase stays safe to change by one solo maintainer as it broadens past fence contractors. Concretely: confirm TypeScript strictness is not quietly defeated by `as` casts on untrusted payloads, that API routes and fetches handle errors consistently and do not silently swallow real failures, that the shared src/lib helpers are actually shared (not copy-pasted 4 to 6 times) and single-sourced, that dead and duplicated features (the two parallel CRMs) are identified, that magic values and pricing are centralized, and that the highest-risk pure logic (phone classification, CSV parsing, dedup, email hunt, auth token signing, webhook signature verification, SSRF guards, audit scoring) is protected by tests. This matters here because the app is production (main auto-deploys to Vercel), has zero automated tests, has no working linter, and carries real money and PII paths (Stripe checkout, signed agreements, lead PII in Supabase, Quo contact sync).

**Scope**

- src/app/prospects/Board.tsx (809 lines: parseCSV, rowsToProspects, doImport dedup, exportInstantlyCSV dedup, findMissingEmails concurrency, debounced PUT save, maskProspect)
- src/lib/prospects.ts (phoneCheck, phoneDigits, PROSPECT_STAGES, TEMPLATES, CALL_SCRIPT, STAGE_LABEL)
- src/lib/crm.ts + src/components/CrmBoard.tsx + src/app/crm/page.tsx (the second, parallel CRM on the leads table)
- src/lib/crm-auth.ts (makeToken/verifyToken HMAC sessions)
- src/lib/quo.ts (webhook verify, contact upsert, fetchCallHistory, unused fetchCallTranscript/fetchCallSummary)
- src/lib/safe-fetch.ts (isPrivateIp, isBlockedHost, normalizeUrl, guardedFetch, readBodyCapped)
- src/lib/email.ts (reportFromEmail, sendEmail)
- src/lib/pricing.ts (priceItems vs carePlans price duplication, money)
- src/lib/agreement.ts + src/lib/agreement-email.ts + src/lib/audit-report.ts (esc, money copies)
- src/app/api/audit/route.ts (357 lines, scoring weights/caps)
- src/app/api/leads/route.ts (divergent x-crm-key/query-string auth)
- src/app/api/leads/find-email/route.ts
- src/app/api/quo/webhook/route.ts + src/app/api/webhooks/stripe/route.ts (untyped payload casts)
- src/app/api/team/route.ts, team/audits, team/quo-calls, team/seed, team-login, sign, book, checkout, quo/contacts (auth + error-shape consistency)
- src/components RoiCalculator.tsx + SaasVsCustomCalculator.tsx + DemoShowcase.tsx + FenceEstimator.tsx (money duplication)
- package.json + tsconfig.json + repo root (missing ESLint config, no test runner)

**Quick wins (check these first)**

- `npm run lint` is effectively dead: there is no .eslintrc / eslint.config.* anywhere, so `next lint` drops into an interactive 'How would you like to configure ESLint?' prompt and exits non-zero. Confirmed. No static-analysis gate protects main.
- Zero automated tests. No *.test.* / *.spec.* files, no test script in package.json, and playwright is a devDependency with no config or specs. Confirmed.
- /api/leads accepts the admin CRM_ACCESS_KEY from the query string (`url.searchParams.get('key') === key`) as well as the x-crm-key header (leads/route.ts L25). Keys in URLs leak into server logs, browser history, and Referer headers.
- carePlans[].price (99 / 249 / 499 in pricing.ts L166,180,195) duplicates the same numbers in priceItems monthlyFounding, despite the file's own header claiming 'single source of truth for ALL prices'. Change one, the other drifts.
- Dead exports confirmed by grep: STAGE_LABEL (prospects.ts L16) has zero references; fetchCallTranscript and fetchCallSummary (quo.ts L76,85) are never called (the webhook rebuilds transcript/summary inline). PHONE_FLAG_META is imported in Board.tsx L4 but never used in the file (unused import a linter would catch).
- A UTF-8 BOM at the start of a pasted CSV makes the first header cell '﻿name' fail the exact `head.indexOf('name')` match in rowsToProspects (Board.tsx L32-34), so the name column is missed and every row is dropped by the trailing `.filter(p => p.name)`. Silent zero-import.
- The shared prospects doc save is last-write-wins by design (team/route.ts PUT comment) and Board.tsx debounces a full-list PUT 800ms after any change (L200-206); two team members open at once and one clobbers the other's edits with no conflict detection.
- Helper copy-paste, confirmed by grep: identical `emailRe = /^[^\s@]+@...$/` in 4 routes (leads, book, sign, audit-report) plus 2 different EMAIL_RE variants (find-email, email.ts); `clamp` in 3 routes; `esc` in 3 files (+2 CSV variants in Board); `money` in 6 files.

**Checks**

- **[HIGH]** ESLint is not configured at all, so the lint script in package.json cannot run and no static-analysis gate protects the auto-deploying main branch.
  - How: Confirm no .eslintrc*, eslint.config.* at repo root (Glob). Run `npx next lint`; observe it drops into the interactive 'How would you like to configure ESLint?' prompt and exits 1. Then stand up a config and run a full lint to enumerate violations (unused imports like PHONE_FLAG_META, floating promises, `as` casts).
  - Signal of a problem: next lint exits non-zero with a config prompt; no eslintrc file exists; after configuring, the first run surfaces dozens of no-unused-vars / no-floating-promises findings.
- **[HIGH]** There are zero automated tests despite high-risk pure logic that is easy to get subtly wrong and impossible to eyeball-verify across all inputs.
  - How: Glob for *.test.*/*.spec.* (none). Check package.json for a test script (none; playwright unused). List the untested pure functions: phoneCheck/phoneDigits (prospects.ts), parseCSV/rowsToProspects/doImport/exportInstantlyCSV (Board.tsx), makeToken/verifyToken (crm-auth.ts), verifyQuoWebhook (quo.ts), reportFromEmail (email.ts), isPrivateIp/isBlockedHost/normalizeUrl (safe-fetch.ts), scoreOf and the weighted score/caps (audit/route.ts).
  - Signal of a problem: No test files, no runner; a regression in any of these ships straight to production with only a manual click-through as defense.
- **[HIGH]** The two CRMs use incompatible auth models and one is weaker: /api/leads authorizes on a shared static key passed via header OR query string (stored in sessionStorage), while every /api/team* and session route uses signed HMAC cookies. The query-string key path leaks a long-lived admin secret.
  - How: Read authorized() in leads/route.ts (L20-26) and CrmBoard.tsx fetches (x-crm-key from sessionStorage); compare to makeToken/verifyToken HMAC sessions in crm-auth.ts. Assess whether /api/leads should move to the cookie-session model to unify.
  - Signal of a problem: `url.searchParams.get('key') === key` accepts the admin CRM_ACCESS_KEY from the URL; it appears in logs/history/Referer; two auth schemes double the surface area to reason about.
- **[MEDIUM]** The two parallel CRMs have diverged: /crm (CrmBoard.tsx, lib/crm.ts, the `leads` table, LEAD_STATUSES) versus /prospects (Board.tsx, lib/prospects.ts, the `team_crm` doc, PROSPECT_STAGES), with different stage enums and different data sources, so inbound audit-form leads never reach the working board.
  - How: Compare LEAD_STATUSES (crm.ts, 6 stages) to PROSPECT_STAGES (prospects.ts, 8 stages incl. follow_up/replied). Trace data flow: the audit form POSTs to /api/leads (writes `leads`, surfaced only in /crm), while /prospects/Board loads /api/team/audits which reads the `audits` table, not `leads`. Check nav/links for whether /crm is still reachable or is dead weight.
  - Signal of a problem: A lead who submits the audit form lands in `leads` (visible only in the /crm board) but their contact details never appear in the /prospects board the team actually works; two stage vocabularies to keep in sync.
- **[MEDIUM]** The hand-rolled CSV importer in Board.tsx silently drops rows on common real-world inputs, turning a paste of 250 leads into a zero or partial import with only a toast.
  - How: Read parseCSV and rowsToProspects (Board.tsx L16-52). Feed test CSVs: (a) one with a UTF-8 BOM before the header, (b) a quoted field containing a comma and an embedded newline, (c) a header using an unlisted alias (e.g. 'business_name'), (d) rows missing the name column. Trace against the exact `head.indexOf(name)` matching and the terminal `.filter(p => p.name)`.
  - Signal of a problem: BOM makes header '﻿name' not match, name column resolves to -1, every row has empty name and is filtered out; import reports 'Imported 0' with no error explaining why.
- **[MEDIUM]** Client-side dedup and email-hunt logic in Board.tsx is fragile and racy: concurrent fetches patch state while a debounced full-list PUT can overwrite the shared server doc with stale local data, and dedup keys are inconsistent between paths.
  - How: Trace findMissingEmails (5-way Promise.all workers patching per result, L392-422) against the 800ms debounced PUT save effect (L200-206) and the load-time merge of audits+quo (L152-197). Compare dedup keys: doImport uses name+phone plus 10-digit dial (L289-301); exportInstantlyCSV dedups on email only (L360-368); the load merge dedups audits by domain and quo by phone_digits. Reason about two simultaneous team sessions given team PUT is explicitly last-write-wins.
  - Signal of a problem: Mid email-hunt or with two tabs open, the debounced PUT ships a stale/merged list and clobbers another edit; the same lead can survive one dedup path but be dropped by another because the keys differ.
- **[MEDIUM]** Untrusted external JSON (Quo webhooks, Stripe events) is coerced with inline `as` casts and a Record<string, unknown> 'Json' type instead of validated, so a payload shape change is silently written to the database as null/garbage rather than caught.
  - How: Read quo/webhook/route.ts handleCall/handleMessage/handleContact (fields cast via `as string | undefined`, dialogue.map typed inline), lib/quo.ts upsert/fetch mapping, and webhooks/stripe/route.ts (`event.data.object as {...}`). Grep ` as ` across src/app/api and src/lib. Check whether any runtime schema validation exists (no zod dependency).
  - Signal of a problem: If Quo renames a field (e.g. resource.duration), the cast still compiles and the upsert writes duration_seconds: null with no error; strict TS gives false confidence because the cast bypasses it.
- **[MEDIUM]** Session-cookie parsing plus token verification is copy-pasted inline across 8 API routes instead of a shared helper, and the cookie name is hardcoded in each regex even though a SESSION_COOKIE constant exists, so renaming the cookie silently breaks auth in most routes.
  - How: Grep the literal `crm_session=([^;]+)` regex and `verifyToken(token ? decodeURIComponent(token) : null)` across src/app/api (8 hits: sign, team, team/audits, team/seed, team/quo-calls, quo/contacts, leads/find-email, team-login). Note team/route.ts already wraps it in a local currentUser(); the others do not. Propose a single getSessionUser(req) in crm-auth.ts using SESSION_COOKIE.
  - Signal of a problem: 8 identical inline parses; SESSION_COOKIE is defined but unused by the regexes, so it is a rename trap; the boilerplate invites drift (one route decoding differently).
- **[MEDIUM]** Core helpers are duplicated across many files rather than shared, and the email-validation regexes are not even identical, so validation behavior differs by endpoint and a fix in one copy silently misses the others.
  - How: Grep confirms: `emailRe` identical in leads/book/sign/audit-report, plus two divergent EMAIL_RE in find-email and email.ts; `clamp` in 3 routes; `esc` in book/audit-report/agreement-email (+2 CSV-escape variants in Board); `money` in pricing/agreement/DemoShowcase/SaasVsCustom/Roi/FenceEstimator (6); random-id/uid in Board and sign. Propose src/lib/http.ts and src/lib/format.ts and list every call site.
  - Signal of a problem: An email accepted by /api/book's regex could be rejected by /api/leads/find-email's; six money() implementations drift in rounding/locale; a validation hardening PR only patches one of four copies.
- **[MEDIUM]** pricing.ts is not the single source of truth it claims to be: care-plan prices are duplicated between priceItems and the carePlans array, and prices are also hardcoded into outreach templates and calculators, so a price change requires edits in several unrelated files.
  - How: Cross-reference carePlans[].price (99/249/499, pricing.ts L166,180,195) with the matching priceItems monthlyFounding. Grep prospects.ts TEMPLATES for hardcoded '$2,000' and '$99/mo' (call/email scripts), and check SaasVsCustomCalculator (HOSTING_PER_MONTH=30, default buildCost=15000) and Plans/pricing pages.
  - Signal of a problem: Raising Care Essential to $109 in priceItems leaves carePlans showing $99 and the cold-email template quoting the old number; no single edit updates all customer-facing prices.
- **[MEDIUM]** Pervasive best-effort error swallowing (empty catch and `.then(() => {}, () => {})`) is intentional for optional tables but is applied uniformly, so a genuine Supabase/Quo outage is indistinguishable from the benign 'table not created yet' case and goes unlogged in the webhook paths.
  - How: Grep `catch {`, `.then(() => {}, () => {})`, `.catch(() => {})` in src/app/api and src/lib. Contrast quo/webhook and stripe payments inserts (swallowed, no log) with leads/book (which console.error on insert failure). Decide where a swallowed error should at least log.
  - Signal of a problem: A failing quo_calls or payments upsert returns success-shaped 200 with no console trace; a real DB outage looks identical to 'optional table missing', so it is never noticed.
- **[LOW]** Business-critical thresholds and tuning constants are scattered inline and inconsistent between similar routes, making them hard to find and easy to desync.
  - How: Compare audit/route.ts (MAX_BYTES 2.5MB, FETCH_TIMEOUT_MS 9000, ROBOTS_TIMEOUT_MS 3500, category weights 0.28/0.22/0.25/0.25, hard caps 55/45/60, WEIGHT pass/warn/fail 100/35/0) with find-email/route.ts (MAX_BYTES 1.5MB, FETCH_TIMEOUT_MS 8000). Note sign/route.ts rate limiter (12/60s, 5000-entry map cap), Board debounce 800ms, findMissingEmails CONCURRENCY 5, SOFLA_AREA_CODES set.
  - Signal of a problem: Two site-fetch routes cap bytes and time differently for no documented reason; changing the scoring model means editing magic literals buried mid-function; no constants module to review.
- **[LOW]** API error responses are inconsistent in shape and status code for the same class of failure, so clients cannot rely on a uniform contract.
  - How: Enumerate every NextResponse.json across src/app/api and tabulate {error key, status}. Note: invalid JSON is 400 in leads/audit/sign/book but is folded into a 422 'invalid_url'/'missing_fields' path in find-email and quo/contacts; validation is 422 in leads but 400 (missing_fields) in quo/contacts; webhooks return `{received:true}` with no ok field. There is no shared JSON responder.
  - Signal of a problem: Same failure (malformed body) yields 400 in one route and 422 in another; a generic client cannot branch on a stable {ok,error} shape.
- **[LOW]** Database row types and external payload shapes are hand-written per route rather than generated, so the DB schema in supabase/*.sql and the TypeScript types can silently diverge.
  - How: Compare the hand-written interfaces (ActivityRow in team/quo-calls, the inline `as {...}` shapes in stripe webhook, QuoCall in quo.ts, Lead in crm.ts, Prospect in prospects.ts) against supabase/*.sql. Recommend `supabase gen types typescript`. Confirm the codebase is otherwise `any`-free (grep found no `: any`; only one justified @ts-expect-error in Reveal.tsx).
  - Signal of a problem: A column renamed in a .sql migration compiles fine against the stale hand-written row type; the mismatch only surfaces as runtime nulls.
- **[LOW]** URL/host and phone formatting logic is reimplemented in several places, including a webhook phone-pretty helper that does not guard input length, risking malformed output that differs from the CRM's own formatter.
  - How: Compare domain extraction in team/audits/route.ts (domainOf) with Board.tsx dom() (L162) and safe-fetch normalizeUrl; compare prettyPhone in quo/webhook/route.ts (L63, no length guard) with phoneCheck().pretty in prospects.ts (guards 10 digits). Grep `replace(/^www\./` and the `(${...slice(0,3)})` phone pattern.
  - Signal of a problem: prettyPhone on a non-10-digit string yields a garbled '(12) 3-' style value; two phone formatters can render the same number differently in the drawer versus the synced-call list.
- **[LOW]** Dead code and unused exports accumulate because nothing flags them, adding maintenance surface and misleading readers about what is live.
  - How: Run ts-prune/knip (add as devDep). Confirmed already by grep: STAGE_LABEL (prospects.ts L16) has zero references; fetchCallTranscript and fetchCallSummary (quo.ts L76,85) are never called; PHONE_FLAG_META is imported in Board.tsx L4 but unused in the file. Also assess whether the entire /crm + CrmBoard.tsx + lib/crm.ts stack is superseded by /prospects.
  - Signal of a problem: Exported helpers with no callers read as intentional API; an unused import survives because there is no no-unused-vars gate; a whole second CRM may be dead weight kept in sync for nothing.

**Tooling**

- tsc --noEmit (baseline is currently CLEAN, exit 0, strict mode on: use as the regression gate)
- Set up ESLint properly (next/core-web-vitals + @typescript-eslint) and enable no-explicit-any, no-floating-promises, @typescript-eslint/no-unused-vars, consistent-return, no-restricted-syntax for `as` on JSON; capture the first full lint run as the finding list
- ripgrep / Grep for the duplication and cast patterns (money, clamp, esc, emailRe, `as `, the crm_session cookie regex, `.then(() => {}, () => {})`, `catch {`)
- ts-prune or knip (not installed; add as devDep) for dead exports and unreferenced files (confirms STAGE_LABEL, fetchCallTranscript/Summary, and whether /crm+CrmBoard is dead)
- madge --circular src for import cycles
- Vitest (add) for unit tests of the enumerated pure functions; no DOM needed for most
- supabase gen types typescript to replace the hand-written per-route row interfaces (ActivityRow, the inline `as {...}` DB shapes)
- Small Node repro scripts (or Vitest cases) for the CSV/BOM, dedup, and phoneCheck edge cases

**Deliverable.** A ranked findings report (markdown table, no em dashes) with one row per issue: file:line, category (type-safety / error-handling / duplication / dead-code / magic-value / test-gap / consistency), severity, a concrete failure scenario, and a one-line fix. Plus five concrete artifacts the executed run should produce: (1) a working ESLint config committed and the first clean-lint baseline (all violations either fixed or explicitly ignored with justification); (2) a minimal but real Vitest suite covering phoneCheck/phoneDigits, parseCSV/rowsToProspects (incl. BOM and quoted-comma-newline cases), the doImport and exportInstantlyCSV dedup, makeToken/verifyToken, verifyQuoWebhook (both legacy and standard schemes), reportFromEmail auto-heal, and isPrivateIp/isBlockedHost/normalizeUrl SSRF cases; (3) a shared-helpers refactor list (proposed src/lib/http.ts for getSessionUser/clamp/emailRe/json-error responder, and a single money/esc/uid) with the exact call sites to migrate; (4) a decision memo on the two-CRM situation (/crm+leads table vs /prospects+team_crm) recommending consolidate-or-delete, since audit-form leads land in `leads` and are only visible in /crm while the working board reads `audits`; (5) a "fix now vs track later" split so Tal can land the P0/P1 items in one pass.

---

### 12. Mobile & Responsive  (P1)

**Objective.** Verify that every Stackwrk surface (marketing pages, the interactive DemoShowcase, the SEO guide articles, the /prospects CRM board and its detail drawer, and the /demos/apex-fence sales demo) renders and behaves correctly from a 320px phone up through the 768 to 1023px tablet gap, with no horizontal overflow, no content silently clipped by the global `overflow-x: clip` backstop, tap targets large enough to hit, and touch interactions (the Before/After slider, the horizontally scrolling CRM board and guide tables) that work with a finger. This matters because the site's whole pitch is "mobile-first sites that convert," contractors and their customers browse on phones, and Tal works the CRM from a phone, so a broken phone layout undermines both the product and the sales narrative. The pass is measurement and evidence only, it fixes nothing.

**Scope**

- Marketing routes: src/app/page.tsx (/), src/app/work/page.tsx, src/app/services/page.tsx, src/app/pricing/page.tsx, src/app/contact/page.tsx, src/app/tools/page.tsx and the three tools/* calculator pages, src/app/quote/page.tsx
- SEO content: src/app/guides/page.tsx and src/app/guides/[slug]/page.tsx (the Block() table renderer at lines 116-155)
- Interactive demo: src/components/DemoShowcase.tsx (BeforeAfterDemo 388-617, CrmDemo min-w-[460px] board 675-676, BookingDemo grids, the snap-scroll tab rail 771-790)
- Hero and header: src/components/Hero.tsx (h1 scaling + lg:whitespace-nowrap 116-127), src/components/Nav.tsx (mobile toggle + max-h-96 menu)
- Overlays: src/components/StickyCTA.tsx, src/components/AuditPopup.tsx, src/components/MockupModal.tsx, src/components/ToolLayout.tsx
- Big-type sections: src/components/Investment.tsx, src/components/MetricsBand.tsx, src/components/FinalCTA.tsx, src/components/FeaturedProjects.tsx
- Internal CRM: src/app/prospects/Board.tsx (header action bar 433-451, board min-w-[1100px] 510-551, drawer 555-753) plus TodayDriver/CallConsole/CallHistory/LeadAudit/AgreementGen, and src/app/crm/page.tsx, src/app/mockup/page.tsx
- Sales demo: src/components/FenceSite.tsx (header nav 87-106, sticky mobile CTA 382) rendered at /demos/apex-fence and its /tools, /guides, /areas/[city] subroutes; src/components/tools/MaterialComparison.tsx (min-w-[560px] table) and tools/FinancingCalculator.tsx (grid-cols-4)
- Foundations: src/app/globals.css (overflow-x: clip backstop, the max-width:767px 16px input rule, scroll-padding-top:68px) and tailwind.config.ts (stock sm/md/lg/xl breakpoints only)

**Quick wins (check these first)**

- FenceSite.tsx sales demo has no mobile hamburger: the header nav is hidden below md and the bottom CTA bar is sm:hidden, so at 640-767px a visitor can reach neither the nav sections nor the Call/Quote actions.
- AuditPopup.tsx (the entry conversion modal) lacks overflow-y scroll that MockupModal.tsx has, so on a short/landscape phone the form and its submit/close controls can end up off-screen and unreachable.
- FenceSite.tsx:382 bottom CTA bar omits env(safe-area-inset-bottom) that the marketing StickyCTA.tsx:45 correctly uses, so its buttons sit under the iPhone home indicator.
- The global overflow-x: clip on html,body (globals.css) hides any horizontal overflow rather than exposing it, so pages can look fine while silently cutting off content: measure scrollWidth and child bounding boxes, do not trust the visual.
- Sub-44px tap targets on public controls: Nav.tsx:79 toggle (36px), and multiple h-8 w-8 (32px) close/send buttons in AuditPopup, MockupModal, and DemoShowcase.
- Hero.tsx md:text-7xl applies at 768-1023 before lg:whitespace-nowrap engages: check the h1 and its brush-underline SVG for overflow across the 768/1024/1280 boundaries.
- Board.tsx CRM header packs ~9 buttons into one flex-wrap row: verify it does not overflow or balloon in height at 390px.

**Checks**

- **[HIGH]** Global horizontal-overflow scan on every route. globals.css sets html,body { overflow-x: clip } which HIDES overflow instead of scrolling it, so a too-wide child is silently cut off, not visible as a scrollbar. Do not trust the eye: measure.
  - How: Playwright against `npm run dev`. For each in-scope route, set viewport widths 320, 360, 390, 414, and 768, then assert document.scrollingElement.scrollWidth <= innerWidth + 1 AND walk the DOM asserting no element's getBoundingClientRect().right exceeds innerWidth by more than 1px. Log offenders with selector + file.
  - Signal of a problem: Any element whose right edge is past the viewport, or scrollWidth > clientWidth, meaning content is being clipped by the backstop and the user never sees it.
- **[HIGH]** Hero h1 scaling and forced single-line at the tablet/desktop boundary. Hero.tsx:116 scales text-5xl -> sm:6xl -> md:7xl -> lg:[4.1rem] -> xl:[5rem], and lines 119-120 add lg:whitespace-nowrap plus a brush-underline SVG. md:text-7xl (~4.5rem) applies at 768-1023 without nowrap, and nowrap forces one line at exactly 1024 where the column is narrowest.
  - How: Render / at 375, 768, 820, 1024, 1152, and 1280. Inspect both title spans and the absolute brush SVG (Hero.tsx:122) for overflow past container-content and for the underline detaching from the words.
  - Signal of a problem: Title text wider than its column, page-level horizontal scroll at 768-1023, or the lime brush underline sitting off from the text it should sit under.
- **[HIGH]** Guide article tables scroll horizontally without widening the page. guides/[slug]/page.tsx:116-155 wraps each table in overflow-x-auto inside a max-w-3xl article and container-content (px-5).
  - How: Find a guide in src/lib/guides.ts whose body contains a wide `table` block, render /guides/[slug] at 320 and 360, and confirm the table scrolls inside its bordered rounded container while the article column and page stay at viewport width. Repeat for the widest table found.
  - Signal of a problem: A table pushes the whole article wider than the viewport (clipped by the body backstop), or a table is cut off with no way to scroll to its right-hand columns.
- **[HIGH]** FenceSite sales demo has no mobile navigation between sm and md. FenceSite.tsx:93 hides the primary nav below md (hidden md:flex) with NO hamburger fallback, and the compensating bottom CTA bar (line 382) is sm:hidden, so at 640-767px neither appears.
  - How: Load /demos/apex-fence at 375 (portrait) and at 700 and 767 (large phone / small tablet). Check whether the header links (Services, Estimator, Free Tools, Our Work, Guides, Reviews) are reachable and whether the Call / Free Quote bottom bar is visible in the 640-767 band.
  - Signal of a problem: In the 640-767px range there is no visible nav and no bottom CTA bar, so a visitor cannot reach any section or the quote action, on a page that is a live sales asset.
- **[HIGH]** AuditPopup entry modal has no internal scroll, unlike MockupModal. AuditPopup.tsx:94-105 is a fixed inset-0 flex items-center container with NO overflow-y, while MockupModal.tsx:43 uses overflow-y-auto + sm:items-center + my-8.
  - How: Trigger the audit popup (fires ~2.5s after landing on /) on a landscape phone viewport (e.g. 812x375) and a short 360x640 portrait, and confirm the header, three inputs, consent checkbox, submit button, and the close X are all reachable.
  - Signal of a problem: On a short viewport the popup form overflows with no scroll, leaving the submit button or close control off-screen, blocking both conversion and dismissal.
- **[HIGH]** CRM board and detail drawer on a phone. Board.tsx:510-511 uses a min-w-[1100px] board inside overflow-x-auto (intended sideways scroll), and the drawer (560-561) is w-full max-w-md with several grid-cols-2 field rows (671, 684).
  - How: Sign into /prospects (team gate) and view at 360 and 390. Confirm the board scrolls horizontally without the page scrolling, tapping a card opens the drawer, the drawer sits full-width, and every field (stage/follow-up 671, contact 684, the Copy/Dial quick-action grid 584) fits without clipping and inputs render at 16px (globals rule).
  - Signal of a problem: Drawer wider than the viewport, grid-cols-2 inputs overflowing or overlapping, or action buttons pushed off the right edge on a phone.
- **[MEDIUM]** Before/After comparison slider works by touch (recently fixed, guard the fix). BeforeAfterDemo (DemoShowcase.tsx:432-448) is a role=slider with touch-none/select-none, aspect-[4/3] on mobile, and a fixed inner BEFORE pane of width:880 (line 539) clipped by width:${pos}%.
  - How: Emulate a touch device at 360 and 390. Dispatch pointerdown/move/up across the frame and confirm setPos tracks the finger, the page does not scroll during the drag (touch-none), the BEFORE 2003-site pane stays left-aligned as the split moves, and the handle plus the 'Drag' hint (604) stay on-screen at pos=3 and pos=97.
  - Signal of a problem: Page scrolls instead of the slider moving, the handle clips off the frame edge, or the BEFORE pane content shifts/reflows as pos changes.
- **[MEDIUM]** CrmDemo inner board horizontal scroll on a narrow phone. DemoShowcase.tsx:675-676 wraps a min-w-[460px] flex row in overflow-x-auto, and the totals row (663) is grid-cols-2.
  - How: Render / (the DemoSection) at 320 and 360, activate the 'Lead CRM' tab, and confirm the 460px board scrolls sideways WITHIN its rounded panel while the page itself stays at viewport width, and the two totals cards fit side by side.
  - Signal of a problem: The whole page scrolls horizontally rather than just the board panel, or the Open pipeline / Won cards overlap or clip.
- **[MEDIUM]** DemoShowcase tab rail: all five tabs reachable on a phone. Lines 771-790 render a snap-x horizontal scroller with a right-edge [mask-image] fade on mobile (lg switches to a vertical list).
  - How: At 360 and 390, confirm every tab (Booking, Revenue calculator, AI assistant, Lead CRM, Before / After) can be swiped into view and tapped, and that the last tab is not permanently hidden under the mask fade. Tap each and verify the active demo swaps.
  - Signal of a problem: The final tab is stuck behind the fade mask or unreachable, or an active tab does not scroll itself into view.
- **[MEDIUM]** FenceSite sticky mobile CTA ignores the iPhone home-indicator safe area. FenceSite.tsx:382 uses plain p-3, whereas the marketing StickyCTA.tsx:45 correctly uses pb-[max(0.75rem,env(safe-area-inset-bottom))].
  - How: Emulate an iPhone with a home indicator (e.g. iPhone 14/15 device metrics) at /demos/apex-fence and confirm whether the Call and Get My Free Quote buttons sit under the home-indicator inset.
  - Signal of a problem: The bottom CTA buttons are partially overlapped by the home indicator and harder to tap, unlike the marketing StickyCTA which reserves the inset.
- **[MEDIUM]** CRM header action bar wrap on a phone. Board.tsx:433-451 is a flex-wrap row of roughly nine buttons (Present, theme, Add lead, Import, Export all, Find emails, Export to campaign, Re-export, Sign out).
  - How: At 390 measure the header block height and confirm buttons wrap cleanly, none overflow the right edge, and each stays tappable (not shrunk below usable size).
  - Signal of a problem: Buttons overflow horizontally past the container or stack into a very tall bar that pushes the board far down the page.
- **[MEDIUM]** Tap-target sizes on public marketing controls fall below the 44x44 (Apple HIG) / 48dp (Material) minimum. Nav.tsx:79 toggle is h-9 w-9 (36px); DemoShowcase.tsx:376 chat send is h-8 w-8; AuditPopup.tsx:110 and MockupModal.tsx:56 close is h-8 w-8; DemoShowcase day buttons (166) are py-1.5.
  - How: Playwright: on /, /contact, and the tool pages at 390, measure getBoundingClientRect on every a/button/[role=slider] and flag primary controls under 44x44. Cross-check with a Lighthouse mobile tap-target audit per route.
  - Signal of a problem: Primary interactive controls (nav toggle, modal close, demo send, CTA chips) measuring under 44px in either dimension.
- **[MEDIUM]** MaterialComparison table needs a scroll wrapper. tools/MaterialComparison.tsx:44 declares a table with w-full min-w-[560px] but the min-w only helps if the PARENT clips/scrolls.
  - How: Read the component's parent wrapper for overflow-x-auto, then render its host tool page at 360 and confirm the 560px table scrolls inside its container rather than widening the page.
  - Signal of a problem: The 560px table causes page-level horizontal overflow because its parent is not an overflow-x-auto scroll container.
- **[MEDIUM]** Large-type stats and headlines do not clip at 320px. Investment.tsx:43 uses text-6xl sm:text-7xl on a currency figure, FinalCTA.tsx:60 / Faq.tsx:53 / WhatYouGet.tsx:12 use text-4xl sm:5xl lg:6xl, FenceEstimator.tsx:115 uses text-3xl, MetricsBand.tsx caps labels at max-w-[11rem].
  - How: Render each hosting page/section at 320 (small Android) and confirm big numbers and display headlines do not overflow, clip, or break awkwardly mid-word.
  - Signal of a problem: A stat number or display headline is cut at the right edge or wraps into an ugly ragged shape at 320px.
- **[MEDIUM]** iOS text-field focus does not zoom or shift the page. globals.css forces 16px on input/textarea/select under max-width:767px, but type=range is exempted and the rule relies on the media query, not per-field sizing.
  - How: On an iOS Safari emulation, focus each real form field: AuditForm, /contact form, the AuditPopup and MockupModal inputs, the /quote builder, and the CRM drawer inputs (Board.tsx:686-716), confirming no zoom-and-recenter jump.
  - Signal of a problem: Focusing a field zooms the viewport and shifts the layout, which happens when computed font-size is under 16px on iOS.
- **[LOW]** FinancingCalculator grid-cols-4 on a narrow phone. tools/FinancingCalculator.tsx:30 renders four columns unconditionally (no responsive prefix).
  - How: Render the hosting tool/demo page at 320 and 360 and confirm the four columns fit, remain legible, and are individually tappable rather than squished or overflowing.
  - Signal of a problem: The four cells overflow their row or become too narrow to read/tap on a small phone.
- **[LOW]** Mobile nav menu height and anchor-scroll offset. Nav.tsx:90-93 collapses the mobile menu with max-h-96 (24rem), and globals.css sets scroll-padding-top:68px while the nav is h-14 (56px).
  - How: At 360 open the hamburger menu and confirm all nav items plus the Get a Free Mockup CTA fit inside 24rem uncut. Then tap in-page anchors (#work, #audit, #mockup) and confirm target headings land clear of the fixed nav.
  - Signal of a problem: The last menu item or CTA is clipped by max-h-96, or anchored headings are tucked under the sticky nav after a jump.

**Tooling**

- Playwright (already a devDependency) driving `npm run dev`: device emulation, per-breakpoint screenshots, and scrollWidth / getBoundingClientRect assertions for overflow and tap-target measurement
- Chrome DevTools device mode for manual touch-drag testing of the Before/After slider and for simulating safe-area insets and landscape phones
- Lighthouse mobile audits per route for the tap-targets and viewport (has a meta viewport) checks
- Real iOS Safari and Android Chrome spot-checks for input-focus zoom and home-indicator overlap, which emulators approximate but do not perfectly reproduce
- grep/ripgrep over src for responsive-class risk patterns already surfaced (min-w-[, w-[NNNpx], whitespace-nowrap, unprefixed grid-cols-N) to seed the manual review

**Deliverable.** A Mobile & Responsive findings report structured as a route x breakpoint matrix (widths 320, 360, 390, 414, 768, 1024, plus one landscape-phone height like 812x375). It contains: (1) annotated mobile screenshots per route/breakpoint captured with Playwright, (2) an issues table where each row is route + component file:line + breakpoint + category (horizontal-overflow | tap-target | clipping | touch-interaction | safe-area | input-zoom | nav-gap) + severity + a one-line repro, and (3) a prioritized fix backlog ranked by severity and traffic (public marketing and guides above the internal CRM). It explicitly separates confirmed defects from cosmetic nits, and calls out anywhere the global overflow-x: clip backstop is masking content that is actually being cut off. No code changes are made.

---
