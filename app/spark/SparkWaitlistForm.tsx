"use client";

import Link from "next/link";
import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function SparkWaitlistForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/spark/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website,
          source: "neilmcardle.com/spark",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-[14px] leading-[1.6] text-[var(--spark-on-dark-muted)]">
        Done. I&apos;ll write when it&apos;s finished. In the meantime,{" "}
        <Link
          href="/spark/lessons/m0-make-a-real-file-yours"
          className="spark-link text-white underline underline-offset-2 hover:no-underline"
        >
          start with module 1
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 max-w-md">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          disabled={status === "submitting"}
          className="flex-1 rounded-lg border border-white/[0.14] bg-white/[0.04] px-4 py-3 text-[14px] text-white transition-colors placeholder:text-[var(--spark-on-dark-dim)] focus:border-[var(--spark-gold)] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="spark-eyebrow whitespace-nowrap rounded-lg border border-white/[0.14] bg-white/[0.04] px-5 py-3.5 text-white transition-colors hover:border-white/30 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Sending..." : "Notify me"}
        </button>
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />
      {status === "error" && message && (
        <p className="text-[13px] text-[var(--spark-terracotta)]">{message}</p>
      )}
    </form>
  );
}
