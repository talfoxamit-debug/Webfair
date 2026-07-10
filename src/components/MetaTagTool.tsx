"use client";

import { useMemo, useState } from "react";
import { Check } from "./icons";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || "example.com";
  }
}

function Counter({ n, ideal }: { n: number; ideal: [number, number] }) {
  const over = n > ideal[1];
  const under = n > 0 && n < ideal[0];
  const tone = over ? "text-flare-red" : under ? "text-flare-orange" : "text-lime";
  return (
    <span className={`text-[0.7rem] tabular-nums ${n === 0 ? "text-white/30" : tone}`}>
      {n}/{ideal[1]}
    </span>
  );
}

export default function MetaTagTool() {
  const [title, setTitle] = useState("Bold Websites. Real Results. | Stackwrk");
  const [desc, setDesc] = useState(
    "Custom web apps and sites that get you more bookings, leads, and revenue. Built fast, built to convert.",
  );
  const [url, setUrl] = useState("https://stackwrk.com");
  const [image, setImage] = useState("");
  const [site, setSite] = useState("Stackwrk");
  const [copied, setCopied] = useState(false);

  const domain = domainOf(url);

  const code = useMemo(
    () =>
      [
        `<title>${esc(title)}</title>`,
        `<meta name="description" content="${esc(desc)}" />`,
        `<link rel="canonical" href="${esc(url)}" />`,
        ``,
        `<!-- Open Graph (Facebook, LinkedIn, …) -->`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(desc)}" />`,
        `<meta property="og:url" content="${esc(url)}" />`,
        `<meta property="og:site_name" content="${esc(site)}" />`,
        image ? `<meta property="og:image" content="${esc(image)}" />` : `<!-- add an og:image URL for a rich preview -->`,
        ``,
        `<!-- X / Twitter -->`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(title)}" />`,
        `<meta name="twitter:description" content="${esc(desc)}" />`,
        image ? `<meta name="twitter:image" content="${esc(image)}" />` : "",
      ]
        .filter((l) => l !== "")
        .join("\n"),
    [title, desc, url, image, site],
  );

  function copy() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const field =
    "w-full rounded-lg border border-white/12 bg-ink-800/70 px-3.5 py-2.5 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-lime/60 focus:ring-2 focus:ring-lime/20";
  const label = "mb-1.5 flex items-center justify-between text-xs font-semibold text-white/70";

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
      {/* Inputs */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <div className="space-y-4">
          <div>
            <div className={label}>Page title <Counter n={title.length} ideal={[30, 60]} /></div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} placeholder="Your page title" />
          </div>
          <div>
            <div className={label}>Meta description <Counter n={desc.length} ideal={[70, 160]} /></div>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className={`${field} resize-none`} placeholder="A short, compelling summary of the page." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className={label}>Page URL</div>
              <input value={url} onChange={(e) => setUrl(e.target.value)} className={field} placeholder="https://yoursite.com" inputMode="url" />
            </div>
            <div>
              <div className={label}>Site name</div>
              <input value={site} onChange={(e) => setSite(e.target.value)} className={field} placeholder="Your brand" />
            </div>
          </div>
          <div>
            <div className={label}>Preview image URL <span className="font-normal text-white/35">optional</span></div>
            <input value={image} onChange={(e) => setImage(e.target.value)} className={field} placeholder="https://yoursite.com/og-image.jpg" inputMode="url" />
          </div>
        </div>

        {/* Generated code */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Copy into your &lt;head&gt;</span>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md border border-lime/30 bg-lime/[0.08] px-2.5 py-1 text-xs font-semibold text-lime transition-colors hover:bg-lime/[0.14]"
            >
              {copied ? <><Check width={13} height={13} /> Copied</> : "Copy tags"}
            </button>
          </div>
          <pre className="max-h-56 overflow-auto rounded-lg border border-white/10 bg-ink-900/80 p-3 text-[0.7rem] leading-relaxed text-white/75">
            <code>{code}</code>
          </pre>
        </div>
      </div>

      {/* Previews */}
      <div className="space-y-4">
        {/* Google */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-white/40">Google result</p>
          <div className="rounded-lg bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[0.6rem] font-bold text-gray-600">
                {(site || domain).charAt(0).toUpperCase()}
              </span>
              <div className="leading-tight">
                <div className="text-[0.72rem] text-gray-800">{site || domain}</div>
                <div className="text-[0.62rem] text-gray-500">{url}</div>
              </div>
            </div>
            <div className="mt-1.5 truncate text-[1.05rem] leading-snug text-[#1a0dab]">{title || "Your page title"}</div>
            <div className="mt-0.5 line-clamp-2 text-[0.78rem] leading-snug text-gray-600">{desc || "Your meta description will appear here."}</div>
          </div>
        </div>

        {/* Social card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-white/40">Social card (X · Facebook · LinkedIn)</p>
          <div className="overflow-hidden rounded-lg border border-white/10 bg-ink-800">
            <div className="flex aspect-[1.91/1] items-center justify-center bg-gradient-to-br from-violet-900/60 to-ink-900 text-center">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="px-6 text-xs text-white/35">Add an image URL to see the card image</span>
              )}
            </div>
            <div className="border-t border-white/10 p-3">
              <div className="text-[0.6rem] uppercase tracking-wide text-white/40">{domain}</div>
              <div className="mt-1 truncate text-sm font-semibold text-white">{title || "Your page title"}</div>
              <div className="mt-0.5 line-clamp-2 text-xs text-white/55">{desc || "Your description will appear here."}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
