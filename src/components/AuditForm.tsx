"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "./icons";
import { finalCta } from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";

export default function AuditForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      if (res.status === 503) {
        // Not configured yet — still give the user a path forward.
        setErrorMsg(
          "The form isn’t live just yet. Please email hello@stackwrk.com and I’ll get right back to you.",
        );
      } else if (json.message) {
        setErrorMsg(json.message);
      } else {
        setErrorMsg("Something went wrong. Please try again or email hello@stackwrk.com.");
      }
      setStatus("error");
    } catch {
      setErrorMsg("Network error. Please try again or email hello@stackwrk.com.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-lime/30 bg-lime/[0.06] px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-ink">
          <Check width={26} height={26} />
        </span>
        <h4 className="mt-4 font-display text-xl uppercase text-white">Request received</h4>
        <p className="mt-2 max-w-xs text-sm text-white/60">
          Thanks, I’ll review your site and reply within one business day.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-white/10 bg-ink-800/70 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-lime/60 focus:ring-2 focus:ring-lime/20";

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      {/* Honeypot — visually hidden, ignored by humans, catches bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input name="name" type="text" required placeholder="Your name" className={field} />
        </label>
        <label className="block">
          <span className="sr-only">Email address</span>
          <input name="email" type="email" required placeholder="Email address" className={field} />
        </label>
      </div>

      <label className="block">
        <span className="sr-only">Your website (optional)</span>
        <input name="website" type="text" placeholder="Your website (optional)" className={field} />
      </label>

      <label className="block">
        <span className="sr-only">What can I help with?</span>
        <textarea
          name="message"
          rows={3}
          placeholder="What can I help with? (optional)"
          className={`${field} resize-none`}
        />
      </label>

      {status === "error" && (
        <p className="text-sm text-fuchsia-300" role="alert">
          {errorMsg}
        </p>
      )}

      <button type="submit" disabled={status === "submitting"} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
        {status === "submitting" ? "Sending…" : finalCta.formCta}
        {status !== "submitting" && <ArrowRight width={18} height={18} />}
      </button>

      <p className="text-center text-xs text-white/35">
        No spam. Your details are only used to prepare your audit.
      </p>
    </form>
  );
}
