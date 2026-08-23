"use client";

import { useState } from "react";

type State = "idle" | "sending" | "sent" | "error";

export function CoverlySignup() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/coverly/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website,
          source: "neilmcardle.com/coverly",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setError("Network error");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-2xl border bg-card p-5 text-sm shadow-sm">
        <p className="font-medium">You&apos;re on the list</p>
        <p className="mt-1 text-muted-foreground">
          An invite is coming to{" "}
          <strong className="text-foreground">{email}</strong> as soon as early
          access opens.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full rounded-full border bg-card px-5 py-3 text-sm outline-none focus:border-foreground/40"
        />
        <button
          disabled={state === "sending"}
          className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "sending" ? "Sending…" : "Continue"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>

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
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Coverly is free. Sign up with an email and you&apos;ll get an invite
        when early access opens.
      </p>
    </div>
  );
}
