# Instantly Campaign: Ready to Send

Export your lead file straight from the CRM: **stackwrk.com/prospects → "✉️ Export new"**
downloads `stackwrk-instantly-leads.csv`, every fence/exterior contractor with a real
business email, de-duplicated, each with a personalized `icebreaker` first line already
written so the email reads custom even without owner first names. Run **🔍 Find emails**
in the CRM first to grow the list before you export (it scrapes each lead's own site for
a published address). "Export new" only pulls leads you haven't sent before, so you can
re-export as the list grows without emailing anyone twice.

**The copy below uses the same sales psychology as the call scripts:** give first (a free
concept, not a pitch), and frame every ask as a *"no"* question, a "no" costs the reader
nothing to give but works as the same green light, so it lowers the delete-reflex.

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
   that come back risky/invalid, keep bounce rate under 3%.

## 2. Campaign settings
- **Sending accounts:** attach your warmed inboxes. Spread the send across all of them.
- **Daily limit:** 25–30/inbox/day to start (you only have 47 leads, this list
  finishes in ~1 day across 2 inboxes; that's fine, keep the per-inbox cap low).
- **Schedule:** Tue–Thu, 8–11am ET is best for contractors. Skip weekends.
- **Tracking:** turn **link tracking OFF** for step 1 (open tracking is fine).
  Tracked links on a cold first touch hurt deliverability.
- **Stop on reply:** ON.

## 3. The sequence: paste these in

### Step 1: Day 0 (NO links, plain text)
**Subject:** quick idea for {{company_name}}

```
Hi there,

{{icebreaker}}

I build websites for fence and exterior pros around {{city}}, and rather than
pitch you, I'd rather just show you. I can put together a rough concept of what
{{company_name}}'s homepage could look like (your work up front, an instant-quote
form built to turn "fence near me" clicks into calls), on my own time, free.

Would it be a bad idea to send it over? If you like it we talk, if not no hard feelings.

- Tal
Stackwrk
Reply STOP and I'll leave you alone.
```
*Why it works: leads with the give (a free concept), and the ask is a "no" question. A "no, not a bad idea" is far easier to send than committing to "yes."*

### Step 2: Day 3 (one link OK now)
**Subject:** re: quick idea for {{company_name}}

```
Following up, {{company_name}}

Here's the kind of site I build for fence pros: stackwrk.com/demos/apex-fence,
with an instant-quote form, reviews, financing, and quick load on mobile. Yours
would have your name, your photos, your number.

Would it be unreasonable for me to build you the free concept so you can see yours
the same way? One reply and I'll start.

- Tal
Reply STOP to opt out.
```

### Step 3: Day 6 (breakup)
**Subject:** should I close your file?

```
Not trying to be a pest, {{company_name}}

If a better website isn't on your list right now, no worries at all, ignore this
and I'll stop reaching out.

If it is: reply "mockup" and I'll build you a free homepage from your own photos.
Costs you nothing to look, and it takes me about a day.

- Tal
Stackwrk · Reply STOP to opt out.
```
*The breakup gives them explicit permission to opt out by silence, which,
counter-intuitively, pulls the on-the-fence ones off the fence to reply.*

## 4. When someone replies "yes / mockup"
1. Open **stackwrk.com/mockup**, plug in their name + city + a couple of their
   photos → hit Build → copy the shareable preview link. (~10 min.)
2. Reply with the link (use the "Mockup delivery" template in your CRM at
   **stackwrk.com/prospects** → the lead's card).
3. Book the 10-minute call. On the call: show it, quote the 3 tiers, take the deposit,
   send the contract (playbook/03-service-agreement.md).

## 5. Before you hit send: 60-second checklist
- [ ] Warmed inboxes attached (you said they're warmed ✅)
- [ ] SPF / DKIM / DMARC green on the sending domain
- [ ] Real signature + physical mailing address on the inbox (CAN-SPAM)
- [ ] Emails verified, bounce risk removed
- [ ] Link tracking OFF on step 1
- [ ] "Reply STOP to opt out" line present (it's in the copy above)

The other ~180 leads are mostly **contact-form-only or no-website**, those don't
have a public email and are better worked by **phone** (playbook/02-call-scripts.md,
CRM → 🔥 No-website filter). That's where the fastest wins are.
