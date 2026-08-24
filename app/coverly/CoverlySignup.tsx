"use client";

import { useState } from "react";
import { getCoverlyBrowserClient } from "@/lib/coverly/supabase/client";

type State = "idle" | "sending" | "sent" | "error";

export function CoverlySignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError(null);
    try {
      const supabase = getCoverlyBrowserClient();
      if (!supabase) {
        setError("Configuration error");
        setState("error");
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/coverly/auth/callback`,
        },
      });
      if (signInError) {
        setError(signInError.message);
        setState("error");
      } else {
        setState("sent");
      }
    } catch (err) {
      setError("Network error");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-2xl border bg-card p-5 text-sm shadow-sm">
        <p className="font-medium">Check your inbox</p>
        <p className="mt-1 text-muted-foreground">
          A sign-in link is on its way to{" "}
          <strong className="text-foreground">{email}</strong>.
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

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Coverly is free. Enter your email and we&apos;ll send you a link to sign
        in — no password.
      </p>
    </div>
  );
}
