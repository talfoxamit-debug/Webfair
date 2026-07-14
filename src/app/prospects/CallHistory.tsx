"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string;
  kind: "call" | "message";
  direction: string | null;
  status: string | null;
  duration_seconds: number | null;
  body: string | null;
  transcript: string | null;
  summary: string | null;
  occurred_at: string;
};

const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const fmtDur = (s: number | null) => (s == null ? "" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

/**
 * Past calls and texts with this lead, synced from Quo. Shows nothing if
 * Quo isn't connected yet or this number has no history — no error banner,
 * so it stays invisible until it's actually wired up (see /api/quo/webhook).
 */
export default function CallHistory({ phone }: { phone: string }) {
  const [items, setItems] = useState<Activity[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setItems(null);
    fetch(`/api/team/quo-calls?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((j) => { if (live) setItems(j.ok ? j.data || [] : []); })
      .catch(() => { if (live) setItems([]); });
    return () => { live = false; };
  }, [phone]);

  if (!items || !items.length) return null;

  return (
    <div className="mt-5 rounded-lg p-3 crm-stat">
      <p className="text-xs font-bold uppercase tracking-wide crm-muted">📞 Activity ({items.length}) — via Quo</p>
      <div className="mt-2 space-y-1.5">
        {items.map((c) => (
          <div key={c.id} className="rounded-md border border-black/5 p-2 dark:border-white/10">
            {c.kind === "message" ? (
              <>
                <span className="text-[0.7rem] font-semibold crm-strong">
                  {c.direction === "outgoing" ? "↗ Text sent" : "↙ Text received"} · {fmtDate(c.occurred_at)}
                </span>
                {c.body && <p className="mt-1 whitespace-pre-wrap text-[0.7rem] crm-muted">💬 {c.body}</p>}
              </>
            ) : (
              <>
                <button onClick={() => setOpenId(openId === c.id ? null : c.id)} className="flex w-full items-center justify-between gap-2 text-left">
                  <span className="text-[0.7rem] font-semibold crm-strong">
                    {c.direction === "outgoing" ? "↗ Outgoing call" : c.direction === "incoming" ? "↙ Incoming call" : "Call"} · {fmtDate(c.occurred_at)}
                  </span>
                  <span className="shrink-0 text-[0.65rem] crm-subtle">{fmtDur(c.duration_seconds)} {c.status && c.status !== "completed" ? `· ${c.status}` : ""}</span>
                </button>
                {c.summary && <p className="mt-1 text-[0.68rem] crm-muted">{c.summary}</p>}
                {c.transcript && (
                  openId === c.id ? (
                    <p className="mt-1 whitespace-pre-wrap text-[0.66rem] leading-relaxed crm-subtle">{c.transcript}</p>
                  ) : (
                    <button onClick={() => setOpenId(c.id)} className="mt-1 text-[0.65rem] font-semibold text-emerald-700 underline underline-offset-2 dark:text-lime">Show transcript</button>
                  )
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
