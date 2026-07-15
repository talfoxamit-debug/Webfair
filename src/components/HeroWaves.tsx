/**
 * Animated electric wave lines for the hero: magenta / purple / electric blue
 * energy flowing from the lower-right corner toward the center.
 *
 * Performance: pure SVG strokes, no filters. The "glow" is a wider low-opacity
 * stroke layered under a thin bright one. Motion is transform (drift) +
 * opacity (pulse) only, and the global prefers-reduced-motion rule freezes it.
 */
export default function HeroWaves() {
  const waves = [
    // [path, color, delay]
    ["M 1460 620 C 1150 590, 880 520, 620 430 S 260 330, 80 340", "#FF2D9B", "0s"],
    ["M 1460 560 C 1180 560, 930 500, 700 420 S 330 290, 150 280", "#A21CE0", "1.4s"],
    ["M 1460 680 C 1200 640, 960 560, 740 480 S 380 380, 200 400", "#2E6BFF", "2.8s"],
    ["M 1460 500 C 1220 520, 1020 470, 840 400 S 480 260, 320 230", "#FF5C3D", "4.2s"],
  ] as const;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] overflow-hidden will-change-transform"
      style={{ transform: "translate3d(calc(var(--mx, 0) * -6px), calc(var(--my, 0) * -4px), 0)" }}
    >
      <svg
        viewBox="0 0 1440 720"
        preserveAspectRatio="xMaxYMax slice"
        className="h-full w-full animate-drift"
      >
        <defs>
          {waves.map(([, color], i) => (
            <linearGradient key={i} id={`wave-${i}`} x1="1" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="55%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {waves.map(([d, , delay], i) => (
          <g key={i} className="animate-pulse-glow" style={{ animationDelay: delay }}>
            {/* Faint only: the waves should read as ambient energy, not hard
                lines that make the fox look pasted on top of the page. */}
            <path d={d} stroke={`url(#wave-${i})`} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.09" />
            <path d={d} stroke={`url(#wave-${i})`} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.28" />
          </g>
        ))}
        {/* sparks along the flow */}
        <g fill="#CBFF3C">
          <circle cx="640" cy="428" r="2" className="animate-pulse-glow" opacity="0.55" />
          <circle cx="905" cy="497" r="1.6" className="animate-pulse-glow" style={{ animationDelay: "1.8s" }} opacity="0.55" />
          <circle cx="1130" cy="575" r="2" className="animate-pulse-glow" style={{ animationDelay: "3.2s" }} opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}
