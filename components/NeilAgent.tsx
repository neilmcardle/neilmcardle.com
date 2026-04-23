"use client";

// ElevenLabs ConvAI voice agent — floating "chat with Neil" button.
// Injects the embed script once per session and renders the custom
// element. Hidden on the standalone product surfaces (icon-animator,
// promptr, make-ebook) because they have their own focused UI and
// don't need a voice agent floating over the workspace. Also hidden
// on the portfolio gate page.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const AGENT_ID = "agent_3801kmmjqtf7fr1ahe9meb2vc1eq";
const SCRIPT_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

// Routes where the voice agent should NOT appear. Matches either an
// exact pathname or any descendant (e.g. "/make-ebook" also blocks
// "/make-ebook/blog"). Standalone product surfaces and legal pages.
const HIDDEN_ROUTES = [
  "/make-ebook",
  "/icon-animator",
  "/promptr",
  "/portfolio-unlock",
  "/privacy",
  "/terms",
];

export default function NeilAgent() {
  const pathname = usePathname();
  const shouldShow =
    !!pathname &&
    !HIDDEN_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(`${r}/`),
    );

  useEffect(() => {
    if (!shouldShow) return;
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);
  }, [shouldShow]);

  if (!shouldShow) return null;

  // @ts-expect-error — custom element not in React's JSX types; runtime-only
  return <elevenlabs-convai agent-id={AGENT_ID} />;
}
