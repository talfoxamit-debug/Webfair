"use client";

import { useState } from "react";
import { useTheme } from "./useTheme";

/** Full-screen login wall. Nothing else on /prospects renders until a valid
 *  session exists — the board and lead data never reach an anonymous visitor. */
export default function Gate({ configured }: { configured: boolean }) {
  useTheme(); // applies the saved day/night theme to the document root
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/team-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.ok) { window.location.reload(); return; }
      setErr(j.error === "not_configured"
        ? "CRM isn't activated yet. Add the CRM_USERS env var in Vercel and redeploy."
        : "Wrong username or password.");
    } catch { setErr("Network error — try again."); }
    setBusy(false);
  }

  return (
    <main className="crm-page flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-lg dark:bg-lime/15">🔒</div>
          <h1 className="text-xl font-extrabold tracking-tight crm-strong">Stackwrk CRM</h1>
          <p className="mt-1 text-xs crm-muted">Private — team sign-in required.</p>
        </div>
        <form onSubmit={onSubmit} className="rounded-2xl p-5 crm-card">
          <input name="username" autoFocus placeholder="Username" autoCapitalize="off" autoComplete="username"
            className="w-full rounded-lg px-3 py-2.5 text-sm crm-input" />
          <input name="password" type="password" placeholder="Password" autoComplete="current-password"
            className="mt-2 w-full rounded-lg px-3 py-2.5 text-sm crm-input" />
          {err && <p className="mt-2 text-xs text-rose-500 dark:text-rose-400">{err}</p>}
          {!configured && (
            <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-[0.7rem] leading-relaxed text-amber-800 dark:bg-amber-500/10 dark:text-amber-300/90">
              Not activated yet: run <code className="text-amber-900 dark:text-amber-200">supabase/team-crm.sql</code> and set
              the <code className="text-amber-900 dark:text-amber-200">CRM_USERS</code> env var in Vercel, then redeploy.
            </p>
          )}
          <button type="submit" disabled={busy}
            className="mt-4 w-full rounded-lg bg-lime px-4 py-2.5 text-sm font-bold text-ink disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
