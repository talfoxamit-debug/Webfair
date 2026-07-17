import type { Metadata } from "next";
import FeaturedProjects from "@/components/FeaturedProjects";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import BrushWord from "@/components/BrushWord";
import { Check } from "@/components/icons";

export const metadata: Metadata = {
  title: "Our Work | Stackwrk",
  description:
    "Real websites and web apps we've built for contractors and local businesses: instant-quote fence sites, HVAC estimate flows, booking platforms, and custom software.",
  alternates: { canonical: "https://stackwrk.com/work" },
};

export default function WorkPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden pb-4 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.14]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(203,255,60,0.1),transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute right-[8%] top-24 h-72 w-72 rounded-full bg-violet-600/15 blur-[90px]" />
        <div className="pointer-events-none absolute -right-6 top-14 z-0 hidden w-[20%] max-w-[220px] xl:block" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- static decorative asset */}
          <img src="/fox-proud.webp" alt="" loading="lazy" decoding="async" className="w-full animate-float-y opacity-90 drop-shadow-[0_0_40px_rgba(203,255,60,0.16)]" />
        </div>
        <div className="container-content relative z-10 text-center">
          <Reveal className="mx-auto max-w-2xl">
            <p className="eyebrow">Our work</p>
            <h1 className="mt-3 font-display text-5xl uppercase leading-[0.92] text-white sm:text-6xl">
              Sites built to<br /><BrushWord>book more jobs.</BrushWord>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-white/60">
              Every build is custom-coded and conversion-first. Here&rsquo;s a sample of what we ship
              for contractors and local businesses across South Florida.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/50">
              <span className="inline-flex items-center gap-1.5"><Check width={15} height={15} className="text-lime" /> Fence &amp; exterior</span>
              <span className="inline-flex items-center gap-1.5"><Check width={15} height={15} className="text-lime" /> HVAC &amp; home services</span>
              <span className="inline-flex items-center gap-1.5"><Check width={15} height={15} className="text-lime" /> Custom apps</span>
            </div>
          </Reveal>
        </div>
      </section>

      <FeaturedProjects />
      <FinalCTA />
      <Footer />
    </>
  );
}
