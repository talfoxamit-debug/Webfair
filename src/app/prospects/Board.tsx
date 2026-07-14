"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PROSPECT_STAGES, TEMPLATES, TIER_META, type Prospect, type ProspectStage, type ProspectTier } from "@/lib/prospects";
import TodayDriver from "./TodayDriver";
import { useTheme } from "./useTheme";
import { encodeAgreement, type AgreementConfig } from "@/lib/agreement";

const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

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

export default function Board({ user }: { user: string }) {
  const [theme, toggleTheme] = useTheme();
  const [items, setItems] = useState<Prospect[]>([]);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");
  const [hotOnly, setHotOnly] = useState(false);
  const [auditOnly, setAuditOnly] = useState(false);
  const [tierFilter, setTierFilter] = useState<ProspectTier | "">("");
  const [view, setView] = useState<"today" | "board">("today");
  const [sel, setSel] = useState<Prospect | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [csv, setCsv] = useState("");
  const [toast, setToast] = useState("");
  const [agrPkg, setAgrPkg] = useState<AgreementConfig["pkg"]>("Growth");
  const [agrFee, setAgrFee] = useState(3900);
  const [agrCare, setAgrCare] = useState(249);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the shared team pipeline + merge in inbound audited sites (page is
  // already gated server-side). Anyone who runs the site audit shows up here as
  // a warm lead, even if they never entered contact info.
  useEffect(() => {
    (async () => {
      let base: Prospect[] = [];
      try {
        const res = await fetch("/api/team").then((r) => r.json());
        if (res.ok) base = res.data || [];
      } catch { /* transient */ }
      try {
        const au = await fetch("/api/team/audits").then((r) => r.json());
        if (au.ok && Array.isArray(au.data)) {
          const dom = (u: string) => { try { return new URL(u.startsWith("http") ? u : "https://" + u).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };
          const have = new Set(base.map((p) => dom(p.website || "")).filter(Boolean));
          const fresh: Prospect[] = au.data
            .filter((a: { domain: string }) => a.domain && !have.has(a.domain))
            .map((a: { domain: string; url: string; score: number | null; created_at: string }) => ({
              id: uid(), name: a.domain, phone: "", email: "", website: a.url, hasSite: true,
              city: "", street: "", owner: "", stage: "new" as ProspectStage,
              nextFollowUp: "", lastContacted: "",
              notes: a.score != null ? `Ran your site audit — scored ${a.score}/100.` : "Ran your site audit.",
              createdAt: new Date(a.created_at).getTime() || Date.now(),
              source: "audit" as const, auditScore: a.score ?? undefined,
            }));
          base = [...fresh, ...base]; // newest inbound at the top of New
        }
      } catch { /* audits optional */ }
      setItems(base);
      setReady(true);
    })();
  }, []);

  // Persist: debounced save to the shared DB.
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/team", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: items }) }).catch(() => {});
    }, 800);
  }, [items, ready]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  async function logout() {
    await fetch("/api/team-login", { method: "DELETE" }).catch(() => {});
    window.location.reload();
  }
  const patch = (id: string, d: Partial<Prospect>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...d } : x)));
  const copy = (t: string) => { navigator.clipboard?.writeText(t); flash("Copied"); };

  function copyAgreementLink(p: Prospect) {
    const pages = agrPkg === "Launch" ? 5 : agrPkg === "Growth" ? 7 : 10;
    const d = encodeAgreement({
      clientName: p.name, contact: p.owner, email: p.email, phone: p.phone,
      pkg: agrPkg, pages, projectFee: agrFee, careName: agrPkg, careMonthly: agrCare, date: todayISO(),
    });
    const url = `${window.location.origin}/agreement?d=${d}`;
    navigator.clipboard?.writeText(url);
    flash("Agreement link copied — send it to the client");
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((p) =>
      (!hotOnly || !p.hasSite) &&
      (!auditOnly || p.source === "audit") &&
      (!tierFilter || p.tier === tierFilter) &&
      (!s || (p.name + p.city + p.phone + p.owner).toLowerCase().includes(s)));
  }, [items, q, hotOnly, auditOnly, tierFilter]);

  const dueToday = items.filter((p) => p.nextFollowUp && p.nextFollowUp <= todayISO() && p.stage !== "won" && p.stage !== "lost").length;
  const hot = items.filter((p) => !p.hasSite).length;
  const auditCount = items.filter((p) => p.source === "audit").length;
  const won = items.filter((p) => p.stage === "won").length;
  const tierCounts = { call: 0, verify: 0, skip: 0 } as Record<ProspectTier, number>;
  items.forEach((p) => { if (p.tier) tierCounts[p.tier]++; });

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
    <main className="crm-page min-h-screen">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight crm-strong">Prospects <span className="crm-subtle">· Stackwrk CRM</span></h1>
            <p className="text-xs crm-muted">👥 Shared team pipeline. Signed in as <b className="crm-accent">{user}</b>.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={toggleTheme} title="Toggle day / night" className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn">{theme === "day" ? "🌙 Night" : "☀️ Day"}</button>
            <button onClick={() => setShowImport(true)} className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn">Import CSV</button>
            <button onClick={exportCSV} className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn">Export</button>
            <button onClick={logout} className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn">Sign out</button>
          </div>
        </div>

        {/* view toggle — Today (daily driver) vs the full board */}
        <div className="mt-4 inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-white/12">
          <button onClick={() => setView("today")} className={`rounded-md px-4 py-1.5 text-xs font-bold ${view === "today" ? "bg-lime text-ink" : "crm-muted"}`}>▶ Today</button>
          <button onClick={() => setView("board")} className={`rounded-md px-4 py-1.5 text-xs font-bold ${view === "board" ? "bg-lime text-ink" : "crm-muted"}`}>Full board</button>
        </div>

        {view === "today" && <TodayDriver items={items} patch={patch} onOpen={setSel} />}

        {view === "board" && (<>
        {/* stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[["Total", items.length, "text-slate-900 dark:text-white"], ["No website (hot)", hot, "text-rose-500 dark:text-rose-400"], ["Follow-ups due", dueToday, "text-amber-500 dark:text-amber-400"], ["Won", won, "text-emerald-600 dark:text-lime"]].map(([l, n, c]) => (
            <div key={l as string} className="rounded-xl px-4 py-3 crm-stat">
              <p className="text-[0.65rem] uppercase tracking-wide crm-muted">{l as string}</p>
              <p className={`text-2xl font-extrabold ${c as string}`}>{n as number}</p>
            </div>
          ))}
        </div>

        {/* filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, city, phone…" className="w-56 rounded-lg px-3 py-2 text-sm crm-input" />
          <button onClick={() => setHotOnly((v) => !v)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${hotOnly ? "bg-rose-100 text-rose-700 ring-1 ring-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-500/40" : "crm-btn"}`}>🔥 No-website only</button>
          {auditCount > 0 && (
            <button onClick={() => setAuditOnly((v) => !v)} className={`rounded-lg px-3 py-2 text-xs font-bold ${auditOnly ? "bg-sky-100 text-sky-700 ring-1 ring-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-500/40" : "crm-btn"}`} title="People who ran your site audit — warm inbound leads">🔎 Audited {auditCount}</button>
          )}
          {/* qualification tier filters (phone-only leads) */}
          {(["call", "verify", "skip"] as ProspectTier[]).map((t) => tierCounts[t] > 0 && (
            <button
              key={t}
              onClick={() => setTierFilter((v) => (v === t ? "" : t))}
              className={`rounded-lg px-3 py-2 text-xs font-bold ${tierFilter === t ? `${TIER_META[t].cls} ring-1 ring-black/10 dark:ring-white/20` : "crm-btn"}`}
              title={TIER_META[t].hint}
            >
              {t === "call" ? "🟢" : t === "verify" ? "🟡" : "🔴"} {TIER_META[t].short} {tierCounts[t]}
            </button>
          ))}
          {ready && !items.length && <span className="text-sm crm-muted">Empty — use <b className="crm-accent">Import CSV</b> to add leads.</span>}
        </div>

        {/* board */}
        <div className="mt-5 overflow-x-auto pb-4">
          <div className="flex min-w-[1100px] gap-3">
            {PROSPECT_STAGES.map((stage) => {
              const cards = filtered.filter((p) => p.stage === stage.key);
              return (
                <div key={stage.key} className="w-[190px] shrink-0">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-wide crm-muted">{stage.label}</span>
                    <span className="text-xs tabular-nums crm-subtle">{cards.length}</span>
                  </div>
                  <div className="space-y-2 rounded-xl p-1.5 crm-col">
                    {cards.map((p) => (
                      <button key={p.id} onClick={() => setSel(p)} className="block w-full rounded-lg p-2.5 text-left transition-colors crm-card hover:border-emerald-400 dark:hover:border-lime/40">
                        <div className="flex items-start justify-between gap-1">
                          <span className="truncate text-[0.8rem] font-semibold crm-strong">{p.name}</span>
                          {p.tier
                            ? <span className={`shrink-0 rounded px-1 text-[0.55rem] font-bold ${TIER_META[p.tier].cls}`}>{TIER_META[p.tier].short}</span>
                            : p.source === "audit"
                            ? <span className="shrink-0 rounded bg-sky-100 px-1 text-[0.55rem] font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">🔎 AUDIT{p.auditScore != null ? ` ${p.auditScore}` : ""}</span>
                            : !p.hasSite && <span className="shrink-0 rounded bg-rose-100 px-1 text-[0.55rem] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">NO SITE</span>}
                        </div>
                        <div className="mt-0.5 truncate text-[0.68rem] crm-muted">{p.city}</div>
                        {p.phone && <div className="mt-1 text-[0.68rem] crm-muted">{p.phone}</div>}
                        {p.nextFollowUp && <div className={`mt-1 text-[0.62rem] ${p.nextFollowUp <= todayISO() ? "text-amber-600 dark:text-amber-400" : "crm-subtle"}`}>⏰ {p.nextFollowUp}</div>}
                      </button>
                    ))}
                    {!cards.length && <div className="px-2 py-3 text-center text-[0.65rem] crm-subtle">—</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </>)}
      </div>

      {/* detail drawer */}
      {sel && (() => {
        const p = items.find((x) => x.id === sel.id) || sel;
        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSel(null)}>
            <div className="h-full w-full max-w-md overflow-y-auto border-l p-5 crm-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-extrabold crm-strong">{p.name}</h2>
                  <p className="text-xs crm-muted">{p.city} {p.street && `· ${p.street}`}</p>
                </div>
                <button onClick={() => setSel(null)} className="rounded-md px-2 py-1 crm-muted hover:bg-black/5 dark:hover:bg-white/5">✕</button>
              </div>

              {p.tier
                ? <div className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${TIER_META[p.tier].cls}`}>{p.tier === "call" ? "🟢" : p.tier === "verify" ? "🟡" : "🔴"} {TIER_META[p.tier].label} — {TIER_META[p.tier].hint}</div>
                : p.source === "audit"
                ? <div className="mt-3 rounded-lg bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">🔎 Inbound — ran your site audit{p.auditScore != null ? ` (scored ${p.auditScore}/100)` : ""}. Warm lead, reach out fast.</div>
                : !p.hasSite && <div className="mt-3 rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">🔥 No website — top prospect. Call first.</div>}

              {/* contact quick actions */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {p.phone && <a href={`tel:${p.phone.replace(/[^0-9]/g, "")}`} className="rounded-lg bg-lime px-3 py-2 text-center text-sm font-bold text-ink">Call {p.phone}</a>}
                {p.email && <button onClick={() => copy(p.email)} className="rounded-lg px-3 py-2 text-sm font-semibold crm-btn">Copy email</button>}
                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="col-span-2 rounded-lg px-3 py-2 text-center text-xs crm-btn">Open their site ↗</a>}
              </div>

              {/* stage + follow-up */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold crm-muted">Stage
                  <select value={p.stage} onChange={(e) => patch(p.id, { stage: e.target.value as ProspectStage })} className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input">
                    {PROSPECT_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold crm-muted">Next follow-up
                  <input type="date" value={p.nextFollowUp} onChange={(e) => patch(p.id, { nextFollowUp: e.target.value })} className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input" />
                </label>
              </div>
              <label className="mt-3 block text-xs font-semibold crm-muted">Owner / contact name
                <input value={p.owner} onChange={(e) => patch(p.id, { owner: e.target.value })} placeholder="e.g. Mike" className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input" />
              </label>

              {/* log actions */}
              <div className="mt-3 flex gap-2">
                <button onClick={() => { patch(p.id, { lastContacted: todayISO(), stage: p.stage === "new" ? "contacted" : p.stage, nextFollowUp: p.nextFollowUp || new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10) }); flash("Logged — follow-up in 3 days"); }} className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold crm-btn">📞 Log call/email</button>
                <button onClick={() => patch(p.id, { stage: "call_booked" })} className="flex-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-lime/40 dark:bg-lime/10 dark:text-lime">📅 Booked a call</button>
              </div>

              <label className="mt-4 block text-xs font-semibold crm-muted">Notes
                <textarea value={p.notes} onChange={(e) => patch(p.id, { notes: e.target.value })} rows={3} className="mt-1 w-full rounded-lg px-3 py-2 text-sm crm-input" placeholder="Call notes, objections, next steps…" />
              </label>

              {/* client agreement — generate a personalized e-sign link */}
              <div className="mt-5 rounded-lg p-3 crm-stat">
                <p className="text-xs font-bold uppercase tracking-wide crm-muted">Client agreement</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <select value={agrPkg} onChange={(e) => setAgrPkg(e.target.value as AgreementConfig["pkg"])} className="rounded-lg px-2 py-1.5 text-xs crm-input">
                    <option>Launch</option><option>Growth</option><option>Market Leader</option>
                  </select>
                  <input type="number" value={agrFee} onChange={(e) => setAgrFee(Number(e.target.value))} className="rounded-lg px-2 py-1.5 text-xs crm-input" title="Project fee" />
                  <input type="number" value={agrCare} onChange={(e) => setAgrCare(Number(e.target.value))} className="rounded-lg px-2 py-1.5 text-xs crm-input" title="Care $/mo" />
                </div>
                <button onClick={() => copyAgreementLink(p)} className="mt-2 w-full rounded-lg bg-lime px-3 py-2 text-xs font-bold text-ink">📄 Copy e-sign agreement link</button>
                <p className="mt-1 text-[0.6rem] crm-subtle">Fee · care/mo. Send the link after they say yes — they review &amp; sign online.</p>
              </div>

              {/* templates */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide crm-muted">Templates (auto-filled for {p.name})</p>
                <div className="mt-2 space-y-2">
                  {TEMPLATES.map((t) => (
                    <div key={t.key} className="rounded-lg p-2.5 crm-stat">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold crm-strong">{t.label}</span>
                        <button onClick={() => copy((t.subject ? `Subject: ${fill(t.subject, p)}\n\n` : "") + fill(t.body, p))} className="rounded bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20">Copy</button>
                      </div>
                      {t.subject && <p className="mt-1 text-[0.68rem] crm-subtle">Subject: {fill(t.subject, p)}</p>}
                      <p className="mt-1 whitespace-pre-wrap text-[0.68rem] leading-relaxed crm-muted">{fill(t.body, p).slice(0, 140)}…</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => { if (confirm("Delete this prospect?")) { setItems((xs) => xs.filter((x) => x.id !== p.id)); setSel(null); } }} className="mt-5 text-xs text-rose-500/80 hover:text-rose-600 dark:text-rose-400/70 dark:hover:text-rose-400">Delete prospect</button>
            </div>
          </div>
        );
      })()}

      {/* import modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowImport(false)}>
          <div className="w-full max-w-lg rounded-2xl border p-5 crm-drawer" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold crm-strong">Import CSV</h2>
            <p className="mt-1 text-xs crm-muted">Paste a CSV with a header row (name, phone, website, has_website, city, email…). Duplicates by name+phone are skipped.</p>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={8} className="mt-3 w-full rounded-lg px-3 py-2 font-mono text-xs crm-input" placeholder="name,phone,website,has_website,city&#10;Apex Fence,(954)…,,NO,Fort Lauderdale" />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setShowImport(false)} className="rounded-lg px-4 py-2 text-sm crm-btn">Cancel</button>
              <button onClick={doImport} className="rounded-lg bg-lime px-4 py-2 text-sm font-bold text-ink">Import</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-lime px-4 py-2 text-sm font-bold text-ink shadow-lg">{toast}</div>}
    </main>
  );
}
