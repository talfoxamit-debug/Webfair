import Reveal from "./Reveal";
import { ArrowRight } from "./icons";
import { investment } from "@/lib/content";

export default function Investment() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-content">
        <Reveal className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-700 via-violet-600 to-violet-700 px-6 py-12 shadow-glow-violet sm:px-12 sm:py-14">
          {/* Growth-curve backdrop */}
          <svg
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-70 lg:block"
            viewBox="0 0 400 260"
            fill="none"
            preserveAspectRatio="xMaxYMid slice"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="grow" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#CBFF3C" stopOpacity="0" />
                <stop offset="100%" stopColor="#CBFF3C" />
              </linearGradient>
            </defs>
            {/* grid */}
            <g stroke="#ffffff" strokeOpacity="0.12">
              {[...Array(6)].map((_, i) => (
                <line key={`v${i}`} x1={i * 70} y1="0" x2={i * 70} y2="260" />
              ))}
              {[...Array(5)].map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 60} x2="400" y2="260" />
              ))}
            </g>
            <path d="M0 230 C 90 210, 150 180, 210 140 S 320 40, 392 18" stroke="url(#grow)" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="392" cy="18" r="7" fill="#CBFF3C" className="animate-pulse-glow" />
            <circle cx="392" cy="18" r="14" fill="#CBFF3C" opacity="0.25" className="animate-pulse-glow" />
          </svg>

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lime">
                {investment.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-3xl uppercase leading-none text-white sm:text-4xl">
                {investment.headline}
              </h2>
              <p className="mt-1 font-display text-6xl leading-none text-white sm:text-7xl">
                {investment.price}
              </p>
            </div>

            <div className="lg:pl-8">
              <p className="max-w-sm text-base leading-relaxed text-white/85">
                {investment.sub}
              </p>
              <a href="#about" className="btn-dark mt-6">
                {investment.cta}
                <ArrowRight width={18} height={18} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
