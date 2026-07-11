import HeroMedia from "./HeroMedia";
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
      className={`glass-panel rounded-2xl p-5 font-mono text-[11px] leading-5 sm:text-xs ${className}`}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
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

      {/* Backdrop: faint grid + deep, restrained radial atmosphere. Toned down
          so the scene reads calm and premium rather than electric. */}
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.08]" />
      <ScrollParallax speed={0.18} className="pointer-events-none absolute -right-40 -top-32 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(162,28,224,0.13),rgba(46,107,255,0.05)_55%,transparent_75%)] blur-2xl" />
      <div className="pointer-events-none absolute -left-40 top-24 h-72 w-72 rounded-full bg-violet-600/10 blur-[80px]" />

      {/* Warm energy field behind the fox so it sits inside the scene rather
          than reading as a flat sticker — kept subtle. */}
      <div className="pointer-events-none absolute bottom-[8%] right-[8%] z-[1] hidden h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(255,90,40,0.11),rgba(162,28,224,0.08)_44%,transparent_70%)] blur-3xl lg:block" />

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
          <span className="inline-flex animate-rise items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/55">
            <span className="h-1 w-1 rounded-full bg-lime/70" />
            {hero.eyebrow}
          </span>

          <h1
            className="mt-7 animate-rise font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-[4.1rem] xl:text-[5rem]"
            style={{ animationDelay: "90ms" }}
          >
            <span className="block text-[#ECE9E2] lg:whitespace-nowrap">{hero.titleLines[0]}</span>
            <span className="mt-1 block text-[rgba(236,233,226,0.42)] lg:whitespace-nowrap">{hero.titleLines[1]}</span>
          </h1>

          <p className="mt-8 max-w-md animate-rise text-lg leading-relaxed text-[#B7B2A8]" style={{ animationDelay: "180ms" }}>
            {hero.subtitle}
          </p>

          <div className="mt-9 flex animate-rise flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4" style={{ animationDelay: "270ms" }}>
            <a href="#about" className="btn-primary w-full !rounded-md sm:w-auto">
              {hero.primaryCta}
              <ArrowRight width={18} height={18} />
            </a>
            <a href="#work" className="btn-ghost w-full !rounded-md sm:w-auto">
              {hero.secondaryCta}
              <ArrowDown width={18} height={18} />
            </a>
          </div>

          {/* Built with — a calm, static row (no marquee). */}
          <div className="mt-10 flex max-w-md animate-rise flex-wrap items-center gap-x-5 gap-y-2" style={{ animationDelay: "360ms" }}>
            <span className="shrink-0 text-[0.62rem] font-medium uppercase tracking-[0.28em] text-white/35">
              Built with
            </span>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/55">
              <li className="flex items-center gap-1.5 text-sm font-medium"><NextMark className="text-white/70" /> Next.js</li>
              <li className="flex items-center gap-1.5 text-sm font-medium"><TypeScriptMark /> TypeScript</li>
              <li className="flex items-center gap-1.5 text-sm font-medium"><TailwindMark /> Tailwind</li>
              <li className="flex items-center gap-1.5 text-sm font-medium"><SupabaseMark /> Supabase</li>
              <li className="flex items-center gap-1.5 text-sm font-medium"><VercelMark className="text-white/70" /> Vercel</li>
            </ul>
          </div>
        </div>

        {/* Right column: code card overlaps the fox's chest at center-right on
            desktop; on mobile the fox panel + card stack in the normal flow */}
        <div className="relative min-w-0 animate-rise lg:h-[26rem]" style={{ animationDelay: "220ms" }}>
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

      {/* Strengths row — refined glass panels, quiet by default. */}
      <div id="stack" className="container-content relative z-10 mt-16">
        <ul className="grid gap-4 sm:grid-cols-3">
          {hero.highlights.map((h, i) => {
            const Icon = highlightIcons[i];
            return (
              <li
                key={h.title}
                className="glass-panel glass-panel-hover flex items-start gap-4 rounded-2xl p-5"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/12 text-lime/80">
                  <Icon width={18} height={18} />
                </span>
                <div>
                  <p className="font-display text-lg uppercase tracking-wide text-[#ECE9E2]">{h.title}</p>
                  <p className="mt-0.5 text-sm text-white/45">{h.sub}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
