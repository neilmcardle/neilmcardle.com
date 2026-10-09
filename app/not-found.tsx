import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import StatusPage, { StatusLink } from "./_orbit/StatusPage";

export const metadata: Metadata = {
  title: "Page not found · Neil McArdle",
};

export default function NotFound() {
  return (
    <div className={GeistSans.variable}>
      <style>{"html,body{background:#ffffff}"}</style>
      <StatusPage
        line="Not all those who wander are lost."
        note="J.R.R. Tolkien · 404, page not found"
        actions={
          <>
            <StatusLink href="/">Back to the homepage</StatusLink>
            <StatusLink href="/?work=all">View all work</StatusLink>
          </>
        }
      />
    </div>
  );
}
