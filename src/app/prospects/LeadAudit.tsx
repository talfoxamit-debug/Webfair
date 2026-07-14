"use client";

import { useState } from "react";

type CheckStatus = "pass" | "warn" | "fail";
type Check = { label: string; status: CheckStatus; detail: string };
type Category = { key: string; label: string; score: number; checks: Check[] };
type Result = { score: number; finalUrl: string; loadMs: number; categories: Category[]; headline: string };

const scoreColor = (n: number) =>
  n >= 80 ? "text-emerald-600 dark:text-lime" : n >= 55 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
const barColor = (n: number) =>
  n >= 80 ? "bg-emerald-500 dark:bg-lime" : n >= 55 ? "bg-amber-500" : "bg-rose-500";

/**
 * Runs the same public audit on a prospect's site, right inside the CRM drawer,
 * so you can see exactly where they're falling behind before you dial. Reuses
 * /api/audit — no new backend.
 */
export default function LeadAudit({ url }: { url: string }) {
  const [phase, setPhase] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");

  async function run() {
    setPhase("loading"); setErr("");
    try {
      const r = await fetch("/api/audit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setRes(j as Result); setPhase("done"); }
      else { setErr(j.message || "Couldn't reach that site."); setPhase("error"); }
    } catch { setErr("Network error — try again."); setPhase("error"); }
  }

  // The "where they're falling behind" list: fails first, then warns.
  const problems = res
    ? res.categories.flatMap((c) => c.checks.filter((ch) => ch.status !== "pass").map((ch) => ({ ...ch, cat: c.label })))
        .sort((a, b) => (a.status === "fail" ? -1 : 1) - (b.status === "fail" ? -1 : 1))
        .slice(0, 6)
    : [];

  return (
    <div className="mt-5 rounded-lg p-3 crm-stat">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide crm-muted">Their site — where it's falling behind</p>
        {phase !== "loading" && (
          <button onClick={run} className="rounded-md bg-lime px-2.5 py-1 text-[0.7rem] font-bold text-ink">
            {phase === "done" ? "Re-run" : "🔍 Run audit"}
          </button>
        )}
      </div>

      {phase === "idle" && <p className="mt-1 text-[0.68rem] crm-subtle">Scores their live site 0–100 so you have a concrete opener (“your site scored 41 — here’s why”).</p>}
      {phase === "loading" && <p className="mt-2 text-xs crm-muted">Scanning {url}…</p>}
      {phase === "error" && <p className="mt-2 text-xs text-rose-500 dark:text-rose-400">{err}</p>}

      {phase === "done" && res && (
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${scoreColor(res.score)}`}>{res.score}</span>
            <span className="text-xs crm-subtle">/100 · {res.headline}</span>
          </div>
          {/* category bars */}
          <div className="mt-2 space-y-1.5">
            {res.categories.map((c) => (
              <div key={c.key} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-[0.68rem] crm-muted">{c.label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <span className={`block h-full rounded-full ${barColor(c.score)}`} style={{ width: `${c.score}%` }} />
                </span>
                <span className={`w-7 shrink-0 text-right text-[0.68rem] font-bold ${scoreColor(c.score)}`}>{c.score}</span>
              </div>
            ))}
          </div>
          {/* top problems — talking points for the call */}
          {problems.length > 0 && (
            <div className="mt-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-wide crm-subtle">Talking points</p>
              <ul className="mt-1 space-y-1">
                {problems.map((p, i) => (
                  <li key={i} className="flex gap-1.5 text-[0.68rem] crm-muted">
                    <span className={p.status === "fail" ? "text-rose-500" : "text-amber-500"}>{p.status === "fail" ? "✕" : "!"}</span>
                    <span><b className="crm-strong">{p.label}:</b> {p.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
