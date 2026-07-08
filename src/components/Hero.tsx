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
    <section id="top" className="relative overflow-hidden pb-12 pt-28 sm:pt-36 lg:min-h-[860px] lg:pb-20">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.35]" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[70vw] bg-[radial-gradient(ellipse_at_70%_70%,rgba(46,107,255,0.55),rgba(162,28,224,0.28)_36%,transparent_68%)] blur-2xl" />

      <div className="container-content relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: copy */}
        <div>
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            <Bolt width={14} height={14} className="text-lime" />
            {hero.eyebrow}
          </span>

          <h1 className="mt-6 animate-fade-up font-display text-6xl leading-[0.9] tracking-tight sm:text-7xl lg:text-[5.6rem]" style={{ animationDelay: "80ms" }}>
            <span className="block text-white">{hero.titleLines[0]}</span>
            <span className="brush-word relative mt-1 inline-block text-accent-glow">
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

          <div className="mt-9 flex animate-fade-up flex-wrap gap-4" style={{ animationDelay: "240ms" }}>
            <a href="#about" className="btn-primary !rounded-md">
              {hero.primaryCta}
              <ArrowRight width={18} height={18} />
            </a>
            <a href="#work" className="btn-ghost !rounded-md">
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
        <div className="relative animate-fade-up lg:-ml-12" style={{ animationDelay: "200ms" }}>
          <div className="relative mx-auto max-w-3xl">
            <HeroMedia src={hero.image} />

            {/* Code card overlapping the visual */}
            <div className="absolute left-2 top-[22%] z-0 w-[52%] max-w-sm rounded-xl border border-violet-400/45 bg-ink-800/80 p-5 font-mono text-[11px] leading-5 shadow-card backdrop-blur-md sm:text-xs lg:left-4">
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
      <div id="stack" className="container-content relative mt-14">
        <ul className="grid gap-6 sm:grid-cols-3">
          {hero.highlights.map((h, i) => {
            const Icon = highlightIcons[i];
            return (
              <li key={h.title} className="flex items-start gap-3 border-white/10 sm:border-l sm:pl-8 first:sm:border-l-0 first:sm:pl-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-lime">
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
