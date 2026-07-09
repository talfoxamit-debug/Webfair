import Reveal from "./Reveal";
import CardSpotlight from "./CardSpotlight";
import ScrollParallax from "./ScrollParallax";
import { ArrowRight, Check } from "./icons";
import { projects, type Project } from "@/lib/content";

function hostOf(href: string) {
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/** Browser-framed, full-brightness screenshot with a glass "live" pill. */
function Shot({ project, ratio = "aspect-[16/11]" }: { project: Project; ratio?: string }) {
  return (
    <div className="relative overflow-hidden">
      {/* chrome */}
      <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-2 flex h-3.5 flex-1 items-center rounded bg-white/[0.05] px-2 text-[0.55rem] font-medium text-white/35">
          {hostOf(project.href)}
        </span>
      </div>
      <div className={`relative overflow-hidden ${ratio} bg-gradient-to-br ${project.accent}`}>
        {project.image && (
          /* eslint-disable-next-line @next/next/no-img-element -- static, pre-optimized local screenshot */
          <img
            src={project.image}
            alt={`${project.name} website`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top brightness-[1.16] contrast-[1.04] saturate-[1.06] transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
          />
        )}
        {/* premium glass pill — never competes with the screenshot */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-lime backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_6px_rgba(203,255,60,0.9)]" />
          {project.badge ?? "Live project"}
        </span>
      </div>
    </div>
  );
}

function Bullets({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={className}>
      {items.map((f) => (
        <li key={f} className="flex items-center gap-2 text-[0.82rem] text-white/70">
          <Check width={14} height={14} className="shrink-0 text-lime" />
          {f}
        </li>
      ))}
    </ul>
  );
}

function LiveLink({ href, pin = true }: { href: string; pin?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${pin ? "mt-auto" : "mt-1"} inline-flex items-center gap-2 pt-4 text-[0.8rem] font-bold uppercase tracking-wide text-lime transition-[gap] group-hover:gap-3`}
    >
      View live site
      <ArrowRight width={15} height={15} />
    </a>
  );
}

const cardBase =
  "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-all duration-500 hover:border-lime/35 hover:shadow-[0_30px_80px_-42px_rgba(203,255,60,0.3)]";

export default function FeaturedProjects() {
  const featured = projects.find((p) => p.tier === "featured") ?? projects[0];
  const main = projects.filter((p) => p.tier === "main");
  const more = projects.filter((p) => p.tier === "more");

  return (
    <section
      id="work"
      className="relative scroll-mt-20 overflow-hidden bg-[#070312] py-12 sm:py-16"
    >
      {/* Deep cinematic backdrop — near-black base, a few restrained glows, and a
          grid so faint it only reads as texture. Not a flat purple block. */}
      <div className="pointer-events-none absolute inset-0">
        <ScrollParallax speed={0.22} className="absolute -left-40 top-4 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.16),transparent_68%)] blur-2xl" />
        <ScrollParallax speed={-0.16} className="absolute -right-28 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,45,155,0.09),transparent_70%)] blur-2xl" />
        <div className="absolute bottom-[-6rem] left-1/4 h-[26rem] w-[44rem] rounded-full bg-[radial-gradient(ellipse,rgba(46,107,255,0.1),transparent_70%)] blur-2xl" />
        <div className="grid-backdrop absolute inset-0 opacity-[0.045] [mask-image:radial-gradient(ellipse_at_50%_40%,#000,transparent_78%)]" />
      </div>

      <div className="container-content relative z-10">
        {/* Header */}
        <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-violet-300/80">
              <span className="h-px w-8 bg-lime" />
              Featured projects
            </p>
            <h2 className="mt-4 font-display text-4xl uppercase leading-[0.9] text-white sm:text-5xl lg:text-[3.4rem]">
              Real projects. <span className="brush-word text-accent-glow">Real impact.</span>
            </h2>
          </div>
          <a
            href="#about"
            className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide text-lime transition-colors hover:text-lime-400"
          >
            Start your project
            <ArrowRight width={16} height={16} />
          </a>
        </Reveal>

        {/* Featured case study — wide, screenshot + copy side by side */}
        <Reveal as="article" className={`mt-8 ${cardBase}`}>
          <CardSpotlight />
          <div className="relative z-[1] grid lg:grid-cols-[1.6fr_1fr]">
            <div className="relative border-b border-white/[0.06] lg:border-b-0 lg:border-r">
              <Shot project={featured} ratio="aspect-[16/9]" />

              {/* Floating fragments of the site's real tools — makes the
                  screenshot read as a living product, not a pasted image */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
                <div className="absolute right-5 top-14 w-40 animate-float rounded-xl border border-white/15 bg-[#0b0616]/85 p-3 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.55rem] font-bold uppercase tracking-wide text-white/60">ROI calculator</span>
                    <span className="font-display text-sm text-lime">8.4%</span>
                  </div>
                  <svg viewBox="0 0 130 30" className="mt-2 h-7 w-full" fill="none">
                    <path d="M2 26 C 30 24, 50 18, 72 13 S 112 4, 128 3" stroke="#CBFF3C" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
                    <path d="M2 26 C 30 24, 50 18, 72 13 S 112 4, 128 3 L 128 28 L 2 28 Z" fill="rgba(203,255,60,0.08)" />
                  </svg>
                </div>
                <div className="absolute bottom-16 right-24 animate-float-slow rounded-lg border border-white/15 bg-[#0b0616]/85 px-3 py-2 shadow-xl backdrop-blur-md" style={{ animationDelay: "1.2s" }}>
                  <span className="flex items-center gap-2 text-[0.62rem] font-semibold text-white/80">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[0.55rem] text-ink">✓</span>
                    Flood-zone check · build ready
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3 p-5 sm:p-7">
              <div>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet-300/70">Featured build</span>
                <h3 className="mt-1.5 font-display text-[1.7rem] uppercase leading-none text-white">{featured.name}</h3>
              </div>
              <p className="text-[0.85rem] leading-relaxed text-white/60">{featured.blurb}</p>
              <Bullets items={featured.features} className="space-y-1.5" />
              <p className="border-l-2 border-lime/50 pl-3 text-[0.8rem] italic leading-relaxed text-white/65">
                {featured.result}
              </p>
              <LiveLink href={featured.href} pin={false} />
            </div>
          </div>
        </Reveal>

        {/* Prominent work — 2-up */}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {main.map((project, i) => (
            <Reveal
              as="article"
              key={project.name}
              delay={i * 110}
              className={`flex flex-col ${cardBase} hover:-translate-y-1`}
            >
              <CardSpotlight />
              <div className="relative z-[1] flex flex-1 flex-col">
                <Shot project={project} ratio="aspect-[16/9]" />
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <h3 className="font-display text-xl uppercase leading-none text-white">{project.name}</h3>
                  <p className="text-[0.82rem] leading-relaxed text-white/55">{project.blurb}</p>
                  <Bullets items={project.features} className="mt-0.5 space-y-1.5" />
                  <LiveLink href={project.href} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* More work — quieter 2-up: screenshot + name + one line, no bullets */}
        {more.length > 0 && (
          <div className="mt-9">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
              <span className="h-px w-8 bg-white/20" />
              More work
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              {more.map((project) => (
                <Reveal
                  as="article"
                  key={project.name}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] transition-colors hover:border-white/15"
                >
                  <Shot project={project} ratio="aspect-[16/9]" />
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <h3 className="font-display text-lg uppercase leading-none text-white/90">{project.name}</h3>
                    <p className="text-[0.8rem] leading-relaxed text-white/50">{project.blurb}</p>
                    <LiveLink href={project.href} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
