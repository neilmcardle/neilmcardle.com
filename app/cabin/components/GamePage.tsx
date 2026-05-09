"use client";

import Link from "next/link";
import PhaserHost from "./PhaserHost";

export default function GamePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f8f7",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-inter)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          height: 48,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          background: "rgba(248,248,247,0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/"
            style={{
              color: "rgba(0,0,0,0.3)",
              display: "flex",
              transition: "color 0.15s",
            }}
            aria-label="Back to neilmcardle.com"
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.3)")}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <span style={{ color: "rgba(0,0,0,0.12)" }}>·</span>
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(0,0,0,0.7)",
              letterSpacing: "-0.01em",
            }}
          >
            Cabin
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(0,0,0,0.32)",
          }}
        >
          Phase 1 — placeholder map
        </span>
      </header>
      <main
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          minHeight: "calc(100vh - 48px)",
        }}
      >
        <PhaserHost />
      </main>
    </div>
  );
}
