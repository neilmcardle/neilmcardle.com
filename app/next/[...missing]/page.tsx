import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Page not found · Neil McArdle",
};

export default function Missing() {
  notFound();
}
