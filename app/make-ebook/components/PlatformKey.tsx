"use client";

import React from "react";
import { eventStore, useBrowserStore } from "@/lib/hooks/browserStore";

function detectMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData;
  const platform = uaData?.platform || navigator.platform || "";
  const ua = navigator.userAgent || "";
  return /mac/i.test(platform) || /mac/i.test(ua);
}

const macStore = eventStore({
  events: [],
  read: detectMac,
  server: false,
});

export function useIsMac(): boolean {
  return useBrowserStore(macStore);
}

export function ModKey({ keyName }: { keyName: string }) {
  const isMac = useIsMac();
  return <>{isMac ? `⌘${keyName}` : `Ctrl+${keyName}`}</>;
}
