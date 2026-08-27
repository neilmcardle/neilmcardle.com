"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const AGENT_ID = "agent_3801kmmjqtf7fr1ahe9meb2vc1eq";
const SCRIPT_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

const AGENT_ENABLED = false;

const HIDDEN_ROUTES = [
  "/make-ebook",
  "/start",
  "/icon-animator",
  "/promptr",
  "/vector-paint",
  "/touchtype",
  "/kids-academy",
  "/spark",
  "/wepray",
  "/portfolio-unlock",
  "/cabin",
  "/privacy",
  "/terms",
  "/doodlewire",
  "/paintings",
  "/tessera",
  "/design",
];

const HIDDEN_HOSTS = ["makeebook.ink", "www.makeebook.ink"];

export default function NeilAgent() {
  const pathname = usePathname();

  const agentHidden = !AGENT_ENABLED;
  const [hostHidden, setHostHidden] = useState(false);

  useEffect(() => {
    setHostHidden(HIDDEN_HOSTS.includes(window.location.hostname));
  }, []);

  const shouldShow =
    !agentHidden &&
    !hostHidden &&
    !!pathname &&
    !HIDDEN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

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
