'use client';

import React, { useEffect, useState } from 'react';

// Returns true on macOS. Defaults to true during SSR and first paint so the
// Mac shortcut renders without a flash for the majority of makeEbook
// visitors, then swaps to Ctrl on non-Mac once the client mounts.
export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
    const platform = uaData?.platform || navigator.platform || '';
    const ua = navigator.userAgent || '';
    setIsMac(/mac/i.test(platform) || /mac/i.test(ua));
  }, []);
  return isMac;
}

// Inline "⌘K" on Mac, "Ctrl+K" elsewhere. Inherits its container's styling.
export function ModKey({ keyName }: { keyName: string }) {
  const isMac = useIsMac();
  return <>{isMac ? `⌘${keyName}` : `Ctrl+${keyName}`}</>;
}
