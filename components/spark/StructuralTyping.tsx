"use client";

import React, { useState } from "react";
import { WidgetShell } from "./WidgetShell";

interface Prop {
  name: string;
  type: string;
  required: boolean;
}

const REQUIRED: Prop[] = [
  { name: "id", type: "number", required: true },
  { name: "name", type: "string", required: true },
];

const OPTIONAL: Prop[] = [
  { name: "email", type: "string", required: false },
  { name: "isAdmin", type: "boolean", required: false },
];

const ALL = [...REQUIRED, ...OPTIONAL];

export function StructuralTyping() {
  const [present, setPresent] = useState<string[]>(["id", "name"]);
  const [renamed, setRenamed] = useState(false);

  const missing = REQUIRED.filter((p) => !present.includes(p.name));
  const extra = OPTIONAL.filter((p) => present.includes(p.name));
  const assignable = missing.length === 0;

  const toggle = (name: string) => {
    setPresent((current) =>
      current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name],
    );
  };

  const shapeName = renamed ? "Person" : "User";

  const objectLines = ALL.filter((p) => present.includes(p.name)).map(
    (p) =>
      `  ${p.name}: ${p.type === "number" ? "3" : p.type === "boolean" ? "false" : `"..."`},`,
  );

  const error = assignable
    ? null
    : `Property '${missing[0].name}' is missing in type '{ ${present.join(", ")} }' but required in type 'User'.`;

  return (
    <WidgetShell
      title="TypeScript checks the shape, not the name"
      status={assignable ? "assignable" : "type error"}
      onReset={
        present.length === 2 &&
        present.includes("id") &&
        present.includes("name") &&
        !renamed
          ? undefined
          : () => {
              setPresent(["id", "name"]);
              setRenamed(false);
            }
      }
      caption="Toggle properties on and off. The only thing that decides whether this compiles is whether the required properties are present."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <span className="spark-eyebrow mb-2 block text-[var(--spark-faint)]">
            The type it must satisfy
          </span>
          <pre className="spark-mono overflow-x-auto rounded-lg bg-[var(--spark-ink)] p-3.5 text-[12px] leading-[1.75] text-[var(--spark-on-dark)]">
            <code>
              {`type User = {\n`}
              {REQUIRED.map((p) => `  ${p.name}: ${p.type};\n`).join("")}
              {OPTIONAL.map((p) => `  ${p.name}?: ${p.type};\n`).join("")}
              {`};`}
            </code>
          </pre>

          <span className="spark-eyebrow mb-2 mt-4 block text-[var(--spark-faint)]">
            Properties on your object
          </span>
          <div className="flex flex-wrap gap-2">
            {ALL.map((p) => {
              const on = present.includes(p.name);
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => toggle(p.name)}
                  aria-pressed={on}
                  className="spark-mono min-h-[34px] rounded-full border px-3 text-[12px] transition-colors"
                  style={{
                    borderColor: on
                      ? "var(--spark-gold-deep)"
                      : "rgba(20,20,19,0.16)",
                    background: on ? "rgba(216,180,106,0.14)" : "transparent",
                    color: on ? "var(--spark-text)" : "var(--spark-faint)",
                  }}
                >
                  {p.name}
                  {p.required && (
                    <span
                      aria-label="required"
                      style={{ color: "var(--spark-gold-ink)" }}
                    >
                      *
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          <span className="spark-eyebrow mb-2 block text-[var(--spark-faint)]">
            Your object
          </span>
          <pre className="spark-mono overflow-x-auto rounded-lg bg-[var(--spark-ink)] p-3.5 text-[12px] leading-[1.75] text-[var(--spark-on-dark)]">
            <code>
              {`const ${renamed ? "person" : "user"}: User = {\n`}
              {objectLines.length > 0 ? objectLines.join("\n") + "\n" : ""}
              {`};`}
            </code>
          </pre>

          <div aria-live="polite" className="mt-3 min-h-[5.4em]">
            {assignable ? (
              <div className="rounded-lg bg-[var(--spark-gold)]/[0.12] px-3.5 py-3">
                <span className="spark-eyebrow block text-[var(--spark-gold-ink)]">
                  Compiles
                </span>
                <p className="mt-1 text-[12.5px] leading-[1.6] text-[#44423e]">
                  Both required properties are here, so the object satisfies{" "}
                  <code className="spark-inline-code">User</code>.
                  {extra.length > 0 &&
                    " The optional ones are allowed but never demanded."}
                </p>
              </div>
            ) : (
              <div
                className="rounded-lg px-3.5 py-3"
                style={{ background: "rgba(184,84,58,0.09)" }}
              >
                <span
                  className="spark-eyebrow block"
                  style={{ color: "#b8543a" }}
                >
                  Type error
                </span>
                <p className="spark-mono mt-1 text-[11.5px] leading-[1.6] text-[#44423e]">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-black/[0.07] pt-4">
        <button
          type="button"
          onClick={() => setRenamed((r) => !r)}
          aria-pressed={renamed}
          className="min-h-[38px] rounded-full border px-4 text-[12.5px] font-semibold transition-colors"
          style={{
            borderColor: renamed
              ? "var(--spark-gold-deep)"
              : "rgba(20,20,19,0.16)",
            background: renamed ? "rgba(216,180,106,0.14)" : "transparent",
            color: "var(--spark-text)",
          }}
        >
          {renamed ? "Rename it back to user" : "Rename the variable to person"}
        </button>
        <p className="mt-2.5 text-[12.5px] leading-[1.65] text-[var(--spark-muted)]">
          {renamed
            ? `Nothing changed. The variable is called person now and it still satisfies User, because TypeScript never looked at the name. This is structural typing: if the shape fits, it fits.`
            : `Try it. A language with nominal typing would care what the thing is called. TypeScript does not.`}
        </p>
      </div>
    </WidgetShell>
  );
}
