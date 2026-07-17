import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeUrl, guardedFetch, readBodyCapped } from "@/lib/safe-fetch";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 20;

type CheckStatus = "pass" | "warn" | "fail";
type Check = { label: string; status: CheckStatus; detail: string };
type Category = { key: string; label: string; score: number; checks: Check[] };

const MAX_BYTES = 2_500_000;
const FETCH_TIMEOUT_MS = 9000;
const ROBOTS_TIMEOUT_MS = 3500;

const has = (html: string, re: RegExp) => re.test(html);
const grab = (html: string, re: RegExp) => (html.match(re)?.[1] ?? "").trim();
const count = (html: string, re: RegExp) => (html.match(re) || []).length;

// Harsher weighting than a simple pass/warn split: a warn is worth less than
// half, so a page that only "sort of" does things still scores low.
const WEIGHT: Record<CheckStatus, number> = { pass: 100, warn: 35, fail: 0 };
const scoreOf = (checks: Check[]) =>
  Math.round(checks.reduce((s, c) => s + WEIGHT[c.status], 0) / Math.max(checks.length, 1));

async function fetchRobots(origin: string): Promise<{ ok: boolean; hasSitemap: boolean }> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ROBOTS_TIMEOUT_MS);
  try {
    // Route through the SSRF guard so a robots.txt redirect can't reach an
    // internal host, same as the main page fetch.
    const r = await guardedFetch(new URL(`${origin}/robots.txt`), c.signal, "StackwrkAuditBot/1.0 (+https://stackwrk.com)");
    if (!r.ok) return { ok: false, hasSitemap: false };
    const txt = (await r.text()).slice(0, 20000);
    return { ok: true, hasSitemap: /sitemap\s*:/i.test(txt) };
  } catch {
    return { ok: false, hasSitemap: false };
  } finally {
    clearTimeout(t);
  }
}

export async function POST(req: Request) {
  // Public, expensive endpoint (outbound fetch up to 2.5MB, up to 20s): throttle
  // per client IP so it cannot be used as a cost/amplification DoS or SSRF probe.
  if (!rateLimit(`audit:${getClientIp(req)}`, 8, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many audits from your network. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const target = normalizeUrl(body.url ?? "");
  if (!target) {
    return NextResponse.json(
      { ok: false, error: "invalid_url", message: "Enter a valid website address (e.g. yoursite.com)." },
      { status: 422 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const started = Date.now();

  let res: Response;
  try {
    res = await guardedFetch(target, controller.signal, "StackwrkAuditBot/1.0 (+https://stackwrk.com)");
  } catch (e) {
    clearTimeout(timer);
    const blocked = (e as Error).message === "blocked_host";
    return NextResponse.json(
      {
        ok: false,
        error: blocked ? "blocked" : "unreachable",
        message: blocked
          ? "That address points to a private or internal host, which can't be audited."
          : "Couldn't reach that site. Double-check the address and try again.",
      },
      { status: blocked ? 422 : 502 },
    );
  }
  const ttfb = Date.now() - started;

  let html = "";
  try {
    html = await readBodyCapped(res, MAX_BYTES);
  } catch {
    html = "";
  }
  clearTimeout(timer);

  const loadMs = Date.now() - started;
  const finalUrl = res.url || target.toString();
  const isHttps = finalUrl.startsWith("https://");
  const pageKb = Math.max(1, Math.round(new TextEncoder().encode(html).length / 1024));
  const origin = (() => {
    try {
      return new URL(finalUrl).origin;
    } catch {
      return target.origin;
    }
  })();

  // Robots/sitemap probe in parallel-ish (already have the HTML).
  const robots = await fetchRobots(origin);

  const headEnd = html.search(/<\/head>/i);
  const head = headEnd > -1 ? html.slice(0, headEnd) : html.slice(0, 40000);

  // ---- parsed signals -------------------------------------------------------
  const title = grab(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc = grab(html, /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i);
  const hasViewport = has(html, /<meta[^>]+name=["']viewport["']/i);
  const h1Count = count(html, /<h1[\s>]/gi);
  const hasLang = has(html, /<html[^>]+\blang=/i);
  const hasCharset = has(head, /<meta[^>]+charset/i);
  const hasFavicon = has(html, /<link[^>]+rel=["'][^"']*icon[^"']*["']/i);
  const hasCanonical = has(html, /<link[^>]+rel=["']canonical["']/i);
  const hasOg = has(html, /<meta[^>]+property=["']og:(title|image)["']/i);
  const hasTwitter = has(html, /<meta[^>]+name=["']twitter:card["']/i);
  const hasJsonLd = has(html, /<script[^>]+type=["']application\/ld\+json["']/i);
  const isNoindex = has(html, /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i);

  const imgCount = count(html, /<img[\s>]/gi);
  const imgNoAlt = count(html, /<img(?![^>]*\balt=)[^>]*>/gi);
  const imgNoDim = count(html, /<img(?![^>]*\b(?:width|height)=)[^>]*>/gi);
  const legacyImg = count(html, /<img[^>]+src=["'][^"']+\.(?:jpe?g|png|gif)(?:[?"'])/gi);
  const modernImg = count(html, /<img[^>]+src=["'][^"']+\.(?:webp|avif)(?:[?"'])/gi);

  const scriptsTotal = count(html, /<script[\s>]/gi);
  const cssLinksHead = count(head, /<link[^>]+rel=["']stylesheet["']/gi);
  const blockingJsHead = count(head, /<script(?![^>]*\b(?:async|defer|type=["']module["'])\b)[^>]+src=/gi);
  const externalScripts = (() => {
    const srcs = html.match(/<script[^>]+src=["']([^"']+)["']/gi) || [];
    let ext = 0;
    for (const tag of srcs) {
      const m = tag.match(/src=["']([^"']+)["']/i);
      if (!m) continue;
      try {
        const u = new URL(m[1], finalUrl);
        if (u.host && u.host !== new URL(finalUrl).host) ext++;
      } catch {
        /* relative: same origin */
      }
    }
    return ext;
  })();

  const mixedContent = isHttps
    ? count(html, /(?:src|href)=["']http:\/\/(?!www\.w3\.org)/gi)
    : 0;

  const bookingSignal = has(html, /calendly|cal\.com|acuity|squarespace-scheduling|book\s*(now|a|an|your)|appointment|schedule\s*(a|your|now)|reserve|booking/i);
  const contactSignal = has(html, /mailto:|tel:|href=["'][^"']*contact/i);
  const ctaSignal = has(html, /get\s*started|book\s*(now|a)|buy\s*now|sign\s*up|contact\s*us|get\s*a\s*quote|shop\s*now|order\s*(now|online)|add\s*to\s*cart|request\s*a|reserve\s*(a|now|your)?|view\s*(the\s*)?menu|get\s*in\s*touch/i);
  const analyticsSignal = has(html, /googletagmanager|google-analytics|gtag\(|plausible|fathom|posthog|fbq\(|clarity\.ms/i);
  const socialProof = has(html, /testimonial|reviews?|★|⭐|rating|\d(?:\.\d)?\s*(?:\/\s*5|stars?)|trusted by|as seen (?:in|on)|our clients|what .* say/i);
  const leadForm = has(html, /<form[\s>]|type=["']email["']|newsletter|subscribe/i);

  // ---- checks (harsh, specific, quantified) ---------------------------------
  const performance: Check[] = [
    {
      label: "Server response time",
      status: ttfb < 600 ? "pass" : ttfb < 1500 ? "warn" : "fail",
      detail: `First byte in ${ttfb} ms${ttfb >= 600 ? ", under 600 ms is the target" : ", fast"}`,
    },
    {
      label: "HTML page weight",
      status: pageKb < 150 ? "pass" : pageKb < 400 ? "warn" : "fail",
      detail: `${pageKb} KB of HTML${pageKb >= 150 ? ", heavier docs delay first paint on phones" : ""}`,
    },
    {
      label: "Render-blocking resources",
      status: cssLinksHead + blockingJsHead <= 2 ? "pass" : cssLinksHead + blockingJsHead <= 5 ? "warn" : "fail",
      detail: `${cssLinksHead} blocking stylesheet(s) + ${blockingJsHead} blocking script(s) in <head>${
        cssLinksHead + blockingJsHead > 2 ? ", each one stalls rendering" : ""
      }`,
    },
    {
      label: "JavaScript footprint",
      status: scriptsTotal <= 8 ? "pass" : scriptsTotal <= 20 ? "warn" : "fail",
      detail: `${scriptsTotal} <script> tag(s), ${externalScripts} third-party${
        scriptsTotal > 8 ? ". Heavy JS hurts speed & battery" : ""
      }`,
    },
    {
      label: "Modern image formats",
      status: imgCount === 0 ? "warn" : modernImg === 0 && legacyImg >= 3 ? "fail" : legacyImg > modernImg ? "warn" : "pass",
      detail:
        imgCount === 0
          ? "No <img> tags found on the page"
          : `${legacyImg} legacy JPG/PNG vs ${modernImg} WebP/AVIF${legacyImg > modernImg ? ". Convert to WebP to cut weight ~30%" : ""}`,
    },
  ];

  const mobile: Check[] = [
    {
      label: "Secure connection (HTTPS)",
      status: isHttps ? "pass" : "fail",
      detail: isHttps ? "Padlock shown to visitors" : "No HTTPS. Browsers flag the site as 'Not secure'",
    },
    {
      label: "No mixed (insecure) content",
      status: !isHttps ? "warn" : mixedContent === 0 ? "pass" : "fail",
      detail: !isHttps
        ? "N/A until HTTPS is enabled"
        : mixedContent === 0
          ? "All resources load over HTTPS"
          : `${mixedContent} resource(s) still load over http://, these get blocked or warned`,
    },
    {
      label: "Mobile viewport tag",
      status: hasViewport ? "pass" : "fail",
      detail: hasViewport ? "Scales correctly on phones" : "Missing. The page won't fit small screens",
    },
    {
      label: "Layout stability (image sizing)",
      status: imgCount === 0 ? "pass" : imgNoDim / Math.max(imgCount, 1) < 0.3 ? "pass" : imgNoDim / Math.max(imgCount, 1) < 0.7 ? "warn" : "fail",
      detail:
        imgCount === 0
          ? "No images to size"
          : `${imgNoDim}/${imgCount} images have no width/height, causes content to jump while loading`,
    },
    {
      label: "Language & charset declared",
      status: hasLang && hasCharset ? "pass" : hasLang || hasCharset ? "warn" : "fail",
      detail: `${hasLang ? "lang set" : "no <html lang>"} · ${hasCharset ? "charset set" : "no charset"}`,
    },
  ];

  const seo: Check[] = [
    {
      label: "Indexable by Google",
      status: isNoindex ? "fail" : "pass",
      detail: isNoindex ? "Page is set to noindex, invisible to Google" : "No noindex block found",
    },
    {
      label: "Page title",
      status: title ? (title.length >= 15 && title.length <= 60 ? "pass" : "warn") : "fail",
      detail: title ? `“${title.slice(0, 55)}” (${title.length} chars)` : "No <title>, badly hurts rankings",
    },
    {
      label: "Meta description",
      status: metaDesc ? (metaDesc.length >= 70 && metaDesc.length <= 160 ? "pass" : "warn") : "fail",
      detail: metaDesc ? `${metaDesc.length} chars` : "Missing. Google writes its own, often badly",
    },
    {
      label: "Single clear H1 headline",
      status: h1Count === 1 ? "pass" : h1Count === 0 ? "fail" : "warn",
      detail: h1Count === 1 ? "Exactly one H1" : h1Count === 0 ? "No H1. Search engines can't tell the topic" : `${h1Count} H1s, should be exactly one`,
    },
    {
      label: "Canonical + structured data",
      status: hasCanonical && hasJsonLd ? "pass" : hasCanonical || hasJsonLd ? "warn" : "fail",
      detail: `${hasCanonical ? "canonical set" : "no canonical"} · ${hasJsonLd ? "schema.org JSON-LD" : "no structured data"}`,
    },
    {
      label: "Social share preview",
      status: hasOg && hasTwitter ? "pass" : hasOg || hasTwitter ? "warn" : "fail",
      detail: hasOg || hasTwitter ? `${hasOg ? "Open Graph" : ""}${hasOg && hasTwitter ? " + " : ""}${hasTwitter ? "Twitter card" : ""} present` : "No preview when shared on social/WhatsApp",
    },
    {
      label: "Image alt text",
      status: imgCount === 0 ? "warn" : imgNoAlt / Math.max(imgCount, 1) < 0.2 ? "pass" : imgNoAlt / Math.max(imgCount, 1) < 0.6 ? "warn" : "fail",
      detail: imgCount === 0 ? "No images detected" : `${imgNoAlt}/${imgCount} images missing alt text (SEO + accessibility)`,
    },
    {
      label: "robots.txt & sitemap",
      status: robots.ok && robots.hasSitemap ? "pass" : robots.ok ? "warn" : "fail",
      detail: robots.ok ? (robots.hasSitemap ? "robots.txt + sitemap found" : "robots.txt found, but no sitemap listed") : "No robots.txt. Crawlers get no guidance",
    },
  ];

  const conversion: Check[] = [
    {
      label: "Online booking / scheduling",
      status: bookingSignal ? "pass" : "fail",
      detail: bookingSignal ? "Visitors can book you directly" : "No way to book. You're losing after-hours leads",
    },
    {
      label: "Clear primary call-to-action",
      status: ctaSignal ? "pass" : "fail",
      detail: ctaSignal ? "Found action-oriented buttons" : "No obvious next step for visitors",
    },
    {
      label: "Lead capture form",
      status: leadForm ? "pass" : "warn",
      detail: leadForm ? "A form/email capture is present" : "No form. Visitors can't leave their details",
    },
    {
      label: "Easy to contact",
      status: contactSignal ? "pass" : "warn",
      detail: contactSignal ? "Phone/email/contact link present" : "Hard to find how to reach you",
    },
    {
      label: "Social proof",
      status: socialProof ? "pass" : "warn",
      detail: socialProof ? "Reviews/testimonials/ratings detected" : "No visible reviews or testimonials to build trust",
    },
    {
      label: "Visitor analytics",
      status: analyticsSignal ? "pass" : "warn",
      detail: analyticsSignal ? "You're measuring traffic" : "No analytics. You're flying blind",
    },
  ];

  const categories: Category[] = [
    { key: "performance", label: "Performance", score: scoreOf(performance), checks: performance },
    { key: "mobile", label: "Mobile", score: scoreOf(mobile), checks: mobile },
    { key: "seo", label: "SEO", score: scoreOf(seo), checks: seo },
    { key: "conversion", label: "Conversion", score: scoreOf(conversion), checks: conversion },
  ];

  // Weighted overall: performance & conversion carry the most business weight.
  let score = Math.round(
    0.28 * categories[0].score +
      0.22 * categories[1].score +
      0.25 * categories[2].score +
      0.25 * categories[3].score,
  );
  // Hard caps for critical failures a "shitty site" typically has.
  if (!isHttps) score = Math.min(score, 55);
  if (isNoindex) score = Math.min(score, 45);
  if (mixedContent > 0) score = Math.min(score, 60);
  score = Math.max(0, Math.min(100, score));

  const headline =
    score >= 88
      ? "Strong site. A few tweaks and it'll really convert."
      : score >= 70
        ? "Solid base, but you're leaving leads on the table."
        : score >= 50
          ? "Real gaps here. This is costing you customers."
          : score >= 30
            ? "This site is working against you. Let's fix it."
            : "Critical issues. This needs a rebuild, not a patch.";

  // Fire-and-forget audit log (warm-lead signal).
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("audits").insert({ url: finalUrl, score, load_ms: loadMs, page_kb: pageKb });
    }
  } catch {
    /* table missing or env unset: ignore */
  }

  return NextResponse.json({
    ok: true,
    url: target.toString(),
    finalUrl,
    score,
    loadMs,
    pageKb,
    categories,
    headline,
  });
}
