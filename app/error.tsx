"use client";

import { useEffect } from "react";
import { GeistSans } from "geist/font/sans";
import StatusPage, { StatusButton, StatusLink } from "./_orbit/StatusPage";

export default function Error({
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
    <div className={GeistSans.variable}>
      <style>{"html,body{background:#ffffff}"}</style>
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
    </div>
  );
}
