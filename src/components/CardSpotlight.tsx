"use client";

import { useEffect, useRef } from "react";

/**
 * A cursor-following spotlight glow. Drop it as the first child of any
 * `relative overflow-hidden` container. It attaches pointer listeners to its
 * parent and moves a soft radial highlight under the cursor. Pure
 * transform/opacity + a CSS-variable-driven gradient, so it stays cheap and is
 * frozen by the global reduced-motion rule. Purely decorative (aria-hidden,
 * pointer-events-none), never blocks clicks or screen readers.
 */
export default function CardSpotlight({
  color = "rgba(203,255,60,0.12)",
  size = 260,
}: {
  color?: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
      style={{
        background: `radial-gradient(${size}px circle at var(--x, 50%) var(--y, 50%), ${color}, transparent 72%)`,
      }}
    />
  );
}
