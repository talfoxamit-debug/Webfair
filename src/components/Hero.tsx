import HeroMedia from "./HeroMedia";
import HeroWaves from "./HeroWaves";
import PointerVars from "./PointerVars";
import ScrollParallax from "./ScrollParallax";
import { ArrowRight, ArrowDown, Bolt, TrendUp, Phone } from "./icons";
import {
  NextMark,
  TypeScriptMark,
  TailwindMark,
  SupabaseMark,
  VercelMark,
} from "./StackLogos";
import { hero } from "@/lib/content";

const highlightIcons = [Bolt, TrendUp, Phone];

const codeLines = [
  { t: [{ c: "c", v: "// Solutions that scale" }] },
  { t: [] },
  { t: [{ c: "k", v: "const" }, { c: "", v: " results " }, { c: "o", v: "=" }] },
  { t: [{ c: "", v: "  " }, { c: "k", v: "await" }, { c: "f", v: " build" }, { c: "o", v: "({" }] },
  { t: [{ c: "", v: "    design: " }, { c: "s", v: "'modern'" }, { c: "o", v: "," }] },
  { t: [{ c: "", v: "    performance: " }, { c: "s", v: "'fast'" }, { c: "o", v: "," }] },
  { t: [{ c: "", v: "    conversions: " }, { c: "s", v: "'high'" }] },
  { t: [{ c: "", v: "  " }, { c: "o", v: "})" }] },
  { t: [] },
  { t: [{ c: "k", v: "return" }, { c: "", v: " results" }, { c: "o", v: ";" }] },
] as const;

const codeColor: Record<string, string> = {
  c: "text-white/35 italic", // comment
  k: "text-flare-purple font-medium", // keyword
  f: "text-lime", // function
  s: "text-flare-orange", // string
  o: "text-white/50", // operator/punct
  "": "text-white/80",
};

function CodeCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-violet-400/40 bg-ink-800/55 p-5 font-mono text-[11px] leading-5 shadow-[0_0_36px_-8px_rgba(139,92,246,0.55)] backdrop-blur-xl sm:text-xs ${className}`}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-flare-red/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-flare-orange/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-lime/80" />
      </div>
      <pre className="overflow-x-auto">
        <code>
          {codeLines.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-4 select-none text-right text-white/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="whitespace-pre">
                {line.t.length === 0
                  ? " "
                  : line.t.map((tok, j) => (
                      <span key={j} className={codeColor[tok.c]}>
                        {tok.v}
                      </span>
                    ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#07040d] pb-12 pt-28 sm:pt-36 lg:flex lg:min-h-[860px] lg:flex-col lg:justify-center lg:pb-16"
    >
      {/* Cursor-depth: exposes --mx/--my on this section for layer parallax */}
      <PointerVars />

      {/* Backdrop: faint grid + deep radial atmosphere behind the fox */}
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.16]" />
      <ScrollParallax speed={0.18} className="pointer-events-none absolute -right-40 -top-32 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(162,28,224,0.28),rgba(46,107,255,0.1)_55%,transparent_75%)] blur-2xl" />
      <div className="pointer-events-none absolute -left-40 top-24 h-72 w-72 rounded-full bg-violet-600/15 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[10%] h-[26rem] w-[40rem] rounded-full bg-[radial-gradient(ellipse,rgba(255,45,155,0.14),rgba(46,107,255,0.1)_50%,transparent_75%)] blur-2xl" />

      {/* Electric energy waves flowing from the lower-right */}
      <HeroWaves />

      {/* Warm energy field behind the fox so it emanates light and sits inside
          the scene rather than reading as a flat sticker. */}
      <div className="pointer-events-none absolute bottom-[8%] right-[8%] z-[1] hidden h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(255,90,40,0.18),rgba(162,28,224,0.14)_44%,transparent_70%)] blur-3xl lg:block" />

      {/* Fox — desktop: bleeds across the right side, nudged left + larger so it
          reads as one composition with the code card instead of floating far off.
          Drifts gently with the cursor (deepest parallax layer). */}
      <div
        className="pointer-events-none absolute bottom-0 right-[2%] top-0 z-[2] hidden w-[58%] will-change-transform lg:block"
        style={{ transform: "translate3d(calc(var(--mx, 0) * 12px), calc(var(--my, 0) * 8px), 0)" }}
      >
        <div className="h-full w-full animate-float-y">
          <HeroMedia variant="bleed" />
        </div>
      </div>

      <div className="container-content relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: copy */}
        <div className="min-w-0">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            <Bolt width={14} height={14} className="text-lime" />
            {hero.eyebrow}
          </span>

          <h1
            className="mt-6 animate-fade-up font-display text-5xl leading-[0.92] tracking-tight sm:text-6xl md:text-7xl lg:text-[4.1rem] xl:text-[5rem]"
            style={{ animationDelay: "80ms" }}
          >
            <span className="block text-white lg:whitespace-nowrap">{hero.titleLines[0]}</span>
            <span className="brush-word relative mt-1 inline-block text-accent-glow lg:whitespace-nowrap">
              {hero.titleLines[1]}
              <svg className="absolute -bottom-6 left-0 w-full" viewBox="0 0 300 20" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 13 C 74 4, 150 4, 297 12" stroke="#CBFF3C" strokeWidth="4" strokeLinecap="round" />
                <path d="M63 17 C 126 10, 208 9, 292 15" stroke="#CBFF3C" strokeWidth="2" strokeLinecap="round" opacity=".75" />
              </svg>
            </span>
          </h1>

          <p className="mt-10 max-w-md animate-fade-up text-lg leading-relaxed text-white/80" style={{ animationDelay: "160ms" }}>
            {hero.subtitle}
          </p>

          <div className="mt-9 flex animate-fade-up flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4" style={{ animationDelay: "240ms" }}>
            <a href="#about" className="btn-primary w-full !rounded-md sm:w-auto">
              {hero.primaryCta}
              <ArrowRight width={18} height={18} />
            </a>
            <a href="#work" className="btn-ghost w-full !rounded-md sm:w-auto">
              {hero.secondaryCta}
              <ArrowDown width={18} height={18} />
            </a>
          </div>

          {/* Built with — infinite marquee (pauses on hover, frozen by the
              global reduced-motion rule) */}
          <div className="mt-10 flex max-w-md animate-fade-up items-center gap-x-5" style={{ animationDelay: "320ms" }}>
            <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">
              Built with
            </span>
            <div
              className="min-w-0 flex-1 overflow-hidden"
              style={{
                maskImage: "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
              }}
            >
              <ul className="flex w-max animate-marquee items-center text-white/70 hover:[animation-play-state:paused]">
                {[0, 1].map((dup) => (
                  <li key={dup} aria-hidden={dup === 1} className="flex items-center">
                    <span className="flex items-center gap-1.5 pr-8 text-sm font-medium"><NextMark className="text-white" /> Next.js</span>
                    <span className="flex items-center gap-1.5 pr-8 text-sm font-medium"><TypeScriptMark /> TypeScript</span>
                    <span className="flex items-center gap-1.5 pr-8 text-sm font-medium"><TailwindMark /> Tailwind CSS</span>
                    <span className="flex items-center gap-1.5 pr-8 text-sm font-medium"><SupabaseMark /> Supabase</span>
                    <span className="flex items-center gap-1.5 pr-8 text-sm font-medium"><VercelMark className="text-white" /> Vercel</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right column: code card overlaps the fox's chest at center-right on
            desktop; on mobile the fox panel + card stack in the normal flow */}
        <div className="relative min-w-0 animate-fade-up lg:h-[26rem]" style={{ animationDelay: "200ms" }}>
          <div className="flex flex-col items-center gap-6 lg:hidden">
            <HeroMedia />
            <CodeCard className="w-full max-w-sm" />
          </div>
          {/* Counter-parallax layer: the card drifts opposite the fox for depth */}
          <div
            className="hidden will-change-transform lg:absolute lg:left-[-1rem] lg:top-[56%] lg:block lg:w-[23rem] xl:left-[1.5rem]"
            style={{ transform: "translate3d(calc(var(--mx, 0) * -9px), calc(-50% + var(--my, 0) * -6px), 0)" }}
          >
            <CodeCard />
          </div>
        </div>
      </div>

      {/* Strengths row — the reasons to pick me, as cards. The 2-week speed
          strength is accented so it reads first. */}
      <div id="stack" className="container-content relative z-10 mt-14">
        <ul className="grid gap-4 sm:grid-cols-3">
          {hero.highlights.map((h, i) => {
            const Icon = highlightIcons[i];
            const accent = i === 0;
            return (
              <li
                key={h.title}
                className={`group flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 ${
                  accent
                    ? "border-lime/45 bg-lime/[0.06] shadow-[0_22px_55px_-30px_rgba(203,255,60,0.6)] hover:shadow-[0_26px_60px_-26px_rgba(203,255,60,0.75)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-lime/30 hover:bg-white/[0.035]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-lime transition-transform duration-300 group-hover:scale-110 ${
                    accent
                      ? "border-lime/60 bg-lime/10 shadow-[0_0_22px_-4px_rgba(203,255,60,0.7)]"
                      : "border-lime/45 shadow-[0_0_18px_-6px_rgba(203,255,60,0.5)]"
                  }`}
                >
                  <Icon width={20} height={20} />
                </span>
                <div>
                  <p className="font-display text-lg uppercase tracking-wide text-white">{h.title}</p>
                  <p className="text-sm text-white/55">{h.sub}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
