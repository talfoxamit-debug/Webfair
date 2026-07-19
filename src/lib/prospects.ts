/** Outbound prospecting pipeline, used by the /prospects CRM board. */

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
  call: { label: "Call first", short: "CALL", cls: "bg-emerald-100 text-emerald-700 dark:bg-lime/20 dark:text-lime", hint: "Real, local, established. Dial these first." },
  verify: { label: "Verify", short: "VERIFY", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300", hint: "Thin listing or out-of-area number. 30-sec Google check first." },
  skip: { label: "Skip", short: "SKIP", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300", hint: "Likely a lead-gen fake or wrong category. Don't waste dials." },
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
  source?: "audit" | "manual" | "import" | "quo" | "whatsapp"; // where the lead came from
  auditScore?: number; // score if they ran the site audit
  tags?: string[]; // manual labels (Hot, Cold, Many reviews, …)
  // Structured fields captured on a call (kept separate from freeform notes).
  callOutcome?: string; // last call result (see CALL_OUTCOMES)
  bestTime?: string; // when they said to call back (see BEST_TIMES)
  // Automation bookkeeping, so work never repeats itself.
  emailCheckedAt?: number; // ms epoch: when "Find emails" last scanned this site (found or not)
  exportedAt?: number; // ms epoch: when last included in an Instantly export
  quoSyncedSig?: string; // signature of what was last pushed to Quo (auto-sync dedupe)
};

/** Structured outcome of the last call: a dropdown, not freeform. */
export const CALL_OUTCOMES = [
  "No answer",
  "Left voicemail",
  "Gatekeeper: no decision-maker",
  "Spoke: interested",
  "Spoke: asked to email info",
  "Spoke: not interested",
  "Callback scheduled",
  "Wrong number",
  "Do not call",
] as const;

/** Best time to reach them, captured on a call. */
export const BEST_TIMES = ["Morning", "Afternoon", "Evening", "Weekend"] as const;

// ---- Phone-number quality ------------------------------------------------
// South-Florida area codes we actually sell into. A local fence contractor
// has a local number; toll-free / out-of-area numbers are usually a chain,
// aggregator, or answering service, not the owner you want on the phone.
// South Florida area codes: Broward (954/754), Palm Beach (561, overlay 728),
// Miami-Dade (305/786, overlay 645). 472 was never assigned, so it is not here.
export const SOFLA_AREA_CODES = new Set(["954", "754", "561", "728", "786", "305", "645"]);
const TOLLFREE_CODES = new Set(["800", "888", "877", "866", "855", "844", "833"]);

export type PhoneFlag = "ok" | "tollfree" | "outarea" | "invalid" | "empty";

/** Strip a raw phone to NANP digits (drops a leading country-code 1). */
export function phoneDigits(raw: string): string {
  let d = (raw || "").replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") d = d.slice(1);
  return d;
}

/** Classify a phone number so the CRM can flag junk before you dial it. */
export function phoneCheck(raw: string): { flag: PhoneFlag; label: string; dial: string; pretty: string } {
  const trimmed = (raw || "").trim();
  if (!trimmed) return { flag: "empty", label: "No number on file", dial: "", pretty: "" };
  const d = phoneDigits(trimmed);
  if (d.length !== 10) return { flag: "invalid", label: `Not a valid 10-digit number (${d.length} digits)`, dial: d, pretty: trimmed };
  const area = d.slice(0, 3), exch = d.slice(3, 6);
  const pretty = `(${area}) ${exch}-${d.slice(6)}`;
  if (/^[01]/.test(area) || /^[01]/.test(exch)) return { flag: "invalid", label: "Invalid area/exchange code", dial: d, pretty };
  if (TOLLFREE_CODES.has(area)) return { flag: "tollfree", label: "Toll-free: likely a chain/aggregator, not the local owner", dial: d, pretty };
  if (!SOFLA_AREA_CODES.has(area)) return { flag: "outarea", label: `Out-of-area (${area}): verify it's the local business`, dial: d, pretty };
  return { flag: "ok", label: "", dial: d, pretty };
}

/** Meta for the phone flag chips shown in the CRM. */
export const PHONE_FLAG_META: Record<Exclude<PhoneFlag, "ok">, { short: string; cls: string }> = {
  tollfree: { short: "TOLL-FREE", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" },
  outarea: { short: "OUT-OF-AREA", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" },
  invalid: { short: "BAD #", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" },
  empty: { short: "NO #", cls: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300" },
};

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

// ---- Live call script (the in-drawer "call console") ---------------------
// Structured so the CRM can render it as tappable chapters/steps you navigate
// live on a call, not one wall of text. Each move = a `cue` (when/why, or the
// objection you just heard) and the `say` line to speak. {{merge}} fields are
// filled per lead. `only` shows a move for just has-site or no-site leads.

export type CallMove = {
  cue: string; // the trigger / when-to-use, doubles as the tappable header
  say: string; // the words to say (filled with {{merge}} fields)
  note?: string; // tiny reminder under the line
  only?: "site" | "nosite"; // show only for leads with / without a website
};

export type CallChapter = {
  key: string;
  tab: string; // short tab label (with emoji) for the console
  title: string;
  when: string; // one-liner: when you're in this part of the call
  why?: string; // collapsible coaching (tonality / strategy), hidden by default
  moves: CallMove[];
};

export const CALL_SCRIPT: CallChapter[] = [
  {
    key: "opener",
    tab: "☎️ Opener",
    title: "Opener: the owner picked up",
    when: "A person answered and it's the owner (or could be).",
    why: "Say it relaxed and a little bored, like a peer calling back, NOT chipper. That tone is 80% of why it lands. And frame each ask as a \"no\" question: a \"yes\" question asks them to commit (guard up); a \"no\" question just asks them not to reject you (feels safe, same green light).",
    moves: [
      {
        cue: "Open: they HAVE a website (run the audit first so it's true)",
        say: `"Hey, is this {{owner}}? ... {{owner}}, it's just Tal, I'm actually looking at your website right now and noticed {{gap}}. That's the only reason I called. Is now a terrible time?"`,
        note: "Referencing something REAL about them is the pattern interrupt that stops the hang-up.",
        only: "site",
      },
      {
        cue: "Open: they have NO website (a hole they can't see)",
        say: `"Hey {{owner}}, it's just Tal, I was searching fence companies in {{city}} and noticed you don't really come up anywhere. Figured you'd want to know. Is this a bad time?"`,
        only: "nosite",
      },
      {
        cue: "They said go ahead: make the GIVE (don't pitch)",
        say: `"So I actually put together a rough concept of what {{business}}'s site could look like. Would it be crazy for me to just text you the link so you can look whenever?"`,
      },
      {
        cue: "\"No, not crazy\" = yes: get the number, get off",
        say: `"Perfect, what's the best cell? ... Sending it now. No pressure at all, take a look and if you like it we'll talk."`,
      },
    ],
  },
  {
    key: "gatekeeper",
    tab: "🚪 Gatekeeper",
    title: "Gatekeeper: a receptionist / answering service",
    when: "Someone who isn't the owner picked up.",
    why: "Goal is to get routed to the owner, NOT to pitch her. Sound casual and a little humble, like you're just trying to find the right person. Explaining yourself reads as 'salesperson' and gets you blocked.",
    moves: [
      {
        cue: "Best case: you know the owner's name, just ask",
        say: `"Hey, is {{owner}} around?"`,
        note: "No explanation. Most gatekeepers just transfer.",
      },
      {
        cue: "\"What's this about?\" Frame THEIR problem, not your product",
        say: `"Sure, I'm honestly not sure who I should be talking to. I'm trying to reach whoever's responsible for how {{business}} shows up when a homeowner Googles a fence company in {{city}}, because there could be quote requests slipping to competitors every month that nobody there even sees. Who would that be?"`,
      },
      {
        cue: "She hesitates to transfer: shrink the ask, flip to a \"no\"",
        say: `"No worries, would it be a problem if I just left a quick voicemail for him? Takes 20 seconds, he can call back if he wants."`,
        note: "\"No, not a problem\" is easy to say, and often rings him live anyway.",
      },
      {
        cue: "It's an answering service (can't transfer): get the asset",
        say: `"No problem, what's the best cell or email to reach {{owner}} directly? I've got something to send over for him."`,
      },
    ],
  },
  {
    key: "objections",
    tab: "🛡️ Objections",
    title: "Objections: tap the one you just heard",
    when: "Any pushback. Jump straight to it.",
    moves: [
      {
        cue: "\"Not interested\"",
        say: `"Totally fair, most guys I call already get plenty of referrals. Quick one though: when a homeowner Googles you before they call, what do they find? ... That's the only reason I reached out. Mind if I just text you the free mockup? Zero obligation."`,
      },
      {
        cue: "\"How much?\"",
        say: `"Sites start at $2,000, but honestly the mockup's free and there's no commitment. Want to just see it first, before we even talk price?"`,
      },
      {
        cue: "\"I'm busy / on a job\"",
        say: `"I hear you, that's exactly why I'll just text it instead of taking your time now. What's the best cell?"`,
      },
      {
        cue: "\"I already have a website\"",
        say: `"Saw it. Real quick, is it actually bringing you quote requests, or mostly just sitting there? ... I built a version focused on turning 'near me' searches into calls, want me to text it so you can compare?"`,
      },
      {
        cue: "\"Just email me\"",
        say: `"Will do. So it doesn't get buried, I'll text the link too, cool? Best number?"`,
      },
    ],
  },
  {
    key: "voicemail",
    tab: "📼 Voicemail",
    title: "Voicemail: no answer",
    when: "It went to voicemail. Keep it short.",
    moves: [
      {
        cue: "Leave this, then send the text",
        say: `"Hey {{owner}}, this is Tal with Stackwrk, I build websites for fence companies in {{city}}. I put together a quick concept of what your site could look like and wanted to send it over, no charge. Shoot me a text at (754) 551-2828 and I'll get it right to you. Thanks {{owner}}."`,
      },
    ],
  },
];

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
    label: "1. Cold-call opener (permission-based)",
    channel: "call",
    flow: "phone",
    body: `[TONALITY: say it relaxed and a little bored, like a peer calling back, NOT a chipper telemarketer. That tone is 80% of why it lands.]

[THE "NO" TRICK: a "yes" question asks them to commit something (time, attention). Guard goes up. A "no" question just asks them not to reject you, feels safe, costs nothing, but works as the same green light. Frame the two asks below so "no" is the answer that keeps you going.]

[PATTERN INTERRUPT: reference something REAL about them so it doesn't sound like a mass call. Run their site in the "Run audit" button above FIRST, so "I'm looking at it right now" is true, not a line. That's your version of "holding it in my hand."]
"Hey, is this {{owner}}? ... {{owner}}, it's just Tal, I'm actually looking at your website right now and noticed {{gap}}. That's the only reason I called. Is now a terrible time?"

[No website? Even stronger, a hole they can't see:]
"Hey {{owner}}, it's just Tal, I was searching fence companies in {{city}} and noticed you don't really come up anywhere. Figured you'd want to know. Is this a bad time?"

[They'll say "no, go ahead": that's your green light. Go straight to the GIVE, not a pitch:]
"So I actually put together a rough concept of what {{business}}'s site could look like. Would it be crazy for me to just text you the link so you can look whenever?"

[They'll say "no, not crazy": that's a yes. Get the number and get off the phone:]
"Perfect, what's the best cell? ... Sending it now. No pressure at all, take a look and if you like it we'll talk."`,
  },
  {
    key: "call_gatekeeper",
    label: "1a. Get past a receptionist / answering service",
    channel: "call",
    flow: "phone",
    body: `[Goal: get routed to {{owner}}, NOT to pitch her. Sound casual and a little humble, like you're just trying to find the right person.]

BEST CASE: you know the owner's name. Just ask, warm and confident, no explanation:
"Hey, is {{owner}} around?"
(Explaining yourself = 'salesperson' = blocked. Most gatekeepers just transfer.)

IF SHE ASKS "what's this about?" Frame THEIR problem, never your product:
"Sure, I'm honestly not sure who I should be talking to. I'm trying to reach whoever's responsible for how {{business}} shows up when a homeowner Googles a fence company in {{city}}, because there could be quote requests slipping to competitors every month that nobody there even sees. Who would that be?"

IF SHE HESITATES to transfer: shrink the ask AND flip it to a "no" question:
"No worries, would it be a problem if I just left a quick voicemail for him? Takes 20 seconds, he can call back if he wants."
("No, not a problem" costs her nothing to say, and it often rings him live anyway, or drops you into his personal cell VM where you leave the mockup pitch.)

IF IT'S AN ANSWERING SERVICE (only takes messages, can't transfer), don't pitch, get the asset:
"No problem, what's the best cell or email to reach {{owner}} directly? I've got something to send over for him."
Then move him to the text/email mockup channel.

Once you're actually on with {{owner}}, drop the routing talk and go direct. Use the opener above.`,
  },
  {
    key: "call_vm",
    label: "1b. Voicemail (no answer)",
    channel: "call",
    flow: "phone",
    body: `"Hey {{owner}}, this is Tal with Stackwrk, I build websites for fence companies in {{city}}. I put together a quick concept of what your site could look like and wanted to send it over, no charge. Shoot me a text at (754) 551-2828 and I'll get it right to you. Thanks {{owner}}."`,
  },
  {
    key: "call_objections",
    label: "1c. Objection handlers",
    channel: "call",
    flow: "phone",
    body: `"Not interested" → "Totally fair, most guys I call already get plenty of referrals. Quick one though: when a homeowner Googles you before they call, what do they find? ... That's the only reason I reached out. Mind if I just text you the free mockup? Zero obligation."

"How much?" → "Sites start at $2,000, but honestly the mockup's free and there's no commitment. Want to just see it first, before we even talk price?"

"I'm busy / on a job" → "I hear you, that's exactly why I'll just text it instead of taking your time now. What's the best cell?"

"I already have a website" → "Saw it. Real quick, is it actually bringing you quote requests, or mostly just sitting there? ... I built a version focused on turning 'near me' searches into calls, want me to text it so you can compare?"

"Just email me" → "Will do. So it doesn't get buried, I'll text the link too, cool? Best number?"`,
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

Worth a 10-minute call this week? Reply here, or call or text me at (754) 551-2828.

Tal
Stackwrk · stackwrk.com · (754) 551-2828`,
  },
  {
    key: "email_3",
    label: "3. Breakup (day 7)",
    channel: "email",
    flow: "email",
    subject: "should I close your file?",
    body: `Hi {{owner}}, I don't want to be a pest. If a better website isn't a priority right now, no problem and I'll stop reaching out.

If it is, I'll build you a free homepage mockup from your own project photos, no cost, no obligation. Just reply "mockup" and I'll get started, or call or text me at (754) 551-2828.

Tal
Stackwrk · stackwrk.com · (754) 551-2828`,
  },

  // ---------- DELIVERY (either pipeline) ----------
  {
    key: "mockup_deliver",
    label: "Mockup delivery",
    channel: "email",
    flow: "both",
    subject: "your new homepage for {{business}}",
    body: `Hi {{owner}}, here's the mockup I built for {{business}}: [link].

I rebuilt your homepage around your best work with an instant-quote form front and center. If you like it, I can have the full site live in about 14 business days. Want to hop on a quick call to walk through it, or just call or text me at (754) 551-2828?

Tal
Stackwrk · stackwrk.com · (754) 551-2828`,
  },
];
