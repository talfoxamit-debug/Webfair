import Reveal from "./Reveal";
import { iconMap } from "./icons";
import { whatYouGet } from "@/lib/content";

export default function WhatYouGet() {
  return (
    <section id="process" className="relative border-y border-white/[0.06] py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-20" />
      <div className="container-content relative grid gap-12 lg:grid-cols-[0.95fr_2fr] lg:items-start">
        <Reveal>
          <p className="eyebrow">What you get</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            {whatYouGet.heading[0]}
            <br />
            <span className="text-white/45">{whatYouGet.heading[1]}</span>
          </h2>
        </Reveal>

        <div className="grid gap-0 sm:grid-cols-4">
          {whatYouGet.items.map((item, i) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <Reveal key={item.title} delay={i * 100} className="relative border-white/10 py-2 sm:border-l sm:px-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-lime/40 text-lime shadow-glow-lime">
                  <Icon width={22} height={22} />
                </span>
                <h3 className="mt-5 font-display text-xl uppercase tracking-wide text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
