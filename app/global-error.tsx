"use client";

import { useEffect } from "react";
import { GeistSans } from "geist/font/sans";
import StatusPage, { StatusButton, StatusLink } from "./_orbit/StatusPage";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={GeistSans.variable}>
      <body style={{ margin: 0, background: "#ffffff" }}>
        <StatusPage
          line="Something went wrong on this page."
          note="It’s not you. Try again, or head back to the homepage."
          actions={
            <>
              <StatusButton onClick={reset}>Try again</StatusButton>
              <StatusLink href="/">Back to the homepage</StatusLink>
            </>
          }
        />
      </body>
    </html>
  );
}
