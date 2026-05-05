"use client";

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
        body: JSON.stringify({ email, website, source: "neilmcardle.com/spark" }),
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
      <p
        className="text-white/70"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "0.875rem",
          lineHeight: 1.6,
        }}
      >
        You&apos;re in. I&apos;ll write when the first modules are ready.
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
          className="flex-1 px-4 py-3 bg-transparent border-2 border-white/30 text-white placeholder-white/30 focus:border-white focus:outline-none transition-colors disabled:opacity-50"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.875rem",
          }}
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="px-5 py-3 border-2 border-white bg-white text-black hover:bg-transparent hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {status === "submitting" ? "Joining..." : "Join waitlist"}
        </button>
      </div>
      {/* Honeypot — hidden from users, bots fill it. */}
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
        <p
          className="text-red-400"
          style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
