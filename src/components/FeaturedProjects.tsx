import Reveal from "./Reveal";
import { ArrowRight, Check } from "./icons";
import { projects, type Project } from "@/lib/content";

function BrowserMock({ project }: { project: Project }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-white/10 bg-ink-800">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-ink-700/80 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="ml-2 h-3.5 flex-1 rounded bg-white/[0.06]" />
      </div>
      {/* "Screenshot" */}
      <div className={`relative aspect-[16/11] bg-gradient-to-br ${project.accent}`}>
        <div className="absolute inset-0 grid-backdrop opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(255,255,255,0.28),transparent_23%),linear-gradient(to_top,rgba(11,6,22,0.9),transparent_62%)]" />
        <div className="absolute left-4 top-4 flex gap-1.5">
          <span className="h-1.5 w-8 rounded-full bg-white/40" />
          <span className="h-1.5 w-5 rounded-full bg-white/20" />
        </div>
        <div className="absolute -bottom-8 right-4 h-32 w-20 rotate-6 rounded-[1.25rem] border border-white/30 bg-ink-800 shadow-2xl">
          <div className="mx-auto mt-2 h-1 w-7 rounded-full bg-white/25" />
          <div className={`mx-2 mt-3 h-16 rounded-lg bg-gradient-to-br ${project.accent}`} />
          <div className="mx-3 mt-3 space-y-1.5">
            <span className="block h-1.5 rounded bg-white/35" />
            <span className="block h-1.5 w-2/3 rounded bg-white/20" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-xl uppercase leading-tight text-white drop-shadow-lg sm:text-2xl">
            {project.tag}
          </p>
          <span className="mt-2 inline-block rounded bg-lime px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-ink">
            Live project
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  return (
    <section id="work" className="relative border-t border-white/[0.08] py-16 sm:py-24">
      <div className="container-content">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Featured case studies</p>
          <h2 className="mt-3 font-display text-4xl uppercase text-white sm:text-5xl">
              Real projects. Real impact.
            </h2>
          </div>
          <a
            href="#work"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-lime transition-colors hover:text-lime-400"
          >
            View all work
            <ArrowRight width={16} height={16} />
          </a>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal
              as="article"
              key={project.name}
              delay={i * 120}
              className="card group flex flex-col overflow-hidden p-5 transition-colors duration-300 hover:border-lime/55"
            >
              <BrowserMock project={project} />

              <h3 className="mt-6 flex items-center gap-2 font-display text-2xl uppercase text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-lime/40 text-lime">▱</span>
                {project.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{project.blurb}</p>

              <ul className="mt-5 space-y-2.5">
                {project.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                    <Check width={16} height={16} className="shrink-0 text-lime" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={project.href}
                className="mt-6 inline-flex items-center gap-2 border-t border-white/[0.08] pt-5 text-sm font-bold uppercase tracking-wide text-lime transition-transform group-hover:gap-3"
              >
                View live site
                <ArrowRight width={16} height={16} />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
