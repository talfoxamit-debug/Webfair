import Reveal from "./Reveal";
import { ArrowRight, Calendar, Check } from "./icons";
import { finalCta, site } from "@/lib/content";

const avatarGradients = [
  "from-flare-orange to-flare-red",
  "from-flare-red to-flare-purple",
  "from-flare-purple to-flare-blue",
  "from-flare-blue to-lime",
];

export default function FinalCTA() {
  return (
    <section id="about" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-violet-600/15 blur-[130px]" />
      <div className="container-content relative grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left: pitch */}
        <Reveal>
          <p className="eyebrow">{finalCta.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
            {finalCta.heading}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60">{finalCta.body}</p>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {finalCta.points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm font-medium text-white/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime/15 text-lime">
                  <Check width={13} height={13} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Right: booking card */}
        <Reveal delay={120} className="card relative p-8 sm:p-10">
          <div className="mb-6 flex items-start gap-3">
            <span className="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-violet-400/50 bg-violet-500/10 text-violet-400">
              <Calendar width={28} height={28} />
            </span>
            <div>
              <h3 className="font-display text-2xl uppercase text-white">{finalCta.formTitle}</h3>
              <p className="mt-1 text-base text-white/65">{finalCta.formSub}</p>
            </div>
          </div>

          <a
            href={site.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8 flex w-full !rounded-md"
          >
            {finalCta.calendlyLabel}
            <ArrowRight width={18} height={18} />
          </a>

          <div className="mt-6 flex items-center gap-3 border-t border-white/[0.08] pt-6">
            <div className="flex -space-x-2.5">
              {avatarGradients.map((g, i) => (
                <span
                  key={i}
                  className={`h-8 w-8 rounded-full border-2 border-ink-600 bg-gradient-to-br ${g}`}
                />
              ))}
            </div>
            <p className="text-xs leading-snug text-white/50">{finalCta.trust}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
