import { describe, it, expect, beforeEach, vi } from "vitest";

// vitest's default environment is Node (no jsdom/happy-dom installed), so
// promo.ts's `typeof window === "undefined"` guards would short-circuit
// everything. Shim just the three browser APIs it actually touches
// (window.location.search, localStorage, document.cookie) so the real
// capture/read logic runs and is genuinely exercised, not skipped.
function setLocation(search: string) {
  (globalThis as unknown as { window: { location: { search: string } } }).window = {
    location: { search },
  };
}

function makeLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
}

function makeDocument() {
  let cookieStr = "";
  return {
    get cookie() {
      return cookieStr;
    },
    set cookie(v: string) {
      // Real document.cookie setters append/update one cookie at a time.
      const [pair] = v.split(";");
      const [name] = pair.split("=");
      const rest = cookieStr.split("; ").filter((c) => c && !c.startsWith(`${name}=`));
      cookieStr = [...rest, pair].join("; ");
    },
  };
}

beforeEach(() => {
  setLocation("");
  (globalThis as unknown as { localStorage: ReturnType<typeof makeLocalStorage> }).localStorage =
    makeLocalStorage();
  (globalThis as unknown as { document: ReturnType<typeof makeDocument> }).document =
    makeDocument();
  vi.resetModules();
});

describe("promo (FOX5 referral capture)", () => {
  it("captures a valid code from ?promo= case-insensitively and trimmed", async () => {
    const { capturePromo, getPromo } = await import("./promo");
    setLocation("?promo=%20fox5%20");
    capturePromo();
    expect(getPromo()?.code).toBe("FOX5");
    expect(getPromo()?.extraPercent).toBe(5);
  });

  it("also accepts the ?code= param name", async () => {
    const { capturePromo, getPromo } = await import("./promo");
    setLocation("?code=FOX5");
    capturePromo();
    expect(getPromo()?.code).toBe("FOX5");
  });

  it("ignores an unknown code and stores nothing", async () => {
    const { capturePromo, getPromo } = await import("./promo");
    setLocation("?promo=NOTREAL");
    capturePromo();
    expect(getPromo()).toBeNull();
  });

  it("getPromoForSubmit returns the code + extra percent for a valid stored code", async () => {
    const { capturePromo, getPromoForSubmit } = await import("./promo");
    setLocation("?promo=FOX5");
    capturePromo();
    expect(getPromoForSubmit()).toEqual({ promo_code: "FOX5", promo_extra_pct: 5 });
  });

  it("getPromoForSubmit returns nothing when no promo is stored", async () => {
    const { getPromoForSubmit } = await import("./promo");
    expect(getPromoForSubmit()).toEqual({});
  });

  it("persists across page loads (a later load with no param keeps the earlier code)", async () => {
    const { capturePromo, getPromo } = await import("./promo");
    setLocation("?promo=FOX5");
    capturePromo();
    setLocation(""); // simulate navigating to a page with no promo param
    capturePromo(); // must not clear the stored code
    expect(getPromo()?.code).toBe("FOX5");
  });

  it("expires after the TTL window", async () => {
    const { getPromo } = await import("./promo");
    const stale = JSON.stringify({ code: "FOX5", savedAt: Date.now() - 46 * 24 * 60 * 60 * 1000 });
    localStorage.setItem("swrk_promo", stale);
    expect(getPromo()).toBeNull();
  });

  it("falls back to the cookie when localStorage is empty", async () => {
    const { getPromo } = await import("./promo");
    document.cookie = `swrk_promo=${encodeURIComponent(
      JSON.stringify({ code: "FOX5", savedAt: Date.now() }),
    )}`;
    expect(getPromo()?.code).toBe("FOX5");
  });
});
