import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDES, guideBySlug } from "@/lib/fence-guides";
import { DEFAULT_CONFIG } from "@/lib/fence-config";

const NAVY = "#0C2333";
const GREEN = "#18894C";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return { title: "Guide not found" };
  return {
    title: `${g.title} | Apex Fence Co.`,
    description: g.excerpt,
    robots: { index: false, follow: false },
    openGraph: { title: g.title, description: g.excerpt, type: "article" },
  };
}

export default async function GuideArticle({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const c = DEFAULT_CONFIG;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.excerpt,
    datePublished: g.date,
    author: { "@type": "Organization", name: c.business },
    publisher: { "@type": "Organization", name: c.business },
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0C2333]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/demos/apex-fence/guides" className="text-sm font-bold" style={{ color: GREEN }}>← All guides</Link>
          <Link href="/demos/apex-fence#quote" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: GREEN }}>Free Quote</Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <span className="inline-flex rounded-full bg-[#EAF6EF] px-3 py-1 text-xs font-bold" style={{ color: GREEN }}>{g.tag}</span>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl" style={{ color: NAVY }}>{g.title}</h1>
        <p className="mt-3 text-sm text-slate-400">
          {new Date(g.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {g.readMins} min read
        </p>

        <div className="mt-8 space-y-5">
          {g.body.map((b, i) => {
            if (b.h) return <h2 key={i} className="pt-3 text-xl font-bold" style={{ color: NAVY }}>{b.h}</h2>;
            if (b.li) return (
              <ul key={i} className="space-y-2">
                {b.li.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[0.95rem] leading-relaxed text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GREEN }} />
                    {item}
                  </li>
                ))}
              </ul>
            );
            return <p key={i} className="text-[0.98rem] leading-relaxed text-slate-700">{b.p}</p>;
          })}
        </div>

        {/* article CTA */}
        <div className="mt-12 rounded-2xl border border-black/[0.07] bg-white p-7 text-center shadow-sm">
          <h3 className="text-xl font-extrabold" style={{ color: NAVY }}>Ready for a real number?</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">Get a free, written quote for your project, usually the same day.</p>
          <Link href="/demos/apex-fence#quote" className="mt-4 inline-flex rounded-lg px-6 py-3 text-sm font-bold text-white" style={{ background: GREEN }}>
            Get my free quote →
          </Link>
        </div>
      </article>
    </div>
  );
}
