"use client";

import { useEffect, useRef, useState } from "react";
import HeroVisual from "./HeroVisual";
import { hero } from "@/lib/content";

/**
 * Hero fox. Two variants:
 *  - "bleed"  (desktop): fills its absolutely-positioned parent, head anchored
 *    upper-right facing the headline, edges feathered with a CSS mask so the
 *    artwork melts into the dark hero instead of showing a hard image edge.
 *  - "panel"  (mobile): the contained block with glow + abstract-visual
 *    fallback, stacked in the normal flow.
 *
 * Served as pre-optimized static webp via srcset (127 KB / 333 KB): no
 * image-optimizer round-trip, eager + high priority for LCP.
 */
export default function HeroMedia({ variant = "panel" }: { variant?: "panel" | "bleed" }) {
  const src = hero.image;
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  if (variant === "bleed") {
    if (!showImage) return null; // desktop bleed simply hides on failure
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- static pre-optimized asset */
      <img
        ref={imgRef}
        src={src as string}
        srcSet="/fox-620.webp 620w, /fox.webp 1000w"
        sizes="(max-width: 1024px) 0px, 46vw"
        alt=""
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onError={() => setFailed(true)}
        style={{
          // Feather aggressively on every side so the artwork dissolves into the
          // hero instead of reading as a rectangular sticker: a soft radial around
          // the fox head, intersected with left + bottom edge fades.
          maskImage:
            "radial-gradient(ellipse 98% 106% at 68% 34%, #000 28%, transparent 74%), linear-gradient(to left, #000 52%, transparent 97%), linear-gradient(to bottom, #000 58%, transparent 99%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 98% 106% at 68% 34%, #000 28%, transparent 74%), linear-gradient(to left, #000 52%, transparent 97%), linear-gradient(to bottom, #000 58%, transparent 99%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
        className="h-full w-full animate-float-slow select-none object-contain object-right-top"
      />
    );
  }

  return (
    <div className="relative z-10 mx-auto aspect-[4/5] w-full max-w-[300px] sm:max-w-sm">
      <div className="pointer-events-none absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(162,28,224,0.38),rgba(46,107,255,0.1)_55%,transparent_72%)] blur-2xl" />
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element -- static pre-optimized asset with srcset + onError fallback */
        <img
          ref={imgRef}
          src={src as string}
          srcSet="/fox-620.webp 620w, /fox.webp 1000w"
          sizes="(max-width: 640px) 300px, 384px"
          alt=""
          // This "panel" variant is hidden on desktop (where the "bleed" variant
          // is the LCP). Lazy so desktop does not redundantly download it; on
          // mobile it is in-viewport and still loads promptly.
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="relative h-full w-full animate-float select-none object-contain drop-shadow-[0_0_55px_rgba(162,28,224,0.45)]"
        />
      ) : (
        <HeroVisual className="relative h-full w-full drop-shadow-[0_0_60px_rgba(162,28,224,0.35)]" />
      )}
    </div>
  );
}
