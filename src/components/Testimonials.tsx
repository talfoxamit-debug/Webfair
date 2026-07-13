import Reveal from "./Reveal";
import { testimonials } from "@/lib/content";

export default function Testimonials() {
  return (
    <section className="relative py-10 sm:py-12">
      <div className="container-content relative">
        <Reveal className="mb-7 flex items-center gap-3">
          <span className="h-px w-8 bg-white/20" />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            What clients say
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal
              as="article"
              key={i}
              delay={i * 90}
              className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.015] p-5"
            >
              <div className="flex gap-0.5 text-[0.7rem] text-lime/80" aria-hidden="true">
                {"★★★★★".split("").map((s, j) => (
                  <span key={j}>{s}</span>
                ))}
              </div>
              <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-white/70">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-xs"><span className="font-semibold text-white/80">{t.name}</span> <span className="text-white/40">· {t.role}</span></p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
