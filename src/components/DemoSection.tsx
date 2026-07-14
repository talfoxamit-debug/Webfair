import DemoShowcase from "./DemoShowcase";
import Reveal from "./Reveal";

export default function DemoSection() {
  return (
    <section id="demos" className="relative scroll-mt-20 overflow-hidden py-12 sm:py-16">
      <div className="container-content relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">See what I can build</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            Not just websites. <span className="text-accent-glow">Tools that sell.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Real, interactive features I build into client sites: booking, calculators, AI chat, redesigns.
          </p>
        </Reveal>

        <div className="mt-8">
          <DemoShowcase />
        </div>
      </div>
    </section>
  );
}
