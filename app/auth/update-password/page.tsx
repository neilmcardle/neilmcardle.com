"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle, KeyRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  AuthCard,
  BrandPage,
  RainStage,
} from "@/app/make-ebook/components/marketing/brand/BrandPage";
import brand from "@/app/make-ebook/components/marketing/brand/brand.module.css";
import ui from "@/app/make-ebook/components/marketing/brand/page.module.css";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <BrandPage>
      <RainStage>
        <AuthCard>{children}</AuthCard>
      </RainStage>
    </BrandPage>
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
      <Shell>
        <div className={ui.center}>
          <div className={ui.badge}>
            <Loader2 className={`h-5 w-5 ${ui.spin}`} />
          </div>
          <p className={`${ui.sub} m-0`}>Verifying reset link</p>
        </div>
      </Shell>
    );
  }

  if (!isValidSession) {
    return (
      <Shell>
        <div className={`${ui.badge} ${ui.badgeError}`}>
          <AlertCircle className="w-5 h-5" />
        </div>
        <h1 className={ui.title}>Invalid reset link.</h1>
        <p className={ui.sub}>
          This password reset link is invalid or has expired.
        </p>
        <button
          type="button"
          onClick={() => router.push("/make-ebook/signin?mode=reset")}
          className={`${brand.cta} ${ui.submit} mt-8`}
        >
          Request a new link
        </button>
      </Shell>
    );
  }

  if (success) {
    return (
      <Shell>
        <div className={`${ui.badge} ${ui.badgeSuccess}`}>
          <CheckCircle className="w-5 h-5" />
        </div>
        <h1 className={ui.title}>Password updated.</h1>
        <p className={ui.sub}>Taking you back to makeebook.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className={ui.badge}>
        <KeyRound className="w-5 h-5" />
      </div>
      <h1 className={ui.title}>Set a new password.</h1>
      <p className={ui.sub}>
        Choose something strong. You will not need to do this again.
      </p>

      <form onSubmit={handleSubmit} className={ui.form}>
        {error && (
          <div className={`${ui.notice} ${ui.noticeError}`} role="alert">
            <AlertCircle className="w-4 h-4" />
            <p className="m-0">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="password" className={ui.label}>
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
            autoComplete="new-password"
            disabled={isLoading}
            className={ui.field}
          />
          <p className={ui.hint}>At least 6 characters.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className={ui.label}>
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
            autoComplete="new-password"
            disabled={isLoading}
            className={ui.field}
          />
        </div>

        <button
          type="submit"
          className={`${brand.cta} ${ui.submit}`}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className={`h-4 w-4 ${ui.spin}`} />}
          Update password
        </button>
      </form>
    </Shell>
  );
}
