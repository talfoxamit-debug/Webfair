"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A trailing lime glow ring that springs after the cursor and swells over
 * interactive elements. Additive — the native cursor stays for usability.
 * Fine-pointer only, frozen for reduced-motion, all transforms via rAF lerp.
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    setOn(true);
    const ring = ringRef.current;
    if (!ring) return;

    let mx = -100, my = -100, rx = -100, ry = -100;
    let scale = 1, tScale = 1, show = 0, tShow = 0;
    let raf = 0;

    const loop = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      scale += (tScale - scale) * 0.2;
      show += (tShow - show) * 0.2;
      ring.style.transform = `translate3d(${(rx - 16).toFixed(2)}px, ${(ry - 16).toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      ring.style.opacity = show.toFixed(3);
      const settled =
        Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1 &&
        Math.abs(tScale - scale) < 0.005 && Math.abs(tShow - show) < 0.005;
      raf = settled ? 0 : requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY; tShow = 1;
      const el = e.target as Element | null;
      tScale = el?.closest?.("a,button,input,textarea,select,label,[role=slider],[data-cursor]") ? 1.9 : 1;
      kick();
    };
    const onLeave = () => { tShow = 0; kick(); };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!on) return null;
  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] h-8 w-8 rounded-full border border-lime/70 opacity-0 shadow-[0_0_20px_-2px_rgba(203,255,60,0.55)] will-change-transform"
    />
  );
}
