"use client";
import { PersonaProvider } from "../contexts/persona-context";
import { AuthProvider } from "./make-ebook/components/AuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PersonaProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PersonaProvider>
  );
}