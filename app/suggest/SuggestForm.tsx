"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./suggest.module.css";

const MAX = 500;

export default function SuggestForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState("");
  const done = useRef<HTMLParagraphElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state === "sent") done.current?.focus();
  }, [state]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as Record<string, string>;
    setError("");
    if ((data.request ?? "").trim().length < 8) {
      setInvalid("Say a little more about the change you’d like.");
      field.current?.focus();
      return;
    }
    setInvalid("");
    setState("sending");
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "");
      }
      setState("sent");
    } catch (err) {
      setState("idle");
      setError(
        (err instanceof Error && err.message) ||
          "That didn’t send. Try again later.",
      );
    }
  };

  if (state === "sent")
    return (
      <div className={styles.sentWrap}>
        <p ref={done} className={styles.sent} tabIndex={-1}>
          Thanks. If I build it, it&rsquo;ll appear below.
        </p>
        <button
          type="button"
          className={styles.again}
          onClick={() => {
            setText("");
            setState("idle");
          }}
        >
          Suggest something else
        </button>
      </div>
    );

  const remaining = MAX - text.length;

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.field}>
        <label htmlFor="sg-request">
          What should this site do differently?
        </label>
        <textarea
          ref={field}
          id="sg-request"
          name="request"
          rows={4}
          maxLength={MAX}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Make the work cards play their films on a phone"
          aria-invalid={invalid ? true : undefined}
          aria-describedby={`sg-count${invalid ? " sg-error" : ""}`}
        />
        <div className={styles.meta}>
          {invalid ? (
            <p id="sg-error" className={styles.fieldError}>
              {invalid}
            </p>
          ) : (
            <span />
          )}
          <span id="sg-count" className={styles.count} aria-live="polite">
            {remaining < 100 ? `${remaining} left` : ""}
          </span>
        </div>
      </div>
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="sg-website">Website</label>
        <input
          id="sg-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {error ? (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}
      <button
        className={styles.cta}
        type="submit"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Sending…" : "Send suggestion"}
      </button>
      <p className={styles.small}>
        Leave out names and contact details. If I build your suggestion, your
        words appear on this page.
      </p>
    </form>
  );
}
