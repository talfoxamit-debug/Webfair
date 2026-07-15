# Systems & Accounts: Set Up A→Z

Total cost to run this: **~$150–250/month.** Set up in this order.

## Do TODAY (the long-pole item)
1. **Sending domain + email tool**, the 2–3 week warmup is the bottleneck, so start now.
   - Buy a lookalike domain: `getstackwrk.com` or `stackwrkhq.com` (~$12, Namecheap/Cloudflare).
   - Sign up for **Instantly.ai** ($37–97/mo), it's your email sender *and* your email-reply CRM.
   - Add the domain, create 1–2 inboxes, set SPF/DKIM/DMARC (Instantly walks you through it).
   - Turn on **warmup**. Do not send a single cold email for ~2 weeks.

## This week
2. **Business basics**
   - EIN (irs.gov, free, 10 min) → unblocks Stripe.
   - **Stripe** → create 3 Payment Links: $2,500 / $3,900 / $6,500, plus the monthly care plans ($99/$199/$399). Paste the links into `src/lib/pricing.ts` and I'll wire the "Subscribe" buttons.
   - **Google Business Profile** for Stackwrk → start ranking yourself for "web designer {{city}}".
3. **Prospecting stack**
   - **Your CRM: `stackwrk.com/prospects`**, already built. Click **Load starter list (254)**. This is your phone + pipeline hub. (Bookmark it. Export weekly as backup, data lives in your browser.)
   - **MillionVerifier** (~$0/first credits), verify emails before adding to Instantly (keeps bounce rate < 3%).
   - **Loom** (free), record 60-sec mockup walkthroughs.
   - **Calendly**, already connected (calendly.com/tal-foxamit-seatophomes/30min).

## How the pieces work together
```
                 YOUR 254 LEADS (leads-fence-southfl.csv)
                          │
        ┌─────────────────┴──────────────────┐
        ▼                                     ▼
   PHONE (50 no-site + all)            EMAIL (59 w/ emails, enrich more)
   → stackwrk.com/prospects            → Instantly.ai
     (call, log, follow-up)              (sequence A/B, warmup, replies)
        │                                     │
        └──────────────┬──────────────────────┘
                       ▼
              THEY SAY "MOCKUP / YES"
                       │
        Build mockup (dupe Apex demo + their photos) → Loom
                       │
              Calendly call → quote 3 tiers → Stripe deposit
                       │
              Contract (playbook/03) → BUILD → launch in 10 days
                       │
              Care plan MRR starts. Ask for referral. Repeat.
```

## About the email list
- The CSV has **248 phones** but only **59 emails** (many fence sites hide email behind a form).
- **Phone-first** is the play anyway, especially the 50 no-site leads (they have no email).
- To grow the email list for Instantly: run the "has website" domains through an email finder (**Hunter.io**, **Apollo.io** free tiers) or pull a fresh list from **Outscraper** (Google Maps → "no website" filter, ~$3/1,000).

## Data hygiene / safety
- **Export your CRM weekly** (Export button), the browser is the source of truth until you wire the optional Supabase sync.
- Keep the sending domain **separate** from stackwrk.com so a spam flag never touches your main domain.
- CAN-SPAM: real physical address + working opt-out in every email. TCPA: manual dials only, no cold SMS blasts.
