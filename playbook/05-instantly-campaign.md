# Instantly Campaign — Ready to Send

Your enriched lead file: **`instantly-fence-leads.csv`** (47 verified fence/exterior
contractors in South FL, all with a real business email). Every lead has a
personalized `icebreaker` first line already written, so the email reads custom
even though we don't have owner first names.

---

## 1. Upload the list (2 min)
1. Instantly → **Leads** (or inside the campaign) → **Import → Upload CSV**.
2. Map the columns exactly:
   | CSV column | Map to |
   |---|---|
   | `email` | Email |
   | `company_name` | Company Name |
   | `first_name` | First Name |
   | `phone` | Phone |
   | `website` | Website |
   | `city` | **Custom variable** → `city` |
   | `state` | **Custom variable** → `state` |
   | `icebreaker` | **Custom variable** → `icebreaker` |
3. Turn ON **"Verify emails on import"** (or run MillionVerifier first). Remove any
   that come back risky/invalid — keep bounce rate under 3%.

## 2. Campaign settings
- **Sending accounts:** attach your warmed inboxes. Spread the send across all of them.
- **Daily limit:** 25–30/inbox/day to start (you only have 47 leads — this list
  finishes in ~1 day across 2 inboxes; that's fine, keep the per-inbox cap low).
- **Schedule:** Tue–Thu, 8–11am ET is best for contractors. Skip weekends.
- **Tracking:** turn **link tracking OFF** for step 1 (open tracking is fine).
  Tracked links on a cold first touch hurt deliverability.
- **Stop on reply:** ON.

## 3. The sequence — paste these in

### Step 1 — Day 0 (NO links, plain text)
**Subject:** quick idea for {{company_name}}

```
Hi there,

{{icebreaker}}

Most fence companies I work with in {{city}} are getting found on Google but
losing the click because the site isn't built to turn a visitor into a quote
request. I fix exactly that — fast, mobile-first, instant-quote form front and center.

Want me to put together a quick concept of what {{company_name}}'s homepage
could look like? No cost, no obligation — just reply "yes" and I'll send it over.

— Tal
Stackwrk
Reply STOP and I'll leave you alone.
```

### Step 2 — Day 3 (one link OK now)
**Subject:** re: quick idea for {{company_name}}

```
Following up, {{company_name}} —

Here's a live example of the kind of site I build for fence pros:
stackwrk.com/demos/apex-fence — instant quote form, reviews, financing, fast on mobile.

Yours would have your name, your photos, your number. I'll build the concept free.
Worth a quick look?

— Tal
Reply STOP to opt out.
```

### Step 3 — Day 6 (breakup)
**Subject:** should I close your file?

```
Not trying to be a pest, {{company_name}} —

If a better website isn't a priority right now, no problem and I'll stop reaching out.

If it is: reply "mockup" and I'll build you a free homepage from your own photos.
Takes me a day, and there's no cost to see it.

— Tal
Stackwrk · Reply STOP to opt out.
```

## 4. When someone replies "yes / mockup"
1. Open **stackwrk.com/mockup**, plug in their name + city + a couple of their
   photos → hit Build → copy the shareable preview link. (~10 min.)
2. Reply with the link (use the "Mockup delivery" template in your CRM at
   **stackwrk.com/prospects** → the lead's card).
3. Book the 10-minute call. On the call: show it, quote the 3 tiers, take the deposit,
   send the contract (playbook/03-service-agreement.md).

## 5. Before you hit send — 60-second checklist
- [ ] Warmed inboxes attached (you said they're warmed ✅)
- [ ] SPF / DKIM / DMARC green on the sending domain
- [ ] Real signature + physical mailing address on the inbox (CAN-SPAM)
- [ ] Emails verified, bounce risk removed
- [ ] Link tracking OFF on step 1
- [ ] "Reply STOP to opt out" line present (it's in the copy above)

The other ~180 leads are mostly **contact-form-only or no-website** — those don't
have a public email and are better worked by **phone** (playbook/02-call-scripts.md,
CRM → 🔥 No-website filter). That's where the fastest wins are.
