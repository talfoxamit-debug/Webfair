"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";
import { capturePromo } from "@/lib/promo";
import { track } from "@/lib/track";

/**
 * Mounted once in the root layout: records first-touch attribution and any
 * referral promo code (?promo=FOX5) on load, and fires a calendly_click event
 * whenever a Calendly link is clicked anywhere on the site (the primary
 * booking CTA is otherwise an external link we cannot measure).
 */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
    capturePromo();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (a && a.href && a.href.includes("calendly.com")) track("calendly_click");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
