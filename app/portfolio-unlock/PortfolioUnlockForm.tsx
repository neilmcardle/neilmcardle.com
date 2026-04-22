"use client";

import React, { useState } from "react";

export default function PortfolioUnlockForm() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio-unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/portfolio";
        return;
      }
      setError("That password isn't right. Double-check what you were sent.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <label htmlFor="pw" className="block text-sm font-medium text-gray-700 mb-2">
        Password
      </label>
      <input
        id="pw"
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400 transition-colors"
        placeholder="Enter access password"
      />
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={!password.trim() || submitting}
        className="mt-6 w-full py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Unlocking…" : "Unlock portfolio"}
      </button>
    </form>
  );
}
