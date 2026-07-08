"use client";

import { useEffect, useRef, useState } from "react";
import HeroVisual from "./HeroVisual";
import { hero } from "@/lib/content";

/**
 * Hero mascot. The fox is a transparent webp, so it's placed directly (no blend)
 * with a soft glow behind it, and served via a plain <img> with srcset — a
 * pre-optimized static asset (127 KB mobile / 333 KB desktop) straight from the
 * CDN with no image-optimizer round-trip, for a fast LCP. Falls back to the
 * abstract gradient visual if the asset is missing.
 */
export default function HeroMedia() {
  const src = hero.image;
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div className="relative z-10 mx-auto aspect-[4/5] w-full max-w-[300px] sm:max-w-sm lg:max-w-lg">
      {/* Soft electric glow behind the mascot */}
      <div className="pointer-events-none absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(162,28,224,0.38),rgba(46,107,255,0.1)_55%,transparent_72%)] blur-2xl" />

      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element -- static pre-optimized asset with srcset + onError fallback */
        <img
          ref={imgRef}
          src={src as string}
          srcSet="/fox-620.webp 620w, /fox.webp 1000w"
          sizes="(max-width: 640px) 300px, (max-width: 1024px) 384px, 512px"
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={() => setFailed(true)}
          className="relative h-full w-full animate-float select-none object-contain drop-shadow-[0_0_55px_rgba(162,28,224,0.45)]"
        />
      ) : (
        <HeroVisual className="relative h-full w-full drop-shadow-[0_0_60px_rgba(162,28,224,0.35)]" />
      )}
    </div>
  );
}
