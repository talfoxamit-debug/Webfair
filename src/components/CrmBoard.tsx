"use client";

import { useCallback, useEffect, useState } from "react";
import { LEAD_STATUSES, STATUS_LABELS, type Lead, type LeadStatus } from "@/lib/crm";

/**
 * Internal CRM board (/crm: noindex, unlinked). Key-gated: requires the
 * CRM_ACCESS_KEY set in the environment; the key is kept in sessionStorage so
 * a browser tab stays signed in. Reads/writes via /api/leads GET & PATCH.
 */
export default function CrmBoard() {
  const [key, setKey] = useState("");
  const [entered, setEntered] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async (k: string) => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads", { headers: { "x-crm-key": k } });
      const json = await res.json();
      if (res.ok && json.ok) {
        setLeads(json.leads);
        setState("ready");
        sessionStorage.setItem("crm_key", k);
        return;
      }
      setErrorMsg(
        res.status === 401
          ? "Wrong access key (or CRM_ACCESS_KEY not set in the environment)."
          : res.status === 503
            ? "Supabase isn't configured yet. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY."
            : "Couldn't load leads.",
      );
      setState("error");
    } catch {
      setErrorMsg("Network error.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("crm_key");
    if (saved) {
      setKey(saved);
      setEntered(true);
      load(saved);
    }
  }, [load]);

  async function patch(id: string, fields: { status?: LeadStatus; notes?: string }) {
    setSavingId(id);
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-crm-key": key },
        body: JSON.stringify({ id, ...fields }),
      });
    } finally {
      setSavingId(null);
    }
  }

  if (!entered || state === "error") {
    return (
      <div className="mx-auto max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (key.trim()) {
              setEntered(true);
              load(key.trim());
            }
          }}
          className="card space-y-3 p-6"
        >
          <p className="text-sm text-white/70">Enter the CRM access key.</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Access key"
            className="w-full rounded-md border border-white/12 bg-ink-800/70 px-4 py-3 text-sm text-white outline-none focus:border-lime/60"
          />
          {errorMsg && <p className="text-xs text-rose-300">{errorMsg}</p>}
          <button type="submit" className="btn-primary w-full !rounded-md">
            Open pipeline
          </button>
        </form>
      </div>
    );
  }

  if (state === "loading" || state === "idle") {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-white/60">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-lime" />
        Loading pipeline…
      </div>
    );
  }

  const counts = LEAD_STATUSES.map((s) => ({
    s,
    n: leads.filter((l) => (l.status ?? "new") === s).length,
  }));

  return (
    <div>
      {/* Pipeline summary */}
      <div className="flex flex-wrap gap-2">
        {counts.map(({ s, n }) => (
          <span
            key={s}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              s === "won"
                ? "border-lime/40 text-lime"
                : s === "lost"
                  ? "border-rose-400/30 text-rose-300"
                  : "border-white/12 text-white/70"
            }`}
          >
            {STATUS_LABELS[s]}: {n}
          </span>
        ))}
        <button
          onClick={() => load(key)}
          className="ml-auto rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/60 hover:border-lime/40 hover:text-lime"
        >
          ↻ Refresh
        </button>
      </div>

      {leads.length === 0 ? (
        <p className="mt-10 text-center text-sm text-white/45">
          No leads yet. They'll appear here the moment someone submits the audit form.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`card grid gap-3 p-5 sm:grid-cols-[1.2fr_1fr_auto] sm:items-start ${
                savingId === lead.id ? "opacity-60" : ""
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  {lead.name}{" "}
                  <span className="font-normal text-white/45">· {lead.email}</span>
                </p>
                {lead.website && (
                  <a
                    href={/^https?:/i.test(lead.website) ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-lime hover:underline"
                  >
                    {lead.website}
                  </a>
                )}
                {lead.message && <p className="mt-1.5 text-xs text-white/55">{lead.message}</p>}
                <p className="mt-1.5 text-[0.75rem] uppercase tracking-wide text-white/30">
                  {new Date(lead.created_at).toLocaleString()} · {lead.source ?? "form"}
                </p>
              </div>

              <textarea
                defaultValue={lead.notes ?? ""}
                placeholder="Notes (pain points, objections, next step…)"
                rows={2}
                onBlur={(e) => {
                  if (e.target.value !== (lead.notes ?? "")) patch(lead.id, { notes: e.target.value });
                }}
                className="w-full rounded-md border border-white/10 bg-ink-800/60 px-3 py-2 text-xs text-white/80 outline-none focus:border-lime/50"
              />

              <select
                defaultValue={lead.status ?? "new"}
                onChange={(e) => patch(lead.id, { status: e.target.value as LeadStatus })}
                className="rounded-md border border-white/12 bg-ink-800 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-lime/60"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
