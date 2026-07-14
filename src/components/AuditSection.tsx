import AuditTool from "./AuditTool";
import Reveal from "./Reveal";

export default function AuditSection() {
  return (
    <section id="audit" className="relative scroll-mt-20 overflow-hidden py-11 sm:py-14">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-[34rem] -translate-x-1/2 rounded-full bg-lime/[0.07] blur-[90px]" />
      <div className="container-content relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Free instant audit</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            How does your site <span className="text-accent-glow">really</span> perform?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Drop in your website for an instant scorecard: speed, mobile, SEO and the
            conversion gaps quietly costing you customers.
          </p>
        </Reveal>

        <div className="mt-7">
          <AuditTool />
        </div>
      </div>
    </section>
  );
}
