import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES } from "@/lib/fence-guides";
import { DEFAULT_CONFIG } from "@/lib/fence-config";

const NAVY = "#0C2333";
const GREEN = "#18894C";

export const metadata: Metadata = {
  title: "Fence Guides & Resources | Apex Fence Co.",
  description:
    "Straight answers on fence cost, materials and permits in South Florida, from the pros at Apex Fence Co.",
  robots: { index: false, follow: false },
};

export default function GuidesIndex() {
  const c = DEFAULT_CONFIG;
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0C2333]">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/demos/apex-fence" className="text-sm font-bold" style={{ color: GREEN }}>← {c.business}</Link>
          <Link href="/demos/apex-fence#quote" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: GREEN }}>Free Quote</Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Resources</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>
          Fence guides for South-Florida homeowners
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          The questions we get asked most, answered straight, so you can plan your project with confidence.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/demos/apex-fence/guides/${g.slug}`}
              className="group flex flex-col rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <span className="inline-flex w-fit rounded-full bg-[#EAF6EF] px-3 py-1 text-xs font-bold" style={{ color: GREEN }}>{g.tag}</span>
              <h2 className="mt-3 text-lg font-bold leading-snug" style={{ color: NAVY }}>{g.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{g.excerpt}</p>
              <span className="mt-4 text-sm font-bold" style={{ color: GREEN }}>Read the guide →</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
