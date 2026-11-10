"use client";

import { useState, useEffect, useReducer } from "react";
import { REDIRECT_MS, initialResetFlow, resetFlow } from "./reset-flow";
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
  const [flow, dispatch] = useReducer(resetFlow, initialResetFlow);
  const isLoading = flow.phase === "saving";
  const error = flow.phase === "ready" ? flow.error : null;
  const router = useRouter();

  useEffect(() => {
    if (flow.phase !== "done") return;
    const t = window.setTimeout(() => router.push("/make-ebook"), REDIRECT_MS);
    return () => window.clearTimeout(t);
  }, [flow.phase, router]);

  useEffect(() => {
    const checkPasswordResetSession = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        dispatch({
          type: "linkBad",
          reason: "Authentication service unavailable",
        });
        return;
      }

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          dispatch({
            type: "linkBad",
            reason: "Invalid or expired reset link",
          });
          return;
        }

        if (session?.user) {
          dispatch({ type: "linkOk" });
        } else {
          dispatch({
            type: "linkBad",
            reason: "Invalid or expired reset link",
          });
        }
      } catch (err) {
        console.error("Error checking session:", err);
        dispatch({ type: "linkBad", reason: "Unable to verify reset link" });
      }
    };

    checkPasswordResetSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (flow.phase !== "ready") return;

    if (!password.trim() || !confirmPassword.trim()) {
      dispatch({ type: "reject", error: "Please fill in all fields" });
      return;
    }

    if (password !== confirmPassword) {
      dispatch({ type: "reject", error: "Passwords do not match" });
      return;
    }

    if (password.length < 6) {
      dispatch({
        type: "reject",
        error: "Password must be at least 6 characters",
      });
      return;
    }

    dispatch({ type: "submit" });

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        dispatch({
          type: "failed",
          error: "Authentication service unavailable",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        dispatch({ type: "failed", error: error.message });
      } else {
        dispatch({ type: "saved" });
      }
    } catch (err) {
      console.error("Password update error:", err);
      dispatch({ type: "failed", error: "Failed to update password" });
    }
  };

  if (flow.phase === "checking") {
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

  if (flow.phase === "invalid") {
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

  if (flow.phase === "done") {
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
