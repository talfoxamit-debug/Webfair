"use client";

import { useMemo, useState } from "react";
import { NAVY, GREEN } from "@/lib/fence-theme";

/** Estimates the bill of materials for a wood/privacy fence run. Great for the
 *  homeowner who wants to sanity-check a quote, and shows real craftsmanship. */
export default function MaterialsCalculator() {
  const [feet, setFeet] = useState(150);
  const [spacing, setSpacing] = useState(8);
  const [gates, setGates] = useState(1);
  const [pickets, setPickets] = useState(true);

  const bom = useMemo(() => {
    const sections = Math.ceil(feet / spacing);
    const posts = sections + 1 + gates * 2;
    const concrete = posts * 2; // ~2 bags per post
    const rails = sections * 3; // 3-rail for a 6-ft privacy fence
    const picketCount = pickets ? Math.ceil((feet * 12) / 5.5) : 0; // 5.5" boards, no gap
    return { sections, posts, concrete, rails, picketCount };
  }, [feet, spacing, gates, pickets]);

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between border-t border-black/[0.06] py-2.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-bold" style={{ color: NAVY }}>{value}</span>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Total length</label>
          <span className="text-sm font-bold" style={{ color: NAVY }}>{feet} ft</span>
        </div>
        <input type="range" min={20} max={500} step={5} value={feet} onChange={(e) => setFeet(Number(e.target.value))} className="mt-2 w-full accent-emerald-600" />

        <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">Post spacing</label>
        <div className="mt-2 flex gap-2">
          {[6, 8].map((s) => (
            <button key={s} onClick={() => setSpacing(s)} className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold" style={spacing === s ? { borderColor: GREEN, background: "#EAF6EF", color: NAVY } : { borderColor: "rgba(0,0,0,0.1)", color: "#64748b" }}>{s} ft</button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Gates</label>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => setGates((g) => Math.max(0, g - 1))} aria-label="Fewer gates" className="h-9 w-9 rounded-lg border border-black/10 text-lg font-bold text-slate-600">-</button>
              <span className="flex-1 text-center text-sm font-bold" style={{ color: NAVY }}>{gates}</span>
              <button onClick={() => setGates((g) => Math.min(6, g + 1))} className="h-9 w-9 rounded-lg border border-black/10 text-lg font-bold text-slate-600">+</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Privacy boards?</label>
            <button onClick={() => setPickets((p) => !p)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm font-semibold" style={pickets ? { borderColor: GREEN, background: "#EAF6EF", color: NAVY } : { borderColor: "rgba(0,0,0,0.1)", color: "#64748b" }}>{pickets ? "Yes, count boards" : "No"}</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/[0.07] bg-[#FAFAF7] p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Estimated materials</p>
        <div className="mt-2">
          <Row label="Fence sections" value={`${bom.sections}`} />
          <Row label="Line & end posts" value={`${bom.posts}`} />
          <Row label="Rails" value={`${bom.rails}`} />
          {pickets && <Row label="Privacy boards (5.5″)" value={`${bom.picketCount}`} />}
          <Row label="Concrete (60-lb bags)" value={`${bom.concrete}`} />
        </div>
        <p className="mt-3 text-[0.75rem] leading-relaxed text-slate-400">Rough estimate for planning. Actual counts vary with terrain, corners and gate hardware. We spec it exactly on-site.</p>
      </div>
    </div>
  );
}
