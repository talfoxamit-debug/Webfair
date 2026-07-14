/** Outbound prospecting pipeline — used by the /prospects CRM board. */

export const PROSPECT_STAGES = [
  { key: "new", label: "New", hint: "Not contacted yet" },
  { key: "contacted", label: "Contacted", hint: "First touch sent" },
  { key: "follow_up", label: "Follow-up", hint: "Chasing a reply" },
  { key: "replied", label: "Replied", hint: "They responded" },
  { key: "call_booked", label: "Call booked", hint: "Meeting on the calendar" },
  { key: "proposal", label: "Proposal", hint: "Quote / mockup sent" },
  { key: "won", label: "Won", hint: "Signed & paid" },
  { key: "lost", label: "Lost", hint: "Dead / not a fit" },
] as const;

export type ProspectStage = (typeof PROSPECT_STAGES)[number]["key"];

export const STAGE_LABEL: Record<ProspectStage, string> = Object.fromEntries(
  PROSPECT_STAGES.map((s) => [s.key, s.label]),
) as Record<ProspectStage, string>;

/** Qualification tier for phone-only (no-website) leads. See playbook/08. */
export type ProspectTier = "call" | "verify" | "skip";

export const TIER_META: Record<ProspectTier, { label: string; short: string; cls: string; hint: string }> = {
  call: { label: "Call first", short: "CALL", cls: "bg-emerald-100 text-emerald-700 dark:bg-lime/20 dark:text-lime", hint: "Real, local, established — dial these first." },
  verify: { label: "Verify", short: "VERIFY", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300", hint: "Thin listing or out-of-area number — 30-sec Google check first." },
  skip: { label: "Skip", short: "SKIP", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300", hint: "Likely a lead-gen fake or wrong category — don't waste dials." },
};

export type Prospect = {
  id: string;
  name: string; // business name
  phone: string;
  email: string;
  website: string;
  hasSite: boolean; // false = hot prospect (no website)
  city: string;
  street: string;
  owner: string; // owner/contact name once known
  stage: ProspectStage;
  nextFollowUp: string; // ISO date (yyyy-mm-dd) or ""
  lastContacted: string; // ISO date or ""
  notes: string;
  createdAt: number;
  tier?: ProspectTier; // qualification tier for no-website leads
  source?: "audit" | "manual" | "import"; // where the lead came from
  auditScore?: number; // score if they ran the site audit
};

/** Message templates surfaced in the CRM with one-click copy + {{merge}} fields. */
export const TEMPLATES: { key: string; label: string; channel: "email" | "call" | "sms"; subject?: string; body: string }[] = [
  {
    key: "email_1",
    label: "Cold email #1 — mockup offer",
    channel: "email",
    subject: "quick idea for {{business}}'s website",
    body: `Hi {{owner}} — I build websites for fence companies here in {{city}}.

I saw {{business}} on Google and noticed {{gap}}. Homeowners comparing fence contractors almost always check the website first, so that's real jobs slipping to whoever looks most legit.

I put together a quick concept of what your homepage could look like — takes 30 seconds to look at. Want me to send the link?

— Tal
Stackwrk · stackwrk.com`,
  },
  {
    key: "email_2",
    label: "Follow-up #1 (day 3)",
    channel: "email",
    subject: "re: quick idea for {{business}}'s website",
    body: `Hi {{owner}} — following up on the fence-website concept I mentioned.

Here's a live example of the kind of site I build for fence pros: stackwrk.com/demos/apex-fence — instant quote form, reviews, financing, the works. Yours would have your name, your photos, your number.

Worth a 10-minute call this week?

— Tal`,
  },
  {
    key: "email_3",
    label: "Follow-up #2 (day 7 — breakup)",
    channel: "email",
    subject: "should I close your file?",
    body: `Hi {{owner}} — I don't want to be a pest. If a better website isn't a priority right now, no problem and I'll stop reaching out.

If it is, I'll build you a free homepage mockup from your own project photos — no cost, no obligation. Just reply "mockup" and I'll get started.

— Tal`,
  },
  {
    key: "call_open",
    label: "Cold-call opener",
    channel: "call",
    body: `"Hi, is this {{owner}}? — Hey {{owner}}, my name's Tal, I build websites for fence companies here in {{city}}. I'll be quick — I actually put together a rough concept of what {{business}}'s website could look like. Can I text or email you the link? … Great, and while I've got you — are you guys getting most of your jobs from referrals right now, or online too?"

[If interested] "Perfect. Give me 10 minutes this week and I'll walk you through it — what's better, Thursday or Friday afternoon?"`,
  },
  {
    key: "call_vm",
    label: "Voicemail",
    channel: "call",
    body: `"Hi {{owner}}, this is Tal with Stackwrk — I build websites for fence companies in {{city}}. I made a quick concept of what your site could look like and wanted to send it over. Shoot me a text at (754) 282-2149 and I'll get it to you. Thanks!"`,
  },
  {
    key: "sms",
    label: "Text after a call/VM",
    channel: "sms",
    body: `Hi {{owner}}, Tal from Stackwrk here — here's that fence-website concept I mentioned: stackwrk.com/demos/apex-fence. Happy to build you a free mockup with your own photos. Worth a quick call?`,
  },
  {
    key: "mockup_deliver",
    label: "Mockup delivery",
    channel: "email",
    subject: "your new homepage — {{business}}",
    body: `Hi {{owner}} — here's the mockup I built for {{business}}: [link].

I rebuilt your homepage around your best work with an instant-quote form front and center. If you like it, I can have the full site live in about 10 business days. Want to hop on a quick call to walk through it?

— Tal`,
  },
];
