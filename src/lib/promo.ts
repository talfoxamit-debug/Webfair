/**
 * Referral / promo code capture. A partner site (e.g. fortlauderdaledockrental.com)
 * links here with ?promo=FOX5, and that visitor should get an extra discount on
 * top of the standard new-build rate, and their lead should carry the referral
 * source into the CRM.
 *
 * This module only captures and displays the code. It never computes a real
 * price: every agreement is priced by Tal in the CRM (AgreementGen), and every
 * Stripe charge is the exact amount he set there. That is deliberate: the
 * checkout API already trusts whatever amount it's given (there is no
 * server-side quote recomputation for ANY discount today), so auto-applying a
 * client-supplied discount straight to a real charge would let anyone forge
 * localStorage and pay less. Routing it through Tal's review instead keeps a
 * human validating every real transaction, which is the actual server-side
 * check here.
 */

export type PromoCode = {
  type: "referral";
  partner: string;
  extraPercent: number;
  stacksWithBaseDiscount: boolean;
  active: boolean;
};

export const PROMO_CODES: Record<string, PromoCode> = {
  FOX5: {
    type: "referral",
    partner: "FoxStays / fortlauderdaledockrental.com",
    extraPercent: 5,
    stacksWithBaseDiscount: true,
    active: true,
  },
};

const LS_KEY = "swrk_promo";
const COOKIE_KEY = "swrk_promo";
const TTL_DAYS = 45;

function setCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; samesite=lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

type StoredPromo = { code: string; savedAt: number };

/** Capture ?promo= or ?code= on any page load. First valid code wins and
 *  persists (does not get overwritten by a later, different/invalid param),
 *  so navigating around the site after landing doesn't lose it. */
export function capturePromo(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get("promo") || params.get("code") || "").trim().toUpperCase();
    if (raw && PROMO_CODES[raw]?.active) {
      const stored: StoredPromo = { code: raw, savedAt: Date.now() };
      const json = JSON.stringify(stored);
      localStorage.setItem(LS_KEY, json);
      setCookie(COOKIE_KEY, json, TTL_DAYS);
    }
  } catch { /* storage blocked: promo capture is best-effort */ }
}

/** Read the active promo code, if any (checks localStorage, falls back to the
 *  cookie, and expires after TTL_DAYS). Returns null if none, expired, or
 *  storage is unavailable. */
export function getPromo(): (PromoCode & { code: string }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY) || getCookie(COOKIE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredPromo;
    if (!stored?.code) return null;
    const ageDays = (Date.now() - stored.savedAt) / (1000 * 60 * 60 * 24);
    if (ageDays > TTL_DAYS) return null;
    const def = PROMO_CODES[stored.code];
    if (!def?.active) return null;
    return { ...def, code: stored.code };
  } catch {
    return null;
  }
}

/** Fields to spread into any lead-submission payload so the referral tags
 *  through to the CRM. Empty object when there's no active promo. */
export function getPromoForSubmit(): { promo_code?: string; promo_extra_pct?: number } {
  const p = getPromo();
  return p ? { promo_code: p.code, promo_extra_pct: p.extraPercent } : {};
}
