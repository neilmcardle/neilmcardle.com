import React from "react";
import { AuthProvider } from "../../components/AuthProvider";

export default function MakeEbookLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}