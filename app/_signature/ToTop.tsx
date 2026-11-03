"use client";

export default function ToTop({ className }: { className?: string }) {
  return (
    <a
      href="#"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        const calm = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
        history.replaceState(null, "", window.location.pathname);
      }}
    >
      Back to top
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" />
      </svg>
    </a>
  );
}
