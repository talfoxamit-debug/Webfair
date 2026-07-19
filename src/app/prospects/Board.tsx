"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PROSPECT_STAGES, TEMPLATES, TEMPLATE_FLOWS, TIER_META, QUICK_TAGS, CALL_OUTCOMES, BEST_TIMES, phoneCheck, phoneDigits, PHONE_FLAG_META, tagStyle, type Prospect, type ProspectStage, type ProspectTier } from "@/lib/prospects";
import TodayDriver from "./TodayDriver";
import LeadAudit from "./LeadAudit";
import CallHistory from "./CallHistory";
import CallConsole from "./CallConsole";
import AgreementGen from "./AgreementGen";
import { useTheme } from "./useTheme";

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

function quoActivityNote(calls: number, texts: number): string {
  const bits: string[] = [];
  if (calls) bits.push(`${calls} call${calls === 1 ? "" : "s"}`);
  if (texts) bits.push(`${texts} text${texts === 1 ? "" : "s"}`);
  return `${bits.join(" + ") || "Contact"} via Quo, not yet added to the CRM.`;
}

/** Push a lead's name/company/email into Quo as a contact, best-effort,
 *  never blocks the CRM save. See /api/quo/contacts. */
async function syncLeadToQuo(p: Prospect): Promise<boolean> {
  if (!p.phone) return false;
  return fetch("/api/quo/contacts", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: p.id, name: p.owner, company: p.name, email: p.email, phone: p.phone }),
  }).then((r) => r.json()).then((j) => Boolean(j.ok)).catch(() => false);
}

/** Signature of the fields we push to Quo, so auto-sync only fires on change. */
function quoSyncSig(p: Prospect): string {
  return `${phoneDigits(p.phone)}|${(p.owner || "").trim()}|${p.name.trim()}|${(p.email || "").trim()}`.toLowerCase();
}

function gapFor(p: Prospect | null): string {
  return p?.hasSite
    ? "your website could be doing a lot more to turn visitors into quote requests"
    : `you don't have a website yet, so you're invisible when homeowners search "fence company ${p?.city?.split(",")[0] || "near me"}"`;
}

function fill(t: string, p: Prospect | null) {
  return t
    .replaceAll("{{business}}", p?.name || "your company")
    .replaceAll("{{owner}}", p?.owner || "there")
    .replaceAll("{{city}}", p?.city?.split(",")[0] || "your area")
    .replaceAll("{{gap}}", gapFor(p));
}

// Presentation mode: swap every sensitive field for stable fake data so the
// CRM can be screenshotted or demoed without ever leaking a real customer.
// Structure stays real (stage, tier, source, badges, dates, tags) so it still
// shows the product; only the PII is faked, and the same lead always maps to
// the same fake identity so a screenshot stays internally consistent.
const FAKE_COMPANIES = ["Ridgeline Fence Co.", "Coastal Exteriors", "Summit Outdoor", "BlueLine Contracting", "Evergreen Fence & Deck", "Harbor Point Services", "Ironwood Builders", "Cypress Home Pros", "Anchor Exterior Group", "Sunstate Fencing", "Trailhead Renovations", "Meridian Outdoor Living", "Copperfield Contracting", "Northgate Fence", "Palmetto Exteriors", "Vanguard Home Services"];
const FAKE_FIRST = ["Mike", "Dave", "Chris", "Tony", "Sam", "Rob", "Nick", "Alex", "Joe", "Ray", "Luis", "Carlos", "Frank", "Pete", "Dan", "Steve"];
const FAKE_CITIES = ["Fort Lauderdale, FL", "Coral Springs, FL", "Pompano Beach, FL", "Plantation, FL", "Davie, FL", "Boca Raton, FL", "Sunrise, FL", "Hollywood, FL"];
const FAKE_STREETS = ["1420 Oak Ridge Rd", "88 Palmetto Ave", "305 Harbor Dr", "742 Sunset Ln", "19 Birchwood Ct", "560 Coral Way", "231 Meadow St", "77 Anchor Blvd"];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function maskProspect(p: Prospect): Prospect {
  const h = hashStr(p.id || p.name || "x");
  const company = FAKE_COMPANIES[h % FAKE_COMPANIES.length];
  const first = FAKE_FIRST[(h >> 3) % FAKE_FIRST.length];
  const city = FAKE_CITIES[(h >> 5) % FAKE_CITIES.length];
  const street = FAKE_STREETS[(h >> 7) % FAKE_STREETS.length];
  const last4 = String(1000 + (h % 9000));
  const dom = (company.toLowerCase().replace(/[^a-z]+/g, "") || "example").slice(0, 14);
  return {
    ...p,
    name: company,
    owner: p.owner ? first : "",
    phone: p.phone ? `(954) 555-${last4}` : "",
    email: p.email ? `${first.toLowerCase()}@${dom}.com` : "",
    website: p.website ? `${dom}.com` : "",
    city,
    street: p.street ? street : "",
    notes: p.notes ? "Sample note (hidden in presentation mode)." : "",
  };
}

export default function Board({ user }: { user: string }) {
  const [theme, toggleTheme] = useTheme();
  const [items, setItems] = useState<Prospect[]>([]);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");
  const [hotOnly, setHotOnly] = useState(false);
  const [auditOnly, setAuditOnly] = useState(false);
  const [newLeadsOnly, setNewLeadsOnly] = useState(false);
  const [badPhoneOnly, setBadPhoneOnly] = useState(false);
  const [whatsappOnly, setWhatsappOnly] = useState(false);
  const [tierFilter, setTierFilter] = useState<ProspectTier | "">("");
  const [view, setView] = useState<"today" | "board">("today");
  const [sel, setSel] = useState<Prospect | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Prospect>(() => emptyLead());
  const [csv, setCsv] = useState("");
  const [toast, setToast] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [emailHunt, setEmailHunt] = useState<{ done: number; total: number; found: number } | null>(null);
  const [presenting, setPresenting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Version of the shared doc we last loaded, sent back on save so the server
  // can reject a concurrent clobber. Null until a load succeeds.
  const baseUpdatedAt = useRef<string | null>(null);

  // Load the shared team pipeline + merge in inbound audited sites (page is
  // already gated server-side). Anyone who runs the site audit shows up here as
  // a warm lead, even if they never entered contact info.
  useEffect(() => {
    (async () => {
      let base: Prospect[] = [];
      let teamOk = false;
      try {
        const res = await fetch("/api/team").then((r) => r.json());
        if (res.ok) { base = res.data || []; teamOk = true; baseUpdatedAt.current = res.updatedAt ?? null; }
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
              notes: a.score != null ? `Ran your site audit: scored ${a.score}/100.` : "Ran your site audit.",
              createdAt: new Date(a.created_at).getTime() || Date.now(),
              source: "audit" as const, auditScore: a.score ?? undefined,
            }));
          base = [...fresh, ...base]; // newest inbound at the top of New
        }
      } catch { /* audits optional */ }
      try {
        const qc = await fetch("/api/team/quo-calls").then((r) => r.json());
        if (qc.ok && Array.isArray(qc.data)) {
          const have = new Set(base.map((p) => phoneDigits(p.phone)).filter((d) => d.length === 10));
          const fresh: Prospect[] = qc.data
            .filter((c: { phone_digits: string }) => c.phone_digits && !have.has(c.phone_digits))
            .map((c: { phone_digits: string; phone_pretty: string; contact_name: string | null; last_call: string; call_count: number; message_count: number }) => ({
              id: uid(), name: c.contact_name || c.phone_pretty, phone: c.phone_pretty, email: "", website: "", hasSite: false,
              city: "", street: "", owner: c.contact_name || "", stage: "contacted" as ProspectStage,
              nextFollowUp: "", lastContacted: new Date(c.last_call).toISOString().slice(0, 10),
              notes: quoActivityNote(c.call_count, c.message_count),
              createdAt: new Date(c.last_call).getTime() || Date.now(),
              source: "quo" as const,
            }));
          base = [...base, ...fresh]; // append: these already had activity, not fresh inbound
        }
      } catch { /* quo sync optional */ }
      setItems(base);
      // Only enable auto-save once the shared pipeline actually loaded. If the
      // load failed, saving would overwrite the real pipeline with an empty or
      // partial list, so we stay read-only until a refresh succeeds.
      if (teamOk) setReady(true);
      else flash("Could not load the shared pipeline. Not saving so it is not overwritten. Refresh to retry.");
    })();
  }, []);

  // Persist: debounced save to the shared DB. Sends the loaded version so the
  // server can reject a concurrent or empty-overwriting write; on conflict we
  // resync from the server rather than clobber it.
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/team", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: items, baseUpdatedAt: baseUpdatedAt.current }),
        }).then((res) => res.json());
        if (r.ok) {
          baseUpdatedAt.current = r.updatedAt ?? baseUpdatedAt.current;
        } else if (r.error === "conflict" || r.error === "refuse_empty_overwrite") {
          flash("Pipeline changed elsewhere. Reloading the latest to avoid overwriting it.");
          const fresh = await fetch("/api/team").then((res) => res.json());
          if (fresh.ok) { baseUpdatedAt.current = fresh.updatedAt ?? null; setItems(fresh.data || []); }
        }
      } catch { /* transient network, will retry on next change */ }
    }, 800);
  }, [items, ready]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  async function logout() {
    await fetch("/api/team-login", { method: "DELETE" }).catch(() => {});
    window.location.reload();
  }
  const patch = (id: string, d: Partial<Prospect>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...d } : x)));
  const copy = (t: string) => { navigator.clipboard?.writeText(t); flash("Copied"); };

  // Push to Quo and remember what we sent, so identical data isn't re-pushed.
  const pushToQuo = async (p: Prospect): Promise<boolean> => {
    const ok = await syncLeadToQuo(p);
    if (ok) patch(p.id, { quoSyncedSig: quoSyncSig(p) });
    return ok;
  };
  // Auto-sync a lead you've actually worked (has a name + you've engaged with
  // it) when its details changed since the last push, so names land in Quo
  // without pressing anything, while the raw scraped rows you never touch stay
  // out of your Quo contacts.
  const maybeAutoSyncQuo = (p: Prospect) => {
    const engaged = Boolean(p.owner?.trim() || p.stage !== "new" || p.lastContacted || p.source === "manual" || p.source === "quo" || p.source === "whatsapp");
    if (phoneDigits(p.phone).length === 10 && engaged && quoSyncSig(p) !== (p.quoSyncedSig || "")) void pushToQuo(p);
  };
  // Closing the drawer is the natural "I'm done with this lead" moment: sync then.
  const closeDrawer = () => {
    if (sel) { const cur = items.find((x) => x.id === sel.id); if (cur) maybeAutoSyncQuo(cur); }
    setSel(null);
  };
  const toggleTag = (p: Prospect, t: string) => {
    const cur = p.tags || [];
    patch(p.id, { tags: cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t] });
  };
  const lookup = (p: Prospect, kind: "google" | "maps" | "fb") => {
    const q = encodeURIComponent(`${p.name} ${p.city}`.trim());
    return kind === "maps" ? `https://www.google.com/maps/search/${q}`
      : kind === "fb" ? `https://www.facebook.com/search/top?q=${q}`
      : `https://www.google.com/search?q=${q}`;
  };
  const prettyUrl = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const href = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);

  // Phone quality: numbers that appear on 2+ leads (duplicate / aggregator).
  const dialCounts = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((p) => { const d = phoneDigits(p.phone); if (d.length === 10) m.set(d, (m.get(d) || 0) + 1); });
    return m;
  }, [items]);
  const isDupePhone = (p: Prospect) => { const d = phoneDigits(p.phone); return d.length === 10 && (dialCounts.get(d) || 0) > 1; };
  const flaggedPhone = (p: Prospect) => phoneCheck(p.phone).flag !== "ok" || isDupePhone(p);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((p) =>
      (!hotOnly || !p.hasSite) &&
      (!auditOnly || p.source === "audit") &&
      (!newLeadsOnly || p.source === "audit" || p.source === "quo") &&
      (!whatsappOnly || p.source === "whatsapp") &&
      (!badPhoneOnly || flaggedPhone(p)) &&
      (!tierFilter || p.tier === tierFilter) &&
      (!s || (p.name + p.city + p.phone + p.owner).toLowerCase().includes(s)));
  }, [items, q, hotOnly, auditOnly, newLeadsOnly, whatsappOnly, badPhoneOnly, tierFilter, dialCounts]);

  const dueToday = items.filter((p) => p.nextFollowUp && p.nextFollowUp <= todayISO() && p.stage !== "won" && p.stage !== "lost").length;
  const hot = items.filter((p) => !p.hasSite).length;
  // Email-hunt bookkeeping: leads with a site but no email, split by whether
  // we've already scanned the site (so we never re-check the same sites).
  const uncheckedWithSite = items.filter((p) => !p.email?.trim() && p.website?.trim() && !p.emailCheckedAt).length;
  const triedEmptyWithSite = items.filter((p) => !p.email?.trim() && p.website?.trim() && p.emailCheckedAt).length;
  // Export bookkeeping: emailed leads not yet sent to Instantly.
  const unexportedWithEmail = items.filter((p) => p.email?.includes("@") && !p.exportedAt).length;
  const exportedCount = items.filter((p) => p.exportedAt).length;
  // "New" = auto-collected by the system (inbound audits + Quo calls), the
  // leads that appeared without you adding them.
  const newLeadsCount = items.filter((p) => p.source === "audit" || p.source === "quo").length;
  const auditCount = items.filter((p) => p.source === "audit").length;
  const whatsappCount = items.filter((p) => p.source === "whatsapp").length;
  const won = items.filter((p) => p.stage === "won").length;
  const tierCounts = { call: 0, verify: 0, skip: 0 } as Record<ProspectTier, number>;
  items.forEach((p) => { if (p.tier) tierCounts[p.tier]++; });
  const badPhoneCount = items.filter((p) => phoneCheck(p.phone).flag !== "ok" || isDupePhone(p)).length;

  function doImport() {
    const parsed = rowsToProspects(parseCSV(csv));
    const existingKeys = new Set(items.map((i) => (i.name + i.phone).toLowerCase()));
    const existingDials = new Set(items.map((i) => phoneDigits(i.phone)).filter((d) => d.length === 10));
    const seenDials = new Set<string>();
    let dupes = 0, tollfree = 0;
    const fresh: Prospect[] = [];
    for (const d of parsed) {
      const pc = phoneCheck(d.phone);
      if (pc.flag === "tollfree") { tollfree++; continue; } // chains/aggregators, never enter the CRM
      const dial = phoneDigits(d.phone);
      const isDup = existingKeys.has((d.name + d.phone).toLowerCase())
        || (dial.length === 10 && (existingDials.has(dial) || seenDials.has(dial)));
      if (isDup) { dupes++; continue; }
      if (dial.length === 10) seenDials.add(dial);
      if (pc.flag === "outarea") d.tier = "verify"; // out-of-area → verify before dialing
      fresh.push(d);
    }
    setItems((xs) => [...xs, ...fresh]);
    setShowImport(false); setCsv("");
    flash(`Imported ${fresh.length} · skipped ${dupes} dupes, ${tollfree} toll-free`);
  }

  function emptyLead(): Prospect {
    return {
      id: uid(), name: "", phone: "", email: "", website: "", hasSite: false,
      city: "", street: "", owner: "", stage: "new", nextFollowUp: "", lastContacted: "",
      notes: "", createdAt: Date.now(), source: "manual", tier: "call",
    };
  }
  function addLead() {
    const name = draft.name.trim();
    if (!name) { flash("Business name is required"); return; }
    const lead: Prospect = {
      ...draft, name, phone: draft.phone.trim(), email: draft.email.trim(),
      website: draft.website.trim(), owner: draft.owner.trim(), city: draft.city.trim(),
      hasSite: !!draft.website.trim(),
      // WhatsApp leads are warm inbound, not part of the cold-dial triage, so
      // they skip the call/verify/skip tier and show their source badge instead.
      tier: draft.source === "whatsapp" ? undefined : (draft.website.trim() ? undefined : "call"),
    };
    setItems((xs) => [lead, ...xs]);
    setShowAdd(false); setDraft(emptyLead());
    pushToQuo(lead); // a lead added because you just called/dealt with them directly, worth naming in Quo right away
    flash(`Added ${name}`);
  }

  function skipBadNumbers() {
    const flagged = items.filter(flaggedPhone);
    if (!flagged.length) return;
    if (!confirm(`Move ${flagged.length} leads with toll-free / out-of-area / duplicate / missing numbers to the Skip tier? You can change them back anytime.`)) return;
    setItems((xs) => xs.map((x) => (flaggedPhone(x) ? { ...x, tier: "skip" as ProspectTier } : x)));
    setBadPhoneOnly(false);
    flash(`${flagged.length} flagged leads moved to Skip`);
  }

  function exportCSV() {
    const cols: (keyof Prospect)[] = ["name", "owner", "phone", "email", "hasSite", "website", "city", "stage", "nextFollowUp", "lastContacted", "notes"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = [cols.join(","), ...items.map((p) => cols.map((c) => esc(p[c])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = "stackwrk-prospects.csv"; a.click();
  }

  // Instantly needs an email per row; everything else is a custom column you
  // can drop in as a {{merge var}} in your sequence. `icebreaker` reuses the
  // exact same opening line as the CRM's own cold-email templates.
  // newOnly (default) skips leads already sent to Instantly and stamps each
  // exported lead so it's never sent twice; "Re-export all" passes false.
  function exportInstantlyCSV(newOnly = true) {
    const withEmail = items.filter((p) => p.email && p.email.includes("@") && (!newOnly || !p.exportedAt));
    // Same email on 2+ businesses is either a shared inbox or a templated /
    // fake listing (both common in scraped directory data), either way it's
    // not a distinct contact worth a second send, so keep the first and skip
    // the rest instead of letting Instantly catch it after the fact.
    const seen = new Set<string>();
    const rows: Prospect[] = [];
    let dupes = 0;
    for (const p of withEmail) {
      const key = p.email.trim().toLowerCase();
      if (seen.has(key)) { dupes++; continue; }
      seen.add(key);
      rows.push(p);
    }
    if (!rows.length) { flash(newOnly ? "Nothing new: every emailed lead has already been exported" : "No emails on file yet"); return; }
    const cols = ["email", "first_name", "company_name", "phone", "city", "website", "icebreaker"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = [cols.join(","), ...rows.map((p) => [
      p.email, (p.owner || "").split(" ")[0], p.name, p.phone, p.city?.split(",")[0] || "", p.website, gapFor(p),
    ].map(esc).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = "stackwrk-instantly-leads.csv"; a.click();
    // Stamp what we just exported so the next "Export new" skips them.
    const now = Date.now();
    const ids = new Set(rows.map((r) => r.id));
    setItems((xs) => xs.map((x) => (ids.has(x.id) ? { ...x, exportedAt: now } : x)));
    flash(`Exported ${rows.length}${newOnly ? " new" : ""} · ${dupes} duplicate email${dupes === 1 ? "" : "s"} skipped`);
  }

  // Checks each lead's own website for a published contact email (mailto:
  // link or plain text, homepage then one contact-page hop), never guesses,
  // only fills in what's actually published. Runs a handful of sites at once
  // client-side rather than one big server request, since checking 100+
  // external sites can take a few minutes. Every scanned lead is stamped
  // with emailCheckedAt so the same sites are never re-checked; recheckAll
  // re-scans the ones that came back empty last time.
  async function findMissingEmails(recheckAll = false) {
    if (emailHunt) return; // already running
    const targets = items.filter((p) => !p.email?.trim() && p.website?.trim() && (recheckAll || !p.emailCheckedAt));
    if (!targets.length) return;
    if (!confirm(`Check ${targets.length} lead website${targets.length === 1 ? "" : "s"} for a published contact email? This runs in the background and can take a few minutes.`)) return;

    setEmailHunt({ done: 0, total: targets.length, found: 0 });
    let idx = 0, done = 0, found = 0;
    const now = Date.now();
    const CONCURRENCY = 5;
    async function worker() {
      while (idx < targets.length) {
        const p = targets[idx++];
        let email = "";
        try {
          const r = await fetch("/api/leads/find-email", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: p.website }),
          }).then((res) => res.json());
          if (r.ok && r.email) email = r.email;
        } catch { /* site unreachable or blocked, leave email blank, still mark checked */ }
        // Stamp emailCheckedAt whether or not we found one, so it isn't re-scanned.
        patch(p.id, email ? { email, emailCheckedAt: now } : { emailCheckedAt: now });
        if (email) found++;
        done++;
        setEmailHunt({ done, total: targets.length, found });
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setEmailHunt(null);
    flash(`Found ${found} email${found === 1 ? "" : "s"} on ${targets.length} sites checked`);
  }

  return (
    <main className="crm-page min-h-screen">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight crm-strong">Prospects <span className="crm-subtle">· Stackwrk CRM</span></h1>
            <p className="text-xs crm-muted">👥 Shared team pipeline. Signed in as <b className="crm-accent">{presenting ? "you" : user}</b>.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setPresenting((v) => !v)} title="Hide every customer's name, phone, email and address behind fake data so you can safely screenshot or demo the CRM" className={`rounded-lg px-3 py-2 text-xs font-bold ${presenting ? "bg-violet-600 text-white" : "crm-btn"}`}>{presenting ? "🕶 Presenting" : "🕶 Present"}</button>
            <button onClick={toggleTheme} title="Toggle day / night" className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn">{theme === "day" ? "🌙 Night" : "☀️ Day"}</button>
            <button onClick={() => { setDraft(emptyLead()); setShowAdd(true); }} className="rounded-lg bg-lime px-3 py-2 text-xs font-bold text-ink">+ Add lead</button>
            <button onClick={() => setShowImport(true)} className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn">Import CSV</button>
            <button onClick={exportCSV} className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn" title="Download every prospect as a spreadsheet (backup / records). This is NOT the email campaign file.">⬇ Export all</button>
            {emailHunt ? (
              <button disabled className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn opacity-60">🔍 Checking {emailHunt.done}/{emailHunt.total} · {emailHunt.found} found</button>
            ) : uncheckedWithSite > 0 ? (
              <button onClick={() => findMissingEmails(false)} className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn" title="Scan each unchecked lead's website for a published contact email">🔍 Find emails ({uncheckedWithSite})</button>
            ) : triedEmptyWithSite > 0 ? (
              <button onClick={() => findMissingEmails(true)} className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn" title="Re-scan the sites that had no email last time">↻ Re-check {triedEmptyWithSite}</button>
            ) : null}
            <button onClick={() => exportInstantlyCSV(true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white dark:bg-lime dark:text-ink" title="Only leads that HAVE an email and haven't been sent yet. Formatted for Instantly with the personalized icebreaker line. Upload THIS to your email campaign.">✉️ Export to email campaign{unexportedWithEmail > 0 ? ` (${unexportedWithEmail})` : ""}</button>
            {exportedCount > 0 && (
              <button onClick={() => exportInstantlyCSV(false)} className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn" title="Re-download every lead with an email, including ones already sent to the campaign">↻ Re-export all emails</button>
            )}
            <button onClick={logout} className="rounded-lg px-3 py-2 text-xs font-semibold crm-btn">Sign out</button>
          </div>
        </div>

        {presenting && (
          <div className="mt-3 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
            🕶 Presentation mode on. Every customer name, phone, email and address is replaced with fake data, so this screen is safe to screenshot or share. Editing is paused. Turn it off to work.
          </div>
        )}

        {/* view toggle: Today (daily driver) vs the full board */}
        <div className="mt-4 inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-white/12">
          <button onClick={() => setView("today")} className={`rounded-md px-4 py-1.5 text-xs font-bold ${view === "today" ? "bg-lime text-ink" : "crm-muted"}`}>▶ Today</button>
          <button onClick={() => setView("board")} className={`rounded-md px-4 py-1.5 text-xs font-bold ${view === "board" ? "bg-lime text-ink" : "crm-muted"}`}>Full board</button>
        </div>

        {view === "today" && <TodayDriver items={presenting ? items.map(maskProspect) : items} patch={patch} onOpen={setSel} onCopy={flash} />}

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
          {newLeadsCount > 0 && (
            <button onClick={() => setNewLeadsOnly((v) => !v)} className={`rounded-lg px-3 py-2 text-xs font-bold ${newLeadsOnly ? "bg-violet-100 text-violet-700 ring-1 ring-violet-300 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-violet-500/40" : "crm-btn"}`} title="Leads the system collected for you: inbound site audits + numbers you dialed/texted in Quo">🆕 New leads {newLeadsCount}</button>
          )}
          {auditCount > 0 && (
            <button onClick={() => setAuditOnly((v) => !v)} className={`rounded-lg px-3 py-2 text-xs font-bold ${auditOnly ? "bg-sky-100 text-sky-700 ring-1 ring-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-500/40" : "crm-btn"}`} title="People who ran your site audit: warm inbound leads">🔎 Audited {auditCount}</button>
          )}
          {whatsappCount > 0 && (
            <button onClick={() => setWhatsappOnly((v) => !v)} className={`rounded-lg px-3 py-2 text-xs font-bold ${whatsappOnly ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/40" : "crm-btn"}`} title="Leads who replied to your WhatsApp community post: warm inbound">💬 WhatsApp {whatsappCount}</button>
          )}
          {badPhoneCount > 0 && (
            <button onClick={() => setBadPhoneOnly((v) => !v)} className={`rounded-lg px-3 py-2 text-xs font-bold ${badPhoneOnly ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/40" : "crm-btn"}`} title="Toll-free, out-of-area, duplicate or missing numbers: these usually won't reach the local owner">⚠ Check numbers {badPhoneCount}</button>
          )}
          {badPhoneOnly && badPhoneCount > 0 && (
            <button onClick={skipBadNumbers} className="rounded-lg bg-rose-500/90 px-3 py-2 text-xs font-bold text-white hover:bg-rose-600">Move {badPhoneCount} → Skip tier</button>
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
          {ready && !items.length && <span className="text-sm crm-muted">Empty: use <b className="crm-accent">Import CSV</b> to add leads.</span>}
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
                    {cards.map((real) => { const p = presenting ? maskProspect(real) : real; return (
                      <button key={real.id} onClick={() => setSel(real)} className="block w-full rounded-lg p-2.5 text-left transition-colors crm-card hover:border-emerald-400 dark:hover:border-lime/40">
                        <div className="flex items-start justify-between gap-1">
                          <span className="truncate text-[0.8rem] font-semibold crm-strong">{p.name}</span>
                          {p.tier
                            ? <span className={`shrink-0 rounded px-1 text-[0.55rem] font-bold ${TIER_META[p.tier].cls}`}>{TIER_META[p.tier].short}</span>
                            : p.source === "audit"
                            ? <span className="shrink-0 rounded bg-sky-100 px-1 text-[0.55rem] font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">🔎 AUDIT{p.auditScore != null ? ` ${p.auditScore}` : ""}</span>
                            : p.source === "quo"
                            ? <span className="shrink-0 rounded bg-violet-100 px-1 text-[0.55rem] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">📞 CALLED</span>
                            : p.source === "whatsapp"
                            ? <span className="shrink-0 rounded bg-emerald-100 px-1 text-[0.55rem] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">💬 WA</span>
                            : !p.hasSite && <span className="shrink-0 rounded bg-rose-100 px-1 text-[0.55rem] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">NO SITE</span>}
                        </div>
                        <div className="mt-0.5 truncate text-[0.68rem] crm-muted">{p.city}</div>
                        {p.phone && <div className="mt-1 text-[0.68rem] crm-muted">{p.phone}</div>}
                        {(p.tags?.length ?? 0) > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {p.tags!.slice(0, 3).map((t) => (
                              <span key={t} className={`rounded px-1 text-[0.55rem] font-bold ${tagStyle(t)}`}>{t}</span>
                            ))}
                          </div>
                        )}
                        {p.nextFollowUp && <div className={`mt-1 text-[0.62rem] ${p.nextFollowUp <= todayISO() ? "text-amber-600 dark:text-amber-400" : "crm-subtle"}`}>⏰ {p.nextFollowUp}</div>}
                      </button>
                    ); })}
                    {!cards.length && <div className="px-2 py-3 text-center text-[0.65rem] crm-subtle">-</div>}
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
        const real = items.find((x) => x.id === sel.id) || sel;
        const p = presenting ? maskProspect(real) : real;
        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={closeDrawer}>
            <div className="h-full w-full max-w-md overflow-y-auto border-l p-5 crm-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-extrabold crm-strong">{p.name}</h2>
                  <p className="text-xs crm-muted">{p.city} {p.street && `· ${p.street}`}</p>
                </div>
                <button onClick={closeDrawer} className="rounded-md px-2 py-1 crm-muted hover:bg-black/5 dark:hover:bg-white/5">✕</button>
              </div>

              {p.tier
                ? <div className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${TIER_META[p.tier].cls}`}>{p.tier === "call" ? "🟢" : p.tier === "verify" ? "🟡" : "🔴"} {TIER_META[p.tier].label}: {TIER_META[p.tier].hint}</div>
                : p.source === "audit"
                ? <div className="mt-3 rounded-lg bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">🔎 Inbound: ran your site audit{p.auditScore != null ? ` (scored ${p.auditScore}/100)` : ""}. Warm lead, reach out fast.</div>
                : p.source === "quo"
                ? <div className="mt-3 rounded-lg bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">📞 Synced from a Quo call, not yet in the CRM by name. Fill in what you know below.</div>
                : p.source === "whatsapp"
                ? <div className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">💬 Replied to your WhatsApp community post. Warm inbound: reply fast and book the call.</div>
                : !p.hasSite && <div className="mt-3 rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">🔥 No website: top prospect. Call first.</div>}

              {/* contact quick actions */}
              {p.phone && (() => {
                const pc = phoneCheck(p.phone);
                const dupe = isDupePhone(p);
                return (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button onClick={() => { navigator.clipboard?.writeText(pc.pretty || p.phone); flash("Number copied, paste into Quo to call"); }} className="rounded-lg bg-lime px-3 py-2 text-center text-sm font-bold text-ink">📋 Copy {pc.pretty || p.phone}</button>
                      <a href={`tel:${pc.dial || p.phone.replace(/[^0-9]/g, "")}`} className="rounded-lg px-3 py-2 text-center text-sm font-semibold crm-btn">📞 Dial (tel:)</a>
                    </div>
                    {(pc.flag !== "ok" || dupe) && (
                      <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[0.7rem] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                        ⚠ {dupe ? "Duplicate number: the same number is on another lead (double listing or aggregator). Skip the twin." : pc.label}
                      </div>
                    )}
                  </>
                );
              })()}
              {p.email && <button onClick={() => copy(p.email)} className="mt-2 w-full rounded-lg px-3 py-2 text-sm font-semibold crm-btn">Copy email</button>}

              {/* contact on file: confirm it's really them before you dial */}
              <div className="mt-4 rounded-lg p-3 crm-stat">
                <p className="text-[0.7rem] font-bold uppercase tracking-wide crm-subtle">Contact on file</p>
                <div className="mt-1.5 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="crm-subtle">📞</span>
                    {p.phone
                      ? <a href={`tel:${p.phone.replace(/[^0-9]/g, "")}`} className="font-semibold crm-strong">{p.phone}</a>
                      : <span className="crm-subtle">No phone on file</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="crm-subtle">🌐</span>
                    {p.website
                      ? <a href={href(p.website)} target="_blank" rel="noopener noreferrer" className="truncate font-semibold text-emerald-700 underline underline-offset-2 dark:text-lime">{prettyUrl(p.website)} ↗</a>
                      : <span className="crm-subtle">No website on file: that&rsquo;s your pitch.</span>}
                  </div>
                </div>
                {p.website
                  ? <p className="mt-2 text-[0.66rem] crm-subtle">⚠️ Confirm it&rsquo;s them: the phone on the site should match the number above. If it doesn&rsquo;t, it may be a different business or a directory listing, verify before you pitch.</p>
                  : <p className="mt-2 text-[0.66rem] crm-subtle">Tip: if you find a site on Google, check its phone matches the number above before assuming it&rsquo;s theirs: namesakes and Yelp/BBB listings are common.</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <a href={lookup(p, "maps")} target="_blank" rel="noopener noreferrer" className="rounded-lg px-2.5 py-1.5 text-xs font-semibold crm-btn">📍 Reviews ↗</a>
                  <a href={lookup(p, "google")} target="_blank" rel="noopener noreferrer" className="rounded-lg px-2.5 py-1.5 text-xs font-semibold crm-btn">🔍 Google ↗</a>
                  <a href={lookup(p, "fb")} target="_blank" rel="noopener noreferrer" className="rounded-lg px-2.5 py-1.5 text-xs font-semibold crm-btn">📘 Facebook ↗</a>
                  {p.phone && (
                    <button
                      onClick={async () => flash((await pushToQuo(real)) ? "Synced to Quo" : "Couldn't sync to Quo: check it's connected")}
                      disabled={presenting}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold crm-btn disabled:opacity-40"
                      title="Push this name into Quo as a contact"
                    >
                      🔄 Sync to Quo
                    </button>
                  )}
                </div>
              </div>

              {/* run the audit on their live site, if they have one */}
              {p.website && <LeadAudit key={p.website} url={href(p.website)} />}

              {/* past calls with this number, synced from Quo */}
              {p.phone && <CallHistory key={p.phone} phone={p.phone} />}

              {/* live call console: tappable chapters, filled in for this lead */}
              <CallConsole p={p} fill={fill} onCopy={copy} />

              {/* tags */}
              <div className="mt-4">
                <p className="text-[0.7rem] font-bold uppercase tracking-wide crm-subtle">Tags</p>
                {(p.tags?.length ?? 0) > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.tags!.map((t) => (
                      <button key={t} onClick={() => toggleTag(p, t)} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tagStyle(t)}`} title="Click to remove">
                        {t} <span className="opacity-60">✕</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_TAGS.filter((t) => !(p.tags || []).includes(t)).map((t) => (
                    <button key={t} onClick={() => toggleTag(p, t)} className="rounded-full px-2.5 py-1 text-xs font-semibold crm-btn">+ {t}</button>
                  ))}
                </div>
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && tagDraft.trim()) { toggleTag(p, tagDraft.trim()); setTagDraft(""); } }}
                  placeholder="+ custom tag, press Enter"
                  className="mt-2 w-full rounded-lg px-3 py-2 text-xs crm-input"
                />
              </div>

              {/* stage + follow-up */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold crm-muted">Stage
                  <select value={p.stage} disabled={presenting} onChange={(e) => patch(p.id, { stage: e.target.value as ProspectStage })} className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input">
                    {PROSPECT_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold crm-muted">Next follow-up
                  <input type="date" value={p.nextFollowUp} disabled={presenting} onChange={(e) => patch(p.id, { nextFollowUp: e.target.value })} className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input" />
                </label>
              </div>
              {/* structured contact details: fill these from the call, not freeform */}
              <div className="mt-4">
                <p className="text-[0.7rem] font-bold uppercase tracking-wide crm-subtle">Contact details</p>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold crm-muted">Contact name
                    <input value={p.owner} readOnly={presenting} onChange={(e) => patch(p.id, { owner: e.target.value })} placeholder="e.g. Mike" className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input" />
                  </label>
                  <label className="text-xs font-semibold crm-muted">Best time to reach
                    <select value={p.bestTime || ""} disabled={presenting} onChange={(e) => patch(p.id, { bestTime: e.target.value })} className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input">
                      <option value="">-</option>
                      {BEST_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-semibold crm-muted">Email
                    <input type="email" value={p.email} readOnly={presenting} onChange={(e) => patch(p.id, { email: e.target.value })} placeholder="add from call" className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input" />
                  </label>
                  <label className="text-xs font-semibold crm-muted">Phone
                    <input type="tel" value={p.phone} readOnly={presenting} onChange={(e) => patch(p.id, { phone: e.target.value })} placeholder="add / fix number" className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input" />
                  </label>
                </div>
                <label className="mt-3 block text-xs font-semibold crm-muted">Call outcome
                  <select value={p.callOutcome || ""} disabled={presenting} onChange={(e) => patch(p.id, { callOutcome: e.target.value })} className="mt-1 w-full rounded-lg px-2 py-2 text-sm crm-input">
                    <option value="">(not called yet)</option>
                    {CALL_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              </div>

              {/* log actions */}
              <div className="mt-3 flex gap-2">
                <button onClick={() => { patch(p.id, { lastContacted: todayISO(), stage: p.stage === "new" ? "contacted" : p.stage, nextFollowUp: p.nextFollowUp || new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10) }); flash("Logged: follow-up in 3 days"); }} className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold crm-btn">📞 Log call/email</button>
                <button onClick={() => patch(p.id, { stage: "call_booked" })} className="flex-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-lime/40 dark:bg-lime/10 dark:text-lime">📅 Booked a call</button>
              </div>

              <label className="mt-4 block text-xs font-semibold crm-muted">Notes
                <textarea value={p.notes} readOnly={presenting} onChange={(e) => patch(p.id, { notes: e.target.value })} rows={3} className="mt-1 w-full rounded-lg px-3 py-2 text-sm crm-input" placeholder="Call notes, objections, next steps…" />
              </label>

              {/* client agreement: generate a personalized e-sign link with a shown discount */}
              <AgreementGen key={p.id} prospect={p} onCopy={flash} />

              {/* templates: grouped into the two pipelines (phone-first / email-first) */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide crm-muted">Templates (auto-filled for {p.name})</p>
                {TEMPLATE_FLOWS.map((flow) => {
                  // Call scripts live in the console above now; here we only
                  // list the copy-and-send messages (email / text).
                  const group = TEMPLATES.filter((t) => t.flow === flow.key && t.channel !== "call");
                  if (!group.length) return null;
                  return (
                    <div key={flow.key} className="mt-3">
                      <p className="text-[0.7rem] font-bold crm-strong">{flow.label}</p>
                      <p className="text-[0.6rem] crm-subtle">{flow.hint}</p>
                      <div className="mt-1.5 space-y-2">
                        {group.map((t) => (
                          <div key={t.key} className="rounded-lg p-2.5 crm-stat">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold crm-strong">{t.label}</span>
                              <button onClick={() => copy((t.subject ? `Subject: ${fill(t.subject, p)}\n\n` : "") + fill(t.body, p))} className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20">Copy</button>
                            </div>
                            {t.subject && <p className="mt-1 text-[0.68rem] crm-subtle">Subject: {fill(t.subject, p)}</p>}
                            <p className="mt-1 whitespace-pre-wrap text-[0.68rem] leading-relaxed crm-muted">{fill(t.body, p).slice(0, 140)}…</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
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

      {/* add-lead modal: for a business you called or found that isn't in the list */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl border p-5 crm-drawer" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold crm-strong">Add a lead</h2>
            <p className="mt-1 text-xs crm-muted">A business you called or found that isn&rsquo;t in the list. It drops into the New column, ready to work.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="col-span-2 text-xs font-semibold crm-muted">Business name *
                <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") addLead(); }} placeholder="e.g. Apex Fence Co." className="mt-1 w-full rounded-lg px-3 py-2 text-sm crm-input" />
              </label>
              <label className="text-xs font-semibold crm-muted">Phone
                <input type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="(954) 555-0100" className="mt-1 w-full rounded-lg px-3 py-2 text-sm crm-input" />
              </label>
              <label className="text-xs font-semibold crm-muted">City
                <input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="Fort Lauderdale" className="mt-1 w-full rounded-lg px-3 py-2 text-sm crm-input" />
              </label>
              <label className="text-xs font-semibold crm-muted">Contact name
                <input value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} placeholder="e.g. Mike" className="mt-1 w-full rounded-lg px-3 py-2 text-sm crm-input" />
              </label>
              <label className="text-xs font-semibold crm-muted">Email
                <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="optional" className="mt-1 w-full rounded-lg px-3 py-2 text-sm crm-input" />
              </label>
              <label className="col-span-2 text-xs font-semibold crm-muted">Website
                <input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} placeholder="leave blank if they have no site: that's your pitch" className="mt-1 w-full rounded-lg px-3 py-2 text-sm crm-input" />
              </label>
              <label className="col-span-2 text-xs font-semibold crm-muted">Source
                <select value={draft.source ?? "manual"} onChange={(e) => setDraft({ ...draft, source: e.target.value as Prospect["source"] })} className="mt-1 w-full rounded-lg px-3 py-2 text-sm crm-input">
                  <option value="manual">Manual (found / called)</option>
                  <option value="whatsapp">WhatsApp (community DM)</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="rounded-lg px-4 py-2 text-sm crm-btn">Cancel</button>
              <button onClick={addLead} className="rounded-lg bg-lime px-4 py-2 text-sm font-bold text-ink">Add lead</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-lime px-4 py-2 text-sm font-bold text-ink shadow-lg">{toast}</div>}
    </main>
  );
}
