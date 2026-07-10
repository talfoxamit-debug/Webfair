import AuditForm from "./AuditForm";
import Reveal from "./Reveal";
import { Calendar, Check, Mail, TrendUp } from "./icons";
import { finalCta, site } from "@/lib/content";

const deliverables = [
  {
    icon: Mail,
    title: "Your full audit report",
    sub: "Every issue found, scored and explained — in your inbox.",
  },
  {
    icon: TrendUp,
    title: "A prioritized fix list",
    sub: "What to fix first and what each fix is worth to you.",
  },
  {
    icon: Calendar,
    title: "A 30-min call — no obligation",
    sub: "We walk through it together. Keep the plan either way.",
  },
];

const avatarGradients = [
  "from-flare-orange to-flare-red",
  "from-flare-red to-flare-purple",
  "from-flare-purple to-flare-blue",
  "from-flare-blue to-lime",
];

export default function FinalCTA() {
  return (
    <section id="about" className="relative scroll-mt-20 overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-10">
      <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-violet-600/15 blur-[80px]" />

      {/* The fox returns — brand bookend, sitting proud and looking up toward
          the closing pitch. Gently floats in place (frozen by reduced-motion). */}
      <div className="pointer-events-none absolute -bottom-6 -left-8 z-0 hidden xl:block" aria-hidden="true">
        <div className="absolute inset-0 scale-110 rounded-full bg-[radial-gradient(circle,rgba(162,28,224,0.18),transparent_68%)] blur-2xl" />
        <div className="animate-float-y">
          {/* eslint-disable-next-line @next/next/no-img-element -- static decorative asset */}
          <img
            src="/fox-proud.webp"
            alt=""
            loading="lazy"
            decoding="async"
            className="relative w-60 opacity-90 drop-shadow-[0_0_45px_rgba(203,255,60,0.14)]"
          />
        </div>
      </div>
      <div className="container-content relative grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left: pitch */}
        <Reveal>
          {/* Mobile: proud fox in-flow above the pitch (centered, no overflow). */}
          <div className="pointer-events-none mx-auto mb-6 w-40 xl:hidden" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative */}
            <img src="/fox-proud.webp" alt="" loading="lazy" decoding="async" className="w-full animate-float-y opacity-90 drop-shadow-[0_0_35px_rgba(203,255,60,0.14)]" />
          </div>
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

          {/* What booking actually gets you — the deliverable stack */}
          <div className="relative mt-9 max-w-md space-y-3">
            {deliverables.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.title}
                  className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 backdrop-blur-sm transition-colors hover:border-lime/25"
                  style={{ marginLeft: i * 14 }}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-lime/35 bg-lime/[0.07] text-lime">
                    <Icon width={17} height={17} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{d.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/50">{d.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
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

          <AuditForm />

          <a
            href={site.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block text-center text-sm font-medium text-white/60 underline-offset-4 transition-colors hover:text-lime hover:underline"
          >
            {finalCta.calendlyLabel} →
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
