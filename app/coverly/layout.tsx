"use client";

import { useEffect } from "react";

export default function CoverlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force light mode for Coverly
  useEffect(() => {
    const html = document.documentElement;
    const originalClasses = html.className;
    
    // Remove dark mode class
    html.classList.remove("dark");
    
    // Restore original classes when leaving Coverly
    return () => {
      // Re-apply the original classes
      html.className = originalClasses;
    };
  }, []);

  return <>{children}</>;
}
