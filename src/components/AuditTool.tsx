"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail } from "./icons";
import { site } from "@/lib/content";

type CheckStatus = "pass" | "warn" | "fail";
type Check = { label: string; status: CheckStatus; detail: string };
type Category = { key: string; label: string; score: number; checks: Check[] };
type Result = {
  ok: true;
  finalUrl: string;
  score: number;
  loadMs: number;
  pageKb: number;
  categories: Category[];
  headline: string;
};

type Phase = "idle" | "loading" | "done" | "error";

function ringColor(score: number) {
  if (score >= 85) return "#CBFF3C";
  if (score >= 65) return "#A8E016";
  if (score >= 40) return "#FBBF24";
  return "#FB5C7D";
}

function StatusDot({ status }: { status: CheckStatus }) {
  const map = {
    pass: { bg: "bg-lime/15 text-lime", char: "✓" },
    warn: { bg: "bg-amber-400/15 text-amber-300", char: "!" },
    fail: { bg: "bg-rose-500/15 text-rose-300", char: "✕" },
  }[status];
  return (
    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${map.bg}`}>
      {map.char}
    </span>
  );
}

/** Score ring that both sweeps its arc and counts the number up on mount. */
function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  const color = ringColor(score);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const dash = (shown / 100) * c;

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl leading-none text-white">{shown}</span>
        <span className="text-[0.75rem] uppercase tracking-widest text-white/55">/ 100</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Sample card */
const SAMPLE_BARS = [
  { label: "Performance", score: 61 },
  { label: "Mobile", score: 48 },
  { label: "SEO", score: 55 },
  { label: "Conversion", score: 40 },
];

/**
 * A tilted, glass-framed *sample* report floating beside the URL input, so
 * visitors see exactly what they'll get before they type. Animates (ring
 * count-up + bars filling) the first time it scrolls into view.
 */
function SampleScorecard() {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="relative hidden lg:block">
      {/* glow bed */}
      <div className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse,rgba(203,255,60,0.07),rgba(124,58,237,0.08)_55%,transparent_75%)] blur-2xl" />
      <div className="relative rotate-2 rounded-2xl border border-white/12 bg-[#0b0616]/85 p-5 shadow-[0_50px_100px_-50px_rgba(0,0,0,0.9)] backdrop-blur-md transition-transform duration-500 hover:rotate-0">
        <div className="flex items-center justify-between">
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-white/55">
            Sample scorecard
          </span>
          <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[0.75rem] font-semibold text-rose-300">
            23 issues found
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          {seen ? (
            <ScoreRing score={54} />
          ) : (
            <div className="h-32 w-32 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-display text-lg uppercase leading-tight text-white">
              Real gaps here, costing you customers.
            </p>
            <p className="mt-1 truncate text-xs text-white/55">demo-site.com · 2.4 s · 890 KB</p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {SAMPLE_BARS.map((b, i) => (
            <div key={b.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-white/55">{b.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: seen ? `${b.score}%` : "0%",
                    background: ringColor(b.score),
                    transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.12}s`,
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right font-mono text-[0.75rem]" style={{ color: ringColor(b.score) }}>
                {b.score}
              </span>
            </div>
          ))}
        </div>

        <ul className="mt-4 space-y-2 border-t border-white/[0.07] pt-3.5">
          <li className="flex items-start gap-2.5">
            <StatusDot status="fail" />
            <span className="text-xs text-white/70">No online booking, losing after-hours leads</span>
          </li>
          <li className="flex items-start gap-2.5">
            <StatusDot status="warn" />
            <span className="text-xs text-white/70">Meta description missing, Google writes its own</span>
          </li>
        </ul>
      </div>

      {/* floating chip */}
      <span className="absolute -bottom-3 -left-5 animate-float rounded-lg border border-lime/30 bg-[#0b0616]/90 px-3 py-1.5 text-[0.75rem] font-semibold text-lime shadow-[0_0_24px_-8px_rgba(203,255,60,0.6)] backdrop-blur">
        Free · takes ~10 seconds
      </span>
    </div>
  );
}

type CapturePhase = "idle" | "sending" | "sent" | "error";

/** The funnel: after the visitor sees their score, trade their details for the
 *  full emailed report, and drop them straight into the CRM. */
function ReportCapture({ result }: { result: Result }) {
  const [phase, setPhase] = useState<CapturePhase>("idle");
  const [emailed, setEmailed] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setPhase("sending");
    setError("");
    try {
      const res = await fetch("/api/audit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company: data.company, // honeypot
          result,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setEmailed(Boolean(json.emailed));
        setSentTo(data.email);
        setFirstName((data.name || "").split(" ")[0]);
        setPhase("sent");
        return;
      }
      setError(json.message || "Something went wrong. Please try again or email hello@stackwrk.com.");
      setPhase("error");
    } catch {
      setError("Network error. Please try again.");
      setPhase("error");
    }
  }

  if (phase === "sent") {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-lime/30 bg-lime/[0.06] px-6 py-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-ink">
          <Check width={26} height={26} />
        </span>
        <h4 className="font-display text-xl uppercase text-white">
          {emailed ? "Report sent" : `You're in, ${firstName || "thanks"}`}
        </h4>
        <p className="max-w-sm text-sm text-white/70">
          {emailed ? (
            <>
              Your full audit (every fix prioritized) just landed in{" "}
              <span className="text-lime">{sentTo}</span>. Check your inbox (and spam, just in case).
            </>
          ) : (
            <>
              Got it. We&rsquo;ll send the full prioritized report to{" "}
              <span className="text-lime">{sentTo}</span> shortly, then follow up personally.
            </>
          )}
        </p>
        <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
          <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !rounded-md">
            Book my free call
            <ArrowRight width={18} height={18} />
          </a>
          <a href={site.phoneHref} className="btn-ghost !rounded-md">
            Or call / text {site.phone}
          </a>
        </div>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-white/12 bg-ink-800/70 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-lime/60 focus:ring-2 focus:ring-lime/20";

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-lime/25 bg-gradient-to-br from-lime/[0.08] via-transparent to-transparent p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime/40 bg-lime/10 text-lime">
          <Mail width={22} height={22} />
        </span>
        <div>
          <h4 className="font-display text-xl uppercase leading-tight text-white sm:text-2xl">
            Get the full report, free
          </h4>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-white/65">
            The complete audit with <span className="text-white/90">every issue above prioritized</span>,
            the exact fixes, and what each one is worth, delivered to your inbox. No cost, no catch.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5" noValidate>
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="block flex-1">
            <span className="sr-only">Your name</span>
            <input name="name" type="text" required placeholder="Your name" className={field} />
          </label>
          <label className="block flex-1">
            <span className="sr-only">Email address</span>
            <input name="email" type="email" required placeholder="Email address" className={field} />
          </label>
          <button
            type="submit"
            disabled={phase === "sending"}
            className="btn-primary !rounded-lg shrink-0 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {phase === "sending" ? "Sending…" : "Email me the report"}
            {phase !== "sending" && <ArrowRight width={18} height={18} />}
          </button>
        </div>
        {phase === "error" && (
          <p className="mt-3 text-sm text-rose-300" role="alert">
            {error}
          </p>
        )}
        <p className="mt-3 text-xs text-white/55">
          Your details are only used to send this report and follow up. No spam, unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}

export default function AuditTool() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  async function run(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase === "loading" || !url.trim()) return;
    setPhase("loading");
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setResult(json);
        setPhase("done");
      } else {
        setError(json.message || "Couldn't audit that site. Try another address.");
        setPhase("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setPhase("error");
    }
  }

  return (
    <div className={`mx-auto ${phase === "done" ? "max-w-3xl" : "max-w-5xl"}`}>
      {phase !== "done" && (
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left: the ask */}
          <div>
            <form onSubmit={run} className="flex flex-col gap-3">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yoursite.com"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Your website address"
                className="w-full rounded-xl border border-white/12 bg-ink-800/70 px-4 py-4 text-base text-white placeholder-white/35 outline-none transition-colors focus:border-lime/60 focus:ring-2 focus:ring-lime/20"
              />
              <button
                type="submit"
                disabled={phase === "loading"}
                className="btn-primary w-full !rounded-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {phase === "loading" ? "Scanning…" : "Audit my site"}
                {phase !== "loading" && <ArrowRight width={18} height={18} />}
              </button>
            </form>

            {phase === "error" && (
              <p className="mt-3 text-sm text-rose-300" role="alert">
                {error}
              </p>
            )}

            {phase === "loading" ? (
              <div className="mt-5 flex items-center gap-3 text-sm text-white/60">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-lime" />
                Scanning the page: speed, mobile, SEO &amp; conversion…
              </div>
            ) : (
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {["24 real checks", "Scored like Lighthouse", "Full report by email"].map((p) => (
                  <li key={p} className="flex items-center gap-2 text-xs font-medium text-white/55">
                    <span className="h-1 w-1 rounded-full bg-lime" />
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: what they get (the animated sample report) */}
          <SampleScorecard />
        </div>
      )}


      {phase === "done" && result && (
        <div ref={resultRef} className="mt-6 animate-fade-up rounded-2xl border border-white/[0.1] bg-ink-600/60 p-6 backdrop-blur-sm sm:p-8">
          {/* Header: score + headline */}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
            <ScoreRing score={result.score} />
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-widest text-violet-400">Your site scored</p>
              <h3 className="mt-1 font-display text-2xl uppercase leading-tight text-white sm:text-3xl">
                {result.headline}
              </h3>
              <p className="mt-2 break-all text-sm text-white/55">
                {result.finalUrl} · {result.loadMs} ms · {result.pageKb} KB
              </p>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {result.categories.map((cat) => (
              <div key={cat.key} className="rounded-xl border border-white/[0.08] bg-ink-800/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg uppercase tracking-wide text-white">{cat.label}</span>
                  <span className="font-mono text-sm" style={{ color: ringColor(cat.score) }}>
                    {cat.score}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${cat.score}%`,
                      background: ringColor(cat.score),
                      transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>
                <ul className="mt-4 space-y-2.5">
                  {cat.checks.map((c) => (
                    <li key={c.label} className="flex items-start gap-2.5">
                      <StatusDot status={c.status} />
                      <span className="text-sm">
                        <span className="text-white/85">{c.label}</span>
                        <span className="block text-xs text-white/55">{c.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Where we come in: reassure + sell + dual CTA (book or call) */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-lime/25 bg-gradient-to-br from-lime/[0.08] via-transparent to-transparent p-6 sm:p-7">
            <p className="text-xs uppercase tracking-widest text-lime">Where we come in</p>
            <h4 className="mt-2 font-display text-xl uppercase leading-tight text-white sm:text-2xl">
              Every issue above is fixable, and we fix all of it.
            </h4>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
              Stackwrk builds fast, custom, mobile-first sites and the systems behind them: lead capture,
              automations, a custom CRM, even a 24/7 AI assistant that books jobs while you work. We don&rsquo;t
              just patch what your audit flagged, we rebuild it to convert and keep improving it every month.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !rounded-md">
                Book a free 30-min call
                <ArrowRight width={18} height={18} />
              </a>
              <a href={site.phoneHref} className="btn-ghost !rounded-md">
                Or call / text {site.phone}
              </a>
            </div>
            <p className="mt-3 text-xs text-white/55">Do whichever is easier, you can do both. No obligation either way.</p>
          </div>

          {/* Lead funnel: full report by email → straight into the CRM */}
          <ReportCapture result={result} />
        </div>
      )}
    </div>
  );
}
