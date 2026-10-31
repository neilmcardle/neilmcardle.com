"use client";

import { useEffect } from "react";
import Link from "next/link";
import Status from "./_signature/Status";
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
    <html lang="en">
      <body style={{ margin: 0, background: "#0d0d0c" }}>
        <Status
          code="Error"
          line="Something went wrong on this page."
          note="It’s not you. Try again, or head back to the homepage."
          actions={
            <>
              <button type="button" onClick={reset}>
                Try again
              </button>
              <Link href="/">Back to the homepage</Link>
            </>
          }
        />
      </body>
    </html>
  );
}
