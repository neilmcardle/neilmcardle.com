export default function PaintbrushHint() {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-20"
      style={{
        bottom: 112,
        fontFamily: "var(--font-inter)",
        fontSize: 12,
        fontWeight: 500,
        color: "rgba(0,0,0,0.4)",
        letterSpacing: "0.02em",
      }}
    >
      Click the brush to start painting
    </div>
  )
}
