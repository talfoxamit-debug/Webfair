"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PROSPECT_STAGES, STAGE_LABEL, TEMPLATES, type Prospect, type ProspectStage } from "@/lib/prospects";

const LS_KEY = "stackwrk_prospects_v1";
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function load(): Prospect[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function save(p: Prospect[]) { localStorage.setItem(LS_KEY, JSON.stringify(p)); }

/** Minimal CSV parser (handles quoted fields). */
function parseCSV(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

function rowsToProspects(rows: string[][]): Prospect[] {
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (names: string[]) => { for (const n of names) { const i = head.indexOf(n); if (i >= 0) return i; } return -1; };
  const ci = { name: col(["name", "business", "company"]), phone: col(["phone"]), site: col(["website", "site"]), has: col(["has_website"]), city: col(["city"]), street: col(["street", "address"]), email: col(["email"]), owner: col(["owner", "contact"]) };
  return rows.slice(1).map((r) => {
    const site = ci.site >= 0 ? (r[ci.site] || "").trim() : "";
    const hasFlag = ci.has >= 0 ? /^y/i.test((r[ci.has] || "").trim()) : !!site;
    return {
      id: uid(),
      name: (r[ci.name] || "").trim(),
      phone: ci.phone >= 0 ? (r[ci.phone] || "").trim() : "",
      email: ci.email >= 0 ? (r[ci.email] || "").trim() : "",
      website: site,
      hasSite: hasFlag,
      city: ci.city >= 0 ? (r[ci.city] || "").trim() : "",
      street: ci.street >= 0 ? (r[ci.street] || "").trim() : "",
      owner: ci.owner >= 0 ? (r[ci.owner] || "").trim() : "",
      stage: "new" as ProspectStage,
      nextFollowUp: "", lastContacted: "", notes: "", createdAt: Date.now(),
    };
  }).filter((p) => p.name);
}

function fill(t: string, p: Prospect | null) {
  const gap = p?.hasSite
    ? "your website could be doing a lot more to turn visitors into quote requests"
    : `you don't have a website yet — so you're invisible when homeowners search "fence company ${p?.city?.split(",")[0] || "near me"}"`;
  return t
    .replaceAll("{{business}}", p?.name || "your company")
    .replaceAll("{{owner}}", p?.owner || "there")
    .replaceAll("{{city}}", p?.city?.split(",")[0] || "your area")
    .replaceAll("{{gap}}", gap);
}

export default function ProspectsPage() {
  const [items, setItems] = useState<Prospect[]>([]);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");
  const [hotOnly, setHotOnly] = useState(false);
  const [sel, setSel] = useState<Prospect | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [csv, setCsv] = useState("");
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<string | null>(null); // team mode when set
  const [showLogin, setShowLogin] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Boot: if a team session exists, load the SHARED list; else fall back to this browser.
  useEffect(() => {
    (async () => {
      try {
        const who = await fetch("/api/team-login").then((r) => r.json());
        if (who.ok && who.username) {
          const res = await fetch("/api/team").then((r) => r.json());
          if (res.ok) { setUser(who.username); setItems(res.data || []); setReady(true); return; }
        }
      } catch { /* offline / not configured → solo */ }
      setItems(load());
      setReady(true);
    })();
  }, []);

  // Persist: team → debounced save to the shared DB; solo → this browser.
  useEffect(() => {
    if (!ready) return;
    if (user) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch("/api/team", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: items }) }).catch(() => {});
      }, 800);
    } else {
      save(items);
    }
  }, [items, ready, user]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  async function doLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginErr("");
    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/team-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") }) });
    const j = await r.json().catch(() => ({}));
    if (j.ok) {
      setUser(j.username); setShowLogin(false);
      const res = await fetch("/api/team").then((x) => x.json()).catch(() => ({}));
      if (res.ok) setItems(res.data || []);
      flash(`Signed in as ${j.username} — team mode`);
    } else {
      setLoginErr(j.error === "not_configured" ? "Team mode isn't set up yet (needs the DB migration + CRM_USERS env var)." : "Wrong username or password.");
    }
  }
  async function logout() {
    await fetch("/api/team-login", { method: "DELETE" }).catch(() => {});
    setUser(null); setItems(load()); flash("Signed out (back to this browser)");
  }
  const patch = (id: string, d: Partial<Prospect>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...d } : x)));
  const copy = (t: string) => { navigator.clipboard?.writeText(t); flash("Copied"); };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((p) => (!hotOnly || !p.hasSite) && (!s || (p.name + p.city + p.phone + p.owner).toLowerCase().includes(s)));
  }, [items, q, hotOnly]);

  const dueToday = items.filter((p) => p.nextFollowUp && p.nextFollowUp <= todayISO() && p.stage !== "won" && p.stage !== "lost").length;
  const hot = items.filter((p) => !p.hasSite).length;
  const won = items.filter((p) => p.stage === "won").length;

  async function loadStarter() {
    try {
      const r = await fetch("/prospects-seed.json");
      const data: Prospect[] = await r.json();
      const withIds = data.map((d) => ({ ...d, id: uid(), stage: "new" as ProspectStage, createdAt: Date.now() }));
      const existing = new Set(items.map((i) => (i.name + i.phone).toLowerCase()));
      const fresh = withIds.filter((d) => !existing.has((d.name + d.phone).toLowerCase()));
      setItems((xs) => [...xs, ...fresh]);
      flash(`Loaded ${fresh.length} leads`);
    } catch { flash("Seed not found — paste a CSV instead"); }
  }

  function doImport() {
    const parsed = rowsToProspects(parseCSV(csv));
    const existing = new Set(items.map((i) => (i.name + i.phone).toLowerCase()));
    const fresh = parsed.filter((d) => !existing.has((d.name + d.phone).toLowerCase()));
    setItems((xs) => [...xs, ...fresh]);
    setShowImport(false); setCsv("");
    flash(`Imported ${fresh.length} new (${parsed.length - fresh.length} dupes skipped)`);
  }

  function exportCSV() {
    const cols: (keyof Prospect)[] = ["name", "owner", "phone", "email", "hasSite", "website", "city", "stage", "nextFollowUp", "lastContacted", "notes"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = [cols.join(","), ...items.map((p) => cols.map((c) => esc(p[c])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = "stackwrk-prospects.csv"; a.click();
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Prospects <span className="text-slate-500">· Stackwrk CRM</span></h1>
            <p className="text-xs text-slate-500">
              {user
                ? <>👥 Team mode — shared with your team. Signed in as <b className="text-lime">{user}</b>.</>
                : <>Saved in this browser. Export regularly to back up.</>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={loadStarter} className="rounded-lg bg-lime px-3 py-2 text-xs font-bold text-ink">Load starter list (254)</button>
            <button onClick={() => setShowImport(true)} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5">Import CSV</button>
            <button onClick={exportCSV} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5">Export</button>
            {user
              ? <button onClick={logout} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5">Sign out</button>
              : <button onClick={() => setShowLogin(true)} className="rounded-lg border border-lime/30 px-3 py-2 text-xs font-semibold text-lime hover:bg-lime/10">Team login</button>}
          </div>
        </div>

        {/* stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[["Total", items.length, "text-white"], ["No website (hot)", hot, "text-rose-400"], ["Follow-ups due", dueToday, "text-amber-400"], ["Won", won, "text-lime"]].map(([l, n, c]) => (
            <div key={l as string} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">{l as string}</p>
              <p className={`text-2xl font-extrabold ${c as string}`}>{n as number}</p>
            </div>
          ))}
        </div>

        {/* filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, city, phone…" className="w-56 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-lime/50" />
          <button onClick={() => setHotOnly((v) => !v)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${hotOnly ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40" : "border border-white/12 text-slate-300"}`}>🔥 No-website only</button>
          {!items.length && <span className="text-sm text-slate-500">Empty — click <b className="text-lime">Load starter list</b> to pull in your 254 fence leads.</span>}
        </div>

        {/* board */}
        <div className="mt-5 overflow-x-auto pb-4">
          <div className="flex min-w-[1100px] gap-3">
            {PROSPECT_STAGES.map((stage) => {
              const cards = filtered.filter((p) => p.stage === stage.key);
              return (
                <div key={stage.key} className="w-[190px] shrink-0">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-300">{stage.label}</span>
                    <span className="text-xs tabular-nums text-slate-500">{cards.length}</span>
                  </div>
                  <div className="space-y-2 rounded-xl bg-white/[0.02] p-1.5">
                    {cards.map((p) => (
                      <button key={p.id} onClick={() => setSel(p)} className="block w-full rounded-lg border border-white/10 bg-[#11161d] p-2.5 text-left transition-colors hover:border-lime/40">
                        <div className="flex items-start justify-between gap-1">
                          <span className="truncate text-[0.8rem] font-semibold text-white">{p.name}</span>
                          {!p.hasSite && <span className="shrink-0 rounded bg-rose-500/20 px-1 text-[0.55rem] font-bold text-rose-300">NO SITE</span>}
                        </div>
                        <div className="mt-0.5 truncate text-[0.68rem] text-slate-400">{p.city}</div>
                        {p.phone && <div className="mt-1 text-[0.68rem] text-slate-300">{p.phone}</div>}
                        {p.nextFollowUp && <div className={`mt-1 text-[0.62rem] ${p.nextFollowUp <= todayISO() ? "text-amber-400" : "text-slate-500"}`}>⏰ {p.nextFollowUp}</div>}
                      </button>
                    ))}
                    {!cards.length && <div className="px-2 py-3 text-center text-[0.65rem] text-slate-600">—</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* detail drawer */}
      {sel && (() => {
        const p = items.find((x) => x.id === sel.id) || sel;
        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSel(null)}>
            <div className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0e141b] p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">{p.name}</h2>
                  <p className="text-xs text-slate-400">{p.city} {p.street && `· ${p.street}`}</p>
                </div>
                <button onClick={() => setSel(null)} className="rounded-md px-2 py-1 text-slate-400 hover:bg-white/5">✕</button>
              </div>

              {!p.hasSite && <div className="mt-3 rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300">🔥 No website — top prospect. Call first.</div>}

              {/* contact quick actions */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {p.phone && <a href={`tel:${p.phone.replace(/[^0-9]/g, "")}`} className="rounded-lg bg-lime px-3 py-2 text-center text-sm font-bold text-ink">Call {p.phone}</a>}
                {p.email && <button onClick={() => copy(p.email)} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold">Copy email</button>}
                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="col-span-2 rounded-lg border border-white/15 px-3 py-2 text-center text-xs text-slate-300">Open their site ↗</a>}
              </div>

              {/* stage + follow-up */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-slate-400">Stage
                  <select value={p.stage} onChange={(e) => patch(p.id, { stage: e.target.value as ProspectStage })} className="mt-1 w-full rounded-lg border border-white/12 bg-white/[0.04] px-2 py-2 text-sm text-white">
                    {PROSPECT_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-400">Next follow-up
                  <input type="date" value={p.nextFollowUp} onChange={(e) => patch(p.id, { nextFollowUp: e.target.value })} className="mt-1 w-full rounded-lg border border-white/12 bg-white/[0.04] px-2 py-2 text-sm text-white" />
                </label>
              </div>
              <label className="mt-3 block text-xs font-semibold text-slate-400">Owner / contact name
                <input value={p.owner} onChange={(e) => patch(p.id, { owner: e.target.value })} placeholder="e.g. Mike" className="mt-1 w-full rounded-lg border border-white/12 bg-white/[0.04] px-2 py-2 text-sm text-white" />
              </label>

              {/* log actions */}
              <div className="mt-3 flex gap-2">
                <button onClick={() => { patch(p.id, { lastContacted: todayISO(), stage: p.stage === "new" ? "contacted" : p.stage, nextFollowUp: p.nextFollowUp || new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10) }); flash("Logged — follow-up in 3 days"); }} className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/5">📞 Log call/email</button>
                <button onClick={() => patch(p.id, { stage: "call_booked" })} className="flex-1 rounded-lg border border-lime/40 bg-lime/10 px-3 py-2 text-xs font-semibold text-lime">📅 Booked a call</button>
              </div>

              <label className="mt-4 block text-xs font-semibold text-slate-400">Notes
                <textarea value={p.notes} onChange={(e) => patch(p.id, { notes: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-white" placeholder="Call notes, objections, next steps…" />
              </label>

              {/* templates */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Templates (auto-filled for {p.name})</p>
                <div className="mt-2 space-y-2">
                  {TEMPLATES.map((t) => (
                    <div key={t.key} className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">{t.label}</span>
                        <button onClick={() => copy((t.subject ? `Subject: ${fill(t.subject, p)}\n\n` : "") + fill(t.body, p))} className="rounded bg-white/10 px-2 py-0.5 text-[0.65rem] font-bold text-slate-200 hover:bg-white/20">Copy</button>
                      </div>
                      {t.subject && <p className="mt-1 text-[0.68rem] text-slate-500">Subject: {fill(t.subject, p)}</p>}
                      <p className="mt-1 whitespace-pre-wrap text-[0.68rem] leading-relaxed text-slate-400">{fill(t.body, p).slice(0, 140)}…</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => { if (confirm("Delete this prospect?")) { setItems((xs) => xs.filter((x) => x.id !== p.id)); setSel(null); } }} className="mt-5 text-xs text-rose-400/70 hover:text-rose-400">Delete prospect</button>
            </div>
          </div>
        );
      })()}

      {/* import modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowImport(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e141b] p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white">Import CSV</h2>
            <p className="mt-1 text-xs text-slate-400">Paste a CSV with a header row (name, phone, website, has_website, city, email…). Duplicates by name+phone are skipped.</p>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={8} className="mt-3 w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 font-mono text-xs text-slate-200" placeholder="name,phone,website,has_website,city&#10;Apex Fence,(954)…,,NO,Fort Lauderdale" />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setShowImport(false)} className="rounded-lg border border-white/15 px-4 py-2 text-sm">Cancel</button>
              <button onClick={doImport} className="rounded-lg bg-lime px-4 py-2 text-sm font-bold text-ink">Import</button>
            </div>
          </div>
        </div>
      )}

      {/* team login modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLogin(false)}>
          <form onSubmit={doLogin} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e141b] p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white">Team login</h2>
            <p className="mt-1 text-xs text-slate-400">Sign in to share this pipeline with your team across any device.</p>
            <input name="username" autoFocus placeholder="Username" autoCapitalize="off" className="mt-4 w-full rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-lime/50" />
            <input name="password" type="password" placeholder="Password" className="mt-2 w-full rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-lime/50" />
            {loginErr && <p className="mt-2 text-xs text-rose-400">{loginErr}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowLogin(false)} className="rounded-lg border border-white/15 px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-lg bg-lime px-4 py-2 text-sm font-bold text-ink">Sign in</button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-lime px-4 py-2 text-sm font-bold text-ink shadow-lg">{toast}</div>}
    </main>
  );
}
