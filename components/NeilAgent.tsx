"use client";

// ElevenLabs ConvAI voice agent — floating "chat with Neil" button.
// Injects the embed script once per session and renders the custom
// element. Hidden on the standalone product surfaces (icon-animator,
// promptr, make-ebook, vector-paint) because they have their own
// focused UI. Also hidden entirely on product domains like
// makeebook.ink, which share this Vercel deployment but should not
// show the portfolio's voice agent.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const AGENT_ID = "agent_3801kmmjqtf7fr1ahe9meb2vc1eq";
const VOICE_ID = "Rni4NyZRvnv6RI6vRMqC";
const SCRIPT_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

// Routes where the voice agent should NOT appear. Matches either an
// exact pathname or any descendant (e.g. "/make-ebook" also blocks
// "/make-ebook/blog"). Standalone product surfaces and legal pages.
const HIDDEN_ROUTES = [
  "/make-ebook",
  "/start",
  "/icon-animator",
  "/promptr",
  "/vector-paint",
  "/touchtype",
  "/kids-academy",
  "/wepray",
  "/portfolio-unlock",
  "/cabin",
  "/privacy",
  "/terms",
];

// Hostnames where the agent should never appear, regardless of route.
// makeebook.ink shares this Vercel deployment with neilmcardle.com, so
// the root path on that domain would otherwise show the portfolio agent.
const HIDDEN_HOSTS = ["makeebook.ink", "www.makeebook.ink"];

export default function NeilAgent() {
  const pathname = usePathname();
  const [hostHidden, setHostHidden] = useState(false);

  useEffect(() => {
    setHostHidden(HIDDEN_HOSTS.includes(window.location.hostname));
  }, []);

  const shouldShow =
    !hostHidden &&
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
  return <elevenlabs-convai agent-id={AGENT_ID} override-voice-id={VOICE_ID} />;
}
