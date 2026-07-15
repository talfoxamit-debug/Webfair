"use client";

import { useMemo, useState } from "react";
import { CALL_SCRIPT, type Prospect } from "@/lib/prospects";

/**
 * Live-call console. Instead of one wall of script text, it's tappable
 * chapters (Opener / Gatekeeper / Objections / Voicemail) so you jump
 * straight to what you need mid-call. Each move shows a small "cue" (when /
 * why, or the objection you just heard) and the big line to actually say,
 * filled in for this lead, with one-tap copy.
 */
export default function CallConsole({ p, fill, onCopy }: { p: Prospect; fill: (t: string, p: Prospect) => string; onCopy: (t: string) => void }) {
  const [chapter, setChapter] = useState(CALL_SCRIPT[0].key);
  const [showWhy, setShowWhy] = useState(false);
  const active = useMemo(() => CALL_SCRIPT.find((c) => c.key === chapter) ?? CALL_SCRIPT[0], [chapter]);

  // Opener has a has-site and a no-site variant; show only the one that fits.
  const moves = active.moves.filter((m) => !m.only || (m.only === "site" ? p.hasSite : !p.hasSite));

  return (
    <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-lime/25 dark:bg-lime/[0.06]">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-lime">📞 Call console: {p.owner || p.name}</p>

      {/* who answered? router / chapter tabs */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CALL_SCRIPT.map((c) => (
          <button
            key={c.key}
            onClick={() => { setChapter(c.key); setShowWhy(false); }}
            className={`rounded-lg px-2.5 py-1.5 text-[0.72rem] font-bold transition-colors ${
              c.key === chapter
                ? "bg-emerald-600 text-white dark:bg-lime dark:text-ink"
                : "bg-white/70 text-emerald-800 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
            }`}
          >
            {c.tab}
          </button>
        ))}
      </div>

      {/* when to use + optional coaching */}
      <div className="mt-2 flex items-start justify-between gap-2">
        <p className="text-[0.7rem] italic crm-muted">{active.when}</p>
        {active.why && (
          <button onClick={() => setShowWhy((v) => !v)} className="shrink-0 text-[0.65rem] font-semibold text-emerald-700 underline underline-offset-2 dark:text-lime">
            {showWhy ? "hide" : "why this works"}
          </button>
        )}
      </div>
      {showWhy && active.why && (
        <p className="mt-1 rounded-md bg-white/60 p-2 text-[0.68rem] leading-relaxed crm-muted dark:bg-white/5">{active.why}</p>
      )}

      {/* the moves for this chapter */}
      <div className="mt-2 space-y-2">
        {moves.map((m, i) => {
          const say = fill(m.say, p);
          return (
            <div key={i} className="rounded-lg bg-white/70 p-2.5 dark:bg-white/[0.06]">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[0.68rem] font-bold text-emerald-800 dark:text-lime">{m.cue}</span>
                <button
                  onClick={() => onCopy(say)}
                  className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[0.6rem] font-bold text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                >
                  Copy
                </button>
              </div>
              <p className="mt-1 text-[0.82rem] font-medium leading-snug crm-strong">{say}</p>
              {m.note && <p className="mt-1 text-[0.64rem] crm-subtle">💡 {m.note}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
