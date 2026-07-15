/**
 * A full-bleed luminous seam between major sections: a hairline gradient with
 * a soft glow bleeding across the boundary, so sections hand off to each other
 * instead of hard-cutting between near-identical dark blocks.
 */
export default function SectionSeam({ hue = "violet" }: { hue?: "violet" | "lime" | "magenta" }) {
  const line = {
    violet: "via-violet-400/45",
    lime: "via-lime/40",
    magenta: "via-flare-red/40",
  }[hue];
  const glow = {
    violet: "bg-violet-600/[0.13]",
    lime: "bg-lime/[0.07]",
    magenta: "bg-flare-red/[0.09]",
  }[hue];

  return (
    <div aria-hidden="true" className="pointer-events-none relative h-px w-full">
      <div className={`absolute left-1/2 top-0 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent ${line}`} />
      <div className={`absolute left-1/2 top-0 h-32 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${glow}`} />
    </div>
  );
}
