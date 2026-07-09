"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import { ArrowRight } from "./icons";
import { nav } from "@/lib/content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.07] bg-[#070312]/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="container-content flex h-[68px] items-center justify-between">
        <a href="#top" aria-label="Stackwrk home">
          <Logo />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-10 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-display text-sm uppercase tracking-wide text-white transition-colors hover:text-lime"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a href="#about" className="btn-primary !rounded-md !px-7 !py-3">
            Book a Free Site Audit
            <ArrowRight width={16} height={16} />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-all ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-white/[0.06] bg-ink/95 backdrop-blur-md transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="container-content flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium uppercase tracking-wide text-white/80 hover:bg-white/[0.05]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#about"
            onClick={() => setOpen(false)}
            className="btn-primary mt-2"
          >
            Book a Free Site Audit
            <ArrowRight width={16} height={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
