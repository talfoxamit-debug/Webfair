"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { howItWorks } from "@/lib/content";

/* ----------------------------------------------------- step mini-artifacts */
/** ① a concrete audit scorecard — score + labelled category bars */
function MiniAudit() {
  const cats: [string, number, string][] = [
    ["Speed", 61, "#A8E016"],
    ["Mobile", 48, "#FBBF24"],
    ["SEO", 55, "#FBBF24"],
    ["Convert", 40, "#FB5C7D"],
  ];
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative h-14 w-14 shrink-0">
        <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
          <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle cx="24" cy="24" r="19" fill="none" stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" strokeDasharray="64 120" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-base text-white">54</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        {cats.map(([label, w, color]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-[0.55rem] uppercase tracking-wide text-white/40">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full" style={{ width: `${w}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** ② a polished mini hero inside a browser frame (the design coming to life) */
function MiniBuild() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-ink-800/60">
      <div className="flex items-center gap-1 border-b border-white/[0.06] bg-white/[0.03] px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-flare-red/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-flare-orange/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-lime/70" />
      </div>
      <div className="flex gap-2 bg-gradient-to-br from-violet-900/40 via-ink-800 to-ink-800 p-2.5">
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-4/5 rounded-sm bg-white/85" />
          <div className="h-2 w-3/5 rounded-sm bg-lime/85" />
          <div className="h-1 w-full rounded-sm bg-white/15" />
          <div className="h-1 w-2/3 rounded-sm bg-white/10" />
          <div className="mt-1 h-3 w-12 rounded bg-lime shadow-[0_0_10px_-2px_rgba(203,255,60,0.6)]" />
        </div>
        <div className="w-2/5 shrink-0 rounded-md bg-gradient-to-br from-flare-orange/60 via-flare-purple/40 to-flare-blue/40" />
      </div>
    </div>
  );
}

/** ③ rising growth curve + a concrete uplift chip */
function MiniGrowth() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 120 48" className="h-12 min-w-0 flex-1" fill="none" preserveAspectRatio="none">
        <path d="M4 42 C 30 40, 46 30, 66 22 S 102 8, 116 5" stroke="rgba(203,255,60,0.85)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M4 42 C 30 40, 46 30, 66 22 S 102 8, 116 5 L 116 46 L 4 46 Z" fill="rgba(203,255,60,0.07)" />
        <circle cx="116" cy="5" r="3.5" fill="#CBFF3C" className="animate-pulse-glow" />
      </svg>
      <span className="shrink-0 rounded-md border border-lime/30 bg-lime/10 px-2 py-1 text-[0.7rem] font-bold text-lime">
        ↑ 3.2× leads
      </span>
    </div>
  );
}

const ARTIFACTS = [MiniAudit, MiniBuild, MiniGrowth];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setDrawn(true);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="relative scroll-mt-20 py-12 sm:py-16">
      <div className="container-content">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{howItWorks.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            {howItWorks.heading[0]}
            <br />
            <span className="text-white/45">{howItWorks.heading[1]}</span>
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-10">
          {/* Connecting journey line — draws itself across the three steps */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -top-5 left-0 hidden h-[60px] w-full md:block"
          >
            <path
              d="M 60 50 C 240 10, 400 10, 600 30 S 980 55, 1140 18"
              fill="none"
              stroke="url(#journey)"
              strokeWidth="1.5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={drawn ? 0 : 1}
              style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.6,0,0.3,1) 0.2s" }}
            />
            <defs>
              <linearGradient id="journey" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.7" />
                <stop offset="55%" stopColor="#FF2D9B" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#CBFF3C" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid gap-5 md:grid-cols-3">
            {howItWorks.steps.map((s, i) => {
              const Artifact = ARTIFACTS[i];
              return (
                <Reveal
                  as="div"
                  key={s.n}
                  delay={i * 140}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-lime/30"
                >
                  {/* ghost digit */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3 -top-7 select-none font-display text-[7rem] leading-none text-white/[0.045] transition-colors duration-500 group-hover:text-lime/[0.07]"
                  >
                    {s.n}
                  </span>

                  <div className="relative">
                    <span className="font-display text-xl text-lime/60">{s.n}</span>
                    <h3 className="mt-2 font-display text-xl uppercase tracking-wide text-white">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
                    <div className="mt-5 border-t border-white/[0.06] pt-4 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
                      <Artifact />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
