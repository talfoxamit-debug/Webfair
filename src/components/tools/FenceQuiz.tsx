"use client";

import { useState } from "react";
import { MATERIALS, NAVY, GREEN, GREEN_BRIGHT } from "@/lib/fence-theme";

type Opt = { label: string; scores: Partial<Record<string, number>> };
type Q = { q: string; opts: Opt[] };

const QUESTIONS: Q[] = [
  { q: "What matters most to you?", opts: [
    { label: "Total privacy", scores: { wood: 2, vinyl: 3 } },
    { label: "Lowest price", scores: { chain: 3, wood: 1 } },
    { label: "Never maintaining it", scores: { vinyl: 3, aluminum: 2 } },
    { label: "Upscale looks", scores: { aluminum: 3, vinyl: 1 } },
  ] },
  { q: "Is it going around a pool?", opts: [
    { label: "Yes", scores: { aluminum: 3 } },
    { label: "No", scores: { wood: 1, vinyl: 1, chain: 1 } },
  ] },
  { q: "Do you have pets or kids to contain?", opts: [
    { label: "Yes, keep them in", scores: { chain: 2, vinyl: 1, aluminum: 1 } },
    { label: "No", scores: { wood: 1 } },
  ] },
  { q: "Your budget vibe?", opts: [
    { label: "Keep it tight", scores: { chain: 3, wood: 1 } },
    { label: "Best value long-term", scores: { vinyl: 3 } },
    { label: "Splurge for the look", scores: { aluminum: 3 } },
  ] },
];

export default function FenceQuiz() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const done = step >= QUESTIONS.length;

  function choose(o: Opt) {
    const next = { ...scores };
    for (const [k, v] of Object.entries(o.scores)) next[k] = (next[k] || 0) + (v || 0);
    setScores(next);
    setStep((s) => s + 1);
  }
  function reset() { setScores({}); setStep(0); }

  const winner = done
    ? MATERIALS.reduce((best, m) => ((scores[m.key] || 0) > (scores[best.key] || 0) ? m : best), MATERIALS[0])
    : null;

  if (done && winner) {
    return (
      <div className="rounded-2xl border border-black/[0.07] bg-[#FAFAF7] p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your best match</p>
        <p className="mt-1 text-3xl font-extrabold" style={{ color: GREEN }}>{winner.name} Fence</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">{winner.bestFor}. {winner.cost} installed · {winner.lifespan} lifespan · {winner.maintenance.toLowerCase()} maintenance.</p>
        <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <a href="#quote" className="rounded-lg px-5 py-2.5 text-sm font-bold text-white" style={{ background: GREEN_BRIGHT }}>Get a {winner.name.toLowerCase()} quote →</a>
          <button onClick={reset} className="text-sm font-semibold text-slate-500 hover:text-slate-700">Retake quiz</button>
        </div>
      </div>
    );
  }

  const cur = QUESTIONS[step];
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Question {step + 1} of {QUESTIONS.length}</p>
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => <span key={i} className="h-1.5 w-6 rounded-full" style={{ background: i <= step ? GREEN : "rgba(0,0,0,0.1)" }} />)}
        </div>
      </div>
      <p className="mt-3 text-lg font-bold" style={{ color: NAVY }}>{cur.q}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {cur.opts.map((o) => (
          <button key={o.label} onClick={() => choose(o)} className="rounded-xl border border-black/10 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-500 hover:bg-[#EAF6EF]">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
