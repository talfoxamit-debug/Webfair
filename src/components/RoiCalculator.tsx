"use client";

import { useState } from "react";
import { ArrowRight, TrendUp } from "./icons";
import { site } from "@/lib/content";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/**
 * Standalone Website ROI calculator (the /tools/roi-calculator lead magnet).
 * Compares revenue at a typical "dated site" conversion rate against a fast,
 * conversion-focused one, using the visitor's own traffic + average sale.
 */
export default function RoiCalculator() {
  const [visitors, setVisitors] = useState(3000);
  const [value, setValue] = useState(180);
  const [current, setCurrent] = useState(1.6);
  const improved = Math.max(current + 1, 4.4);

  const currentRev = ((visitors * current) / 100) * value;
  const improvedRev = ((visitors * improved) / 100) * value;
  const uplift = improvedRev - currentRev;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_40px_120px_-60px_rgba(124,58,237,0.5)] backdrop-blur-sm sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-white">
          Monthly visitors: <span className="text-lime">{visitors.toLocaleString()}</span>
          <input
            type="range" min={200} max={50000} step={100} value={visitors}
            onChange={(e) => setVisitors(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
        </label>
        <label className="block text-sm font-semibold text-white">
          Average sale value: <span className="text-lime">{money(value)}</span>
          <input
            type="range" min={20} max={5000} step={10} value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
        </label>
        <label className="block text-sm font-semibold text-white sm:col-span-2">
          Your current conversion rate: <span className="text-lime">{current.toFixed(1)}%</span>
          <input
            type="range" min={0.2} max={4} step={0.1} value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/40">
            Most small-business sites convert 1 to 2%. A fast, focused site targets ~{improved.toFixed(1)}%.
          </span>
        </label>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-white/40">Your site now</p>
          <p className="mt-1 font-display text-2xl text-white/70">{money(currentRev)}</p>
          <p className="text-xs text-white/40">/mo · {current.toFixed(1)}% convert</p>
        </div>
        <div className="rounded-xl border border-lime/30 bg-lime/[0.06] p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-lime">With a Stackwrk site</p>
          <p className="mt-1 font-display text-2xl text-white">{money(improvedRev)}</p>
          <p className="text-xs text-white/50">/mo · {improved.toFixed(1)}% convert</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1 rounded-xl border border-lime/25 bg-lime/[0.04] py-4 text-center">
        <div className="flex items-center gap-2">
          <TrendUp width={18} height={18} className="text-lime" />
          <span className="font-display text-2xl text-lime">+{money(uplift)}/mo</span>
        </div>
        <span className="text-sm text-white/70">
          about <span className="font-semibold text-white">{money(uplift * 12)}/year</span> in recovered revenue
        </span>
      </div>

      <p className="mt-3 text-center text-[0.78rem] text-white/35">
        Illustrative: real lift depends on your traffic quality &amp; offer.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !rounded-md">
          Get this uplift, book a free call
          <ArrowRight width={18} height={18} />
        </a>
        <a href="/tools/website-audit" className="btn-ghost !rounded-md">
          Run a free site audit
        </a>
      </div>
    </div>
  );
}
