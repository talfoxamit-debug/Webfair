import HeroMedia from "./HeroMedia";
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

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.35]" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />

      <div className="container-content relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: copy */}
        <div>
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            <Bolt width={14} height={14} className="text-lime" />
            {hero.eyebrow}
          </span>

          <h1 className="mt-6 animate-fade-up font-display text-5xl leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl" style={{ animationDelay: "80ms" }}>
            <span className="block text-white">{hero.titleLines[0]}</span>
            <span className="relative mt-1 inline-block text-accent-glow">
              {hero.titleLines[1]}
              <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 16" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 11 C 80 3, 150 3, 297 8" stroke="#CBFF3C" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-8 max-w-md animate-fade-up text-lg leading-relaxed text-white/65" style={{ animationDelay: "160ms" }}>
            {hero.subtitle}
          </p>

          <div className="mt-9 flex animate-fade-up flex-wrap gap-4" style={{ animationDelay: "240ms" }}>
            <a href="#about" className="btn-primary">
              {hero.primaryCta}
              <ArrowRight width={18} height={18} />
            </a>
            <a href="#work" className="btn-ghost">
              {hero.secondaryCta}
              <ArrowDown width={18} height={18} />
            </a>
          </div>

          {/* Built with */}
          <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-3" style={{ animationDelay: "320ms" }}>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">
              Built with
            </span>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/70">
              <li className="flex items-center gap-1.5 text-sm font-medium"><NextMark className="text-white" /> Next.js</li>
              <li className="flex items-center gap-1.5 text-sm font-medium"><TypeScriptMark /> TS</li>
              <li className="flex items-center gap-1.5 text-sm font-medium"><TailwindMark /> tailwind</li>
              <li className="flex items-center gap-1.5 text-sm font-medium"><SupabaseMark /> supabase</li>
              <li className="flex items-center gap-1.5 text-sm font-medium"><VercelMark className="text-white" /> Vercel</li>
            </ul>
          </div>
        </div>

        {/* Right: hero visual + code card */}
        <div className="relative animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="relative mx-auto max-w-lg">
            <HeroMedia src={hero.image} />

            {/* Code card overlapping the visual */}
            <div className="absolute -bottom-2 left-0 w-[74%] max-w-xs rounded-xl border border-white/10 bg-ink-800/85 p-4 font-mono text-[11px] leading-5 shadow-card backdrop-blur-md sm:text-xs">
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
                        {line.t.length === 0 ? (
                          " "
                        ) : (
                          line.t.map((tok, j) => (
                            <span key={j} className={codeColor[tok.c]}>
                              {tok.v}
                            </span>
                          ))
                        )}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Feature highlights row */}
      <div className="container-content relative mt-16">
        <ul className="grid gap-6 border-t border-white/[0.08] pt-8 sm:grid-cols-3">
          {hero.highlights.map((h, i) => {
            const Icon = highlightIcons[i];
            return (
              <li key={h.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-lime/25 bg-lime/10 text-lime">
                  <Icon width={18} height={18} />
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
