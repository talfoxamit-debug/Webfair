"use client";

import { useEffect, useRef, useState } from "react";
import HeroVisual from "./HeroVisual";

/**
 * Renders the hero mascot image when `src` is set AND loads successfully.
 * If no src is given, or the file is missing / fails to load, it falls back to
 * the abstract gradient visual — so an asset that isn't uploaded yet can never
 * leave a broken image or empty space.
 *
 * Robustness note: a 404 on the <img> can fire *before* React hydrates and
 * attaches onError (SSR race). The mount effect below catches that case by
 * inspecting `complete`/`naturalWidth`, so the fallback triggers either way.
 *
 * The mascot is above the fold, so it loads eagerly at high priority for LCP.
 */
export default function HeroMedia({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    // If the image already finished loading (pre-hydration) and has no
    // intrinsic size, it errored before onError was attached.
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div className="relative z-10 mx-auto aspect-[1.12/1] w-full max-w-3xl">
      {/* Electric glow behind the mascot */}
      <div className="pointer-events-none absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(162,28,224,0.42),rgba(46,107,255,0.12)_55%,transparent_72%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-2 right-0 h-48 w-[88%] -skew-x-12 bg-[linear-gradient(115deg,transparent,rgba(162,28,224,0.18),rgba(46,107,255,0.55),rgba(203,255,60,0.35),transparent)] blur-md" />

      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element -- mascot asset with onError fallback */
        <img
          ref={imgRef}
          src={src as string}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={() => setFailed(true)}
          className="relative h-full w-full animate-float select-none object-contain object-right drop-shadow-[0_0_70px_rgba(162,28,224,0.5)]"
        />
      ) : (
        <HeroVisual className="relative h-full w-full drop-shadow-[0_0_60px_rgba(162,28,224,0.35)]" />
      )}
    </div>
  );
}
