"use client";

import Script from "next/script";

// ElevenLabs Conversational AI agent ("Neil"). Renders the floating ConvAI
// widget so a visitor can talk to Neil and self-qualify before booking. The
// custom element is defined by the CDN script, so this must be a client
// component; the JSX intrinsic is declared below.
const AGENT_ID = "agent_3801kmmjqtf7fr1ahe9meb2vc1eq";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { "agent-id"?: string };
    }
  }
}

export function NeilVoiceAgent() {
  return (
    <>
      <elevenlabs-convai agent-id={AGENT_ID}></elevenlabs-convai>
      <Script
        src="https://elevenlabs.io/convai-widget/index.js"
        strategy="afterInteractive"
      />
    </>
  );
}
