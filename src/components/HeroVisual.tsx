/**
 * Abstract hero visual, no mascot. A faceted gradient shard sitting inside a
 * soft warm→cool glow, echoing the Direction B illustration palette
 * (orange → red → purple → blue) without any literal imagery. Pure SVG/CSS,
 * so it costs no image payload and stays crisp at any size.
 */
export default function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      role="img"
      aria-label="Abstract gradient graphic"
      className={className}
    >
      <defs>
        <linearGradient id="hvGrad" x1="0.1" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#FF9A2E" />
          <stop offset="30%" stopColor="#FF3D5E" />
          <stop offset="62%" stopColor="#A21CE0" />
          <stop offset="100%" stopColor="#2E6BFF" />
        </linearGradient>
        <linearGradient id="hvGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E6BFF" />
          <stop offset="100%" stopColor="#A21CE0" />
        </linearGradient>
        <radialGradient id="hvHalo" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#A21CE0" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#5B21B6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0B0616" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hvStreak" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E6BFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#CBFF3C" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FF3D5E" stopOpacity="0" />
        </linearGradient>
        <filter id="hvBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>

      {/* Ambient halo */}
      <ellipse cx="300" cy="280" rx="270" ry="270" fill="url(#hvHalo)" />

      {/* Soft blurred gradient blob for the glow */}
      <path
        d="M300 90 C 430 120, 500 210, 480 330 C 465 440, 380 505, 270 495 C 160 485, 95 400, 110 285 C 122 185, 190 110, 300 90 Z"
        fill="url(#hvGrad)"
        opacity="0.5"
        filter="url(#hvBlur)"
      />

      {/* Faceted gradient shard: the crisp focal shape */}
      <g className="animate-float">
        <polygon points="300,120 430,210 400,360 250,430 150,300 200,180" fill="url(#hvGrad)" />
        {/* facet shading, low opacity so it reads as one object */}
        <polygon points="300,120 430,210 340,290" fill="#FFFFFF" opacity="0.14" />
        <polygon points="300,120 340,290 200,180" fill="#FFFFFF" opacity="0.08" />
        <polygon points="430,210 400,360 340,290" fill="#160726" opacity="0.30" />
        <polygon points="400,360 250,430 320,320" fill="#160726" opacity="0.24" />
        <polygon points="250,430 150,300 320,320" fill="#160726" opacity="0.12" />
        <polygon points="150,300 200,180 340,290" fill="#FFFFFF" opacity="0.05" />
        <g stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.2" fill="none">
          <path d="M300 120 L340 290 M430 210 L340 290 M400 360 L340 290 M250 430 L320 320 M150 300 L320 320 M200 180 L340 290 M320 320 L340 290" />
        </g>
      </g>

      {/* Energy streaks + accent sparks */}
      <g strokeWidth="2.5" strokeLinecap="round">
        <line x1="360" y1="380" x2="540" y2="450" stroke="url(#hvStreak)" className="animate-pulse-glow" />
        <line x1="260" y1="420" x2="120" y2="480" stroke="url(#hvStreak)" className="animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <line x1="420" y1="250" x2="530" y2="230" stroke="url(#hvStreak)" className="animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </g>
      <g fill="#CBFF3C">
        <circle cx="525" cy="240" r="3.5" className="animate-pulse-glow" />
        <circle cx="120" cy="480" r="2.5" className="animate-pulse-glow" style={{ animationDelay: "0.8s" }} />
        <circle cx="540" cy="450" r="3" className="animate-pulse-glow" style={{ animationDelay: "1.6s" }} />
      </g>
    </svg>
  );
}
