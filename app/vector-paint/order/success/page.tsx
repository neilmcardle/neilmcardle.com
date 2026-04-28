import Link from "next/link"

export default function VectorPaintOrderSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f8f7",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 20,
          padding: 32,
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 22,
            fontWeight: 600,
            color: "rgba(0,0,0,0.85)",
            letterSpacing: "-0.01em",
            margin: 0,
            marginBottom: 12,
          }}
        >
          Thank you. Your print is on its way.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 14,
            color: "rgba(0,0,0,0.6)",
            lineHeight: 1.5,
            margin: 0,
            marginBottom: 24,
          }}
        >
          You will receive an email confirmation with tracking once it ships.
          Prints are typically produced within 2–3 working days.
        </p>
        {sessionId && (
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 11,
              color: "rgba(0,0,0,0.4)",
              margin: 0,
              marginBottom: 20,
            }}
          >
            Order reference: {sessionId}
          </p>
        )}
        <Link
          href="/vector-paint"
          style={{
            display: "inline-block",
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            fontWeight: 500,
            color: "#ffffff",
            background: "rgba(0,0,0,0.85)",
            padding: "10px 18px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Back to Vector Paint
        </Link>
      </div>
    </div>
  )
}
