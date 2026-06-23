'use client';

import React, { useEffect, useState } from 'react';

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

export function ModKey({ keyName }: { keyName: string }) {
  const isMac = useIsMac();
  return <>{isMac ? `⌘${keyName}` : `Ctrl+${keyName}`}</>;
}
