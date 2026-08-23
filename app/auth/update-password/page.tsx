"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle, KeyRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const PAGE =
  "min-h-screen bg-me-cream dark:bg-me-cream-dark flex items-center justify-center px-4";
const CARD =
  "w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#1e1e1e] shadow-sm p-8 sm:p-10";
const FIELD =
  "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-[#2f2f2f] bg-white dark:bg-[#262626] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-gray-900/15 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-[#555] transition-shadow disabled:opacity-50";
const CTA =
  "w-full py-3.5 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="text-gray-900 dark:text-white text-balance"
      style={{
        fontFamily: "var(--font-playfair)",
        fontWeight: 400,
        fontSize: "clamp(1.5rem, 1vw + 1.25rem, 1.875rem)",
        letterSpacing: "-0.03em",
        lineHeight: 1.15,
      }}
    >
      {children}
    </h1>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-3 text-gray-600 dark:text-[#a3a3a3] text-pretty"
      style={{
        fontFamily: "var(--font-playfair)",
        lineHeight: 1.55,
        fontStyle: "italic",
      }}
    >
      {children}
    </p>
  );
}

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkPasswordResetSession = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Authentication service unavailable");
        setCheckingSession(false);
        return;
      }

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setError("Invalid or expired reset link");
          setCheckingSession(false);
          return;
        }

        if (session?.user) {
          setIsValidSession(true);
        } else {
          setError("Invalid or expired reset link");
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setError("Unable to verify reset link");
      } finally {
        setCheckingSession(false);
      }
    };

    checkPasswordResetSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Authentication service unavailable");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/make-ebook");
        }, 2000);
      }
    } catch (err) {
      console.error("Password update error:", err);
      setError("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className={PAGE}>
        <div className={CARD}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-[#737373]" />
            <p className="text-13 text-gray-600 dark:text-[#a3a3a3]">
              Verifying reset link
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className={PAGE}>
        <div className={CARD}>
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 flex items-center justify-center mb-6">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <Title>Invalid reset link.</Title>
          <Sub>This password reset link is invalid or has expired.</Sub>
          <button
            type="button"
            onClick={() => router.push("/make-ebook/signin?mode=reset")}
            className={`${CTA} mt-8`}
          >
            Request a new link
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={PAGE}>
        <div className={CARD}>
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center mb-6">
            <CheckCircle className="w-6 h-6 text-green-700 dark:text-green-400" />
          </div>
          <Title>Password updated.</Title>
          <Sub>Taking you back to makeEbook.</Sub>
        </div>
      </div>
    );
  }

  return (
    <div className={PAGE}>
      <div className={CARD}>
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#262626] flex items-center justify-center mb-6">
          <KeyRound className="w-6 h-6 text-[#444] dark:text-[#a3a3a3]" />
        </div>
        <Title>Set a new password.</Title>
        <Sub>Choose something strong. You will not need to do this again.</Sub>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900 dark:text-red-200 text-pretty">
                  {error}
                </p>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              disabled={isLoading}
              className={FIELD}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-[#a3a3a3]">
              At least 6 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              disabled={isLoading}
              className={FIELD}
            />
          </div>

          <button type="submit" className={CTA} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
