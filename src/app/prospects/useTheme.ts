"use client";

import { useEffect, useState } from "react";

export type Theme = "day" | "night";

/** CRM day/night theme, persisted per browser. Light ("day") is the default. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("day");

  useEffect(() => {
    const saved = localStorage.getItem("crm_theme");
    if (saved === "night" || saved === "day") setTheme(saved);
  }, []);

  // Toggle `dark` on the document root so every `dark:` utility (including the
  // page background) resolves: a same-element `.dark` can't match itself.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "night");
    return () => root.classList.remove("dark");
  }, [theme]);

  const toggle = () =>
    setTheme((t) => {
      const next: Theme = t === "day" ? "night" : "day";
      try { localStorage.setItem("crm_theme", next); } catch { /* ignore */ }
      return next;
    });

  return [theme, toggle];
}
