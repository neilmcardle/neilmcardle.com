import Link from "next/link";
import VectorDrawingPad from "./components/vector-drawing-pad";
import FormatDropdown from "./components/format-dropdown";
import OrientationToggle from "./components/orientation-toggle";
import styles from "./vector-paint.module.css";

export default function VectorPaintPage() {
  return (
    <div className={styles.root}>
      <header
        style={{
          flex: "0 0 48px",
          height: 48,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          background: "rgba(248,248,247,0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/"
            aria-label="Back to neilmcardle.com"
            style={{
              color: "rgba(0,0,0,0.3)",
              display: "flex",
              transition: "color 0.15s",
            }}
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
            Vector Paint
          </span>
          <FormatDropdown />
          <OrientationToggle />
        </div>
      </header>
      <div className={styles.canvas}>
        <VectorDrawingPad />
      </div>
    </div>
  );
}
