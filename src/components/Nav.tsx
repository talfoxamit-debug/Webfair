"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { ArrowRight } from "./icons";
import { nav } from "@/lib/content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname() || "/";
  const onHome = pathname === "/";
  // Internal tools + standalone demo sites carry their own chrome — no marketing nav.
  const bare = /^\/(crm|prospects|quote|demos|mockup)(\/|$)/.test(pathname);
  // In-page anchors only resolve on the home page; from any other route send
  // them to the home page first (e.g. "#plans" → "/#plans").
  const to = (href: string) => (href.startsWith("#") && !onHome ? `/${href}` : href);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // Hide on scroll-down past the hero, reveal on scroll-up — keeps sections
      // cinematic instead of always under a fixed strip.
      if (y > 200 && y > lastY.current + 5) setHidden(true);
      else if (y < lastY.current - 5) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (bare) return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-300 ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#070312]/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="container-content flex h-14 items-center justify-between">
        <a href={onHome ? "#top" : "/"} aria-label="Stackwrk home" className="scale-90 origin-left">
          <Logo />
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={to(item.href)}
              className="text-[0.82rem] font-medium uppercase tracking-wide text-white/85 transition-colors hover:text-lime"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a href={to("#about")} className="btn-primary !rounded-md !px-5 !py-2.5 !text-[0.82rem]">
            Get a Free Mockup
            <ArrowRight width={15} height={15} />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
        >
          <span className="relative block h-4 w-5">
            <span className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-all ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-white/[0.06] bg-[#070312]/95 backdrop-blur-xl transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="container-content flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={to(item.href)}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium uppercase tracking-wide text-white/80 hover:bg-white/[0.05]"
            >
              {item.label}
            </a>
          ))}
          <a href={to("#about")} onClick={() => setOpen(false)} className="btn-primary mt-2">
            Get a Free Mockup
            <ArrowRight width={16} height={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
