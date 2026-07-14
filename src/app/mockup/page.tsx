"use client";

import { useMemo, useState } from "react";
import { encodeConfig, type FenceConfig, type GalleryItem } from "@/lib/fence-config";

function parseGallery(text: string): GalleryItem[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
    const [img, title, city] = line.split("|").map((x) => x.trim());
    return { img, title: title || "Recent project", city: city || "" };
  }).filter((g) => g.img).slice(0, 6);
}

const field = "w-full rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-lime/50 placeholder:text-white/30";
const label = "mb-1 block text-xs font-semibold text-slate-300";

export default function MockupBuilder() {
  const [f, setF] = useState({
    business: "", phone: "", region: "South Florida", tagline: "",
    heroImg: "", gallery: "", rating: "4.9", reviewCount: "127",
    years: "15+ yrs", jobs: "1,500+", license: "FL Lic. #________", areas: "",
  });
  const [applied, setApplied] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [adv, setAdv] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  const cfg = useMemo<Partial<FenceConfig>>(() => {
    const c: Partial<FenceConfig> = {};
    if (f.business.trim()) c.business = f.business.trim();
    if (f.phone.trim()) c.phone = f.phone.trim();
    if (f.region.trim()) c.region = f.region.trim();
    if (f.tagline.trim()) c.tagline = f.tagline.trim();
    if (f.heroImg.trim()) c.heroImg = f.heroImg.trim();
    const g = parseGallery(f.gallery);
    if (g.length) c.gallery = g;
    if (f.rating.trim()) c.rating = f.rating.trim();
    if (f.reviewCount.trim()) c.reviewCount = f.reviewCount.trim();
    if (f.years.trim()) c.years = f.years.trim();
    if (f.jobs.trim()) c.jobs = f.jobs.trim();
    if (f.license.trim()) c.license = f.license.trim();
    const areas = f.areas.split(",").map((a) => a.trim()).filter(Boolean);
    if (areas.length) c.areas = areas;
    return c;
  }, [f]);

  const link = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/mockup/preview?d=${encodeConfig(cfg)}`;
  }, [cfg]);

  const build = () => setApplied(`/mockup/preview?d=${encodeConfig(cfg)}`);
  const copy = () => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1600); };

  return (
    <main className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <div className="mb-4">
          <h1 className="text-xl font-extrabold">Mockup Generator <span className="text-slate-500">· fence contractor</span></h1>
          <p className="text-xs text-slate-500">Fill this in from a prospect&rsquo;s Google/Facebook page (~2 min). Hit <b className="text-lime">Build</b>, copy the link, send it or Loom it.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          {/* form */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="space-y-3">
              <div><span className={label}>Business name</span><input className={field} value={f.business} onChange={set("business")} placeholder="Gomez & Son Fence" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className={label}>Phone</span><input className={field} value={f.phone} onChange={set("phone")} placeholder="(954) 555-0140" /></div>
                <div><span className={label}>Region / area</span><input className={field} value={f.region} onChange={set("region")} placeholder="South Florida" /></div>
              </div>
              <div><span className={label}>Headline <span className="font-normal text-slate-500">(optional)</span></span><input className={field} value={f.tagline} onChange={set("tagline")} placeholder="Auto: “South Florida’s trusted fence builders.”" /></div>
              <div><span className={label}>Hero photo URL <span className="font-normal text-slate-500">(their best fence)</span></span><input className={field} value={f.heroImg} onChange={set("heroImg")} placeholder="https://…/their-fence.jpg" /></div>
              <div>
                <span className={label}>Gallery photos <span className="font-normal text-slate-500">(one per line: URL | title | city)</span></span>
                <textarea className={`${field} font-mono text-[0.75rem]`} rows={5} value={f.gallery} onChange={set("gallery")} placeholder={"https://…/1.jpg | Cedar privacy | Davie\nhttps://…/2.jpg | White vinyl | Weston"} />
                <p className="mt-1 text-[0.75rem] text-slate-500">Grab photo URLs from their Google listing / Facebook. Leave blank to keep the sample photos.</p>
              </div>

              <button onClick={() => setAdv((v) => !v)} className="text-xs font-semibold text-lime">{adv ? "− Hide" : "+ More"} details (reviews, stats, license)</button>
              {adv && (
                <div className="space-y-3 rounded-lg border border-white/8 bg-black/20 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className={label}>Google rating</span><input className={field} value={f.rating} onChange={set("rating")} /></div>
                    <div><span className={label}># reviews</span><input className={field} value={f.reviewCount} onChange={set("reviewCount")} /></div>
                    <div><span className={label}>Years in business</span><input className={field} value={f.years} onChange={set("years")} /></div>
                    <div><span className={label}>Fences installed</span><input className={field} value={f.jobs} onChange={set("jobs")} /></div>
                  </div>
                  <div><span className={label}>License #</span><input className={field} value={f.license} onChange={set("license")} /></div>
                  <div><span className={label}>Service-area cities <span className="font-normal text-slate-500">(comma-separated)</span></span><input className={field} value={f.areas} onChange={set("areas")} placeholder="Fort Lauderdale, Davie, Weston" /></div>
                </div>
              )}

              <button onClick={build} className="w-full rounded-lg bg-lime py-3 text-sm font-extrabold text-ink">Build mockup →</button>
            </div>

            {applied && (
              <div className="mt-4 rounded-lg border border-lime/25 bg-lime/[0.06] p-3">
                <p className="text-xs font-semibold text-lime">Shareable link</p>
                <p className="mt-1 break-all rounded bg-black/30 p-2 font-mono text-[0.75rem] text-slate-300">{link}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={copy} className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-bold hover:bg-white/20">{copied ? "✓ Copied" : "Copy link"}</button>
                  <a href={applied} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg border border-white/15 py-2 text-center text-xs font-bold">Open ↗</a>
                </div>
              </div>
            )}
          </div>

          {/* preview */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            {applied ? (
              <iframe key={applied} src={applied} title="Mockup preview" className="h-[78vh] w-full rounded-lg border border-white/10 bg-white" />
            ) : (
              <div className="flex h-[78vh] flex-col items-center justify-center rounded-lg border border-dashed border-white/12 text-center text-slate-500">
                <p className="text-sm font-semibold">Fill in the form and hit <span className="text-lime">Build</span></p>
                <p className="mt-1 text-xs">The prospect&rsquo;s personalized site appears here.</p>
                <a href="/demos/apex-fence" target="_blank" rel="noopener noreferrer" className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300">See the full sample (Apex) ↗</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
