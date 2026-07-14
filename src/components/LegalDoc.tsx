import Link from "next/link";

export type LegalBlock = { h?: string; p?: string; li?: string[] };

/** Simple, readable legal-document layout that matches the site's dark theme. */
export default function LegalDoc({ title, updated, intro, blocks }: { title: string; updated: string; intro: string; blocks: LegalBlock[] }) {
  return (
    <main className="min-h-screen bg-ink text-white/85">
      <div className="container-content max-w-3xl py-14 sm:py-20">
        <Link href="/" className="text-sm font-bold uppercase tracking-wide text-lime">← Stackwrk</Link>
        <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-white/40">Last updated {updated}</p>
        <p className="mt-6 text-[0.95rem] leading-relaxed text-white/70">{intro}</p>

        <div className="mt-8 space-y-6">
          {blocks.map((b, i) => (
            <div key={i}>
              {b.h && <h2 className="text-lg font-bold text-white">{b.h}</h2>}
              {b.p && <p className="mt-1.5 text-[0.92rem] leading-relaxed text-white/70">{b.p}</p>}
              {b.li && (
                <ul className="mt-2 space-y-1.5">
                  {b.li.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[0.92rem] leading-relaxed text-white/70">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-white/50">
          Questions? Email <a href="mailto:hello@stackwrk.com" className="text-lime hover:underline">hello@stackwrk.com</a>.
        </p>
      </div>
    </main>
  );
}
