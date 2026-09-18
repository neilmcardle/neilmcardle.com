"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Loader2,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  AuthCard,
  BrandPage,
  RainStage,
} from "../components/marketing/brand/BrandPage";
import brand from "../components/marketing/brand/brand.module.css";
import ui from "../components/marketing/brand/page.module.css";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <BrandPage>
      <RainStage>
        <AuthCard>{children}</AuthCard>
      </RainStage>
    </BrandPage>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawMode = searchParams.get("mode") ?? "signup";
  const initialMode =
    rawMode === "signin" || rawMode === "signup" || rawMode === "reset"
      ? (rawMode as "signin" | "signup" | "reset")
      : "signup";

  const [mode, setMode] = useState<"signin" | "signup" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);
  const { signIn, signUp, resetPassword, authError, clearError } = useAuth();

  useEffect(() => {
    if (rawMode === "signin" || rawMode === "signup" || rawMode === "reset") {
      setMode(rawMode);
      clearError();
      setShowVerificationMessage(false);
      setShowResetMessage(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMode]);

  const handleModeSwitch = (newMode: "signin" | "signup" | "reset") => {
    setMode(newMode);
    clearError();
    setShowVerificationMessage(false);
    setShowResetMessage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "reset") {
      if (!email.trim()) return;
    } else {
      if (!email.trim() || !password.trim()) return;
    }
    setIsLoading(true);
    clearError();
    try {
      if (mode === "signup") {
        const { error, needsVerification, userExists } = await signUp(
          email.trim(),
          password,
        );
        if (userExists) {
          setMode("signin");
        } else if (!error) {
          if (needsVerification) {
            setShowVerificationMessage(true);
          } else {
            router.push("/make-ebook");
          }
        }
      } else if (mode === "signin") {
        const { error } = await signIn(email.trim(), password);
        if (!error) router.push("/make-ebook");
      } else if (mode === "reset") {
        const { error, resetSent } = await resetPassword(email.trim());
        if (!error && resetSent) setShowResetMessage(true);
      }
    } catch (err) {
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerificationMessage || showResetMessage) {
    return (
      <PageShell>
        <div className={ui.center}>
          <div className={`${ui.badge} ${ui.badgeSuccess}`}>
            <Mail className="w-5 h-5" />
          </div>
          <h1 className={ui.title}>
            {showVerificationMessage ? "Check your email." : "Reset link sent."}
          </h1>
          <p className={ui.sub}>
            We&rsquo;ve sent{" "}
            {showVerificationMessage
              ? "a verification link"
              : "a password reset link"}{" "}
            to <strong>{email}</strong>.
          </p>
          <div className={`${ui.notice} ${ui.noticeSuccess}`}>
            <CheckCircle className="w-4 h-4" />
            <p className="m-0">
              {showVerificationMessage
                ? "Click the link in your email to finish setting up your account."
                : "Click the link in your email to reset your password. The link expires in one hour."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (showResetMessage) {
                setShowResetMessage(false);
                setMode("signin");
              } else {
                router.push("/make-ebook");
              }
            }}
            className={`${brand.cta} ${ui.submit} mt-7`}
          >
            {showResetMessage ? "Back to sign in" : "Continue"}
          </button>
        </div>
      </PageShell>
    );
  }

  const headline =
    mode === "signin"
      ? "Welcome back."
      : mode === "reset"
        ? "Reset your password."
        : "Start writing.";

  const sub =
    mode === "signin"
      ? "Pick up exactly where you left off."
      : mode === "reset"
        ? "Enter your email and we\u2019ll send a reset link."
        : "Free, in your browser. No credit card. No install.";

  const ctaLabel =
    mode === "signin"
      ? "Sign in"
      : mode === "reset"
        ? "Send reset link"
        : "Create account";

  return (
    <PageShell>
      <h1 className={ui.title}>{headline}</h1>
      <p className={ui.sub}>{sub}</p>

      <form onSubmit={handleSubmit} className={ui.form}>
        {authError && (
          <div className={`${ui.notice} ${ui.noticeError}`} role="alert">
            <AlertCircle className="w-4 h-4" />
            <p className="m-0">{authError}</p>
          </div>
        )}

        <div>
          <label htmlFor="signin-email" className={ui.label}>
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isLoading}
            className={ui.field}
          />
        </div>

        {mode !== "reset" && (
          <div>
            <div className={ui.labelRow}>
              <label htmlFor="signin-password" className={ui.label}>
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => handleModeSwitch("reset")}
                  disabled={isLoading}
                  className={ui.quietButton}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "signup" ? "Create a password" : "Enter your password"
              }
              required
              minLength={6}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              disabled={isLoading}
              className={ui.field}
            />
            {mode === "signup" && (
              <p className={ui.hint}>At least 6 characters.</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`${brand.cta} ${ui.submit}`}
        >
          {isLoading ? (
            <Loader2 className={`w-5 h-5 ${ui.spin}`} />
          ) : (
            <>
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className={ui.switch}>
          {mode === "reset"
            ? "Remember your password? "
            : mode === "signin"
              ? "Don't have an account? "
              : "Already have an account? "}
          <button
            type="button"
            onClick={() =>
              handleModeSwitch(mode === "signin" ? "signup" : "signin")
            }
            disabled={isLoading}
            className={ui.textButton}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </form>

      {mode === "signup" && (
        <p className={ui.legal}>
          By creating an account, you agree to our{" "}
          <a
            href="https://makeebook.ink/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="https://makeebook.ink/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          .
        </p>
      )}
    </PageShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--ink-deep)]" />}>
      <SignInContent />
    </Suspense>
  );
}
