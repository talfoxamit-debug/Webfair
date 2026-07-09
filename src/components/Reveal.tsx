"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades + lifts children into view when scrolled near the viewport.
 *
 * Robust by default: content renders fully visible for SSR, no-JS visitors,
 * crawlers, and reduced-motion users. The hidden→reveal animation only engages
 * on the client once we've confirmed motion is allowed, so a JS failure can
 * never leave a section blank.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [enabled, setEnabled] = useState(false); // animation engaged (client-only)
  const [played, setPlayed] = useState(false); // has entered view

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return; // stay visible

    setEnabled(true);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPlayed(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = enabled && !played;

  return (
    <Tag
      // @ts-expect-error — ref type varies by element tag, safe at runtime
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? "translate-y-8 scale-[0.985] opacity-0 blur-[3px]" : "translate-y-0 scale-100 opacity-100 blur-0"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
