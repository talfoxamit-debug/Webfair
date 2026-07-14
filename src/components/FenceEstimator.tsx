"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "@/components/icons";

const NAVY = "#0C2333";
const GREEN = "#18894C";
const GREEN_BRIGHT = "#1FA85E";

/** Realistic South-FL installed pricing per linear foot (materials + labor, 2026). */
const TYPES = [
  { key: "wood", label: "Wood privacy", low: 28, high: 45 },
  { key: "vinyl", label: "Vinyl", low: 32, high: 55 },
  { key: "aluminum", label: "Aluminum / ornamental", low: 35, high: 60 },
  { key: "chain", label: "Chain-link", low: 15, high: 26 },
] as const;

const HEIGHTS = [
  { key: "4", label: "4 ft", mult: 0.85 },
  { key: "6", label: "6 ft", mult: 1 },
  { key: "8", label: "8 ft", mult: 1.25 },
] as const;

const money = (n: number) => {
  const v = Math.round(n / 50) * 50;
  return v > 0 ? "$" + v.toLocaleString() : "$0";
};

/**
 * Instant fence cost estimator — the lead-magnet centerpiece. Pure client math,
 * no backend. Gives a homeowner a real ballpark in seconds, then funnels them
 * to the quote form. Reused verbatim by the mockup generator per prospect.
 */
export default function FenceEstimator({ phone }: { phone: string }) {
  const [type, setType] = useState<(typeof TYPES)[number]["key"]>("vinyl");
  const [feet, setFeet] = useState(150);
  const [height, setHeight] = useState<(typeof HEIGHTS)[number]["key"]>("6");
  const [gates, setGates] = useState(1);

  const { low, high, monthly } = useMemo(() => {
    const t = TYPES.find((x) => x.key === type)!;
    const h = HEIGHTS.find((x) => x.key === height)!;
    const gateLow = gates * 350;
    const gateHigh = gates * 700;
    const low = feet * t.low * h.mult + gateLow;
    const high = feet * t.high * h.mult + gateHigh;
    const monthly = (low + high) / 2 / 48; // 48-mo financing
    return { low, high, monthly };
  }, [type, feet, height, gates]);

  return (
    <div className="grid gap-6 rounded-3xl border border-black/[0.07] bg-white p-6 shadow-lg sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
      {/* controls */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Fence type</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className="rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors"
              style={type === t.key
                ? { borderColor: GREEN, background: "#EAF6EF", color: NAVY }
                : { borderColor: "rgba(0,0,0,0.1)", color: "#475569" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Length</label>
          <span className="text-sm font-bold" style={{ color: NAVY }}>{feet} linear ft</span>
        </div>
        <input
          type="range" min={20} max={500} step={10} value={feet}
          onChange={(e) => setFeet(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-600"
        />
        <div className="flex justify-between text-[0.75rem] text-slate-400"><span>20 ft</span><span>500 ft</span></div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Height</label>
            <div className="mt-2 flex gap-2">
              {HEIGHTS.map((h) => (
                <button
                  key={h.key}
                  onClick={() => setHeight(h.key)}
                  className="flex-1 rounded-lg border px-2 py-2 text-sm font-semibold transition-colors"
                  style={height === h.key
                    ? { borderColor: GREEN, background: "#EAF6EF", color: NAVY }
                    : { borderColor: "rgba(0,0,0,0.1)", color: "#475569" }}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Gates</label>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => setGates((g) => Math.max(0, g - 1))} className="h-9 w-9 rounded-lg border border-black/10 text-lg font-bold text-slate-600">–</button>
              <span className="flex-1 text-center text-sm font-bold" style={{ color: NAVY }}>{gates}</span>
              <button onClick={() => setGates((g) => Math.min(6, g + 1))} className="h-9 w-9 rounded-lg border border-black/10 text-lg font-bold text-slate-600">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* result */}
      <div className="flex flex-col justify-between rounded-2xl p-6 text-white" style={{ background: `linear-gradient(160deg, ${NAVY}, #123a52)` }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Estimated project cost</p>
          <p className="mt-1 text-3xl font-extrabold leading-tight sm:text-[2.1rem]">
            {money(low)}<span className="text-white/50"> – </span>{money(high)}
          </p>
          <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-emerald-300">
            or about ${Math.round(monthly).toLocaleString()}/mo
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/55">
            Ballpark based on typical South-Florida installs. Your exact price depends on
            terrain, materials &amp; access. We&rsquo;ll confirm it free on-site.
          </p>
        </div>
        <div className="mt-5 space-y-2">
          <a href="#quote" className="flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white shadow-lg" style={{ background: GREEN_BRIGHT }}>
            Get my exact quote <ArrowRight width={16} height={16} />
          </a>
          <a href={`tel:${phone.replace(/[^0-9]/g, "")}`} className="block text-center text-sm font-semibold text-white/70 hover:text-white">
            or call {phone}
          </a>
        </div>
      </div>
    </div>
  );
}
