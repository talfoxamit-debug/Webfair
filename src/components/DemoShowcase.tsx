"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Calendar, Check, Sparkles, TrendUp } from "./icons";

/** Lead-capture CTA shared by every demo: routes to the #about audit form. */
function DemoCTA({ label }: { label: string }) {
  return (
    <a
      href="#about"
      className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-lime/30 bg-lime/[0.07] px-4 py-2.5 text-sm font-semibold text-lime transition-colors hover:border-lime/50 hover:bg-lime/[0.12]"
    >
      {label}
      <ArrowRight width={16} height={16} />
    </a>
  );
}

/* ---------------------------------------------------------------- Booking */
const SLOTS = [
  { label: "9:00 AM", h: 9, m: 0 },
  { label: "10:30 AM", h: 10, m: 30 },
  { label: "12:00 PM", h: 12, m: 0 },
  { label: "1:30 PM", h: 13, m: 30 },
  { label: "3:00 PM", h: 15, m: 0 },
  { label: "4:30 PM", h: 16, m: 30 },
] as const;

/** Next N weekdays from today (client-side; computed after mount to stay SSR-safe). */
function nextWeekdays(n: number): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) out.push(new Date(d));
  }
  return out;
}

function gcalUrl(start: Date, end: Date): string {
  const fmt = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: "Intro call with Stackwrk",
    details: "30-min intro call. We'll review your site and goals. No obligation.",
    dates: `${fmt(start)}/${fmt(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

const whenLabel = (d: Date, s: (typeof SLOTS)[number]) =>
  `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${s.label}`;

function BookingDemo() {
  const [days, setDays] = useState<Date[]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [slotIdx, setSlotIdx] = useState<number | null>(null);
  const [step, setStep] = useState<"select" | "details" | "done">("select");
  const [submitting, setSubmitting] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState({ when: "", cal: "" });

  useEffect(() => setDays(nextWeekdays(6)), []);

  const day = days[dayIdx];
  const slot = slotIdx !== null ? SLOTS[slotIdx] : null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || !day || !slot) return;
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const start = new Date(day);
    start.setHours(slot.h, slot.m, 0, 0);
    const end = new Date(start.getTime() + 30 * 60000);
    const when = whenLabel(day, slot);
    const cal = gcalUrl(start, end);
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, company: data.company, when, calUrl: cal }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setEmailed(Boolean(json.emailed));
        setConfirmed({ when, cal });
        setStep("done");
        return;
      }
      setError(json.message || "Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    "w-full rounded-lg border border-white/12 bg-ink-800/70 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-lime/60 focus:ring-2 focus:ring-lime/20";

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-ink shadow-[0_0_30px_-4px_rgba(203,255,60,0.85)]">
          <Check width={28} height={28} />
        </span>
        <h4 className="mt-4 font-display text-2xl uppercase text-white">You&rsquo;re booked!</h4>
        <p className="mt-2 max-w-xs text-sm text-white/65">
          <span className="font-semibold text-lime">{confirmed.when}</span>.{" "}
          {emailed ? "A confirmation just hit your inbox." : "We’ll confirm by email shortly."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href={confirmed.cal} target="_blank" rel="noopener noreferrer" className="btn-primary !rounded-md !py-2.5 !text-xs">
            Add to calendar <ArrowRight width={16} height={16} />
          </a>
          <button onClick={() => { setStep("select"); setSlotIdx(null); }} className="btn-ghost !rounded-md !py-2.5 !text-xs">
            Book another
          </button>
        </div>
      </div>
    );
  }

  if (step === "details" && day && slot) {
    return (
      <div className="p-5 sm:p-7">
        <button onClick={() => setStep("select")} className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/50 transition-colors hover:text-white">
          ← Change time
        </button>
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-lime/25 bg-lime/[0.06] px-4 py-3 text-sm">
          <Calendar width={18} height={18} className="text-lime" />
          <span className="font-semibold text-lime">{whenLabel(day, slot)}</span>
        </div>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
          <input name="name" type="text" required placeholder="Your name" className={field} />
          <input name="email" type="email" required placeholder="Email address" className={field} />
          <input name="phone" type="tel" placeholder="Phone (optional)" className={field} />
          {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full !rounded-md disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Booking…" : "Confirm meeting"}
            {!submitting && <ArrowRight width={18} height={18} />}
          </button>
          <p className="text-center text-[0.75rem] text-white/35">Instant confirmation + calendar invite. No spam.</p>
        </form>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-7">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Calendar width={18} height={18} className="text-lime" /> Pick a day
      </div>
      <div className="flex flex-wrap gap-2">
        {days.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-[3.1rem] w-16 animate-pulse rounded-lg bg-white/[0.06]" />
            ))
          : days.map((d, i) => (
              <button
                key={i}
                onClick={() => setDayIdx(i)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium leading-tight transition-colors ${
                  dayIdx === i ? "border-lime bg-lime/15 text-lime" : "border-white/12 text-white/70 hover:border-white/30"
                }`}
              >
                <span className="block text-[0.75rem] uppercase tracking-wide opacity-70">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </button>
            ))}
      </div>
      <div className="mb-3 mt-6 text-sm font-semibold text-white">Available times</div>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setSlotIdx(i)}
            className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              slotIdx === i ? "border-lime bg-lime/15 text-lime" : "border-white/12 text-white/70 hover:border-white/30"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => slotIdx !== null && setStep("details")}
        disabled={slotIdx === null || days.length === 0}
        className="btn-primary mt-6 w-full !rounded-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue
        <ArrowRight width={18} height={18} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- Calculator */
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

function CalculatorDemo() {
  const [visitors, setVisitors] = useState(3000);
  const [value, setValue] = useState(180);
  const current = 1.6;
  const improved = 4.4;
  const currentRev = (visitors * current) / 100 * value;
  const improvedRev = (visitors * improved) / 100 * value;
  const uplift = improvedRev - currentRev;

  return (
    <div className="p-5 sm:p-7">
      <label className="block text-sm font-semibold text-white">
        Monthly visitors: <span className="text-lime">{visitors.toLocaleString()}</span>
        <input
          type="range" min={200} max={20000} step={100} value={visitors}
          onChange={(e) => setVisitors(Number(e.target.value))}
          className="mt-2 w-full accent-lime"
        />
      </label>
      <label className="mt-5 block text-sm font-semibold text-white">
        Average sale value: <span className="text-lime">{money(value)}</span>
        <input
          type="range" min={20} max={2000} step={10} value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="mt-2 w-full accent-lime"
        />
      </label>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-white/40">Your site now</p>
          <p className="mt-1 font-display text-2xl text-white/70">{money(currentRev)}</p>
          <p className="text-xs text-white/40">/mo · {current}% convert</p>
        </div>
        <div className="rounded-xl border border-lime/30 bg-lime/[0.06] p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-lime">With a Stackwrk site</p>
          <p className="mt-1 font-display text-2xl text-white">{money(improvedRev)}</p>
          <p className="text-xs text-white/50">/mo · {improved}% convert</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-lime/25 bg-lime/[0.04] py-3 text-center">
        <TrendUp width={18} height={18} className="text-lime" />
        <span className="text-sm text-white/80">
          <span className="font-display text-lg text-lime">+{money(uplift)}/mo</span> in recovered revenue
        </span>
      </div>
      <p className="mt-3 text-center text-[0.75rem] text-white/35">
        Illustrative: real lift depends on your traffic &amp; offer.
      </p>
      <DemoCTA label="Get this uplift on your site" />
    </div>
  );
}

/* ---------------------------------------------------------------- Chatbot */
type Msg = { from: "bot" | "user"; text: string };

const QUICK = [
  "What are your hours?",
  "Do you give free quotes?",
  "How much does a site cost?",
];

/**
 * Tiny on-device "AI" for the demo: keyword-intent matching with a graceful
 * lead-capture fallback. No backend. It shows how a real assistant would
 * answer FAQs and route anything it can't answer into a captured lead.
 */
const INTENTS: { keys: string[]; a: string }[] = [
  { keys: ["hour", "open", "close", "time", "when"], a: "We're open Mon–Sat, 9am–6pm. Want me to book you the next available slot?" },
  { keys: ["quote", "estimate", "free"], a: "Yes. Free, no-obligation quotes. Drop your name and I'll have someone reach out within the hour." },
  { keys: ["price", "cost", "how much", "budget", "pricing", "rate"], a: "Most projects start around $2,000 and scale with what you need. Want a tailored quote in 2 minutes?" },
  { keys: ["where", "located", "location", "address", "area"], a: "We serve the whole metro area and work with clients remotely. Want directions or a callback?" },
  { keys: ["book", "appointment", "schedule", "slot", "meeting"], a: "Happy to book you in. I've got openings this week. What day works best for you?" },
  { keys: ["service", "do you", "offer", "build", "make", "website", "app"], a: "We build fast, custom websites and web apps: booking tools, calculators, AI chat and more. What are you looking to build?" },
  { keys: ["contact", "phone", "call", "email", "reach"], a: "Easiest way is right here. Share your email and I'll make sure the team follows up today." },
  { keys: ["hello", "hi", "hey", "yo"], a: "Hey! 👋 Ask me anything about hours, pricing, or booking. Or tell me what you're building." },
  { keys: ["thank", "thanks", "great", "awesome", "cool"], a: "Anytime! Want me to grab your details so a human can take it from here?" },
];

function respond(text: string): string {
  const t = text.toLowerCase();
  const hit = INTENTS.find((i) => i.keys.some((k) => t.includes(k)));
  if (hit) return hit.a;
  return "Good question. Let me get that to the right person. What's the best email to send a full answer to? (This is exactly how the bot captures a lead on your real site.)";
}

function ChatbotDemo() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi! 👋 I'm your site's AI assistant. Ask me anything. I never sleep." },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, typing]);

  function send(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text: q }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: respond(q) }]);
    }, 750 + Math.min(q.length * 12, 600));
  }

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 280 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <span
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.from === "user" ? "bg-lime text-ink" : "bg-ink-800/80 text-white/85"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <span className="flex gap-1 rounded-2xl bg-ink-800/80 px-4 py-3">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-white/50" style={{ animationDelay: `${d * 0.2}s` }} />
              ))}
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={typing}
            className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-lime/50 hover:text-lime disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Free-text input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-3 flex items-center gap-2 rounded-full border border-white/12 bg-ink-800/60 py-1.5 pl-4 pr-1.5 focus-within:border-lime/50"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your own question…"
          aria-label="Ask the assistant anything"
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime text-ink transition-opacity disabled:opacity-30"
        >
          <ArrowRight width={16} height={16} />
        </button>
      </form>

      <DemoCTA label="Put this AI assistant on your site" />
    </div>
  );
}

/* ------------------------------------------------------------ Before/After */
function BeforeAfterDemo() {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  function posFromClientX(clientX: number) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(3, Math.min(97, pct)));
  }

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    posFromClientX(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragging) posFromClientX(e.clientX);
  }
  function endDrag(e: React.PointerEvent) {
    setDragging(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }
  // Keyboard support on the handle
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(3, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(97, p + 4));
  }

  return (
    <div className="p-5 sm:p-7">
      {/* legend: makes it unmistakable which side is which */}
      <div className="mb-3 flex items-center justify-between text-[0.75rem] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-white/45">
          <span aria-hidden="true">◀</span> Before · dated
        </span>
        <span className="flex items-center gap-1.5 text-lime">
          After · built to sell <span aria-hidden="true">▶</span>
        </span>
      </div>

      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="slider"
        aria-label="Drag to compare the old site with the redesign"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={`relative aspect-[16/10] w-full touch-none select-none overflow-hidden rounded-xl border border-white/12 ${
          dragging ? "cursor-grabbing" : "cursor-ew-resize"
        }`}
      >
        {/* AFTER (modern). An art-directed hero: aurora mesh, rating + avatars,
            and a floating glass booking widget. Reads as a real premium site.
            `isolate` keeps its inner z-index from bleeding over the BEFORE pane. */}
        <div className="absolute inset-0 isolate overflow-hidden">
          {/* aurora-mesh background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#0c0718",
              backgroundImage:
                "radial-gradient(42% 55% at 80% 10%, rgba(255,45,155,0.55), transparent 60%)," +
                "radial-gradient(46% 62% at 96% 72%, rgba(124,58,237,0.6), transparent 62%)," +
                "radial-gradient(52% 60% at 52% 104%, rgba(46,107,255,0.5), transparent 60%)," +
                "radial-gradient(34% 46% at 62% 44%, rgba(203,255,60,0.12), transparent 60%)",
            }}
          />
          <div className="grid-backdrop absolute inset-0 opacity-[0.07]" />
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          {/* readability scrim behind the right-anchored copy */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-black/45 via-black/15 to-transparent" />

          {/* top nav */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-2.5 sm:px-5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-lime text-[0.75rem] font-black leading-none text-ink">B</span>
              <span className="text-[0.75rem] font-bold uppercase tracking-wider text-white">Bold Studio</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-[0.75rem] font-medium text-white/60 sm:inline">Menu</span>
              <span className="hidden text-[0.75rem] font-medium text-white/60 sm:inline">About</span>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-[0.75rem] font-bold uppercase text-white ring-1 ring-inset ring-white/15 backdrop-blur">
                Book
              </span>
            </div>
          </div>

          {/* hero copy: right-anchored so the punchline shows at a middle split */}
          <div className="absolute right-4 top-[52%] z-10 max-w-[70%] -translate-y-1/2 text-right sm:right-6 sm:max-w-[60%]">
            <div className="mb-1.5 flex items-center justify-end gap-1.5">
              <span className="text-[0.75rem] leading-none tracking-tight text-lime">★★★★★</span>
              <span className="text-[0.75rem] text-white/60">5.0 · 240 reviews</span>
            </div>
            <p className="font-display text-2xl uppercase leading-[0.88] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] sm:text-[2.5rem]">
              Modern.<br />Fast.<br />
              <span className="text-accent-glow">Converts.</span>
            </p>
            <p className="mt-2 hidden text-[0.75rem] leading-snug text-white/75 sm:ml-auto sm:block sm:max-w-[15rem]">
              A site that turns visitors into booked customers, on any device.
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className="hidden items-center rounded-md border border-white/25 px-2.5 py-1.5 text-[0.75rem] font-semibold text-white/85 sm:inline-flex">
                View menu
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-lime px-3 py-1.5 text-[0.75rem] font-bold uppercase text-ink shadow-[0_0_24px_-4px_rgba(203,255,60,0.85)]">
                Book now →
              </span>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <div className="flex -space-x-1.5">
                {["from-flare-orange to-flare-red", "from-flare-red to-flare-purple", "from-flare-purple to-flare-blue", "from-flare-blue to-lime"].map((g, i) => (
                  <span key={i} className={`h-4 w-4 rounded-full border border-ink bg-gradient-to-br ${g}`} />
                ))}
              </div>
              <span className="text-[0.75rem] text-white/55">2,000+ booked this year</span>
            </div>
          </div>

          {/* floating glass booking widget: the "wow" element */}
          <div className="absolute bottom-3 left-3 z-10 hidden w-40 rounded-xl border border-white/15 bg-white/[0.08] p-2.5 shadow-2xl backdrop-blur-md md:block">
            <div className="flex items-center justify-between">
              <span className="text-[0.75rem] font-bold uppercase tracking-wide text-white">Book a table</span>
              <span className="flex items-center gap-1 text-[0.75rem] text-lime">
                <span className="h-1 w-1 rounded-full bg-lime" /> Live
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {["6:00", "7:30", "8:00", "8:30", "9:00", "9:30"].map((t, i) => (
                <span key={t} className={`rounded py-1 text-center text-[0.75rem] font-medium ${i === 2 ? "bg-lime text-ink" : "bg-white/10 text-white/70"}`}>
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-2 rounded-md bg-lime py-1 text-center text-[0.75rem] font-bold uppercase text-ink">Confirm</div>
          </div>
        </div>
        {/* BEFORE (dated): a cluttered 2003 site; fixed inner width so it never reflows */}
        <div className="absolute inset-0 overflow-hidden bg-[#d9d7cc]" style={{ width: `${pos}%` }}>
          <div
            className="h-full font-serif text-[#3a3a44]"
            style={{
              width: 880,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(0,0,0,0.035) 0 9px, transparent 9px 18px)",
            }}
          >
            {/* title bar */}
            <div className="flex items-center justify-between border-b-2 border-[#8a8677] bg-gradient-to-b from-[#3b6ea5] to-[#26456f] px-4 py-1.5">
              <span className="text-sm font-bold text-yellow-200 [text-shadow:1px_1px_0_#000]">★ Bob&rsquo;s Plumbing &amp; Sons ★</span>
              <span className="text-[0.75rem] italic text-white/80">est. 2003</span>
            </div>
            {/* welcome marquee */}
            <div className="overflow-hidden border-b border-[#b8b4a8] bg-[#fff7c4] py-[3px]">
              <div className="w-max animate-marquee whitespace-nowrap text-[0.75rem] font-bold text-[#a2331f]">
                ◆ Welcome to our homepage! ◆ Best viewed in Internet Explorer 6 at 800×600 ◆ Sign our guestbook! ◆&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
            </div>
            {/* nav */}
            <div className="flex gap-3 border-b border-[#c4c0b4] bg-[#c8c4b8] px-4 py-1 text-[0.75rem] text-[#1a3b8f] underline">
              <span>Home</span><span>About Us</span><span>Services</span><span>Guestbook</span><span>Contact</span>
            </div>
            {/* body: sidebar + main */}
            <div className="flex gap-3 px-4 py-3">
              <div className="w-24 shrink-0 space-y-1.5 text-center">
                <div className="border-2 border-[#a8a498] bg-[#e8e6de] p-1">
                  <div className="text-[0.75rem] font-bold text-[#556]">Visitors</div>
                  <div className="mt-0.5 bg-black px-1 font-mono text-[0.75rem] font-bold text-[#33ff33]">0012427</div>
                </div>
                <div className="animate-pulse-glow text-[0.75rem] font-bold leading-tight text-[#c33]">★ Under<br />Construction ★</div>
                <div className="border border-[#8888aa] bg-[#dde] px-1 py-0.5 text-[0.75rem] leading-tight text-[#2222aa]">Sign our<br />Guestbook!</div>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-[#2a2a3a]">Welcome To Our Business!!!</span>
                <span className="mt-0.5 block text-[0.75rem] italic text-[#556677]">Quality plumbing you can trust since 2003.</span>
                <div className="mt-2 flex gap-2">
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center border-2 border-[#a8a498] bg-[#e6e4dc] text-[0.75rem] text-[#8899aa]">[ photo.jpg ]</div>
                  <span className="text-[0.75rem] leading-relaxed text-[#445566]">
                    We are a family-owned company providing the BEST service in town! Call us during business
                    hours Mon–Fri 9–5. We fix drains, pipes &amp; water heaters. Ask about our specials!
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="border border-[#888] bg-gradient-to-b from-[#f4f4f0] to-[#c8c4b8] px-2 py-0.5 text-[0.75rem] text-[#333]">Submit »</span>
                  <span className="text-[0.75rem] text-[#8899aa]">✉ webmaster@aol.com</span>
                </div>
              </div>
            </div>
            {/* footer */}
            <div className="border-t border-[#c4c0b4] px-4 py-1 text-center text-[0.75rem] text-[#778899]">
              © 2003 Bob&rsquo;s Plumbing &amp; Sons · This site is under construction · HTML 4.0
            </div>
          </div>
        </div>
        {/* Divider + grabbable handle (whole frame is draggable; handle is the affordance) */}
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="h-full w-0.5 -translate-x-1/2 bg-lime shadow-[0_0_12px_rgba(203,255,60,0.6)]" />
          <div
            className={`absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-lime bg-ink text-sm text-lime shadow-[0_0_20px_-2px_rgba(203,255,60,0.7)] transition-transform ${
              dragging ? "scale-110" : "animate-pulse-glow"
            }`}
          >
            ↔
          </div>
          {/* explicit drag hint above the handle */}
          <span
            className={`absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-lime px-2 py-0.5 text-[0.75rem] font-bold uppercase tracking-wider text-ink shadow transition-opacity ${
              dragging ? "opacity-0" : "opacity-100"
            }`}
          >
            Drag
          </span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-white/45">
        Drag anywhere on the image. Same business, redesigned to sell.
      </p>
      <DemoCTA label="Get a redesign like this" />
    </div>
  );
}

/* ----------------------------------------------------------------- CRM */
const CRM_STAGES = [
  { key: "new", label: "New", dot: "bg-white/50", head: "text-white/70" },
  { key: "contacted", label: "Contacted", dot: "bg-flare-blue", head: "text-flare-blue" },
  { key: "booked", label: "Call booked", dot: "bg-flare-orange", head: "text-flare-orange" },
  { key: "won", label: "Won", dot: "bg-lime", head: "text-lime" },
] as const;

type Stage = (typeof CRM_STAGES)[number]["key"];
type Deal = { id: number; name: string; source: string; value: number; stage: Stage };

const SEED_DEALS: Deal[] = [
  { id: 1, name: "Marisa · Café", source: "Audit form", value: 3200, stage: "new" },
  { id: 2, name: "Above Air HVAC", source: "AI chat", value: 5400, stage: "new" },
  { id: 3, name: "Coastal Dental", source: "Booking", value: 4200, stage: "contacted" },
  { id: 4, name: "YatHub", source: "Referral", value: 8000, stage: "contacted" },
  { id: 5, name: "Marco's · FTL", source: "Audit form", value: 2600, stage: "booked" },
  { id: 6, name: "SeaTop Homes", source: "Referral", value: 9500, stage: "won" },
];

const STAGE_ORDER: Stage[] = ["new", "contacted", "booked", "won"];
const nextStage = (s: Stage): Stage =>
  STAGE_ORDER[Math.min(STAGE_ORDER.indexOf(s) + 1, STAGE_ORDER.length - 1)];

/**
 * Interactive CRM demo: a live pipeline board. Every lead the site captures
 * (audit form, AI chat, booking widget) lands here as a card. Tap a card to
 * advance it down the pipeline; the pipeline value + won total update live.
 * Pure client state: mirrors the real /crm board Stackwrk ships to clients.
 */
function CrmDemo() {
  const [deals, setDeals] = useState<Deal[]>(SEED_DEALS);

  const advance = (id: number) =>
    setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, stage: nextStage(d.stage) } : d)));
  const reset = () => setDeals(SEED_DEALS);

  const open = deals.filter((d) => d.stage !== "won");
  const pipeline = open.reduce((s, d) => s + d.value, 0);
  const won = deals.filter((d) => d.stage === "won").reduce((s, d) => s + d.value, 0);

  return (
    <div className="p-4 sm:p-6">
      {/* live totals */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 rounded-xl border border-white/10 bg-ink-800/60 px-4 py-3">
          <p className="text-[0.75rem] uppercase tracking-widest text-white/40">Open pipeline</p>
          <p className="font-display text-xl text-white">{money(pipeline)}</p>
        </div>
        <div className="flex-1 rounded-xl border border-lime/30 bg-lime/[0.06] px-4 py-3">
          <p className="text-[0.75rem] uppercase tracking-widest text-lime">Won this month</p>
          <p className="font-display text-xl text-white">{money(won)}</p>
        </div>
      </div>

      {/* board: scrolls sideways on small panels */}
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-[460px] gap-2">
          {CRM_STAGES.map((stage) => {
            const cards = deals.filter((d) => d.stage === stage.key);
            return (
              <div key={stage.key} className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-1.5 px-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
                  <span className={`text-[0.75rem] font-semibold uppercase tracking-wide ${stage.head}`}>
                    {stage.label}
                  </span>
                  <span className="ml-auto text-[0.75rem] tabular-nums text-white/35">{cards.length}</span>
                </div>
                <div className="min-h-[3rem] space-y-2 rounded-lg bg-white/[0.015] p-1.5">
                  {cards.map((d) => {
                    const done = d.stage === "won";
                    return (
                      <button
                        key={d.id}
                        onClick={() => !done && advance(d.id)}
                        disabled={done}
                        className={`group block w-full rounded-lg border p-2 text-left transition-all ${
                          done
                            ? "cursor-default border-lime/30 bg-lime/[0.07]"
                            : "border-white/10 bg-ink-800/70 hover:-translate-y-0.5 hover:border-lime/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-[0.78rem] font-semibold text-white">{d.name}</span>
                          {done ? (
                            <Check width={12} height={12} className="shrink-0 text-lime" />
                          ) : (
                            <ArrowRight
                              width={12}
                              height={12}
                              className="shrink-0 text-white/25 transition-colors group-hover:text-lime"
                            />
                          )}
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <span className="truncate text-[0.75rem] text-white/40">{d.source}</span>
                          <span className="shrink-0 text-[0.75rem] font-medium tabular-nums text-lime/80">
                            {money(d.value)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-0.5">
        <p className="text-[0.75rem] text-white/40">Tap a lead to move it down the pipeline.</p>
        <button onClick={reset} className="text-[0.75rem] font-medium text-white/45 transition-colors hover:text-lime">
          Reset
        </button>
      </div>

      <DemoCTA label="Get a CRM like this on your site" />
    </div>
  );
}

/* ------------------------------------------------------------- Showcase */
const TABS = [
  { key: "booking", label: "Booking widget", note: "Let homeowners request quotes 24/7", render: <BookingDemo /> },
  { key: "calc", label: "Revenue calculator", note: "Show ROI in real numbers", render: <CalculatorDemo /> },
  { key: "chat", label: "AI assistant", note: "Answer & capture leads", render: <ChatbotDemo /> },
  { key: "crm", label: "Lead CRM", note: "Track every lead to won", render: <CrmDemo /> },
  { key: "redesign", label: "Before / After", note: "Modernize a tired site", render: <BeforeAfterDemo /> },
];

export default function DemoShowcase() {
  const [active, setActive] = useState("booking");
  const current = TABS.find((t) => t.key === active) ?? TABS[0];
  return (
    <div className="mx-auto max-w-5xl">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] shadow-[0_40px_120px_-60px_rgba(124,58,237,0.5)] backdrop-blur-sm">
        {/* soft glows anchoring the lab */}
        <div className="pointer-events-none absolute -right-24 -top-10 h-72 w-72 rounded-full bg-lime/[0.06] blur-[90px]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-violet-600/15 blur-[90px]" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[0.82fr_2fr]">
          {/* Left rail: explanation + vertical tabs */}
          <div className="min-w-0 border-b border-white/[0.06] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
              <Sparkles width={14} height={14} /> Live product lab
            </p>
            <p className="mt-2 hidden text-sm leading-relaxed text-white/55 lg:block">
              Real features we build into client sites. Pick one and try it. Every click works.
            </p>
            {/* Mobile hint that the tools scroll sideways */}
            <p className="mt-2 flex items-center gap-1.5 text-[0.75rem] font-medium text-white/40 lg:hidden">
              Swipe for more tools <ArrowRight width={12} height={12} />
            </p>
            <div className="mt-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,#000_84%,transparent)] lg:mt-5 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0 lg:[mask-image:none]">
              {TABS.map((t) => {
                const on = active === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActive(t.key)}
                    className={`flex shrink-0 snap-start flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-colors lg:shrink ${
                      on ? "border-lime/40 bg-lime/[0.08]" : "border-white/[0.06] bg-white/[0.01] hover:border-white/15"
                    }`}
                  >
                    <span className={`whitespace-nowrap text-sm font-semibold ${on ? "text-lime" : "text-white/80"}`}>{t.label}</span>
                    <span className="hidden text-xs text-white/40 lg:block">{t.note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: the live demo */}
          <div className="relative min-w-0 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 px-1 text-xs text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_6px_rgba(203,255,60,0.9)]" />
              {current.note}. Go ahead, try it
            </div>
            <div key={active} className="animate-fade-up overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0616]/70">
              {current.render}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
