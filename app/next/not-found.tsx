import type { Metadata } from "next";
import Link from "next/link";
import Status from "../_signature/Status";

export const metadata: Metadata = {
  title: "Page not found · Neil McArdle",
};

export default function NextNotFound() {
  return (
    <Status
      code="404"
      line="Not all those who wander are lost."
      note="J.R.R. Tolkien"
      actions={<Link href="/next">Back to the homepage</Link>}
    />
  );
}
