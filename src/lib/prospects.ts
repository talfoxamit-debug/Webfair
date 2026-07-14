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
  tags?: string[]; // manual labels (Hot, Cold, Many reviews, …)
  // Structured fields captured on a call (kept separate from freeform notes).
  callOutcome?: string; // last call result (see CALL_OUTCOMES)
  bestTime?: string; // when they said to call back (see BEST_TIMES)
};

/** Structured outcome of the last call — a dropdown, not freeform. */
export const CALL_OUTCOMES = [
  "No answer",
  "Left voicemail",
  "Gatekeeper — no decision-maker",
  "Spoke — interested",
  "Spoke — asked to email info",
  "Spoke — not interested",
  "Callback scheduled",
  "Wrong number",
  "Do not call",
] as const;

/** Best time to reach them, captured on a call. */
export const BEST_TIMES = ["Morning", "Afternoon", "Evening", "Weekend"] as const;

/** One-tap tags to set before/after a call. Stored on prospect.tags. */
export const QUICK_TAGS = [
  "Hot", "Warm", "Cold", "Many reviews", "Few reviews",
  "Left VM", "Gatekeeper", "Decision-maker", "Callback", "Bilingual",
] as const;

/** Chip color for a tag (theme-aware Tailwind classes). */
export function tagStyle(tag: string): string {
  const t = tag.toLowerCase();
  if (t === "hot") return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
  if (t === "warm") return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  if (t === "cold") return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300";
  if (t === "many reviews") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
  if (t === "callback") return "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300";
  return "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200";
}

/** The two outreach pipelines. Templates are tagged with the flow they belong
 *  to so the CRM can present them as ordered sequences, not a flat pile. */
export const TEMPLATE_FLOWS = [
  { key: "phone", label: "📞 Phone-first", hint: "You call them, then send the follow-up email/text." },
  { key: "email", label: "✉️ Email-first", hint: "You email cold, then chase and try to get them on a call." },
  { key: "both", label: "📦 Delivery", hint: "Use in either pipeline once they're warm." },
] as const;

export type TemplateFlow = (typeof TEMPLATE_FLOWS)[number]["key"];

/** Message templates surfaced in the CRM with one-click copy + {{merge}} fields.
 *  Ordered within each flow so they read as a step-by-step sequence. */
export const TEMPLATES: { key: string; label: string; channel: "email" | "call" | "sms"; flow: TemplateFlow; subject?: string; body: string }[] = [
  // ---------- PHONE-FIRST pipeline ----------
  {
    key: "call_open",
    label: "1. Cold-call opener",
    channel: "call",
    flow: "phone",
    body: `"Hi, is this {{owner}}? — Hey {{owner}}, my name's Tal, I build websites for fence companies here in {{city}}. I'll be quick — I actually put together a rough concept of what {{business}}'s website could look like. Can I text or email you the link? … Great, and while I've got you — are you guys getting most of your jobs from referrals right now, or online too?"

[If interested] "Perfect. Give me 10 minutes this week and I'll walk you through it — what's better, Thursday or Friday afternoon?"`,
  },
  {
    key: "call_vm",
    label: "1b. Voicemail (no answer)",
    channel: "call",
    flow: "phone",
    body: `"Hi {{owner}}, this is Tal with Stackwrk — I build websites for fence companies in {{city}}. I made a quick concept of what your site could look like and wanted to send it over. Shoot me a text at (754) 551-2828 and I'll get it to you. Thanks!"`,
  },
  {
    key: "post_call_offer",
    label: "2. After the call: what we offer (email)",
    channel: "email",
    flow: "phone",
    subject: "Stackwrk: what I can build for {{business}}",
    body: `Hi {{owner}},

Great talking with you just now. As promised, here's exactly what I do for fence companies like {{business}}:

• A fast, mobile-first website built to turn "fence company near me" searches into quote requests
• Instant quote form + click-to-call so a homeowner reaches you in one tap
• Reviews, financing, warranty and service-area pages that build trust and rank on Google
• Live in about 2 weeks, and you own 100% of it, no lock-in

Here's the exact kind of site I build (yours gets your name, photos and number):
stackwrk.com/demos/apex-fence

Simple, fixed pricing:
• Launch: $2,000 (5-page lead-capture site)
• Growth: $4,500 (8 pages + custom tools like an instant quote/estimator)
• Optional care plan from $99/mo, covering hosting, updates, backups and edits

No-risk next step: I'll build you a FREE homepage mockup from your own project photos, no cost, no obligation. If you love it, we go live; if not, no hard feelings. Want me to start on it?

Thanks,
Tal, Stackwrk
stackwrk.com · (754) 551-2828 · hello@stackwrk.com`,
  },
  {
    key: "sms",
    label: "2b. Text after a call/VM",
    channel: "sms",
    flow: "phone",
    body: `Hi {{owner}}, Tal from Stackwrk here. Here's that fence-website concept I mentioned: stackwrk.com/demos/apex-fence. Happy to build you a free mockup with your own photos. Worth a quick call?`,
  },

  // ---------- EMAIL-FIRST pipeline ----------
  {
    key: "email_1",
    label: "1. Cold email: mockup offer",
    channel: "email",
    flow: "email",
    subject: "quick idea for {{business}}'s website",
    body: `Hi {{owner}}, I build websites for fence companies here in {{city}}.

I saw {{business}} on Google and noticed {{gap}}. Homeowners comparing fence contractors almost always check the website first, so that's real jobs slipping to whoever looks most legit.

I put together a quick concept of what your homepage could look like, and it takes 30 seconds to look at. Want me to send the link?

Tal
Stackwrk · stackwrk.com · (754) 551-2828`,
  },
  {
    key: "email_2",
    label: "2. Follow-up (day 3)",
    channel: "email",
    flow: "email",
    subject: "re: quick idea for {{business}}'s website",
    body: `Hi {{owner}}, following up on the fence-website concept I mentioned.

Here's a live example of the kind of site I build for fence pros: stackwrk.com/demos/apex-fence, with an instant quote form, reviews, financing, the works. Yours would have your name, your photos, your number.

Worth a 10-minute call this week?

Tal`,
  },
  {
    key: "email_3",
    label: "3. Breakup (day 7)",
    channel: "email",
    flow: "email",
    subject: "should I close your file?",
    body: `Hi {{owner}}, I don't want to be a pest. If a better website isn't a priority right now, no problem and I'll stop reaching out.

If it is, I'll build you a free homepage mockup from your own project photos, no cost, no obligation. Just reply "mockup" and I'll get started.

Tal`,
  },

  // ---------- DELIVERY (either pipeline) ----------
  {
    key: "mockup_deliver",
    label: "Mockup delivery",
    channel: "email",
    flow: "both",
    subject: "your new homepage for {{business}}",
    body: `Hi {{owner}}, here's the mockup I built for {{business}}: [link].

I rebuilt your homepage around your best work with an instant-quote form front and center. If you like it, I can have the full site live in about 10 business days. Want to hop on a quick call to walk through it?

Tal`,
  },
];
