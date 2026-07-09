"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Calendar, Check, Sparkles, TrendUp } from "./icons";

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
    details: "30-min intro call — we'll review your site and goals. No obligation.",
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
      setError(json.message || "Something went wrong — please try again.");
    } catch {
      setError("Network error — please try again.");
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
          {emailed ? "A confirmation just hit your inbox." : "I’ll confirm by email shortly."}
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
          <p className="text-center text-[0.7rem] text-white/35">Instant confirmation + calendar invite. No spam.</p>
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
                <span className="block text-[0.6rem] uppercase tracking-wide opacity-70">
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
          <p className="text-[0.65rem] uppercase tracking-widest text-white/40">Your site now</p>
          <p className="mt-1 font-display text-2xl text-white/70">{money(currentRev)}</p>
          <p className="text-xs text-white/40">/mo · {current}% convert</p>
        </div>
        <div className="rounded-xl border border-lime/30 bg-lime/[0.06] p-4">
          <p className="text-[0.65rem] uppercase tracking-widest text-lime">With a Stackwrk site</p>
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
      <p className="mt-3 text-center text-[0.7rem] text-white/35">
        Illustrative — real lift depends on your traffic &amp; offer.
      </p>
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
 * lead-capture fallback. No backend — it shows how a real assistant would
 * answer FAQs and route anything it can't answer into a captured lead.
 */
const INTENTS: { keys: string[]; a: string }[] = [
  { keys: ["hour", "open", "close", "time", "when"], a: "We're open Mon–Sat, 9am–6pm. Want me to book you the next available slot?" },
  { keys: ["quote", "estimate", "free"], a: "Yes — free, no-obligation quotes. Drop your name and I'll have someone reach out within the hour." },
  { keys: ["price", "cost", "how much", "budget", "pricing", "rate"], a: "Most projects start around $2,000 and scale with what you need. Want a tailored quote in 2 minutes?" },
  { keys: ["where", "located", "location", "address", "area"], a: "We serve the whole metro area and work with clients remotely. Want directions or a callback?" },
  { keys: ["book", "appointment", "schedule", "slot", "meeting"], a: "Happy to book you in — I've got openings this week. What day works best for you?" },
  { keys: ["service", "do you", "offer", "build", "make", "website", "app"], a: "We build fast, custom websites and web apps — booking tools, calculators, AI chat and more. What are you looking to build?" },
  { keys: ["contact", "phone", "call", "email", "reach"], a: "Easiest way is right here — share your email and I'll make sure the team follows up today." },
  { keys: ["hello", "hi", "hey", "yo"], a: "Hey! 👋 Ask me anything about hours, pricing, or booking — or tell me what you're building." },
  { keys: ["thank", "thanks", "great", "awesome", "cool"], a: "Anytime! Want me to grab your details so a human can take it from here?" },
];

function respond(text: string): string {
  const t = text.toLowerCase();
  const hit = INTENTS.find((i) => i.keys.some((k) => t.includes(k)));
  if (hit) return hit.a;
  return "Good question — let me get that to the right person. What's the best email to send a full answer to? (This is exactly how the bot captures a lead on your real site.)";
}

function ChatbotDemo() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi! 👋 I'm your site's AI assistant. Ask me anything — I never sleep." },
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
        {/* AFTER (modern) — an art-directed hero: aurora mesh, rating + avatars,
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
              <span className="flex h-4 w-4 items-center justify-center rounded bg-lime text-[0.55rem] font-black leading-none text-ink">B</span>
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-white">Bold Studio</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-[0.55rem] font-medium text-white/60 sm:inline">Menu</span>
              <span className="hidden text-[0.55rem] font-medium text-white/60 sm:inline">About</span>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-[0.52rem] font-bold uppercase text-white ring-1 ring-inset ring-white/15 backdrop-blur">
                Book
              </span>
            </div>
          </div>

          {/* hero copy — right-anchored so the punchline shows at a middle split */}
          <div className="absolute right-4 top-[52%] z-10 max-w-[70%] -translate-y-1/2 text-right sm:right-6 sm:max-w-[60%]">
            <div className="mb-1.5 flex items-center justify-end gap-1.5">
              <span className="text-[0.62rem] leading-none tracking-tight text-lime">★★★★★</span>
              <span className="text-[0.5rem] text-white/60">5.0 · 240 reviews</span>
            </div>
            <p className="font-display text-2xl uppercase leading-[0.88] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] sm:text-[2.5rem]">
              Modern.<br />Fast.<br />
              <span className="text-accent-glow">Converts.</span>
            </p>
            <p className="mt-2 hidden text-[0.66rem] leading-snug text-white/75 sm:ml-auto sm:block sm:max-w-[15rem]">
              A site that turns visitors into booked customers — on any device.
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className="hidden items-center rounded-md border border-white/25 px-2.5 py-1.5 text-[0.56rem] font-semibold text-white/85 sm:inline-flex">
                View menu
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-lime px-3 py-1.5 text-[0.6rem] font-bold uppercase text-ink shadow-[0_0_24px_-4px_rgba(203,255,60,0.85)]">
                Book now →
              </span>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <div className="flex -space-x-1.5">
                {["from-flare-orange to-flare-red", "from-flare-red to-flare-purple", "from-flare-purple to-flare-blue", "from-flare-blue to-lime"].map((g, i) => (
                  <span key={i} className={`h-4 w-4 rounded-full border border-ink bg-gradient-to-br ${g}`} />
                ))}
              </div>
              <span className="text-[0.5rem] text-white/55">2,000+ booked this year</span>
            </div>
          </div>

          {/* floating glass booking widget — the "wow" element */}
          <div className="absolute bottom-3 left-3 z-10 hidden w-40 rounded-xl border border-white/15 bg-white/[0.08] p-2.5 shadow-2xl backdrop-blur-md md:block">
            <div className="flex items-center justify-between">
              <span className="text-[0.55rem] font-bold uppercase tracking-wide text-white">Book a table</span>
              <span className="flex items-center gap-1 text-[0.48rem] text-lime">
                <span className="h-1 w-1 rounded-full bg-lime" /> Live
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {["6:00", "7:30", "8:00", "8:30", "9:00", "9:30"].map((t, i) => (
                <span key={t} className={`rounded py-1 text-center text-[0.5rem] font-medium ${i === 2 ? "bg-lime text-ink" : "bg-white/10 text-white/70"}`}>
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-2 rounded-md bg-lime py-1 text-center text-[0.52rem] font-bold uppercase text-ink">Confirm</div>
          </div>
        </div>
        {/* BEFORE (dated) — clipped to pos%; fixed inner width so it never reflows */}
        <div className="absolute inset-0 overflow-hidden bg-[#eceae4]" style={{ width: `${pos}%` }}>
          <div className="h-full" style={{ width: 880 }}>
            {/* old title bar */}
            <div className="flex items-center justify-between border-b-2 border-[#b8b4a8] bg-[#d8d5cc] px-4 py-2">
              <span className="font-serif text-sm font-bold text-[#4a4a55]">✦ Our Business Inc.</span>
              <span className="font-serif text-[0.55rem] italic text-[#5a7]">est. 2003</span>
            </div>
            {/* nav links */}
            <div className="flex gap-3 border-b border-[#c4c0b4] bg-[#c8c4b8] px-4 py-1 font-serif text-[0.55rem] text-[#2a3b8f] underline">
              <span>Home</span><span>About Us</span><span>Services</span><span>Contact</span>
            </div>
            {/* body */}
            <div className="px-4 py-3">
              <span className="block font-serif text-lg font-bold text-[#333844]">Welcome to Our Business</span>
              <span className="mt-0.5 block font-serif text-[0.7rem] italic text-[#667]">Quality service you can trust since 2003.</span>
              <div className="mt-2 flex gap-2">
                <div className="flex h-16 w-20 shrink-0 items-center justify-center border border-[#a8a498] bg-[#dcdad4] text-[0.5rem] text-[#889]">[ photo ]</div>
                <span className="font-serif text-[0.6rem] leading-relaxed text-[#556]">We are a family-owned company providing the best service in town. Please call us during business hours, Mon–Fri 9–5.</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="border border-[#a8a498] bg-[#dcdad4] px-2 py-1 text-[0.55rem] text-[#556]">Submit »</span>
                <span className="font-mono text-[0.5rem] text-[#889]">Visitors: 001242</span>
                <span className="text-[0.5rem] font-bold text-[#c33]">★ Under Construction ★</span>
              </div>
            </div>
          </div>
        </div>
        {/* Divider + grabbable handle (whole frame is draggable; handle is the affordance) */}
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="h-full w-0.5 -translate-x-1/2 bg-lime" />
          <div
            className={`absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-lime bg-ink text-sm text-lime shadow-[0_0_20px_-2px_rgba(203,255,60,0.7)] transition-transform ${
              dragging ? "scale-110" : ""
            }`}
          >
            ↔
          </div>
        </div>
        {/* Labels */}
        <span className="pointer-events-none absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[0.55rem] font-bold uppercase text-white/80">Before</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded bg-lime px-2 py-0.5 text-[0.55rem] font-bold uppercase text-ink">After</span>
      </div>
      <p className="mt-3 text-center text-xs text-white/45">
        Drag anywhere on the image — same business, redesigned to sell.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- Showcase */
const TABS = [
  { key: "booking", label: "Booking widget", note: "Let customers book 24/7", render: <BookingDemo /> },
  { key: "calc", label: "Revenue calculator", note: "Show ROI in real numbers", render: <CalculatorDemo /> },
  { key: "chat", label: "AI assistant", note: "Answer & capture leads", render: <ChatbotDemo /> },
  { key: "redesign", label: "Before / After", note: "Modernize a tired site", render: <BeforeAfterDemo /> },
];

export default function DemoShowcase() {
  const [active, setActive] = useState("booking");
  const current = TABS.find((t) => t.key === active) ?? TABS[0];
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === t.key
                ? "border-lime bg-lime/15 text-lime"
                : "border-white/12 text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.1] bg-ink-600/60 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-3">
          <Sparkles width={16} height={16} className="text-lime" />
          <span className="text-sm text-white/70">{current.note} — live demo, go ahead and try it</span>
        </div>
        <div key={active} className="animate-fade-up">{current.render}</div>
      </div>
    </div>
  );
}
