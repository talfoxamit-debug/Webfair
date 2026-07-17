# Stackwrk to-do

Living list of open items. Grouped by who owns each.

## Tal (setup, no code)
- [ ] **Google Search Console** (biggest SEO item): verify stackwrk.com and submit the sitemap. Steps:
      1. Go to search.google.com/search-console, click "Add property".
      2. Pick the "URL prefix" option, enter `https://stackwrk.com`.
      3. Verify. Easiest on Vercel: choose the "HTML tag" method, copy the
         `<meta name="google-site-verification" ...>` content value, and send it
         to me. I will add it to the site so verification passes (or use the DNS
         TXT method in your domain registrar if you prefer).
      4. Once verified: Sitemaps (left menu) -> enter `sitemap.xml` -> Submit.
      5. Also submit key URLs via "URL Inspection" -> "Request indexing" for the
         homepage and the top guides to speed up first crawl.
- [ ] **GA4**: create a GA4 property (analytics.google.com), copy the `G-XXXXXXX`
      measurement id, add it in Vercel as `NEXT_PUBLIC_GA_ID`, redeploy. (Code is
      already in, dormant until the id is set.)
- [ ] **Microsoft Clarity** (free heatmaps + recordings): create a project at
      clarity.microsoft.com, copy the project id, add it in Vercel as
      `NEXT_PUBLIC_CLARITY_ID`, redeploy. (Code already in, dormant.)
- [ ] **Google Business Profile**: optimize it (see playbook/06). Paste the public
      Maps link here and I will review it against the checklist.
- [ ] **LinkedIn URL**: send it. I will wire it into the footer and the site
      Organization schema (sameAs).
- [ ] **Test the money path**: with Stripe keys set, sign a test agreement and
      click pay to confirm you reach Stripe checkout.
- [x] Supabase migrations run.
- [x] Env keys set (Supabase, CRM, Resend, Stripe, site).
- [x] Quo webhook + allowlist configured.
- [~] **Vercel Speed Insights**: declined for now (costs $10/mo on the Pro plan).

## On hold (Tal to greenlight)
- [ ] **AI tools** (need an Anthropic API key, then I build):
      1. 24/7 AI chat assistant on the site (qualifies leads, books calls, and
         demonstrates the exact product we sell).
      2. AI-personalized audit advice in the report.
      3. AI mini-tools as lead magnets (meta-description writer, headline
         analyzer, review responder).

## Claude (code, in progress)
- [ ] Keep publishing guides (15 of ~100 mapped live; writing more).
- [ ] More free tools / calculators (candidates in the strategy notes).
- [ ] Finish the remaining low-priority audit findings (minor SEO metadata,
      code-quality cleanups, a few data/reliability edge cases).
- [ ] Larger image-optimization pass (next/image or AVIF) when prioritized.
- [ ] Per-industry / per-city guide expansion: NOT YET. Wait until the core
      guides rank and we can add real per-trade substance (thin variants now
      would risk a doorway-page penalty on a young domain).
